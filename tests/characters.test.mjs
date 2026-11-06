import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { CHARACTERS, characterOf, posed, stockActor, createAct, createFrame, clearFrame, actBounds } from "../src/core/index.js";
import * as slash from "../src/fx/melee/sword-slash.js";
import * as electrified from "../src/fx/lightning/electrified.js";

const digest = (buf) => createHash("sha256").update(new Uint8Array(buf.buffer)).digest("hex");
const blank = (onBody) => ({ meta: { duration: 1, actor: 2, size: [96, 96], origin: [48, 80] },
  act: { onBody, poses: [[0, {}], [1, {}]] }, draw() {} });
const picture = (mod, character, options = {}, t = 0.37) => {
  const a = createAct(mod, { x: 100, y: 100, character, ...options }), f = createFrame(320, 180);
  for (let i = 0; i < Math.round(t * 120); i++) a.update(1 / 120);
  a.draw(f); return { a, f };
};

test("the legacy actor retains its original pixels and unknown characters safely fall back", () => {
  assert.equal(digest(stockActor(2).pixels), "5cbbffaf922f2230c889a355d7989955be66341f7317afb6a57440f03d668a40");
  assert.equal(characterOf("missing").id, "dummy");
  assert.deepEqual(posed({}, "missing"), posed({}));
});

test("each costume has a different silhouette, consistent rest mask and separate cached poses", () => {
  const silhouettes = new Set();
  for (const c of CHARACTERS.slice(1)) {
    const r = posed({}, c.id), actor = stockActor(2, c.id);
    silhouettes.add([...r.xs].map((x, i) => `${x}:${r.ys[i]}`).sort().join(","));
    assert.equal(actor.mask.data.reduce((a, b) => a + b, 0), r.n);
    for (let i = 0; i < r.n; i++) {
      const j = (r.ys[i] - actor.y) * actor.w + r.xs[i] - actor.x;
      assert.equal(actor.pixels[j], r.color[i], c.id);
      assert(r.src[i] >= 0 && r.src[i] < actor.w * actor.h, `${c.id}: rest cell must have a source`);
    }
    const q = { weapon: "sword", fx: 12, fy: -22, yaw: 1.5 };
    assert.notEqual(posed(q, c.id), posed(q));
    assert.equal(posed(q, c.id), posed(q, c.id));
    assert.equal(stockActor(1, c.id).k, 1);
  }
  assert.equal(silhouettes.size, CHARACTERS.length - 1);
});

test("an untouched body effect preserves costume colors and works mirrored", () => {
  for (const c of CHARACTERS) for (const flip of [false, true]) {
    const normal = picture(blank(false), c.id, { flip }).f;
    const carried = picture(blank(true), c.id, { flip }).f;
    assert.equal(digest(carried.color), digest(normal.color), c.id);
  }
});

test("body-bound electricity follows each costume deterministically through a moving pose", () => {
  for (const c of CHARACTERS) {
    const mod = { ...electrified, act: { ...electrified.act, onBody: true,
      poses: [[0, { fx: -8, fy: -31, turn: 1 }], [electrified.meta.duration, { fx: -8, fy: -31, turn: 1 }]] } };
    for (const flip of [false, true]) {
      const a = picture(mod, c.id, { flip }).f, b = picture(mod, c.id, { flip }).f;
      assert.equal(digest(a.color), digest(b.color), c.id);
      assert.equal(digest(a.light), digest(b.light), c.id);
      assert(a.color.some((v) => v));
    }
  }
});

test("changing costume preserves hit-stop, event times, completion and mirrored drawing", () => {
  const expected = [];
  for (const c of CHARACTERS) {
    const act = createAct(slash, { character: c.id }), f = createFrame(400, 240);
    const hits = []; act.onHit = (hit) => hits.push(hit.t);
    let steps = 0, frozen = 0;
    while (!act.done() && steps < 600) {
      act.update(1 / 60); if (act.frozen) frozen++;
      if (steps % 6 === 0) act.draw(clearFrame(f));
      steps++;
    }
    assert(act.done()); assert(hits.length > 0); assert(frozen > 0);
    const result = { hits, frozen, steps };
    if (c.id === "dummy") expected.push(result);
    else assert.deepEqual(result, expected[0]);
    const bounds = actBounds(slash, { character: c.id });
    const r = posed(slash.act.poses[0][1], c.id);
    assert(bounds.y0 <= r.y0 && bounds.x0 <= r.x0 && bounds.x1 > r.x1);
    const left = picture(blank(false), c.id, { flip: true }).f;
    const right = picture(blank(false), c.id).f;
    for (let y = 45; y < 99; y++) for (let x = 65; x < 135; x++)
      assert.equal(left.color[y * 320 + x], right.color[y * 320 + 199 - x], c.id);
  }
});
