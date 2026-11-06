// Sage art: Goemon. The three toad-sage breaths braid into one stream: a heavy amber oil jet, a teal wind
// sheath and a sage-fire edge. The oil is the body, the wind drives it, the fire rides on top and keeps
// burning after the wave breaks over the target.
import { fit, clamp, smooth, rng, TAU, WHITE, READY } from "../../core/index.js";
import { PAL } from "../../core/color.js";
import { SAGE, JADE, WIND, floorSeal } from "../ninjutsu/_lib.js";
import { noiseFor, hotFirst, flameBlade, flameTongue, firePuff, smokePuff } from "../fire/_lib.js";

const MX = 14, MY = -31, TX = 300, TY = -25;
const RELEASE = 0.66, IGNITE = 0.82, HIT = 1.42, END = 3.8;
const OIL = ["#0b0703", "#1a0f05", "#2e1b08", "#4a2c0c", "#6b4212", "#8f5d1a", "#bc8428", "#efc25a"];
const N = noiseFor(0);

export const meta = {
  name: "Sage art: Goemon",
  desc: "Oil, wind and sage fire braid into one roaring stream. The oil is the body, the wind the drive, the fire the edge; it breaks into a burning wave and a pool that will not go out.",
  tags: ["chakra", "senjutsu", "sage", "oil", "fire", "wind", "combo", "wave", "technique", "one-shot"],
  size: [440, 220],
  origin: [80, 188],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SAGE, natural: JADE, wind: WIND, oil: OIL, fire: PAL.fire, seed: 108, reach: TX },
};

const CHARGE = { ...READY, x: -1, crouch: 6, lean: -2, turn: 1, fx: 8, fy: -25, bx: -5, by: -24, armsFront: true };
const INHALE = { ...READY, x: -2, crouch: 8, lean: -5, turn: 1, fx: 5, fy: -28, bx: -2, by: -28, armsFront: true };
const SPIT = { ...READY, x: 4, crouch: 5, lean: 9, turn: 1, fx: 14, fy: -31, bx: -6, by: -22, ffx: 11, fbx: -6, toeB: true };
const HOLD = { ...SPIT, x: 5, crouch: 6, lean: 10, fx: 15, fy: -32, ffx: 12 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [0.08, CHARGE],
    [0.38, INHALE],
    [0.56, { ...INHALE, crouch: 9, lean: -7 }],
    [0.66, { ...SPIT, x: 2, crouch: 5, lean: 5 }, "snap"],
    [0.76, HOLD],
    [1.42, { ...HOLD, crouch: 7, lean: 11 }, "snap"],
    [2.7, { ...HOLD, crouch: 5, lean: 7 }],
    [3.2, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.18, shake: 0.48, amp: 4, push: 3.8, straw: 34, skin: "char" }],
  dust: [{ t: 0.66, x: 12, n: 7, dir: 1 }, { t: HIT, x: TX, n: 12, dir: -1 }],
};

const point = (q, t) => {
  const x = MX + (TX - MX) * q;
  const y = MY + (TY - MY) * q - 16 * Math.sin(Math.PI * q) + Math.sin(q * 11 - t * 4.5) * 3 * q;
  const x1 = MX + (TX - MX) * Math.min(1, q + 0.01);
  const y1 = MY + (TY - MY) * Math.min(1, q + 0.01) - 16 * Math.sin(Math.PI * Math.min(1, q + 0.01)) + Math.sin(Math.min(1, q + 0.01) * 11 - t * 4.5) * 3 * Math.min(1, q + 0.01);
  const dx = x1 - x, dy = y1 - y, d = Math.hypot(dx, dy) || 1;
  return { x, y, nx: -dy / d, ny: dx / d, w: 5 + 14 * q };
};

function oil(p, O, t, len, a) {
  if (len <= 0.01) return;
  for (let q = 0; q <= len; q += 0.018) {
    const P = point(q, t), w = P.w;
    for (let j = -1; j <= 1.0001; j += 0.11) {
      const n = N(q * 18 - t * 2.2, j * 2.6, 4);
      let c = O[2];
      if (j < -0.72) c = O[1];
      else if (j < -0.28) c = O[2];
      else if (j < 0.2) c = O[3];
      else if (j < 0.62) c = O[4];
      else c = O[5];
      if (n > 0.56 && j > -0.1) c = O[6];
      if (n > 0.78 && j > 0.2) c = O[7];
      const edge = Math.abs(j) > 0.86 ? 0.5 : 1;
      p.dot(P.x + P.nx * j * w, P.y + P.ny * j * w, c, a * edge);
    }
    // a hard glossy rail along the lit top and a dark one along the belly
    p.dot(P.x - P.nx * w * 0.58, P.y - P.ny * w * 0.58, O[6], a * 0.8);
    p.dot(P.x + P.nx * w * 0.82, P.y + P.ny * w * 0.82, O[1], a * 0.7);
    if (q > 0.2 && Math.round(q * 36) % 7 === 0) {
      const n = N(q * 8, t * 3, 9);
      p.dot(P.x + P.nx * w * (n * 1.4 - 0.7), P.y + P.ny * w * (n * 1.4 - 0.7), O[5], a * 0.7);
    }
  }
  // oil drips falling off the belly once the jet is running
  for (let i = 0; i < 11; i++) {
    const R = rng(108, i, 3), q = R.range(0.15, 0.95), age = t - RELEASE - R.range(0.1, 0.7);
    if (age < 0) continue;
    const P = point(Math.min(q, len), t);
    const dx = P.x + R.range(-5, 5), dy = P.y + P.w * 0.8 + age * age * 60 + age * 30;
    if (dy < -1) p.dot(dx, dy, O[i % 2 ? 5 : 4], a * 0.55 * Math.max(0, 1 - age / 1.4));
  }
}

function wind(p, W, J, t, len, a) {
  if (len <= 0.01) return;
  for (let k = 0; k < 4; k++) {
    for (let q = 0; q <= len; q += 0.02) {
      const P = point(q, t), off = (k - 1.5) * 8 + Math.sin(q * 18 - t * 7 + k) * 3;
      const x = P.x + P.nx * off, y = P.y + P.ny * off;
      const dash = Math.sin(q * 30 - t * 9 + k * 2) > 0.35;
      p.dot(x, y, k % 2 ? W[4] : J[4], a * (dash ? 0.52 : 0.22));
      if (dash && Math.round(q * 54) % 5 === 0) p.dot(x, y - 0.5, W[6], a * 0.55);
    }
  }
  // two long wind bands, visibly faster than the oil
  for (let k = 0; k < 2; k++) {
    for (let q = 0; q < len; q += 0.05) {
      const P = point(q, t), off = (k ? 1 : -1) * (13 + q * 8);
      p.dot(P.x + P.nx * off, P.y + P.ny * off, W[5], a * 0.3);
    }
  }
}

function fire(p, F, H, t, len, a) {
  const ignite = smooth(IGNITE, 1.02, t);
  if (ignite <= 0.01) return;
  for (let i = 0; i < 9; i++) {
    const q = 0.08 + i * 0.105;
    if (q > len) continue;
    const P = point(q, t), k = 0.45 + 0.55 * smooth(IGNITE, 1.1, t);
    const h = (5 + 13 * Math.sin(Math.PI * q)) * k;
    flameBlade(p, P.x, P.y - P.w * 0.25, -0.08, -1, h, 3.2 + 2.2 * Math.sin(Math.PI * q), Math.sin(i * 3 + t * 5) * 2.2, N, i, H);
    if (i % 2 === 0) firePuff(p, P.x + Math.sin(i * 2.1 + t * 4) * 4, P.y - P.w * 0.5, 0.45, 4 + 3 * Math.sin(Math.PI * q), 0.15, F, 0.1);
  }
  // the burning crown along the front of the stream
  for (let i = 0; i < 7; i++) {
    const q = 0.55 + i * 0.06;
    if (q > len) continue;
    const P = point(q, t);
    flameTongue(p, P.x + Math.sin(i * 2 + t * 6) * 4, P.y - P.w * 0.55, 8 + 5 * Math.sin(i * 1.7), 3.5, Math.sin(i * 2.2), N, i, H);
  }
  for (let i = 0; i < 10; i++) {
    const R = rng(108, i, 17), q = R.range(0.1, 0.98);
    if (q > len) continue;
    const P = point(q, t);
    smokePuff(p, P.x + R.range(-5, 5), P.y - 5 - R.range(0, 14), R.range(0.35, 0.8), R.range(4, 9), 0, false, 0.8);
  }
}

function impact(p, C, J, O, F, H, t, a) {
  const q = t - HIT;
  if (q < 0 || q > 2.25) return;
  const k = 1 - smooth(0, 2.2, q), flash = Math.max(0, 1 - q / 0.13);
  p.glow(TX, -25, 82, F[5], 0.32 * flash);
  p.circle(TX, -25, 9 + 16 * smooth(0, 0.2, q), F[6], 0.8 * flash);
  p.circle(TX, -25, 4 + 9 * smooth(0, 0.15, q), WHITE, flash);
  p.ellipse(TX, -1, 18 + q * 20, 3.4, F[5], 0.3 * k);
  p.ellipse(TX, -1, 10 + q * 12, 1.6, WHITE, 0.25 * k);
  // the wave of burning oil rolling right
  const reach = 18 + 30 * smooth(0, 0.3, q);
  for (let x = TX - 28; x <= TX + Math.min(reach, 42); x += 1.2) {
    const u = (x - (TX - 28)) / (reach + 28);
    const top = -8 - 34 * Math.sin(Math.PI * clamp(u, 0, 1)) * (0.4 + 0.6 * Math.sin(Math.PI * u)) * k;
    for (let y = top; y < -1; y += 0.9) {
      const n = N(x * 0.09, y * 0.12 + q * 4, 21);
      if (n < 0.25) continue;
      p.dot(x, y, n > 0.72 ? F[4] : n > 0.45 ? O[5] : O[2], a * 0.65 * k);
    }
    if (x % 6 < 1.2) flameBlade(p, x, top + 2, 0.1, -1, 22 + 28 * Math.sin(Math.PI * u), 5, Math.sin(x * 0.4) * 4, N, x | 0, H);
  }
  for (let i = 0; i < 18; i++) {
    const R = rng(108, i, 31), age = q - R.range(0, 0.12);
    if (age < 0) continue;
    const sp = R.range(28, 120), ang = R.range(-2.5, 0.3);
    const x = Math.min(348, TX + Math.cos(ang) * sp * age), y = -2 + Math.sin(ang) * sp * age + age * age * 200;
    if (y > -1) continue;
    p.dot(x, y, i % 3 ? O[4] : F[5], a * 0.7 * k);
  }
  for (let i = 0; i < 10; i++) {
    const R = rng(108, i, 41), age = q - R.range(0.02, 0.3);
    if (age < 0) continue;
    smokePuff(p, Math.min(348, TX + R.range(-26, 30) + age * R.range(-14, 16)), -10 - age * R.range(20, 50), 1 - age / 2.2, R.range(7, 16), 0, true, 0.8);
  }
  for (let i = 0; i < 6; i++) {
    const R = rng(108, i, 47), age = q - R.range(0.1, 0.7);
    if (age < 0) continue;
    p.dot(Math.min(350, TX + R.range(-26, 40)), -1 - age * 6, i % 2 ? F[3] : F[4], 0.5 * k);
  }
  p.ellipse(TX + 8, -1, 12 + q * 14, 2.2, O[2], 0.3 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), J = fit(o.natural ?? JADE, 8), O = fit(o.oil ?? OIL, 8), F = fit(o.fire ?? PAL.fire, 8), S = o.seed;
  const fade = 1 - smooth(2.85, 3.55, t);
  floorSeal(p, C, 8, 0, 18, 0.2, 0.1, (t < 1 ? 0.8 : 0.35) * fade);
  // the caster's oil puddle and the target's scorch/pool
  p.ellipse(22, -1, 15, 2.2, O[1], 0.45 * fade);
  p.ellipse(22, -2, 9, 1.2, O[3], 0.22 * fade);
  if (t > 0.6) {
    p.ellipse(MX + 14, -1, 24, 2.4, O[1], 0.3 * fade);
  }
  if (t >= HIT) {
    const q = t - HIT;
    p.ellipse(TX + 6, -1, 18 + Math.min(14, q * 8), 3.2, O[1], 0.4 * fade);
    p.ellipse(TX + 6, -2, 10 + Math.min(10, q * 6), 1.5, O[2], 0.42 * fade);
    for (let i = 0; i < 8; i++) {
      const R = rng(S, i, 7), x = TX + 8 + R.range(-16, 30);
      p.dot(x, -2, i % 2 ? F[4] : F[5], 0.35 * fade * (1 - smooth(0, 2, q)));
    }
  }
  // embers and dust at the floor, drawn behind the body
  for (let i = 0; i < 12; i++) {
    const R = rng(S, i, 11), q = (t * 0.25 + R.next()) % 1;
    p.dot(R.range(0, 70), -q * 12, i % 3 ? F[4] : C[5], 0.25 * fade);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), J = fit(o.natural ?? JADE, 8), W = fit(o.wind ?? WIND, 8), O = fit(o.oil ?? OIL, 8), F = fit(o.fire ?? PAL.fire, 8), H = hotFirst(F), S = o.seed;
  const fade = 1 - smooth(2.85, 3.55, t);
  const len = t < RELEASE ? 0 : smooth(RELEASE, 1.1, t);
  const streamA = fade * (1 - smooth(2.4, 3.1, t) * 0.6);
  // mouth charge
  if (t < RELEASE) {
    const k = smooth(0.15, 0.65, t);
    p.glow(MX, MY, 16, C[5], 0.25 * k);
    p.circle(MX + 1, MY, 2.2 + k * 0.8, C[6], 0.8 * k);
    for (let i = 0; i < 7; i++) {
      const R = rng(S, i, 3), q = (t * 0.6 + R.next()) % 1;
      p.dot(MX + R.range(-14, 14), MY + R.range(-12, 12), i % 2 ? J[5] : C[5], 0.35 * k * (1 - q));
    }
  }
  if (len > 0) {
    oil(p, O, t, len, streamA);
    wind(p, W, J, t, len, streamA);
    fire(p, F, H, t, len, streamA);
  }
  impact(p, C, J, O, F, H, t, fade);
}
