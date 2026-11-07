// 天照命 · 八咫镜: the mirror is the spell. Eight bronze facets unfold behind the target,
// drink the arena's light, then return it as a tight sunbrand and a rain of hot shards.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { floorLight, hotStar } from "../dragonball/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { SUN, GOLD, GOLD_HOT, floorSeal } from "./_lib.js";

const END = 3.35, OPEN = 0.78, HIT = 1.04;
const TX = 182, TY = -34, MY = -82;

export const meta = {
  name: "Amaterasu, Yata mirror",
  desc: "The Yata mirror unfolds in eight bronze facets, catches the field's light and folds it into a sunbrand before its hot shards fall through the dark.",
  tags: ["kami", "japan", "shinto", "sun", "mirror", "amaterasu", "天照命", "天照大神", "八咫镜", "technique", "one-shot"],
  size: [340, 230], origin: [104, 202], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: SUN, seed: 121 },
};

const REST = { ...READY, weapon: "yata-mirror", x: -2, sa: -0.5, fx: 8, fy: -23, bx: 5, by: -22, ffx: 6, fbx: -7 };
const LIFT = { ...REST, x: -1, crouch: 2, lean: -4, turn: 0.32, fx: 3, fy: -34, bx: -7, by: -25, sa: -1.2, ffx: 5, fbx: -8 };
const PRESENT = { ...REST, x: 3, crouch: 4, lean: 5, turn: 0.02, fx: 13, fy: -31, bx: -4, by: -22, sa: -0.28, ffx: 10, fbx: -9 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, REST], [0.08, LIFT], [0.55, { ...LIFT, fy: -37, sa: -1.32 }],
    [OPEN, { ...PRESENT, ghost: 1 }, "snap"], [HIT, { ...PRESENT, x: 4, fy: -30 }, "snap"],
    [1.6, { ...PRESENT, crouch: 3, lean: 2 }], [2.45, REST], [3.12, REST],
  ],
  hits: [{ t: HIT, stop: 0.18, shake: 0.38, amp: 3, push: 2.2, straw: 18, skin: "holy" }],
  dust: [{ t: HIT, x: TX, n: 8, dir: -1, c: "#fff0b4" }],
};

function octagon(cx, cy, r, rot = 0) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = rot + i * TAU / 8;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/** A bronze Yata frame with eight uneven reflected facets. */
function yataMirror(p, C, x, y, r, rot, k, t) {
  if (k <= 0.02) return;
  const outer = octagon(x, y, r, rot), inner = octagon(x, y, r * 0.78, rot + 0.02);
  p.poly(outer, C[1], 0.9 * k);
  p.poly(inner, C[2], 0.98 * k);
  p.poly(octagon(x - 1.2, y - 1.4, r * 0.63, rot), C[0], 0.92 * k);
  p.arc(x, y, r * 0.91, 2, rot - 0.08, rot + Math.PI * 1.18, GOLD, 0.9 * k);
  p.arc(x, y, r * 0.74, 1, rot + Math.PI * 0.12, rot + Math.PI * 1.72, C[5], 0.75 * k);
  for (let i = 0; i < 8; i++) {
    const a = rot + i * TAU / 8;
    const near = r * 0.22, far = r * (0.68 + 0.08 * Math.sin(t * 2 + i));
    const hot = i % 3 === 0 ? C[6] : C[4];
    p.line(x + Math.cos(a) * near, y + Math.sin(a) * near, x + Math.cos(a) * far, y + Math.sin(a) * far, hot, 0.55 * k);
    p.dot(x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84, i % 2 ? C[5] : WHITE, 0.65 * k);
  }
  p.circle(x - r * 0.08, y - r * 0.12, r * 0.25, C[4], 0.6 * k);
  p.circle(x - r * 0.1, y - r * 0.15, r * 0.12, WHITE, 0.72 * k);
  p.glow(x, y, r * 1.55, C[4], 0.11 * k);
  p.glow(x, y, r * 0.72, C[6], 0.14 * k);
}

function reflectLine(p, C, a, spread, k, hot = false) {
  const x0 = TX + Math.cos(a) * 18, y0 = MY + Math.sin(a) * 18;
  const x1 = TX + Math.cos(a + spread) * 42, y1 = MY + Math.sin(a + spread) * 42;
  p.line(x0, y0, x1, y1, hot ? WHITE : C[5], 0.6 * k);
  p.line(x0 + 1, y0, x1, y1, hot ? C[6] : C[4], 0.42 * k);
  p.glowLine(x0, y0, x1, y1, 5, C[4], 0.04 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), fade = 1 - smooth(2.72, END, t);
  const seal = smooth(0.12, 0.56, t) * (1 - smooth(2.62, END, t));
  if (seal > 0.02) {
    floorSeal(p, C, TX, -1, 28 + Math.sin(t * 2.5) * 2, t * 0.6, 0.52 * seal, { sq: 0.22, n: 24, core: 0.3 + 0.5 * seal, pool: true });
    p.ellipse(TX, -1, 30, 4, C[4], 0.12 * seal);
    floorLight(p, TX, C, 0.16 * seal, 32);
  }
  if (fade > 0.02) {
    p.glow(TX, -14, 42, C[3], 0.04 * fade);
    p.glow(TX, MY, 54, C[3], 0.045 * fade);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, fade = 1 - smooth(2.78, END, t);
  const gather = smooth(0.04, OPEN, t) * (1 - smooth(OPEN, OPEN + 0.18, t));
  const open = smooth(OPEN - 0.08, OPEN + 0.12, t) * fade;
  const rot = t * 0.32;

  if (gather > 0.02) {
    const hx = 7, hy = -35, q = ease.outCubic(gather);
    p.circle(hx, hy, 2 + q * 3, q > 0.72 ? WHITE : C[6], 0.9 * gather);
    p.glow(hx, hy, 8 + 24 * q, C[4], 0.16 * gather);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + t * 2.2, d = 8 + 20 * q;
      p.line(hx + Math.cos(a) * d, hy + Math.sin(a) * d, hx + Math.cos(a) * 3, hy + Math.sin(a) * 3, C[4], 0.38 * gather);
    }
  }

  // The Yata mirror is the focal object, rather than a generic sun overhead.
  if (open > 0.02) {
    const r = 24 + 10 * ease.outBack(clamp((t - OPEN + 0.08) / 0.28));
    yataMirror(p, C, TX, MY, r, rot, open, t);
    const flare = smooth(OPEN, OPEN + 0.24, t) * (1 - smooth(1.75, 2.05, t));
    for (let i = 0; i < 8; i++) {
      const a = rot + i * TAU / 8;
      reflectLine(p, C, a, i % 2 ? 0.11 : -0.08, open * (0.35 + 0.65 * flare), i % 4 === 0 && flare > 0.4);
    }
    if (flare > 0.02) {
      p.glow(TX, MY, 66, C[4], 0.12 * flare);
      p.glowRing(TX, MY, 39 + flare * 14, 2, C[5], 0.18 * flare);
    }
  }

  const beam = smooth(OPEN + 0.04, HIT, t) * fade;
  if (beam > 0.02) {
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * 0.92 + i * Math.PI * 0.19;
      const sx = TX + Math.cos(a) * 27, sy = MY + Math.sin(a) * 27;
      const ex = TX + (i - 3.5) * 4.1, ey = TY + (i % 2 ? 3 : -2);
      p.line(sx, sy, ex, ey, i % 3 ? C[5] : C[6], 0.42 * beam);
      if (i % 2 === 0) p.line(sx, sy + 1, ex, ey + 1, WHITE, 0.22 * beam);
    }
    p.beam(TX, MY + 22, TX, TY, 1.2 + 2 * beam, WHITE, 0.24 * beam);
    p.glowLine(TX, MY + 22, TX, TY, 15, C[4], 0.08 * beam);
  }

  if (t >= HIT && t < HIT + 0.78) {
    const q = clamp((t - HIT) / 0.78), f = 1 - q;
    p.circle(TX, TY, 3 + 14 * ease.outQuad(q), WHITE, 0.95 * f);
    hotStar(p, TX, TY, 18 * f + 5, t * 0.8, C, 0.84 * f);
    sparkle(p, TX, TY, 17 * f + 4, C[6], C[4], 0.8 * f);
    p.glow(TX, TY, 40, C[4], 0.2 * f);
    p.glow(TX, TY, 12, WHITE, 0.25 * f);
    p.ellipse(TX, -1, 16 + q * 34, 3.6 + q * 2, C[5], 0.25 * f);
    p.ellipse(TX, -1, 10 + q * 20, 2.2 + q, WHITE, 0.18 * f);
    pool(p, TX, 0, 28, 7, C[4], 0.28 * f);
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 17), a = B.range(-Math.PI, 0.2), d = q * B.range(20, 92);
      const x = Math.max(-70, Math.min(228, TX + Math.cos(a) * d));
      const y = Math.min(1, TY + Math.sin(a) * d + q * q * 26);
      p.line(x, y, x + B.range(-2, 3), y + B.range(1, 4), i % 3 ? C[5] : GOLD_HOT, 0.7 * f);
    }
  }

  const shards = smooth(HIT + 0.05, HIT + 0.22, t) * fade;
  if (shards > 0.02) {
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 31), age = t - HIT - B.range(0.08, 0.28), life = 1.35 + B.range(0, 0.6);
      if (age < 0 || age > life) continue;
      const q = age / life, a = B.range(-2.8, -0.35), d = age * B.range(18, 42);
      const x = TX + Math.cos(a) * d + B.range(-20, 20), y = MY + Math.sin(a) * d + age * age * 12;
      p.poly([[x, y], [x + 2, y - 1], [x + 1, y + 3]], q > 0.55 ? C[3] : GOLD_HOT, (1 - q) * shards);
      if (i % 4 === 0) glint(p, x, y, 1 + Math.round(2 * (1 - q)), WHITE, 0.12 * (1 - q) * shards);
    }
  }

  const after = smooth(HIT + 0.2, HIT + 0.65, t) * (1 - smooth(2.5, END, t));
  if (after > 0.02) {
    p.glow(TX, -1, 32, C[4], 0.1 * after);
    floorLight(p, TX, C, 0.14 * after, 26);
    for (let i = 0; i < 8; i++) {
      const B = rng(S, i, 43), x = TX + B.range(-26, 26), y = -2 + B.range(0, 3);
      p.dot(x, y, i % 2 ? C[5] : GOLD, 0.42 * after);
    }
  }
}
