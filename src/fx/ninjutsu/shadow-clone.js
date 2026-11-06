// Clone jutsu: a burst of smoke, two copies stepping out of it, a chakra shiver as they settle, then they
// come apart into smoke again. The copies are drawn from the stand-in actor's own silhouette.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, READY, stockActor, drawActor } from "../../core/index.js";
import { CHAKRA, floorSeal } from "./_lib.js";
import { bowed, crackle } from "../lightning/_lib.js";

const D = 2.7, PUFF = 0.12, OUT0 = 0.16, OUT1 = 0.55, SETTLE = 1.1, DISSOLVE = 2.15, GONE = 2.6;

export const meta = {
  name: "Shadow clones",
  desc: "A burst of smoke, and two copies step out of it either side of him — the same body, only semi-transparent — then come apart into smoke again.",
  tags: ["chakra", "ninjutsu", "clone", "smoke", "technique", "one-shot"],
  size: [224, 120],
  origin: [112, 106],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: CHAKRA, seed: 17 },
};

const SEAL = { ...READY, x: -1, crouch: 5, lean: -1, turn: 1, fx: 7, fy: -21, bx: 3, by: -22, ffx: 5, fbx: -3, armsFront: true };
const OPEN = { ...READY, x: 2, crouch: 4, lean: 1, turn: 1, fx: 13, fy: -18, bx: -8, by: -20, ffx: 9, fbx: -7 };
export const act = {
  poses: [
    [-0.4, READY],
    [0.02, SEAL],
    [PUFF, { ...SEAL, crouch: 6 }, "snap"],
    [OUT0 + 0.1, OPEN],
    [SETTLE, { ...OPEN, crouch: 4, lean: 0 }],
    [DISSOLVE, { ...OPEN, crouch: 3 }],
    [D, READY],
  ],
  hits: [{ t: PUFF, stop: 0.04, shake: 0.12, amp: 1, target: false }],
  dust: [{ t: PUFF, x: 0, n: 7, dir: 1, c: "#cfeaff" }, { t: PUFF, x: 0, n: 7, dir: -1, c: "#cfeaff" }],
};

// where each copy ends up, and how far it has slid by time t
const CLONES = [
  { x: -38, flip: -1, d: 0.02, y: 0 },
  { x: 40, flip: 1, d: 0.08, y: -1 },
];

function copyAt(c, t) {
  const q = smooth(OUT0 + c.d, OUT1 + c.d, t);
  return { x: c.x * ease.outCubic(q), a: smooth(OUT0 + c.d, OUT0 + 0.16 + c.d, t) * (1 - smooth(DISSOLVE + c.d, GONE, t)) };
}

function smokeCloud(p, C, x, y, t, t0, size, a, S) {
  const q = clamp((t - t0) / 0.9);
  if (q <= 0 || q >= 1) return;
  const R = rng(S, 5, 3);
  for (let i = 0; i < 9; i++) {
    const g = (i / 9) * TAU + R.range(-0.3, 0.3), d = size * (0.1 + q * 0.75) * R.range(0.5, 1);
    const px = x + Math.cos(g) * d, py = y - size * 0.45 + Math.sin(g) * d * 0.55 - q * size * 0.25;
    const rr = size * (0.22 + 0.35 * q) * R.range(0.7, 1.2);
    if (py + rr > -0.5) continue;
    p.disc(px, py, rr, i % 2 ? C[5] : C[6], a * (1 - q) * 0.5);
    p.disc(px - rr * 0.2, py - rr * 0.25, rr * 0.55, WHITE, a * (1 - q) * 0.18);
  }
  // puffs on the rim
  const R2 = rng(S, 9, 7);
  for (let i = 0; i < 14; i++) {
    const g = R2.range(0, TAU), d = size * (0.25 + q * 0.9) * R2.range(0.5, 1);
    const px = x + Math.cos(g) * d, py = y - size * 0.5 + Math.sin(g) * d * 0.5 - q * 8;
    if (py > -1) continue;
    p.dot(px, py, R2.chance(0.3) ? WHITE : C[5], a * (1 - q) * 0.6);
  }
}

// a clone is the same character, drawn from the same clockwork, just a little translucent
function drawClone(p, actor, x, y, a) {
  if (a <= 0.02) return;
  const tx = p.tx, ty = p.ty, fx = p.fx, cs = p.cs, sn = p.sn;
  p.place(p.toX(x, y), p.toY(x, y), fx < 0, Math.atan2(sn, cs));
  drawActor(p, actor, a);
  p.tx = tx; p.ty = ty; p.fx = fx; p.cs = cs; p.sn = sn;
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), S = o.seed, actor = o.actor ?? stockActor(2);

  if (t > 0.02) floorSeal(p, C, 0, 0, 30, 0.2, t / D, 0.45 * (1 - smooth(GONE, D, t)), false);
  p.glow(0, -1, 34, C[4], 0.1 * (1 - smooth(DISSOLVE, D, t)));

  // the burst at the caster
  if (t > PUFF && t < PUFF + 1.0) {
    smokeCloud(p, C, 0, -20, t, PUFF, 34, 1, S);
    const q = (t - PUFF) / 0.3;
    if (q < 1) {
      p.circle(0, -20, 8 + 22 * ease.outQuad(q), WHITE, (1 - q) * 0.55);
      sparkle(p, 0, -20, 12 * (1 - q) + 4, C[6], C[4], 0.7 * (1 - q));
      p.glow(0, -20, 60, C[5], 0.3 * (1 - q));
    }
  }

  // the copies, behind the caster's smoke and in front of the floor
  for (const c of CLONES) {
    const { x, a } = copyAt(c, t);
    if (a <= 0) continue;
    // a smear of the frames before, so the step reads as motion; both are the real body
    const prev = copyAt(c, Math.max(OUT0, t - 0.07));
    if (a > 0.05 && Math.abs(prev.x - x) > 0.8) drawClone(p, actor, prev.x, c.y, a * 0.16);
    drawClone(p, actor, x, c.y, a * 0.62);
    p.glow(x, -1, 20, C[4], 0.06 * a);
    // chakra crawling along the rim as they settle
    if (t > OUT1 && t < SETTLE + 0.4) {
      const R = rng(S, Math.floor(t * 15), c.x);
      for (let i = 0; i < 2; i++) {
        const g = R.range(0, TAU), rr = R.range(12, 17);
        const x0 = x + Math.cos(g) * rr, y0 = -22 + Math.sin(g) * rr * 0.8;
        const b = bowed(R, x0, y0, x0 + R.range(-10, 10), y0 + R.range(-6, 10), R.range(-4, 4), 0.25, 0.2);
        crackle(p, b, 0.55, C, 0.25, 0.7);
      }
    }
    smokeCloud(p, C, x, -16, t, OUT0 + c.d, 24, a, S + 3);
    smokeCloud(p, C, x, -16, t, DISSOLVE + c.d, 26, 1, S + 7);
  }

  // smoke off the copies when they come apart
  if (t > DISSOLVE) {
    const q = (t - DISSOLVE) / (GONE - DISSOLVE);
    p.glow(0, -20, 40, C[4], 0.2 * (1 - q));
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  if (t > PUFF && t < PUFF + 0.6) {
    const q = (t - PUFF) / 0.6;
    p.disc(0, -22, 22 + q * 14, C[4], 0.12 * (1 - q));
  }
}
