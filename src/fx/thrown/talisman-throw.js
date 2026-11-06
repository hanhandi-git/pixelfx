// A paper talisman dug out of a pocket. The caster opens his fingers and lets it go; it
// floats off at walking pace, hangs, and then the cinnabar seal in its own ink catches and
// snaps it flat onto the target.
import { READY, TAU, WHITE, clamp, ease, fit, mix, rng, sparkle, smooth } from "../../core/index.js";

const RELEASE = 0, FLY = 0.85, HIT = RELEASE + FLY, TX = 150, TY = -27, HAND = [17, -19];
const HW = 3.3, HH = 5.5;

export const meta = {
  name: "Talisman throw",
  desc: "He digs a paper talisman out of his pocket and lets it float; it drifts, the cinnabar seal catches, and it snaps flat onto the target and burns into a column of warding light.",
  tags: ["move", "talisman", "seal", "thrown", "projectile", "arcane", "combat", "one-shot"],
  size: [280, 120], origin: [44, 96], duration: 1.8, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#211526", "#542348", "#873454", "#bd4f5d", "#e77b6b", "#f7c28b", "#fff0c4"], seed: 61 },
};

// He dips a hand into the pocket at his hip, draws the talisman out and presents it, then lets
// go: no throw, no step, no follow-through. The paper does the travelling.
const HELD = { ...READY, x: -1, crouch: 3, lean: -2, fx: 8, fy: -19, bx: 8, by: -20 };
const POCKET = { ...HELD, crouch: 6, lean: -5, fx: 5, fy: -12 };
const PULL = { ...POCKET, weapon: "talisman", crouch: 5, lean: -3, fx: 6, fy: -14, sa: 1.6 };
const PRESENT = { ...READY, weapon: "talisman", x: 0, crouch: 2, lean: 1, fx: 10, fy: -19, bx: 7, by: -19, sa: -0.08 };
const OPEN = { ...READY, x: 0, crouch: 2, lean: 0, fx: 11, fy: -19, bx: 7, by: -19 };
const SETTLE = { ...READY, x: 0, crouch: 3, fx: 5, fy: -20, bx: 8, by: -20 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.46, HELD], [-0.34, POCKET, "out"], [-0.26, POCKET], [-0.16, PULL, "out"], [-0.05, PRESENT, "out"],
    [RELEASE, OPEN], [0.30, SETTLE], [HIT, { ...SETTLE, lean: -3 }], [1.5, SETTLE], [meta.duration, SETTLE],
  ],
  hits: [{ t: HIT, stop: 0.1, shake: 0.14, amp: 2, push: 1.8, straw: 9, y: TY, skin: "holy" }],
};

// It leaves the hand from rest, drifts out under its own weight, hangs for a moment, and only
// then does the seal pull it home. The arc lifts it 8 px so it reads as floating, not thrown.
function flight(u) {
  const drift = 0.56 * ease.inOutSine(clamp(u / 0.6));
  const pull = 0.44 * Math.pow(clamp((u - 0.52) / 0.48), 2);
  const s = Math.min(1, drift + pull), arc = Math.sin(Math.PI * s);
  return [
    HAND[0] + (TX - HAND[0]) * s + Math.sin(u * 8.6) * arc * 2.4,
    HAND[1] + (TY - HAND[1]) * s - 8 * arc + Math.sin(u * 13.5) * arc * 1.4,
  ];
}

// A flutter around the paper's long axis, read as foreshortened width, plus a roll that settles flat.
const yawAt = (u) => 0.45 + 0.5 * Math.sin(u * TAU * 1.15 + 0.9) + 0.14 * Math.sin(u * TAU * 2.8 + 2.0);
const rollAt = (u) => -0.3 + 0.3 * Math.sin(u * TAU * 1.2 + 0.4) * (1 - 0.3 * u);

/**
 * A talisman: a narrow slip of parchment (warm rim, lit face, ink on the front only) that can
 * turn edge-on, bow in the air, and burn up from its lower edge. `char` 0..1 eats the paper,
 * `flare` 0..1 lights the ink white.
 */
function paper(p, C, x, y, ang, yaw, { a = 1, curl = 0.6, phase = 0, char = 0, flare = 0, scale = 1 } = {}) {
  const cw = Math.cos(yaw), af = Math.abs(cw), front = cw >= 0;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const at = (u, v) => [x + ca * u * cw - sa * v, y + sa * u * cw + ca * v];
  const full = HH * scale, low = full - 2 * full * 0.85 * char, w = HW * scale;
  if (low <= -full + 0.6) return;
  const body = front ? C[6] : C[5], rim = front ? C[4] : C[3], lit = front ? WHITE : C[6];

  // the strip bows in the air: its middle drifts aside and narrows a touch
  const bow = (v) => Math.sin((v / full) * Math.PI * 0.5 + phase * 0.2) * curl * (1 - Math.abs(v) / full * 0.35);
  const sides = (hwd) => {
    const out = [];
    for (let i = 0; i <= 3; i++) {
      const v = -full + (low + full) * (i / 3), k = 1 - Math.pow(Math.abs(v) / full, 2) * 0.1;
      out.push(at(-hwd * k + bow(v), v));
    }
    for (let i = 3; i >= 0; i--) {
      const v = -full + (low + full) * (i / 3), k = 1 - Math.pow(Math.abs(v) / full, 2) * 0.1;
      out.push(at(hwd * k + bow(v), v));
    }
    return out;
  };

  if (af < 0.18) {
    // edge-on: a lit sliver of paper, with the ink band showing on the edge
    const A = at(0, -full), B = at(0, low);
    p.line(A[0], A[1], B[0], B[1], rim, a);
    p.line(A[0], A[1], B[0], B[1], lit, a);
    if (front) {
      const m0 = at(0, low - Math.min(1.7, (low + full) * 0.24)), m1 = at(0, low - 1);
      p.line(m0[0], m0[1], m1[0], m1[1], mix(C[2], C[6], flare), a);
    }
    return;
  }

  p.poly(sides(w), rim, a);
  p.poly(sides(Math.max(0.3, w - 1)), body, a);
  if (front) {
    const e0 = at(-w + 0.4 + bow(-full + 0.8), -full + 0.8), e1 = at(-w + 0.4 + bow(low - 0.8), low - 0.8);
    p.line(e0[0], e0[1], e1[0], e1[1], lit, a * 0.3);
  } else return;

  // cinnabar band at the lower end and a few brush strokes above it
  const inkC = mix(C[2], C[6], flare), inkB = mix(C[3], C[6], flare * 0.85);
  const bandTop = low - Math.min(1.7, (low + full) * 0.24), bandBot = low - 0.7;
  if (bandBot > bandTop + 0.4) p.poly([at(-w * 0.72, bandTop), at(w * 0.72, bandTop), at(w * 0.72, bandBot), at(-w * 0.72, bandBot)], inkB, a * 0.95);
  const seg = (u0, v0, u1, v1, c, k) => { const A = at(u0, v0), B = at(u1, v1); p.line(A[0], A[1], B[0], B[1], c, a * k); };
  // two bars on a spine: a plain brush glyph, no clutter at this size
  const g0 = -full + 1.3;
  seg(0, g0 + 0.3, 0, bandTop - 1.2, inkC, 1);
  seg(-w * 0.5, g0 + 1.6, w * 0.5, g0 + 1.6, inkB, 0.95);
  seg(-w * 0.36, g0 + 3.6, w * 0.36, g0 + 3.6, inkC, 0.95);
  if (flare > 0.02) { const c = at(0, (bandTop + bandBot) * 0.5); p.glow(c[0], c[1], 5, C[4], 0.5 * flare); }
}

// Faint air the paper drags with it: two short speed dashes on the fast legs, and three paper
// motes left hanging behind on their own little arcs.
function air(p, C, S, u) {
  const a = flight(u), b = flight(Math.max(0, u - 0.055));
  const dx = a[0] - b[0], dy = a[1] - b[1], d = Math.hypot(dx, dy);
  if (d > 2.2) {
    const nx = -dy / d, ny = dx / d, k = Math.min(1, d / 15);
    for (let i = 0; i < 2; i++) {
      const back = 4 + i * 4.6, off = (i ? 1 : -1) * (2.4 + i * 1.1), len = 2.4 + i * 0.8;
      p.line(a[0] - dx / d * back + nx * off, a[1] - dy / d * back + ny * off,
        a[0] - dx / d * (back + len) + nx * off, a[1] - dy / d * (back + len) + ny * off, C[5], 0.3 * k * (1 - i * 0.35));
    }
  }
  for (let i = 0; i < 3; i++) {
    const r = rng(S, 71, i), birth = 0.06 + i * 0.13, life = r.range(0.4, 0.7);
    if (u * FLY < birth || u * FLY > birth + life) continue;
    const o = flight(birth / FLY), age = u * FLY - birth, q = 1 - age / life;
    const x = o[0] - r.range(3, 7) + r.range(-4, 4) * age, y = o[1] + r.range(-2, 3) + r.range(-8, -2) * age + 7 * age * age;
    p.dot(x, y, i & 1 ? C[5] : C[3], q * 0.55);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 7), S = o.seed;

  if (t < 0.12) {
    const k = 1 - t / 0.12;
    sparkle(p, HAND[0] + 1, HAND[1] - 1, 3.5 * k, C[6], C[4], 0.28 * k);
  }

  if (t >= RELEASE && t < HIT) {
    const u = clamp((t - RELEASE) / FLY), [x, y] = flight(u);
    // a slow flutter around its long axis, then it settles flat for the seal
    const settle = smooth(0.9, 1, u);
    const yaw = yawAt(u) * (1 - settle), ang = rollAt(u) * (1 - settle);
    air(p, C, S, u);
    if (u > 0.55) {
      // the seal answers before the paper arrives: a warm point and four ticks write in
      const k = smooth(0.55, 0.9, u);
      p.glow(TX, TY, 3 + 5 * k, C[4], 0.2 * k);
      for (let i = 0; i < 4; i++) {
        const q = clamp(k * 1.7 - i * 0.2), a0 = -Math.PI * 0.5 + i * Math.PI * 0.5, rr = 3.4 + 2.6 * k;
        p.line(TX + Math.cos(a0) * rr, TY + Math.sin(a0) * rr * 0.9, TX + Math.cos(a0) * (rr + 1.8), TY + Math.sin(a0) * (rr + 1.8) * 0.9, C[6], 0.85 * q);
      }
    }
    const inkGlow = smooth(0.42, 0.85, u);
    if (inkGlow > 0.01) p.glow(x, y, 5, C[4], 0.16 * inkGlow);
    paper(p, C, x, y, ang, yaw, { curl: 0.7, phase: t * 11 });
    if (u < 0.14 || u > 0.82) {
      // a single catch of light on the leading corner while it is moving
      const q = u < 0.14 ? 1 - u / 0.14 : smooth(0.82, 0.94, u);
      const ca = Math.cos(ang), sa = Math.sin(ang);
      p.px(x + ca * -HW * Math.cos(yaw) - sa * -HH, y + sa * -HW * Math.cos(yaw) + ca * -HH, C[6]);
      if (q > 0.5) p.glow(x - ca * HW - sa * HH, y + sa * HW - ca * HH, 4, C[5], 0.18 * q);
    }
  }

  const age = t - HIT;
  if (age >= 0 && age < 0.89) {
    const fade = 1 - age / 0.89, slap = ease.outCubic(clamp(age / 0.045));
    const burn = clamp((age - 0.15) / 0.36), flare = Math.max(0, 1 - age / 0.16);
    // the paper is pressed flat, then its lower edge curls and burns up
    paper(p, C, TX, TY, 0.02 * (1 - slap), 0, { a: 1 - smooth(0.52, 0.66, age), curl: 0.4 + burn * 1.2, phase: age * 9, char: burn, flare, scale: 1 + 0.1 * (1 - slap) });
    const flash = Math.max(0, 1 - age / 0.12);
    if (flash > 0) { sparkle(p, TX, TY, 5 * flash, C[6], C[4], 0.18 * flash); p.glow(TX, TY, 8, C[4], 0.2 * flash); }
    const grow = ease.outCubic(clamp(age / 0.2));
    // a fast burst ring, then a cinnabar seal frame that hugs the paper
    if (age < 0.4) {
      p.glowRing(TX, TY, 4 + 9 * grow, 3, C[4], 0.3 * (1 - age / 0.4));
      if (age < 0.22) p.ring(TX, TY, 4 + 9 * grow, 2, mix(C[6], C[4], smooth(0, 0.22, age)), 1);
    }
    // the warding column: a thin solid core that shoots up and pulls back down
    const rise = ease.outCubic(clamp(age / 0.14)), retract = 1 - smooth(0.26, 0.46, age);
    const h = 15 * rise * retract, top = TY - 7 - h;
    if (h > 1.2) {
      // a tapering shaft of warding light, warm at its edges and white at the core
      for (let yy = TY - 7; yy >= top; yy--) {
        const k = (TY - 7 - yy) / h, wd = 1.8 - k * 0.8;
        p.line(TX - wd, yy, TX + wd, yy, C[5], 1);
        p.line(TX - wd + 1, yy, TX + wd - 1, yy, C[6], 1);
        p.px(TX, yy, WHITE);
      }
      p.px(TX, top, WHITE);
      p.glowLine(TX, TY - 7, TX, top, 6, C[4], 0.3);
      p.glow(TX, top, 4, C[6], 0.2);
      p.ellipse(TX, TY - 6, 2.3 * rise, 1, C[6], 0.85);
    }
    const seal = 1 - smooth(0.34, 0.64, age);
    if (seal > 0.02) {
      const rx = 4.7 + 0.9 * grow, ry = 6.5 + 0.9 * grow;
      const frame = mix(C[4], C[0], 1 - seal), hotC = mix(C[6], frame, smooth(0.15, 0.45, age));
      // a pixel-smooth ellipse: hand-rolled distance so the 1 px line never breaks on the diagonals
      p.shade(TX - rx - 1, TY - ry - 1, TX + rx + 1, TY + ry + 1, (x, y, out) => {
        const dx = (x + 0.5 - TX) / (rx + 0.4), dy = (y + 0.5 - TY) / (ry + 0.4), q = Math.sqrt(dx * dx + dy * dy);
        if (q > 1 || (q - 1) * Math.min(rx, ry) < -1) return;
        out.c = frame;
      });
      for (let i = 0; i < 4; i++) {
        const a0 = (i / 4) * TAU + Math.PI * 0.25;
        p.line(TX + Math.cos(a0) * (rx - 1.2), TY + Math.sin(a0) * (ry - 1.2), TX + Math.cos(a0) * (rx + 1.2), TY + Math.sin(a0) * (ry + 1.2), hotC, 1);
      }
    }
    for (let i = 0; i < 10; i++) {
      const r = rng(S, 91, i), life = r.range(0.3, 0.72), birth = 0.12 + r.range(0, 0.22);
      if (age < birth || age > birth + life) continue;
      const k = (age - birth) / life, x0 = TX + r.range(-2.6, 2.6), vy = r.range(11, 26);
      const x = x0 + Math.sin(k * 7 + i) * 2 * k + r.range(-2, 2) * k, y = TY + 2 - vy * (age - birth) - 7 * k * k;
      p.dot(x, y, i & 1 ? C[4] : C[5], (1 - k) * 0.75);
      if (i < 3 && k < 0.35) p.glow(x, y, 3, C[4], 0.1 * (1 - k));
    }
    if (burn > 0.05 && burn < 1) {
      const low = HH - 1.7 * HH * burn;
      for (let i = 0; i < 4; i++) {
        const r = rng(S, 33, i), k = clamp((age - 0.15 - i * 0.03) / 0.3);
        if (k <= 0 || k >= 1) continue;
        p.dot(TX + r.range(-2.2, 2.2), TY + low + 1 - r.range(2, 8) * k, C[6], (1 - k) * 0.8);
      }
    }
    p.glow(TX, TY, 8, C[4], 0.1 * fade);
  }
}
