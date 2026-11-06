// 御剑化五：手捏剑诀把一柄小剑送出去，它在半空裂成五柄，绕着他转成一道剑轮；
// 剑指一递，五柄小剑依次脱离剑轮、各自挑一个高度扎进草靶，扎完再游回剑轮里。
import { READY, WHITE, clamp, ease, fit, hex, rng, sparkle } from "../../core/index.js";

const TAU = Math.PI * 2;
const COUNT = 5;
const END = 2.2;
const FORM = 0.38, LAUNCH0 = 0.70, STEP = 0.10, DIVE = 0.38, STUCK = 0.10, BACK = 0.26;
const FADE0 = 1.60, FADE1 = 2.10;
const TX = 150, TY = -27, FACE = TX - 19, HAND = [14, -33];
const ORB = [10, -30], RX = 23, RY = 10;
const L = 17;
const YS = [-35, -31, -27, -23, -19];
const ANG = [-0.42, -0.20, 0.02, 0.22, 0.42];
const GOLD = hex("#f0cb72"), GOLD_D = hex("#a3683d"), JADE = hex("#7fd3b0"), TASSEL = hex("#c75461");

const lerp = (a, b, u) => a + (b - a) * u;
const hitAt = (i) => LAUNCH0 + i * STEP + DIVE;
const launchAt = (i) => LAUNCH0 + i * STEP;

export const meta = {
  name: "Flying sword",
  desc: "One small jian leaves his palm and splits into five that wheel in a ring around him; at his pointing finger they scatter and stab the target one after another, then rise and fade.",
  tags: ["move", "sword", "flying-sword", "thrown", "projectile", "swarm", "xianxia", "eastern", "ranged", "combat", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#0f2226", "#1d4a45", "#2f7f6c", "#63c39b", "#a9ecc4", "#e6fff0", "#ffffff"], seed: 71 },
};

// 他全程不甩臂：先把剑横着一引，再两指一递。剑轮转的是他的身子，不是手。
const HELD = { ...READY, weapon: "flying-sword", x: -1, crouch: 2, lean: -2, fx: 8, fy: -24, bx: 8, by: -22, sa: -0.85, turn: 0.1 };
const SWEEP = { ...HELD, x: -2, crouch: 4, lean: -4, fx: -4, fy: -31, bx: 6, by: -20, sa: -1.85, turn: 0.42 };
const HOLD = { ...SWEEP, x: -3, crouch: 5, lean: -5, fx: -6, fy: -32, sa: -2.0, turn: 0.5 };
const LET = { ...READY, x: 0, crouch: 3, lean: 0, fx: 14, fy: -33, bx: 4, by: -20, ffx: 8, turn: 0.16 };
const POINT = { ...LET, x: 2, crouch: 2, lean: 4, fx: 21, fy: -30, bx: -3, by: -18, ffx: 11, turn: 0.02 };
const PRESS = { ...POINT, x: 3, lean: 5, fx: 23, fy: -29 };
const OPEN = { ...POINT, x: 2, lean: 1, fx: 17, fy: -26, turn: 0.05 };
const SETTLE = { ...READY, x: 0, crouch: 3, lean: 0, fx: 8, fy: -22, bx: 8, by: -21 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.5, HELD], [-0.3, SWEEP], [-0.12, HOLD],
    [0, LET, "snap"], [0.16, POINT], [1.1, PRESS], [1.62, OPEN], [END, SETTLE],
  ],
  hits: [
    { t: hitAt(0), stop: 0.03, shake: 0.06, amp: 1.2, push: 0.4, straw: 2, y: YS[0] },
    { t: hitAt(1), stop: 0.03, shake: 0.06, amp: 1.2, push: 0.4, straw: 2, y: YS[1] },
    { t: hitAt(2), stop: 0.03, shake: 0.06, amp: 1.2, push: 0.4, straw: 2, y: YS[2] },
    { t: hitAt(3), stop: 0.03, shake: 0.06, amp: 1.2, push: 0.4, straw: 2, y: YS[3] },
    { t: hitAt(4), stop: 0.08, shake: 0.12, amp: 2, push: 1.3, straw: 7, y: YS[4] },
  ],
  dust: [{ t: 0, x: 15, n: 2, dir: 1 }],
};

const fade = (t) => ease.inOutCubic(clamp((t - FADE0) / (FADE1 - FADE0)));

/** 剑轮上第 i 柄剑的握点与朝向：椭圆轨道，绕着他转，末尾一边升高一边散开 */
function orbit(i, t) {
  const d = fade(t), th = 0.55 + (i * TAU) / COUNT + t * 2.1;
  const rx = RX + 13 * d, ry = RY + 7 * d, cy = ORB[1] - 17 * d;
  return [ORB[0] + Math.cos(th) * rx, cy + Math.sin(th) * ry, Math.atan2(Math.cos(th) * ry, -Math.sin(th) * rx)];
}

const bez = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;

/** 第 i 柄剑此刻的握点、朝向与存在感 */
function grip(i, t) {
  const launch = launchAt(i), hit = hitAt(i), back = hit + STUCK, home = back + BACK;
  const [ox, oy, oa] = orbit(i, t);
  if (t < launch) {
    if (t < FORM) {
      const u = clamp(t / FORM), e = ease.outCubic(u);
      return { x: lerp(HAND[0], ox, e), y: lerp(HAND[1], oy, e), a: lerp(-0.9, oa, e), k: clamp(u * 1.5), mode: "form" };
    }
    return { x: ox, y: oy, a: oa, k: 1, mode: "orbit" };
  }
  const P = [FACE + 5, YS[i]], aHit = ANG[i], G = [P[0] - Math.cos(aHit) * L, P[1] - Math.sin(aHit) * L];
  if (t < hit) {
    const u = clamp((t - launch) / DIVE), e = ease.outCubic(u);
    const [sx, sy] = orbit(i, launch), sa = orbit(i, launch)[2];
    const cx = lerp(sx, G[0], 0.5), cy = Math.min(sy, G[1]) - 13;
    return { x: bez(sx, cx, G[0], e), y: bez(sy, cy, G[1], e), a: lerp(sa, aHit, ease.outCubic(u)), k: 1, mode: "dive" };
  }
  if (t < back) {
    const age = t - hit;
    return { x: G[0], y: G[1] + Math.sin(age * 60) * 0.5, a: aHit + Math.sin(age * 70) * Math.exp(-age * 8) * 0.05, k: 1, mode: "stuck", G, aHit };
  }
  if (t < home) {
    const u = clamp((t - back) / BACK), e = ease.inOutCubic(u);
    const cx = lerp(G[0], ox, 0.5), cy = Math.min(G[1], oy) - 9;
    return { x: bez(G[0], cx, ox, e), y: bez(G[1], cy, oy, e), a: lerp(aHit, oa, e), k: 1 - 0.4 * fade(t), mode: "back" };
  }
  return { x: ox, y: oy, a: oa, k: 1 - fade(t), mode: "orbit" };
}

/** 一柄尺长的小剑，握点 (x,y)，剑身沿 +a */
function jian(p, C, x, y, a, k) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
  for (let i = 0; i < 2; i++) { const q = P(-3.4 - i * 0.6, 1.0); p.dot(q[0], q[1], i ? TASSEL : GOLD_D, 0.85 * k); }
  const g0 = P(-2.6, 0), g1 = P(1.2, 0);
  p.beam(g0[0], g0[1], g1[0], g1[1], 2.6, C[0], k);
  p.beam(g0[0], g0[1], g1[0], g1[1], 1.5, C[2], k);
  const pc = P(-3.2, 0); p.dot(pc[0], pc[1], GOLD, k); p.dot(pc[0], pc[1] - 1, JADE, 0.8 * k);
  for (let i = -1; i <= 1; i++) { const q = P(1.4, i * 1.1); p.dot(q[0], q[1], GOLD, k * 0.95); }
  p.poly([P(1.8, -1.0), P(15.4, -0.8), P(17, 0), P(15.4, 0.8), P(1.8, 1.0)], C[2], k);
  p.poly([P(2.0, -0.8), P(15.2, -0.6), P(16.6, 0), P(2.2, 0)], C[4], k);
  p.poly([P(2.0, 0.2), P(16.6, 0.2), P(15.2, 0.7), P(2.0, 0.8)], C[1], k);
  const e0 = P(3, -0.7), e1 = P(14.6, -0.5);
  p.line(e0[0], e0[1], e1[0], e1[1], WHITE, 0.7 * k);
  const tp = P(16.8, 0); p.px(tp[0], tp[1], C[6]);
}

/** 剑后拖的灵气：沿它自己刚走过的路取样，越远越淡 */
function trail(p, C, i, t, g) {
  if (g.k <= 0.05) return;
  for (let j = 1; j <= 3; j++) {
    const g2 = grip(i, t - j * 0.042);
    if (g2.mode === "stuck") continue;
    const k = 0.42 * g.k * (1 - j * 0.26), ca = Math.cos(g2.a), sa = Math.sin(g2.a);
    p.dot(g2.x - ca * 3, g2.y - sa * 3, C[3], k * 0.5);
    p.dot(g2.x - ca * 6.5, g2.y - sa * 6.5, C[2], k * 0.35);
    p.dot(g2.x - ca * 10.5, g2.y - sa * 10.5, C[2], k * 0.2);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= END) return;
  const C = fit(o.palette, 7), S = o.seed;

  // 离掌：掌心的剑光炸开，一圈灵光散成五个方向
  if (t < 0.3) {
    const k = t < 0.06 ? t / 0.06 : 1 - clamp((t - 0.06) / 0.24);
    p.glow(HAND[0], HAND[1], 11, C[4], 0.3 * k);
    p.ring(HAND[0], HAND[1], 3 + t * 120, 1.4, C[5], 0.5 * k);
    sparkle(p, HAND[0], HAND[1], 7 * k, C[6], C[4], 0.5 * k);
  }

  // 起剑轮：脚下一圈剑罡随他转，剑轮转到一半才亮满
  const spin = clamp((t - 0.1) / 0.5);
  if (spin > 0 && t < FADE1) {
    const k = spin * (1 - fade(t));
    p.ellipse(ORB[0] + 1, -1, 19, 4.5, C[2], 0.16 * k);
    p.glow(ORB[0] + 1, -2, 13, C[3], 0.1 * k);
    for (let i = 0; i < COUNT; i++) {
      const th = 0.55 + (i * TAU) / COUNT + t * 2.1;
      p.dot(ORB[0] + 1 + Math.cos(th) * 17, -1 + Math.sin(th) * 3.4, C[4], 0.5 * k);
    }
    const tail = Math.sin(t * 7) * 0.06 + 0.34;
    p.ring(ORB[0] + 1, -1, 6 + Math.sin(t * 3) * 0.6, 1, C[3], tail * 0.25 * k);
  }

  // 剑轮本身：一圈极淡的虚线，把五柄剑串成环
  if (t < FADE1) {
    const k = clamp((t - 0.12) / 0.4) * (1 - fade(t));
    if (k > 0) {
      const d = fade(t), rx = RX + 13 * d, ry = RY + 7 * d, cy = ORB[1] - 17 * d;
      for (let j = 0; j < 26; j++) {
        if (j % 2) continue;
        const an = (j / 26) * TAU + t * 2.1;
        p.dot(ORB[0] + Math.cos(an) * rx, cy + Math.sin(an) * ry, C[2], 0.22 * k);
      }
    }
  }

  // 五柄剑
  for (let i = 0; i < COUNT; i++) {
    const g = grip(i, t);
    if (g.k <= 0.02) continue;
    trail(p, C, i, t, g);
    jian(p, C, g.x, g.y, g.a, g.k);
    const tx = g.x + Math.cos(g.a) * L, ty = g.y + Math.sin(g.a) * L;
    p.glow(tx, ty, 5, C[4], 0.3 * g.k);
    p.px(tx, ty, C[6]);
    // 扎进去的剑：刃口一道冷光从头划到尾
    if (g.mode === "stuck") {
      const age = t - hitAt(i);
      const slide = clamp(age / STUCK) * 10;
      p.line(g.G[0] + 4 + slide, g.G[1] - 0.6, g.G[0] + 8 + slide, g.G[1] - 0.6, C[6], 0.5 * (1 - age / STUCK));
    }
  }

  // 每一次入靶：一点白星、一圈小环、几根草屑
  for (let i = 0; i < COUNT; i++) {
    const age = t - hitAt(i);
    if (age < 0 || age > 0.22) continue;
    const k = 1 - age / 0.22, big = i === COUNT - 1 ? 1.5 : 1, y = YS[i];
    sparkle(p, FACE + 4, y, (i === COUNT - 1 ? 11 : 6) * k, C[6], C[4], 0.5 * k * big);
    p.glow(FACE + 4, y, 14 * big, C[4], 0.3 * k);
    p.ring(FACE + 4, y, 3 + age * 46, 1, C[5], 0.4 * k);
    for (let j = 0; j < 3; j++) {
      const r = rng(S, 90 + i, j), an = r.range(2.3, 4.2), d = 4 + age * 60;
      p.line(FACE + 4 + Math.cos(an) * d * 0.6, y + Math.sin(an) * d * 0.6, FACE + 4 + Math.cos(an) * d, y + Math.sin(an) * d, C[6], 0.45 * k);
    }
    // 草屑
    for (let j = 0; j < 4; j++) {
      const r = rng(S, 110 + i, j), life = r.range(0.2, 0.42), q = 1 - age / life;
      if (q <= 0) continue;
      p.rect(FACE - 1 - r.range(0, 5), y + r.range(-3, 5) + age * 30, 1, 1, C[q > 0.5 ? 3 : 2], q * 0.8);
    }
  }

  // 收势：剑轮升起来散掉，最后一圈光扫过靶面
  if (t > FADE0 && t < FADE1) {
    const d = fade(t), rx = 20 + d * 20, ry = 5 + d * 5;
    for (let i = 0; i < 40; i++) {
      const an = (i / 40) * TAU;
      p.dot(ORB[0] + 1 + Math.cos(an) * rx, -2 + Math.sin(an) * ry, C[3], 0.3 * (1 - d));
    }
    for (let i = 0; i < 6; i++) {
      const r = rng(S, 150, i), an = r.range(0, TAU), d2 = 16 + d * 24 + r.range(0, 8);
      p.dot(ORB[0] + 1 + Math.cos(an) * d2, -2 + Math.sin(an) * d2 * 0.4 - d * 10, C[4], 0.4 * (1 - d));
    }
  }
}
