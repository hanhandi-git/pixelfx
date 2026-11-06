// The quiet punctuation of the theme: a hero drops into a low landing and the floor answers with a ring.
import { band, clamp, fit, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";

const HIT = 0.72, END = 2.65;
const LAND = ["#09080e", "#1c1a24", "#363241", "#584e62", "#7c6f83", "#a998ac", "#ddd3d8", "#ffffff"];

export const meta = {
  name: "Hero landing",
  desc: "A compact landing pose punches a white ring through the floor, lifting a fan of grit and a low wall of dust before the crater cools.",
  tags: ["onepunch", "hero", "landing", "shockwave", "dust", "crater", "one-shot"],
  size: [300, 180], origin: [150, 148], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: LAND, seed: 79 },
};

const FALL = { ...READY, x: 0, crouch: 2, lean: 1, turn: 1, fx: 8, fy: -28, bx: -7, by: -26, toeB: true };
const LANDING = { ...READY, x: 0, crouch: 11, lean: 6, turn: 1, fx: 12, fy: -17, bx: -10, by: -16, ffx: 9, fbx: -8, toeB: true };
export const act = {
  poses: [[-0.4, READY], [0.22, { ...READY, crouch: 1, lean: -3 }], [HIT - 0.05, FALL], [HIT, LANDING, "snap"], [1.25, { ...LANDING, crouch: 9, lean: 3 }], [2.05, { ...READY, x: 1 }], [END, READY]],
  hits: [{ t: HIT, stop: 0.14, shake: 0.42, amp: 3.5, push: 1.2, straw: 18, skin: "shock" }],
  dust: [{ t: HIT, x: 0, n: 15, dir: 1, c: "#ded7df" }, { t: HIT, x: 0, n: 15, dir: -1, c: "#ded7df" }],
};

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), fade = 1 - smooth(1.8, END, t);
  p.ellipse(0, -1, 20 + 10 * smooth(0, HIT, t), 2.2, C[1], 0.38 * fade);
  if (t > HIT) p.ellipse(0, -1, 38 + (t - HIT) * 18, 3, C[2], 0.3 * fade);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), seed = o.seed ?? 79;
  if (t < HIT) {
    const q = smooth(0.3, HIT, t);
    for (let i = 0; i < 12; i++) {
      const a = i * TAU / 12 + t * 2.5, d = 18 + (1 - q) * 28;
      p.dot(Math.cos(a) * d, -4 + Math.sin(a) * d * 0.4, i % 2 ? C[5] : C[6], 0.25 * q);
    }
    p.glow(0, -4, 20, C[4], 0.12 * q);
    return;
  }
  const q = t - HIT, k = 1 - smooth(0, 1.5, q), flash = Math.max(0, 1 - q / 0.14);
  const rr = 10 + 64 * Math.sqrt(clamp(q / 0.55));
  p.circle(0, -7, 8 + 18 * Math.sqrt(clamp(q / 0.18)), WHITE, flash);
  p.glow(0, -6, 38 + rr, C[5], 0.38 * flash);
  for (let i = 0; i < 3; i++) {
    const d = q - i * 0.06;
    if (d < 0) continue;
    band(p, 0, 0, Math.min(76, 12 + d * (54 + i * 15)), 0.18, 2.4 - i * 0.35, k * (0.55 - i * 0.1), C, undefined, q < 0.16);
  }
  for (let i = 0; i < 26; i++) {
    const R = rng(seed, i, 8), age = q - R.range(0, 0.15);
    if (age < 0) continue;
    const side = i % 2 ? 1 : -1, x = side * (8 + R.range(18, 74) * age), y = -2 - R.range(6, 34) * age + age * age * 130;
    if (y < -1) p.dot(x, y, i % 3 ? C[4] : C[6], 0.6 * k);
  }
  if (q < 1.1) {
    const f = 1 - smooth(0.2, 1.1, q);
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1, x = side * (22 + i * 5 + q * 20);
      p.line(x, -1, x + side * 7, -8 - q * 8, C[3], 0.38 * f);
    }
  }
}
