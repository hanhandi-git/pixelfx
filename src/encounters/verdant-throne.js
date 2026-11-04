// A two-phase boss showcase: adds interrupt the first phase, the phase change is a roar, and the second phase
// doubles down on arena control. Every attack and mob here is an ordinary pixelfx effect.
import * as map from "../fx/world/mossy-ruins.js";
import * as boss from "../fx/boss/thorn-king.js";
import * as goblin from "../fx/mobs/goblin-raider.js";
import * as goblinJab from "../fx/mobs/goblin-jab.js";
import * as rootQuake from "../fx/boss/root-quake.js";
import * as thornVolley from "../fx/boss/thorn-volley.js";
import * as phaseRoar from "../fx/boss/phase-roar.js";
import * as poof from "../fx/spawn/poof.js";
import * as implosion from "../fx/explosions/implosion.js";
import * as featherBurst from "../fx/holy/feather-burst.js";

export const meta = {
  name: "The Verdant Throne",
  desc: "The Thorn King wakes in the mossy ruins: root quakes, a thorn volley and goblin raiders in the first phase, then a roar splits the arena and the second phase gives the floor no rest.",
  tags: ["encounter", "boss", "fantasy", "forest", "two-phase"],
  duration: 27.5,
  fps: 30,
  size: [320, 180],
  map: "world/mossy-ruins",
  boss: "boss/thorn-king",
  mobs: ["mobs/goblin-raider"],
};

const GROUND = map.map.groundY;

export const encounter = {
  w: 320,
  h: 180,
  duration: 27.5,
  map,
  hero: { x: 52, y: GROUND },
  boss: { mod: boss, x: 252, y: GROUND, name: "The Thorn King" },
  mobs: [
    { id: "goblin-a", mod: goblin, x: 118, y: GROUND, hp: 42, until: 10.5 },
    { id: "goblin-b", mod: goblin, x: 164, y: GROUND, hp: 42, until: 18 },
  ],
  phases: [
    { at: 0.35, hp: 1, name: "The Waking Wood", sub: "THE THORN KING", dur: 2.8 },
    { at: 13.2, hp: 0.55, name: "Thorns Unleashed", sub: "PHASE II", dur: 2.8, shake: 1.5, shakeDur: 0.3 },
    { at: 23.0, hp: 0, name: "The Crown Falls", sub: "VICTORY", dur: 3.2 },
  ],
  timeline: [
    { at: 2.4, type: "attack", fx: rootQuake, x: 160, y: GROUND },
    { at: 5.6, type: "attack", fx: goblinJab, x: 118, y: GROUND, flip: true },
    { at: 7.1, type: "attack", fx: thornVolley, x: 160, y: GROUND },
    { at: 9.2, type: "attack", fx: goblinJab, x: 164, y: GROUND, flip: true },
    { at: 10.4, type: "attack", fx: poof, x: 118, y: GROUND },
    { at: 11.4, type: "attack", fx: rootQuake, x: 160, y: GROUND },
    { at: 13.2, type: "attack", fx: phaseRoar, x: 160, y: GROUND },
    { at: 16.0, type: "attack", fx: thornVolley, x: 160, y: GROUND },
    { at: 17.9, type: "attack", fx: poof, x: 164, y: GROUND },
    { at: 19.0, type: "attack", fx: rootQuake, x: 160, y: GROUND, shake: 1 },
    { at: 17.0, type: "attack", fx: goblinJab, x: 164, y: GROUND, flip: true },
    { at: 23.0, type: "attack", fx: implosion, x: 252, y: GROUND, options: { palette: ["#0a1a10", "#173a24", "#2a6a3a", "#4aa84a", "#8adf6a", "#d4ffb0", "#ffffff"] } },
    { at: 23.2, type: "attack", fx: featherBurst, x: 252, y: GROUND, options: { palette: ["#0a1a10", "#1d3a1c", "#3a6a30", "#6aa04a", "#a8d97a", "#e4ffc0", "#ffffff"] } },
    { at: 23.0, type: "defeat", target: "boss" },
  ],
};
