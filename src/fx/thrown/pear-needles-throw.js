// 梨花针：袖口一抖，五根细针成扇面激射出去，一根根钉进草靶，针尾还在颤，
// 针上带的梨花瓣跟着散开，最后针尖的灵光散成点点白尘。
import { READY, WHITE, clamp, ease, fit, hex, rng, sparkle } from "../../core/index.js";

const RELEASE = 0, END = 1.6;
const TX = 150, FACE = TX - 19, HAND = [22, -26];
const GLINT = hex("#8fe0a8"), GOLD = hex("#f0cb72");

export const meta = {
  name: "Pear-blossom needles",
  desc: "A half-turn unwinds into a sleeve flick: five needles cross the gap in a narrow fan and stand quivering at five heights, shedding white pear petals as the venom glints.",
  tags: ["move", "needles", "pear-blossom", "hidden-weapon", "thrown", "projectile", "xianxia", "eastern", "multi-hit", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#241a22", "#4a3240", "#7d5560", "#b98a8a", "#e8c2bc", "#fdeee4", "#ffffff"], seed: 83 },
};

const HELD = { ...READY, weapon: "pear-needles", x: -1, crouch: 2, lean: -1, fx: 7, fy: -22, bx: 9, by: -21, sa: -0.18, turn: -0.35 };
const WIND = { ...HELD, x: -3, crouch: 5, lean: -3, fx: -4, fy: -27, bx: 13, by: -23, sa: -0.5, turn: -0.62, ffx: 3, fbx: -10 };
const FLICK = { ...READY, x: 4, crouch: 2, lean: 6, fx: 21, fy: -27, bx: -8, by: -20, sa: 0.12, turn: 0.3, ffx: 9, fbx: -11, toeB: true, ghost: 1 };
const FOLLOW = { ...FLICK, x: 5, lean: 5, fx: 13, fy: -21, turn: 0.55, ghost: 1 };
const SETTLE = { ...READY, x: 1, crouch: 3, fx: 9, fy: -21, bx: 8, by: -21 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.5, HELD], [-0.26, WIND], [-0.06, WIND], [RELEASE, FLICK, "snap"], [0.12, FOLLOW],
    [0.34, SETTLE], [0.9, SETTLE], [END, SETTLE],
  ],
  hits: [
    { t: 0.30, stop: 0.03, shake: 0.05, amp: 1, push: 0.6, straw: 3, y: -33 },
    { t: 0.33, stop: 0.03, shake: 0.04, amp: 1, push: 0.5, straw: 2, y: -25 },
    { t: 0.36, stop: 0.03, shake: 0.03, amp: 1, push: 0.4, straw: 2, y: -19 },
  ],
  dust: [{ t: RELEASE, x: 21, n: 2, dir: 1 }],
};

// each needle: where it lands, when it leaves, and how fast it crosses
const NEEDLES = [
  { y: -35, at: 0.012, dur: 0.288 },
  { y: -31, at: 0.004, dur: 0.296 },
  { y: -27, at: 0.000, dur: 0.300 },
  { y: -23, at: 0.008, dur: 0.322 },
  { y: -19, at: 0.020, dur: 0.340 },
];

function needleAt(n, t) {
  const u = clamp((t - n.at) / n.dur), e = ease.outCubic(u);
  const y0 = HAND[1] + (n.y - HAND[1]) * 0.04;
  return [HAND[0] + (FACE - HAND[0]) * e, y0 + (n.y - y0) * e, u];
}

/** a needle: 9 px of steel, a white head, a thinning trail */
function needle(p, C, x, y, ang, len, alpha) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const tx = x - ca * len, ty = y - sa * len;
  p.line(tx, ty, x, y, C[3], alpha);
  p.line(tx + ca * 1.5, ty + sa * 1.5, x, y, C[4], alpha);
  p.px(x, y, C[6]);
  p.px(x + ca, y + sa, C[6]);
  p.dot(tx, ty, GOLD, alpha * 0.55);
}

export function draw(p, t, o) {
  if (t < 0 || t >= END) return;
  const C = fit(o.palette, 7), S = o.seed;

  if (t < 0.1) {
    const k = 1 - t / 0.1;
    sparkle(p, HAND[0] + 1, HAND[1], 3 * k, C[6], C[4], 0.25 * k);
  }

  // 出手：袖口抖出一把梨花瓣，跟着针一起散开
  if (t < 0.95) {
    for (let i = 0; i < 8; i++) {
      const r = rng(S, 11, i), birth = r.range(0, 0.06), life = r.range(0.5, 0.85);
      if (t < birth || t > birth + life) continue;
      const k = (t - birth) / life, f = 1 - k;
      const x = HAND[0] - 2 + r.range(-3, 4) + r.range(-14, 22) * ease.outCubic(k) + Math.sin(k * 7 + i) * 2.4;
      const y = HAND[1] + r.range(-4, 3) + r.range(-10, 8) * k + 9 * k * k + Math.sin(k * 5 + i * 2) * 1.2;
      p.rect(x, y, 1, 1, k > 0.6 ? C[4] : C[6], f * 0.9);
      if (k < 0.5) p.px(x + 1, y, C[5]);
    }
  }

  // 飞行：五根针错峰出袖，扇面很窄，尾迹只有细细一线
  for (const n of NEEDLES) {
    const [x, y, u] = needleAt(n, t);
    if (t < n.at || u >= 1) continue;
    if (u > 0.02) {
      const [x0, y0] = needleAt(n, t - 0.035);
      const ang = Math.atan2(y - y0, x - x0) || 0;
      p.beam(x0, y0, x, y, 0.9, C[4], (q) => 0.22 * q * (1 - u * 0.5));
      needle(p, C, x, y, ang, 8, 1);
      p.glow(x, y, 5, C[5], 0.12);
      // 针尖的一点灵光
      p.px(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9, C[6]);
    }
  }

  // 钉在靶上：针尾震颤、梨花瓣被震落、针尖慢慢冷成一点绿光
  for (const n of NEEDLES) {
    const age = t - (n.at + n.dur);
    if (age < 0 || age > 0.85) continue;
    const f = 1 - age / 0.85, quiver = Math.sin(age * 70) * Math.exp(-age * 9) * 1.1;
    const x = FACE + 2, y = n.y + quiver;
    p.line(x, y, x - 8, y, C[2], f * 0.9);
    p.line(x - 1, y, x - 7, y, C[4], f);
    p.px(x, y, C[6]);
    p.px(x - 8, y, GOLD, f * 0.7);
    if (age > 0.2 && age < 0.6) {
      const k = 1 - (age - 0.2) / 0.4;
      p.px(x - 9, y, GLINT, k);
      p.glow(x - 9, y, 3, GLINT, 0.12 * k);
    }
    if (age < 0.16) {
      const k = 1 - age / 0.16;
      sparkle(p, x, y, 3 * k, C[6], C[4], 0.2 * k);
      p.line(x + 1, y - 1, x - 4, y - 4 - age * 10, C[6], 0.6 * k);
    }
    // 每一针落下，震落一两片花瓣
    for (let i = 0; i < 2; i++) {
      const r = rng(S, 31 + n.y, i), life = 0.55 + i * 0.12;
      if (age > life) continue;
      const q = 1 - age / life;
      const px = x - 2 + r.range(-4, 2) - 5 * (age / life) + Math.sin(age * 8 + i) * 1.6;
      const py = y + 1 + age * (8 + i * 5);
      p.rect(px, py, 1, 1, q > 0.5 ? C[6] : C[4], q);
    }
  }

  // 收势：掌心残留的一线白
  if (t > 0.1 && t < 0.5) {
    const k = 1 - (t - 0.1) / 0.4;
    p.line(HAND[0] + 1, HAND[1] - 2, HAND[0] + 1 - 4 * k, HAND[1] - 2 - 2 * k, WHITE, 0.4 * k);
  }
}
