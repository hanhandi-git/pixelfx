// A row of readable pressure hits: each fist is a separate beat, with the wake of the previous punch still visible.
import { band, clamp, fit, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";

const END = 3.25, START = 0.58, TARGET = 300;
const CARNAGE = ["#080711", "#17152b", "#2a2a58", "#45499c", "#687ce0", "#9ecbff", "#ddf4ff", "#ffffff"];
const HITS = [0.58, 0.88, 1.18, 1.48, 1.78, 2.08];

export const meta = {
  name: "Consecutive normal punches",
  desc: "Six compressed fists strobe across the field in a relentless chain: overlapping afterimages, blue-white pressure wakes, hit stars and a final floor ring.",
  tags: ["onepunch", "normal", "punch", "combo", "flurry", "impact", "technique", "one-shot"],
  size: [440, 190], origin: [76, 164], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: CARNAGE, seed: 73, reach: TARGET },
};

const READY_P = { ...READY, x: -1, crouch: 4, lean: -2, turn: 1, fx: 7, fy: -23, bx: -4, by: -22, armsFront: true };
export const act = {
  target: { x: TARGET },
  poses: [[-0.4, READY], [0.12, READY_P], [START, { ...READY_P, crouch: 5, lean: 4 }, "snap"], [1.1, { ...READY_P, x: 4, crouch: 4, lean: 7 }, "snap"], [1.8, { ...READY_P, x: 6, crouch: 3, lean: 8 }, "snap"], [2.35, { ...READY_P, x: 4, crouch: 5, lean: 2 }], [END, READY]],
  hits: HITS.map((t, i) => ({ t, stop: i === HITS.length - 1 ? 0.12 : 0.055, shake: 0.22 + i * 0.025, amp: 2.2 + i * 0.25, push: 0.7, straw: 8 + i * 2, skin: "shock" })),
  dust: HITS.map((t, i) => ({ t, x: 100 + i * 44, n: 5, dir: i % 2 ? -1 : 1, c: "#c5e9ff" })),
};

function fist(p, C, x, y, r, a, spin = 0) {
  p.circle(x, y, r + 2, C[1], a);
  p.poly([[x - r * 0.8, y - r * 0.3], [x - r * 0.15, y - r], [x + r * 0.8, y - r * 0.55], [x + r, y + r * 0.2], [x + r * 0.2, y + r], [x - r * 0.8, y + r * 0.45]], C[4], a);
  p.line(x - r * 0.55, y - r * 0.45, x + r * 0.6, y + r * 0.36, C[6], a * 0.8);
  p.line(x - r * 0.15, y - r * 0.8, x + r * 0.35, y - r * 0.1, WHITE, a * 0.7);
  p.glow(x, y, r * 3.2, C[4], 0.22 * a);
  for (let i = 0; i < 3; i++) {
    const q = spin + i * 0.4;
    p.line(x - Math.cos(q) * r * 1.4, y - Math.sin(q) * r * 0.8, x - Math.cos(q) * r * 3.3, y - Math.sin(q) * r * 1.5, C[5], a * 0.45);
  }
}

function hit(p, C, x, y, q, seed, index) {
  if (q < 0 || q > 0.48) return;
  const k = 1 - smooth(0, 0.46, q), flash = Math.max(0, 1 - q / 0.11);
  const rr = 5 + 22 * Math.sqrt(clamp(q / 0.2));
  p.circle(x, y, rr, C[6], 0.72 * flash);
  p.circle(x, y, rr * 0.52, WHITE, flash);
  for (let i = 0; i < 8; i++) {
    const a = i * TAU / 8 + index * 0.3, len = 12 + (i % 2 ? 16 : 30) * Math.min(1, q / 0.2);
    p.line(x + Math.cos(a) * 3, y + Math.sin(a) * 3, x + Math.cos(a) * len, y + Math.sin(a) * len * 0.7, i % 2 ? C[5] : C[6], k * 0.58);
  }
  for (let i = 0; i < 7; i++) {
    const R = rng(seed, index * 9 + i, 12), a = R.range(-2.9, 0.15), d = R.range(10, 38) * q;
    p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d - q * q * 80, i % 2 ? C[5] : C[4], k * 0.7);
  }
  p.ellipse(x, -1, 10 + q * 22, 1.8, C[5], k * 0.28);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), fade = 1 - smooth(2.45, END, t);
  p.ellipse(TARGET, -1, 30, 2.2, C[1], 0.25 * fade);
  for (let i = 0; i < 5; i++) band(p, 90 + i * 48, 0, 12 + i * 2, 0.16, 1, fade * 0.12, C);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), seed = o.seed ?? 73, target = o.reach ?? TARGET;
  for (let i = 0; i < HITS.length; i++) {
    const ht = HITS[i], q = t - ht, x = target - (HITS.length - 1 - i) * 42;
    if (q < -0.16 || q > 0.52) continue;
    if (q < 0) {
      const k = smooth(-0.16, 0, q);
      fist(p, C, x - 26 * (1 - k), -28, 5 + i * 0.25, k * 0.55, t * 4 + i);
    } else {
      fist(p, C, x, -28, 6 + i * 0.2, Math.max(0, 1 - q / 0.18), t * 4 + i);
      hit(p, C, x, -28, q, seed, i);
    }
  }
  if (t < START) {
    const q = smooth(0, START, t);
    for (let i = 0; i < 16; i++) {
      const a = i * TAU / 16 + t * 2, d = 20 + (1 - q) * 22;
      p.dot(12 + Math.cos(a) * d, -25 + Math.sin(a) * d * 0.65, i % 2 ? C[5] : C[6], 0.32 * q);
    }
  }
}
