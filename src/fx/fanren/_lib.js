// Shared material language for the 凡人修仙传 / A Mortal's Journey set: jade for the bamboo-cloud
// swords, gold for divine thunder and devouring beetles, pale law-light for the Xuantian blade, and
// the bottle's emerald. Seals, motes and leaf blades live here so the whole set reads as one sect.
import { TAU, cycle, loopNoise, smooth, WHITE } from "../../core/index.js";

/** 青竹蜂云剑: bamboo green, a jade body, a pale leaf edge, white only on a cutting edge. */
export const JADE = ["#05160e", "#0a2b1a", "#10462a", "#1a6a3c", "#2c9a56", "#5cd07c", "#a8f2b4", "#ffffff"];
/** 辟邪神雷: gold divine thunder, with a violet 辟邪 pressure in the shadow steps. */
export const GOLD_THUNDER = ["#160d04", "#3a2106", "#7d4a0a", "#c07a10", "#f0b41c", "#ffdc62", "#fff3b4", "#ffffff"];
/** The violet that rides on the gold: evil-warding vigour, used for seals and forks. */
export const WARD_VIOLET = ["#0d0718", "#1d1034", "#331a58", "#4f2a84", "#7c4cbc", "#b184e4", "#e0c8ff", "#ffffff"];
/** 噬金虫: old gold chitin, a dark seam, a bright carapace rim. */
export const GOLD_BEETLE = ["#120c04", "#2b1e07", "#503708", "#7d590c", "#ad8014", "#d8aa2e", "#f7da78", "#ffffff"];
/** 玄天斩灵剑: heaven-law white-gold with a cold cyan edge. */
export const XUANTIAN = ["#080d14", "#132030", "#22384e", "#3f607c", "#7fa6bc", "#cfe2e6", "#fff6d8", "#ffffff"];
/** 灭仙珠: a violet void rim and a white annihilation core. */
export const MIE = ["#080610", "#18112a", "#2f224e", "#4f3a76", "#8060a4", "#bfa0d8", "#efe2ff", "#ffffff"];
/** 掌天瓶: the bottle's emerald and the spirit dew's living green. */
export const BOTTLE = ["#03120c", "#082518", "#0e3e28", "#17603c", "#269052", "#52c878", "#a8f0b4", "#ffffff"];

/** Linear interpolation helper used by the choreographed effects. */
export const mix = (a, b, u) => a + (b - a) * u;

/**
 * A talisman seal drawn as a dotted ellipse (floor) or ring (upright), turning slowly. `sq` squashes it
 * onto the floor; `r` is the radius; ticks point out like seal script. Alpha-ked by k.
 */
export function runeSeal(p, x, y, r, ph, C, k = 1, o = {}) {
  if (k <= 0.01 || r < 2) return;
  const sq = o.sq ?? 1, n = o.n ?? 28, tick = o.tick ?? 3;
  const c1 = o.c1 ?? C[4], c2 = o.c2 ?? C[5];

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + ph;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * sq;
    const major = i % 3 === 0;
    p.dot(px, py, major ? c2 : c1, (major ? 0.9 : 0.5) * k);
    if (major) {
      const d = tick * (o.long ? 1.5 : 1);
      p.line(px, py, x + Math.cos(a) * (r + d), y + Math.sin(a) * (r + d) * sq, c1, 0.45 * k);
      // a small notch inward, so the seal reads as writing rather than a dotted circle
      p.dot(x + Math.cos(a + 0.12) * (r - 2), y + Math.sin(a + 0.12) * (r - 2) * sq, c2, 0.6 * k);
    }
  }
  // the inner ring, turning the other way
  for (let i = 0; i < n / 2; i++) {
    const a = (i / (n / 2)) * TAU - ph * 0.7;
    p.dot(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62 * sq, c1, 0.4 * k);
  }
  if (o.core) {
    p.dot(x, y, WHITE, 0.8 * k * o.core);
    p.glow(x, y, r * 1.1, c2, 0.18 * k * o.core);
  }
}

/** A bamboo-leaf flying sword: dark spine, jade body, one pale cutting edge, a short hilt and tassel. */
export function leafSword(p, C, x, y, a, L, k = 1, o = {}) {
  if (k <= 0.02) return;
  const ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
  const wide = o.wide ?? 1.25;

  // the hilt and its tassel trail behind the point
  const h0 = P(-3.4, 0), h1 = P(-0.4, 0);
  p.line(h0[0], h0[1], h1[0], h1[1], C[1], 0.9 * k);
  for (let i = 0; i < 2; i++) {
    const t = P(-4 - i * 2.2, 0.6 + i * 0.8);
    p.dot(t[0], t[1], i ? C[3] : C[2], 0.7 * k);
  }

  // blade: a leaf with a broad shoulder and a needle point
  p.poly([P(-0.6, -1.5 * wide), P(L * 0.42, -1.9 * wide), P(L, 0), P(L * 0.42, 1.4 * wide), P(-0.6, 1.1 * wide)], C[2], k);
  p.poly([P(0.2, -1.2 * wide), P(L * 0.44, -1.15 * wide), P(L - 1.2, 0), P(L * 0.44, 0.2), P(0.2, 0.2)], C[4], k);
  const e0 = P(0.4, 0.1), e1 = P(L * 0.92, 0.1);
  p.line(e0[0], e0[1], e1[0], e1[1], C[5], 0.85 * k);
  const g0 = P(1.0, -1.2 * wide), g1 = P(L * 0.7, -0.9 * wide);
  p.line(g0[0], g0[1], g1[0], g1[1], WHITE, 0.55 * k);
  // bamboo joint marks on the spine
  for (let i = 1; i <= 2; i++) {
    const q = P(L * 0.22 * i, 0.1);
    p.dot(q[0], q[1], C[6], 0.7 * k);
  }
  // the light lives on the edge, not in a blob: a thin line of jade along the blade and a pin at the point
  const tg = P(L, 0), mg = P(L * 0.55, -0.6);
  p.glowLine(x, y, tg[0], tg[1], 2.4, C[5], 0.1 * k);
  p.glow(mg[0], mg[1], 3.2, C[6], 0.07 * k);
}

/**
 * Green qi motes gathering into a point: ring-born streaks that curve in. Seamless in the phase.
 * `dir` = -1 pulls in, +1 leaks out.
 */
export function qiMotes(p, C, x, y, r, t, D, seed, count = 16, reach = 22, dir = -1, k = 1) {
  cycle(t, D, count, seed, D * 0.5, (age, life, R) => {
    const q = age / life, e = dir < 0 ? 1 - (1 - q) * (1 - q) : q * q;
    const a = R.range(0, TAU) + dir * e * R.range(1, 2.4);
    const d = dir < 0 ? reach * (1 - e) + r : r + reach * e;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.9;
    const fade = smooth(0, 0.12, q) * (1 - smooth(0.8, 1, q)) * k;
    p.dot(px, py, q > 0.5 ? C[5] : C[3], 0.75 * fade);
    if (q > 0.4 && q < 0.62) p.glow(px, py, 4, C[4], 0.09 * fade);
  });
}

/** Dust of gold light that drifts and winks around a held artifact. */
export function artifactMotes(p, C, x, y, rx, ry, ph, seed, count = 10, k = 1) {
  for (let i = 0; i < count; i++) {
    const a = ph * TAU * (i % 2 ? 1 : -1) + (i / count) * TAU;
    const d = 0.75 + 0.25 * loopNoise(ph, 1.2, seed + i * 7);
    const px = x + Math.cos(a) * rx * d, py = y + Math.sin(a) * ry * d;
    const wink = loopNoise(ph, 2, seed + i * 13) * 0.5 + 0.5;
    p.dot(px, py, wink > 0.7 ? WHITE : C[5], (0.3 + 0.5 * wink) * k);
  }
}
