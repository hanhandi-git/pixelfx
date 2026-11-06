// 玄天斩灵剑: the law of heaven takes the shape of a sword. A slit of white light opens in the sky, runes gather
// along it, and a colossal ancient blade drops point-first onto the target. On impact the law-cut tears a straight
// white line across the whole field and the blade shatters upward into light.
import { READY, WHITE, clamp, ease, fit, hex, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks } from "../dragonball/_lib.js";
import { XUANTIAN, GOLD_THUNDER, runeSeal } from "./_lib.js";
import { glint, pool } from "../pickups/_lib.js";

const END = 3.45;
const DROP = 0.74, HIT = 1.04;
const TX = 266, TY = -26, TOP = -292;
const LEFT = -76, RIGHT = 336, FLOOR = 32;
const GOLD = hex("#e8c06a"), GOLD_HOT = hex("#fff0b0");

export const meta = {
  name: "Xuantian spirit-slaying sword",
  desc: "A slit of white light opens in the sky, runes gather, and a colossal blade drops point-first onto the target; the law-cut tears across the field and the blade shatters upward.",
  tags: ["xianxia", "fanren", "sword", "law", "heaven", "giant-blade", "玄天斩灵剑", "technique", "one-shot"],
  size: [412, 340],
  origin: [76, 308],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: XUANTIAN, gold: GOLD_THUNDER, seed: 109 },
};

const SEAL = { ...READY, x: -1, crouch: 3, lean: -3, turn: 0.3, fx: 7, fy: -33, bx: -4, by: -23, ffx: 5 };
const HOLD = { ...SEAL, x: -2, crouch: 5, lean: -5, fx: 4, fy: -35, bx: -5, by: -22 };
const CUT = { ...READY, x: 2, crouch: 4, lean: 7, turn: 0.05, fx: 17, fy: -30, bx: 2, by: -20, ffx: 11 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, READY],
    [0.1, SEAL],
    [0.62, HOLD],
    [HIT, CUT, "snap"],
    [1.4, { ...CUT, x: 3, crouch: 5, lean: 9, fx: 19, fy: -28 }],
    [2.2, { ...CUT, x: 1, crouch: 3, lean: 3, fx: 12, fy: -25 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.24, shake: 0.6, amp: 5, push: 3, straw: 34, skin: "char" },
    { t: 2.1, stop: 0.05, shake: 0.2, amp: 2, push: 0, straw: 4, skin: null },
  ],
  dust: [{ t: HIT, x: TX, n: 12, dir: -1, c: "#e8eef0" }, { t: 2.1, x: TX, n: 6, dir: -1, c: "#fff0b0" }],
};

/** The blade: a long faceted wedge, bright on the left facet, dark spine, gold guard and a ripped banner. */
function blade(p, C, x, tipY, k, o = {}) {
  if (k <= 0.02) return;
  const L = o.len ?? 158, W = o.w ?? 12;
  const base = tipY - L, gy = base;
  // the two facets
  p.poly([[x, tipY + 4], [x - W, tipY - L * 0.74], [x - W * 0.82, gy], [x - W * 0.16, gy + 5]], C[1], k);
  p.poly([[x, tipY + 4], [x + W, tipY - L * 0.74], [x + W * 0.82, gy], [x + W * 0.16, gy + 5]], C[3], k);
  // the lit left facet and the full edge
  p.poly([[x - 1, tipY + 8], [x - W * 0.75, tipY - L * 0.74], [x - W * 0.62, gy + 2], [x - 1, gy + 6]], C[4], k);
  p.line(x - 1, tipY - 4, x - W * 0.72, gy + 2, WHITE, 0.7 * k);
  p.line(x + 1, tipY - 4, x + W * 0.72, gy + 2, C[5], 0.9 * k);
  // a dark spine between the facets and the fuller groove
  p.line(x, tipY - 4, x, gy + 4, C[0], 0.65 * k);
  p.line(x - 2, tipY - L * 0.2, x - 2, gy + 12, C[2], 0.5 * k);

  // guard: a gold bar with flared ends
  p.rect(x - 24, gy - 1, 48, 3, C[2], k);
  p.rect(x - 22, gy - 2, 44, 1, GOLD, 0.9 * k);
  p.poly([[x - 25, gy - 2], [x - 30, gy - 6], [x - 24, gy + 2]], GOLD, 0.9 * k);
  p.poly([[x + 25, gy - 2], [x + 30, gy - 6], [x + 24, gy + 2]], GOLD, 0.9 * k);
  // grip, pommel and the banner that streams off it
  p.rect(x - 3, gy - 22, 6, 21, C[1], k);
  p.rect(x - 3, gy - 22, 1, 21, GOLD, 0.8 * k);
  p.circle(x, gy - 23, 3, GOLD, 0.85 * k);
  p.dot(x, gy - 23, GOLD_HOT, 0.9 * k);
  for (let i = 0; i < 7; i++) {
    const y = gy - 18 + i * 3;
    p.dot(x - 4 - (i % 2) * 2, y, i % 2 ? GOLD : C[6], 0.5 * k);
  }
  // the blade is backlit: a thin light down each edge, a pin at the point, a star on the guard's gem
  p.glowLine(x - 1, tipY - 4, x - W * 0.72, gy + 2, 3.4, C[5], 0.12 * k);
  p.glowLine(x + 1, tipY - 4, x + W * 0.72, gy + 2, 3.4, C[4], 0.09 * k);
  p.glow(x, tipY - 4, 15, C[6], 0.18 * k);
  p.glow(x, gy - 23, 14, C[3], 0.06 * k);
  p.glow(x, gy - 23, 5, C[6], 0.16 * k);
  glint(p, x, gy - 23, 2, C[6], 0.18 * k);
}

/** Law script crawling up the blade: hard cyan ticks and little knots of light. */
function script(p, C, x, tipY, k, t) {
  if (k <= 0.02) return;
  const L = 158;
  for (let i = 0; i < 9; i++) {
    const u = ((i / 9 + t * 0.22) % 1);
    const y = tipY - 12 - u * (L - 30);
    const s = Math.sin(u * Math.PI), w = 3 + 7 * s;
    const c = i % 3 === 0 ? GOLD_HOT : C[6];
    p.dot(x - w, y, c, 0.6 * k);
    p.dot(x + w, y, c, 0.6 * k);
    if (i % 3 === 0) {
      p.line(x - w, y - 2, x - w + 3, y + 2, WHITE, 0.4 * k);
      p.line(x + w, y - 2, x + w - 3, y + 2, WHITE, 0.4 * k);
    }
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  // sky dims around the descending law
  const sky = smooth(0.05, 0.5, t) * (1 - smooth(2.9, 3.4, t));
  if (sky > 0.01) {
    for (let i = 0; i < 7; i++) {
      const B = rng(S, i, 3);
      p.disc(TX - 120 + B.range(0, 140), TOP + 20 + B.range(0, 46), 16 + B.range(0, 14), C[0], 0.22 * sky);
    }
  }
  // the law seal on the floor, under the target
  const seal = smooth(0.2, 0.8, t) * (1 - smooth(2.6, 3.3, t));
  if (seal > 0.01) {
    runeSeal(p, TX, -1, 28, t * 0.9, C, 0.45 * seal, { sq: 0.2, n: 30, tick: 3, core: 0.5 });
    p.ellipse(TX, -1, 20, 3.6, C[4], 0.2 * seal);
    pool(p, TX, 0, 34, 6, C[4], 0.3 * seal);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.gold ?? GOLD_THUNDER, 8), S = o.seed;

  // the slit: a vertical wound in the sky that breathes open
  const slit = smooth(0.1, 0.6, t) * (1 - smooth(2.7, 3.3, t));
  if (slit > 0.01) {
    const w = 1 + 2 * smooth(0.3, 0.85, t);
    p.beam(TX, TOP + 40, TX, -74, w, WHITE, 0.55 * slit);
    p.beam(TX, TOP + 40, TX, -74, w + 2, C[4], 0.22 * slit);
    p.glow(TX, TOP + 90, 74, C[3], 0.07 * slit);
    p.glow(TX, TOP + 90, 28, C[5], 0.1 * slit);
    p.glow(TX, TOP + 90, 10, C[6], 0.12 * slit);
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 7), a = B.range(0, TAU);
      const d = 5 + B.range(0, 16);
      const y = TOP + 60 + B.range(0, 140) + ((t * 18) % 40);
      p.dot(TX + Math.cos(a) * d, y + Math.sin(a) * d, i % 3 ? C[5] : GOLD_HOT, 0.5 * slit);
    }
  }

  // the phantom before the drop, then the blade itself
  const dropQ = clamp((t - DROP) / (HIT - DROP));
  const tipY = t < HIT ? -120 + 96 * ease.inCubic(dropQ) : TY + 2;
  const ghost = t < DROP ? smooth(0.4, DROP, t) * 0.3 : 0;
  if (ghost > 0.01) blade(p, C, TX, tipY, ghost);
  if (t >= DROP && t < 2.16) {
    const k = t < HIT ? 0.55 + 0.45 * dropQ : 1;
    blade(p, C, TX, tipY, k);
    script(p, C, TX, tipY, k * (t < HIT ? 0.6 + dropQ * 0.4 : 1), t);
  }

  // the law-cut: one white line across the world, opening from the impact
  if (t >= HIT && t < 2.6) {
    const open = smooth(HIT, HIT + 0.14, t) * (1 - smooth(2.0, 2.6, t));
    const w = 1 + 1.6 * (1 - smooth(HIT, HIT + 0.1, t));
    const q = ease.outQuart(smooth(HIT, HIT + 0.12, t));
    const reachL = Math.min(420, TX - LEFT - 6) * q, reachR = Math.min(420, RIGHT - TX - 6) * q;
    for (const side of [-1, 1]) {
      const x0 = side > 0 ? TX : TX - reachL;
      const x1 = side > 0 ? TX + reachR : TX;
      p.line(x0, TY, x1, TY, WHITE, 0.9 * open);
      p.line(x0, TY - w, x1, TY - w, C[4], 0.45 * open);
      p.line(x0, TY + w, x1, TY + w, GOLD, 0.3 * open);
    }
    p.glowLine(TX - reachL, TY, TX + reachR, TY, 9, C[4], 0.05 * open);
    p.glow(TX, TY, 52, C[6], 0.22 * open);
    p.glow(TX, TY, 20, WHITE, 0.18 * open);
    const run = ease.outCubic(smooth(HIT, HIT + 0.42, t));
    glint(p, TX - reachL * run, TY, 3, WHITE, 0.3 * open);
    glint(p, TX + reachR * run, TY, 3, WHITE, 0.3 * open);
  }

  // impact: a white star, a crushed floor, flying grit
  if (t >= HIT && t < HIT + 0.7) {
    const q = (t - HIT) / 0.7, f = 1 - q;
    p.circle(TX, TY, 4 + 18 * ease.outQuad(q), WHITE, 0.95 * f);
    sparkle(p, TX, TY, 24 * f + 6, WHITE, C[4], 0.9 * f);
    sparkle(p, TX, TY, 12 * f + 4, GOLD_HOT, GOLD, 0.7 * f);
    p.ellipse(TX, -1, 16 + q * 40, 4 + q * 3, C[5], 0.3 * f);
    p.ellipse(TX, -1, 12 + q * 42, 2.4 + q * 2, WHITE, 0.22 * f);
    for (let i = 0; i < 22; i++) {
      const B = rng(S, i, 13), a = B.range(-2.9, -0.25), sp = B.range(24, 94);
      const d = q * sp, x = TX + Math.cos(a) * d, y = TY + Math.sin(a) * d + q * q * 26;
      p.dot(x, y, i % 4 ? C[4] : WHITE, 0.85 * f);
    }
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 17), x = TX + B.range(-18, 18), y = -1 - B.range(0, 8) - q * B.range(10, 34) + q * q * 30;
      p.rect(x, y, 2, 2, i % 2 ? C[3] : C[1], 0.8 * f);
    }
  }

  // the cracked floor, the law line cutting through it
  const crackK = smooth(HIT, HIT + 0.1, t) * (1 - smooth(2.75, 3.35, t));
  if (crackK > 0.02) {
    drawCracks(p, crackFan(S + 7, 10, 62, 1.0, 8), TX, -1, C[4], crackK * 0.8);
    p.ellipse(TX, -1, 26, 3.6, C[3], 0.3 * crackK);
    p.line(TX - 120, TY + 5, TX + 110, TY + 5, C[5], 0.3 * crackK);
  }

  // the blade breaks upward into law shards
  if (t >= 2.06) {
    const q = smooth(2.06, 3.1, t);
    for (let i = 0; i < 20; i++) {
      const B = rng(S, i, 19), a = B.range(-2.9, -0.2), sp = B.range(12, 54);
      const d = ease.outCubic(q) * sp, x = TX + Math.cos(a) * d * (0.4 + B.next() * 0.9);
      const y = 0 - B.range(0, 130) - q * B.range(10, 60) + Math.sin(q * 6 + i) * 3;
      const k = (1 - q) * (0.4 + B.next() * 0.6);
      if (k <= 0.02) continue;
      if (i % 3 === 0) {
        p.line(x - 1, y, x + 1, y - 4, i % 2 ? C[5] : GOLD_HOT, k);
      } else p.dot(x, y, i % 4 === 0 ? WHITE : C[4], k);
      if (i % 5 === 0) p.glow(x, y, 5, C[4], 0.1 * k);
      if (i % 7 === 0 && k > 0.2) glint(p, x, y, 1 + Math.round(2 * k), C[6], 0.16 * k);
    }
    p.glow(TX, -60, 40, C[4], 0.12 * (1 - q));
  }

  // a lingering vertical scar where the blade stood
  const scar = smooth(HIT + 0.2, 1.4, t) * (1 - smooth(2.7, 3.35, t));
  if (scar > 0.01) {
    p.beam(TX, -150, TX, -4, 1, WHITE, 0.25 * scar);
    p.glowLine(TX, -150, TX, -4, 6, C[4], 0.04 * scar);
    p.glow(TX, -80, 26, C[5], 0.08 * scar);
  }
}
