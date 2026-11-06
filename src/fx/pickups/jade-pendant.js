// A jade pendant of the kind a cultivator wears: an arched plaque with a cloud-scroll relief, a gold clasp
// and a red silk tassel. The hover, floor shadow and star glints follow Sprite Fusion's open-source pickup
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, clamp, ease, rand, cycle, SDF, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { JADE, CINNABAR, GILT } from "./_eastern.js";

export const meta = {
  name: "Jade pendant",
  desc: "A carved jade plaque hovers on its red cord: cloud-scroll relief catches the light, a white band runs down the stone, the silk tassel swings, and jade motes drift off its glow.",
  tags: ["pickup", "jade", "pendant", "eastern", "xianxia", "relic", "loop"],
  size: [64, 80],
  origin: [32, 72],
  duration: 2.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: JADE, seed: 21 },
};

const HOVER = 29, INK = hex("#050b10"), L = new Layer(48, 56);
// an arched plaque with straight shoulders and a flat foot, pierced by a cord hole near the top
const ARCH = SDF.subtract(
  SDF.union(SDF.box(0, 3, 9.5, 10), SDF.circle(0, -6, 10.5)),
  SDF.circle(0, -11.6, 2.3),
);

const pose = (ph) => ({ y: -HOVER - 1.8 * Math.sin(ph * TAU), a: 0.15 * Math.sin(ph * TAU + 0.8) });

export function drawBack(p, t, o) {
  const { y } = pose(t / meta.duration), lift = (-y - HOVER + 1.8) / 4;
  blobShadow(p, 0, 8.5 - lift * 1.5, 0.8 - lift * 0.18);
  pool(p, 0, 0.5, 13, 3.2, fit(o.palette, 8)[4], 0.14);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), TH = fit(CINNABAR, 8), G = fit(GILT, 8);
  const T = meta.duration, ph = t / T, { y, a } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * cs - v * sn, y + u * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [dx * cs + dy * sn, -dx * sn + dy * cs]; };

  // a cold jade halo and the hanging cord, drawn behind the stone
  p.glow(0, y - 1, 22, C[3], 0.24 + 0.06 * Math.sin(ph * TAU * 2));
  p.glowRing(0, y - 2, 4, 15, C[5], 0.18);

  // the red cord runs through the hole and up out of the plaque, so it reads as a hanging pendant
  const [cx0, cy0] = at(0, -11.6), [cx1, cy1] = at(0, -18.6);
  p.line(cx0, cy0, cx1, cy1, TH[2], 0.9);
  p.ring(cx1, cy1, 2.1, 1, TH[4], 0.95);
  p.px(cx1, cy1 - 2, TH[5]);

  // the light band runs down the relief once a loop
  const q = (ph - 0.16) / 0.34, gu = q > 0 && q < 1 ? -14 + 28 * ease.inOutSine(q) : 999;

  L.begin(-24, Math.floor(y) - 28);
  const sdf = (px, py) => { const [u, v] = local(px, py); return ARCH(u, v); };
  // the stone: milky at its lit left shoulder, deep jade in the right fold, a bright 1 px rim
  L.fill(-24, Math.floor(y) - 28, 23, Math.floor(y) + 27, (px, py) => {
    const d = ARCH(...local(px, py));
    if (d >= 0) return 0;
    const [u, v] = local(px, py), e = -d;
    let gx = ARCH(u + 0.5, v) - ARCH(u - 0.5, v), gy = ARCH(u, v + 0.5) - ARCH(u, v - 0.5);
    const gl = Math.hypot(gx, gy) || 1;
    gx /= gl; gy /= gl;
    const k = Math.max(0, 1 - e / 1.9) * 1.15, s = Math.sin(k), c = Math.cos(k);
    const b = gx * s * -0.5 + gy * s * -0.6 + c * 0.62;
    let idx = b > 0.84 ? 5 : b > 0.66 ? 4 : b > 0.34 ? 3 : 2;
    if (e < 1) idx = b > 0.85 ? 6 : b > 0.14 ? 5 : 2;
    // a pale vein sweeping through the lower half
    if (Math.abs(u * 0.55 + v * 0.84 - 1.2) < 0.65 && e > 2) idx = Math.min(5, idx + 1);
    const g = Math.abs(v - gu);
    if (g < 0.55) return WHITE;
    if (g < 1.35) idx = 5;
    // the cloud-scroll is cut into the stone: a dark groove with a lit lower-right wall
    if (relief(u, v)) return C[1];
    if (relief(u, v + 1.3) || relief(u + 1.3, v)) idx = Math.min(6, idx + 1);
    return C[idx];
  });
  // a pierced ring round the cord hole, and the gold clasp at the foot
  for (let i = 0; i < 22; i++) {
    const an = (i / 22) * TAU, rr = 4.3 + 0.25 * Math.sin(an * 2);
    const [sx, sy] = at(Math.cos(an) * rr, -11.6 + Math.sin(an) * rr);
    if (L.get(sx, sy)) L.set(sx, sy, C[2]);
  }
  L.fill(-24, Math.floor(y) - 28, 23, Math.floor(y) + 27, (px, py) => {
    const [u, v] = local(px, py);
    if (v < 11.4 || v > 15.3 || Math.abs(u) > 4.2 - Math.max(0, v - 13.4) * 0.9) return 0;
    return v < 12.2 ? G[6] : u < -0.6 ? G[5] : u > 1.2 ? G[3] : G[4];
  });
  L.outline(INK).draw(p);

  // the red cord sits in the pierced hole, its ends pinched between the stone and the clasp
  const [hx, hy] = at(0, -11.6);
  p.ring(hx, hy, 2.2, 1, TH[4], 0.95);
  p.px(hx - 2, hy - 2, TH[5]);

  // the tassel: a gold bead, a red wrapped head and strands that hang and lag behind the rock
  const [bx, by] = at(0, 14.8);
  p.px(bx, by - 1, G[6]), p.px(bx - 1, by - 1, G[5]);
  p.rect(bx - 1, by, 3, 1, TH[5]);
  p.rect(bx - 1, by + 1, 3, 2, TH[3]);
  for (let i = 0; i < 6; i++) {
    const u0 = (i - 2.5) * 0.65, sway = Math.sin(ph * TAU + 0.35 + i * 0.65) * 2.4;
    const len = 8 + (i % 3) * 1.6;
    const [sx, sy] = at(u0 * 0.5, 17.2), ex = bx + u0 * 1.5 + sway, ey = by + 3 + len;
    p.line(sx, sy, ex, ey, i % 2 ? TH[5] : TH[4]);
    p.px(ex, ey, TH[6]), p.px(ex, ey - 1, TH[5]);
  }

  // the band's own halo and, when it reaches the clasp, a star
  if (gu > -15 && gu < 15) {
    const [gx, gy] = at(0, clamp(gu, -14, 14));
    p.glow(gx, gy, 7, C[5], 0.24 * Math.sin(clamp(q, 0, 1) * Math.PI));
  }
  const tail = (ph - 0.52) / 0.2;
  if (tail > 0 && tail < 1) glint(p, bx, by, 3.6 * (1 - tail), C[6], 0.55 * (1 - tail));

  // idle twinkles round the stone
  for (let i = 0; i < 4; i++) {
    const life = 0.42, age = (((t - ((i + 0.4) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 2) * TAU, d = 9 + rand(i, o.seed, 3) * 6, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y + Math.sin(an) * d * 0.85 - age * 4, Math.round(1.7 * k), i % 2 ? C[6] : WHITE, 0.32 * k);
  }
  // jade motes shed from the stone's edge
  cycle(t, T, 6, o.seed, 0.8, (age, life, r) => {
    const k = age / life, an = r.range(0, TAU) + ph * TAU * 0.6, d = 10 + k * 7;
    const x = Math.cos(an) * d, yy = y + Math.sin(an) * d * 0.8 - k * 5;
    p.dot(x, yy, k > 0.6 ? C[6] : C[5], Math.sin(k * Math.PI) * 0.9);
    p.glow(x, yy, 2.5, C[5], 0.18 * (1 - k));
  });
}

// the cloud-scroll relief, in the plaque's own frame (u across, v down): two curls and a wave
const SCROLL = [];
for (let i = 0; i <= 26; i++) {
  const u = -6.4 + i * 0.46, v = 4.4 + Math.sin(i * 0.36) * 1.5;
  SCROLL.push([u, v]);
}
for (let i = 0; i <= 20; i++) {
  const a = 0.4 + i * 0.35, rr = 0.8 + i * 0.13;
  SCROLL.push([3.4 + Math.cos(a) * rr, 7.2 + Math.sin(a) * rr * 0.9]);
}
for (let i = 0; i <= 16; i++) {
  const a = 2.2 + i * 0.36, rr = 1.2 + i * 0.11;
  SCROLL.push([-4.2 + Math.cos(a) * rr, -2.4 + Math.sin(a) * rr * 0.9]);
}

// sample each segment so the carve has no gaps at 1 px, then key it for a fast lookup
const RELIEF = [];
for (let i = 1; i < SCROLL.length; i++) {
  const [u0, v0] = SCROLL[i - 1], [u1, v1] = SCROLL[i], n = Math.ceil(Math.hypot(u1 - u0, v1 - v0) * 2);
  for (let j = 0; j <= n; j++) {
    const k = j / n;
    RELIEF.push([u0 + (u1 - u0) * k, v0 + (v1 - v0) * k]);
  }
}
const CELL = 1.1;
const RELIEF_KEYS = new Set(RELIEF.map(([u, v]) => `${Math.round(u / CELL)},${Math.round(v / CELL)}`));

function relief(u, v) {
  return RELIEF_KEYS.has(`${Math.round(u / CELL)},${Math.round(v / CELL)}`);
}
