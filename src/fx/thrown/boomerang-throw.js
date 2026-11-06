// A hooked boomerang travels out on a high crescent, clips the target, then sweeps
// back through the same space for a second contact before the hand catches it.
import { READY, TAU, clamp, ease, fit, rng, sparkle } from "../../core/index.js";

const RELEASE = 0, OUT = 0.56, RETURN = 1.08, TX = 150, TY = -20, HAND = [27, -28];

export const meta = {
  name: "Boomerang throw",
  desc: "He whips a hooked boomerang through a high crescent; it clips the target on the way out, curves back through the same gap and snaps into his waiting hand.",
  tags: ["move", "boomerang", "thrown", "projectile", "ranged", "returning", "combat", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: 1.72, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#20151c", "#4c2930", "#7a4644", "#ad6b4e", "#d79a62", "#f1d095", "#ffffff"], seed: 59 },
};

const HELD = { ...READY, weapon: "boomerang", x: -2, fx: 5, fy: -21, sa: -1.2 };
const WIND = { ...HELD, x: -7, crouch: 5, lean: -4, fx: -7, fy: -30, bx: 14, by: -26, sa: -2.2, ffx: 6, fbx: -9 };
const THROW = { ...READY, x: 4, crouch: 3, lean: 7, fx: 22, fy: -27, bx: -8, by: -21, sa: 0.05, ffx: 9, fbx: -10, toeB: true };
const CATCH = { ...READY, x: 1, crouch: 2, lean: 2, weapon: "boomerang", fx: 12, fy: -22, bx: 7, by: -21, sa: -0.9 };

export const act = {
  target: { x: TX },
  poses: [[-0.44, HELD], [-0.17, WIND], [-0.04, WIND], [RELEASE, THROW, "snap"], [0.1, { ...THROW, lean: 5 }], [1.24, CATCH], [1.48, CATCH], [meta.duration, CATCH]],
  hits: [
    { t: OUT, stop: 0.08, shake: 0.12, amp: 2, push: 1.5, straw: 8, y: TY },
    { t: RETURN, stop: 0.06, shake: 0.1, amp: 1, push: 1.2, straw: 6, y: TY },
  ],
  dust: [{ t: RELEASE, x: 21, n: 5, dir: 1 }],
};

function boomerang(p, C, x, y, a, alpha = 1) {
  const ca = Math.cos(a), sa = Math.sin(a), P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
  const pts = [];
  for (let u = 0; u <= 1; u += 0.06) {
    const q = -0.75 + u * 1.5, r = 6 + u * 11;
    pts.push(P(3 + Math.cos(q) * r, Math.sin(q) * r));
  }
  for (let i = 0; i < pts.length - 1; i++) p.line(...pts[i], ...pts[i + 1], C[2], 2.2 * alpha);
  for (let i = 0; i < pts.length - 1; i += 2) p.line(...pts[i], ...pts[i + 1], C[5], alpha);
  p.dot(...P(3, 0), C[6], alpha * 0.8);
}

function pointAt(t) {
  if (t < OUT) {
    const u = clamp(t / OUT); return [HAND[0] + (TX - HAND[0]) * u, HAND[1] + (TY - HAND[1]) * u - Math.sin(Math.PI * u) * 29, -TAU * ease.outCubic(u)];
  }
  const u = clamp((t - OUT) / (RETURN - OUT)); return [TX - (TX - HAND[0]) * ease.inCubic(u), TY - Math.sin(Math.PI * u) * 18, -TAU * (1 + u * 1.3)];
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 7), S = o.seed;
  if (t < 0.13) sparkle(p, HAND[0] + 2, HAND[1], 5 * (1 - t / 0.13), C[6], C[4], 0.5 * (1 - t / 0.13));
  if (t >= RELEASE && t < RETURN) {
    const [x, y, a] = pointAt(t), [x0, y0] = pointAt(Math.max(0, t - 0.15));
    p.beam(x0, y0, x, y, 1.1, C[3], (k) => k < 0.55 ? 0 : 0.2 * (1 - k));
    boomerang(p, C, x, y, a); p.glow(x, y, 8, C[4], 0.18);
  }
  for (const hit of [OUT, RETURN]) {
    const age = t - hit;
    if (age < 0 || age >= 0.24) continue;
    const k = 1 - age / 0.24;
    sparkle(p, TX, TY, 11 * k, C[6], C[4], 0.55 * k); p.glow(TX, TY, 19, C[4], 0.3 * k);
    for (let i = 0; i < 6; i++) {
      const r = rng(S, hit === OUT ? 70 : 80, i), a = r.range(-2.9, -0.2), d = 5 + (1 - k) * 15;
      p.line(TX + Math.cos(a) * d * 0.45, TY + Math.sin(a) * d * 0.45, TX + Math.cos(a) * d, TY + Math.sin(a) * d, C[i & 1 ? 3 : 5], k * 0.65);
    }
  }
  if (t >= RETURN && t < RETURN + 0.2) {
    const k = 1 - (t - RETURN) / 0.2;
    p.ring(HAND[0], HAND[1], 5 + 5 * (1 - k), 1, C[4], 0.25 * k);
  }
}
