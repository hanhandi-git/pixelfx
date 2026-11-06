import test from "node:test";
import assert from "node:assert/strict";
import { createEncounter } from "../src/core/index.js";

// A boss unit is a loop; these fixtures deliberately draw nothing so the test is only about the performance clock.
const map = { meta: { kind: "map", duration: 2, loop: true, size: [320, 180] }, map: { groundY: 150 }, draw() {} };
const boss = (dieFor = 0) => ({
  meta: { kind: "boss", duration: 2, loop: true, size: [128, 168], options: { phase: 1 } },
  boss: { hp: 10, phases: [{ hp: 1 }], attacks: [], dieFor },
  draw() {},
});
const slam = {
  meta: { kind: "boss-attack", duration: 2, loop: false, size: [320, 180] },
  attack: {
    telegraph: 0.5,
    hits: [{ t: 0.5, damage: 1 }],
    pose: { cast: "slam", windup: 0.5, hold: 0.2, recover: 0.4 },
  },
  draw() {},
};

const make = ({ dieFor = 0, cueDieFor, defeatAt = 3 } = {}) => createEncounter({
  duration: 6,
  map,
  boss: { mod: boss(dieFor), x: 252, y: 150 },
  timeline: [
    { at: 1, type: "attack", fx: slam, x: 160, y: 150 },
    { at: defeatAt, type: "defeat", target: "boss", ...(cueDieFor !== undefined ? { dieFor: cueDieFor } : {}) },
  ],
});

const run = (E, seconds) => {
  for (let i = 0; i < Math.round(seconds * 30); i++) E.update(1 / 30);
};

test("an attack pose winds up, releases, recovers and returns to idle without recreating the unit", () => {
  const E = make();
  const options = E.boss.fx.options;
  run(E, 1.05);
  assert.equal(E.boss.fx.options, options);
  assert.equal(options.pose, "cast");
  assert.equal(options.cast, "slam");
  assert.ok(options.poseT > 0.02 && options.poseT < 0.12, `poseT ${options.poseT}`);
  assert.equal(options.poseWindup, 0.5);

  // windup + hold is 0.7s: still holding the cast at 1.65s
  run(E, 0.6);
  assert.equal(options.pose, "cast");

  // 1.866s: the release has played, the body starts to rise
  run(E, 0.2);
  assert.equal(options.pose, "recover");

  // 2.366s: windup + hold + recover (1.1s) is over
  run(E, 0.5);
  assert.equal(options.pose, "idle");
  assert.equal(options.cast, null);
  assert.equal(options.poseT, 0);
});

test("boss.dieFor keeps the body on screen playing the death pose, then removes it", () => {
  const E = make({ dieFor: 1.5 });
  run(E, 3.05);
  const options = E.boss.fx.options;
  assert.equal(options.pose, "die");
  assert.equal(options.poseDur, 1.5);
  assert.ok(options.poseT > 0 && options.poseT < 0.12, `poseT ${options.poseT}`);
  assert.equal(E.boss.gone, false);
  assert.ok(E.hp < 1 && E.hp > 0.3, `hp ${E.hp}`); // the bar is draining, not snapped

  run(E, 1.0);
  assert.equal(E.boss.gone, false);

  run(E, 0.6);
  assert.equal(E.boss.gone, true);
});

test("a defeat cue can override the boss's death hold, and the default hides at once", () => {
  const quick = make({ dieFor: 5, cueDieFor: 0.4 });
  run(quick, 3.45);
  assert.equal(quick.boss.gone, true);

  const instant = make();
  run(instant, 3.05);
  assert.equal(instant.boss.gone, true);
  assert.equal(instant.boss.fx.options.pose ?? "idle", "idle");
});

test("a pose restarts cleanly when the next attack lands during the recovery", () => {
  const E = createEncounter({
    duration: 6,
    map,
    boss: { mod: boss(0), x: 252, y: 150 },
    timeline: [
      { at: 1, type: "attack", fx: slam, x: 160, y: 150 },
      { at: 1.9, type: "attack", fx: slam, x: 160, y: 150 },
    ],
  });
  run(E, 1.95);
  const o = E.boss.fx.options;
  assert.equal(o.pose, "cast");
  assert.ok(o.poseT < 0.1, `poseT ${o.poseT}`);
});
