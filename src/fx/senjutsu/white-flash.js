// Sage art, a white burst: sage energy is drawn into the hands, then let go as a blinding dome of white light,
// a flat shock ring on the floor, cracked earth and a slow rain of dust and embers.
import { fit, clamp, smooth, ease, band, burst, fly, rng, TAU, WHITE, sparkle, READY } from "../../core/index.js";
import { SAGE, JADE } from "../ninjutsu/_lib.js";

const HIT = 0.58, END = 3.0, GY = -24;

export const meta = {
  name: "White flash",
  desc: "Sage energy gathers in his hands, then goes off as a blinding dome of white light: a flat shock ring, cracked ground, and a slow rain of dust and gold embers.",
  tags: ["chakra", "senjutsu", "sage", "light", "flash", "burst", "technique", "one-shot"],
  size: [300, 232],
  origin: [150, 184],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SAGE, natural: JADE, seed: 39 },
};

const GATHER = { ...READY, x: -1, crouch: 5, lean: -3, turn: 1, fx: 5, fy: -24, bx: 1, by: -25, ffx: 5, fbx: -3, armsFront: true };
const OPEN = { ...READY, x: 1, crouch: 6, lean: 4, turn: 1, fx: -10, fy: -27, bx: 13, by: -27, ffx: -8, fbx: 10, toeB: true };
export const act = {
  poses: [
    [-0.4, READY],
    [0.04, GATHER],
    [0.5, { ...GATHER, crouch: 8, lean: -5, fx: 4, bx: 2 }],
    [HIT, { ...OPEN, crouch: 5, lean: 4 }, "snap"],
    [HIT + 0.4, { ...OPEN, crouch: 6, lean: 2 }],
    [1.8, { ...READY, x: 2, crouch: 4 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.07, shake: 0.5, amp: 4, target: false },
    { t: HIT + 0.2, flash: 0, shake: 0.3, amp: 2, target: false },
  ],
  dust: [{ t: HIT, x: 0, n: 12, dir: 1, c: "#fff4c8" }, { t: HIT, x: 0, n: 12, dir: -1, c: "#fff4c8" }],
};

const CRACKS = crackLines(39, 11);

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(o.natural ?? JADE, 8), S = o.seed;
  const pre = smooth(0.05, 0.5, t) * (t < HIT ? 1 : 0);

  // before: the air is pulled in, sage marks turn around the hands, the point goes white
  if (t < HIT) {
    const q = t / HIT;
    for (let i = 0; i < 3; i++) {
      const a0 = t * (1.6 + i * 0.5) + (i / 3) * TAU, rr = 16 + i * 5;
      for (let k = 0; k < 12; k++) {
        if ((k + Math.floor(t * 14)) % 3 === 0) continue;
        const a = a0 + (k / 12) * TAU;
        p.dot(Math.cos(a) * rr, GY + Math.sin(a) * rr * 0.75, i === 1 ? G[5] : C[5], 0.55 * pre);
      }
    }
    for (let i = 0; i < 26; i++) {
      const R = rng(S, i, 3), a = R.range(0, TAU), d = 40 + R.range(0, 40) * (1 - q);
      const px = Math.cos(a) * d, py = GY + Math.sin(a) * d * 0.8;
      if (py > -2) continue;
      p.dot(px + (0 - px) * q * 0.85, py + (GY - py) * q * 0.85, i % 3 ? C[6] : G[6], 0.45 * pre);
    }
    sparkle(p, 0, GY, 2 + 5 * q, C[6], G[5], 0.3 * pre);
    p.circle(0, GY, 1 + 2.5 * q, WHITE, 0.9 * pre);
    p.glow(0, GY, 10 + 18 * q, C[5], 0.3 * pre);
    p.glow(0, -1, 26, C[4], 0.1 * pre);
  }

  if (t >= HIT) {
    const q = t - HIT;
    // the hero frames: a white core, sixteen rays, then the dome
    if (q < 0.15) {
      const k = q < 0.05 ? 1 : 1 - (q - 0.05) / 0.1;
      p.circle(0, GY, 14 + 26 * ease.outQuad(q / 0.15), WHITE, q < 0.05 ? 1 : 0.85 * k);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU + 0.1, len = (26 + 96 * ease.outQuad(q / 0.15)) * (i % 2 ? 0.7 : 1);
        for (let d = 6; d < len; d += 1.5) {
          const u = d / len, py = GY + Math.sin(a) * d * 0.75;
          if (py > -1) continue;
          p.dot(Math.cos(a) * d, py, u < 0.45 ? WHITE : C[6], k * (0.9 - u * 0.6));
        }
      }
      p.glow(0, GY, 88, WHITE, 0.75 * k);
      p.glow(0, GY, 60, C[6], 0.5 * k);
      // A tighter inner star gives the release a crisp white-hot center before the dome expands.
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + 0.2, len = 18 + 36 * ease.outQuad(q / 0.15);
        p.line(Math.cos(a) * 5, GY + Math.sin(a) * 4,
          Math.cos(a) * len, GY + Math.sin(a) * len * 0.72,
          i % 2 ? C[6] : WHITE, k * 0.82);
      }
    }
    // the dome, three rings out of the ground; only the upper half so they sit on the floor
    for (let i = 0; i < 3; i++) {
      const rr = 18 + q * (110 + i * 26);
      const a = clamp(1 - rr / 155, 0, 1) * 0.42 * (1 - smooth(0.7, 1.3, q));
      if (a > 0.005) band(p, 0, 0, rr, 0.92, i === 2 ? 1 : 2.2, a, i === 2 ? G : C, (g) => Math.sin(g) < 0.12, q < 0.12);
    }
    // the flat shock ring skims the floor and the ground jumps
    for (let i = 0; i < 2; i++) {
      const rr = 14 + q * (120 + i * 34);
      const a = clamp(1 - rr / 150, 0, 1) * (1 - smooth(0.8, 1.5, q)) * (i ? 0.24 : 0.44);
      if (a > 0.005) band(p, 0, 0, rr, 0.16, 2, a, C, undefined, q < 0.12);
    }
    // dust lifted off the floor and settling, and gold embers drifting down
    burst(46, S + 5, (R) => {
      const a = R.range(0, TAU), sp = R.range(30, 160), life = R.range(0.7, 1.8), delay = R.range(0, 0.12), age = q - delay;
      if (age < 0 || age > life) return;
      const x0 = Math.cos(a) * R.range(0, 12), y0 = -1;
      const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp * 0.3 - R.range(20, 70);
      const [x, y] = fly(x0, y0, vx, vy, age, 60, 1.4);
      const u = age / life;
      if (y > -0.5) return;
      p.dot(x, y, u < 0.3 ? C[6] : u < 0.7 ? C[4] : C[3], 0.7 * (1 - u));
    });
    burst(20, S + 9, (R) => {
      const a = R.range(-2.8, -0.3), sp = R.range(30, 110), life = R.range(1.2, 2.2), delay = 0.2 + R.range(0, 0.3), age = q - delay;
      if (age < 0 || age > life) return;
      const x = Math.cos(a) * sp * age, y = GY + Math.sin(a) * sp * age + 60 * age * age;
      const u = age / life;
      if (y > -1) return;
      p.dot(x, y, u < 0.5 ? WHITE : G[6], 0.7 * (1 - u));
      if (R.chance(0.25)) p.glow(x, y, 4, G[5], 0.08 * (1 - u));
    });
    // cracks cool from white to gold
    if (q < 2.2) {
      const f = 1 - smooth(0.3, 2.2, q), hot = q < 0.25 ? WHITE : q < 0.7 ? C[6] : q < 1.3 ? C[5] : C[4];
      for (const pts of CRACKS)
        for (let i = 0; i < pts.length - 1; i++) p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], hot, f * 0.8);
      p.glow(0, -1, 30, C[4], 0.3 * f);
    }
    // afterglow in the air
    if (q < 1.4) p.glow(0, GY, 40 + q * 16, C[5], 0.16 * (1 - q / 1.4));
    if (q < 0.5) p.glow(0, GY, 20, WHITE, 0.2 * (1 - q / 0.5));
    if (q < 0.55) {
      const f = 1 - smooth(0.18, 0.55, q);
      for (let i = 0; i < 10; i++) {
        const a = i * TAU / 10 + 0.3, rr = 32 + q * 60;
        p.dot(Math.cos(a) * rr, GY + Math.sin(a) * rr * 0.72, i % 2 ? G[6] : C[6], 0.65 * f);
      }
    }
  }
  p.glow(0, -1, 30, C[4], 0.12 * (1 - smooth(HIT, END, t)));
}

// jagged cracks radiating from the feet, built once so they do not crawl
function crackLines(seed, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const R = rng(seed, i, 5);
    let px = 0, py = 0, a = R.range(0, TAU);
    const pts = [[0, 0]], len = R.range(14, 58);
    for (let d = 0; d < len; d += 3) {
      a += R.range(-0.28, 0.28);
      px += Math.cos(a) * 3;
      py += Math.sin(a) * 1.15;
      pts.push([px, py]);
    }
    out.push(pts);
  }
  return out;
}
