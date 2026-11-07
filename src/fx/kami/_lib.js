// Shared material language for the 日本传说 / Japanese legend set: the sun's gold and shrine vermilion, the
// moon's silver, storm teal, jade magatama, the eight-headed serpent's blood red and the rock of the heavenly
// cave. The magatama, the mitsudomoe seal, cloud banks, shide streamers, a torii and the serpent's head live
// here so the whole set reads as one mythology rather than seven unrelated pictures.
import { TAU, WHITE, hex, loopNoise, smooth } from "../../core/index.js";

/** 天照 / 八咫镜: vermilion shadow, sun gold, a white-hot heart. */
export const SUN = ["#1c0a05", "#4a1408", "#8a2a0e", "#c74c1a", "#ef8a2c", "#ffc85c", "#fff0b4", "#ffffff"];
/** 月读 / 月弓: night indigo to moon silver, white only at the edge. */
export const MOON = ["#050a1a", "#0b1430", "#152450", "#28406e", "#4f6f9e", "#9dbcd8", "#e2f2ff", "#ffffff"];
/** 须佐之男 / 云从剑: a storm sea-green with a pale wind edge. */
export const STORM = ["#060d12", "#0c1e26", "#143540", "#1f5662", "#35818c", "#68c0bb", "#c4fff0", "#ffffff"];
/** The violet that rides the storm: a heavenly judgement, not mere weather. */
export const VOLT = ["#0a0618", "#1a0f36", "#301a5c", "#502c8c", "#7c52c8", "#b48cf0", "#e6d6ff", "#ffffff"];
/** 六勾玉: jade body, a pale living edge. */
export const JEWEL = ["#03110c", "#072419", "#0d3d28", "#17603a", "#2c9252", "#5cd07c", "#b8ffcc", "#ffffff"];
/** 八岐大蛇: old blood red, a bronze scale rim, bone fangs. */
export const BLOOD = ["#0a0507", "#200a0e", "#3d1016", "#631a1c", "#942c22", "#c2522c", "#f0994c", "#ffe0a8"];
/** 云从剑's edge and the sun's metal: a gold-white blade ramp for cuts and crowns. */
export const GOLD_BLADE = ["#2a1a06", "#5c3a0a", "#9a6a14", "#d8a028", "#f2c94c", "#ffe08a", "#fff3c0", "#ffffff"];
/** 天岩户: cold granite, lit only from the crack. */
export const CAVE = ["#07070b", "#111219", "#1e2029", "#31353f", "#4d535c", "#7a828c", "#b6c0c8", "#ffffff"];

export const GOLD = hex("#f2d488"), GOLD_HOT = hex("#fff6cc"), GOLD_D = hex("#a8752e");
export const STRAW = hex("#d8c49a"), STRAW_D = hex("#8a744e");
export const VERMILION = hex("#c8402a"), VERMILION_D = hex("#6e2018");
export const INK = hex("#0a0810");

/** Linear blend, used for one-off accent ramps inside a single effect. */
export const mix = (a, b, u) => a + (b - a) * u;

/**
 * A magatama: a fat head with a tail that curls away, lit from the upper left. r is the half-height of the
 * head, rot the direction the tail curls towards. The hole through the head is one dark pixel with a lit rim.
 */
export function magatama(p, C, x, y, r, rot, k = 1, o = {}) {
  if (k <= 0.02 || r < 1.2) return;
  const n = 16, L = [], R = [];
  const tuck = o.tuck ?? 3.35, reach = o.reach ?? 1.2;
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = rot + u * tuck, d = r * (0.1 + reach * u * u);
    const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d;
    const a2 = a + 0.04, d2 = r * (0.1 + reach * (u + 0.01) * (u + 0.01));
    const tx = Math.cos(a2) * d2 - Math.cos(a) * d, ty = Math.sin(a2) * d2 - Math.sin(a) * d;
    const tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
    const w = r * (0.68 - 0.6 * u * u);
    L.push([cx + nx * w, cy + ny * w]);
    R.push([cx - nx * w, cy - ny * w]);
  }
  p.poly([...L, ...R.reverse()], C[2], k);
  // the lit face: the same bead one pixel towards the light, so a dark rim survives all the way round
  const inner = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, a = rot + u * tuck, d = r * (0.1 + reach * u * u);
    const cx = x + Math.cos(a) * d - r * 0.16, cy = y + Math.sin(a) * d - r * 0.22;
    const a2 = a + 0.04, d2 = r * (0.1 + reach * (u + 0.01) * (u + 0.01));
    const tx = Math.cos(a2) * d2 - Math.cos(a) * d, ty = Math.sin(a2) * d2 - Math.sin(a) * d;
    const tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
    const w = Math.max(0.4, r * (0.68 - 0.6 * u * u) - 0.8);
    inner.push([cx + nx * w, cy + ny * w], [cx - nx * w, cy - ny * w]);
  }
  p.poly(inner, C[4], 0.95 * k);
  // head: a rounder bead and a hard highlight, then the hole
  const hx = x + Math.cos(rot) * r * 0.06, hy = y + Math.sin(rot) * r * 0.06;
  p.circle(hx - r * 0.1, hy - r * 0.12, r * 0.4, C[5], 0.9 * k);
  p.dot(hx - r * 0.28, hy - r * 0.34, C[6], 0.9 * k);
  p.dot(hx - r * 0.36, hy - r * 0.42, WHITE, 0.6 * k);
  if (o.hole !== false) {
    p.dot(hx + Math.cos(rot + 0.9) * r * 0.22, hy + Math.sin(rot + 0.9) * r * 0.22, C[0], 0.9 * k);
    p.dot(hx + Math.cos(rot + 0.9) * r * 0.22, hy + Math.sin(rot + 0.9) * r * 0.22 - 1, C[6], 0.5 * k);
  }
  // the tail keeps a bright spine and ends in a pale point
  for (let i = 2; i <= n - 2; i += 2) {
    const u = i / n, a = rot + u * tuck, d = r * (0.1 + reach * u * u);
    p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d, C[i % 4 ? 5 : 6], 0.5 * k);
  }
  p.glow(hx, hy, r * 1.5, C[4], 0.16 * k);
  p.glow(hx, hy, r * 0.7, C[6], 0.12 * k);
}

/**
 * A fan of rays. Each blade is a 1 px line with a second step beside it near the base, a hot tip and a short
 * pin of light, so a big sun fan costs lines instead of a filled triangle per ray. rot turns the fan.
 */
export function rayFan(p, C, x, y, r0, r1, n, rot, k = 1, o = {}) {
  if (k <= 0.02) return;
  const longEvery = o.longEvery ?? 2, every = o.every ?? 1;
  for (let i = 0; i < n; i += every) {
    const a = rot + (i / n) * TAU;
    const ca = Math.cos(a), sa = Math.sin(a);
    let len = r1 * (i % longEvery === 0 ? 1 : 0.62);
    // a floor clips the downward half of the fan instead of painting light under the ground
    if (o.floor !== undefined && sa > 0.02) len = Math.min(len, (o.floor - y) / sa);
    if (len < r0 + 2) continue;
    const x0 = x + ca * r0, y0 = y + sa * r0, x1 = x + ca * len, y1 = y + sa * len;
    const col = i % longEvery === 0 ? C[o.color ?? 4] : C[o.dim ?? 3];
    p.line(x0, y0, x1, y1, col, 0.62 * k);
    if (i % longEvery === 0) {
      // the lit face of the blade: one step to the side, a little shorter
      const m = r0 + (len - r0) * 0.42;
      p.line(x0 - sa * 1.2, y0 + ca * 1.2, x + ca * m - sa * 1.2, y + sa * m + ca * 1.2, C[o.hot ?? 5], 0.55 * k);
      p.line(x0, y0, x0 + ca * 4 - sa * 1.6, y0 + sa * 4 + ca * 1.6, C[o.hot ?? 5], 0.6 * k);
    }
    p.dot(x1, y1, i % 3 ? C[6] : WHITE, 0.6 * k);
    if (o.light !== false && i % 2 === 0) p.glow((x0 + x1) / 2, (y0 + y1) / 2, 7, C[5], 0.045 * k);
  }
}

/** The sun: white heart, gold body, a broken corona ring and a haze that does not reach the frame's edge. */
export function sunDisc(p, x, y, r, C, k = 1, t = 0) {
  if (k <= 0.02 || r < 1) return;
  p.disc(x, y, r * 2.6, C[3], 0.13 * k);
  p.disc(x, y, r * 1.7, C[4], 0.2 * k);
  p.circle(x, y, r, C[4], k);
  p.circle(x - r * 0.08, y - r * 0.1, r * 0.8, C[5], k);
  p.circle(x - r * 0.16, y - r * 0.2, r * 0.5, C[6], k);
  p.circle(x - r * 0.16, y - r * 0.22, r * 0.24, WHITE, k);
  // the corona: hard, stepped tongues at two lengths, turning with t
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU + t * 0.5;
    const l = r * (1.12 + 0.16 * Math.sin(i * 2.7 + t * 3));
    p.dot(x + Math.cos(a) * l, y + Math.sin(a) * l, i % 3 ? C[5] : C[6], 0.7 * k);
    if (i % 2 === 0) p.dot(x + Math.cos(a) * l * 1.16, y + Math.sin(a) * l * 1.16, C[4], 0.5 * k);
  }
  p.glow(x, y, r * 3.4, C[4], 0.2 * k);
  p.glow(x, y, r * 2, C[5], 0.24 * k);
  p.glow(x, y, r * 0.9, WHITE, 0.3 * k);
}

/**
 * A shinto floor seal: two rings of ticks turning opposite ways, a mitsudomoe at the centre, squashed onto
 * the floor by sq. k fades it; core brightens the centre.
 */
export function floorSeal(p, C, x, y, r, ph, k = 1, o = {}) {
  if (k <= 0.01 || r < 3) return;
  const sq = o.sq ?? 0.24, n = o.n ?? 26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + ph, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * sq;
    const major = i % 2 === 0;
    p.dot(px, py, major ? C[5] : C[3], (major ? 0.85 : 0.5) * k);
    if (major) {
      const d = o.tick ?? 3.5;
      p.line(px, py, x + Math.cos(a) * (r + d), y + Math.sin(a) * (r + d) * sq, C[4], 0.4 * k);
    }
    if (i % 4 === 1) p.dot(x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74 * sq, C[4], 0.35 * k);
  }
  const cp = o.core ?? 0.6;
  if (cp > 0) {
    for (let i = 0; i < 3; i++) {
      const a = ph * 1.6 + (i / 3) * TAU;
      magatama(p, C, x + Math.cos(a) * r * 0.24, y + Math.sin(a) * r * 0.24 * sq, Math.max(1.6, r * 0.13), a + 1.6, k * cp, { hole: false });
    }
    p.dot(x, y, WHITE, 0.7 * k * cp);
    p.glow(x, y, r * 0.5, C[5], 0.16 * k * cp);
  }
  if (o.pool) p.shade(x - r * 1.5, y - r * 0.5, x + r * 1.5, y + r * 0.5, (px, py, out) => {
    const dx = (px - x) / (r * 1.5), dy = (py - y) / (r * 0.5), d = dx * dx + dy * dy;
    if (d >= 1) return;
    out.l = C[4]; out.k = (1 - Math.sqrt(d)) ** 2 * 0.16 * k;
  });
}

/**
 * A bank of murakumo: hard stepped cloud lumps, a dark belly, a lit upper rim and two or three drifting
 * wisps above. seed picks the lump layout; ph slides it; k fades the whole bank.
 */
export function cloudBank(p, C, x, y, w, h, seed, ph, k = 1, o = {}) {
  if (k <= 0.02) return;
  const lumps = o.lumps ?? 7;
  for (let i = 0; i < lumps; i++) {
    const u = (i + 0.5) / lumps;
    const lx = x - w / 2 + w * u + loopNoise(ph, 0.6, seed + i * 7) * w * 0.02;
    const lw = (w / lumps) * (0.9 + 0.45 * loopNoise(ph, 0.8, seed + i * 13));
    const lh = h * (0.45 + 0.5 * loopNoise(ph, 0.5, seed + i * 3));
    const base = y + h * 0.18 * loopNoise(ph, 0.4, seed + i * 5);
    p.ellipse(lx, base + lh * 0.18, lw * 0.62, lh * 0.5, C[o.body ?? 2], 0.75 * k);
    p.ellipse(lx - lw * 0.05, base - lh * 0.1, lw * 0.56, lh * 0.44, C[o.mid ?? 3], 0.7 * k);
    p.ellipse(lx - lw * 0.1, base - lh * 0.26, lw * 0.42, lh * 0.28, C[o.rim ?? 4], 0.55 * k);
    p.ellipse(lx - lw * 0.14, base - lh * 0.34, lw * 0.24, lh * 0.13, C[o.hot ?? 5], 0.3 * k);
  }
  if (o.wisps !== false) for (let i = 0; i < 3; i++) {
    const u = ((i / 3 + ph * 0.18) % 1);
    const wx = x - w / 2 + w * u, wy = y - h * (0.5 + 0.2 * i);
    if (o.minY !== undefined && wy < o.minY) continue;
    p.ellipse(wx, wy, w * 0.09, h * 0.09, C[o.rim ?? 4], 0.28 * k);
    p.dot(wx + w * 0.04, wy, C[6], 0.25 * k);
  }
}

/** A folded paper streamer (shide): three stepped white folds, one shadow side. */
export function shide(p, x, y, w, h, k = 1, o = {}) {
  if (k <= 0.02) return;
  const n = o.folds ?? 3, step = h / n;
  for (let i = 0; i < n; i++) {
    const yy = y + i * step, off = (i % 2 ? -1 : 1) * w * 0.5;
    p.poly([[x, yy], [x + w, yy], [x + w + off, yy + step * 0.8], [x + off, yy + step * 0.8]], i % 2 ? STRAW : WHITE, 0.9 * k);
    p.line(x + off * 0.4, yy + step * 0.8, x + w + off * 0.4, yy + step * 0.8, STRAW_D, 0.5 * k);
  }
}

/** A torii gate, vermilion with ink seams: two pillars, a tie beam, a curved lintel and a plaque. */
export function torii(p, C, x, y, w, h, k = 1, o = {}) {
  if (k <= 0.02) return;
  const pw = Math.max(2, Math.round(w * 0.09)), base = y;
  for (const s of [-1, 1]) {
    const px = x + s * w * 0.34;
    p.rect(px - pw / 2, base - h, pw, h, o.dark ?? VERMILION_D, k);
    p.rect(px - pw / 2 + 1, base - h, Math.max(1, pw - 2), h, o.red ?? VERMILION, 0.9 * k);
    p.dot(px, base - 2, o.dark ?? VERMILION_D, k);
  }
  // nuki (tie beam) and shimaki, then the curved kasagi on top
  p.rect(x - w * 0.46, base - h * 0.82, w * 0.92, Math.max(2, h * 0.05), o.red ?? VERMILION, k);
  p.rect(x - w * 0.46, base - h * 0.82, w * 0.92, 1, GOLD_D, 0.5 * k);
  p.rect(x - w * 0.42, base - h * 0.98, w * 0.84, Math.max(2, h * 0.05), o.dark ?? VERMILION_D, k);
  for (let i = 0; i < 9; i++) {
    const u = i / 8, bx = x - w * 0.56 + w * 1.12 * u;
    const by = base - h * 1.04 - Math.sin(u * Math.PI) * h * 0.05;
    p.rect(bx - w * 0.04, by, Math.max(2, w * 0.12), Math.max(2, h * 0.05), i % 2 ? o.red ?? VERMILION : o.dark ?? VERMILION_D, k);
  }
  // plaque
  p.rect(x - w * 0.07, base - h * 0.93, w * 0.14, h * 0.1, INK, 0.9 * k);
  p.rect(x - w * 0.05, base - h * 0.92, w * 0.1, h * 0.08, GOLD_D, 0.7 * k);
}

/**
 * An eight-headed-serpent head on a neck angle: a wedge skull, a heavy brow over a slit eye, an open jaw
 * with bone fangs and a forked tongue. `open` is 0..1, `k` fades, `ang` points the snout (0 = right).
 */
export function serpentHead(p, C, x, y, ang, len, open, k = 1, o = {}) {
  if (k <= 0.02 || len < 4) return;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
  const neck = len * 0.85, hw = len * 0.3;
  // neck: a tapering tube of dark scale with a lit ridge
  for (let i = 0; i < 7; i++) {
    const u = -neck + (i / 6) * neck * 0.7, w = hw * (1 - (i / 6) * 0.32);
    const a = P(u, -w * 0.2), b = P(u, w * 0.9);
    p.line(a[0], a[1], b[0], b[1], C[i % 2 ? 1 : 2], 0.9 * k);
    p.dot(...P(u, -w * 0.55), C[3], 0.5 * k);
  }
  // skull: a broad wedge, dark underside, lit crown
  p.poly([P(-len * 0.15, -hw), P(len * 0.5, -hw * 0.9), P(len, -hw * 0.18), P(len * 0.94, hw * 0.28), P(len * 0.3, hw * 0.7), P(-len * 0.2, hw * 0.5)], C[2], k);
  p.poly([P(-len * 0.2, -hw * 0.85), P(len * 0.46, -hw * 0.78), P(len * 0.92, -hw * 0.12), P(len * 0.4, hw * 0.16), P(-len * 0.2, hw * 0.05)], C[3], 0.95 * k);
  p.poly([P(-len * 0.1, hw * 0.42), P(len * 0.34, hw * 0.6), P(len * 0.9, hw * 0.24), P(len * 0.3, hw * 0.2)], C[1], 0.8 * k);
  // brow, eye socket and the hot slit
  p.line(...P(-len * 0.06, -hw * 0.7), ...P(len * 0.44, -hw * 0.52), C[1], 0.9 * k);
  const ex = len * 0.26, ey = -hw * 0.24;
  p.ellipse(...P(ex, ey), len * 0.17, len * 0.1, C[0], 0.95 * k);
  p.dot(...P(ex, ey), o.eye ?? C[7], 0.95 * k);
  p.dot(...P(ex + 1, ey), WHITE, 0.8 * k);
  p.glow(...P(ex, ey), 5, o.eye ?? C[6], 0.2 * k);
  if (o.horns !== false) {
    p.line(...P(-len * 0.12, -hw * 0.8), ...P(-len * 0.32, -hw * 1.5), C[2], 0.85 * k);
    p.line(...P(-len * 0.2, -hw * 0.6), ...P(-len * 0.46, -hw * 1.1), C[2], 0.7 * k);
    p.dot(...P(-len * 0.34, -hw * 1.55), C[4], 0.7 * k);
  }
  // the mouth opens downward: a dark maw, bone fangs top and bottom, a forked tongue
  const jaw = open * hw * 1.05;
  p.poly([P(len * 0.02, hw * 0.18), P(len * 0.96, hw * 0.1), P(len * 0.98, hw * 0.1 + jaw), P(len * 0.12, hw * 0.72 + jaw * 0.8)], C[0], 0.95 * k);
  p.poly([P(len * 0.06, hw * 0.34), P(len * 0.86, hw * 0.3), P(len * 0.68, hw * 0.4 + jaw * 0.5), P(len * 0.2, hw * 0.5 + jaw * 0.4)], C[4], 0.55 * k);
  p.poly([P(len * 0.2, hw * 0.6 + jaw * 0.6), P(len * 0.9, hw * 0.18 + jaw), P(len * 0.96, hw * 0.06 + jaw), P(len * 0.3, hw * 0.38 + jaw * 0.7)], C[2], 0.9 * k);
  for (let i = 0; i < 4; i++) {
    const u = len * (0.34 + i * 0.16);
    const t0 = P(u, hw * 0.24), t1 = P(u + 1.5, hw * 0.58);
    p.line(t0[0], t0[1], t1[0], t1[1], WHITE, 0.85 * k);
    if (i < 3) {
      const b0 = P(u - 2, hw * 0.32 + jaw * 0.82), b1 = P(u, hw * 0.72 + jaw * 0.7);
      p.line(b0[0], b0[1], b1[0], b1[1], WHITE, 0.7 * k);
    }
  }
  const tg = P(len * 0.7, hw * 0.4 + jaw * 0.4);
  p.line(tg[0], tg[1], ...P(len * 0.92, hw * 0.2 + jaw * 0.5), C[5], 0.75 * k);
  p.dot(...P(len * 0.94, hw * 0.16 + jaw * 0.5), C[6], 0.6 * k);
  // scale plates along the crown and the neck
  for (let i = 0; i < 3; i++) {
    const u = len * (0.05 + i * 0.2);
    p.dot(...P(u, -hw * 0.9), C[4], 0.55 * k);
    p.dot(...P(u, -hw * 0.62), C[2], 0.4 * k);
  }
  p.glow(...P(len * 0.4, -hw * 0.4), len * 0.7, C[3], 0.08 * k);
}

/** A thin trail of pale motes along a curve: `at(u)` gives [x, y], fading at both ends. */
export function moteTrail(p, C, at, n, ph, k = 1, o = {}) {
  for (let i = 0; i < n; i++) {
    const u = (i / n + ph) % 1;
    const [x, y] = at(u);
    const fade = smooth(0, 0.15, u) * (1 - smooth(0.7, 1, u));
    p.dot(x, y, i % 3 ? C[5] : WHITE, fade * k * (o.alpha ?? 0.7));
    if (i % 4 === 0) p.glow(x, y, 3.5, C[4], 0.08 * fade * k);
  }
}
