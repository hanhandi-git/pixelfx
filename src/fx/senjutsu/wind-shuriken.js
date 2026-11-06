// Wind release, sage grade: a four-bladed shuriken of compressed wind forms in the hand, is thrown, and opens
// into a grinding sphere of blades that tears the ground before bursting outward.
import { fit, clamp, smooth, ease, band, TAU, WHITE, rng, READY } from "../../core/index.js";
import { WIND, JADE } from "../ninjutsu/_lib.js";

const FORM = 0.66, FLIGHT = 0.3, HIT = FORM + FLIGHT, BURST = 2.2, END = 3.5;
const HX = 18, HY = -27, TARGET = 150;

export const meta = {
  name: "Wind shuriken",
  desc: "A four-bladed shuriken of compressed wind spins up in his hand, is thrown flat across the field, and opens into a grinding sphere that shreds the ground before bursting outward.",
  tags: ["chakra", "senjutsu", "sage", "wind", "shuriken", "technique", "one-shot"],
  size: [340, 192],
  origin: [64, 164],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: WIND, natural: JADE, seed: 27, reach: TARGET },
};

const HOLD = { ...READY, x: 2, crouch: 4, lean: 3, turn: 1, fx: 17, fy: -25, bx: 8, by: -16, ffx: 11, fbx: -8 };
const THROW = { ...READY, x: 6, crouch: 3, lean: 6, turn: 1, fx: 17, fy: -22, bx: -6, by: -24, ffx: 13, fbx: -9, toeB: true };
const WATCH = { ...READY, x: 3, crouch: 4, lean: 2, turn: 1, fx: 12, fy: -22, bx: 8, by: -18 };
export const act = {
  target: { x: TARGET },
  poses: [
    [-0.4, READY],
    [0, HOLD],
    [FORM - 0.05, { ...HOLD, crouch: 5, lean: 4 }],
    [FORM, { ...THROW, crouch: 3, lean: 7 }, "snap"],
    [HIT, { ...THROW, crouch: 4, lean: 3 }, "snap"],
    [HIT + 0.6, WATCH],
    [BURST, { ...WATCH, crouch: 5, lean: -2 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.14, shake: 0.3, amp: 3, push: 0.8, straw: 14, skin: "shock", shiver: 0.9 },
    { t: BURST, stop: 0.06, shake: 0.2, amp: 2, push: 1.6, straw: 10, skin: "shock" },
    { t: END - 0.5, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: FORM, x: 12, n: 5, dir: 1, c: "#bff2ea" }, { t: HIT, x: TARGET, n: 9, dir: -1, c: "#bff2ea" }],
};

const BLADE = [[0.1, -0.08], [0.36, -0.26], [0.72, -0.3], [1.02, -0.04], [0.66, 0.16], [0.34, 0.2], [0.1, 0.09]];

function bladeSet(p, C, x, y, r, spin, a, blades = 4, outline = true) {
  for (let b = 0; b < blades; b++) {
    const ang = spin + (b / blades) * TAU, ca = Math.cos(ang), sa = Math.sin(ang);
    const at = (lx, ly, k = 1) => [x + (lx * ca - ly * sa) * r * k, y + (lx * sa + ly * ca) * r * k];
    if (outline) p.poly(BLADE.map(([lx, ly]) => at(lx, ly, 1.08)), C[1], a);
    p.poly(BLADE.map(([lx, ly]) => at(lx, ly)), C[4], a);
    p.poly([[0.12, -0.06], [0.36, -0.24], [0.72, -0.28], [1.0, -0.04], [0.6, -0.08]], C[5], a);
    p.poly([[0.36, 0.18], [0.66, 0.14], [0.98, -0.02], [0.6, 0.02]], C[2], a * 0.9);
    // the cutting edge: a bright line down the leading side and a white point at the tip
    const e0 = at(0.1, -0.08), e1 = at(0.4, -0.26), e2 = at(0.74, -0.3), e3 = at(1.02, -0.04);
    p.line(e0[0], e0[1], e1[0], e1[1], C[6], a);
    p.line(e1[0], e1[1], e2[0], e2[1], WHITE, a);
    p.line(e2[0], e2[1], e3[0], e3[1], C[6], a);
    p.dot(e3[0], e3[1], WHITE, a);
    // an inner rib towards the hub
    const h0 = at(0.12, 0.02), h1 = at(0.62, -0.06);
    p.line(h0[0], h0[1], h1[0], h1[1], C[6], a * 0.7);
  }
  p.circle(x, y, r * 0.14, C[6], a);
  p.circle(x, y, r * 0.07, WHITE, a);
}

function shuriken(p, C, x, y, r, spin, a, glow = true) {
  if (a <= 0.02) return;
  // wind thrown off the blades
  for (let i = 0; i < 10; i++) {
    const ang = spin * 0.6 + (i / 10) * TAU, rr = r * 1.12;
    const x0 = x + Math.cos(ang) * rr, y0 = y + Math.sin(ang) * rr * 0.9;
    const len = r * 0.5, ang2 = ang + 1.2;
    for (let d = 0; d < len; d += 1.5) p.dot(x0 + Math.cos(ang2) * d, y0 + Math.sin(ang2) * d * 0.8, d < len * 0.4 ? C[6] : C[4], a * 0.5 * (1 - d / len));
  }
  bladeSet(p, C, x, y, r, spin, a);
  if (glow) p.glow(x, y, r * 2.2, C[4], 0.2 * a);
}

// how the shuriken moves: held, thrown, then opened into the grinding sphere
function stateAt(t, target = TARGET) {
  if (t < FORM) return { x: HX, y: HY, r: 7 + 3 * smooth(0, FORM, t), spin: t * 5, a: smooth(0.18, 0.55, t), phase: "hold" };
  if (t < HIT) {
    const q = (t - FORM) / FLIGHT;
    return { x: HX + (target - HX) * ease.inQuad(q), y: HY + 3 * q, r: 10, spin: t * 42, a: 1, phase: "fly" };
  }
  const q = t - HIT;
  return { x: target, y: -24, r: 11 + 24 * ease.outCubic(clamp(q / 0.28)) - 6 * smooth(BURST - 0.1, BURST + 0.4, t), spin: t * 30, a: 1 - smooth(BURST, END - 0.3, t), phase: q < BURST - HIT ? "grind" : "burst" };
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(o.natural ?? JADE, 8), S = o.seed;
  const TG = o.reach ?? TARGET, s = stateAt(t, TG);
  const k = s.a;

  // the floor is already torn where it will land: a warning ring under the target
  if (t > FORM && t < HIT + 0.1) {
    const w = smooth(FORM, HIT, t) * 0.6;
    band(p, TG, 0, 20 + 10 * Math.sin(t * 20), 0.18, 1.5, w, C);
    band(p, TG, 0, 12, 0.18, 1, w * 0.7, G);
  }

  if (s.phase === "hold") {
    // wind spiralling into the hand
    const q = smooth(0, FORM, t);
    for (let i = 0; i < 22; i++) {
      const R = rng(S, i, 3), a0 = R.range(0, TAU) + t * 4, rr = (1 - q) * 26 + s.r + R.range(0, 10);
      const px = s.x + Math.cos(a0) * rr, py = s.y + Math.sin(a0) * rr * 0.85;
      p.dot(px, py, R.chance(0.4) ? C[6] : C[5], q * 0.8);
    }
    shuriken(p, C, s.x, s.y, s.r, s.spin, k);
    p.glow(s.x, s.y, 30, C[4], 0.24 * k);
  } else if (s.phase === "fly") {
    // three smeared copies so the spin reads as a blur, and a wake of cut air
    for (let i = 2; i >= 1; i--) shuriken(p, C, s.x - i * 10, s.y, s.r * (1 - i * 0.05), s.spin - i * 0.5, k * (0.3 - i * 0.07), false);
    shuriken(p, C, s.x, s.y, s.r, s.spin, k);
    for (let i = 0; i < 14; i++) {
      const R = rng(S, i, 9), d = R.range(0, 46), y = s.y + R.range(-14, 14);
      p.dot(s.x - d - 4, y, d < 16 ? C[6] : C[4], 0.55 * (1 - d / 46));
    }
    p.glow(s.x - 26, s.y, 28, C[5], 0.12);
  } else {
    // the grinding sphere: a saw of wind, rings turning both ways and the floor coming apart
    const q = t - HIT;
    if (s.a > 0.05) {
      bladeSet(p, C, s.x, s.y, s.r, s.spin, k * 0.95, 4);
      bladeSet(p, C, s.x, s.y, s.r * 0.62, -s.spin * 0.8, k * 0.7, 4, false);
      // spokes: the blur of a faster turn, cheap enough to keep the disc solid
      for (let i = 0; i < 12; i++) {
        const a0 = s.spin * 0.35 + (i / 12) * TAU;
        for (let d = s.r * 0.45; d < s.r * 1.02; d += 2) p.dot(s.x + Math.cos(a0) * d, s.y + Math.sin(a0) * d * 0.92, d < s.r * 0.8 ? C[4] : C[5], k * 0.22);
      }
      // inner rings
      for (let i = 0; i < 3; i++) {
        const rr = s.r * (0.28 + i * 0.2);
        band(p, s.x, s.y, rr, 0.92, 1.4, k * 0.5, C, undefined, i === 2);
      }
      p.circle(s.x, s.y, s.r * 0.2, C[5], k * 0.8);
      p.circle(s.x, s.y, s.r * 0.1, WHITE, k);
      p.glow(s.x, s.y, s.r * 2.0, C[4], 0.28 * k);
    }
    // dust and cut grass thrown out of the ground, dragged back in by the vortex
    for (let i = 0; i < 34; i++) {
      const R = rng(S, i, 17), born = R.range(0, 0.9), age = q - born;
      if (age < 0 || age > 1.2) continue;
      const a0 = R.range(0, TAU), inR = R.range(16, 52);
      const pull = 1 - Math.min(1, age / 1.2);
      const rr = 8 + inR * pull, px = s.x + Math.cos(a0) * rr, py = -Math.min(30, 2 + age * 26) + Math.sin(a0) * rr * 0.14;
      p.dot(px, py, R.chance(0.3) ? C[5] : C[3], 0.6 * (1 - age / 1.2));
      if (i % 4 === 0) p.dot(px - 1, py - 1, C[6], 0.3 * (1 - age / 1.2));
    }
    // the floor is scoured white under it
    if (q < 2.2) {
      const f = 1 - smooth(0.2, 2.2, q);
      for (let x = Math.floor(TG - 40); x <= TG + 40; x++) {
        const d = Math.abs(x + 0.5 - TG) / 40;
        if (d > 1) continue;
        p.dot(x, 0, d < 0.45 ? C[6] : C[4], 0.4 * f);
        if (d < 0.7 && Math.sin(x * 1.7 + t * 6) > 0.7) p.dot(x, -1, C[6], 0.5 * f);
      }
      p.glow(TG, -1, 46, C[4], 0.22 * f);
    }
    // the burst: two flat crescents of wind thrown left and right, and a ring
    if (q > BURST - HIT - 0.02) {
      const b = clamp((q - (BURST - HIT)) / 0.6), f = 1 - b;
      for (const dir of [-1, 1]) {
        const x0 = TG + dir * (20 + b * 90);
        for (let i = 0; i < 22; i++) {
          const u = i / 22, rr = 26 + b * 60;
          const px = x0 - dir * u * 34, py = -16 + Math.sin(u * Math.PI) * (dir > 0 ? -22 : 14) - b * 6;
          p.dot(px, py, u < 0.3 ? WHITE : u < 0.7 ? C[6] : C[4], f * (0.7 - u * 0.4));
        }
      }
      const rr = 16 + b * 96;
      band(p, TG, 0, rr, 0.18, 2, f * 0.6, C, undefined, b < 0.15);
      p.glow(TG, -20, 70, C[5], 0.3 * f);
      // Four secondary wind petals snap out behind the main burst.
      for (let i = 0; i < 4; i++) {
        const a = i * TAU / 4 + 0.18;
        const r0 = 12 + b * 20, r1 = 42 + b * 58;
        const x0 = TG + Math.cos(a) * r0, y0 = -22 + Math.sin(a) * r0 * 0.55;
        const x1 = TG + Math.cos(a) * r1, y1 = -22 + Math.sin(a) * r1 * 0.55;
        p.line(x0, y0, x1, y1, i % 2 ? C[6] : WHITE, f * 0.75);
        p.line(x0, y0 + 1, x1, y1 + 1, C[4], f * 0.42);
      }
    }
  }

  // a few jade sage motes riding the wind all through
  for (let i = 0; i < 9; i++) {
    const R = rng(S, i, 41), a = R.range(0, TAU) + t * 1.4, rr = 16 + R.range(0, 40) * (1 - 0.2 * Math.sin(t * 2 + i));
    if (t > BURST + 0.4) break;
    p.dot(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr * 0.8, i % 2 ? G[6] : C[6], 0.5);
  }
  if (t < FORM + 0.1) p.glow(s.x, s.y, 26, C[5], 0.2 * smooth(0, 0.4, t));
  p.glow(0, -1, 30, C[4], 0.1 * (1 - smooth(END - 1, END, t)));
}
