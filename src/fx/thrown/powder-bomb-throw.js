// A small black-powder bomb follows a readable lob: fuse flare, one floor bounce,
// then a compact blast with a hot ring, smoke puffs and falling grit.
import { READY, TAU, clamp, ease, fit, hex, rng, sparkle } from "../../core/index.js";

const RELEASE = 0, BOUNCE = 0.66, BLOW = 0.95, TX = 148, TY = -5, HAND = [27, -28];
// the same shell as the model in hand, so the bomb does not change colour once it leaves the fingers
const SHELL = hex("#25283d"), SHELL_MID = hex("#3c3951"), RIM = hex("#53627e"), BAND = hex("#f0cb72"), BAND_D = hex("#a3683d");

export const meta = {
  name: "Powder bomb throw",
  desc: "He sparks a black-powder bomb and lobs it high; it bounces once, the fuse spits white sparks, then the shell bursts into a hot ring, smoke and tumbling grit.",
  tags: ["move", "bomb", "powder", "thrown", "projectile", "explosion", "combat", "one-shot"],
  size: [300, 144], origin: [44, 112], duration: 1.9, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: ["#24151a", "#542529", "#8c3830", "#c95b35", "#ee8a43", "#ffc061", "#ffe3a0", "#ffffff"], seed: 53 },
};

const HELD = { ...READY, weapon: "powder-bomb", x: -2, fx: 5, fy: -21, sa: -1.05 };
const LIGHT = { ...HELD, x: -6, crouch: 5, lean: -4, fx: -5, fy: -31, bx: 15, by: -26, sa: -2.4, ffx: 5, fbx: -9 };
const THROW = { ...READY, x: 4, crouch: 4, lean: 7, fx: 21, fy: -27, bx: -7, by: -21, sa: 0.1, ffx: 9, fbx: -10, toeB: true };
const RECOVER = { ...READY, x: 2, crouch: 3, fx: 11, fy: -22, bx: 7, by: -21 };

export const act = {
  target: { x: TX },
  poses: [[-0.45, HELD], [-0.18, LIGHT], [-0.04, LIGHT], [RELEASE, THROW, "snap"], [0.12, { ...THROW, lean: 5 }], [BLOW, RECOVER], [1.38, RECOVER], [meta.duration, RECOVER]],
  hits: [{ t: BLOW, stop: 0.12, shake: 0.19, amp: 3, push: 2.8, straw: 16, y: TY }],
  dust: [{ t: BLOW, x: TX, n: 12, dir: 1 }],
};

function bomb(p, C, x, y, a, alpha = 1) {
  p.circle(x, y, 7, SHELL, alpha);
  p.circle(x, y + 1.6, 5.7, SHELL_MID, alpha);
  p.arc(x, y, 6, 1.5, Math.PI * 0.18, Math.PI * 0.82, RIM, alpha);
  p.line(x - 6, y + 0.4, x + 6, y + 0.4, BAND_D, alpha);
  p.line(x - 6, y + 1.4, x + 6, y + 1.4, BAND, alpha);
  const fx = x + Math.cos(a) * 6.5, fy = y + Math.sin(a) * 6.5;
  p.line(x + Math.cos(a) * 4, y + Math.sin(a) * 4, fx, fy, BAND_D, alpha);
  p.dot(fx, fy, C[6], alpha); p.px(fx, fy, C[7]);
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), S = o.seed;
  if (t < 0.13) {
    const k = 1 - t / 0.13;
    sparkle(p, HAND[0] + 2, HAND[1] - 1, 5 * k, C[7], C[5], 0.5 * k);
  }
  if (t >= RELEASE && t < BLOW) {
    let x, y, a;
    if (t < BOUNCE) {
      const u = t / BOUNCE; x = HAND[0] + (TX - HAND[0]) * u; y = HAND[1] + (TY - HAND[1]) * u - Math.sin(Math.PI * u) * 58; a = -t * 8;
    } else {
      const u = (t - BOUNCE) / (BLOW - BOUNCE); x = TX - 9 + 9 * ease.outCubic(u); y = TY - Math.sin(Math.PI * u) * 9; a = -5.2 + u * 1.4;
      if (u < 0.18) { const q = 1 - u / 0.18; p.ring(x, TY + 1, 3 + 9 * (1 - q), 1, C[4], q * 0.45); }
    }
    const u = clamp(t / BOUNCE), u0 = Math.max(0, u - 0.14);
    if (t < BOUNCE && u > 0.06) p.beam(HAND[0] + (TX - HAND[0]) * u0, HAND[1] + (TY - HAND[1]) * u0 - Math.sin(Math.PI * u0) * 58, x, y, 0.8, C[3], 0.18);
    bomb(p, C, x, y, a); p.glow(x, y, 8, C[4], 0.16);
    const fuse = 0.18 + 0.7 * t / BLOW;
    if (rng(S, 90, Math.floor(t * 30)).chance(0.45)) {
      const a2 = -1.8 + rng(S, 91, Math.floor(t * 30)).range(-0.7, 0.7), d = 8 + rng(S, 92, Math.floor(t * 30)).range(0, 4);
      p.line(x + Math.cos(a) * 5, y + Math.sin(a) * 5, x + Math.cos(a) * d, y + Math.sin(a) * d, C[6], fuse * 0.7);
      p.glow(x + Math.cos(a) * d, y + Math.sin(a) * d, 4, C[5], 0.25 * fuse);
    }
  }
  const age = t - BLOW;
  if (age >= 0 && age < 0.85) {
    const k = clamp(age / 0.35), fade = 1 - age / 0.85;
    if (age < 0.1) { p.circle(TX, TY, 11 * (1 - age / 0.1), C[7], 0.85); sparkle(p, TX, TY, 20 * (1 - age / 0.1), C[7], C[5], 0.65); }
    p.ring(TX, TY, 7 + 27 * ease.outCubic(k), Math.max(1, 3.2 * (1 - k)), C[5], fade * 0.85);
    p.glow(TX, TY, 30 + 30 * k, C[4], 0.2 * fade);
    for (let i = 0; i < 24; i++) {
      const r = rng(S, 130, i), life = r.range(0.22, 0.8);
      if (age >= life) continue;
      const a = r.range(-Math.PI + 0.05, -0.05), d = r.range(8, 70) * ease.outCubic(clamp(age / 0.42)), x = TX + Math.cos(a) * d, y = TY + Math.sin(a) * d + age * age * 90, q = 1 - age / life;
      const yy = Math.min(-1, y);
      if (i % 3 === 0) p.rect(x, yy, 2, 2, C[q > 0.5 ? 4 : 2], q); else p.line(x, yy, x - Math.cos(a) * 3, yy - Math.sin(a) * 3, C[q > 0.5 ? 6 : 3], q);
    }
    for (let i = 0; i < 8; i++) {
      const r = rng(S, 150, i), x = TX + r.range(-18, 18) * k, y = TY - 4 - r.range(0, 16) * k - age * 18;
      p.circle(x, y, 2 + r.range(0, 3) * k, C[1 + (i % 3)], fade * 0.35);
    }
  }
}
