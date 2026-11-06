// 缚仙绫：抖腕甩出素绫，绫尾先过半个画面；他不松手，反而双手抓住绫身一把把往回拽，
// 每拽一下绫就多缠靶身一圈，四圈缠满后金线一收、符印一扣，最后绫松了，散成一缕缕丝。
import { READY, clamp, ease, fit, hex, rng, smooth, sparkle } from "../../core/index.js";

const END = 2.05, REACH = 0.30, CINCH = 0.86, SLACK = 1.42;
const TX = 150, TY = -30, FACE = TX - 19;
const H0 = [24, -26], H1 = [21, -29], H2 = [5, -19];
const LOOPS = [
  { y: -36.6, t: 0.34, ph: 0 },
  { y: -32.6, t: 0.47, ph: 1.7 },
  { y: -28.6, t: 0.60, ph: 3.1 },
  { y: -24.6, t: 0.73, ph: 0.9 },
];
const GOLD = hex("#f0cb72"), GOLD_D = hex("#a3683d");

const lerp = (a, b, u) => a + (b - a) * u;
const mix = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

export const meta = {
  name: "Binding silk",
  desc: "He flicks a rolled sash loose, then grips it two-handed and hauls: every pull loops the target one more time, four turns in all, before a gold seal cinches and it falls away.",
  tags: ["move", "silk", "sash", "binding", "thrown", "projectile", "xianxia", "eastern", "control", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#141826", "#2a3245", "#4a5a6e", "#7f8fa0", "#b9c4c6", "#e6e6d8", "#ffffff"], seed: 43 },
};

// 甩出去之后不松手：先探身去够绫，再双手拽着往胯边拉，身子往后坐——和别的投掷都不一样。
const HELD = { ...READY, weapon: "binding-silk", x: -1, crouch: 2, lean: -1, fx: 7, fy: -21, bx: 9, by: -21, sa: -0.45 };
const WIND = { ...HELD, x: -4, crouch: 5, lean: -4, fx: -3, fy: -25, bx: 16, by: -24, sa: -1.15, ffx: 4, fbx: -9, turn: 0.3 };
const THROW = { ...READY, x: 3, crouch: 3, lean: 6, fx: 21, fy: -26, bx: -7, by: -21, sa: 0.55, ffx: 8, fbx: -10, toeB: true, turn: 0.05 };
const REACH2 = { ...READY, x: 2, crouch: 4, lean: 5, fx: 21, fy: -30, bx: 19, by: -28, ffx: 9, fbx: -9, armsFront: true };
const HAUL = { ...READY, x: -5, crouch: 9, lean: -8, fx: 11, fy: -20, bx: 13, by: -19, ffx: 4, fbx: -12, toeB: true, turn: -0.12 };
const STRAIN = { ...HAUL, x: -6, crouch: 10, lean: -9, fx: 10, fy: -19, bx: 12, by: -18, turn: -0.16 };
const LET = { ...READY, x: 0, crouch: 3, lean: 0, fx: 12, fy: -22, bx: 9, by: -21 };
const SETTLE = { ...READY, x: 0, crouch: 3, fx: 8, fy: -21, bx: 8, by: -21 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.44, HELD], [-0.22, WIND], [-0.05, WIND],
    [0, THROW, "snap"], [0.10, { ...THROW, lean: 4 }], [0.22, REACH2],
    [0.46, { ...REACH2, x: 0, crouch: 6, lean: 2, fx: 17, fy: -26, bx: 16, by: -25 }],
    [0.62, { ...HAUL, crouch: 7, lean: -5, fx: 13, fy: -22, bx: 15, by: -21 }],
    [CINCH, STRAIN], [1.24, STRAIN], [SLACK, LET], [END, SETTLE],
  ],
  hits: [
    { t: LOOPS[0].t, stop: 0.02, shake: 0.04, amp: 0.8, push: 0.3, straw: 1, y: LOOPS[0].y },
    { t: LOOPS[1].t, stop: 0.02, shake: 0.04, amp: 0.8, push: 0.3, straw: 1, y: LOOPS[1].y },
    { t: LOOPS[2].t, stop: 0.02, shake: 0.04, amp: 0.8, push: 0.3, straw: 1, y: LOOPS[2].y },
    { t: LOOPS[3].t, stop: 0.02, shake: 0.04, amp: 0.8, push: 0.3, straw: 1, y: LOOPS[3].y },
    { t: CINCH, stop: 0.10, shake: 0.10, amp: 1.4, push: 1.4, straw: 5, y: TY },
  ],
  dust: [{ t: 0, x: 24, n: 3, dir: 1 }],
};

/** the fist at time t: it goes out with the flick, then drags the sash home */
function handAt(t) {
  if (t < REACH) return mix(H0, H1, ease.inOutSine(clamp(t / REACH)));
  if (t < CINCH) return mix(H1, H2, ease.inOutCubic(clamp((t - REACH) / (CINCH - REACH))));
  return H2;
}

const DIST = Math.hypot(FACE - H0[0], -31 - H0[1]);
const DIR = [(FACE - H0[0]) / DIST, (-31 - H0[1]) / DIST];
const NORM = [-DIR[1], DIR[0]];

/** the flying sash: lead end runs out from the fist, body waves behind it */
function ribbon(p, C, t, reach) {
  const h = handAt(t);
  const at = (d) => {
    const u = clamp(d / Math.max(1, reach)), live = smooth(0, 24, d);
    const wave = Math.sin(d * 0.075 + t * 8.4) * 7 * live * (0.3 + 0.7 * u) + Math.sin(d * 0.026 - t * 2.6) * 4.5 * live;
    const sag = Math.sin(Math.PI * u) * 3.2;
    return [h[0] + DIR[0] * d + NORM[0] * wave, h[1] + DIR[1] * d + NORM[1] * wave + sag];
  };
  let prev = at(0);
  for (let d = 2.5; d <= reach; d += 2.5) {
    const cur = at(d), tip = smooth(reach - 9, reach, d);
    const w = (2.5 + 1.1 * Math.sin(d * 0.085 + t * 6.4)) * (1 - 0.85 * tip);
    p.beam(prev[0], prev[1], cur[0], cur[1], w + 1.1, C[1], 1);
    p.beam(prev[0], prev[1] - 0.6, cur[0], cur[1] - 0.6, w, C[3], 1);
    if (d > 8) p.beam(prev[0], prev[1] - 1, cur[0], cur[1] - 1, 0.9, C[5], 0.8);
    if (d > 12) {
      p.line(prev[0] + NORM[0] * w * 0.55, prev[1] + NORM[1] * w * 0.55 + 0.8, cur[0] + NORM[0] * w * 0.55, cur[1] + NORM[1] * w * 0.55 + 0.8, GOLD_D, 0.7);
    }
    prev = cur;
  }
  const tip = at(reach);
  p.px(tip[0], tip[1], C[6]);
  p.glow(tip[0], tip[1], 4, C[4], 0.18);
}

/** the length still in his hands, pulled bar-taut from the fist to the coil */
function taut(p, C, t, k) {
  if (k <= 0.01) return;
  const h = handAt(t), pull = clamp((t - REACH) / (CINCH - REACH));
  const sag = 4.5 * (1 - pull) + Math.sin(t * 26) * 0.5 * pull;
  for (const yy of [-36.2, -26]) {
    const up = yy < -30;
    const x0 = h[0] + (up ? -1.2 : 1.2), y0 = h[1] - 1 + (up ? -1 : 1);
    let prev = [x0, y0];
    for (let i = 1; i <= 12; i++) {
      const u = i / 12, x = lerp(x0, TX - 21, u), y = lerp(y0, yy, u) + Math.sin(Math.PI * u) * sag;
      p.beam(prev[0], prev[1], x, y, 1.8, C[1], k);
      p.beam(prev[0], prev[1] - 0.5, x, y - 0.5, 1.2, C[3], k);
      p.line(prev[0], prev[1] - 1.1, x, y - 1.1, C[5], k * 0.6);
      prev = [x, y];
    }
  }
}

/** one turn of silk round the chest; it grows from his side, then tugs */
function loop(p, C, t, lp, i, cinch, a) {
  const age = t - lp.t;
  if (age < 0) return;
  const grow = clamp(age / 0.10), tight = 1 - 0.22 * cinch;
  const tug = age > 0.10 ? Math.sin((age - 0.10) * 42) * Math.exp(-(age - 0.10) * 11) * 1.5 : 0;
  const y0 = lerp(TY, lp.y, tight) + tug;
  const x0 = TX - 21 + 1.2 * cinch, span = (42 - 2.4 * cinch) * grow;
  const pt = (u) => [x0 + span * u, y0 - Math.sin(u * Math.PI) * 2.2 + Math.sin(u * 5.5 + lp.ph) * 0.7 + Math.sin(t * 40 + u * 6) * 0.25 * cinch];
  let prev = pt(0);
  for (let j = 1; j <= 14; j++) {
    const cur = pt(j / 14);
    p.beam(prev[0], prev[1], cur[0], cur[1], 2.8, C[1], a);
    p.beam(prev[0], prev[1] - 0.5, cur[0], cur[1] - 0.5, 1.8, C[3], a);
    prev = cur;
  }
  prev = pt(0);
  for (let j = 1; j <= 21; j++) {
    const cur = pt(j / 21);
    p.line(prev[0], prev[1] - 1.1, cur[0], cur[1] - 1.1, C[5], 0.65 * a);
    p.line(prev[0], prev[1] + 1.4, cur[0], cur[1] + 1.4, GOLD_D, (0.4 + 0.3 * cinch) * a);
    prev = cur;
  }
  // the leading end curls over as it comes round
  if (grow < 1) {
    const e = [x0 + span, y0 - Math.sin(grow * Math.PI) * 2.2 + Math.sin(grow * 5.5 + lp.ph) * 0.7];
    p.dot(e[0], e[1], C[6], 0.9 * a);
    p.dot(e[0] + 1, e[1] + 1.4, C[5], 0.7 * a);
    p.glow(e[0], e[1], 3, C[4], 0.2 * a);
  }
  // once it's round, a gold hem catches the light and a rune lights on the near side
  if (grow >= 1) {
    const k = clamp((age - 0.10) / 0.12) * (1 - smooth(SLACK, SLACK + 0.3, t));
    if (k > 0) {
      p.line(TX - 20, y0 - 1.6, TX + 20, y0 - 1.6, GOLD, 0.55 * k * a);
      p.glowLine(TX - 16, y0 - 1.6, TX + 16, y0 - 1.6, 3, GOLD, 0.12 * k * a);
      p.dot(TX - 14 + (i & 1) * 7, y0 + 2.4, GOLD, 0.5 * k * a);
    }
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= END) return;
  const C = fit(o.palette, 7), S = o.seed;
  const cinch = clamp((t - CINCH) / 0.12);

  if (t < 0.14) {
    const k = 1 - t / 0.14;
    sparkle(p, H0[0] - 1, H0[1] + 1, 3.5 * k, C[6], C[4], 0.28 * k);
  }

  // the sash on its way out
  if (t < 0.34) {
    const reach = DIST * ease.inOutSine(clamp(t / REACH));
    if (reach > 2) ribbon(p, C, t, reach);
  }

  const slack = 1 - smooth(SLACK, 1.9, t);
  if (slack > 0.01) {
    taut(p, C, t, clamp((t - 0.24) / 0.12) * slack);
    for (let i = 0; i < LOOPS.length; i++) loop(p, C, t, LOOPS[i], i, cinch, slack);
  }

  // 收口：金线收紧、符印扣上
  const age = t - CINCH;
  if (age >= 0 && age < 0.42) {
    const f = 1 - age / 0.42;
    sparkle(p, TX - 2, TY, 8 * f, C[6], C[4], 0.4 * f);
    p.glowRing(TX, TY, 6 + 14 * ease.outCubic(clamp(age / 0.3)), 3, C[4], 0.24 * f);
    p.ring(TX, TY, 5 + 11 * ease.outCubic(clamp(age / 0.26)), 1, GOLD, 0.55 * f);
    // 符印：一枚小菱形，扣在绫结上
    const g = clamp(age / 0.08) * (1 - smooth(0.26, 0.42, age));
    if (g > 0) {
      for (let i = -3; i <= 3; i++) {
        const w = 3 - Math.abs(i) * 0.6;
        p.line(TX + i * 0.8 - w, TY + i, TX + i * 0.8 + w, TY + i, GOLD, 0.75 * g);
      }
      p.dot(TX, TY - 4, C[6], 0.8 * g);
    }
    // 绷紧的绫身抖出一圈细线
    for (let i = 0; i < 8; i++) {
      const r = rng(S, 31, i), an = r.range(-2.9, -0.3), d = 5 + age * 30;
      p.line(TX + Math.cos(an) * d * 0.4, TY + Math.sin(an) * d * 0.4, TX + Math.cos(an) * d, TY + Math.sin(an) * d, C[i & 1 ? 5 : 4], 0.5 * f);
    }
  }

  // 挣了两下：绷紧的绫上掠过几道金线，靶身跟着一颤
  if (t > CINCH + 0.3 && t < SLACK) {
    const k = (1 - smooth(CINCH + 0.3, SLACK, t)) * 0.7;
    for (let i = 0; i < 3; i++) {
      const u = ((t - CINCH) * 2.4 + i * 0.33) % 1;
      if (u > 0.22) continue;
      const q = 1 - u / 0.22, yy = lerp(-35.4, -26.6, i / 2);
      p.line(TX - 18 + u * 90, yy - 1.6, TX - 14 + u * 90, yy - 1.6, GOLD, 0.5 * q * k);
    }
  }

  // 松开：绫从靶上散开，化成丝线与微光
  if (t > SLACK) {
    const u = clamp((t - SLACK) / (END - SLACK));
    for (let i = 0; i < 12; i++) {
      const r = rng(S, 51, i), birth = r.range(0, 0.26), life = r.range(0.22, 0.4);
      if (u < birth || u > birth + life) continue;
      const a2 = (u - birth) / life, q = 1 - a2;
      const x0 = TX + r.range(-22, 22), y0 = r.range(-35.4, -26.6);
      const x = x0 + r.range(-12, 8) * a2, y = y0 - r.range(2, 12) * a2 + 3 * a2 * a2;
      const len = 2 + 3 * q;
      p.line(x, y, x - len, y - len * 0.6, i & 1 ? C[5] : C[4], 0.6 * q);
      if (i % 3 === 0) p.glow(x, y, 3, C[4], 0.1 * q);
    }
    for (let i = 0; i < 6; i++) {
      const r = rng(S, 61, i), birth = r.range(0.08, 0.3), life = r.range(0.3, 0.45);
      if (u < birth || u > birth + life) continue;
      const a2 = (u - birth) / life, q = 1 - a2;
      const x = TX + r.range(-14, 14) + Math.sin(a2 * 5 + i) * 3, y = TY - r.range(2, 16) * a2;
      p.px(x, y, q > 0.5 ? C[6] : C[4]);
    }
  }
}
