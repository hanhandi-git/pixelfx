// A boss phase transition is a scene, not a hit: the arena goes quiet, light and leaves pull inward, then the
// boss roars and the whole floor rings. The encounter lays its phase banner over the same beat.
import { PAL, fit, hex, lerp, seg, ease, TAU, burst, fly, band, sparkle } from "../../core/index.js";

export const meta = {
  name: "Phase Roar",
  desc: "A boss phase change: motes spiral inward, then a roar bursts a white core, three floor rings and a storm of leaves; the floor keeps glowing underneath.",
  tags: ["boss", "phase", "roar", "transition", "fantasy", "one-shot"],
  kind: "boss-attack",
  size: [320, 180],
  origin: [160, 150],
  duration: 3,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.leaf, seed: 1 },
};

export const attack = {
  telegraph: 1.0,
  hits: [{ t: 1.0, amp: 5, shake: 0.6, damage: 0, target: "hero" }],
};

const ROAR = 1.0, END = 3.0;
const GOLD = ["#3a2a08", "#6a4a0e", "#a87418", "#e0a82a", "#ffd85a", "#fff4b8"].map(hex);

function leaf(p, x, y, a, C, k) {
  const cs = Math.cos(a), sn = Math.sin(a), flip = Math.sin(a * 2.3 + x * 0.2) > 0;
  const c = flip ? C[5] : C[4], c2 = flip ? C[6] : C[3];
  for (let i = 0; i < 3; i++) {
    const px = x + cs * i - sn * (i & 1) * 0.5, py = y + sn * i + cs * (i & 1) * 0.5;
    p.dot(px, py, i === 2 ? c2 : c, k);
  }
  p.dot(x - sn * 2, y + cs * 2, C[2], k * 0.7);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 7), H = hex("#fffbe0"), seed = o.seed ?? 1;
  // the air pulls inward before the roar: motes and leaves spiral to the centre and the floor rune lights
  if (t < ROAR + 0.1) {
    const k = seg(t, 0, ROAR), easeK = ease.inCubic(k);
    p.ellipse(0, 2, 120 + k * 28, 10, C[1], 0.35);
    for (let i = 0; i < 42; i++) {
      const a = (i / 42) * TAU + k * 2.2, r = lerp(150, 8, easeK) * (0.6 + (i % 4) * 0.13);
      const x = Math.cos(a) * r, y = -32 + Math.sin(a) * r * 0.38;
      const c = i % 3 ? (k > 0.65 ? GOLD[5] : C[5]) : GOLD[4];
      p.dot(x, y, c, 0.35 + 0.5 * k);
      if (i % 4 === 0) p.glow(x, y, 5, c, 0.1 * k);
    }
    // a floor seal with eight ticks, drawing itself in
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU + k * 0.8, rr = 62 + 22 * k;
      p.dot(Math.cos(a) * rr * 1.2, 2 + Math.sin(a) * rr * 0.12, i % 6 ? C[4] : GOLD[5], (0.2 + 0.5 * k) * (0.6 + 0.4 * Math.sin(t * 18)));
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + k * 0.8, r0 = 34, r1 = 52 + 10 * k;
      p.line(Math.cos(a) * r0 * 1.2, 2 + Math.sin(a) * r0 * 0.12, Math.cos(a) * r1 * 1.2, 2 + Math.sin(a) * r1 * 0.12, i % 2 ? C[5] : GOLD[4], 0.4 + 0.4 * k);
    }
    p.glow(0, -28, 30 + k * 20, GOLD[4], 0.16 * k);
    if (k > 0.82) {
      const f = seg(t, 0.82, 1);
      sparkle(p, 0, -34, 2 + f * 5, H, GOLD[5], 0.5 * f);
      p.glow(0, -34, 26, GOLD[5], 0.25 * f);
    }
  }
  // the roar: a white core, three rings tearing out, a leaf storm and a pillar of light
  if (t >= ROAR) {
    const age = t - ROAR, flash = Math.max(0, 1 - age / 0.22);
    if (flash > 0) {
      p.circle(0, -30, 6 + flash * 10, H, 0.95);
      p.rect(-150, -2, 300, 3, H, flash * 0.8);
      p.glow(0, -20, 96, H, 0.32 * flash);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU, L = 60 + (i % 3) * 34;
        const ex = Math.max(-156, Math.min(156, Math.cos(a) * L));
        const ey = Math.max(-146, Math.min(26, -20 + Math.sin(a) * L * 0.8));
        p.line(0, -20, ex, ey, i % 2 ? H : GOLD[4], flash * 0.7);
      }
    }
    for (const [delay, speed, thick, k] of [[0, 220, 2.4, 0.8], [0.08, 160, 1.6, 0.6], [0.16, 110, 1.2, 0.4]]) {
      const rr = (age - delay) * speed;
      if (rr > 0 && rr < 160) {
        const a = Math.max(0, 1 - rr / 160) * k;
        band(p, 0, 1, rr, 0.17, thick, a, C);
      }
    }
    // a column of light lifting off the floor, made from stacked ellipses
    if (age < 1.4) {
      const a = Math.max(0, 1 - age / 1.4);
      for (let i = 0; i < 16; i++) {
        const y = -6 - i * 8, rr = (20 - i * 0.9) * (0.5 + a * 0.7);
        p.disc(0, y, rr, i % 3 ? C[4] : GOLD[4], 0.05 * a);
      }
      p.glow(0, -50, 60, C[4], 0.14 * a);
      p.glow(0, -12, 40, GOLD[4], 0.18 * a);
    }
    // leaves and gold flakes thrown out, then tumbling down
    burst(60, seed * 29 + 5, (r, i) => {
      const delay = (i % 7) * 0.018, aa = age - delay;
      if (aa < 0) return;
      const life = 1.2 + r.range(0, 0.9), a = r.range(0, TAU), sp = r.range(40, 155);
      const [x, y] = fly(0, -22, Math.cos(a) * sp, Math.sin(a) * sp * 0.7 - 45, aa, 160, 1.4);
      if (aa > life || y > 24) return;
      const q = Math.min(1, aa * 4) * (1 - seg(aa, life * 0.7, life));
      if (i % 3 === 0) {
        p.dot(x, y, GOLD[5], q);
        p.glow(x, y, 4, GOLD[4], 0.08 * q);
      } else leaf(p, x, y, aa * 3 + i, C, q);
    });
    if (age > 0.05 && age < 0.8) {
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * TAU, rr = age * 130;
        p.dot(Math.cos(a) * rr * 1.1, 1 + Math.sin(a) * rr * 0.15, i % 2 ? C[5] : C[6], (1 - age / 0.8) * 0.8);
      }
    }
  }
  // after the burst: the floor keeps a soft scar, and leaves settle
  if (t > 1.4) {
    const k = seg(t, 1.4, END);
    p.ellipse(0, 2, 110, 8, C[2], 0.1 * (1 - k));
    for (let i = 0; i < 12; i++) {
      const x = -104 + i * 19 + Math.sin(i * 2 + t) * 3, y = -1 - ((t * 5 + i * 11) % 12);
      p.dot(x, y, i % 3 ? C[4] : GOLD[3], (1 - k) * 0.5);
    }
    p.glow(0, -2, 70, C[3], 0.07 * (1 - k));
  }
}
