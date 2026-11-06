// A paper talisman hovering on its red cord. Its brush-written seal lights stroke by stroke, the square seal
// answers with a flash, and burned embers fall away. The hover, glint and stray motes follow Sprite Fusion's
// open-source pickup and sparkle (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License,
// Copyright (c) 2026 Hugo Duprez.
import { fit, clamp, ease, smooth, rand, cycle, fly, TAU, WHITE, hex, mix } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { PAPER, CINNABAR, GILT, JADE } from "./_eastern.js";

export const meta = {
  name: "Paper talisman",
  desc: "A yellow paper talisman flutters on its cord: cinnabar brushwork lights stroke by stroke, the square seal flashes, burned embers fall away, and ink motes drift in the cold light.",
  tags: ["pickup", "talisman", "paper", "seal", "eastern", "xianxia", "charm", "loop"],
  size: [64, 80],
  origin: [32, 72],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: PAPER, seed: 25 },
};

const HOVER = 28, L = new Layer(40, 52), INK = hex("#140e08"), MOON = hex("#cfeaf0");
const pose = (ph) => ({ y: -HOVER - 2.0 * Math.sin(ph * TAU), a: 0.11 * Math.sin(ph * TAU + 0.2), sx: 1 - 0.08 * (0.5 + 0.5 * Math.sin(ph * TAU * 2)) });

export function drawBack(p, t, o) {
  const { y } = pose(t / meta.duration), lift = (-y - HOVER + 2.0) / 4;
  blobShadow(p, 0, 7.5 - lift * 1.2, 0.75 - lift * 0.14);
  pool(p, 0, 0.5, 12, 3, fit(o.palette, 8)[4], 0.12);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), R = fit(CINNABAR, 8), G = fit(GILT, 8), M = fit(JADE, 8);
  const T = meta.duration, ph = t / T, { y, a, sx } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * sx * cs - v * sn, y + u * sx * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [(dx * cs + dy * sn) / sx, -dx * sn + dy * cs]; };

  // the cord loop above the paper, the halo, and the paper's own warm light
  const cord = 0.9 * Math.sin(ph * TAU + 0.9);
  const [tx, ty] = at(cord, -16), [tx0, ty0] = at(0, -14.5);
  p.line(tx0, ty0, tx, ty - 1.8, R[2], 0.8);
  p.ring(tx, ty - 3, 3.2, 1, R[3], 0.9);
  p.px(tx, ty - 6, R[5]);
  p.glow(0, y, 19, C[4], 0.2 + 0.06 * Math.sin(ph * TAU * 2));

  // the brush run: a warm line writes down the paper, then the seal answers
  const q = (ph - 0.08) / 0.5, litV = -15 + 30 * ease.inOutSine(clamp(q, 0, 1));
  const written = smooth(0.08, 0.14, ph);
  const fade = 1 - smooth(0.72, 0.97, ph);
  const flash = Math.exp(-(((ph - 0.61) / 0.035) ** 2));
  const showBrush = q > 0 && q < 1;

  L.begin(-20, Math.floor(y) - 26);
  // paper: cool moonlit left edge, warm stained face, a torn lower edge
  L.fill(-20, Math.floor(y) - 26, 19, Math.floor(y) + 25, (px, py) => {
    const [u, v] = local(px, py);
    const edge = smooth(0, 8, Math.abs(u));
    const top = -15 + Math.max(0, Math.abs(u) - 7) * 1.1;
    const bot = 14 + (Math.floor(u * 0.75 + 30) % 2 ? 0.9 : -0.6) - (Math.abs(u) > 7.4 ? 1.2 : 0)
      + 1.0 * Math.sin(ph * TAU * 2 + u * 0.55) * (0.3 + 0.7 * edge);
    if (Math.abs(u) > 9.2 || v < top || v > bot) return 0;
    let idx = 4;
    if (u < -4) idx = 5;
    if (u > 4.5) idx = 3;
    if (v > 11) idx = 3;
    if (Math.abs(u) > 8.2 || v < -13.4) idx = Math.min(5, idx + 1);
    // two old stains, placed once and stable
    if ((u > 4.4 && u < 6.4 && v > -5 && v < -2.5) || (u < -5 && v > 7 && v < 9)) idx = 3;
    // the cinnabar border, inset from the torn edge
    if ((Math.abs(u) > 7.9 && v > -13 && v < 12.4) || (v > -14 && v < -13 && Math.abs(u) < 8) || (v > 12 && v < 12.8 && Math.abs(u) < 8)) return R[2];
    // the header band and the gold rule beneath it
    if (v > -12.8 && v < -10.2 && Math.abs(u) < 8) return v < -12.1 ? R[4] : u < -1 ? R[3] : R[2];
    if (v > -9.8 && v < -9.1 && Math.abs(u) < 7.6) return G[2];
    // a lit fold follows the fluttering lower edge
    if (v > bot - 1.4 && v < bot - 0.3) idx = Math.min(5, idx + 1);
    return C[idx];
  });

  // a small square seal near the foot; it is filled paper-side when the brush passes over it
  const sealLit = litV > 10.5 ? fade : 0, sealed = Math.max(sealLit, flash);
  L.fill(-20, Math.floor(y) - 26, 19, Math.floor(y) + 25, (px, py) => {
    const [u, v] = local(px, py);
    if (Math.abs(u) > 3.4 || v < 7.4 || v > 11.8) return 0;
    const edge = Math.abs(u) > 2.6 || v < 8.2 || v > 11;
    if (edge) return sealed > 0.4 ? mix(R[6], WHITE, flash) : R[2];
    return sealed > 0.4 ? mix(R[4], WHITE, flash) : R[3];
  });

  // brush strokes: a vertical spine, two bars and a hooked foot, then a short sigil under it
  const strokes = [
    [[-2.6, -9.2], [0, -9.2], [2.1, -8.2]],
    [[0, -9.2], [0, -0.4]],
    [[-2.9, -6.9], [2.5, -6.9]],
    [[-2.4, -4.6], [2.2, -2.8]],
    [[-1.4, 0.2], [1.4, 0.2], [1.4, 2.9], [-1.4, 2.9], [-1.4, 0.2]],
    [[0, 3.8], [0, 5.4]],
  ];
  for (const pts of strokes) {
    for (let i = 1; i < pts.length; i++) {
      const [u0, v0] = pts[i - 1], [u1, v1] = pts[i], n = Math.ceil(Math.hypot(u1 - u0, v1 - v0) * 3);
      for (let j = 0; j <= n; j++) {
        const k = j / n, u = u0 + (u1 - u0) * k, v = v0 + (v1 - v0) * k, [sx2, sy2] = at(u, v);
        if (!L.get(sx2, sy2)) continue;
        const lit = v < litV ? written : 0;
        const c = lit > 0 ? mix(R[2], Math.abs(v - litV) < 2 ? WHITE : mix(R[5], R[6], lit), fade) : R[2];
        L.set(sx2, sy2, v > -13 && v < -10 ? C[2] : c);
      }
    }
  }
  // the seal's own invented glyph, cut out of the red block
  for (const [u, v] of [[-1.5, 8.6], [1.3, 8.6], [-1.5, 9.7], [1.3, 9.7], [0, 8.4], [0, 10.8]]) {
    const [sx2, sy2] = at(u, v);
    if (L.get(sx2, sy2)) L.set(sx2, sy2, sealed > 0.4 ? mix(R[7], WHITE, flash) : C[2]);
  }
  L.outline(INK).draw(p);

  // the gold eyelet and a cold touch on the moonlit corner
  p.px(tx, ty + 1, G[6]), p.px(tx - 1, ty + 1, G[4]), p.px(tx + 1, ty + 1, G[3]);
  for (const [u, v] of [[-8.6, -12.4], [-8.2, -11], [-7.6, -9.8]]) {
    const [mx, my] = at(u, v);
    if (p.get(mx, my)) p.px(mx, my, MOON);
  }

  // the brush line and its light
  if (showBrush) {
    const [bx, by] = at(0, litV);
    for (let u = -7; u <= 7; u++) {
      const [px2, py2] = at(u, litV);
      if (p.get(px2, py2)) p.px(px2, py2, Math.abs(u) < 3 ? WHITE : mix(R[5], C[6], 0.5));
    }
    p.glow(bx, by, 7, R[5], 0.3);
  }
  // the seal flash and its star
  if (flash > 0.05) {
    const [sx2, sy2] = at(0, 9.6);
    p.glow(sx2, sy2, 12, R[5], 0.4 * flash);
    glint(p, sx2, sy2, 2.5 + 3 * flash, C[6], 0.45 * flash);
  }

  // embers burned off the foot: only alive between the flash and the loop's end
  const since = (ph - 0.61) * T;
  for (let i = 0; i < 7; i++) {
    const delay = rand(i, o.seed, 1) * 0.06, age = since - delay, life = 0.32 + rand(i, o.seed, 2) * 0.22;
    if (age < 0 || age > life) continue;
    const k = age / life, [ox, oy] = at((rand(i, o.seed, 3) - 0.5) * 12, 14);
    const vx = (rand(i, o.seed, 4) - 0.5) * 26, vy = -14 - rand(i, o.seed, 5) * 12;
    const [x, yy] = fly(ox, oy, vx, vy, age, 90, 3);
    const c = k < 0.3 ? WHITE : k < 0.6 ? R[5] : R[3];
    p.px(x, yy, c);
    if (k < 0.5) p.line(x - vx * 0.02, yy - vy * 0.02, x, yy, R[4], (1 - k) * 0.7);
    p.glow(x, yy, 2.5, R[4], 0.2 * (1 - k));
  }
  // idle twinkles and ink motes
  for (let i = 0; i < 4; i++) {
    const life = 0.4, age = (((t - ((i + 0.35) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 7) * TAU, d = 9 + rand(i, o.seed, 8) * 6, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y + Math.sin(an) * d * 0.8, Math.round(1.4 * k), i % 2 ? C[6] : WHITE, 0.26 * k);
  }
  cycle(t, T, 4, o.seed, 1, (age, life2, r) => {
    const k = age / life2, x = r.range(-13, 13), yy = y + r.range(-13, 13) - k * 4;
    p.dot(x, yy, k > 0.5 ? R[6] : M[5], (1 - k) * 0.5);
  });
}
