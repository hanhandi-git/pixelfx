// 辟邪神雷: the thunder bamboo answers. A violet-gold seal opens under the target, the sky darkens, phantom
// thunder bamboo rises behind it, and a white-gold pillar of divine thunder falls through the stalks and
// breaks on the ground — forked gold arcs, a torn floor and a long glittering afterglow.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks } from "../dragonball/_lib.js";
import { crackle, stroke, zigzag } from "../lightning/_lib.js";
import { GOLD_THUNDER, WARD_VIOLET, runeSeal } from "./_lib.js";
import { glint, pool } from "../pickups/_lib.js";

const END = 3.05;
const CHARGE = 0.86, HIT = 1.02;
const TX = 252, TY = -30, TOP = -252;

export const meta = {
  name: "Evil-warding thunder",
  desc: "A violet-gold seal opens under the target, phantom thunder bamboo rises, and a white-gold pillar of divine thunder falls through it: forked arcs, torn floor, glittering afterglow.",
  tags: ["xianxia", "fanren", "lightning", "thunder", "divine-thunder", "bamboo", "talisman", "辟邪神雷", "technique", "one-shot"],
  size: [460, 308],
  origin: [104, 280],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: GOLD_THUNDER, ward: WARD_VIOLET, seed: 83 },
};

const LIFT = { ...READY, x: -1, crouch: 2, lean: -2, turn: 0.3, fx: 7, fy: -35, bx: -5, by: -22, ffx: 5 };
const PULL = { ...LIFT, x: -2, crouch: 4, lean: -4, fx: 4, fy: -37, bx: -6, by: -21 };
const CAST = { ...READY, x: 1, crouch: 4, lean: 5, turn: 0.06, fx: 15, fy: -30, bx: -1, by: -18, ffx: 9 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, READY],
    [0.12, LIFT],
    [0.72, PULL],
    [HIT, CAST, "snap"],
    [1.32, { ...CAST, crouch: 5, lean: 7, fx: 17, fy: -28 }],
    [2.1, { ...CAST, crouch: 3, lean: 3, fx: 12, fy: -26 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.2, shake: 0.55, amp: 4, push: 2.4, straw: 26, skin: "shock" }],
  dust: [{ t: HIT, x: TX, n: 9, dir: -1, c: "#ffe08a" }],
};

/** The two phantom thunder-bamboo stalks behind the target: segmented stems with lit nodes and a crown of leaves. */
function bamboo(p, C, x, y0, y1, lean, k, t, S) {
  if (k <= 0.02) return;
  const steps = Math.floor((y1 - y0) / 5);
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, y = y0 + (y1 - y0) * u;
    const xx = x + lean * (1 - u) * (1 - u) * 6;
    const w = i % 2 ? 1 : 0;
    p.dot(xx - 1, y, C[2], 0.55 * k);
    p.dot(xx, y, C[3], 0.8 * k);
    p.dot(xx + 1, y, C[2], 0.5 * k);
    if (w) p.dot(xx + 2, y, C[1], 0.4 * k);
  }
  // nodes: tight rings, and a pulse of light climbing the stalk like the crystal's cracks
  const climb = (t * 0.55) % 1.15 - 0.05;
  for (let y = y0 + 18; y < y1; y += 30) {
    const u = (y - y0) / (y1 - y0), xx = x + lean * (1 - u) * (1 - u) * 6;
    const near = Math.exp(-(((u - climb) / 0.11) ** 2));
    const glow = 0.25 + 0.85 * near + 0.1 * Math.sin(t * 5 + y * 0.1 + S);
    p.ellipse(xx, y, 4.5, 1.5, C[4], 0.45 * k * glow);
    p.dot(xx - 3, y, C[5], 0.8 * k);
    p.dot(xx + 3, y, C[5], 0.8 * k);
    p.dot(xx, y - 1, near > 0.4 ? WHITE : C[6], 0.5 * k * Math.min(1, glow));
    p.glow(xx, y, 5 + 7 * near, C[5], 0.08 * k * glow);
    if (near > 0.45) glint(p, xx, y, Math.round(1 + 2 * near), C[6], 0.18 * k * near);
  }
  // leaf crown, drawn as short gold-green blades
  for (let i = 0; i < 3; i++) {
    const a = -2.5 + i * 0.9, l = 8 + i * 3;
    for (let d = 0; d < l; d += 2) p.dot(x + Math.cos(a) * d, y0 + Math.sin(a) * d, i % 2 ? C[3] : C[2], (1 - d / l) * 0.7 * k);
  }
  p.glow(x, (y0 + y1) / 2, 14, C[3], 0.12 * k);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), V = fit(o.ward ?? WARD_VIOLET, 8), S = o.seed;
  const R = rng(S, Math.floor(t * 30), 5);
  const rise = smooth(0.02, 0.55, t) * (1 - smooth(2.55, 3.02, t));
  const charge = smooth(0.08, CHARGE, t) * (1 - smooth(HIT, HIT + 0.2, t));
  const hit = t >= HIT ? 1 - smooth(1.5, 2.9, t) : 0;
  const after = smooth(HIT, HIT + 0.1, t) * (1 - smooth(2.3, 2.95, t));

  // the sky sinks and turns violet; a low cloud disc sits over the field
  if (rise > 0.01) {
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 3);
      const x = TX - 110 + B.range(0, 170), y = TOP + 20 + B.range(0, 30), r = 22 + B.range(0, 20);
      p.disc(x, y, r, V[1], 0.35 * rise);
      p.disc(x - 3, y - 4, r * 0.6, V[2], 0.22 * rise);
    }
    p.glow(TX, TOP + 46, 100, V[3], 0.12 * rise);
  }

  // the phantom bamboo, behind everything, brightening as the charge climbs
  bamboo(p, C, TX - 21, TOP + 34, -54, 1, 0.42 * rise, t, S);
  bamboo(p, C, TX + 17, TOP + 54, -44, -1, 0.5 * rise, t, S + 4);

  // the floor seal writes itself, then spins faster
  const sealK = smooth(0.1, 0.55, t) * (1 - smooth(2.45, 2.95, t));
  if (sealK > 0.01) {
    runeSeal(p, TX, -1, 25 + 2 * Math.sin(t * 5), t * (1.4 + 2.4 * charge), V, 0.5 * sealK, { sq: 0.2, n: 28, tick: 3, core: charge });
    p.ellipse(TX, -1, 16, 3.2, V[4], 0.24 * sealK);
    pool(p, TX, 0, 30, 5.5, V[4], 0.28 * sealK);
    p.glow(TX, -10, 24, V[4], 0.1 * sealK);
  }

  // arcs gather from the air and the caster's palm; the charge is gold, the pressure violet
  if (charge > 0.02) {
    const hand = [10, -35];
    p.circle(hand[0], hand[1], 2 + 2.5 * charge, charge > 0.7 ? WHITE : C[6], 0.9 * charge);
    p.glow(hand[0], hand[1], 30, C[3], 0.08 * charge);
    p.glow(hand[0], hand[1], 16, C[5], 0.2 * charge);
    p.glow(hand[0], hand[1], 5, C[6], 0.22 * charge);
    p.glowRing(hand[0], hand[1], 8, 6, C[5], 0.1 * charge);
    for (let i = 0; i < 3; i++) {
      const b = zigzag(R, hand[0], hand[1], hand[0] + R.range(-8, 10), TOP + 40 + R.range(0, 60), 0.32, 0.1, 0.5, 1);
      stroke(p, b, 0.25 * charge * (0.5 + 0.5 * Math.sin(t * 17 + i)), C, 0.7, { light: 0.3 });
    }
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 7), a = B.range(0, TAU) + t * R.range(0.6, 2);
      const d = 8 + B.range(0, 14) * (1 - charge * 0.4);
      p.dot(hand[0] + Math.cos(a) * d, hand[1] + Math.sin(a) * d * 0.9, i % 3 ? C[4] : C[6], 0.5 * charge);
    }
  }

  // the strike: a stepped leader feels down, then the pillar opens
  const leader = t < HIT ? smooth(CHARGE, HIT, t) * 0.4 : 0;
  if (leader > 0.01) {
    const b = zigzag(R, TX + 4, TOP + 34, TX, TY - 6, 0.14, 0.14, 1, 0);
    stroke(p, b, leader, C, 0.9, { light: 0.3 });
  }
  if (t >= HIT) {
    // the white hero frame is brief; the pillar fades straight after it so the gold steps read through
    const k = 1 - smooth(1.15, 1.75, t), hero = 1 - smooth(HIT, HIT + 0.09, t);
    if (k > 0.02) {
      const b = zigzag(R, TX + 2, TOP + 30, TX, TY - 2, 0.12, 0.2, 1.8, 0);
      stroke(p, b, k, C, 2.4 + hero * 1.4, { hero: hero > 0.4, light: 0.42, core: 1.5 + hero });
      crackle(p, b, k * 0.85, C, 0.4);
      for (let j = 0; j < 8; j++) {
        const y0 = TOP + 48 + j * 26;
        const bb = zigzag(R, TX, y0, TX + R.range(-42, 42), y0 + R.range(18, 52), 0.24, 0.12, 0.55, 1);
        stroke(p, bb, k * (0.4 + 0.4 * (1 - j / 8)), C, 1.2, { light: 0.3, core: 1.0 });
        // violet repulsion forks ride the gold
        if (j % 2 === 0) {
          const v = zigzag(R, TX, y0 + 8, TX + R.range(-58, 58), y0 + R.range(26, 60), 0.3, 0, 0.4, 1);
          stroke(p, v, k * 0.45, V, 0.9, { light: 0.25 });
        }
      }
      p.glowLine(TX + 2, TOP + 30, TX, TY, 11, C[3], 0.06 * k);
      p.glow(TX, -120, 60, C[3], 0.06 * k);
      p.glow(TX, -90, 24, C[5], 0.08 * k);
    }
  }

  // contact: a white core, a ground ring, gold embers and the cracked floor
  if (t >= HIT && t < HIT + 0.6) {
    const q = (t - HIT) / 0.6, f = 1 - q;
    p.circle(TX, TY, 4 + 16 * ease.outQuad(q), WHITE, 0.95 * f);
    p.glow(TX, TY, 42, C[6], 0.22 * f);
    p.glow(TX, TY, 16, WHITE, 0.18 * f);
    glint(p, TX, TY, Math.round(4 + 8 * f), WHITE, 0.3 * f);
    pool(p, TX, 0, 48, 9, C[4], 0.42 * f);
    p.glow(TX, -1, 40, C[5], 0.18 * f);
    sparkle(p, TX, TY, 20 * f + 5, C[6], C[4], 0.85 * f);
    sparkle(p, TX, TY, 12 * f + 3, WHITE, C[6], 0.6 * f);
    for (let i = 0; i < 24; i++) {
      const B = rng(S, i, 11), a = B.range(-Math.PI, 0) + (i % 2 ? 0.4 : -0.4), sp = B.range(22, 96);
      const d = q * sp, px = TX + Math.cos(a) * d, py = TY + Math.sin(a) * d + q * q * 16;
      p.dot(px, py, i % 3 ? C[5] : WHITE, f * 0.9);
    }
    // shock ring on the floor
    p.ellipse(TX, -1, 18 + q * 54, 4 + q * 3, C[5], 0.22 * f);
    p.ellipse(TX, -1, 12 + q * 38, 2.6 + q * 2, C[6], 0.2 * f);
  }

  // the floor is torn: gold seams cool to violet soot
  const crackK = smooth(HIT - 0.02, HIT + 0.08, t) * (1 - smooth(2.35, 2.95, t));
  if (crackK > 0.02) {
    const cracks = crackFan(S + 31, 9, 58, 1.1, 8);
    const hot = t < HIT + 0.5 ? C[5] : t < HIT + 1.2 ? C[4] : V[3];
    drawCracks(p, cracks, TX, -1, hot, crackK * 0.85);
    p.ellipse(TX, -1, 20, 3.4, C[5], 0.3 * crackK);
    p.ellipse(TX, -1, 10, 2, C[6], 0.24 * crackK);
  }

  // sparks and gold motes climb out of the burn for a long time
  if (after > 0.01) {
    const T = rng(S, Math.floor(t * 12), 17);
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 19);
      const born = HIT + B.range(0, 1.1), age = t - born;
      if (age < 0) continue;
      const q = age / (1.2 + B.next()), x = TX + B.range(-24, 24) + Math.sin(age * 2.2 + i) * 3;
      const y = -2 - q * B.range(20, 70) - age * 6;
      p.dot(x, y, q > 0.6 ? C[3] : i % 3 ? C[5] : WHITE, (1 - q) * 0.8);
      if (i % 4 === 0) p.glow(x, y, 4, C[4], 0.08 * (1 - q));
      if (i % 6 === 0) glint(p, x, y, 1 + Math.round(2 * (1 - q)), C[6], 0.14 * (1 - q));
    }
    // a thin residual pillar of light, thinning from the cloud to the floor
    if (t < 2.5) {
      const f = smooth(HIT, HIT + 0.12, t) * (1 - smooth(1.9, 2.5, t));
      p.beam(TX, TOP + 50, TX, -6, 1.6, C[5], 0.22 * f);
      p.beam(TX, TOP + 50, TX, -6, 3.4, C[3], 0.12 * f);
    }
  }
}
