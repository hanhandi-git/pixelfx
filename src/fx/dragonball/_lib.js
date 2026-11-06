// Shared ki language for the dragonball set: the ramps, the pressed energy sphere, the thick beam, the muzzle
// flare, the shock rings, the aura tongues and the ground cracks. Everything is a function of a loop phase or
// of a one-shot clock, so the effects stay deterministic and loops seam perfectly.
//
// The arm-on-a-sphere technique follows the library's chakra sphere (src/fx/ninjutsu/_lib.js); the beam column
// and the impact rays follow the library's arcane beam workflow (adapted from Sprite Fusion's open-source
// energy effect, https://www.spritefusion.com/pixel-art-vfx/energy, MIT, Copyright (c) 2026 Hugo Duprez).

import { TAU, WHITE, band, clamp, cycle, fly, fract, loopNoise, rng, smooth } from "../../core/index.js";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
/** The 4x4 ordered-dither threshold (0..1) of the pixel cell holding (x, y). */
export const bayer = (x, y) => BAYER[((Math.floor(y) & 3) << 2) | (Math.floor(x) & 3)];

/** Ki blue: a near-black base, cobalt body, cyan rim, white heart. */
export const KI = ["#050716", "#0b1e56", "#123f9c", "#1f6fd8", "#48a8ff", "#8fe0ff", "#d8f8ff", "#ffffff"];
/** Super energy gold: ember shadow, amber body, white-hot tips. */
export const GOLD = ["#1a0b02", "#402004", "#7d4008", "#c07800", "#ffb400", "#ffdd52", "#fff3a8", "#ffffff"];
/** Spirit energy: a cold sky blue-green that reads as gathered life, not fire. */
export const SPIRIT = ["#031018", "#073a4e", "#0b6c84", "#1292a4", "#3cc4cc", "#8ee8e4", "#d8fffb", "#ffffff"];
/** Drilling ki: violet-magenta, tighter and more violent than the blue. */
export const DRILL = ["#100314", "#2c0736", "#55106a", "#8c1c8c", "#cf3cb4", "#ff86dc", "#ffd0f2", "#ffffff"];
/** Rage red: the awakened state, with an orange edge so it does not read as blood. */
export const RAGE = ["#170205", "#3c0710", "#720f1e", "#b8202c", "#ef4a38", "#ff9060", "#ffd8b0", "#ffffff"];
/** Broken ground: cool grey stone, lit by whatever is hitting it. */
export const STONE = ["#0d0b0f", "#1b171d", "#2b2530", "#3f3743", "#5a4f5c", "#7d7080", "#a89aa8", "#d8ccd0"];

/** The far half of a ring lies behind the body; `keep` filters by angle. */
export const FAR = (a) => Math.sin(a) < 0;

/**
 * A pressed sphere of ki: a hot white heart inside a cobalt shell, four spiral arms turning on the sphere,
 * pressure rings squeezed off the rim, and flecks of charge crawling in the shell. ph is 0..1; r is px.
 * o: { arms, turns, tilt, k, hot, ring, fleck }.
 */
export function kiOrb(p, C, x, y, r, ph, o = {}) {
  const k = o.k ?? 1;
  if (r < 1.2 || k <= 0.02) return;
  const arms = o.arms ?? 4, turns = o.turns ?? 1.6, spin = ph * TAU * turns, tilt = o.tilt ?? 0.32;
  const hot = o.hot ?? 1;

  // the shell: lit from the upper left, a single bright rim, hard steps
  p.circle(x, y, r, (d, ang) => {
    if (d > 0.94) return C[6];
    const lit = Math.cos(ang + Math.PI * 0.76);
    if (lit > 0.25 && d < 0.9) return d < 0.55 ? C[5] : C[4];
    if (lit > -0.35) return d < 0.7 ? C[4] : C[3];
    return C[3];
  }, k);

  // arms on the sphere: crisp on the front half, a dim echo behind
  for (const front of [false, true]) {
    for (let a = 0; a < arms; a++) {
      const off = (a / arms) * TAU;
      let run = [];
      for (let u = 0; u <= 1.0001; u += 0.03) {
        const lat = -1.15 + u * 2.3, lon = spin + off + u * 1.9 * Math.PI;
        const cl = Math.cos(lat), sl = Math.sin(lat), z = cl * Math.sin(lon);
        const px = x + cl * Math.cos(lon) * r * 0.92, py = y + sl * r * 0.92;
        if (front !== z >= 0) {
          if (run.length > 1) drawRun(p, run, front ? C[6] : C[4], front ? 0.95 : 0.4);
          run = [];
          continue;
        }
        run.push([px, py]);
      }
      if (run.length > 1) drawRun(p, run, front ? C[6] : C[4], front ? 0.95 : 0.4);
    }
  }

  // pressure rings squeezed off the rim, two per loop, opposite directions
  if (o.ring !== false) {
    for (let i = 0; i < 2; i++) {
      const q = (ph * 2 + i * 0.5) % 1;
      const a = 0.4 * (1 - smooth(0.5, 1, q)) * k;
      if (a > 0.02) p.arc(x, y, r + 1.2 + q * (r * 0.7), 1, -2.5, 1.4, C[5], a);
    }
  }

  // the heart: three hard steps so it does not mush at 1x
  p.circle(x - r * 0.05, y - r * 0.07, r * 0.5, C[5], k);
  p.circle(x - r * 0.07, y - r * 0.09, r * 0.34, C[6], k);
  p.circle(x - r * 0.08, y - r * 0.11, r * 0.16, WHITE, k * hot);

  // charge flecks crawling over the shell, born and dying in the phase
  if (o.fleck !== false) {
    for (let i = 0; i < 4; i++) {
      const g = loopNoise(ph, 2, o.seed ?? 3);
      const a = ph * TAU * 2 + (i / 4) * TAU, rr = r * (0.55 + 0.35 * (0.5 + 0.5 * g));
      if (loopNoise(ph, 1.7, i * 17 + 5) < 0.2) continue;
      const bx = x + Math.cos(a) * rr, by = y + Math.sin(a) * rr * 0.9;
      const a2 = a + 0.35;
      p.line(bx, by, x + Math.cos(a2) * (rr + 2), y + Math.sin(a2) * (rr + 2), i % 2 ? WHITE : C[6], 0.9 * k);
    }
  }

  // a rim glint at the upper left, a hot pin in the heart
  p.arc(x, y, r - 0.2, 1, -2.55, -1.5, WHITE, k * 0.85);
  p.px(x - r * 0.08, y - r * 0.11, WHITE);
  p.glow(x, y, r * 3.1, C[4], 0.28 * k);
  p.glow(x, y, r * 1.25, C[6], 0.22 * k);
  p.glow(x, y, r * 0.5, WHITE, 0.3 * k);
}

const drawRun = (p, run, c, a) => {
  for (let i = 0; i < run.length - 1; i++) {
    const [x0, y0] = run[i], [x1, y1] = run[i + 1];
    if (Math.hypot(x1 - x0, y1 - y0) < 2.6) p.line(x0, y0, x1, y1, c, a);
    else p.dot(x0, y0, c, a * 0.7), p.dot(x1, y1, c, a * 0.7);
  }
};

/**
 * A column of ki fired right from (x0, y): a white core, stepped cobalt bands, three strands twisting around
 * it, hot pulses running down it and a fringe that thins through the dither. len is full length, w the half
 * width at its thickest. t drives the strands and pulses. o: { k, seed, head (0..1 of len), flare, tight }.
 */
export function kiBeam(p, C, x0, y, len, w, t, o = {}) {
  const k = o.k ?? 1, head = clamp(o.head ?? 1);
  if (k <= 0.01 || len <= 0.5 || head <= 0.01) return;
  const L = len * head, seed = o.seed ?? 1;
  const LV = [WHITE, C[6], C[5], C[4], C[3], C[2]];
  // the body
  for (let d = 0; d <= L; d += 0.5) {
    const x = x0 + d;
    const grow = Math.min(1, (d + 7) / 15);
    const tip = 1 - smooth(L - 9, L, d) * 0.75;
    const swell = 1 + (o.flare ?? 0) * smooth(L * 0.55, L, d);
    const ww = Math.max(1, w * grow * tip * swell * (1 + 0.07 * Math.sin(d * 0.11 - t * 9)));
    const pulse = fract((d - t * 190) / 58);
    const headHot = L - d < 7;
    for (let q0 = -ww * 1.25; q0 <= ww * 1.25; q0 += 0.5) {
      const q = Math.abs(q0) / ww + 0.05 * Math.sin(d * 0.21 - t * 20);
      if (q > 1.22) continue;
      let lv = q < 0.3 ? 0 : q < 0.5 ? 1 : q < 0.68 ? 2 : q < 0.84 ? 3 : q < 1 ? 4 : 5;
      if (pulse < 0.06 && q < 0.9) lv = Math.max(0, lv - 2);
      if (headHot) lv = Math.max(0, lv - 2);
      if (lv === 5 && bayer(x, y + q0) > 1.7 - q) continue;
      p.px(x, y + q0, LV[lv]);
    }
  }
  // three strands twisting round the core: white where they face us, gone behind
  for (let d = 0; d <= L; d += 0.75) {
    const x = x0 + d;
    const ww = w * Math.min(1, (d + 7) / 15) * (1 + 0.07 * Math.sin(d * 0.11 - t * 9));
    for (let s = 0; s < 3; s++) {
      const a = d * 0.15 - t * 20 + (s * TAU) / 3;
      const off = Math.sin(a) * ww * 1.04;
      if (Math.cos(a) > 0) p.dot(x, y + off, Math.cos(a) > 0.5 ? WHITE : C[6], 0.95);
    }
    if ((Math.round(d) & 7) === 0) p.glow(x, y, ww * 2.4 + 5, C[5], 0.1 * k);
  }
  // a soft sleeve of light round it
  p.glowLine(x0, y, x0 + L, y, w * 2.6, C[4], 0.2 * k);
  p.glowLine(x0, y, x0 + L, y, w * 0.9, C[6], 0.16 * k);
}

/**
 * The flare at the mouth of a technique: a spinning cross of rays, one or two rings, a white core.
 * t is the clock, k fades it, r the size.
 */
export function muzzleFlare(p, C, x, y, r, t, k = 1) {
  if (k <= 0.02) return;
  for (let i = 0; i < 4; i++) {
    const a = t * 9 + (i * TAU) / 4, l = r * (1.5 + 0.5 * Math.sin(t * 13 + i * 1.7));
    p.line(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, (u) => (u < 0.5 ? WHITE : C[6]), (u) => (u < 0.6 ? k : k * (1.6 - u)));
  }
  p.circle(x, y, r, C[5], k);
  p.circle(x, y, r * 0.62, C[6], k);
  p.circle(x, y, r * 0.3, WHITE, k);
  p.glow(x, y, r * 6, C[5], 0.5 * k);
  p.glow(x, y, r * 2.4, C[6], 0.3 * k);
}

/**
 * A hot star with four long points and four short, rotating with `rot` (radians). k fades it.
 */
export function hotStar(p, x, y, r, rot, C, k = 1) {
  if (k <= 0.02) return;
  for (let i = 0; i < 8; i++) {
    const a = rot + (i / 8) * TAU, len = r * (i % 2 ? 0.34 : 1);
    for (let d = 0.5; d <= len; d += 0.5) p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d, d < len * 0.45 ? WHITE : C[6], k * (0.9 - (d / len) * 0.7));
  }
  p.px(x, y, WHITE);
  p.glow(x, y, r * 2.4, C[6], 0.3 * k);
}

/**
 * The impact of a ki attack, drawn analytically from q = seconds since contact: a white flash, rays, three
 * ground rings, a scorch and a fan of sparks under gravity. y should be the contact point (the body's chest or
 * the floor); ground is where sparks bounce. o: { seed, k, n, life, size }.
 */
export function kiImpact(p, C, x, y, q, o = {}) {
  if (q < 0) return;
  const k = o.k ?? 1, seed = o.seed ?? 1, G = o.ground ?? 0;
  const flash = Math.max(0, 1 - q / 0.2);
  if (flash > 0) {
    const rr = 7 + 26 * Math.sqrt(Math.min(1, q / 0.2));
    p.circle(x, y, rr * 0.5, WHITE, flash);
    p.circle(x, y, rr, C[6], flash * 0.85);
    p.glow(x, y, rr * 2 + 10, C[5], 0.7 * flash * k);
    p.glow(x, y, rr * 1.2 + 4, WHITE, 0.5 * flash * k);
  }
  // rays that shoot out and decay
  const rk = Math.max(0, 1 - q / 0.42);
  if (rk > 0) {
    for (let i = 0; i < 12; i++) {
      const R = rng(seed, i, 31), a = R.range(0, TAU), l = (8 + R.range(10, 34)) * (0.4 + 0.6 * rk);
      for (let d = 4; d < l; d += 0.5) p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d, d < l * 0.5 ? C[6] : C[5], rk * (0.9 - d / l));
    }
  }
  // shock rings: a tight one at the contact, then two lying flat on the floor, capped so they stay in frame
  for (let i = 0; i < 3; i++) {
    const d = q - i * 0.05;
    if (d < 0) continue;
    const rr = 6 + d * (40 + i * 14), a = clamp(1 - rr / (44 + i * 14), 0, 1) * (0.6 - i * 0.12);
    if (a <= 0.01) continue;
    if (i === 0) p.ring(x, y, rr, 1.5, C[5], a);
    else band(p, x, G - 1, Math.min(rr * 1.15, 46), 0.2, 2, a * 0.6, C);
    p.glowRing(x, G - 1, Math.min(rr * 1.05, 44), 4, C[4], a * 0.35);
  }
  // sparks: a fan thrown back, cooling and falling
  const n = o.n ?? 26, life = o.life ?? 0.7;
  for (let i = 0; i < n; i++) {
    const R = rng(seed, i, 97), a = Math.PI + R.range(-1.12, 1.12), sp = R.range(60, 200), L = life * R.range(0.55, 1);
    const age = q - R.range(0, 0.09);
    if (age < 0 || age > L) continue;
    const [px, py] = fly(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 50, age, 760, 1.2);
    if (py > G) continue;
    const f = 1 - age / L, [vx, vy] = [Math.cos(a) * sp, Math.sin(a) * sp - 50 + 760 * age], vs = Math.hypot(vx, vy) || 1;
    const len = Math.min(6, 1 + vs * 0.014);
    p.line(px - (vx / vs) * len, py - (vy / vs) * len, px, py, (u) => (u > 0.5 ? (f > 0.5 ? WHITE : C[6]) : C[4]), f);
    if (i % 5 === 0) p.glow(px, py, 3, C[5], 0.25 * f);
  }
  // a scorch that cools out
  const sc = 1 - smooth(0.1, 1.4, q);
  if (sc > 0) {
    p.disc(x, G - 2, (10 + 7 * Math.min(1, q * 2)) * (0.7 + 0.3 * sc), C[1], 0.25 * sc);
    p.glow(x, G - 1, 26, C[4], 0.3 * sc);
  }
}

/**
 * Rising tongues of aura round a body: the signature power-up flame. cx is the body center, halfW its half
 * width, h the peak height, ph the loop phase. k fades it. o: { seed, count, C2 (inner color) }.
 */
export function auraTongues(p, C, cx, halfW, h, ph, o = {}) {
  const k = o.k ?? 1;
  if (k <= 0.02) return;
  const count = o.count ?? 20, seed = o.seed ?? 1, I = o.inner ?? C[6];
  for (let i = 0; i < count; i++) {
    const u = (i / (count - 1)) * 2 - 1;
    const n = 0.5 + 0.5 * loopNoise(ph, 2, seed + i * 3);
    const n2 = loopNoise(ph, 3, seed + i * 7 + 11);
    const x = cx + u * halfW * (0.86 + 0.14 * n);
    const hh = h * (0.28 + 0.72 * n) * (1 - Math.abs(u) * 0.3);
    const sway = Math.sin(ph * TAU * 2 + i * 1.3) * (1.6 + 1.4 * n2);
    const w0 = 2.4 + 1.9 * (1 - Math.abs(u));
    for (let j = 0; j < 18; j++) {
      const t = j / 17, yy = -t * hh;
      const xx = x + sway * t * t + (t > 0.55 ? Math.sin(t * 12 + i) * 1.1 : 0);
      const ww = Math.max(0, w0 * Math.pow(1 - t, 0.85));
      const c = t < 0.3 ? C[4] : t < 0.62 ? C[5] : t < 0.86 ? I : WHITE;
      if (ww >= 1) p.rect(Math.round(xx - ww / 2), Math.round(yy), Math.max(1, Math.round(ww)), 1, c, k * (0.95 - t * 0.25));
      else p.dot(xx, yy, t < 0.8 ? I : WHITE, k * (0.9 - t * 0.3));
      if (j % 9 === 0 && t > 0.2) p.glow(xx, yy, 5, t < 0.6 ? C[4] : C[5], 0.12 * k * (1 - t));
    }
    // a detached lick that climbs off the tip
    const lift = loopNoise(ph, 1.4, seed + i * 13 + 3);
    if (lift > 0.55) {
      const t = (lift - 0.55) / 0.45, yy = -hh - t * 9, xx = x + sway * (1 + t);
      p.dot(xx, yy, WHITE, k * (1 - t) * 0.8);
      p.dot(xx + 0.7, yy + 1, C[5], k * (1 - t) * 0.5);
    }
  }
}

/** A short zigzag of charge in the air (2 to 4 segments), from (x, y) out to len px at angle a. */
export function boltFleck(p, x, y, a, len, C, k = 1) {
  if (k <= 0.05) return;
  let px = x, py = y;
  const segs = 3;
  for (let i = 1; i <= segs; i++) {
    const u = i / segs, na = a + (i % 2 ? 0.55 : -0.4);
    const nx = x + Math.cos(a) * len * u + Math.cos(na) * len * 0.18, ny = y + Math.sin(a) * len * u + Math.sin(na) * len * 0.18;
    p.line(px, py, nx, ny, i === segs ? C[6] : WHITE, k * (1 - u * 0.35));
    px = nx;
    py = ny;
  }
  p.glow(x, y, len * 0.8, C[5], 0.16 * k);
}

/** Jagged cracks radiating from a point, built once from a seed so they do not crawl between frames. */
export function crackFan(seed, n, len = 54, spread = 1.1, down = 9) {
  const Q = rng(seed, 3, 19), out = [];
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + Q.range(-0.2, 0.2);
    let px = 0, py = 0, a = a0;
    const pts = [[0, 0]];
    const L = len * Q.range(0.5, 1);
    for (let d = 0; d < L; d += 3) {
      a += Q.range(-0.22, 0.22) * spread;
      px += Math.cos(a) * 3;
      py += Math.sin(a) * 1.15;
      // a crack running towards the viewer stops before the bottom edge of the canvas
      if (py > down) { pts.push([px, down]); break; }
      pts.push([px, py]);
    }
    out.push(pts);
  }
  return out;
}

/** Draw cracks from crackFan at (x, y) on the floor plane; k fades, hot is the color of the seam. */
export function drawCracks(p, cracks, x, y, hot, k = 1) {
  if (k <= 0.02) return;
  for (const pts of cracks)
    for (let i = 0; i < pts.length - 1; i++) p.line(x + pts[i][0], y + pts[i][1], x + pts[i + 1][0], y + pts[i + 1][1], hot, 0.85 * k);
}

/**
 * Energy tearing in toward a held point (loops through `cycle`): streaks born on a ring, curving in and dying
 * at the surface. reach is in px. dir = -1 clockwise.
 */
export function inwardStreaks(p, C, x, y, r, t, D, seed, count = 40, reach = 30, dir = -1) {
  cycle(t, D, count, seed, (g) => g.range(0.22, 0.46), (age, life, R) => {
    const a = R.range(0, TAU), d0 = r + reach * R.range(0.45, 1), spin = R.range(0.8, 2.2);
    const q = age / life, e = 1 - (1 - q) * (1 - q);
    const a1 = a + dir * spin * e, d = d0 * (1 - e) + r * e;
    const px = x + Math.cos(a1) * d, py = y + Math.sin(a1) * d * 0.95;
    const fade = smooth(0, 0.15, q) * (1 - smooth(0.88, 1, q));
    if (py > -1) return;
    p.dot(px, py, q < 0.5 ? C[5] : C[6], 0.85 * fade);
    if (q < 0.45) p.dot(px - Math.cos(a1) * 2.2, py - Math.sin(a1) * 2.1, C[3], 0.45 * fade);
  });
}

/** A dust of motes around a held sphere, drifting and winking, seamless in the phase. */
export function orbitMotes(p, C, x, y, r, ph, seed, count = 9) {
  for (let i = 0; i < count; i++) {
    const a = ph * TAU * (i % 2 ? 1 : -1) + (i / count) * TAU;
    const d = r + 4 + 5 * (0.5 + 0.5 * loopNoise(ph, 1.4, seed + i * 13));
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.85;
    const wink = Math.max(0, loopNoise(ph, 2, seed + i * 7 + 3));
    p.dot(px, py, wink > 0.55 ? WHITE : C[6], 0.3 + wink * 0.55);
  }
}

/** A dim pool of light on the floor under a held technique. */
export function floorLight(p, x, C, k = 1, w = 26, y = -1) {
  p.glow(x, y, w, C[4], 0.14 * k);
  p.glowRing(x, y, 9, 12, C[5], 0.1 * k);
}
