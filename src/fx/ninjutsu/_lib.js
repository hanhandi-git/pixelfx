// Shared chakra language for the ninjutsu / senjutsu set: the ramps, the held sphere, floor seals and the
// little orbiting motes that keep a held technique alive. Everything here is a function of a loop phase or of
// a one-shot clock, so effects stay deterministic and seamless.

import { cycle, loopNoise, smooth, TAU, WHITE } from "../../core/index.js";

/** Chakra blue: deep indigo shadow, cobalt body, cyan rim, white heart. */
export const CHAKRA = ["#0a1029", "#14245e", "#1f449c", "#2a6ed0", "#49a8f2", "#8fddff", "#d6f6ff", "#ffffff"];
/** Sage chakra: amber and gold, with jade natural energy for sparks and edge light. */
export const SAGE = ["#1a0d05", "#43200a", "#7d3c0e", "#c07014", "#f0a824", "#ffd45c", "#fff0a8", "#ffffff"];
/** Natural energy: the green that rides on sage gold. */
export const JADE = ["#06180f", "#0d3a22", "#146038", "#1f8a4a", "#3ab866", "#7fe08c", "#c8ffc4", "#ffffff"];
/** Wind release: pale teal and white, pressed into blades. */
export const WIND = ["#041a1e", "#0a3440", "#0f5466", "#1a7e8e", "#3cb8bc", "#8ce8e0", "#d8fff8", "#ffffff"];
/** Water release: night blue to foam white. */
export const WATER = ["#05142c", "#0a2a52", "#0f4478", "#1a6aa0", "#2f9acc", "#6cc8ea", "#b4ecff", "#ffffff"];
/** Black flame: a void heart, a crimson seam, an orange edge; white is reserved for the ignition. */
export const AMATERASU = ["#020106", "#070208", "#0d030c", "#160510", "#260812", "#4a0d18", "#a82622", "#ff9a52"];

/** A soft pool of light on the floor under a held technique. */
export function floorLight(p, x, C, k = 1, w = 26) {
  p.glow(x, -1, w, C[4], 0.14 * k);
  p.glowRing(x, -1, 9, 12, C[5], 0.1 * k);
}

/**
 * The held chakra sphere: a rim-lit ball with spiral arms turning on the sphere, a white heart and a thin
 * shell ring. ph is the loop phase 0..1; r the radius in px. o: { arms, turns, tilt, k, hot, ring }.
 */
export function chakraOrb(p, C, x, y, r, ph, o = {}) {
  const k = o.k ?? 1;
  if (r < 1 || k <= 0.01) return;
  const arms = o.arms ?? 3, turns = o.turns ?? 2, spin = ph * TAU * turns;
  const tilt = o.tilt ?? 0.3, hot = o.hot ?? 1;

  // the ball: a deep body, a lit shoulder, a single bright rim
  p.circle(x, y, r, (d, ang) => {
    if (d > 0.93) return C[4];
    const lit = Math.cos(ang + Math.PI * 0.78);
    if (lit > 0.15 && d < 0.85) return C[3];
    return C[2];
  }, k);

  // arms on the sphere: crisp lines on the front half only, a dim echo behind
  for (const front of [false, true]) {
    for (let a = 0; a < arms; a++) {
      const off = (a / arms) * TAU;
      let run = [];
      for (let u = 0; u <= 1.0001; u += 0.025) {
        const lat = -1.2 + u * 2.4, lon = spin + off + u * 1.7 * Math.PI;
        const cl = Math.cos(lat), sl = Math.sin(lat), z = cl * Math.sin(lon);
        const px = x + cl * Math.cos(lon) * r * 0.9, py = y + sl * r * 0.9;
        if (front !== z >= 0) {
          if (run.length > 1) drawRun(p, run, front ? C[6] : C[3], front ? 0.95 : 0.45, k);
          run = [];
          continue;
        }
        run.push([px, py, z]);
      }
      if (run.length > 1) drawRun(p, run, front ? C[6] : C[3], front ? 0.95 : 0.45, k);
    }
  }

  // a shell of pressed chakra: a dashed ring round the equator, turning the other way
  for (let i = 0; i < 20; i++) {
    const g = spin * -0.6 + (i / 20) * TAU;
    if (Math.sin(g) < -0.2) continue;
    p.dot(x + Math.cos(g) * (r + 1.1), y + Math.sin(g) * (r + 1.1) * tilt - r * 0.05, C[4], k * 0.7);
  }

  // the heart
  p.circle(x - r * 0.05, y - r * 0.08, r * 0.42, C[5], k);
  p.circle(x - r * 0.07, y - r * 0.1, r * 0.27, C[6], k);
  p.circle(x - r * 0.08, y - r * 0.12, r * 0.12, WHITE, k * hot);
  // a rim glint at the upper left, a hot pin at the heart
  p.arc(x, y, r - 0.2, 1, -2.55, -1.45, WHITE, k * 0.9);
  p.px(x - r * 0.08, y - r * 0.12, WHITE);

  p.glow(x, y, r * 3.4, C[4], 0.3 * k);
  p.glow(x, y, r * 1.35, C[6], 0.22 * k);
  p.glow(x, y, r * 0.6, WHITE, 0.25 * k);
}

const drawRun = (p, run, c, a, k) => {
  for (let i = 0; i < run.length - 1; i++) {
    const [x0, y0] = run[i], [x1, y1] = run[i + 1];
    if (Math.hypot(x1 - x0, y1 - y0) < 2.5) p.line(x0, y0, x1, y1, c, a * k);
    else p.dot(x0, y0, c, a * 0.6 * k), p.dot(x1, y1, c, a * 0.6 * k);
  }
};

/**
 * Chakra streaming into a held sphere: streaks born on a ring around the ball, curving in and dying at the
 * surface. Count and reach are in px. Seamless through `cycle`.
 */
export function inwardStreaks(p, C, x, y, r, t, D, seed, count = 40, reach = 30, dir = -1) {
  cycle(t, D, count, seed, (g) => g.range(0.25, 0.5), (age, life, R) => {
    const a = R.range(0, TAU), d0 = r + reach * R.range(0.5, 1), spin = R.range(0.8, 2);
    const q = age / life, e = 1 - (1 - q) * (1 - q);
    const a1 = a + dir * spin * e;
    const d = d0 * (1 - e) + r * e;
    const px = x + Math.cos(a1) * d, py = y + Math.sin(a1) * d * 0.95;
    const fade = smooth(0, 0.15, q) * (1 - smooth(0.86, 1, q));
    if (q > 0.9 || py > -1) return;
    p.dot(px, py, q < 0.5 ? C[5] : C[6], 0.8 * fade);
    if (q < 0.4) p.dot(px - Math.cos(a1) * 2, py - Math.sin(a1) * 1.9, C[3], 0.4 * fade);
    if (q > 0.35 && q < 0.6 && R.chance(0.12)) p.glow(px, py, 4, C[5], 0.08 * fade);
  });
}

/** A dust of motes around a held sphere, drifting and winking, seamless in the phase. */
export function orbitingMotes(p, C, x, y, r, ph, seed, count = 9) {
  for (let i = 0; i < count; i++) {
    const a = ph * TAU * (i % 2 ? 1 : -1) + (i / count) * TAU;
    const d = r + 4 + 5 * (0.5 + 0.5 * loopNoise(ph, 1.4, seed + i * 13));
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.85;
    const wink = Math.max(0, loopNoise(ph, 2, seed + i * 7 + 3));
    p.dot(px, py, wink > 0.55 ? WHITE : C[6], 0.35 + wink * 0.5);
  }
}

/** A flat seal on the floor: rotating tick marks and a broken outer ring. ph is the loop phase. */
export function floorSeal(p, C, x, y, r, sy, ph, k = 1, glyph = true) {
  if (k <= 0.01) return;
  const spin = ph * TAU;
  for (let i = 0; i < 32; i++) {
    const g = (i / 32) * TAU + spin;
    if ((i + Math.floor(ph * 32)) % 4 === 0) continue;
    p.dot(x + Math.cos(g) * r, y + Math.sin(g) * r * sy, C[4], k * 0.7);
  }
  for (let i = 0; i < 12; i++) {
    const g = (i / 12) * TAU - spin * 0.7;
    const x0 = x + Math.cos(g) * (r - 4), y0 = y + Math.sin(g) * (r - 4) * sy;
    const x1 = x + Math.cos(g) * (r - 1), y1 = y + Math.sin(g) * (r - 1) * sy;
    p.line(x0, y0, x1, y1, glyph && i % 3 === 0 ? C[6] : C[4], k * 0.8);
  }
  p.glowRing(x, y, r - 2, 6, C[4], 0.12 * k);
}

/** Noise-driven sparkle along a vertical column (chakra rising off a technique). */
export function risingMotes(p, C, x0, x1, h, t, D, seed, count = 18, k = 1) {
  cycle(t, D, count, seed, (g) => g.range(0.7, 1.6), (age, life, R) => {
    const q = age / life, px = x0 + R.range(0, 1) * (x1 - x0) + Math.sin(q * 6 + R.next() * 6) * 2;
    const py = -q * h;
    const fade = Math.sin(q * Math.PI) * k;
    p.dot(px, py, q < 0.4 ? C[6] : C[4], 0.6 * fade);
    if (R.chance(0.2)) p.glow(px, py, 4, C[5], 0.06 * fade);
  });
}

/** A hot white star with four points; ph rotates the cross a quarter turn each loop. */
export function glintStar(p, x, y, r, ph, C, k = 1) {
  const a = ph * TAU * 0.25;
  p.px(x, y, WHITE);
  for (let i = 0; i < 4; i++) {
    const g = a + (i / 4) * TAU, len = i % 2 ? r * 0.55 : r;
    for (let d = 1; d <= len; d += 0.5) p.dot(x + Math.cos(g) * d, y + Math.sin(g) * d, d < len * 0.5 ? WHITE : C[6], k * (1 - d / (len + 1)));
  }
}
