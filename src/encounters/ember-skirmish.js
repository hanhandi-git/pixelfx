// A minion-only showcase: two melee raiders and a ranged sporeling on the lava map, with no boss bar. It is the
// shape a normal encounter takes: marks, tells, hits, deaths, and a clear.
import * as map from "../fx/world/ember-depths.js";
import * as goblin from "../fx/mobs/goblin-raider.js";
import * as sporeling from "../fx/mobs/sporeling.js";
import * as goblinJab from "../fx/mobs/goblin-jab.js";
import * as sporePuff from "../fx/mobs/spore-puff.js";
import * as poof from "../fx/spawn/poof.js";

export const meta = {
  name: "Ashfall Skirmish",
  desc: "A minion skirmish in the Ember Depths: goblin raiders close in while a sporeling lobs clouds from the back, each kill a soft poof, the wave ended with a banner.",
  tags: ["encounter", "mobs", "fantasy", "volcano", "wave"],
  duration: 14.5,
  fps: 30,
  size: [320, 180],
  map: "world/ember-depths",
  mobs: ["mobs/goblin-raider", "mobs/sporeling"],
};

const GROUND = map.map.groundY;

export const encounter = {
  w: 320,
  h: 180,
  duration: 14.5,
  map,
  hero: { x: 52, y: GROUND },
  mobs: [
    { id: "raider-a", mod: goblin, x: 128, y: GROUND, hp: 42, until: 8.5 },
    { id: "raider-b", mod: goblin, x: 172, y: GROUND, hp: 42, until: 10.5 },
    { id: "sporeling", mod: sporeling, x: 228, y: GROUND, hp: 30, until: 12.0 },
  ],
  phases: [
    { at: 0.3, hp: 1, name: "Ashfall Skirmish", sub: "WAVE I", dur: 2.4 },
    { at: 13.0, hp: 1, name: "Wave Clear", sub: "THE DEPTHS GO QUIET", dur: 3.0 },
  ],
  timeline: [
    { at: 1.6, type: "attack", fx: goblinJab, x: 128, y: GROUND, flip: true },
    { at: 3.1, type: "attack", fx: goblinJab, x: 172, y: GROUND, flip: true },
    { at: 4.6, type: "attack", fx: sporePuff, x: 228, y: GROUND, flip: true },
    { at: 6.0, type: "attack", fx: goblinJab, x: 128, y: GROUND, flip: true },
    { at: 7.2, type: "attack", fx: goblinJab, x: 172, y: GROUND, flip: true },
    { at: 8.4, type: "attack", fx: poof, x: 128, y: GROUND },
    { at: 9.4, type: "attack", fx: sporePuff, x: 228, y: GROUND, flip: true },
    { at: 10.4, type: "attack", fx: poof, x: 172, y: GROUND },
    { at: 11.9, type: "attack", fx: poof, x: 228, y: GROUND },
  ],
};
