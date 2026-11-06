// 摄魂铃：铜铃高高抛出去，铃身在半空里慢慢翻滚，砸在草靶胸口的一瞬炸开三圈声波，
// 紫魂焰从铃口卷着往上走，铃掉到地上还要再轻响一下。
import { READY, clamp, ease, fit, hex, rng, sparkle } from "../../core/index.js";

const RELEASE = 0, HIT = 0.82, LAND = 1.04, FADE = 1.52, END = 1.85;
const TX = 150, TY = -30, FACE = TX - 19, HAND = [26, -27], TOP = -32;
const GOLD = hex("#f0cb72"), GOLD_D = hex("#a3683d"), TASSEL = hex("#c75461"), SOUL = hex("#b49cff");
const GX = FACE - 2, LAND_X = FACE - 14;

export const meta = {
  name: "Soul bell",
  desc: "He tolls the bronze bell at his chest, then tosses it underarm out of a half-spin; it rings three waves of sound, soul-fire curls off its mouth and it tolls once on the floor.",
  tags: ["move", "bell", "soul", "sound", "thrown", "projectile", "xianxia", "eastern", "stun", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#1b1420", "#3a2b33", "#6b4a34", "#a5763f", "#d9ad63", "#a98fd8", "#f4ecff"], seed: 37 },
};

const HELD = { ...READY, weapon: "soul-bell", x: -1, crouch: 2, lean: -1, fx: 6, fy: -22, bx: 9, by: -21, sa: -0.95 };
const RING = { ...HELD, x: 0, crouch: 1, lean: -1, fx: 13, fy: -33, bx: 4, by: -20, sa: -1.5, turn: 0.18 };
const RING2 = { ...RING, fx: 11, fy: -32, sa: -1.38, turn: 0.22, hx: 0.3 };
const COIL = { ...READY, x: -6, crouch: 10, lean: -7, fx: -11, fy: -13, bx: 15, by: -26, sa: -2.3, turn: 0.5, ffx: 6, fbx: -10 };
const THROW = { ...READY, x: 3, crouch: 4, lean: 9, fx: 20, fy: -35, bx: -9, by: -22, sa: -0.35, turn: -0.22, ffx: 9, fbx: -11, toeB: true };
const HOP = { ...THROW, y: -7, crouch: 0, lean: 5, fx: 16, fy: -37, turn: -0.12, ghost: 1, toeB: false, toeF: true };
const RECOVER = { ...READY, x: 2, crouch: 3, fx: 10, fy: -21, bx: 8, by: -21 };
const LISTEN = { ...RECOVER, lean: -2, fx: 8, fy: -22 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.62, HELD], [-0.4, RING], [-0.28, RING2], [-0.18, RING], [-0.08, COIL, "snap"],
    [RELEASE, THROW, "snap"], [0.16, HOP], [0.4, RECOVER],
    [HIT, LISTEN], [1.3, RECOVER], [END, RECOVER],
  ],
  hits: [{ t: HIT, stop: 0.12, shake: 0.18, amp: 2.5, push: 2.2, straw: 9, y: TY }],
  dust: [{ t: LAND, x: LAND_X, n: 5, dir: -1 }],
};

function flight(u) {
  return [HAND[0] + (GX - HAND[0]) * u, HAND[1] + (TY - HAND[1]) * u - Math.sin(Math.PI * u) * 27];
}

/** the bell: mouth at +x, ring handle at -x, a clapper hanging in the mouth */
function bell(p, C, x, y, a, alpha = 1, s = 1) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => [x + (ca * u - sa * v) * s, y + (sa * u + ca * v) * s];
  // tassel: red threads trailing off the handle
  for (let i = 0; i < 4; i++) {
    const q = P(-5.2 - i * 0.5, -1.4 - i * 1.1);
    p.dot(q[0], q[1], i & 1 ? TASSEL : GOLD_D, alpha * 0.9);
  }
  // 环钮
  const r0 = P(-3.6, 0);
  p.ring(r0[0], r0[1], 1.7 * s, 1.1 * s, C[4], alpha);
  // 钟身：暗底、铜面、口沿
  p.poly([P(-2.2, -2.8), P(1.4, -2.2), P(6.4, -4.4), P(7.2, 0), P(6.4, 4.4), P(1.4, 2.2), P(-2.2, 2.8)], C[2], alpha);
  p.poly([P(-1.8, -2.4), P(1.6, -1.9), P(6, -3.8), P(6, -0.4), P(-1.6, -0.4)], C[3], alpha);
  p.poly([P(-1.6, 0.5), P(6, 0.5), P(6, 3.8), P(1.6, 1.9), P(-1.6, 2.4)], C[1], alpha);
  // 铜绿斑与铸纹
  for (const [u, v] of [[0.4, 1.6], [2.2, -1.2], [3.4, 2.2], [4.6, 0.2], [1.2, -2.4]]) {
    const q = P(u, v); p.dot(q[0], q[1], C[5], alpha * 0.55);
  }
  for (let u = 0.2; u < 6; u += 1.4) { const q = P(u, -3.1); p.dot(q[0], q[1], GOLD_D, alpha * 0.7); }
  // 口沿：金唇
  const l0 = P(6.8, -4.6), l1 = P(6.8, 4.6);
  p.beam(l0[0], l0[1], l1[0], l1[1], 1.8, GOLD, alpha);
  const c0 = P(7.6, -1.2), c1 = P(7.6, 1.2);
  p.beam(c0[0], c0[1], c1[0], c1[1], 1, GOLD_D, alpha * 0.8);
  // 铃舌
  const k0 = P(5.4, 0), k1 = P(8.6, 0);
  p.line(k0[0], k0[1], k1[0], k1[1], C[4], alpha * 0.8);
  const kk = P(8.8, 0);
  p.dot(kk[0], kk[1], C[6], alpha);
}

/** 声波：三圈错峰外扩的环，越远越淡 */
function waves(p, C, x, y, age, alpha) {
  for (let i = 0; i < 3; i++) {
    const a = age - i * 0.055;
    if (a < 0) continue;
    const k = clamp(a / 0.42), r = 4 + 26 * ease.outCubic(k), f = (1 - k) * (1 - k) * alpha;
    p.ring(x, y, r, Math.max(1, 2.2 * (1 - k)), i ? C[5] : C[6], f);
    p.glowRing(x, y, r, 4, i ? SOUL : C[4], 0.22 * f);
  }
}

/** 魂焰：从铃口卷出去、绕着靶子往上飘的紫色尾迹 */
function wisps(p, C, x, y, age, alpha) {
  for (let i = 0; i < 5; i++) {
    const r = rng(7, i), birth = r.range(0, 0.16), life = r.range(0.5, 0.85);
    if (age < birth || age > birth + life) continue;
    const k = (age - birth) / life, f = Math.sin(Math.PI * k) * alpha;
    const sx = x + r.range(-9, 9), rise = 6 + 26 * k;
    const pts = [];
    for (let j = 0; j <= 6; j++) {
      const u = j / 6;
      pts.push([sx + Math.sin(u * 4.2 + i * 1.7 + age * 6) * (1 + 3 * u) * (1 - 0.3 * k), y - 4 - rise * u]);
    }
    for (let j = 0; j < pts.length - 1; j++) p.line(pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1], i & 1 ? C[5] : SOUL, f * (1 - j * 0.1));
    const head = pts[pts.length - 1];
    p.dot(head[0], head[1], C[6], f);
    if (i < 2) p.glow(head[0], head[1], 4, SOUL, 0.2 * f);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= END) return;
  const C = fit(o.palette, 7), S = o.seed;

  if (t < 0.14) {
    const k = 1 - t / 0.14;
    sparkle(p, HAND[0] + 1, HAND[1] - 2, 4 * k, C[6], SOUL, 0.3 * k);
  }

  if (t >= RELEASE && t < LAND) {
    let x, y, a;
    if (t < HIT) {
      const u = clamp(t / HIT), [fx, fy] = flight(u);
      x = fx; y = fy; a = -1.2 - t * 7.4;
      if (u > 0.06) {
        const [px, py] = flight(Math.max(0, u - 0.1));
        p.beam(px, py, x, y, 1.1, C[4], 0.16 * (1 - u * 0.7));
      }
      p.glow(x, y, 7, C[3], 0.14 + 0.12 * Math.sin(u * 12));
    } else {
      // 撞上后弹开、落地
      const u = clamp((t - HIT) / (LAND - HIT)), e = ease.inQuad(u);
      x = GX + 4 + (LAND_X - GX - 4) * e; y = TY + (u * u) * 27; a = -1.2 - HIT * 7.4 + u * 9;
      p.beam(GX, TY, x, y, 0.9, C[4], 0.1 * (1 - u));
    }
    bell(p, C, x, y, a);
  }

  const age = t - HIT;
  if (age >= 0) {
    waves(p, C, GX + 2, TY, age, clamp(1 - age / 0.9));
    wisps(p, C, GX, TY, age, clamp(1 - age / 1.1));
    if (age < 0.1) {
      const k = 1 - age / 0.1;
      sparkle(p, GX, TY, 12 * k, C[6], SOUL, 0.5 * k);
      p.glow(GX, TY, 26, SOUL, 0.4 * k);
    }
    if (age < 0.5) {
      const f = 1 - age / 0.5;
      for (let i = 0; i < 7; i++) {
        const r = rng(S, 71, i), an = r.range(2.0, 4.6), d = 8 + age * 60;
        p.line(GX + Math.cos(an) * d * 0.5, TY + Math.sin(an) * d * 0.5, GX + Math.cos(an) * d, TY + Math.sin(an) * d, i & 1 ? C[6] : C[4], 0.5 * f);
      }
    }
  }

  // 落地：一圈尘、一声余响，铃身在原地摇晃
  const land = t - LAND;
  if (land >= 0 && land < 0.7) {
    const k = 1 - land / 0.7, rock = Math.sin(land * 34) * Math.exp(-land * 7) * 0.5;
    bell(p, C, LAND_X, -4, -0.12 + rock, k);
    p.ellipse(LAND_X, -1, 8 + 6 * (1 - k), 2, C[2], 0.25 * k);
    if (land < 0.06) {
      p.ring(LAND_X, -2, 3 + land * 60, 1, C[5], 0.5);
      p.ellipse(LAND_X, -1, 6 + land * 40, 2, C[4], 0.2);
    }
    if (land > 0.22 && land < 0.4) p.ring(LAND_X, -4, 3 + (land - 0.22) * 46, 1, SOUL, 0.35 * (1 - (land - 0.22) / 0.18));
    // 余魂从地上飘走
    for (let i = 0; i < 5; i++) {
      const r = rng(S, 91, i), birth = r.range(0.05, 0.3), life = r.range(0.3, 0.5);
      if (land < birth || land > birth + life) continue;
      const q = 1 - (land - birth) / life, x = LAND_X + r.range(-7, 7) + Math.sin(land * 6 + i) * 2, y = -4 - (land - birth) * 24;
      p.dot(x, y, q > 0.5 ? C[6] : SOUL, q * 0.8);
    }
  }
}
