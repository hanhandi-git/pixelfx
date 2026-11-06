// Wind release: great breakthrough. A chestful of air becomes a roaring cone of compressed wind — white
// speed streaks, pressure fronts, dust and leaves, ending in a hard white shock ring on the target.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, band, burst, fly, READY } from "../../core/index.js";
import { WIND, JADE } from "./_lib.js";

const RELEASE = 0.5, HIT = 0.82, END = 2.4;
const MX = 14, MY = -28, TX = 250;

export const meta = {
  name: "Great breakthrough",
  desc: "He fills his chest, then blows a roaring cone of compressed wind across the field — dust, leaves and grit ride the blast while the target is pinned against a white shock ring.",
  tags: ["chakra", "ninjutsu", "wind", "gust", "breath", "technique", "one-shot"],
  size: [380, 180],
  origin: [70, 150],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: WIND, natural: JADE, seed: 41 },
};

const INHALE = { ...READY, x: -3, crouch: 6, lean: -5, turn: 1, fx: 7, fy: -30, bx: 8, by: -22, ffx: 6, fbx: -6 };
const BREATH = { ...READY, x: 2, crouch: 5, lean: 7, turn: 1, fx: 12, fy: -28, bx: -7, by: -20, ffx: 12, fbx: -9, toeB: true };
const RECOIL = { ...READY, x: 5, crouch: 4, lean: 3, fx: 10, fy: -24, bx: 8, by: -20 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, { ...READY, x: -3 }],
    [0.08, INHALE],
    [0.44, { ...INHALE, crouch: 8, lean: -7, fx: 5 }],
    [RELEASE, { ...BREATH, crouch: 5, lean: 9 }, "snap"],
    [HIT - 0.04, { ...BREATH, crouch: 4, lean: 7 }],
    [HIT, { ...BREATH, crouch: 5, lean: 4 }, "snap"],
    [HIT + 0.5, RECOIL],
    [1.9, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.12, shake: 0.4, amp: 3, target: true }],
  dust: [{ t: RELEASE, x: 9, n: 6, dir: 1, c: "#bff8ef" }, { t: HIT, x: TX, n: 8, dir: -1, c: "#bff8ef" }],
};

// the cone widens from the mouth; each streak is a short bright line riding the flow
const laneY = (u, x) => MY + (u - 0.5) * (10 + (x - MX) * 0.2);

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.natural ?? JADE, 8), S = o.seed;
  const charge = smooth(0.04, 0.28, t) * (1 - smooth(0.48, 0.6, t));
  const flow = t - RELEASE;
  const live = 1 - smooth(1.6, 2.3, t);

  // inhale: air and dust pulled to the mouth, a cold light at the lips
  if (charge > 0.01) {
    const R = rng(S, Math.floor(t * 20), 1);
    for (let i = 0; i < 16; i++) {
      const a = R.range(0, TAU), d = 9 + R.range(0, 30) * (1 - clamp(t / 0.45));
      p.dot(MX + Math.cos(a) * d, MY + Math.sin(a) * d * 0.7, i % 4 ? C[5] : WHITE, 0.4 * charge);
    }
    p.circle(MX, MY, 1.5 + 0.4 * Math.sin(t * 42), WHITE, charge);
    p.glow(MX, MY, 18, C[5], 0.25 * charge);
  }

  // the cone: 26 streaks in a widening fan, with three pressure fronts
  if (flow > 0 && live > 0.01) {
    const R = rng(S, Math.floor(t * 30), 3);
    for (let i = 0; i < 26; i++) {
      const u = i / 25;
      const speed = 300 + (i % 7) * 28;
      const x = MX + ((flow * speed + i * 19) % 268);
      if (x > 292) continue;
      const y = laneY(u, x) + Math.sin(t * 12 + i * 1.7) * (1 + (x - MX) * 0.028);
      const len = 5 + (i % 5) * 4 + (x - MX) * 0.09;
      const a = (0.35 + 0.5 * (1 - clamp((x - MX) / 270))) * live;
      const xe = Math.min(298, x + len);
      p.line(x, y, xe, y + Math.sin(t * 9 + i) * 1.2, (v) => (v < 0.3 ? C[3] : v < 0.72 ? C[5] : WHITE), a);
    }
    for (let k = 0; k < 3; k++) {
      const fx = 58 + k * 68 + ((flow * 250 + k * 31) % 74);
      if (fx > 286) continue;
      for (let j = 0; j < 12; j++) {
        const u = j / 11, x = fx + Math.sin(u * 6 + t * 9 + k) * 3.2;
        const y = MY + (u - 0.5) * (22 + (fx - MX) * 0.32);
        if (y > -1) continue;
        p.line(x, y, x + 5 + (fx - MX) * 0.03, y, j % 3 ? C[5] : C[6], 0.3 * live * (1 - (fx - MX) / 300));
      }
    }
    // grit and leaves in the flow
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 7), age = flow - B.range(0, 0.35);
      if (age < 0) continue;
      const x = MX + B.range(20, 260) + age * B.range(40, 90);
      if (x > 286) continue;
      const u = B.range(0, 1), y = laneY(u, x) + B.range(-5, 5) + Math.sin(t * 10 + i) * 2;
      if (y > -1) continue;
      if (i % 3 === 0) {
        const l = 2 + (i % 2);
        p.poly([[x, y], [x + l, y - 1], [x + l * 0.7, y + 1]], i % 2 ? G[4] : G[2], 0.6 * live);
      } else p.dot(x, y, i % 2 ? C[4] : C[5], 0.55 * live);
    }
    // dust rolling under the gust
    for (let i = 0; i < 7; i++) {
      const q = clamp((flow - i * 0.04) / 1.1), B = rng(S, i, 11);
      if (q <= 0 || q >= 1) continue;
      const dx = MX + 26 + i * 30 + q * 30;
      if (dx > 268) continue;
      p.disc(dx, -4 - B.range(0, 6), 4 + q * 7, C[3], 0.08 * live * (1 - q));
    }
  }

  // the target catches the front: white ring, radial grit, a pushed-back silhouette
  if (t >= HIT && t < HIT + 0.55) {
    const q = (t - HIT) / 0.55, f = 1 - q;
    p.circle(TX, -30, 3 + 14 * ease.outQuad(q), WHITE, 0.9 * f);
    p.ellipse(TX, 0, 12 + q * 32, 3.2, C[6], 0.4 * f);
    p.ellipse(TX, 0, 8 + q * 24, 1.8, WHITE, 0.35 * f);
    band(p, TX, 0, 12 + q * 34, 0.22, 1.6, 0.3 * f, C, undefined, q < 0.1);
    const R = rng(S, Math.floor(t * 30), 17);
    for (let i = 0; i < 18; i++) {
      const a = R.range(-2.9, 2.9), sp = R.range(40, 150), age = (t - HIT) * R.range(0.6, 1.4);
      const [x, y] = fly(TX, -30, Math.cos(a) * sp, Math.sin(a) * sp - 30, age, 180, 0.8);
      if (y > -1 || x > 300) continue;
      p.dot(x, y, i % 4 ? C[5] : WHITE, 0.7 * f);
    }
  }

  // the settling dust and a few last leaves
  if (t > HIT && live > 0.01) {
    const R = rng(S, Math.floor(t * 12), 19);
    for (let i = 0; i < 5; i++) {
      const q = clamp((t - HIT) / 1.1), B = rng(S, i, 23);
      p.disc(TX - 40 + B.range(-30, 30) + q * 20, -3 - q * B.range(2, 10), 4 + B.range(0, 3) + q * 4, C[3], 0.09 * live * (1 - q));
    }
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.natural ?? JADE, 8);
  const fade = 1 - smooth(1.6, END, t);
  // the scuffed line the gust carves, and the two small heel divots
  p.line(10, -1, 270, -1, (u) => (u < 0.7 ? C[2] : C[3]), 0.3 * fade);
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 40, B = rng(o.seed, i, 29);
    p.dot(x + B.range(-4, 4), -1, C[2], 0.4 * fade);
  }
  p.ellipse(4, 0, 8, 2.2, C[2], 0.3 * fade);
  if (t > HIT) {
    p.ellipse(TX, 0, 13 + 6 * smooth(HIT, HIT + 0.3, t), 2.6, C[1], 0.35 * fade);
    p.dot(TX - 2, -1, G[4], 0.3 * fade);
  }
}
