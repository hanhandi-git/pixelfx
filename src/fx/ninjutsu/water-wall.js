// Water release: water wall. A defensive sheet of water erupts in front of the caster, holds with a foam
// crest and a rain of beads, then collapses into a spreading pool. The sheet is per-pixel: dark translucent
// lanes, sliding white dashes, torn edges and strands, in the same language as water/waterfall and wave-crash.
import { fit, clamp, smooth, rng, rand, tileNoise, noise2, TAU, WHITE, READY } from "../../core/index.js";
import { bead, billow, lace } from "../water/_lib.js";
import { WATER } from "./_lib.js";

const RISE = 0.4, HOLD = 1.7, FALL = 2.15, END = 2.6;
const WX = 78, WW = 48, WH = 58;

export const meta = {
  name: "Water wall",
  desc: "A seal, both palms down, and a wall of water erupts in front of him — a translucent sheet with white runnels and a torn foam crest, holding, then collapsing into a spreading pool.",
  tags: ["chakra", "ninjutsu", "water", "defense", "wall", "technique", "one-shot"],
  size: [260, 170],
  origin: [70, 142],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: WATER, seed: 51 },
};

const SEAL = { ...READY, x: -3, crouch: 7, lean: -2, turn: 1, fx: 5, fy: -24, bx: -5, by: -24 };
const SLAM = { ...READY, x: 4, crouch: 6, lean: 5, turn: 1, fx: 12, fy: -18, bx: -7, by: -24, ffx: 9, fbx: -6, toeB: true };
const HOLD_POSE = { ...READY, x: 4, crouch: 4, lean: 3, fx: 10, fy: -20, bx: -6, by: -24 };

export const act = {
  poses: [
    [-0.4, { ...READY, x: -3 }],
    [0.08, SEAL],
    [0.33, { ...SEAL, crouch: 8, lean: -4 }],
    [0.44, SLAM, "snap"],
    [1.7, HOLD_POSE],
    [2.3, { ...HOLD_POSE, crouch: 3, lean: 1 }],
    [END, READY],
  ],
  hits: [],
  dust: [{ t: 0.44, x: 10, n: 8, dir: 1, c: "#9fdcff" }, { t: 2.2, x: WX, n: 6, dir: 1, c: "#9fdcff" }],
};

const wallH = (t) => WH * smooth(RISE, 0.72, t) * (1 - smooth(HOLD, FALL, t));
const hwAt = (v, t) => (WW / 2) * (0.94 + 0.06 * Math.sin(v * 4.2 + t * 2.0)) + 2.2 * v;

// The face of the wall, pixel by pixel. Far lanes are semi-transparent (the dark behind shows through), the
// near lanes carry white dashes sliding down in fall time, and the torn side edges peel into separate strands.
function sheet(p, C, t, h, a, S) {
  if (h < 1 || a <= 0.01) return;
  const y0 = -Math.ceil(h);
  for (let y = y0; y <= -1; y++) {
    const d = -y, v = clamp(d / h, 0, 1), s = Math.sqrt(d + 4), hw = hwAt(v, t);
    const glass = 1 - smooth(4, 22, d);
    for (let X = Math.floor(WX - hw - 2); X <= Math.ceil(WX + hw + 2); X++) {
      const x = X + 0.5, lx = x - WX, e = Math.abs(lx) / hw;
      if (e > 1.04) continue;
      const dash = tileNoise(X * 1.618 + 0.31, s * 1.35 - t * 16, 0, 20, S);
      const broad = tileNoise(Math.floor((lx + 40) / 3) * 2.7, s * 0.45 - t * 7, 0, 6, S + 1);
      const edge = e > 0.84;
      // far water: a dark, see-through lane with only occasional lit pixels
      if (!edge && rand(X, S + 60) < 0.3 && dash < 0.42) {
        p.blend(x, y, C[3], (0.26 + 0.26 * v + 0.12 * glass) * a);
        continue;
      }
      let b = -0.34 + 0.48 * v + 0.32 * broad - 0.12 * e - glass * 0.26 + (edge ? 0.23 : 0);
      if (dash > 0.18 - 0.16 * v) b += 0.32 + 0.55 * (dash - 0.18);
      if (b > -0.12) {
        p.dot(x, y, b > 0.66 ? WHITE : b > 0.38 ? C[6] : b > 0.1 ? C[5] : C[4], a * (0.82 + 0.18 * smooth(0.1, 1, v)));
      } else p.blend(x, y, C[3], (0.3 + 0.2 * v) * a);
    }
  }
  // lit left edge: the side facing the caster, a broken white line rather than a flat border
  for (let y = y0 + 1; y <= -1; y += 1) {
    const d = -y, v = clamp(d / h, 0, 1), hw = hwAt(v, t);
    const n = tileNoise(4, d * 0.7 - t * 12, 0, 8, S + 4);
    if (n > -0.25) p.dot(WX - hw + 0.5 + n, y, n > 0.55 ? WHITE : C[5], 0.65 * a);
  }
  // strands peel off both sides and fall faster than the sheet
  for (let i = 0; i < 9; i++) {
    const B = rng(S, i, 31), side = i % 2 ? 1 : -1, d0 = B.range(4, Math.max(5, h * 0.8));
    const d = d0 + B.range(10, 26) * smooth(RISE, FALL, t) + B.range(0, 16) * Math.sin(t * 2 + i);
    if (d > h - 2) continue;
    const x = WX + side * (hwAt(d / h, t) + 1 + B.range(0, 4));
    p.line(x, -d - 3, x, -d + B.range(2, 6), (u) => (u < 0.4 ? C[5] : C[6]), 0.6 * a);
  }
}

function crest(p, C, t, h, a, S) {
  if (h < 2 || a <= 0.01) return;
  const top = -h;
  for (let i = 0; i < 22; i++) {
    const u = i / 21, x = WX - WW / 2 + u * WW + Math.sin(t * 2.2 + i * 0.9) * 1.4;
    const y = top + Math.sin(u * 6 + t * 3) * 1.6 + tileNoise(i * 1.7, t * 3, 0, 8, S) * 0.9;
    p.dot(x, y, i % 4 === 0 ? WHITE : C[6], 0.9 * a);
    if (i % 3 === 0) p.dot(x + 1, y + 1, C[5], 0.65 * a);
  }
  // thick foam billows sit on the crest and tear loose
  for (let i = 0; i < 7; i++) {
    const B = rng(S, i, 37), x = WX + B.range(-WW / 2 + 2, WW / 2 - 2), r = B.range(2.2, 5.2);
    billow(p, x, top - B.range(0, 2.5) + Math.sin(t * 3 + i) * 0.8, r, C, 0.8 * a);
    if (i % 2 === 0) billow(p, x + B.range(-4, 4), top - B.range(3, 7), r * 0.55, C, 0.55 * a);
  }
  // the crest line itself: a broken white ridge, not a solid band
  for (let x = WX - WW / 2; x <= WX + WW / 2; x += 0.75) {
    const n = tileNoise(x * 0.9, t * 4, 0, 10, S + 2);
    if (n < -0.35) continue;
    p.dot(x, top + n * 0.8, n > 0.5 ? WHITE : C[6], a * 0.8);
  }
}

function spray(p, C, t, h, a, S) {
  if (a <= 0.01) return;
  for (let i = 0; i < 26; i++) {
    const B = rng(S, i, 7), born = 0.42 + B.range(0, 0.55), age = t - born;
    if (age < 0 || age > 1.5) continue;
    const x0 = WX + B.range(-WW / 2, WW / 2) + B.range(-4, 4);
    const vx = B.range(-30, 30), vy = B.range(-92, -28);
    const x = x0 + vx * age, y = -h + 2 + vy * age + 270 * age * age;
    if (y > -1 || x < WX - WW / 2 - 16 || x > WX + WW / 2 + 16) continue;
    bead(p, x, y, vx, vy + 540 * age, B.chance(0.32) ? 3 : 2, C, 0.75 * a);
  }
  for (let i = 0; i < 7; i++) {
    const B = rng(S, i, 43), q = clamp((t - 0.5) / 1.5);
    p.disc(WX + B.range(-22, 22), -h * 0.55 - q * 8 + B.range(-5, 5), 4 + B.range(0, 5), C[5], 0.055 * a);
  }
}

// the pool: dark water, two warped sine nets for caustics, a lace of foam and flat ripple rings
function pool(p, C, t, S, k) {
  if (k <= 0.01) return;
  p.ellipse(WX, 0, WW / 2 + 14, 4.6, C[1], 0.52 * k);
  p.ellipse(WX, 0, WW / 2 + 7, 2.8, C[3], 0.4 * k);
  const RX = WW / 2 + 13, RY = 4.4, cy = 0;
  for (let Y = -5; Y <= 5; Y++) {
    const y = Y + 0.5, dy = (y - cy) / RY;
    if (Math.abs(dy) > 1) continue;
    for (let X = -RX; X <= RX; X++) {
      const x = X + 0.5, dx = x / RX, d = dx * dx + dy * dy;
      if (d > 1) continue;
      const sy = Math.sin(y * 0.9 + t * 3);
      const f = Math.max(0, 1 - Math.abs(Math.sin(x * 0.23 + 1.6 * sy) + Math.sin(y * 0.7 + t * 2)) * 2.4) * (1 - d);
      if (f > 0.25) p.light(WX + x, y, C[5], 0.15 * f * k);
    }
  }
  lace(p, WX, 0, WW / 2 + 8, 4, 0.65 * k, C, t, S + 5);
  for (let i = 0; i < 3; i++) {
    const q = (t * 0.55 + i / 3) % 1;
    p.ellipse(WX, 0, 9 + q * (WW / 2 + 14), 1.15, C[5], 0.27 * k * (1 - q));
  }
  for (let i = 0; i < 12; i++) {
    const B = rng(S, i, 11);
    p.dot(WX + B.range(-WW / 2, WW / 2), B.range(-1, 1), i % 3 ? C[6] : WHITE, 0.45 * k);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const h = wallH(t), a = 1 - smooth(FALL + 0.12, END, t);
  const poolK = smooth(0.4, 0.92, t) * (1 - smooth(2.36, END, t));

  sheet(p, C, t, h, a, S);
  crest(p, C, t, h, a, S);
  spray(p, C, t, h, a, S);
  pool(p, C, t, S, poolK);
  if (h > 2) p.glow(WX, -h * 0.45, WW * 0.95, C[4], 0.15 * a);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  // the seal under the caster, wet floor, and the dark base the wall grows from
  const seal = smooth(0.06, 0.3, t) * (1 - smooth(0.55, 0.9, t));
  if (seal > 0.01) {
    p.ellipse(4, 0, 21, 5, C[3], 0.35 * seal);
    p.ellipse(4, 0, 19, 1.4, C[5], 0.5 * seal);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + t;
      p.dot(4 + Math.cos(a) * 17, Math.sin(a) * 4.5, C[6], 0.4 * seal);
    }
  }
  const wet = smooth(0.4, 0.8, t) * (1 - smooth(2.4, END, t));
  p.ellipse(WX, 0, WW / 2 + 18, 3.4, C[1], 0.38 * wet);
  p.ellipse(WX, 0, WW / 2 + 9, 1.8, C[2], 0.28 * wet);
  // a few persistent wet glints around the pool
  for (let i = 0; i < 8; i++) {
    const B = rng(S, i, 19);
    if (B.chance(0.5)) p.dot(WX + B.range(-WW / 2 - 12, WW / 2 + 12), B.range(-2, 2), C[5], 0.3 * wet);
  }
}
