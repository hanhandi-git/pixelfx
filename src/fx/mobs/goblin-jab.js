// A minion's attack, sized for a 33 px goblin: a short wind-up with a blade glint, a two-frame white-hot jab and a
// hit star at the reach of its arm. Small on purpose: a boss attack is a screen; this is a punctuation mark.
import { PAL, fit, hex, clamp, seg, bump, TAU, burst, fly, sparkle } from "../../core/index.js";

export const meta = {
  name: "Goblin Jab",
  desc: "The raider's dagger flashes in the wind-up, snaps out in a white crescent and pops a small hard hit star at arm's length, with sparks and a puff of dust.",
  tags: ["mob", "goblin", "attack", "melee", "fantasy", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [20, 56],
  duration: 0.9,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.fire, seed: 1 },
};

/** The timing the encounter and the animation both read. */
export const attack = {
  telegraph: 0.18,
  hits: [{ t: 0.26, amp: 1.4, shake: 0.12, damage: 7, range: 22, target: "hero" }],
};

const HIT = 0.26, FLASH = 0.2, CLEAN = 0.78;

export function draw(p, t, o) {
  if (t >= meta.duration) return;
  const C = fit(o.palette, 7), H = hex("#fff8e0"), INK = hex("#1a0a0c");
  const sx = 16, sy = -18;
  // wind-up: the blade catches the light, a red tell at the hilt
  if (t < FLASH) {
    const k = seg(t, 0, FLASH), flare = 1 - Math.abs(k * 2 - 1) * 0.5;
    sparkle(p, sx - 1, sy + 1, 1.5 + k * 2.4, H, C[5], 0.4 * flare);
    p.glow(sx - 1, sy + 1, 8, C[4], 0.25 * flare);
    for (let i = 0; i < 3; i++) p.dot(sx - 4 - i * 2, sy + 2 + i, C[4], 0.5 * flare);
  }
  // the jab: a crescent of hot steel, then a cooler ghost of it
  const u = seg(t, FLASH, HIT + 0.05);
  if (u > 0 && u < 1) {
    const r = 15 + u * 7, a0 = -1.55 + u * 0.25, a1 = 0.1 + u * 0.45, w = (x) => 4.2 * Math.sin(Math.PI * x) * (1 - u * 0.35) + 0.7;
    p.arc(sx, sy, r, w, a0, a1, (x, v) => (v > 0.55 ? H : v > 0.25 ? C[6] : C[4]), 1);
    p.arc(sx, sy, r + 2.5, 1.2, a0 + 0.05, a1 - 0.05, C[3], 0.7);
    p.glow(sx + 4, sy - 1, 18, C[4], 0.18 * (1 - u));
  }
  // hit: a hard little star at the end of the arm, a ring and a spray
  if (t >= HIT - 0.01 && t < HIT + 0.2) {
    const k = clamp((t - HIT) / 0.2), hot = 1 - k;
    const hx = 26, hy = -17;
    p.circle(hx, hy, 2.4 + hot * 2.2, H, 0.95);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3, L = (i % 2 ? 5 : 9) * (0.5 + hot * 0.8);
      p.line(hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L * 0.9, i % 2 ? C[5] : H, hot);
    }
    p.ring(hx, hy, 4 + k * 10, 1, C[5], (1 - k) * 0.8);
    p.glow(hx, hy, 16, C[5], 0.5 * hot);
    p.light(hx, hy, C[6], hot);
  }
  // sparks and a little dust kicked up at the goblin's feet
  burst(12, (o.seed ?? 1) * 31 + 1, (r) => {
    const age = t - HIT;
    if (age < 0 || age > 0.45) return;
    const life = 0.22 + r.range(0, 0.22);
    if (age > life) return;
    const a = -0.9 + r.range(-0.8, 0.8), sp = r.range(35, 95);
    const [x, y] = fly(26, -17, Math.cos(a) * sp, Math.sin(a) * sp, age, 220, 0);
    if (y > -0.5) return;
    const q = 1 - age / life;
    p.line(x - Math.cos(a) * 1.8, y - Math.sin(a) * 1.8, x, y, q > 0.5 ? C[5] : C[3], q);
    if (q > 0.4) p.glow(x, y, 5, C[4], 0.25 * q);
  });
  const dk = bump(t, FLASH, 0.48);
  if (dk > 0) {
    for (let i = 0; i < 3; i++) {
      const x = -4 - i * 4 - dk * 2, y = -1 - i * 0.7;
      p.disc(x, y, 2 + i * 0.8 + dk * 2, C[1], 0.2 * dk);
    }
  }
  // the dotted trace of the cut hanging for a beat
  if (t > HIT && t < CLEAN) {
    const k = seg(t, HIT, CLEAN), n = 6;
    for (let i = 0; i < n; i++) {
      const a = -1.45 + (i / n) * 1.5, r = 20 + i * 0.5;
      p.dot(sx + Math.cos(a) * r, sy + Math.sin(a) * r, C[3], (1 - k) * (0.8 - i * 0.07));
    }
  }
}
