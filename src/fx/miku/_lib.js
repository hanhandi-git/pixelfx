// Shared pieces for the miku set: the teal idol palette, music notes, twin-tail ribbons, sound rings,
// a microphone, a leek and equaliser bars. Original pixel art built for this library; a fan-art reading of a
// virtual singer's stage language, not a copy of any game's sprites.
import { fit, hex, TAU, clamp, rand, WHITE } from "../../core/index.js";

/** Hatsune-teal, dark to bright: deep stage navy, shadow teal, mid teal, idol teal, aqua, mint, ice, white. */
export const MIKU = ["#070f1e", "#0b2233", "#0e4458", "#137a8b", "#22b3b0", "#4ce4d0", "#a8fff0", "#ffffff"];
/** A small magenta accent for ribbon knots, note glints and confetti. */
export const PINK = ["#2a0a1c", "#641034", "#a81a5c", "#e83c8e", "#ff86c0", "#ffd0e8"];
/** The leek: green leaves, cream shaft. */
export const LEEK = ["#0a140c", "#143a19", "#24622a", "#3c8c34", "#62b046", "#8fd25e", "#c2ee8a", "#f0ffc8"];
export const BULB = ["#141a10", "#3a4a2c", "#8a9a62", "#c8d4a0", "#eef4d4", "#ffffff"];

const GLYPH = {
  eighth: [
    ".....ff",
    "....fff",
    "....f..",
    "...sf..",
    "...s...",
    "...s...",
    "...s...",
    ".hhs...",
    "hhhh...",
    ".hh....",
  ],
  beamed: [
    "...ffffff",
    "...s....s",
    "...s....s",
    "...s....s",
    "...s....s",
    "...s....s",
    "...s....s",
    ".hhs..hhs",
    "hhhh.hhhh",
    ".hh...hh.",
  ],
  tiny: [
    ".ff",
    ".f.",
    ".s.",
    "hh.",
    "hd.",
  ],
};
const ANCHOR = { eighth: [1, 7], beamed: [1, 7], tiny: [0, 3] };
const TONE = { s: 4, f: 6, h: 6, d: 5 };

/**
 * A music note, scaled in whole pixels, anchored near its head. o: { kind: "eighth"|"beamed"|"tiny",
 * s (scale, default 2), flip, a, outline (dark color or 0), glint (draw a white pixel), C (ramp) }.
 * Notes are the set's clearest readable motif, so they stay hard-edged with an optional 1 px dark rim.
 */
export function note(p, x, y, o = {}) {
  const kind = o.kind ?? "eighth", s = Math.max(1, Math.round(o.s ?? 2)), C = fit(o.C ?? MIKU, 8), a = o.a ?? 1;
  const rows = GLYPH[kind], [ax, ay] = ANCHOR[kind], W = rows[0].length, H = rows.length;
  const X = Math.round(x) - ax * s, Y = Math.round(y) - ay * s;
  // rasterize the glyph into a final-resolution tone grid
  const grid = new Int8Array(W * s * H * s).fill(-1);
  for (let r = 0; r < H; r++)
    for (let q = 0; q < W; q++) {
      const ch = rows[r][q];
      if (ch === ".") continue;
      const cx = o.flip ? W - 1 - q : q;
      const tone = TONE[ch] ?? 5;
      for (let j = 0; j < s; j++)
        for (let i = 0; i < s; i++) {
          grid[(cx * s + i) + (r * s + j) * W * s] = tone;
        }
    }
  const GW = W * s, GH = H * s, at = (i, j) => i >= 0 && j >= 0 && i < GW && j < GH && grid[i + j * GW] >= 0;
  if (o.outline)
    for (let j = 0; j < GH; j++)
      for (let i = 0; i < GW; i++)
        if (!at(i, j) && (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1))) p.dot(X + i, Y + j, o.outline, a);
  for (let j = 0; j < GH; j++)
    for (let i = 0; i < GW; i++) {
      const v = grid[i + j * GW];
      if (v >= 0) p.dot(X + i, Y + j, C[clamp(v, 0, C.length - 1)], a);
    }
  // a hard 1 px glint on the head: two pixels, no dither
  if (o.glint) {
    let hr = -1, hc = -1;
    outer: for (let r = 0; r < H; r++)
      for (let q = 0; q < W; q++)
        if (rows[r][q] === "h") { hr = r; hc = q; break outer; }
    const gx = X + (o.flip ? (W - 1 - hc) * s : hc * s) + (o.flip ? s - 1 : 0);
    const gy = y + (hr - ay) * s + Math.floor(s / 2);
    p.px(gx, gy, WHITE);
    p.px(gx + (o.flip ? -1 : 1), gy, C[7]);
  }
}

/**
 * A tapered, waving ribbon (a twin-tail strand), 3-4 px wide with a lit edge and a dark rim.
 * o: { len, w, dir, curl (px of sideways bend at the tip), wave (px), phase, C, a, rim, split }.
 * The path is parametric (x = base + curl*u^2 + wave*u*sin), so the strand keeps a readable S-curve.
 */
export function ribbon(p, x0, y0, o = {}) {
  const len = o.len ?? 36, w = o.w ?? 3.5, dir = o.dir ?? Math.PI / 2, C = fit(o.C ?? MIKU, 8);
  const phase = o.phase ?? 0, wave = o.wave ?? 3, curl = o.curl ?? 8, a = o.a ?? 1, rim = o.rim ?? C[0];
  const steps = Math.max(10, Math.ceil(len * 1.4)), ca = Math.cos(dir), sa = Math.sin(dir);
  const pt = (u) => {
    const bend = curl * u * u + wave * u * Math.sin(phase + u * TAU * 1.15);
    return [x0 + ca * u * len - sa * bend, y0 + sa * u * len + ca * bend];
  };
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, [x, y] = pt(u), [nx, ny] = pt(Math.min(1, u + 1e-3));
    let tx = nx - x, ty = ny - y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl; ty /= tl;
    const ww = Math.max(1, w * (0.6 + 0.4 * Math.sin(Math.min(1, u * 1.8) * Math.PI * 0.5)) * (1 - 0.5 * u));
    path.push([u, x, y, -ty, tx, ww]);
  }
  const fadeAt = (u) => (u > 0.86 ? Math.max(0, (1 - u) / 0.14) : 1);
  // a wider dark underlay first, so the rim is solid instead of stippled
  if (rim)
    for (const [u, x, y, px, py, ww] of path)
      for (let q = -Math.ceil(ww / 2 + 1); q <= Math.ceil(ww / 2 + 1); q++) p.dot(x + px * q, y + py * q, rim, a * fadeAt(u));
  for (const [u, x, y, px, py, ww] of path)
    for (let q = -Math.ceil(ww / 2); q <= Math.ceil(ww / 2); q++) {
      const v = q / Math.max(0.6, ww / 2);
      if (Math.abs(v) > 1) continue;
      const tone = v < -0.45 ? 6 : v > 0.5 ? 2 : 4;
      p.dot(x + px * q, y + py * q, C[tone], a * fadeAt(u));
    }
  if (o.accent) {
    const [, kx, ky] = path[Math.min(2, path.length - 1)];
    p.rect(Math.round(kx) - 2, Math.round(ky) - 2, 4, 5, o.accent, a);
    p.rect(Math.round(kx) - 1, Math.round(ky) - 1, 2, 3, o.accent2 ?? C[6], a);
  }
  if (o.split) {
    const [u, sx, sy, px, py] = path[path.length - 1];
    for (const s of [-1, 1])
      for (let d = 1; d <= 5; d++) {
        p.dot(sx + px * s * d * 0.9 - Math.sin(dir) * d * 0.3, sy + py * s * d * 0.9 + Math.cos(dir) * d * 0.3, C[d > 3 ? 2 : 5], a * (1 - d / 6));
      }
  }
}

/**
 * A sound ring with a waveform edge: radius rx/ry, scalloped by `lobes`, `amp` px deep, thickness th.
 * keep(angle) picks a half for depth. Drawn with a white-hot rim and a teal inner edge.
 */
export function soundRing(p, cx, cy, rx, ry, o = {}) {
  const C = fit(o.C ?? MIKU, 8), a = o.a ?? 1, amp = o.amp ?? 1.6, lobes = o.lobes ?? 8;
  const phase = o.phase ?? 0, th = o.th ?? 1.6, keep = o.keep ?? (() => true), rim = o.rim ?? WHITE;
  if (rx < 1 || ry < 0.5 || a <= 0) return;
  const n = Math.max(24, Math.ceil(TAU * Math.max(rx, ry) * 1.35));
  for (let i = 0; i < n; i++) {
    const g = (i / n) * TAU;
    if (!keep(g)) continue;
    const mod = 1 + (Math.sin(g * lobes + phase) * amp) / Math.max(rx, ry);
    const x = cx + Math.cos(g) * rx * mod, y = cy + Math.sin(g) * ry * mod;
    for (let d = 0; d < th; d += 0.5) {
      const u = d / th, k = 1 - u * 0.6, c = d < 0.5 ? rim : u < 0.5 ? C[6] : C[4];
      p.dot(cx + Math.cos(g) * (rx * mod - d), cy + Math.sin(g) * (ry * mod - d), c, a * k);
    }
    if (o.spark && i % 7 === 0) p.dot(x, y - 1, WHITE, a);
  }
  if (o.glow !== false) p.glow(cx, cy, Math.max(rx, ry) * 1.25 + 4, C[4], 0.12 * a);
}

/** A pixel microphone, capsule centered at (x, y), scale s (1 or 2). */
export function mic(p, x, y, s = 1, C = fit(MIKU, 8), a = 1) {
  const R = fit(C, 8), X = Math.round(x), Y = Math.round(y), light = R[6], mid = R[4], dark = R[2], rim = R[0];
  const box = (dx, dy, w, h, c) => p.rect(X + dx * s, Y + dy * s, w * s, h * s, c, a);
  box(-1, -4, 7, 9, rim); // capsule rim
  box(0, -3, 5, 7, dark);
  box(1, -3, 3, 6, mid);
  box(1, -3, 1, 5, light);
  for (let i = -2; i <= 2; i += 2) box(1, i, 3, 1, rim);
  box(-1, 5, 7, 1, rim);
  box(0, 6, 5, 1, dark);
  box(2, 7, 2, 4, rim); // handle
  box(2, 7, 1, 4, mid);
  box(1, 11, 4, 1, dark);
  p.glow(X, Y, 9, R[5], 0.3 * a);
}

/**
 * A leek, drawn rotated: (x, y) is the middle of the shaft, `ang` its direction (leaves at +ang).
 * A cream shaft widens into a bulb at the base and carries two green bands; three green blades splay
 * from the tip, each with a dark rim and a lit upper edge.
 * o: { len, w, a, C (leaf ramp), B (shaft ramp), rim }.
 */
export function leek(p, x, y, ang = -0.5, o = {}) {
  const len = o.len ?? 42, w = o.w ?? 3, a = o.a ?? 1;
  const C = (o.C ?? LEEK).map(hex), B = (o.B ?? BULB).map(hex), rim = o.rim ?? C[0];
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const at = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
  const u0 = -len * 0.5, u1 = len * 0.12;
  // leaves: three tapered blades, dark underlay then green fill with a lit upper edge
  const leaves = [
    { bend: -0.95, l: len * 0.3, w: 1.5 },
    { bend: -0.22, l: len * 0.44, w: 1.9 },
    { bend: 0.58, l: len * 0.27, w: 1.4 },
  ];
  for (const L of leaves) {
    const [bx, by] = at(u1, 0);
    for (let d = 0; d <= L.l; d += 0.5) {
      const u = d / L.l, la = ang + L.bend + u * u * 0.7 * Math.sign(L.bend || 1), ww = Math.max(0.6, L.w * (1 - u * 0.9));
      const lx = bx + Math.cos(la) * d, ly = by + Math.sin(la) * d;
      for (let q = -Math.ceil(ww + 0.9); q <= Math.ceil(ww + 0.9); q++) p.dot(lx - Math.sin(la) * q, ly + Math.cos(la) * q, rim, a);
      for (let q = -ww; q <= ww; q += 0.5) {
        const v = q / Math.max(0.6, ww);
        const c = v < -0.55 ? C[6] : v < 0.1 ? C[4] : C[3];
        p.dot(lx - Math.sin(la) * q, ly + Math.cos(la) * q, c, a);
      }
    }
  }
  // shaft and bulb, sampled per pixel in the rotated bounding box
  const half = len * 0.55 + 4;
  for (let py = Math.floor(y - half); py <= Math.ceil(y + half); py++)
    for (let px = Math.floor(x - half); px <= Math.ceil(x + half); px++) {
      const dx = px + 0.5 - x, dy = py + 0.5 - y;
      const u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      if (u < u0 || u > u1 + 1) continue;
      const q = (u + len * 0.34) / (len * 0.15), bulb = u < -len * 0.18 ? Math.max(0, 1 - q * q) : 0;
      const rr = w * (0.82 + 0.18 * (1 - (u - u0) / (u1 - u0))) + bulb * w * 1.15;
      if (Math.abs(v) > rr) {
        if (Math.abs(v) < rr + 1) p.dot(px, py, rim, a);
        continue;
      }
      const lit = v < -rr * 0.35, shade = v > rr * 0.4;
      if (bulb > 0.03) {
        // the white bulb: a lit face, a cream body, a green-grey shadow
        p.dot(px, py, B[lit ? 4 : shade ? 2 : 3], a);
        if (lit && Math.abs(v) < rr * 0.3) p.dot(px, py, B[4], a);
        if (bulb > 0.35 && Math.abs(v) < 0.9) p.dot(px, py, B[4], a);
      } else {
        // the pale green shaft, brightest on the upper-left
        p.dot(px, py, C[lit ? 6 : shade ? 3 : 4], a);
        if (lit && Math.abs(v) < rr * 0.3 && rand(px, py, 9) < 0.4) p.dot(px, py, C[5], a);
      }
    }
  // roots at the cut end
  const [rx, ry] = at(u0 + 0.5, 0);
  for (let i = 0; i < 4; i++) p.dot(rx + rand(i, 2) * 3 - 1.5, ry + rand(i, 3) * 3 - 1.5, B[2], a * 0.8);
  // two green bands clasping the shaft
  for (const q of [-0.2, -0.12, 0.02]) {
    const [bx, by] = at(len * q, 0);
    for (let v = -w * 0.75; v <= w * 0.75; v += 0.5) p.dot(bx - sa * v, by + ca * v, C[2], a * 0.55);
  }
}

/** Equaliser bars standing on (x, y), `n` bars of width 2 + gap 1, heights from a moving spectrum. */
export function eqBars(p, x, y, n, h, phase, C = fit(MIKU, 8), o = {}) {
  const R = fit(C, 8), a = o.a ?? 1;
  for (let i = 0; i < n; i++) {
    const v = 0.18 + 0.82 * Math.abs(Math.sin(phase + i * 1.7) * Math.cos(phase * 0.7 + i));
    const bh = Math.max(1, Math.round(h * v)), bx = Math.round(x + i * 3);
    for (let j = 0; j < bh; j++) p.dot(bx, y - j, j > bh - 3 ? WHITE : j > bh * 0.55 ? R[5] : R[3], a);
    p.dot(bx + 1, y - bh, R[6], a);
  }
}
