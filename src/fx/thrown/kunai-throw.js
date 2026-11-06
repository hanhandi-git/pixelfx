// A thrown kunai: a ring-pommeled blade is drawn back past the ear and let go. It crosses the gap
// end over end, bites into the target and quivers there while the steel chips and sparks cool.
import { READY, TAU, clamp, ease, fit, fly, rng, sparkle } from "../../core/index.js";

const RELEASE = 0, FLY = 0.3, HIT = RELEASE + FLY, TX = 150, TY = -27;
const HAND = [27, -28], END = [TX + 1, TY], SCALE = 0.72;

export const meta = {
  name: "Kunai throw",
  desc: "He draws the ring-pommeled kunai back past his ear and throws it; the blade turns over across the gap, bites into the target and quivers there in a cold spark and a puff of straw.",
  tags: ["move", "kunai", "thrown", "projectile", "ranged", "combat", "one-shot"],
  size: [280, 120],
  origin: [44, 96],
  duration: 1.5,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: {
    palette: ["#162334", "#2f465f", "#527187", "#80a7bc", "#b9dde5", "#e7f6f2", "#ffffff"],
    seed: 31,
  },
};

const HELD = { ...READY, weapon: "kunai", sa: -1.15, x: -2, fx: 5, fy: -20 };
const DRAW = { ...HELD, x: -4, crouch: 5, lean: -3, fx: -7, fy: -30, sa: -2.4, bx: 16, by: -24, ffx: 5, fbx: -9 };
const WIND = { ...DRAW, x: -5, crouch: 6, lean: -4, fx: -9, fy: -32, sa: -2.55, bx: 18, by: -25 };
const RELEASED = { ...READY, x: 4, crouch: 3, lean: 6, fx: 21, fy: -27, sa: 0.05, bx: -6, by: -20, ffx: 9, fbx: -10, toeB: true };
const FOLLOW = { ...RELEASED, x: 5, crouch: 4, lean: 7, fx: 23, fy: -24, sa: 0.45, bx: -8, by: -21 };
const SETTLE = { ...READY, x: 2, crouch: 3, fx: 10, fy: -21, bx: 8, by: -21 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.42, HELD],
    [-0.18, DRAW],
    [-0.05, WIND],
    [RELEASE, RELEASED, "snap"],
    [RELEASE + 0.08, FOLLOW],
    [FLY * 0.6, { ...FOLLOW, lean: 5, sa: 0.3 }],
    [HIT, SETTLE],
    [HIT + 0.5, { ...SETTLE, x: 1 }],
    [meta.duration, SETTLE],
  ],
  hits: [{ t: HIT, stop: 0.09, shake: 0.14, amp: 2, push: 1.5, straw: 11, y: TY }],
  dust: [{ t: RELEASE, x: 20, n: 5, dir: 1 }],
};

// the kunai itself, tip at (x, y) and the handle trailing along -angle
function kunai(p, C, x, y, angle, alpha = 1, scale = 1) {
  const ca = Math.cos(angle), sa = Math.sin(angle), s = scale;
  const P = (lx, ly) => [x + (ca * lx - sa * ly) * s, y + (sa * lx + ca * ly) * s];
  const at = (lx, ly) => P(lx, ly);
  const blade = [at(0, 0), at(-4, -1.2), at(-8, -2.2), at(-11, -1.6), at(-11, 1.6), at(-8, 2.2), at(-4, 1.2)];
  p.poly(blade, C[0], alpha);
  p.poly([at(0.4, 0), at(-4, -0.8), at(-8, -1.5), at(-9.4, 0), at(-8, 1.5), at(-4, 0.8)], C[5], alpha);
  p.poly([at(0.4, 0), at(-4, -0.9), at(-8, -1.6), at(-9.6, -0.2), at(-6, -0.3), at(-2, -0.1)], C[6], alpha);
  p.line(at(-1, 0.3)[0], at(-1, 0.3)[1], at(-8.4, 1.2)[0], at(-8.4, 1.2)[1], C[2], alpha);
  const h0 = at(-11, 0), h1 = at(-15.5, 0);
  p.beam(h0[0], h0[1], h1[0], h1[1], 2.2 * s, C[0], alpha);
  p.beam(h0[0], h0[1], h1[0], h1[1], 1 * s, C[3], alpha);
  const rc = at(-17.5, 0);
  p.ring(rc[0], rc[1], 2.2 * s, 1.2 * s, C[3], alpha);
  p.dot(at(-17.5, -1.8)[0], at(-17.5, -1.8)[1], C[6], alpha * 0.7);
}

// what stays outside the target: the wrapped grip and the ring pommel, the blade buried
function hilt(p, C, x, y, angle, alpha = 1, scale = 1) {
  const ca = Math.cos(angle), sa = Math.sin(angle), s = scale;
  const P = (lx, ly) => [x + (ca * lx - sa * ly) * s, y + (sa * lx + ca * ly) * s];
  const a = P(-1.5, 0), b = P(-11, 0), rc = P(-13.5, 0);
  p.beam(a[0], a[1], b[0], b[1], 2.3 * s, C[0], alpha);
  p.beam(a[0], a[1], b[0], b[1], 1.1 * s, C[3], alpha);
  p.ring(rc[0], rc[1], 2.2 * s, 1.2 * s, C[3], alpha);
  p.dot(P(-13.5, -1.7)[0], P(-13.5, -1.7)[1], C[6], alpha * 0.7);
  p.dot(a[0], a[1], C[6], alpha);
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 7), S = o.seed;
  const u = clamp((t - RELEASE) / FLY), age = t - HIT;

  // release: the hand snaps white, a short air-cut trails the wrist
  if (t >= RELEASE && t < RELEASE + 0.14) {
    const k = 1 - (t - RELEASE) / 0.14;
    sparkle(p, HAND[0] + 2, HAND[1] + 1, 4 * k, C[6], C[4], 0.35 * k);
    for (let i = 0; i < 3; i++) {
      const r = rng(S, 90, i);
      p.line(HAND[0] - 4 - i * 3, HAND[1] + r.range(-4, 4), HAND[0] - 12 - i * 5, HAND[1] + r.range(-6, 6), C[3], k * 0.5);
    }
  }

  // in flight: a full turn, a thin speed trail and two chips of air peeling off the ring
  if (t >= RELEASE && t < HIT) {
    const x = HAND[0] + (END[0] - HAND[0]) * u, y = HAND[1] + (END[1] - HAND[1]) * u - Math.sin(Math.PI * u) * 2;
    if (u > 0.06) {
      const u0 = Math.max(0, u - 0.16), x0 = HAND[0] + (END[0] - HAND[0]) * u0, y0 = HAND[1] + (END[1] - HAND[1]) * u0 - Math.sin(Math.PI * u0) * 2;
      p.beam(x0, y0, x, y, 1.1, (kk) => C[3], (kk) => (kk < 0.7 ? 0 : 0.22 * (1 - kk)));
    }
    kunai(p, C, x, y, -TAU * ease.outCubic(u) + 0.08, 1, SCALE);
    p.glow(x, y, 7, C[4], 0.22);
    p.dot(x, y, C[6]);
    for (let i = 0; i < 2; i++) {
      const r = rng(S, 40 + i), a = r.range(2.6, 4.1), d = r.range(5, 10);
      const ax = x + Math.cos(a) * d, ay = y + Math.sin(a) * d;
      p.line(ax, ay, ax - 5 - i * 3, ay + r.range(-1, 1), C[3], 0.35 * (1 - u));
    }
  }

  if (age >= 0) {
    // embedded: the blade sinks in, the hilt quivers and the steel catches the light
    if (age < 0.38) {
      const k = 1 - age / 0.38;
      hilt(p, C, END[0] - 2, END[1], -0.12 + Math.sin(age * 55) * 0.05 * k, k, SCALE);
      p.line(END[0] - 1, END[1] - 1, END[0] + 1, END[1] + 1, C[2], k * 0.7);
    }
    // the hit itself: a white star, a tight metal ring, chips and straw-fired sparks
    if (age < 0.12) {
      const k = 1 - age / 0.12;
      sparkle(p, END[0], END[1], 11 * k, C[6], C[4], 0.55 * k);
      p.glow(END[0], END[1], 24, C[4], 0.4 * k);
      p.ring(END[0], END[1], 3 + age * 10, 1, C[4], k * 0.35);
      for (let i = 0; i < 4; i++) {
        const a = -1.2 + i * 0.8, d = 6 + age * 70;
        p.line(END[0] + Math.cos(a) * d * 0.6, END[1] + Math.sin(a) * d * 0.6, END[0] + Math.cos(a) * d, END[1] + Math.sin(a) * d, C[6], k * 0.7);
      }
    }
    if (age < 0.75) {
      for (let i = 0; i < 14; i++) {
        const r = rng(S, 70, i), life = r.range(0.22, 0.6);
        if (age >= life) continue;
        const k = 1 - age / life, a = r.range(-Math.PI + 0.1, -0.1), speed = r.range(35, 95);
        const [x, y] = fly(END[0], END[1], Math.cos(a) * speed, Math.sin(a) * speed, age, 190, 3);
        const yy = Math.min(-1, y);
        if (i % 3 === 0) p.rect(x, yy, 2, 2, C[k > 0.5 ? 3 : 2], k);
        else p.line(x, yy, x - Math.cos(a) * (2 + 3 * k), yy - Math.sin(a) * (2 + 3 * k), C[k > 0.55 ? 6 : 4], k);
        p.glow(x, yy, 3, C[4], 0.15 * k);
      }
    }
  }
}
