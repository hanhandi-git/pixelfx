// 天照命 · 八咫镜: the sun goddess lifts the Yata mirror, and the mirror answers with the sun. Light gathers
// in the disc, a shrine seal writes itself under the target, then the sun opens overhead: a fan of hard rays,
// a pillar of gold down onto the field, embers and a floor that keeps glowing after the light pulls back.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { floorLight, hotStar } from "../dragonball/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { SUN, GOLD, GOLD_HOT, floorSeal, rayFan, sunDisc } from "./_lib.js";

const END = 3.35, RELEASE = 0.88, HIT = 1.02;
const TX = 182, TY = -34, SUNY = -128;

export const meta = {
  name: "Amaterasu, sun mirror",
  desc: "The sun goddess lifts the Yata mirror; light gathers in the disc, a shrine seal opens under the target and the sun answers with hard rays, a gold pillar and a glowing floor.",
  tags: ["kami", "japan", "shinto", "sun", "mirror", "amaterasu", "天照命", "天照大神", "八咫镜", "technique", "one-shot"],
  size: [340, 230],
  origin: [104, 202],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SUN, seed: 21 },
};

const GUARD = { ...READY, weapon: "yata-mirror", x: -2, sa: -0.5, fx: 8, fy: -23, bx: 5, by: -22, ffx: 6, fbx: -7 };
const LIFT = { ...GUARD, x: 0, crouch: 2, lean: -3, turn: 0.36, fx: 4, fy: -35, bx: -7, by: -26, sa: -1.18, ffx: 5, fbx: -8 };
const OPEN = { ...GUARD, x: 2, crouch: 3, lean: 4, turn: 0.02, fx: 13, fy: -31, bx: -5, by: -22, sa: -0.42, ffx: 10, fbx: -9 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, GUARD],
    [0.1, LIFT],
    [0.6, { ...LIFT, fy: -37, sa: -1.3 }],
    [RELEASE, { ...OPEN, ghost: 1 }],
    [HIT, { ...OPEN, x: 3, fy: -30, sa: -0.3 }, "snap"],
    [1.5, { ...OPEN, x: 3, crouch: 2, lean: 2, fy: -30, sa: -0.24 }],
    [2.3, GUARD],
    [3.15, GUARD],
  ],
  hits: [{ t: HIT, stop: 0.18, shake: 0.35, amp: 3, push: 2.2, straw: 18, skin: "holy" }],
  dust: [{ t: HIT, x: TX, n: 8, dir: -1, c: "#fff0b4" }],
};

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END;
  // a low gold haze behind the caster and target, so the light has somewhere to sit
  const haze = smooth(0.1, 0.8, t) * (1 - smooth(2.7, 3.3, t));
  if (haze > 0.02) {
    p.glow(TX - 10, -142, 40, C[3], 0.07 * haze);
    p.glow(TX + 16, -154, 32, C[4], 0.05 * haze);
    for (let i = 0; i < 5; i++) {
      const B = rng(o.seed, i, 3);
      p.glow(TX - 50 + B.range(0, 100), -140 + B.range(-14, 30), 18 + B.range(0, 12), C[2], 0.05 * haze);
    }
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, ph = t / END;
  const R = rng(S, Math.floor(t * 30), 5);
  const fade = 1 - smooth(2.75, 3.3, t);
  const charge = smooth(0.04, RELEASE, t) * (1 - smooth(RELEASE + 0.05, RELEASE + 0.3, t));
  const open = smooth(RELEASE, HIT, t) * fade;
  const pulse = smooth(1.42, 1.62, t) * (1 - smooth(1.8, 2.3, t));

  // the shrine seal under the target, gold, turning
  const sealK = smooth(0.18, 0.7, t) * (1 - smooth(2.6, 3.25, t));
  if (sealK > 0.02) {
    floorSeal(p, C, TX, -1, 27 + 2 * Math.sin(t * 3), t * (0.7 + 1.6 * open), 0.55 * sealK, { sq: 0.22, n: 24, core: 0.4 + 0.6 * open, pool: true });
    p.ellipse(TX, -1, 16, 3, C[4], 0.2 * sealK);
    floorLight(p, TX, C, 0.24 * sealK, 28);
  }

  // the mirror eats the light: a white point at the disc, gold rings folding inward
  const hand = [7, -36];
  if (charge > 0.02) {
    const g = charge;
    p.circle(hand[0], hand[1], 2 + 2.4 * g, g > 0.72 ? WHITE : C[6], 0.95 * g);
    p.glow(hand[0], hand[1], 26 * g + 8, C[4], 0.2 * g);
    p.glow(hand[0], hand[1], 12 * g + 4, C[5], 0.22 * g);
    p.glow(hand[0], hand[1], 4, WHITE, 0.24 * g);
    p.glowRing(hand[0], hand[1], 8 + 8 * (1 - g), 5, C[5], 0.1 * g);
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 7), a = B.range(0, TAU) + t * 2.4, d = 10 + B.range(0, 26) * (1 - g * 0.55);
      const x = hand[0] + Math.cos(a) * d, y = hand[1] + Math.sin(a) * d * 0.9;
      p.dot(x, y, i % 3 ? C[4] : C[6], 0.55 * g);
      if (i % 4 === 0) p.line(x, y, x + Math.cos(a) * 4, y + Math.sin(a) * 4, C[3], 0.4 * g);
    }
  }

  // the sun opens above the field: a white heart, gold body, hard corona, then the ray fan
  const sunK = smooth(0.45, 1.0, t) * fade;
  if (sunK > 0.02) {
    const r = 4 + 9 * ease.outCubic(clamp((t - 0.45) / 0.7)) + Math.sin(t * 2.2) * 0.6;
    sunDisc(p, TX, SUNY, r, C, sunK, t);
    rayFan(p, C, TX, SUNY, r + 3, r + 22 + pulse * 12, 16, t * 0.28, 0.85 * sunK, { wide: 0.3, longEvery: 2 });
    rayFan(p, C, TX, SUNY, r + 2, r + 14, 16, t * 0.28 + TAU / 32, 0.6 * sunK, { wide: 0.2, longEvery: 3, hot: 6 });
  }

  // the pillar: a wide gold cone and a white thread from the sun to the target's chest
  if (open > 0.01) {
    const w = 1 + 4 * open;
    p.poly([[TX - 5, SUNY + 12], [TX + 5, SUNY + 12], [TX + 24, TY - 2], [TX - 24, TY - 2]], C[4], 0.18 * open);
    p.poly([[TX - 2, SUNY + 12], [TX + 2, SUNY + 12], [TX + 10, TY - 2], [TX - 10, TY - 2]], C[5], 0.3 * open);
    p.beam(TX, SUNY + 10, TX, TY, w, WHITE, 0.55 * open);
    p.glowLine(TX, SUNY + 10, TX, TY, 12, C[4], 0.07 * open);
    for (let i = 0; i < 7; i++) {
      const B = rng(S, i, 11), u = (i / 7 + t * 0.7) % 1;
      const y = SUNY + 12 + (TY - SUNY - 12) * u;
      const x = TX + Math.sin(u * 7 + i) * (6 + 14 * u);
      p.dot(x, y, i % 3 ? C[5] : WHITE, 0.6 * open);
    }
  }

  // contact: a white heart on the chest, a gold ring on the floor and embers thrown out
  if (t >= HIT && t < HIT + 0.8) {
    const q = (t - HIT) / 0.8, f = 1 - q;
    p.circle(TX, TY, 3 + 14 * ease.outQuad(q), WHITE, 0.95 * f);
    hotStar(p, TX, TY, 15 * f + 4, t * 1.4, C, 0.75 * f);
    sparkle(p, TX, TY, 16 * f + 4, C[6], C[4], 0.85 * f);
    p.ellipse(TX, -1, 15 + q * 26, 3.4 + q * 2, C[5], 0.26 * f);
    p.ellipse(TX, -1, 10 + q * 18, 2.2 + q * 1.4, WHITE, 0.2 * f);
    pool(p, TX, 0, 30, 6, C[4], 0.34 * f);
    p.glow(TX, TY, 36, C[4], 0.22 * f);
    p.glow(TX, TY, 14, WHITE, 0.24 * f);
    for (let i = 0; i < 20; i++) {
      const B = rng(S, i, 13), a = B.range(-Math.PI, 0.15), sp = B.range(26, 92);
      const d = q * sp, x = Math.min(222, TX + Math.cos(a) * d), y = TY + Math.sin(a) * d + q * q * 24;
      p.dot(x, Math.min(2, y), i % 4 ? C[5] : WHITE, 0.85 * f);
      if (i % 5 === 0) p.glow(x, Math.min(2, y), 4, C[4], 0.1 * f);
    }
  }

  // the second beat: the sun breathes and the rays reach further
  if (pulse > 0.02) {
    p.glow(TX, SUNY, 60, C[4], 0.14 * pulse);
    p.glow(TX, SUNY, 22, C[5], 0.16 * pulse);
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 17), a = (i / 10) * TAU + t * 0.4;
      const d = 30 + B.range(0, 16);
      p.dot(TX + Math.cos(a) * d, SUNY + Math.sin(a) * d, i % 2 ? WHITE : C[6], 0.7 * pulse);
    }
  }

  // falling gold motes and a warm floor that stays lit after the disc closes
  const after = smooth(HIT, HIT + 0.2, t) * (1 - smooth(2.55, 3.3, t));
  if (after > 0.01) {
    for (let i = 0; i < 16; i++) {
      const B = rng(S, i, 19), born = HIT + B.range(0, 1.2), age = t - born;
      if (age < 0) continue;
      const q = age / 1.5;
      if (q > 1) continue;
      const x = TX + B.range(-50, 50) + Math.sin(age * 2 + i) * 3;
      const y = TY - 30 + q * 60 + B.range(-20, 30);
      p.dot(x, y, q > 0.6 ? C[3] : i % 3 ? C[5] : WHITE, (1 - q) * 0.7 * after);
    }
    p.glow(TX, -1, 34, C[4], 0.13 * after);
    floorLight(p, TX, C, 0.2 * after, 26);
    for (let i = 0; i < 6; i++) {
      const B = rng(S, i, 23);
      p.dot(TX + B.range(-24, 24), -1 + B.range(0, 1), C[6], 0.4 * after);
    }
  }

  // the seal's last turn and a slow ember column at the caster's feet
  const ember = smooth(0.3, 0.8, t) * (1 - smooth(2.5, 3.2, t));
  if (ember > 0.01) {
    for (let i = 0; i < 6; i++) {
      const B = rng(S, i, 29), y = -4 - ((t * 16 + B.range(0, 40)) % 46);
      p.dot(4 + B.range(-10, 12), y, i % 2 ? C[4] : C[6], 0.5 * ember * (1 - (y + 50) / 60));
      p.dot(2 + B.range(-12, 8), y - 2, GOLD, 0.3 * ember);
    }
  }
}
