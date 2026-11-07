// 天岩户: the heavenly rock cave. A shimenawa is strung across the boulder that hides the sun; the rope
// strains, the stone splits from within, and the door grinds apart. White-gold light floods out in a fan,
// the paper streamers fly, rock chips fall, and the glare slowly pulls back to a single warm seam.
import { WHITE, ease, fit, loopNoise, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { glint } from "../pickups/_lib.js";
import { CAVE, SUN, GOLD_HOT, STRAW, STRAW_D, rayFan, shide, torii } from "./_lib.js";

const END = 3.8, CRACK = 0.75, OPEN = 1.32;
const W = 320, H = 200, OX = 160, OY = 180;
const OUTER = 86, TOP = -150, BOT = 2;

export const meta = {
  name: "Ama-no-Iwato",
  desc: "The heavenly rock cave: a shimenawa strains across the boulder that hides the sun, the stone splits, the door grinds apart and white-gold light floods out.",
  tags: ["kami", "japan", "shinto", "cave", "rock", "light", "amaterasu", "天岩户", "天岩戸", "shimenawa", "event", "one-shot"],
  size: [W, H],
  origin: [OX, OY],
  duration: END,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: CAVE, gold: SUN, seed: 52 },
};

/** The door's inner edge, px from the seam, top to bottom: a jagged, chipped stone profile. */
const EDGE = [[-150, 26], [-136, 22], [-120, 30], [-104, 20], [-88, 26], [-72, 17], [-56, 24], [-40, 15], [-24, 21], [-8, 13], [2, 17]];
function edgeAt(y) {
  for (let i = 1; i < EDGE.length; i++) {
    const [y1, x1] = EDGE[i], [y0, x0] = EDGE[i - 1];
    if (y <= y1) return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  }
  return EDGE[EDGE.length - 1][1];
}

/** One door panel: a body rect down to the shortest inner edge, then a jagged lip built a few pixels at a
 * time. Keeps the door to a few thousand writes a frame instead of a per-pixel polygon test. */
function slab(p, C, side, dx, k, seed) {
  if (k <= 0.02) return;
  const minInner = 13 + dx, far = side * OUTER;
  const near0 = side * minInner;
  p.rect(Math.min(far, near0), TOP, Math.abs(far - near0), BOT - TOP, C[2], 0.95 * k);
  // crown and base tones
  p.rect(Math.min(far, near0), TOP, Math.abs(far - near0), 16, C[3], 0.9 * k);
  p.rect(Math.min(far, near0), -14, Math.abs(far - near0), 16, C[1], 0.8 * k);
  for (let y = TOP; y < BOT; y += 3) {
    const chip = loopNoise(y / 34 + 0.2, 1.4, seed + 5) * 3;
    const inner = edgeAt(y) + dx + chip;
    if (inner > minInner + 0.5) {
      const w = inner - minInner, x = side < 0 ? -inner : minInner;
      p.rect(x, y, w, 2, y < TOP + 16 ? C[3] : y > -14 ? C[1] : C[2], 0.95 * k);
    }
    const ex = side < 0 ? -inner + 1 : inner - 1;
    p.rect(ex, y, 1, 2, y < TOP + 24 ? C[6] : C[4], 0.75 * k);
    p.rect(ex - side, y, 2, 2, C[1], 0.5 * k);
    if ((y - TOP) % 14 === 0) p.line(side < 0 ? -OUTER + 3 : minInner, y, side < 0 ? -minInner : OUTER - 3, y, C[1], 0.4 * k);
  }
  for (let i = 0; i < 6; i++) {
    const B = rng(seed, i, 3), y = TOP + 16 + i * 22 + B.range(-4, 4);
    const x = side * (34 + B.range(0, 18));
    const e = side * (edgeAt(y) + dx);
    p.line(Math.min(x, e), y, Math.max(x, e), y + B.range(-1, 1), C[1], 0.35 * k);
    p.line(Math.min(x, e), y - 1, Math.max(x, e), y - 1, C[3], 0.2 * k);
  }
  p.line(side * (OUTER - 2), TOP, side * (OUTER - 2), BOT, C[1], 0.5 * k);
  p.line(side * (OUTER - 4), TOP + 4, side * (OUTER - 4), 0, C[2], 0.35 * k);
}

/** The shimenawa across the door: a thick straw rope, twisted bands and four paper streamers. */
function rope(p, y, dx, slack, k, seed, ph) {
  if (k <= 0.02) return;
  const n = 20, half = 78;
  let prev = null;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = -half + 2 * half * u;
    const sag = Math.sin(u * Math.PI) * (7 + slack * 16);
    const yy = y + sag;
    if (prev) {
      p.line(prev[0], prev[1], x, yy, STRAW_D, 0.9 * k);
      p.line(prev[0], prev[1] - 1, x, yy - 1, STRAW, 0.8 * k);
      if (i % 2 === 0) p.line(prev[0], prev[1] - 1, x, yy - 3, STRAW_D, 0.5 * k);
    }
    prev = [x + dx, yy];
  }
  for (const sx of [-52, -20, 18, 50]) {
    const u = (sx + half) / (2 * half), flap = Math.sin(ph * TAU * 2 + u * 5) * (1 + slack * 4);
    const yy = y + Math.sin(u * Math.PI) * (7 + slack * 16);
    shide(p, sx + dx + flap, yy + 1, 5, 11, 0.9 * k);
  }
  p.glow(dx, y + 8, 28, STRAW, 0.03 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = fit(o.gold ?? SUN, 8), seed = o.seed;
  const fade = 1 - smooth(3.1, 3.75, t);
  // the cave wall: a dark field with cold seams, and a faint shrine frame behind the door
  p.rect(-160, -180, 320, 200, C[0], 0.92 * fade);
  for (let i = 0; i < 7; i++) {
    const B = rng(seed, i, 7), x = -140 + i * 44 + B.range(-6, 6);
    p.line(x, -178, x + B.range(-8, 8), 2, C[1], 0.3 * fade);
  }
  torii(p, C, 0, 0, 206, 158, 0.16 * fade, { red: C[2], dark: C[1] });
  // light already leaking: a dim gold seam behind the slabs
  const leak = smooth(0.1, CRACK, t) * fade;
  if (leak > 0.02) {
    p.beam(0, TOP + 8, 0, 0, 1 + 2 * leak, S[5], 0.25 * leak);
    p.glow(0, -76, 32, S[4], 0.08 * leak);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = fit(o.gold ?? SUN, 8), seed = o.seed, ph = t / END;
  const fade = 1 - smooth(3.1, 3.75, t);
  const strain = smooth(0.08, CRACK, t) * (1 - smooth(CRACK, OPEN, t));
  const open = smooth(CRACK, OPEN + 0.2, t);
  const flood = smooth(OPEN - 0.1, OPEN + 0.25, t) * (1 - smooth(2.9, 3.6, t));
  const slide = 4 * smooth(0.4, CRACK, t) + 24 * ease.outCubic(smooth(CRACK, OPEN + 0.15, t));

  slab(p, C, -1, slide, 0.92 * fade, seed);
  slab(p, C, 1, slide, 0.92 * fade, seed + 3);

  // the seam: a hairline, then a burning crack, then the flood
  if (t >= 0.35) {
    const k = smooth(0.35, CRACK, t) * fade;
    const w = 1 + 2 * smooth(CRACK, OPEN, t);
    p.line(0, TOP + 10, 0, -2, S[6], 0.9 * k);
    p.line(-w, TOP + 16, -w - 2, -6, S[5], 0.55 * k);
    p.line(w, TOP + 12, w + 2, -4, S[5], 0.5 * k);
    for (let i = 0; i < 7; i++) {
      const B = rng(seed, i, 13), y = TOP + 16 + i * 19 + B.range(-5, 5);
      const d = 8 + 18 * smooth(0.4, OPEN, t) + B.range(0, 9);
      const side = i % 2 ? 1 : -1;
      p.polyline([[0, y], [side * d * 0.5, y + B.range(-5, 5)], [side * d, y + B.range(-8, 8)]], i % 3 ? C[5] : S[5], 0.55 * k);
    }
    p.glow(0, -76, 22, S[4], 0.1 * k);
  }

  // the shimenawa: sags, then parts and its halves whip back
  const ropeK = 1 - smooth(OPEN - 0.06, OPEN + 0.1, t);
  if (ropeK > 0.02) rope(p, -96, -slide * 0.5, strain * 0.5 + open * 0.4, ropeK, seed, ph);

  // the flood: a fan of white-gold rays, a pillar through the seam and a wash over the floor
  if (flood > 0.01) {
    rayFan(p, S, 0, -76, 8, 100, 12, ph * 2 * TAU, 0.85 * flood, { longEvery: 3, floor: -2 });
    p.poly([[-3, TOP + 18], [3, TOP + 18], [44, 0], [-44, 0]], S[5], 0.16 * flood);
    p.poly([[-1, TOP + 18], [1, TOP + 18], [16, 0], [-16, 0]], S[6], 0.24 * flood);
    p.beam(0, TOP + 20, 0, 0, 2 + 3 * flood, WHITE, 0.6 * flood);
    p.glow(0, -64, 52, S[4], 0.16 * flood);
    p.glow(0, -10, 40, S[5], 0.16 * flood);
    p.ellipse(0, -1, 46 + 14 * flood, 8, S[5], 0.22 * flood);
    p.ellipse(0, -1, 26, 4, S[6], 0.2 * flood);
    for (let i = 0; i < 14; i++) {
      const B = rng(seed, i, 17), x = B.range(-86, 86), y = -1 + B.range(0, 4);
      p.dot(x, y, i % 3 ? S[5] : WHITE, 0.45 * flood);
    }
  }

  // the stone chips fly when the seam opens, then fall and settle
  const chipK = smooth(CRACK, CRACK + 0.2, t) * fade;
  if (chipK > 0.02) {
    for (let i = 0; i < 26; i++) {
      const B = rng(seed, i, 19), born = CRACK + B.range(0, 0.35), age = t - born;
      if (age < 0) continue;
      const vx = B.range(-58, 58), vy = B.range(-84, -28);
      const x = vx * age, y = -66 + vy * age + 0.5 * 210 * age * age;
      if (Math.abs(x) > 150 || y > 2) continue;
      const k = chipK * (1 - age / 2.2);
      if (k <= 0.02) continue;
      p.rect(x, y, 2 + (i % 3 === 0 ? 1 : 0), 2, i % 2 ? C[2] : C[3], 0.9 * k);
      if (i % 4 === 0) p.dot(x + 1, y - 1, C[4], 0.6 * k);
    }
    for (let i = 0; i < 8; i++) {
      const B = rng(seed, i, 23), x = B.range(-36, 36) + B.range(-6, 6) * t;
      p.ellipse(x, -1, 7 + B.range(0, 8), 2, C[2], 0.22 * chipK * B.range(0.4, 1));
    }
  }

  // the paper streamers are flung and flutter down, catching the light
  const shideK = smooth(OPEN - 0.08, OPEN + 0.05, t) * fade;
  if (shideK > 0.02) {
    for (const [sx, vy] of [[-52, -62], [-20, -80], [18, -74], [50, -58]]) {
      const age = Math.max(0, t - (OPEN - 0.05));
      const x = sx + Math.sin(age * 2.4 + sx) * 7 + vy * age * 0.25;
      const y = -96 + (1 - Math.exp(-age * 3)) * vy * 0.3 + age * 32;
      if (y > 0 || Math.abs(x) > 140) continue;
      p.poly([[x, y], [x + 5, y + 1], [x + 2, y + 6], [x + 6, y + 7], [x + 3, y + 12], [x + 1, y + 7], [x - 3, y + 6]], WHITE, 0.8 * shideK);
      p.line(x + 2, y + 6, x + 5, y + 7, STRAW_D, 0.4 * shideK);
    }
  }

  // the light recedes: the wash cools to gold, then to a last warm seam
  const settle = smooth(2.2, 3.0, t) * fade;
  if (settle > 0.02) {
    p.line(0, TOP + 24, 0, -2, S[5], 0.35 * settle);
    p.glow(0, -76, 24, S[4], 0.08 * settle);
    for (let i = 0; i < 10; i++) {
      const B = rng(seed, i, 29), age = t - 1.5 - B.range(0, 0.9);
      if (age < 0) continue;
      const x = B.range(-70, 70) + Math.sin(age * 1.6 + i) * 4;
      const y = -4 - age * B.range(14, 38);
      p.dot(x, y, i % 3 ? S[4] : GOLD_HOT, 0.5 * settle * B.range(0.4, 1));
    }
  }
  if (t > 1.45 && t < 2.2) {
    const f = 1 - smooth(1.9, 2.2, t);
    sparkle(p, 0, -64, 24 * f + 6, WHITE, S[4], 0.6 * f);
    glint(p, 0, -64, Math.round(2 + 5 * f), WHITE, 0.25 * f);
  }
}
