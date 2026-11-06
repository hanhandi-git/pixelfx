// Golden aura: the power-up. Gold flame climbs off the whole body, the floor lifts, charge crawls over the
// shoulders and the air above fills with grit pulled up out of the ground. A loop, so it holds as a stance.
import { TAU, WHITE, band, cycle, fit, loopNoise, smooth, READY } from "../../core/index.js";
import { GOLD, floorLight, auraTongues, boltFleck, hotStar } from "./_lib.js";

const D = 1.6, H = 68, HW = 22;

export const meta = {
  name: "Golden aura",
  desc: "The power-up stance: gold flame climbs off the whole body, grit lifts out of the floor, charge crawls over the shoulders and the heat haze rises, seamless over the loop.",
  tags: ["ki", "dragonball", "aura", "power", "gold", "flame", "loop"],
  size: [180, 152],
  origin: [90, 142],
  duration: D,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: GOLD, seed: 13 },
};

const STRAIN = { ...READY, x: 0, crouch: 5, lean: -1, turn: 1, fx: 8, fy: -22, bx: -8, by: -22, ffx: 8, fbx: -9 };
export const act = {
  poses: [
    [0, STRAIN],
    [0.4, { ...STRAIN, crouch: 7, lean: -2, fx: 9, fy: -23, bx: -9, by: -23 }],
    [0.8, { ...STRAIN, crouch: 5, lean: 0 }],
    [1.2, { ...STRAIN, crouch: 7, lean: -2, fx: 9, fy: -23, bx: -9, by: -23 }],
    [1.6, STRAIN],
  ],
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / D;
  // the pool of light and the first tongues, behind the body
  floorLight(p, 0, C, 1.1, 30);
  band(p, 0, -1, 15 + 3 * Math.sin(ph * TAU * 2), 0.2, 2, 0.4, C, (a) => Math.sin(a) < 0.2);
  p.glow(0, -24, 52, C[3], 0.24);
  // a wide, dim sheet of flame behind everything, then a second tighter crown
  auraTongues(p, C, 0, HW + 8, H * 0.7, ph, { seed: o.seed + 5, count: 14, inner: C[4], k: 0.55 });
  auraTongues(p, C, 0, HW - 6, H * 0.86, ph, { seed: o.seed, count: 15, inner: C[5], k: 0.8 });
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / D, S = o.seed;
  const breath = 0.5 + 0.5 * Math.sin(ph * TAU * 2);

  // the body is a column of white-hot ki seen through the flame
  p.glow(0, -22, 30, C[5], 0.3 + 0.1 * breath);
  p.glow(0, -34, 20, C[6], 0.22);
  for (let i = 0; i < 5; i++) {
    const n = loopNoise(ph, 2, S + i * 7);
    const x = (i / 4 - 0.5) * 10, w = 1 + 1.4 * n;
    const hh = 26 + 14 * n;
    for (let y = -6; y > -hh; y -= 1.5) {
      const q = -y / hh, ox = Math.sin(q * 5 + ph * TAU * 2 + i) * 1.6 * q;
      // the body reads as gold seen through white heat, not a white pole
      p.dot(x + ox, y, q < 0.22 ? WHITE : q < 0.55 ? C[6] : q < 0.85 ? C[5] : C[4], (1 - q) * (0.5 + 0.4 * n));
      if (q > 0.2 && w > 1.5) p.dot(x + ox + 1, y, C[4], (1 - q) * 0.5);
    }
  }

  // the outer flame, brighter on the near half
  auraTongues(p, C, 0, HW - 2, H, ph, { seed: S + 3, count: 24, inner: C[6] });

  // charge crawling over the shoulders and the head
  for (let i = 0; i < 4; i++) {
    const n = loopNoise(ph, 3, S + i * 11 + 2);
    if (n < 0.42) continue;
    const side = i % 2 ? -1 : 1;
    const a = (side < 0 ? Math.PI - 0.5 : 0.5) + (n - 0.42) * (side < 0 ? -1.6 : 1.6);
    boltFleck(p, side * 6, -30 + (i % 3) * 5, a, 6 + 6 * n, C, (n - 0.42) * 1.4);
  }

  // grit and pebbles pulled off the floor, rising and turning as they go
  cycle(t, D, 14, S * 5 + 1, D * 0.9, (age, life, R) => {
    const q = age / life, x0 = R.range(-30, 30), rise = 14 + R.range(0, 40);
    const y = -1 - q * rise, x = x0 + Math.sin(q * 7 + R.next() * 6) * 2.4;
    const c = q < 0.3 ? C[4] : q < 0.7 ? C[3] : C[2];
    if (R.chance(0.5)) p.px(x, y, c);
    else { p.px(x, y, c); p.px(x + 1, y, C[2]); }
    if (q > 0.75) p.dot(x, y - 1, C[5], (1 - (q - 0.75) / 0.25) * 0.6);
  });

  // heat sparks at the top of the flame
  cycle(t, D, 7, S * 7 + 3, D * 0.7, (age, life, R) => {
    const q = age / life, x = R.range(-10, 10) + Math.sin(q * 6 + R.next() * 6) * 3;
    const y = -H * (0.6 + 0.4 * R.next()) - q * 12;
    p.dot(x, y, q < 0.4 ? WHITE : C[6], (1 - q) * 0.9);
    p.glow(x, y, 4, C[5], 0.08 * (1 - q));
  });

  // the floor answers: dust washed outward and a ring that pulses on the beat
  for (let i = 0; i < 2; i++) {
    const q = (ph * 2 + i * 0.5) % 1;
    const a = 0.35 * (1 - smooth(0.6, 1, q));
    if (a > 0.02) band(p, 0, -1, 12 + q * 26, 0.22, 2, a, C);
  }
  p.glow(0, -1, 34, C[4], 0.18 + 0.06 * breath);
  if (loopNoise(ph, 1.5, S + 31) > 0.72) hotStar(p, 0, -44, 4, ph * TAU, C, 0.5);
}
