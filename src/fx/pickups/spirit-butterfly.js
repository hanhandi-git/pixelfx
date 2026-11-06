// A spirit butterfly darting and banking through a figure-eight, its jade wings beating fast and its wake of
// motes winking out behind it. The path, comet-like shed particles and floor light follow Sprite Fusion's
// open-source pickup orb (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026
// Hugo Duprez.
import { fit, rand, cycle, TAU, WHITE } from "../../core/index.js";
import { glint, blobShadow, pool } from "./_lib.js";
import { AZURE, GILT } from "./_eastern.js";

export const meta = {
  name: "Spirit butterfly",
  desc: "A jade spirit butterfly darts and banks through a figure-eight: it turns with its flight, wings snap open and shut, speed lines trail its dashes, and its light sweeps the floor.",
  tags: ["pickup", "butterfly", "spirit", "wing", "eastern", "xianxia", "loop"],
  size: [80, 64],
  origin: [40, 56],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: AZURE, seed: 34 },
};

const A = 24, HOVER = 22;
// A figure-eight whose phase speeds up and slows down twice a loop, so the butterfly darts and then hangs for
// a beat. Every term has an integer frequency, so the seam is exact.
const at = (s) => {
  const a = (s / meta.duration) * TAU, u = a + 0.28 * Math.sin(2 * a);
  return [A * Math.sin(u) + 2.5 * Math.sin(3 * u + 0.6), -HOVER + 7 * Math.sin(2 * u) + 1.6 * Math.sin(6 * u + 0.8) - 1.2 * Math.cos(3 * u + 0.2)];
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), [x, y] = at(t), lift = (-y - HOVER) / 10;
  blobShadow(p, x, 3.5, 0.44 - lift * 0.05);
  pool(p, x, 0.5, 9 + lift * 2, 2.3, C[4], 0.18);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(GILT, 8), T = meta.duration, ph = t / T;
  const [x, y] = at(t), [x0, y0] = at(t - 0.02), [x1, y1] = at(t + 0.02);
  const heading = Math.atan2(y1 - y0, x1 - x0);
  // eleven beats a loop: the wings nearly close at zero and snap open at the tips
  const flap = Math.sin(ph * TAU * 11), open = 0.18 + 0.82 * Math.abs(flap), sx = 0.12 + 0.88 * open;
  const flapFar = Math.sin((ph - 0.035) * TAU * 11), openFar = 0.18 + 0.82 * Math.abs(flapFar), sxFar = 0.12 + 0.88 * openFar;
  const bob = -1.05 * flap;
  // face the way it flies, then roll into the turn; a continuous angle keeps the banking smooth
  const ang = heading + Math.PI / 2 + 0.16 * Math.sin(ph * TAU * 2 + 0.4) + 0.04 * flap;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const SC = 1.18;
  const Q = (u, v, s = sx) => [x + u * s * SC * ca - v * SC * sa, y + u * s * SC * sa + v * SC * ca + bob];
  const sweepPts = (pts, sweep) => pts.map(([u, v]) => [u * Math.cos(sweep) - v * Math.sin(sweep), u * Math.sin(sweep) + v * Math.cos(sweep)]);
  const sweep = 0.16 * flap, sweepFar = 0.16 * flapFar;

  // a soft aura, a faint dashed light-wake, and the mote wake left along the path
  p.glow(x, y, 18, C[5], 0.2 + 0.07 * open);
  for (let i = 1; i <= 12; i++) {
    const u = i / 12, [qx, qy] = at(t - u * 0.18);
    p.dot(qx, qy, C[3], 0.4 * (1 - u));
    if (i % 3 === 0) p.glow(qx, qy, 2.4, C[4], 0.07 * (1 - u));
  }
  // two short speed lines on the fast half of the dart, behind the body
  const dash = Math.max(0, Math.cos(2 * (ph * TAU)));
  if (dash > 0.15) {
    const vl = Math.hypot(x1 - x0, y1 - y0) || 1, vx = (x1 - x0) / vl, vy = (y1 - y0) / vl, nx = -vy, ny = vx;
    for (const k of [-1, 1]) {
      p.line(x - vx * 5 + nx * k * 3.2, y - vy * 5 + ny * k * 3.2, x - vx * (11 + Math.abs(k) * 1.5) + nx * k * 5.2, y - vy * (11 + Math.abs(k) * 1.5) + ny * k * 5.2, C[3], 0.55 * dash);
      p.line(x - vx * 4 + nx * k * 2, y - vy * 4 + ny * k * 2, x - vx * 7 + nx * k * 3, y - vy * 7 + ny * k * 3, C[5], 0.45 * dash);
    }
  }
  cycle(t, T, 9, o.seed, 0.5, (age, life, r) => {
    const k = age / life, [mx, my] = at(t - 0.05 - k * 0.14);
    const ox = mx + r.range(-2, 2) + age * r.range(-4, 4), oy = my + r.range(-2, 2) + age * r.range(1, 6);
    if (k < 0.75) p.px(ox, oy, k < 0.35 ? C[6] : C[4]);
    p.glow(ox, oy, 2.2, C[5], 0.14 * (1 - k));
  });

  // the wings: the far side uses a slightly lagged beat, the near side the live one
  const upperR = [[0.6, -2.4], [4, -6], [8, -5], [8.4, -1], [3.6, 0.6], [0.8, 0]];
  const lowerR = [[0.6, 0.8], [4.4, 1.4], [7, 4.2], [4, 6], [1.2, 3]];
  const mirror = (pts) => pts.map(([u, v]) => [-u, v]);
  const upperNear = sweepPts(upperR, sweep), lowerNear = sweepPts(lowerR, sweep);
  const upperFar = mirror(sweepPts(upperR, sweepFar)), lowerFar = mirror(sweepPts(lowerR, sweepFar));
  const wing = (pts, fill, rim, lead, s) => {
    p.poly(pts.map(([u, v]) => Q(u, v, s)), fill);
    p.polyline(pts.map(([u, v]) => Q(u, v, s)).concat([Q(pts[0][0], pts[0][1], s)]), rim);
    if (lead) p.polyline([Q(pts[0][0], pts[0][1], s), Q(pts[1][0], pts[1][1], s), Q(pts[2][0], pts[2][1], s)], lead);
  };
  wing(upperFar, C[2], C[1], C[4], sxFar);
  wing(lowerFar, C[2], C[1], C[3], sxFar);
  p.line(...Q(-3.6, -4.2, sxFar), ...Q(-1.2, -1.6, sxFar), C[3]);
  p.line(...Q(-3.4, 4.4, sxFar), ...Q(-1.4, 2.2, sxFar), C[2]);
  p.px(...Q(-5.2, -3.3, sxFar), G[2]), p.px(...Q(-4.2, 4.4, sxFar), G[2]);

  // body, head and antennae, with the head leading the flight and the antennae whipping on the beat
  const sway = 0.6 * Math.sin(ph * TAU * 4 + 0.5);
  p.line(...Q(-0.4, -4.4), ...Q(-0.4, 4.4), C[1]);
  p.line(...Q(0.6, -4.4), ...Q(0.6, 4.4), C[1]);
  p.line(...Q(0, -4), ...Q(0, 4.4), C[6]);
  p.px(...Q(0, -5), WHITE), p.px(...Q(0, -4.2), C[5]);
  p.line(...Q(0, -5), ...Q(-2.6 + sway, -7.4), C[5]);
  p.line(...Q(0, -5), ...Q(2.6 + sway, -7.4), C[5]);
  p.px(...Q(-2.8 + sway, -7.6), C[6]), p.px(...Q(2.8 + sway, -7.6), C[6]);

  wing(upperNear, C[4], C[1], C[6], sx);
  wing(lowerNear, C[3], C[1], C[5], sx);
  p.line(...Q(3.6, -4.2), ...Q(1.2, -1.6), C[5]);
  p.line(...Q(3.4, 4.4), ...Q(1.4, 2.2), C[4]);
  p.px(...Q(5.2, -3.3), G[5]), p.px(...Q(4.2, 4.4), G[4]);
  if (open > 0.9) {
    const tipA = Q(8.4, -1), tipB = Q(7, 4.2);
    glint(p, tipA[0], tipA[1], 1.4 + 0.6 * open, C[6], 0.22);
    glint(p, tipB[0], tipB[1], 1.1, C[6], 0.16);
    p.px(tipA[0] + 1, tipA[1] - 1, C[5]);
    p.px(tipB[0] + 1, tipB[1] + 1, C[5]);
  }

  // idle twinkles round the flight
  for (let i = 0; i < 3; i++) {
    const life = 0.3, age = (((t - ((i + 0.4) / 3) * T) % T) + T) % T;
    if (age > life) continue;
    const a = rand(i, o.seed, 3) * TAU, d = 9 + rand(i, o.seed, 4) * 8, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(a) * d, y + Math.sin(a) * d * 0.6, Math.round(1.3 * k), i % 2 ? C[6] : WHITE, 0.24 * k);
  }
}
