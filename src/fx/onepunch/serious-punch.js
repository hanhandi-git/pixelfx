// One Punch theme: an original pixel-art reading of a dead-simple, overwhelming punch.
// The fist is only the trigger; the spectacle is the compressed air, red pressure wake and cratered floor.
import { band, clamp, ease, fit, flare, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";

const RELEASE = 0.62, HIT = 0.94, END = 2.8, FX = 18, FY = -27, TARGET = 256;
const IMPACT = ["#110307", "#3b0a11", "#79121e", "#bd2630", "#ed5840", "#ff9b66", "#ffe0ba", "#ffffff"];

export const meta = {
  name: "Serious punch",
  desc: "A quiet wind-up compresses the air around one fist, then a red pressure wake crosses the field and caves into a white-hot crater, dust and torn speed lines.",
  tags: ["onepunch", "serious", "punch", "impact", "pressure", "hero", "technique", "one-shot"],
  size: [420, 220], origin: [76, 188], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: IMPACT, seed: 71, reach: TARGET },
};

const READY_P = { ...READY, x: -2, crouch: 4, lean: -2, turn: 1, fx: 7, fy: -23, bx: -5, by: -22, armsFront: true };
const COIL = { ...READY, x: -3, crouch: 8, lean: -5, turn: 1, fx: 4, fy: -25, bx: -2, by: -24, armsFront: true };
const DRIVE = { ...READY, x: 5, crouch: 5, lean: 10, turn: 1, fx: 17, fy: -28, bx: -7, by: -19, ffx: 14, fbx: -5, toeB: true };
export const act = {
  target: { x: TARGET },
  poses: [[-0.4, READY], [0.1, READY_P], [0.48, COIL], [RELEASE, { ...COIL, crouch: 9, lean: -7 }], [RELEASE + 0.01, DRIVE, "snap"], [HIT, { ...DRIVE, x: 8, crouch: 4, lean: 12 }, "snap"], [1.8, { ...DRIVE, crouch: 6, lean: 5 }], [2.35, { ...READY, x: 2 }], [END, READY]],
  hits: [{ t: HIT, stop: 0.18, shake: 0.5, amp: 4.5, push: 4.2, straw: 36, skin: "char" }],
  dust: [{ t: RELEASE, x: 12, n: 10, dir: 1 }, { t: HIT, x: TARGET, n: 14, dir: -1 }],
};

function pressure(p, C, t, a) {
  const q = clamp((t - RELEASE) / (HIT - RELEASE));
  if (q <= 0 || a <= 0) return;
  const head = FX + (TARGET - FX) * ease.outQuad(q), width = 4 + 15 * q;
  for (let x = FX; x <= head; x += 1.5) {
    const u = (x - FX) / Math.max(1, head - FX), w = width * (0.35 + 0.65 * u);
    p.line(x, FY - w, x, FY + w, u > 0.82 ? C[6] : C[4], a * (0.38 + 0.48 * u));
    if (Math.round(x) % 9 < 2) p.line(x, FY - w - 3, x + 8, FY - w - 8, C[5], a * 0.5);
  }
  for (let i = 0; i < 6; i++) {
    const y = FY + (i - 2.5) * width * 0.55;
    p.line(FX + 8, y, head - i * 5, y + Math.sin(t * 15 + i) * 2, i % 2 ? C[5] : C[6], a * 0.5);
  }
  p.glow(head, FY, 24 + width * 2, C[4], 0.32 * a);
}

function impact(p, C, t, seed) {
  const q = t - HIT;
  if (q < 0 || q > 1.4) return;
  const k = 1 - smooth(0, 1.3, q), flash = Math.max(0, 1 - q / 0.16);
  const rr = 8 + 42 * ease.outQuad(clamp(q / 0.24));
  p.circle(TARGET, FY, rr * 0.52, WHITE, flash);
  p.circle(TARGET, FY, rr, C[6], 0.8 * flash);
  p.glow(TARGET, FY, 60 + rr, C[5], 0.55 * flash);
  if (q < 0.42) {
    for (let i = 0; i < 18; i++) {
      const a0 = i * TAU / 18 + 0.1, len = 18 + (i % 3) * 15 + q * 80;
      p.line(TARGET + Math.cos(a0) * 5, FY + Math.sin(a0) * 4, TARGET + Math.cos(a0) * len, FY + Math.sin(a0) * len * 0.72, i % 3 ? C[6] : WHITE, (1 - q / 0.42) * 0.72);
    }
  }
  for (let i = 0; i < 3; i++) {
    const d = q - i * 0.07;
    if (d < 0) continue;
    band(p, TARGET, 0, Math.min(54, 12 + d * (44 + i * 15)), 0.2, 2.2 - i * 0.35, 0.5 * k, C, undefined, q < 0.14);
  }
  for (let i = 0; i < 28; i++) {
    const R = rng(seed, i, 4), age = q - R.range(0, 0.13);
    if (age < 0) continue;
    const a0 = R.range(-2.95, 0.05), sp = R.range(35, 180);
    const x = clamp(TARGET + Math.cos(a0) * sp * age, -70, 338), y = -2 + Math.sin(a0) * sp * age + age * age * 170;
    if (y < -1) p.dot(x, y, i % 4 ? C[4] : C[6], 0.65 * k);
  }
  p.ellipse(TARGET, -1, 18 + q * 26, 2.8, C[3], 0.34 * k);
  p.glow(TARGET, -1, 30, C[4], 0.25 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), fade = 1 - smooth(1.9, END, t);
  p.ellipse(4, -1, 22, 2.2, C[1], 0.28 * fade);
  if (t > HIT) p.ellipse(TARGET, -1, 28 + Math.min(24, (t - HIT) * 16), 3, C[1], 0.3 * fade);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), seed = o.seed ?? 71;
  if (t < RELEASE) {
    const q = smooth(0.08, RELEASE, t), rr = 6 + q * 9;
    p.glow(FX, FY, 18 + rr * 2, C[4], 0.16 * q);
    for (let i = 0; i < 14; i++) {
      const a = i * TAU / 14 + t * 2.8, d = 18 + (1 - q) * 24;
      p.dot(FX + Math.cos(a) * d, FY + Math.sin(a) * d * 0.65, i % 3 ? C[5] : C[6], 0.34 * q);
    }
    p.circle(FX, FY, rr, C[5], 0.65 * q);
    p.circle(FX, FY, rr * 0.48, WHITE, 0.7 * q);
  } else {
    pressure(p, C, t, 1 - smooth(HIT, HIT + 0.35, t));
    impact(p, C, t, seed);
  }
  if (t >= RELEASE && t < HIT + 0.12) flare(p, FX, FY, 8 + 9 * smooth(RELEASE, HIT, t), 0.4, C);
}
