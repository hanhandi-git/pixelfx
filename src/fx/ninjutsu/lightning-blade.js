// Chidori: a palmful of lightning, a short step in, and a thrust that drives the current through the target.
// The charge is the hero pose; the hit is one white frame, a burst of forks through the body, and a cooling
// scorch on the floor.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, READY, stockActor, drawActor, burst, fly, band } from "../../core/index.js";
import { VOLT, zigzag, crackle, bowed, stroke } from "../lightning/_lib.js";

const CHARGE = 0.78, HIT = 0.82, END = 2.8;
const HX0 = 14, HY0 = -14, HX1 = 16, HY1 = -22;   // the near palm, cocked in front and then thrust forward
const TX = 48, TY = -20;                          // where the hand goes through

export const meta = {
  name: "Chidori",
  desc: "A palmful of lightning: jagged arcs gather in the hand, then a short thrust drives a white-blue lance through the target — a flash, a ground ring, sparks and a cooling scorch.",
  tags: ["chakra", "ninjutsu", "lightning", "chidori", "technique", "one-shot"],
  size: [190, 146],
  origin: [62, 126],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: VOLT, seed: 5 },
};

const CHARGE_POSE = { ...READY, x: 5, crouch: 7, lean: -2, turn: 1, fx: 9, fy: -14, bx: -6, by: -20, ffx: 7, fbx: -4, armsFront: true };
const THRUST = { ...READY, x: 9, crouch: 3, lean: 6, turn: 1, fx: 7, fy: -22, bx: -3, by: -16, ffx: 5, fbx: -2, toeB: true };
export const act = {
  poses: [
    [-0.4, READY],
    [0.05, CHARGE_POSE],
    [0.55, { ...CHARGE_POSE, crouch: 9, lean: -4, fx: 8, fy: -12 }],
    [CHARGE, THRUST, "snap"],
    [1.1, THRUST],
    [1.6, { ...THRUST, x: 1, lean: 2, fx: 8, fy: -16 }],
    [2.3, READY],
    [END, READY],
  ],
  target: { x: TX },
  hits: [{ t: HIT, stop: 0.12, shake: 0.4, amp: 2, target: true }],
  dust: [
    { t: CHARGE, x: 0, n: 8, dir: 1, c: "#9fdcff" },
    { t: CHARGE, x: 0, n: 5, dir: -1, c: "#9fdcff" },
  ],
};

// where the palm is at time t: cocked low, then snapped forward on the release
function handAt(t) {
  const q = smooth(0.58, CHARGE, t);
  return [HX0 + (HX1 - HX0) * q, HY0 + (HY1 - HY0) * q];
}

// a blue after-image of the body, so the step reads even when the host does not move the actor
function ghost(p, actor, x, a, C) {
  const tx = p.tx, ty = p.ty, fx = p.fx, cs = p.cs, sn = p.sn;
  p.place(p.toX(x, 0), p.toY(x, 0), fx < 0, Math.atan2(sn, cs));
  p.mask(actor.mask, actor.x, actor.y, C[3], a);
  p.tx = tx; p.ty = ty; p.fx = fx; p.cs = cs; p.sn = sn;
}

// the palm orb: a dark shell, a hot body, a white heart, and short forks spitting off the rim
function palmOrb(p, C, x, y, r, k, S, frame) {
  p.circle(x, y, r + 1, C[2], 0.85 * k);
  p.circle(x, y, r, C[3], 0.9 * k);
  p.circle(x - 1, y - 1, r * 0.55, C[5], 0.95 * k);
  p.dot(x, y, WHITE, k);
  const R = rng(S, frame, 2);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + R.range(-0.3, 0.3), l = R.range(3, 9);
    const b = zigzag(R, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l), 0.45, 0, 1);
    crackle(p, b, 0.8 * k, C, 0.18, 0.9);
  }
  p.glow(x, y, 18, C[5], 0.45 * k);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), S = o.seed, actor = o.actor ?? stockActor(2);
  const [hx, hy] = handAt(t);
  const charge = smooth(0.06, 0.5, t) * (1 - smooth(1.0, 1.7, t));
  const live = 1 - smooth(1.25, 1.9, t);

  // the charge: air pulled into the palm, light climbing the forearm, dust lifting at the feet
  if (t < HIT + 0.1 && charge > 0.01) {
    const R = rng(S, Math.floor(t * 20), 1);
    for (let i = 0; i < 16; i++) {
      const a = R.range(0, TAU), d = 9 + R.range(0, 22) * (1 - clamp(t / CHARGE));
      const px = hx + Math.cos(a) * d, py = hy + Math.sin(a) * d * 0.85;
      if (py > -1) continue;
      p.dot(px, py, i % 4 ? C[5] : C[6], 0.45 * charge);
    }
    for (let i = 0; i < 3; i++) {
      const b = bowed(R, hx, hy, 5, -29, R.range(-6, 3), 0.3, 0.2);
      crackle(p, b, 0.55 * charge, C, 0.22, 0.8);
    }
    p.circle(hx, hy, 2 + 0.6 * Math.sin(t * 40), WHITE, charge);
  }

  // the palm orb swells with the charge, then flattens into the thrust
  if (charge > 0.01) {
    const r = 4.2 + 1.8 * smooth(0.05, 0.6, t) + 0.5 * Math.sin(t * 36);
    palmOrb(p, C, hx, hy, r, charge, S, Math.floor(t * 18));
    p.ring(hx, hy, r + 3.5 + Math.sin(t * 12) * 1.5, 1, C[5], 0.35 * charge);
    p.circle(hx, hy, 1, WHITE, charge);
    p.glow(hx, hy, 14, C[4], 0.25 * charge);
  }

  // the step: a couple of blue ghosts behind him, and speed lines off the palm
  if (t > 0.6 && t < 1.05) {
    const k = smooth(0.6, 0.78, t) * (1 - smooth(0.92, 1.05, t));
    ghost(p, actor, -7, 0.14 * k, C);
    ghost(p, actor, -14, 0.09 * k, C);
    for (let i = 0; i < 3; i++) p.line(hx - 22 - i * 5, hy - 2 + i * 2, hx - 4, hy - 1 + i, C[5], 0.25 * k);
  }

  // the thrust: one short, thick lance of current, with a fan of forks at the palm
  if (t > 0.7 && t < 1.25) {
    const k = clamp((t - 0.7) / 0.1) * (1 - smooth(0.98, 1.25, t));
    const R = rng(S, Math.floor(t * 30), 3);
    const bolt = zigzag(R, hx, hy, TX + 4, TY, 0.16, 0.45, 1.2, 0);
    stroke(p, bolt, k, C, 1.5, { hero: t < 0.86, light: 0.45, core: 1.6 });
    for (let i = 0; i < 4; i++) {
      const a = Math.atan2(TY - hy, TX - hx) + R.range(-0.55, 0.55), l = R.range(6, 15);
      const b = zigzag(R, hx, hy, hx + Math.cos(a) * l, hy + Math.sin(a) * l, 0.5, 0, 1);
      crackle(p, b, 0.75 * k, C, 0.15, 0.9);
    }
  }

  // the hit: a white core, forks through and out the far side, the floor jumping
  if (t >= HIT) {
    const q = t - HIT;
    if (q < 0.12) {
      const f = 1 - q / 0.12;
      p.circle(TX, TY, 4 + 10 * ease.outQuad(q / 0.12), WHITE, f);
      sparkle(p, TX, TY, 14 * f + 4, C[6], C[4], 0.8 * f);
      p.glow(TX, TY, 54, WHITE, 0.7 * f);
      p.glow(TX, TY, 34, C[5], 0.5 * f);
    }
    const R = rng(S, Math.floor(t * 24), 5);
    const k = 0.9 * (1 - smooth(0.35, 1.1, q));
    if (k > 0.02) {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + R.range(-0.35, 0.35), l = R.range(16, 36), x1 = TX + Math.cos(a) * l, y1 = TY + Math.sin(a) * l;
        const b = zigzag(R, TX, TY, x1, Math.max(-1, y1), 0.3, 0.2, 1);
        crackle(p, b, k, C, 0.16, 0.9);
      }
    }
    // the floor ring and the torn ground
    for (let i = 0; i < 2; i++) {
      const rr = 10 + q * (40 + i * 18), a = clamp(1 - rr / 62, 0, 1) * (1 - smooth(0.4, 0.95, q)) * (i ? 0.28 : 0.45);
      if (a > 0.005) band(p, TX, 0, rr, 0.24, 1.8, a, C, undefined, q < 0.12);
    }
    // sparks thrown out of the far side, and grit kicked up from the floor
    burst(26, S + 5, (B) => {
      const a = B.range(0, TAU), sp = B.range(24, 130), life = B.range(0.45, 1.4), age = q - B.range(0, 0.05);
      if (age < 0 || age > life) return;
      const [x, y] = fly(TX, TY, Math.cos(a) * sp, Math.sin(a) * sp - 24, age, 110, 1.1);
      if (y > -0.5) return;
      p.dot(x, y, age < 0.08 ? WHITE : B.chance(0.4) ? C[6] : C[5], 0.8 * (1 - age / life));
    });
    burst(14, S + 9, (B) => {
      const a = B.range(-2.9, -0.25), sp = B.range(18, 78), life = B.range(0.8, 1.8), age = q - B.range(0, 0.1);
      if (age < 0 || age > life) return;
      const x0 = TX + B.range(-10, 10), y0 = -1;
      const [x, y] = fly(x0, y0, Math.cos(a) * sp, Math.sin(a) * sp, age, 160, 0.5);
      if (y > -1) return;
      p.rect(x, y, B.chance(0.3) ? 2 : 1, 1, C[1], 0.85 * (1 - age / life));
    });
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 11), q2 = clamp(q / 1.5);
      if (q2 >= 1) continue;
      const x0 = TX + B.range(-14, 14), y0 = -2 - q2 * 8;
      if (y0 > -1) continue;
      p.disc(x0, y0, 3 + B.range(1, 4) + q2 * 10, C[3], 0.15 * (1 - q2));
    }
    // arcs crawling away over the floor
    if (q < 0.8) {
      const k2 = 0.6 * (1 - q / 0.8);
      for (let i = 0; i < 3; i++) {
        const dir = i % 2 ? 1 : -1, b = bowed(R, TX, 0, TX + dir * (14 + i * 7), -1, 2, 0.5, 0.1);
        crackle(p, b, k2, C, 0.15, 0.8);
      }
    }
  }

  // the last arcs and smoke
  if (t > 1.0 && live > 0.01) {
    const R = rng(S, Math.floor(t * 12), 13);
    for (let i = 0; i < 2; i++) {
      const b = bowed(R, TX - 4 + i * 5, -1, TX + R.range(-10, 10), -1, 2, 0.4, 0.2);
      crackle(p, b, 0.3 * live, C, 0.1, 0.7);
    }
    p.glow(TX, -1, 26, C[4], 0.18 * live);
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  if (t >= END) return;
  // the ground heats under the thrust and cools slowly
  if (t > HIT) {
    const q = t - HIT, fade = 1 - smooth(1.7, END, t);
    p.disc(TX, -1, 8 + 4 * smooth(0, 0.4, q), C[1], 0.55 * fade);
    p.ring(TX, -1, 9 + 3 * smooth(0, 0.5, q), 1, C[4], 0.3 * fade);
  }
  if (t < HIT + 0.1) p.glow(TX, -1, 30, C[3], 0.12 * (1 - smooth(0.8, 1.2, t)));
}
