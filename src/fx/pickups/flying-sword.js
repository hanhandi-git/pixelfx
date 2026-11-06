// A small flying sword racing a figure-eight, a sword-qi trail cooling behind it. The path, comet tail,
// floor light and shed sparks follow Sprite Fusion's open-source pickup orb
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, rand, cycle, TAU, WHITE, hex } from "../../core/index.js";
import { glint, blobShadow, pool } from "./_lib.js";
import { STEEL, GILT, CINNABAR } from "./_eastern.js";

export const meta = {
  name: "Flying sword",
  desc: "A miniature flying sword races a figure-eight on a sword-qi ribbon: the blade banks through the loop, the trail cools to jade, sparks fall, and its light sweeps the floor.",
  tags: ["pickup", "sword", "blade", "flight", "eastern", "xianxia", "loop"],
  size: [96, 64],
  origin: [48, 56],
  duration: 2.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: STEEL, seed: 33 },
};

const A = 26, B = 8, HOVER = 23, INK = hex("#050a10"), TIP = 17;
// a figure-eight that leans across the floor
const at = (s) => {
  const a = (s / meta.duration) * TAU;
  return [A * Math.sin(a), -HOVER + B * Math.sin(2 * a) - 3 * Math.cos(a)];
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), [x, y] = at(t);
  blobShadow(p, x, 4 + (y + HOVER) * 0.05, 0.4);
  pool(p, x, 0.5, 9, 2.4, C[4], 0.2);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(GILT, 8), R = fit(CINNABAR, 8);
  const T = meta.duration, [x, y] = at(t);
  const [x0, y0] = at(t - 0.02), [x1, y1] = at(t + 0.02);
  const tx0 = x1 - x0, ty0 = y1 - y0, tl = Math.hypot(tx0, ty0) || 1;
  // quantise the bank to 16 directions so the blade keeps crisp pixel edges while it races
  const step = Math.PI / 8, an = Math.round(Math.atan2(ty0 / tl, tx0 / tl) / step) * step;
  const dx = Math.cos(an), dy = Math.sin(an), nx = -dy, ny = dx;
  const P = (u, v) => [x + u * dx + v * nx, y + u * dy + v * ny];

  // sword-qi: a thin cooling wisp behind the blade, mostly light so the sword stays the read
  const N = 38;
  for (let i = N; i >= 1; i--) {
    const u = i / N, [qx, qy] = at(t - u * 0.3);
    p.glow(qx, qy, 3 + 4 * (1 - u), C[4], 0.11 * (1 - u));
    if (i % 2 === 0) p.dot(qx, qy, u < 0.22 ? C[6] : u < 0.58 ? C[4] : C[3], 0.55 * (1 - u));
  }
  // a short bright line leaving the grip, where the qi is still hot
  const [bx0, by0] = at(t), [qx0, qy0] = at(t - 0.06);
  p.line(bx0, by0, qx0, qy0, C[6], 0.7);

  // the blade: dark edge, steel body, white leading edge, gold guard and a red-wrapped grip
  const outline = [P(TIP + 0.8, 0), P(4, 2.3), P(-3.5, 2), P(-3.5, -2), P(4, -2.3)];
  p.poly(outline, INK);
  p.poly([P(TIP, 0), P(3.4, 1.4), P(-3, 0.9), P(-3, 0.1)], C[5]);
  p.poly([P(TIP, 0), P(3.4, -1.4), P(-3, -0.9), P(-3, -0.1)], C[3]);
  p.line(...P(TIP, 0), ...P(-2.6, 0), C[2]);
  p.line(...P(TIP - 0.6, 0.35), ...P(4, 1.3), C[6]);
  p.line(...P(TIP - 2.6, 0.6), ...P(5, 0.9), WHITE);
  p.line(...P(-3.5, 3.6), ...P(-3.5, -3.6), G[4]);
  p.line(...P(-4, 3.8), ...P(-4, -3.8), INK);
  p.poly([P(-4, 1.3), P(-7.5, 0.9), P(-7.5, -0.9), P(-4, -1.3)], R[2]);
  p.line(...P(-4.6, 0.8), ...P(-6.2, 0.6), R[4]);
  p.px(...P(-7.8, 0), G[6]);
  // a short streamer trailing the pommel
  const wave = Math.sin((t / T) * TAU * 3) * 1.2;
  p.line(...P(-7.9, 0), ...P(-11, 1 + wave), R[3]);
  p.line(...P(-11, 1 + wave), ...P(-13, 2.4 + wave), R[4]);
  // steel light: a glow along the blade and a star at the point
  p.glowLine(...P(11, 0), ...P(-2, 0), 5, C[5], 0.24);
  const beat = 0.5 + 0.5 * Math.sin((t / T) * TAU * 2 + 0.6);
  p.px(...P(TIP - 0.4, 0), WHITE);
  if (beat > 0.55) glint(p, ...P(TIP - 1, 0), 0.6 + 0.8 * beat, C[6], 0.2 * beat);

  // sparks shed from the ribbon, falling and winking out
  cycle(t, T, 9, o.seed, 0.55, (age, life, r) => {
    const k = age / life, [sx, sy] = at(t - 0.08 - k * 0.12);
    const vx = (r.range(-10, 10)) * 1.5, vy = -6 - r.range(0, 12);
    const px = sx + vx * age, py = sy + vy * age + age * age * 26;
    if (py > -0.5) return;
    p.px(px, py, k < 0.3 ? WHITE : k < 0.65 ? C[6] : C[4]);
    p.glow(px, py, 2.2, C[5], 0.16 * (1 - k));
  });
  // a couple of idle twinkles round the loop
  for (let i = 0; i < 3; i++) {
    const life = 0.3, age = (((t - ((i + 0.4) / 3) * T) % T) + T) % T;
    if (age > life) continue;
    const an2 = rand(i, o.seed, 3) * TAU, d = 14 + rand(i, o.seed, 4) * 10, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an2) * d, y + Math.sin(an2) * d * 0.5, Math.round(1.4 * k), i % 2 ? C[6] : WHITE, 0.24 * k);
  }
}
