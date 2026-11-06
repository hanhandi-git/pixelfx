// 爆裂魔法 · the whole move: the chant, held to the last beat, then the blow, then the price she pays for it.
// The chant loops under a rising arm; on the release the chant cuts and the strike takes over from its own
// final gather, so the needle and the flash land on the pose; after the detonation she is thrown back, drops to
// her knees and sits in the ash she made.
import { chain } from "../../core/index.js";
import * as chant from "./explosion-chant.js";
import * as strike from "./explosion-strike.js";

const CAST = 3.8, STRIKE_AT = CAST - 1.0;

export const meta = {
  name: "Explosion",
  desc: "The full 爆裂魔法: she holds the chant to its last beat, thrusts the staff down, and the white-hot star takes the field, then drops to her knees in the ash of it.",
  tags: ["konosuba", "explosion", "move", "ultimate", "spell", "crimson", "chant", "one-shot"],
  size: [460, 340],
  origin: [230, 300],
  duration: 11.8,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { seed: 5 },
};

// both hands on the staff, its butt on the floor, the tip over her head; she sinks on every beat of the chant
const CHANT = { turn: 1.02, crouch: 3, lean: 1, fx: 11, fy: -21, weapon: "staff", two: true, sa: -1.43, hy: 1 };
const DEEP = { ...CHANT, crouch: 5, lean: 3, fy: -20, sa: -1.37, hy: 2, hx: -1 };
// the release: the staff stabs down and out, both arms flung after it, her whole weight behind the blow
const THRUST = { turn: 1.16, crouch: 2, lean: 7, y: -1, fx: 14, fy: -26, bx: -6, by: -23, weapon: "staff", two: false, sa: 0.42, hy: 0 };
// the blow answers: head snapped back, staff arm thrown wide, feet skidding
const BLOWN = { turn: 0.86, crouch: 7, lean: -7, x: -5, fx: 6, fy: -26, bx: -12, by: -29, weapon: "staff", two: false, sa: -0.35, hy: -2 };
// the price: down on both knees, shoulders in, staff held across her lap
const KNEEL = { turn: 0.94, crouch: 12, lean: 9, x: -2, fx: 9, fy: -12, bx: -7, by: -10, weapon: "staff", two: true, sa: 2.5, hy: 4 };
const SIT = { ...KNEEL, crouch: 13, lean: 11, hy: 5, sa: 2.62 };

export const act = {
  poses: [
    [0, CHANT],
    [0.95, DEEP],
    [1.9, { ...CHANT, crouch: 4 }],
    [2.75, DEEP],
    [CAST - 0.06, { ...DEEP, crouch: 6, fx: 9, fy: -24 }],
    [CAST, THRUST, "snap"],
    [CAST + 0.12, BLOWN],
    [CAST + 0.9, { ...BLOWN, crouch: 9, lean: -3, y: 0, x: -3 }],
    [CAST + 1.7, KNEEL],
    [CAST + 2.6, SIT],
    [CAST + 4.4, { ...SIT, lean: 10, hy: 4 }],
    [CAST + 6.0, SIT],
    [11.8, SIT],
  ],
  hits: [
    { t: CAST, stop: 0.09, shake: 0.9, amp: 7, push: 4.6, straw: 60, flash: 0.9 },
    { t: CAST + 0.16, shake: 0.22, amp: 2 },
  ],
};

export const create = chain([
  { fx: chant, t: 0, until: STRIKE_AT },
  { fx: strike, t: STRIKE_AT },
]);
