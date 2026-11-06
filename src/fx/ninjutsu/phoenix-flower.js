// Fire release: phoenix flower. One breath splits into a fan of six fire orbs that arc out, each with its own
// trail and floor burn; the middle orb catches the target. Pure analytic paths, no particle state.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, band, burst, fly, fbm, READY } from "../../core/index.js";
import { PAL } from "../../core/color.js";

const RELEASE = 0.56, HIT = 0.86, END = 2.6;
const MX = 14, MY = -28, TX = 220;

export const meta = {
  name: "Phoenix flower",
  desc: "A breath of fire splits into a fan of six phoenix-fire orbs that arc across the floor and burst one after another, leaving small burns and a scatter of embers.",
  tags: ["chakra", "ninjutsu", "fire", "phoenix", "fan", "technique", "one-shot"],
  size: [380, 180],
  origin: [72, 150],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: PAL.fire, seed: 21 },
};

const INHALE = { ...READY, x: -3, crouch: 6, lean: -5, turn: 1, fx: 7, fy: -30, bx: 8, by: -22, ffx: 6, fbx: -6 };
const BREATH = { ...READY, x: 2, crouch: 5, lean: 7, turn: 1, fx: 12, fy: -28, bx: -7, by: -20, ffx: 12, fbx: -9, toeB: true };
const RECOIL = { ...READY, x: 5, crouch: 4, lean: 3, fx: 10, fy: -24, bx: 8, by: -20 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, { ...READY, x: -3 }],
    [0.1, INHALE],
    [0.48, { ...INHALE, crouch: 8, lean: -7, fx: 5 }],
    [RELEASE, { ...BREATH, crouch: 5, lean: 8 }, "snap"],
    [HIT - 0.04, { ...BREATH, crouch: 4, lean: 6 }],
    [HIT, { ...BREATH, crouch: 5, lean: 3 }, "snap"],
    [HIT + 0.6, RECOIL],
    [1.9, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.12, shake: 0.35, amp: 2, target: true }],
  dust: [{ t: RELEASE, x: 9, n: 5, dir: 1 }, { t: HIT, x: TX, n: 6, dir: -1 }],
};

// six orbs: fan across the floor, the middle one aimed at the target's chest
const ORBS = Array.from({ length: 6 }, (_, i) => {
  const tx = 140 + i * 20;
  return {
    tx,
    ty: i === 4 ? -30 : -2 - (i % 3) * 5,
    arrive: 0.72 + i * 0.035,
    seed: 21 + i * 7,
    r: 4.8 + (i % 2) * 1.2,
  };
});

const orbAt = (o, t) => {
  const q = smooth(RELEASE + (o.seed % 5) * 0.008, o.arrive, t);
  const arc = Math.sin(Math.PI * q) * (14 + (o.seed % 7) * 1.5);
  return [MX + (o.tx - MX) * q, MY + (o.ty - MY) * q - arc, q];
};

function fireBall(p, C, x, y, r, t, seed) {
  const R = Math.max(2, r);
  for (let py = Math.floor(y - R - 2); py <= Math.ceil(y + R + 2); py++)
    for (let px = Math.floor(x - R - 2); px <= Math.ceil(x + R + 2); px++) {
      const dx = (px + 0.5 - x) / R, dy = (py + 0.5 - y) / R, d = Math.hypot(dx, dy);
      if (d > 0.98 + 0.07 * Math.sin((px + py) * 0.65 + t * 22)) continue;
      const n = fbm(dx * 2.4 + seed * 0.13, dy * 2.4 + t * 3.4, seed, 3);
      let v = 1.05 - d * 0.8 + n * 0.36;
      if (d < 0.34) v += 0.38;
      if (v > 0.96) p.px(px, py, WHITE);
      else if (v > 0.82) p.px(px, py, C[7]);
      else if (v > 0.64) p.px(px, py, C[6]);
      else if (v > 0.46) p.px(px, py, C[5]);
      else if (v > 0.3) p.px(px, py, C[4]);
      else if (v > 0.16) p.px(px, py, C[3]);
      else p.dot(px, py, C[2], 0.85);
    }
  p.glow(x, y, R * 3.2, C[4], 0.3);
  p.glow(x, y, R * 1.2, C[6], 0.2);
}

function impact(p, C, t, o, q, S) {
  const age = t - o.arrive;
  if (age < 0 || age > 0.65) return;
  const k = 1 - age / 0.65, R = o.seed;
  if (age < 0.1) {
    const f = 1 - age / 0.1;
    p.circle(o.tx, o.ty, 3 + 11 * ease.outQuad(age / 0.1), WHITE, f);
    sparkle(p, o.tx, o.ty, 10 * f + 3, C[6], C[4], 0.7 * f);
    p.glow(o.tx, o.ty, 30, C[5], 0.3 * f);
  }
  const A = rng(S, o.seed, 5);
  for (let i = 0; i < 8; i++) {
    const a = A.range(0, TAU), sp = A.range(14, 60), life = A.range(0.25, 0.7), at = age - A.range(0, 0.04);
    if (at < 0 || at > life) continue;
    const [x, y] = fly(o.tx, o.ty, Math.cos(a) * sp, Math.sin(a) * sp - 18, at, 120, 1.0);
    if (y > -0.5) continue;
    p.dot(x, y, at < 0.06 ? WHITE : A.chance(0.4) ? C[6] : C[5], 0.8 * (1 - at / life));
  }
  for (let i = 0; i < 3; i++) {
    const A2 = rng(S, o.seed + i, 7), q2 = clamp(age / 0.55);
    p.disc(o.tx + A2.range(-6, 6) + q2 * A2.range(-8, 8), o.ty - 3 - q2 * 8, 2 + i + q2 * 5, C[3], 0.12 * k);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const charge = smooth(0.03, 0.3, t) * (1 - smooth(0.5, 0.62, t));
  const live = 1 - smooth(2.0, 2.55, t);

  // the inhale: embers and air pulled into the mouth, a hot point at the lips
  if (charge > 0.01) {
    const R = rng(S, Math.floor(t * 20), 1);
    for (let i = 0; i < 18; i++) {
      const a = R.range(0, TAU), d = 8 + R.range(0, 26) * (1 - clamp(t / 0.5));
      const px = MX + Math.cos(a) * d, py = MY + Math.sin(a) * d * 0.85;
      if (py > -1) continue;
      p.dot(px, py, i % 4 ? C[5] : C[6], 0.45 * charge);
    }
    p.circle(MX, MY, 1.6 + 0.4 * Math.sin(t * 40), WHITE, charge);
    p.glow(MX, MY, 16, C[5], 0.25 * charge);
  }

  // the fan: each orb flies its own arc, trailing two dim copies and a few sparks
  if (t > RELEASE - 0.02) {
    for (const orb of ORBS) {
      if (t < RELEASE || t > orb.arrive) continue;
      const [x, y, q] = orbAt(orb, t);
      const r = orb.r + 1.3 * q;
      const R = rng(S, orb.seed, Math.floor(t * 24));
      for (let k = 1; k <= 2; k++) {
        const [tx, ty] = orbAt(orb, Math.max(RELEASE, t - k * 0.035));
        p.circle(tx, ty, r * (0.7 - k * 0.18), k === 1 ? C[4] : C[3], 0.35);
      }
      fireBall(p, C, x, y, r, t, orb.seed);
      for (let i = 0; i < 3; i++) {
        const a = R.range(0, TAU), d = R.range(r + 2, r + 10);
        p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, R.chance(0.4) ? WHITE : C[6], 0.5);
      }
      impact(p, C, t, orb, 0, S);
    }
  }

  // the target takes the middle orb: a short white flash and a pushed-back ring
  if (t >= HIT && t < HIT + 0.5) {
    const q = (t - HIT) / 0.5, f = 1 - q;
    p.circle(TX, -30, 5 + 14 * ease.outQuad(q), WHITE, 0.85 * f);
    sparkle(p, TX, -30, 14 * f + 4, C[6], C[4], 0.75 * f);
    p.glow(TX, -30, 44, C[5], 0.4 * f);
    band(p, TX, 0, 12 + q * 34, 0.22, 1.6, 0.35 * f, C, undefined, q < 0.12);
  }

  // embers and thin smoke after the last orb
  if (t > 1.0 && live > 0.01) {
    const R = rng(S, Math.floor(t * 12), 13);
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 17), age = t - 1.0 - B.range(0, 0.8);
      if (age < 0) continue;
      const [x, y] = fly(ORBS[i % 6].tx, -2, B.range(-8, 8), B.range(-16, -4), age, 60, 0.2);
      if (y > -1) continue;
      p.dot(x, y, age < 0.1 ? WHITE : B.chance(0.4) ? C[6] : C[5], 0.5 * live * (1 - clamp(age / 1.2)));
    }
    for (let i = 0; i < 4; i++) {
      const B = rng(S, i, 23), q = clamp((t - 1.0) / 1.4);
      p.disc(ORBS[(i * 2 + 1) % 6].tx + B.range(-8, 8), -8 - q * (8 + B.range(0, 8)), 4 + B.range(1, 3) + q * 5, C[2], 0.1 * live * (1 - q));
    }
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8);
  for (let i = 0; i < ORBS.length; i++) {
    const orb = ORBS[i], age = t - orb.arrive;
    if (age < 0) continue;
    const fade = 1 - smooth(1.6, END, t);
    p.disc(orb.tx, -1, 4 + 3 * smooth(0, 0.4, age), C[1], 0.45 * fade);
    p.ring(orb.tx, -1, 5 + 2 * smooth(0, 0.4, age), 1, C[4], 0.22 * fade);
  }
  if (t > HIT) {
    const fade = 1 - smooth(1.8, END, t);
    p.disc(TX, -1, 8 + 4 * smooth(0, 0.3, t - HIT), C[1], 0.55 * fade);
    p.ring(TX, -1, 9 + 3 * smooth(0, 0.4, t - HIT), 1, C[4], 0.3 * fade);
  }
}
