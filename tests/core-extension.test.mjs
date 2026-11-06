import test from "node:test";
import assert from "node:assert/strict";
import {
  createPath, quadraticBezier, cubicBezier, SDF, Painter, createFrame, clearFrame,
  windField, attractionField, vortexField, turbulenceField, combineFields, scaleField,
  stepField, fieldTrajectory, Particles, P, hex,
} from "../src/core/index.js";
import { Particles as SimpleParticles } from "../src/core/particles.js";
import * as flowSeal from "../src/fx/arcane/flow-seal.js";

const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) <= epsilon, `${a} != ${b}`);

test("path progress measures distance, retaining corners, duplicate points and endpoint tangents", () => {
  const path = createPath([[0, 0], [0, 0], [3, 0], [3, 4]]);
  near(path.length, 7);
  assert.deepEqual(path.at(5), { x: 3, y: 2, tx: 0, ty: 1, nx: -1, ny: 0 });
  near(path.sample(-1).x, 0);
  near(path.sample(2).y, 4);
  near(path.at(0).tx, 1);
  near(path.at(7).ty, 1);
  const still = createPath([[2, 3], [2, 3]]);
  near(still.length, 0);
  near(still.at(100).x, 2);
  const loop = createPath([[0, 0], [4, 0], [4, 4]], { closed: true });
  assert.deepEqual(loop.sample(0), loop.sample(1));
  assert.deepEqual(loop.sample(-0.25), loop.sample(0.75));
});

test("Bezier endpoints and approximately constant travel on a nonuniform parameterization", () => {
  const curve = cubicBezier([0, 0], [0, 0], [0, 0], [100, 0]);
  const path = createPath(curve);
  for (let i = 0; i <= 10; i++) near(path.sample(i / 10).x, i * 10);
  const q = quadraticBezier([0, 0], [5, 10], [10, 0]);
  assert.deepEqual(q(0), [0, 0]);
  assert.deepEqual(q(0.5), [5, 5]);
  assert.deepEqual(q(1), [10, 0]);
  assert.throws(() => createPath([]));
  assert.throws(() => createPath([[NaN, 0]]));
  assert.throws(() => createPath(q, { samples: 0 }));
});

test("analytic SDFs compose shapes, borders and transforms with pixel distances", () => {
  const c = SDF.circle(0, 0, 5), b = SDF.box(0, 0, 4, 3);
  near(c(0, 0), -5); near(c(3, 4), 0); near(c(8, 0), 3);
  near(b(0, 0), -3); near(b(7, 7), 5);
  near(SDF.capsule(0, 0, 4, 0, 2)(2, 0), -2);
  near(SDF.capsule(0, 0, 0, 0, 2)(0, 3), 1);
  assert.ok(SDF.union(c, SDF.circle(8, 0, 2))(8, 0) < 0);
  assert.ok(SDF.intersect(c, b)(4.5, 0) > 0);
  assert.ok(SDF.subtract(c, SDF.circle(0, 0, 2))(0, 0) > 0);
  near(SDF.expand(c, 2)(7, 0), 0);
  near(SDF.expand(c, -2)(3, 0), 0);
  near(SDF.shell(c, 2)(5, 0), -1);
  near(SDF.translate(c, 10, 20)(10, 20), -5);
  near(SDF.rotate(b, Math.PI / 2)(0, 4), 0);
  near(SDF.scale(c, 2)(12, 0), 2);
});

test("mask distance transform agrees with a brute-force oracle, including solid and empty masks", () => {
  // Exercise non-square grids, isolated pixels, holes, and masks touching all four borders.
  for (const [w, h] of [[1, 1], [3, 7], [8, 4]]) for (const kind of [0, 1, 2, 3]) {
    const data = Uint8Array.from({ length: w * h }, (_, i) => kind === 0 ? 0 : kind === 1 ? 1
      : kind === 2 ? (i * 17 + 3) % 7 < 3 ? 1 : 0 : i % (w + 1) ? 1 : 0);
    const mask = { w, h, data }, field = SDF.fromMask(mask, 10, 20);
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      const occupied = x >= 0 && x < w && y >= 0 && y < h && !!data[y * w + x];
      let squared = Infinity;
      for (let yy = -1; yy <= h; yy++) for (let xx = -1; xx <= w; xx++) {
        const other = xx >= 0 && xx < w && yy >= 0 && yy < h && !!data[yy * w + xx];
        if (other !== occupied) squared = Math.min(squared, (x - xx) ** 2 + (y - yy) ** 2);
      }
      const expected = occupied ? 0.5 - Math.sqrt(squared) : Math.sqrt(squared) - 0.5;
      const actual = field(10 + x + 0.5, 20 + y + 0.5);
      if (expected === Infinity) assert.equal(actual, Infinity);
      else near(actual, expected, 1e-6);
    }
    assert.deepEqual(SDF.toMask(field, w, h, 10, 20).data, data);
    assert.ok(field(-100, -100) > 0);
  }
});

test("distance functions feed the Painter under placement/rotation and keep light separate", () => {
  const f = createFrame(24, 24), p = new Painter(f), color = hex("#abcdef");
  const shape = SDF.subtract(SDF.circle(0, 0, 4), SDF.circle(0, 0, 2));
  p.place(12, 12, true, Math.PI / 2);
  p.sdf(shape, [-5, -5, 5, 5], color);
  assert.equal(p.get(0, 0), 0);
  assert.equal(p.get(3, 0) >>> 0, color >>> 0);
  assert.equal(f.light.some((v) => v !== 0), false);
  p.light(3, 0, color);
  assert.equal(f.light.some((v) => v !== 0), true);
  clearFrame(f);
  const path = createPath([[0, 0], [6, 0], [6, 6]]);
  p.place(4, 4);
  p.strokePath(path, 2, color, 1, 0, 0.5);
  assert.equal(p.get(3, 0) >>> 0, color >>> 0);
  assert.equal(p.get(6, 4), 0);
  clearFrame(f);
  p.place(12, 12, true, Math.PI / 2);
  p.strokePath(path, (u) => 1 + 2 * u, color);
  assert.equal(p.get(6, 4) >>> 0, color >>> 0);
  assert.equal(f.light.some((v) => v !== 0), false);
});

test("a stroked path shades its cross-section once, without seams at internal round caps", () => {
  const a = createFrame(24, 20), b = createFrame(24, 20);
  const color = (u, v) => v > 0.55 ? hex("#441166") : hex("#ddbbee");
  new Painter(a).strokePath(createPath([[3, 10], [10, 10], [20, 10]]), 6, color);
  new Painter(b).beam(3, 10, 20, 10, 6, color);
  assert.deepEqual(a.color, b.color);
});

test("field directions, radius, composition and seeded time sampling", () => {
  const a = attractionField(0, 0, 10, 10), v = vortexField(0, 0, 10, 10);
  assert.deepEqual(a(5, 0), [-5, 0]);
  assert.deepEqual(a(10, 0), [0, 0]);
  assert.deepEqual(a(0, 0), [0, 0]);
  const [vx, vy] = v(5, 0);
  near(vx, 0); near(vy, 5);
  assert.deepEqual(attractionField(0, 0, -10)(5, 0), [10, -0]);
  assert.deepEqual(combineFields(a, windField(3, 4))(5, 0), [-2, 4]);
  assert.deepEqual(scaleField(a, 2)(5, 0), [-10, 0]);
  assert.deepEqual(scaleField(a, (x, y, t) => t)(5, 0, 0), [-0, 0]);
  assert.deepEqual(combineFields()(5, 0), [0, 0]);
  const turbulence = turbulenceField({ seed: 7 });
  const first = turbulence(12, 8, 0.7);
  turbulence(-13, 1, 99);
  assert.deepEqual(turbulence(12, 8, 0.7), first);
  assert.notDeepEqual(turbulenceField({ seed: 8 })(12, 8, 0.7), first);
});

test("baked trajectories preserve time, can be sought, and converge to an analytic motion", () => {
  const initial = { x: 1, y: 2, vx: 3, vy: -4 }, field = windField(10, 20);
  const curve = fieldTrajectory(initial, field, 1, { hz: 1000 });
  assert.deepEqual(curve(0), [1, 2]);
  const [x, y] = curve(1);
  near(x, 1 + 3 + 0.5 * 10, 0.006);
  near(y, 2 - 4 + 0.5 * 20, 0.011);
  const atHalf = curve(0.5);
  curve(0.9); curve(0.1);
  assert.deepEqual(curve(0.5), atHalf);
  assert.deepEqual(initial, { x: 1, y: 2, vx: 3, vy: -4 });
  const path = createPath(curve);
  near(path.sample(1).x, x);
  // Absolute field time is the step's start, independent of trajectory's age.
  const timed = fieldTrajectory({ x: 0, y: 0, vx: 0, vy: 0 }, (x, y, t) => [t, 0], 1, { hz: 1, startTime: 2 });
  assert.deepEqual(timed(1), [2, 0]);
  assert.throws(() => stepField({ ...initial }, field, -1));
  assert.throws(() => fieldTrajectory(initial, field, 0));
});

test("both existing particle APIs accept optional local acceleration and skip delayed particles", () => {
  const basic = new SimpleParticles({ field: windField(12, 0) });
  basic.add({ x: 0, y: 0, vx: 0, vy: 0, life: 1 });
  basic.update(0.1);
  near(basic.list[0].vx, 1.2); near(basic.list[0].x, 0.12);
  const ps = new Particles({ field: windField(12, 0) });
  ps.spawn(P.MOTE, 0, 0, 0, 0, 1);
  ps.spawn(P.MOTE, 0, 0, 0, 0, 1, hex("#ffffff"), 1, 0.5);
  ps.update(0.1);
  assert.ok(ps.list[0].vx > 0);
  assert.equal(ps.list[1].vx, 0);
  const original = new Particles();
  original.spawn(P.MOTE, 0, 0, 0, 0, 1);
  original.update(0.1);
  assert.equal(original.list[0].vx, 0);
});

test("the combined effect loops both buffers and is independent of seed/cache and seek order", () => {
  const frame = createFrame(...flowSeal.meta.size), p = new Painter(frame);
  const render = (t, seed) => {
    clearFrame(frame);
    p.reset().place(...flowSeal.meta.origin);
    const options = { ...flowSeal.meta.options, seed };
    flowSeal.drawBack(p, t, options);
    flowSeal.draw(p, t, options);
    return [frame.color.slice(), frame.light.slice()];
  };
  const start = render(0, 7), middle = render(1.37, 7);
  render(3.7, 2); render(0.2, 3);
  assert.deepEqual(render(1.37, 7), middle);
  assert.deepEqual(render(flowSeal.meta.duration, 7), start);
});
