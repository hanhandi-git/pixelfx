// A paper lantern turning slowly over its shadow: gold ribs sweep the red paper as it spins, the flame
// breathes behind it, embers drift up and the silk tassel lags below. The hover, shadow and glints follow
// Sprite Fusion's open-source pickup (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License,
// Copyright (c) 2026 Hugo Duprez.
import { fit, rand, cycle, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { LANTERN, CINNABAR, GILT } from "./_eastern.js";

export const meta = {
  name: "Paper lantern",
  desc: "A red paper lantern spins slowly on its cord: gold ribs sweep across the lit paper, the flame inside breathes, embers curl up from its wake, and the silk tassel sways below.",
  tags: ["pickup", "lantern", "paper", "light", "eastern", "xianxia", "loop"],
  size: [64, 88],
  origin: [32, 80],
  duration: 2.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: LANTERN, seed: 32 },
};

const HOVER = 29, RX = 8.6, RY = 10, L = new Layer(48, 56), INK = hex("#140606");
const pose = (ph) => ({ y: -HOVER - 2 * Math.sin(ph * TAU), a: 0.09 * Math.sin(ph * TAU + 0.4), spin: ph * TAU });

export function drawBack(p, t, o) {
  const { y } = pose(t / meta.duration), lift = (-y - HOVER + 2) / 4;
  blobShadow(p, 0, 8 - lift * 1.4, 0.78 - lift * 0.15);
  pool(p, 0, 0.5, 14, 3.2, fit(o.palette, 8)[4], 0.16);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), R = fit(CINNABAR, 8), G = fit(GILT, 8);
  const T = meta.duration, ph = t / T, { y, a, spin } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * cs - v * sn, y + u * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [dx * cs + dy * sn, -dx * sn + dy * cs]; };
  const breathe = 0.5 + 0.5 * Math.sin(ph * TAU * 5);
  const seam = RX * Math.sin(spin);
  const ribs = [];
  for (let k = 0; k < 6; k++) {
    const th = spin + (k * Math.PI) / 3, front = Math.cos(th);
    if (front > 0.04) ribs.push({ x: RX * Math.sin(th), k });
  }

  // the cord loop and the short line that ties it to the crown, then the warm halo behind the paper
  const [cx0, cy0] = at(0, -RY - 3);
  p.ring(cx0, cy0, 2.4, 1, R[3], 0.9);
  p.line(cx0, cy0 + 2, cx0, cy0 + 4, R[2]);
  p.glow(0, y + 1, 24, C[4], 0.28 + 0.05 * breathe);
  p.glowRing(0, y, 3, 14, C[5], 0.16);

  L.begin(-24, Math.floor(y) - 30);
  L.fill(-24, Math.floor(y) - 30, 23, Math.floor(y) + 29, (px, py) => {
    const [u, v] = local(px, py);
    // a paper oval with a slightly flattened crown and foot
    const d = Math.hypot(u / RX, v / RY) - 1;
    if (d > 0) return 0;
    // gold caps at the crown and foot
    if (v < -RY + 1.6 || v > RY - 1.6) {
      const lit = (-u * 0.5 - v * 0.86) / Math.max(1, Math.hypot(u, v));
      return lit > 0.1 ? G[5] : G[3];
    }
    // the paper: a hot heart behind the flame, cooler red at the rim, lit left
    const core = 1 - Math.hypot(u * 0.9, v - 0.5) / 10;
    let k = core > 0.66 ? 6 : core > 0.44 ? 5 : core > 0.2 ? 4 : 3;
    if (u < -3.5 && k < 6) k++;
    if (Math.hypot(u / RX, v / RY) > 0.82) k = Math.max(2, k - 2);
    // the flame, a short white leaf that breathes
    if (Math.abs(u) < 1.3 - Math.abs(v) * 0.18 && v > -2.5 - breathe * 1.5 && v < 3.2) {
      if (Math.abs(u) < 0.55 && v > -1.2) return WHITE;
      return C[7];
    }
    // rotating gold ribs and the paper seam
    for (const rib of ribs) if (Math.abs(u - rib.x) < 0.62) return rib.k % 2 ? G[3] : G[4];
    if (Math.abs(u - seam) < 0.55) return C[2];
    // a couple of paper fibres, fixed to the sheet
    if ((u > 3 && u < 4.2 && v > -4 && v < -3) || (u < -4 && v > 4 && v < 4.7)) return C[3];
    return C[k];
  });
  L.outline(INK).draw(p);

  // the wrapped red head and silk tassel under the foot
  const [bx, by] = at(0, RY + 0.4);
  p.px(bx, by, G[6]), p.rect(bx - 1, by + 1, 3, 2, R[3]);
  for (let i = 0; i < 5; i++) {
    const off = (i - 2) * 0.8, sway = Math.sin(ph * TAU + i * 0.65) * 1.5;
    const [sx, sy] = at(off * 0.5, RY + 3), ex = bx + off * 1.5 + sway, ey = by + 4 + 8 + (i % 2) * 1.6;
    p.line(sx, sy, ex, ey, i % 2 ? R[5] : R[4]);
    p.px(ex, ey, R[6]);
  }

  // embers curling up out of the lantern's wake
  cycle(t, T, 7, o.seed, 1.2, (age, life, r) => {
    const k = age / life, u = r.range(-7, 7) + Math.sin(age * 5 + r.range(0, TAU)) * 1.5;
    const v = 8 - k * 20 - r.range(0, 3), [x, yy] = at(u, v);
    p.dot(x, yy, k > 0.55 ? C[6] : C[5], Math.sin(k * Math.PI) * 0.9);
    if (k > 0.3 && k < 0.55) p.px(x + 0.7, yy, WHITE);
    p.glow(x, yy, 2.4, C[5], 0.16 * (1 - k));
  });
  // a glint travelling the top cap, and idle twinkles
  const gp = (ph * 2) % 1;
  if (gp < 0.2) glint(p, at(0, -RY)[0], at(0, -RY)[1], 2.4 * Math.sin((gp / 0.2) * Math.PI), G[6], 0.3);
  for (let i = 0; i < 4; i++) {
    const life = 0.38, age = (((t - ((i + 0.3) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 2) * TAU, dd = 9 + rand(i, o.seed, 3) * 5, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * dd, y + Math.sin(an) * dd * 0.8, Math.round(1.5 * k), i % 2 ? C[6] : WHITE, 0.26 * k);
  }
}
