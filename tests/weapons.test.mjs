import test from "node:test";
import assert from "node:assert/strict";
import { ARMORY, MELEE_WEAPONS, THROWN_WEAPONS, WEAPONS, CHARACTERS, skeleton, posed, createAct, createFrame, clearFrame, poseAt, actBounds, createFx, weaponOf } from "../src/core/index.js";
import { effects } from "../src/fx/index.js";

const addedMelee = MELEE_WEAPONS.filter((w) => ["staff", "lance", "holy-sword", "katana", "war-mace", "rapier"].includes(w.id));
const addedThrown = ["kunai", "powder-bomb", "boomerang", "talisman", "flying-sword", "binding-silk", "soul-bell", "pear-needles"];
const added = [...addedMelee, ...THROWN_WEAPONS];

test("equipment has distinct geometry, finite colors, a registered action and stable hand-local rendering", () => {
  const shapes = new Set();
  for (const weapon of ARMORY) {
    assert(effects[weapon.fx]?.act, weapon.id);
    const points = new Set(), T = (x, y, c) => {
      assert(Number.isFinite(x) && Number.isFinite(y) && Number.isInteger(c) && c !== 0, weapon.id);
      points.add(`${Math.round(x)},${Math.round(y)}`);
    };
    WEAPONS[weapon.id].draw(T, {});
    shapes.add([...points].sort().join(";"));
    const q = { weapon: weapon.id, fx: 8, fy: -25, sa: -0.4 };
    for (const c of CHARACTERS) {
      const r = posed(q, c.id);
      assert(r.color.every((v) => v !== 0)); assert(r.n > 100);
      assert.equal(posed(q, c.id), r);
    }
  }
  assert.equal(shapes.size, ARMORY.length);
});

test("two-handed equipment places the far hand on its actual second grip", () => {
  for (const id of ["staff", "lance", "holy-sword", "war-mace"]) {
    const angle = 0.1, q = { weapon: id, two: true, fx: 8, fy: -25, sa: angle };
    const { handN, handF } = skeleton(q).joints, grip = WEAPONS[id].two;
    assert(Math.hypot(handF[0] - handN[0] - Math.cos(angle) * grip,
      handF[1] - handN[1] - Math.sin(angle) * grip, handF[2] - handN[2]) < 1.2, id);
  }
});

test("each weapon family has a distinct choreography instead of reusing one pose track", () => {
  const signatures = new Set();
  for (const weapon of added) {
    const mod = effects[weapon.fx];
    const first = mod.act.poses.find(([t]) => t >= -0.12)?.[1] ?? mod.act.poses[0][1];
    const hit = mod.act.poses.find(([t]) => t >= mod.act.hits[0].t)?.[1] ?? mod.act.poses.at(-1)[1];
    signatures.add(JSON.stringify([weapon.id, first.x, first.fx, first.fy, first.bx, first.by, first.sa, first.crouch, hit.x, hit.fx, hit.fy, hit.bx, hit.by, hit.sa, hit.lean]));
  }
  assert.equal(signatures.size, added.length);
  const poses = Object.fromEntries(added.map((weapon) => [weapon.id, effects[weapon.fx].act.poses.map(([t, q]) => [t, q])]));
  assert(poses.kunai.length > 8);
  assert(poses.staff.some(([, q]) => (q.bx ?? 0) < -8));
  assert(poses.lance.some(([, q]) => (q.lean ?? 0) >= 6 && (q.ffx ?? 0) >= 14));
  assert(poses["holy-sword"].some(([, q]) => (q.fy ?? 0) <= -37));
  assert(poses.katana.some(([, q]) => (q.sa ?? 0) < -2.5));
  assert(poses["war-mace"].some(([, q]) => (q.crouch ?? 0) >= 8));
  assert(poses.rapier.some(([, q]) => (q.lean ?? 0) >= 7 && (q.fx ?? 0) >= 20));
});

test("the first contact meets the held weapon tip and all hit heights track their poses", () => {
  for (const weapon of addedMelee) {
    const mod = effects[weapon.fx];
    for (const [i, hit] of mod.act.hits.entries()) {
      const q = poseAt(mod.act.poses, hit.t), hand = skeleton(q).joints.handN;
      const x = hand[0] + (q.x ?? 0) + Math.cos(q.sa) * weapon.tip;
      const y = hand[1] + (q.y ?? 0) + Math.sin(q.sa) * weapon.tip;
      if (!i) assert(Math.abs(x - mod.act.target.x) <= 0.5, weapon.id);
      assert(Math.abs(y - hit.y) < 0.01, weapon.id);
    }
  }
});

test("new attacks finish empty in both buffers, preserve hit events and fit every costume's action bounds", () => {
  for (const weapon of added) {
    const mod = effects[weapon.fx], f = createFrame(400, 260);
    const fx = createFx(mod, { x: 100, y: 180 }); fx.update(mod.meta.duration); fx.draw(f);
    assert(!f.color.some((c) => c) && !f.light.some((c) => c), weapon.id);
    for (const c of CHARACTERS) {
      const a = createAct(mod, { character: c.id, x: 100, y: 180 }), hits = [];
      assert(Number.isInteger(a.targets[0].x), "target raster positions must land on whole pixels");
      a.onHit = (h) => hits.push(h.t);
      let n = 0;
      while (!a.done() && n++ < 360) { a.update(1 / 60); if (n % 8 === 0) a.draw(clearFrame(f)); }
      assert(a.done()); assert.deepEqual(hits, mod.act.hits.map((h) => h.t));
      const b = actBounds(mod, { character: c.id });
      for (const [, q] of mod.act.poses) {
        const r = posed(q, c.id), x = Math.round(q.x ?? 0), y = Math.round(q.y ?? 0);
        assert(r.x0 + x >= b.x0 && r.x1 + x < b.x1 && r.y0 + y >= b.y0 && r.y1 + y < b.y1, `${weapon.id}/${c.id}`);
      }
    }
  }
});

test("the armory keeps thrown weapons out of the melee group", () => {
  assert.equal(ARMORY.length, MELEE_WEAPONS.length + THROWN_WEAPONS.length);
  assert(!MELEE_WEAPONS.some((w) => w.id === "kunai"));
  assert.deepEqual(THROWN_WEAPONS.map((w) => w.id), addedThrown);
  for (const id of addedThrown) assert.equal(weaponOf(id), THROWN_WEAPONS.find((w) => w.id === id));
});

test("a thrown weapon leaves the hand before contact and keeps its distance", () => {
  for (const weapon of THROWN_WEAPONS) {
    const mod = effects[weapon.fx];
    assert.equal(poseAt(mod.act.poses, -0.1).weapon, weapon.id, weapon.id);
    assert.equal(poseAt(mod.act.poses, mod.act.hits[0].t).weapon, undefined, weapon.id);
    assert(mod.act.target.x >= 120, weapon.id);
    assert(mod.act.hits[0].t > 0.2, weapon.id);
  }
});

test("thrown actions expose their signature hit rhythm", () => {
  assert.equal(effects["thrown/boomerang-throw"].act.hits.length, 2);
  for (const id of ["kunai", "powder-bomb", "talisman", "soul-bell"])
    assert.equal(effects[weaponOf(id).fx].act.hits.length, 1, id);
  assert(effects["thrown/powder-bomb-throw"].act.hits[0].t > 0.9);
  assert(effects["thrown/boomerang-throw"].act.poses.some(([t, q]) => t > 1.2 && q.weapon === "boomerang"));
  // the flying sword splits into a ring of five that stab in turn, lowest to highest
  const swords = effects["thrown/flying-sword-throw"].act.hits;
  assert.equal(swords.length, 5);
  assert.equal(new Set(swords.map((h) => h.y)).size, 5);
  assert(swords.every((h, i) => !i || h.t > swords[i - 1].t));
  // the silk binds a turn at a time: four loops, then the cinch
  const binds = effects["thrown/binding-silk-throw"].act.hits;
  assert.equal(binds.length, 5);
  assert(binds.every((h, i) => !i || h.t > binds[i - 1].t));
  assert(binds[4].t > binds[3].t + 0.08);
  // the bell is lobbed, so it lands late; the needles tick in three staggered impacts at three heights
  assert(effects["thrown/soul-bell-throw"].act.hits[0].t > 0.7);
  const needles = effects["thrown/pear-needles-throw"].act.hits;
  assert.equal(needles.length, 3);
  assert.equal(new Set(needles.map((h) => h.y)).size, 3);
  assert(needles.every((h, i) => !i || h.t > needles[i - 1].t));
});
