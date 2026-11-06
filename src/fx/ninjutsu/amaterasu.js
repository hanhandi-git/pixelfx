// Amaterasu: a black flame that blooms on the target. The caster's eye catches first, a crimson pinprick
// opens into a void-black fire, and the fire is smoke first: heavy black billows with red-edged tongues,
// soot, embers and a red seam that keeps smouldering after the shape is gone.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, band, fly, READY } from "../../core/index.js";
import { noiseFor, firePuff, flameTongue, smokePuff, ember } from "../fire/_lib.js";
import { AMATERASU } from "./_lib.js";

const IGNITE = 0.56, HIT = 0.78, END = 3.4;
const TX = 120, TY = -30;
const N = noiseFor(0);

export const meta = {
  name: "Amaterasu",
  desc: "His eye catches the target, a crimson pinprick blooms, and black flame erupts — a smoke-heavy black fire with red-edged tongues that will not go out, leaving soot and red embers.",
  tags: ["chakra", "ninjutsu", "fire", "amaterasu", "black flame", "smoke", "dojutsu", "one-shot"],
  size: [230, 170],
  origin: [64, 142],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: AMATERASU, seed: 71 },
};

const FOCUS = { ...READY, x: 0, crouch: 2, lean: 0, turn: 1, fx: 4, fy: -34, bx: -6, by: -22 };
const BURN = { ...READY, x: 1, crouch: 3, lean: -2, turn: 1, fx: 6, fy: -28, bx: -7, by: -22 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [0.1, FOCUS],
    [0.45, { ...FOCUS, crouch: 3, lean: -1 }],
    [0.56, { ...FOCUS, fx: 3, fy: -35, lean: -2 }, "snap"],
    [0.78, BURN, "snap"],
    [2.8, { ...BURN, crouch: 2, lean: -1 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.12, shake: 0.3, amp: 2, target: true, skin: "char" }],
  dust: [{ t: IGNITE, x: TX, n: 5, dir: 1, c: "#6a3028" }],
};

// Seven tongues. The outer layer is red/orange; every layer inside it is darker, down to a black heart.
// That is the reverse of a normal fire and is what makes it read as black flame rather than a recolour.
const BLACK_LAYERS = [[1, 1, 1], [0.9, 0.94, 2], [0.72, 0.82, 7], [0.48, 0.6, 7], [0.22, 0.34, 7]];
const TONGUES = [
  { dx: -13, h: 35, w: 10, sw: 2.4, ph: 1.1 },
  { dx: -6, h: 48, w: 9, sw: 3.0, ph: 2.3 },
  { dx: 1, h: 42, w: 12, sw: 2.0, ph: 0.6 },
  { dx: 9, h: 31, w: 9, sw: 3.2, ph: 1.8 },
  { dx: 16, h: 20, w: 6, sw: 2.1, ph: 0.2 },
  { dx: -19, h: 19, w: 6, sw: 2.6, ph: 3.0 },
  { dx: 0, h: 26, w: 14, sw: 1.4, ph: 2.0 },
];

// Heavy soot billows are the default body: they start before the flame, keep rising after it, and carry
// the red heat at their base. smokePuff ages from the tint toward grey, so a black tint gives black smoke.
function soot(p, C, t, S, a) {
  for (let i = 0; i < 26; i++) {
    const B = rng(S, i, 61), born = 0.34 + B.next() * 2.05, life = 1.05 + B.next() * 0.95, age = t - born;
    if (age < 0 || age > life) continue;
    const k = 1 - age / life, rise = age * (28 + B.next() * 18) + 6;
    const x = TX + B.range(-15, 15) + Math.sin(age * 1.9 + B.range(0, TAU)) * (2 + age * 4) + age * B.range(-3, 3);
    const y = -4 - rise - age * 8;
    smokePuff(p, x, y, k, (5.2 + B.range(0, 4.2)) * (0.8 + age * 0.45), i % 3 === 0 ? 0 : C[1], true, 0.72 * a);
  }
}

function blackFlame(p, C, t, S, grow, live) {
  const H = [...C].reverse(); // fire helpers want hot-first; H[0] is the orange edge, H[7] the void
  // a dark-red aura, then the smoke (behind), then the hot shards and tongues in front
  p.disc(TX, -11, 25 * grow, C[3], 0.13 * live);
  p.glow(TX, -18, 62 * grow, C[5], 0.19 * live);
  soot(p, C, t, S, live);

  // hot flame shards shed at the base: young they are red-orange, old they cool to black and become smoke
  for (let i = 0; i < 12; i++) {
    const B = rng(S, i, 71), born = IGNITE + B.range(0, 2.12), life = 0.36 + B.next() * 0.34, age = t - born;
    if (age < 0 || age > life) continue;
    const k = 1 - age / life, x = TX + B.range(-19, 19) + Math.sin(age * 5 + B.range(0, 6)) * 2;
    const y = -5 - B.range(2, 26) - age * B.range(8, 22);
    firePuff(p, x, y, k, B.range(2.0, 3.8), B.next(), H, 0.055, 0, -1);
  }

  // the tongues: a wide black heart inside a thin red rim, noisy edges, a tip that tears upward
  p.ellipse(TX, -7, 18 * grow, 8 * grow, C[0], 0.5 * live);
  p.disc(TX, -17, 13 * grow, C[0], 0.32 * live);
  for (let i = 0; i < TONGUES.length; i++) {
    const T = TONGUES[i], sway = Math.sin(t * 6.2 + T.ph) * T.sw;
    const hh = T.h * grow * (0.9 + 0.1 * N(t, 8, S + i));
    const x = TX + T.dx + sway * 1.4;
    flameTongue(p, x, -3, hh, T.w * (0.88 + 0.12 * grow), sway * 0.8, N, S + i * 31, H, BLACK_LAYERS, 0.7, 1.5);
    // a few orange cracks at the base keep the black silhouette from going flat
    for (let j = 0; j < 3; j++) {
      const q = rng(S, i * 5 + j, 73);
      p.dot(x + q.range(-T.w * 0.4, T.w * 0.4), -4 - q.range(0, 8), q.chance(0.35) ? C[7] : C[6], 0.55 * live);
    }
  }

  // a few hot shards thrown out at the edges, in front of the black tongues: this is the only place the
  // orange/red heat is allowed to sit in front, and it keeps the smoke from reading as a flat black blot
  for (let i = 0; i < 6; i++) {
    const B = rng(S, i, 79), age = t - IGNITE - B.range(0.12, 1.85);
    if (age < 0 || age > 0.44) continue;
    const k = 1 - age / 0.44, x = TX + (i % 2 ? 1 : -1) * B.range(8, 25);
    const y = -6 - B.range(0, 17) - age * B.range(7, 16);
    firePuff(p, x, y, k, B.range(1.8, 3.2), B.next(), H, 0.055, 0, -1);
  }

  p.glow(TX, -10, 32 * grow, C[6], 0.2 * live);
  // the ground line of the burn: a low red seam under the black
  p.ellipse(TX, -4, 16 * grow, 1.7, C[5], 0.4 * live);
  p.ellipse(TX, -4, 9 * grow, 0.9, C[6], 0.3 * live);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const focus = smooth(0.08, 0.35, t) * (1 - smooth(2.6, 3.0, t));
  const grow = smooth(IGNITE, 0.94, t);
  const live = smooth(IGNITE, 0.7, t) * (1 - smooth(2.86, 3.34, t));

  // the eye catches: a crimson iris on the caster, a pinprick on the target
  if (focus > 0.01) {
    const e = focus * (0.7 + 0.3 * Math.sin(t * 16));
    p.circle(4, -34, 2.2, C[6], 0.95 * e);
    p.dot(4, -34, C[0], 1);
    p.dot(4, -35, WHITE, 0.85 * e);
    p.dot(3, -34, C[7], 0.6 * e);
    p.glow(4, -34, 13, C[5], 0.3 * e);
    p.line(4, -31, 4, -27, C[1], 0.35 * e);
    if (t < IGNITE) {
      const q = smooth(0.2, IGNITE, t);
      p.circle(TX, TY, 1 + 2.4 * q, q > 0.7 ? WHITE : C[6], 0.9 * q);
      p.ellipse(TX, TY, 3 + 7 * q, 3 + 7 * q, C[4], 0.22 * q);
      p.glow(TX, TY, 16 + 16 * q, C[5], 0.25 * q);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t * 1.4;
        p.dot(TX + Math.cos(a) * (5 + 8 * q), TY + Math.sin(a) * (5 + 8 * q), C[5], 0.4 * q);
      }
    }
  }

  // ignition: a white heart, a red ring, a black bloom
  if (t > IGNITE - 0.02 && t < IGNITE + 0.35) {
    const q = clamp((t - (IGNITE - 0.02)) / 0.3), f = 1 - q;
    p.circle(TX, TY, 2 + 12 * ease.outQuad(q), WHITE, 0.95 * f);
    p.glow(TX, TY, 60, C[6], 0.4 * f);
    p.ellipse(TX, TY, 8 + 26 * q, 8 + 26 * q, C[6], 0.25 * f);
    sparkle(p, TX, TY, 10 * f + 4, C[7], C[5], 0.8 * f);
  }

  if (live > 0.01) blackFlame(p, C, t, S, grow, live);

  // embers and ash: the burn outlives the shape
  if (t > 0.7) {
    const settle = 1 - smooth(2.9, END, t);
    for (let i = 0; i < 20; i++) {
      const B = rng(S, i, 11), born = 0.78 + B.range(0, 1.7), life = 0.9 + B.next() * 1.1, age = t - born;
      if (age < 0 || age > life) continue;
      const k = 1 - age / life, x = TX + B.range(-18, 18) + B.range(-12, 12) * age;
      const y = -8 - B.range(4, 30) - B.range(16, 48) * age;
      if (y < -136) continue;
      ember(p, x, y, k, B.chance(0.25) ? 2 : 1, [C[7], C[6], C[5], C[4]], age * 40 + i);
    }
    for (let i = 0; i < 9; i++) {
      const B = rng(S, i, 13), age = t - 0.9 - B.range(0, 1.3);
      if (age < 0) continue;
      const x = TX + B.range(-17, 17) + B.range(-6, 6) * age;
      const y = -18 + B.range(0, 26) * age;
      if (y > -1) continue;
      p.rect(x, y, 1, 1, i % 3 ? C[2] : C[4], 0.4 * settle);
    }
    for (let i = 0; i < 3; i++) {
      const B = rng(S, i, 17), q = clamp((t - 0.9) / 1.8);
      p.disc(TX + B.range(-18, 18), -3 - q * 4, 5 + q * 7, C[1], 0.11 * settle * (1 - q));
    }
  }

  // the target is pinned by the first bloom: a flat red shock ring
  if (t >= HIT && t < HIT + 0.5) {
    const q = (t - HIT) / 0.5, f = 1 - q;
    band(p, TX, 0, 10 + q * 32, 0.22, 1.6, 0.24 * f, C, undefined, q < 0.1);
    p.ellipse(TX, 0, 12 + q * 30, 2.2, C[5], 0.35 * f);
    const A = rng(S, 23, 19);
    for (let i = 0; i < 9; i++) {
      const a = A.range(0, TAU), sp = A.range(30, 110), age = (t - HIT) * A.range(0.5, 1.2);
      const [x, y] = fly(TX, -18, Math.cos(a) * sp, Math.sin(a) * sp - 24, age, 200, 0.6);
      if (y > -1) continue;
      p.dot(x, y, i % 3 ? C[5] : WHITE, 0.6 * f);
    }
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8);
  const fade = 1 - smooth(2.8, END, t);
  // a black burn with a red seam, still visible after the fire sinks
  if (t > HIT - 0.15) {
    const q = smooth(HIT - 0.15, HIT + 0.4, t);
    p.ellipse(TX, 0, 12 + 9 * q, 3.2, C[0], 0.7 * fade);
    p.ellipse(TX, 0, 9 + 7 * q, 2.0, C[1], 0.5 * fade);
    p.ellipse(TX, 0, 11 + 8 * q, 1.1, C[5], 0.3 * fade);
    const R = rng(o.seed, 3, 23);
    for (let i = 0; i < 4; i++) {
      let x = TX - 10 + i * 7, y = -1;
      p.line(x, y, x + R.range(-5, 5), y - R.range(0.5, 2), C[0], 0.45 * fade);
    }
  }
  // a second, smaller burn under the caster's eye-line
  if (t > 0.5) {
    const q = smooth(0.5, 0.9, t);
    p.ellipse(4, 0, 4 + 3 * q, 1.2, C[1], 0.25 * fade);
  }
}
