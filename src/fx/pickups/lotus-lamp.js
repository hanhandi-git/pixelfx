// A jade lotus lamp: a closed bud opens over dark water into a full bloom and ends there. This is a one-shot
// pickup so the last frame can rest on the open flower instead of folding back. Petals are curved tubes in 3/4.
import { fit, rand, cycle, smooth, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { JADE, PAPER, GILT, ELIXIR } from "./_eastern.js";

export const meta = {
  name: "Lotus lamp",
  desc: "A jade lotus bud opens over dark water into a full bloom: curved petals unfurl, a small flame and gold stamens appear, and the effect ends on the open flower.",
  tags: ["pickup", "lotus", "flower", "bud", "bloom", "lamp", "flame", "eastern", "xianxia", "one-shot"],
  size: [72, 80],
  origin: [36, 72],
  duration: 3.2,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: JADE, seed: 44 },
};

const HOVER = 18, BASE = -10, L = new Layer(80, 80), INK = hex("#07120f");
const SEG = 8;

/** One-way opening: no closing phase, so the last frame remains a full bloom. */
function bloom(ph) {
  return {
    outer: smooth(0.02, 0.58, ph),
    inner: smooth(0.1, 0.68, ph),
  };
}

const pose = (ph) => ({ y: -HOVER - 1.6 * Math.sin(ph * TAU), ...bloom(ph) });

/** One curved petal: quadratic centreline from the base to a tip that unfolds outward as open -> 1. */
function petalShape(az, open, len, wid, baseY) {
  const dirx = Math.sin(az), depth = Math.cos(az), r0 = 2.6;
  const base = [dirx * r0, baseY + depth * r0 * 0.35];
  const tipClosed = [dirx * 0.9, baseY - len * 0.92 + depth * 0.6];
  const tipOpen = [dirx * (r0 + len * 0.62), baseY - len * 0.14 + depth * len * 0.3];
  const tip = [tipClosed[0] + (tipOpen[0] - tipClosed[0]) * open, tipClosed[1] + (tipOpen[1] - tipClosed[1]) * open];
  const ctlClosed = [dirx * 1.8, baseY - len * 0.48];
  const ctlOpen = [dirx * (r0 + len * 0.32), baseY - len * 0.44];
  const ctl = [ctlClosed[0] + (ctlOpen[0] - ctlClosed[0]) * open, ctlClosed[1] + (ctlOpen[1] - ctlClosed[1]) * open];

  const center = [], tangent = [];
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG, w0 = (1 - u) * (1 - u), w1 = 2 * (1 - u) * u, w2 = u * u;
    center.push([w0 * base[0] + w1 * ctl[0] + w2 * tip[0], w0 * base[1] + w1 * ctl[1] + w2 * tip[1]]);
    tangent.push([2 * (1 - u) * (ctl[0] - base[0]) + 2 * u * (tip[0] - ctl[0]), 2 * (1 - u) * (ctl[1] - base[1]) + 2 * u * (tip[1] - ctl[1])]);
  }

  const left = [], right = [], lit = [], shade = [];
  for (let i = 0; i <= SEG; i++) {
    const u = i / SEG, tl = Math.hypot(tangent[i][0], tangent[i][1]) || 1;
    const nx = -tangent[i][1] / tl, ny = tangent[i][0] / tl;
    const prof = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.02)), 0.58);
    const w = wid * (0.55 + 0.45 * open) * prof;
    left.push([center[i][0] + nx * w, center[i][1] + ny * w]);
    right.push([center[i][0] - nx * w, center[i][1] - ny * w]);
    lit.push([center[i][0] + nx * w * 0.52, center[i][1] + ny * w * 0.52]);
    shade.push([center[i][0] - nx * w * 0.52, center[i][1] - ny * w * 0.52]);
  }
  return { base, tip, center, left, right, lit, shade, dirx, depth };
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), { y, outer } = pose(t / meta.duration), lift = (-y - HOVER + 1.6) / 4;
  blobShadow(p, 0, 9 - lift * 1.2, 0.72 - lift * 0.12);
  pool(p, 0, 0.5, 16, 3.6, C[4], 0.1 + 0.12 * outer);
  // two lily pads at the waterline
  for (const [x, rx, ry, ph] of [[-13, 8.4, 3, 0.3], [13, 7.2, 2.6, 2.4]]) {
    p.ellipse(x, 0, rx, ry, (d) => (d > 0.78 ? C[4] : d > 0.5 ? C[2] : C[1]), 0.9);
    p.ellipse(x, 0, rx - 1.4, ry - 0.8, (d) => (d > 0.65 ? C[3] : C[2]), 0.75);
    p.tri(x, 0, x + Math.cos(ph) * rx * 0.85, -ry * 0.3, x + Math.cos(ph) * rx * 0.6, ry * 0.6, C[1], 0.8);
  }
  // flat water ripples
  for (let k = 0; k < 3; k++) {
    const r = 15 + k * 4, a = 0.07 / (k + 1);
    for (let i = 0; i <= 28; i++) {
      const an = (i / 28) * TAU, x = Math.cos(an) * r, yy = Math.sin(an) * 4.2 + 0.4;
      if (Math.sin(an) > 0.2) p.dot(x, yy, C[4], a);
    }
  }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), P = fit(PAPER, 8), G = fit(GILT, 8), E = fit(ELIXIR, 8);
  const T = meta.duration, ph = t / T, { y, outer, inner } = pose(ph);
  const baseY = y + BASE;

  p.glow(0, baseY - 4, 21, C[4], 0.1 + 0.13 * outer);
  p.glow(0, baseY - 4, 8, E[4], 0.08 + 0.1 * outer);
  p.glowRing(0, baseY - 3, 3, 11, C[5], 0.1);

  // a curved, two-pixel stem with one small leaf; it keeps the bloom grounded without reading as a pole
  let sx0 = 0, sy0 = -1;
  for (let i = 1; i <= 24; i++) {
    const u = i / 24, sy = -1 + (baseY + 3) * u, sx = Math.sin(u * Math.PI) * 1.35 + u * 0.8;
    p.line(sx0, sy0, sx, sy, C[2]);
    p.px(sx, sy, C[3], 0.4);
    sx0 = sx, sy0 = sy;
  }
  const lu = 0.46, lx = Math.sin(lu * Math.PI) * 1.35 + lu * 0.8, ly = -1 + (baseY + 3) * lu;
  p.poly([[lx, ly - 0.5], [lx + 5, ly - 2.6], [lx + 4.2, ly + 1.4]], C[3], 0.85);
  p.line(lx, ly - 0.5, lx + 4.6, ly - 2.2, C[4], 0.45);
  // a small green calyx cups the base of the bud
  p.ellipse(0, baseY + 1.8, 4.5, 2.2, (d) => (d > 0.68 ? C[3] : C[2]), 0.9);
  p.ellipse(0, baseY + 1.2, 3.2, 1.4, (d) => (d > 0.4 ? C[2] : C[3]), 0.5);
  // sepals that peel down as the flower opens
  for (let i = 0; i < 3; i++) {
    const az = -0.65 + (i * TAU) / 3, dirx = Math.sin(az), depth = Math.cos(az);
    const bx = dirx * 2.4, by = baseY + 1 + depth * 0.8;
    const tx = dirx * (2.4 + 6.5 * outer), ty = baseY - 6.5 * (1 - outer) + 1.6 * outer + depth * 1.2;
    p.poly([[bx - 1.2, by], [bx + 1.2, by], [tx, ty]], C[2], 0.95);
    p.line(bx - 1.2, by, tx, ty, C[4], 0.45);
  }

  // petals, back to front; outer first, then the cream inner ring
  const petals = [];
  for (let i = 0; i < 5; i++) petals.push({ az: 0.2 + (i * TAU) / 5, len: 23, wid: 5.8, open: outer, layer: 0 });
  for (let i = 0; i < 3; i++) petals.push({ az: 0.75 + (i * TAU) / 3, len: 8 + 7 * inner, wid: 3.8, open: inner, layer: 1 });
  petals.sort((a, b) => a.layer - b.layer || Math.cos(a.az) - Math.cos(b.az));

  L.begin(-40, Math.floor(y) - 60);
  for (const r of petals) {
    const s = petalShape(r.az, r.open, r.len, r.wid, baseY);
    const front = s.depth > 0, isInner = r.layer === 1;
    const baseCol = isInner ? P[3] : front ? C[3] : C[2];
    const litCol = isInner ? (r.open > 0.38 ? P[5] : P[4]) : r.open > 0.55 ? C[5] : C[4];
    const edgeCol = isInner ? P[5] : C[4];
    const poly = [...s.left, ...s.right.slice().reverse()];
    L.q.poly(poly, baseCol, 0.98);
    // a light facet toward the left and a deeper one away from it
    const litSide = s.dirx <= 0 ? s.lit : s.shade;
    const darkSide = s.dirx <= 0 ? s.shade : s.lit;
    L.q.poly([...s.center, ...litSide.slice().reverse()], litCol, 0.78);
    L.q.poly([...s.center, ...darkSide.slice().reverse()], isInner ? P[3] : C[2], 0.45);
    for (let i = 0; i < SEG; i++) {
      L.q.line(s.center[i][0], s.center[i][1], s.center[i + 1][0], s.center[i + 1][1], edgeCol, 0.3);
      L.q.line(s.left[i][0], s.left[i][1], s.left[i + 1][0], s.left[i + 1][1], s.dirx <= 0 ? edgeCol : INK, 0.6);
      L.q.line(s.right[i][0], s.right[i][1], s.right[i + 1][0], s.right[i + 1][1], s.dirx <= 0 ? INK : edgeCol, 0.6);
    }
    // a pale lip at the tip once the petal is open
    if (r.open > 0.45) {
      L.q.line(s.center[SEG - 1][0], s.center[SEG - 1][1], s.tip[0], s.tip[1], isInner ? P[5] : C[5], 0.55);
      L.q.px(s.tip[0], s.tip[1], isInner ? P[6] : C[5]);
    }
  }
  L.outline(INK).draw(p);

  // heart: a gold receptacle, the flame and a ring of stamens, revealed by the opening petals
  const fk = smooth(0.16, 0.78, outer);
  p.ellipse(0, baseY - 2.2, 3.1, 2.1, (d) => (d < 0.45 ? G[5] : G[3]), 0.95 * (0.35 + 0.65 * outer));
  if (fk > 0.015) {
    const flick = 0.5 + 0.5 * Math.sin(ph * TAU * 7 + 0.6), fs = 0.8 + flick * 1.0;
    const flame = [
      [0, baseY - 5.2 - fs], [1.4, baseY - 3.2], [1, baseY - 0.4], [0, baseY + 1.2], [-1, baseY - 0.4], [-1.4, baseY - 3.2],
    ];
    p.poly(flame, E[5], fk);
    p.poly([[0, baseY - 4.4 - fs * 0.7], [0.9, baseY - 2.4], [0.4, baseY - 0.4], [-0.5, baseY - 0.4], [-0.9, baseY - 2.2]], E[7], fk);
    p.line(0, baseY - 2, 0, baseY + 0.6, WHITE, 0.85 * fk);
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * TAU + 0.2 + Math.sin(ph * TAU * 2 + i) * 0.04;
      const sx = Math.cos(an) * 3.4, sy = baseY - 2.2 + Math.sin(an) * 1.5;
      p.line(Math.cos(an) * 1.8, baseY - 2.5 + Math.sin(an) * 0.8, sx, sy, G[4], fk);
      p.px(sx, sy, G[6], fk);
    }
    glint(p, 0, baseY - 5.2 - fs * 0.5, 1.1, E[7], 0.26 * fk);
  } else {
    // a small warm seam at the closed tip, so the bud still reads as a lamp
    const ty = baseY - 20.5;
    p.px(0, ty, E[5], 0.85);
    p.px(0, ty + 1, E[3], 0.5);
    p.glow(0, ty, 4, E[4], 0.12);
  }

  // loose petal only while the flower is open, and a few fireflies around the bloom
  if (outer > 0.38) {
    cycle(t, T, 2, o.seed, 1.8, (age, life, r) => {
      const k = age / life, an = r.range(0, TAU) + k * 3;
      const x = Math.cos(an) * (7 + k * 6) + Math.sin(an * 2) * 2, yy = baseY - 1 + k * 13;
      const sz = 1.3 + k * 0.7;
      p.tri(x, yy, x + sz, yy - sz * 0.6, x - sz * 0.4, yy + sz * 0.8, k > 0.7 ? C[3] : C[5], 0.8 * outer);
      p.px(x, yy, C[6], outer);
    });
  }
  if (outer > 0.28) {
    for (let i = 0; i < 4; i++) {
      const life = 0.5, age = (((t - ((i + 0.3) / 4) * T) % T) + T) % T;
      if (age > life) continue;
      const an = rand(i, o.seed, 2) * TAU, d = 9 + rand(i, o.seed, 3) * 6, k = Math.sin((age / life) * Math.PI);
      glint(p, Math.cos(an) * d, baseY - 2 + Math.sin(an) * d * 0.6 - age * 3, Math.round(1.4 * k), i % 2 ? C[6] : WHITE, 0.24 * k * outer);
    }
  }
  cycle(t, T, 6, o.seed, 1.2, (age, life, r) => {
    const k = age / life, an = r.range(0, TAU) + ph * TAU * 0.4, d = 8 + k * 11;
    const x = Math.cos(an) * d, yy = baseY - 4 + Math.sin(an) * d * 0.55 + k * 2;
    p.dot(x, yy, k > 0.6 ? E[5] : C[4], Math.sin(k * Math.PI) * (0.2 + 0.55 * outer));
    p.glow(x, yy, 2.2, E[4], (0.03 + 0.08 * outer) * (1 - k));
  });
}
