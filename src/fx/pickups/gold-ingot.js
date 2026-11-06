// A gold sycee (yuanbao) of the sort that fills a cultivator's purse. The hover, floor shadow, shine sweep
// and twinkles follow Sprite Fusion's open-source pickup and coin
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, clamp, ease, rand, cycle, SDF, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { GILT } from "./_eastern.js";

export const meta = {
  name: "Gold ingot",
  desc: "A stamped gold sycee hovers over its shadow: a raised centre catches a white shine that sweeps across the metal, the two upturned ends glint, and gold dust drifts off the base.",
  tags: ["pickup", "gold", "ingot", "sycee", "yuanbao", "eastern", "treasure", "loop"],
  size: [64, 64],
  origin: [32, 56],
  duration: 2.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: GILT, seed: 22 },
};

const HOVER = 19, INK = hex("#160f05"), L = new Layer(48, 36);
// a wide shoe of gold: rounded base, a low central mound and two little horns curling up at the ends
const BODY = SDF.union(
  SDF.box(0, 2, 11, 4.5),
  SDF.circle(-11, 2, 4.5),
  SDF.circle(11, 2, 4.5),
  SDF.circle(0, -1.5, 7),
  SDF.capsule(-10.5, 1.8, -14.2, -4.8, 2.3),
  SDF.capsule(10.5, 1.8, 14.2, -4.8, 2.3),
);
const BOSS = SDF.translate(SDF.scale(SDF.circle(0, 0, 1), 5.8), 0, -2.5);
const pose = (ph) => ({ y: -HOVER - 1.6 * Math.sin(ph * TAU), a: 0.05 * Math.sin(ph * TAU + 1.1) });

export function drawBack(p, t, o) {
  const { y } = pose(t / meta.duration), lift = (-y - HOVER + 1.6) / 4;
  blobShadow(p, 0, 11.5 - lift * 1.6, 0.8 - lift * 0.16);
  pool(p, 0, 0.5, 15, 3.4, fit(o.palette, 8)[4], 0.14);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), T = meta.duration, ph = t / T, { y, a } = pose(ph);
  // the sycee leans a hair; only the highlight moves, the silhouette stays on whole pixels
  const shear = Math.sin(a) * 1.4;
  const at = (u, v) => [u + v * shear, y + v];
  const local = (px, py) => { const v = py - y; return [px - v * shear, v]; };

  p.glow(0, y - 1, 21, C[4], 0.18 + 0.03 * Math.sin(ph * TAU * 2));
  p.glowRing(0, y, 3, 14, C[5], 0.16);

  // the shine crosses the face once a loop
  const q = (ph - 0.2) / 0.42, gu = q > 0 && q < 1 ? -18 + 36 * ease.inOutSine(q) : 999;

  L.begin(-24, Math.floor(y) - 20);
  L.fill(-24, Math.floor(y) - 20, 23, Math.floor(y) + 15, (px, py) => {
    const [u, v] = local(px, py), d = BODY(u, v);
    if (d >= 0) return 0;
    const e = -d;
    let gx = BODY(u + 0.5, v) - BODY(u - 0.5, v), gy = BODY(u, v + 0.5) - BODY(u, v - 0.5);
    const gl = Math.hypot(gx, gy) || 1;
    gx /= gl; gy /= gl;
    const k = Math.max(0, 1 - e / 2.1) * 1.2, s = Math.sin(k), c = Math.cos(k);
    const b = gx * s * -0.5 + gy * s * -0.6 + c * 0.62;
    let idx;
    if (v < -2.2) idx = b > 0.9 ? 5 : b > 0.55 ? 4 : b > 0.2 ? 3 : 2; // the lit top face
    else if (v < 4) idx = b > 0.62 ? 4 : b > 0.25 ? 3 : 2; // the front cheek
    else idx = 2; // the base in its own shadow
    if (e < 0.95) idx = b > 0.1 ? 5 : 2;
    // the ends catch the light a step brighter than the trough between them
    if (v < 0 && Math.abs(u) > 9) idx = Math.min(5, idx + 1);
    const g = Math.abs(u * 0.82 + v * 0.57 - gu);
    if (g < 0.55) return WHITE;
    if (g < 1.4) idx = 5;
    return C[idx];
  });
  // the raised centre: a lit crown, a shaded lower-right flank and a white shoulder
  L.fill(-24, Math.floor(y) - 20, 23, Math.floor(y) + 15, (px, py) => {
    const [u, v] = local(px, py), d = BOSS(u, v);
    if (d >= 0) return 0;
    const e = -d, lit = (-u * 0.55 - (v + 2.5) * 0.84) / Math.max(1, Math.hypot(u, v + 2.5));
    const rr = Math.hypot(u / 5.8, (v + 2.5) / 3.0);
    let idx = lit > 0.72 ? 4 : lit > 0.2 ? 3 : lit > -0.4 ? 2 : 1;
    if (e < 0.65) idx = lit > 0.1 ? 5 : 3;
    if (rr > 0.52 && rr < 0.74) idx = lit > 0.15 ? 2 : 1; // an engraved medallion ring
    if (lit > 0.9 && e < 1.2) return C[6];
    const g = Math.abs(u * 0.82 + v * 0.57 - gu);
    if (g < 0.55) return WHITE;
    if (g < 1.4) idx = 5;
    return C[idx];
  });
  // the crease where each horn meets the shoe, so the ends read as turned up
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 12; i++) {
      const v = -5.4 + i * 0.5, u = s * (9.2 + i * 0.18), [sx, sy] = at(u, v);
      if (L.get(sx, sy)) L.set(sx, sy, C[2]);
      if (L.get(sx - s, sy)) L.set(sx - s, sy, C[5]);
    }
  }
  L.outline(INK).draw(p);

  if (gu > -19 && gu < 19) {
    const [gx, gy] = at(clamp(gu, -15, 15), -2.8);
    p.glow(gx, gy, 10, C[6], 0.34 * Math.sin(clamp(q, 0, 1) * Math.PI));
  }
  // glints: on the crown when the shine spikes, and idle twinkles at the ends
  const spike = ((ph - 0.2) / 0.42) % 1;
  if (spike > 0 && spike < 1) glint(p, -3, y - 4, 1.6 + 2.4 * Math.sin(spike * Math.PI), C[6], 0.4 * Math.sin(spike * Math.PI));
  for (let i = 0; i < 5; i++) {
    const life = 0.36, age = (((t - ((i + 0.5) / 5) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 2) * TAU, d = 10 + rand(i, o.seed, 3) * 6, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y + Math.sin(an) * d * 0.7 - age * 5, Math.round(1.6 * k), i % 2 ? C[6] : WHITE, 0.3 * k);
  }
  cycle(t, T, 5, o.seed, 0.9, (age, life, r) => {
    const k = age / life, x = r.range(-14, 14) + Math.sin(age * 3 + r.range(0, TAU)) * 2;
    const yy = y + 5 - k * 16 - r.range(0, 3);
    p.dot(x, yy, k > 0.6 ? C[6] : C[5], (1 - k) * 0.9);
    p.glow(x, yy, 2.5, C[5], 0.14 * (1 - k));
  });
}
