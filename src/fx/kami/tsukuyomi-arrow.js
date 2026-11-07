// 月读命 · 月弓: the moon bow. A crescent of moonlight is strung in front of him, the arrow is drawn to the
// cheek, and the loose sends a silver shaft across the field trailing arcs of moon dust. The hit is a
// crescent cut: one white arc through the target, a ring of cold light, and petals falling long after.
import { READY, WHITE, clamp, ease, fit, loopNoise, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { glint, pool } from "../pickups/_lib.js";
import { MOON, floorSeal } from "./_lib.js";

const END = 3.0, LOOSE = 0.56, FLY = 0.22, HIT = LOOSE + FLY;
const TX = 198, TY = -30;
const SPEED = (TX - 34) / FLY;

export const meta = {
  name: "Tsukuyomi, moon bow",
  desc: "A crescent of moonlight is strung in front of the moon god; the arrow is drawn and loosed as a silver shaft trailing dust, and the hit is one white crescent cut through the target.",
  tags: ["kami", "japan", "shinto", "moon", "bow", "arrow", "tsukuyomi", "月读命", "月読命", "月弓", "technique", "one-shot"],
  size: [320, 190],
  origin: [88, 170],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: MOON, seed: 14 },
};

const REST = { ...READY, weapon: "bow", x: -2, sa: -0.4, fx: 12, fy: -20, bx: 6, by: -17, ffx: 6, fbx: -7 };
const AIM = { ...REST, x: 0, crouch: 3, lean: 1, fx: 17, fy: -28, bx: 9, by: -27, sa: 0.05, nocked: true, ffx: 8, fbx: -8 };
const DRAWN = { ...AIM, crouch: 4, lean: -2, bx: -4, by: -29, pull: true };
const LOOSED = { ...AIM, crouch: 3, lean: 2, fx: 18, bx: -8, by: -22, nocked: false, pull: false };

export const act = {
  target: { x: TX },
  poses: [
    [-0.46, REST],
    [-0.16, AIM],
    [0.16, DRAWN],
    [LOOSE, { ...DRAWN, crouch: 4 }, "snap"],
    [LOOSE + 0.002, LOOSED, "snap"],
    [HIT, { ...LOOSED, lean: 3, fx: 19 }, "snap"],
    [1.4, { ...LOOSED, bx: -5, by: -25 }],
    [2.6, REST],
    [2.95, REST],
  ],
  hits: [{ t: HIT, stop: 0.1, shake: 0.22, amp: 2, push: 2.2, straw: 14, skin: "ice" }],
  dust: [{ t: HIT, x: TX, n: 6, dir: -1, c: "#e2f2ff" }],
};

/** The bow's own crescent: two arcs of cold light strung with a silver line, pulsing with the draw. */
function moonBow(p, C, x, y, pull, k, ph) {
  if (k <= 0.02) return;
  p.arc(x, y, 17, 2.6, -1.35, 1.35, C[4], 0.55 * k);
  p.arc(x, y, 15.5, 1.2, -1.3, 1.3, C[5], 0.7 * k);
  p.arc(x, y, 14.4, 0.6, -1.25, 1.25, WHITE, 0.5 * k);
  // the string: a straight line from tip to tip, bent back to the drawing hand
  const ty = 17 * Math.sin(1.3);
  const gx = x - 14 - pull * 9, gy = y;
  p.line(x + 17 * Math.cos(1.3), y - ty, gx, gy, C[5], 0.7 * k);
  p.line(x + 17 * Math.cos(1.3), y + ty, gx, gy, C[5], 0.7 * k);
  p.dot(gx, gy, WHITE, 0.8 * k);
  // motes gather along the limbs
  for (let i = 0; i < 8; i++) {
    const B = loopNoise(ph, 1.4, i * 13);
    const a = -1.3 + (i / 7) * 2.6, d = 17 + 4 * B;
    p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d, i % 3 ? C[5] : C[6], 0.4 + 0.3 * B);
  }
  p.glow(x, y, 26, C[4], 0.1 * k);
}
/** A crescent of light: a thick outer arc with a thin hot edge, turning by rot. */
function crescent(p, C, x, y, r, rot, k, o = {}) {
  if (k <= 0.02) return;
  const a0 = rot - 1.15, a1 = rot + 1.15, w = o.w ?? 2.4;
  p.arc(x, y, r, w, a0, a1, C[4], 0.55 * k);
  p.arc(x, y, r + w * 0.5, w * 0.5, a0 + 0.08, a1 - 0.08, C[5], 0.7 * k);
  p.arc(x, y, r + w * 0.7, 0.5, a0 + 0.14, a1 - 0.14, WHITE, 0.8 * k);
  if (o.glow !== false) p.glow(x, y, r * 1.6, C[4], 0.08 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), seed = o.seed;
  // a cold moon haze and the seal under the target
  const fade = 1 - smooth(2.55, 2.95, t);
  p.glow(-20, -120, 70, C[3], 0.05 * fade);
  p.glow(TX, -70, 60, C[3], 0.05 * fade);
  const sealK = smooth(0.16, 0.62, t) * (1 - smooth(2.4, 2.9, t));
  if (sealK > 0.02) floorSeal(p, C, TX, -1, 22, -t * 0.9, 0.5 * sealK, { sq: 0.22, n: 22, core: 0.3 + 0.3 * smooth(LOOSE, HIT, t), pool: true });
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, ph = t / END;
  const R = rng(S, Math.floor(t * 30), 7);
  const fade = 1 - smooth(2.6, 2.98, t);
  const drawK = smooth(0.05, 0.45, t) * (1 - smooth(LOOSE, LOOSE + 0.12, t));
  const pull = smooth(0.1, 0.5, t) * (1 - smooth(LOOSE, LOOSE + 0.05, t));
  const hitAge = t - HIT;

  // the moon bow, strung and drawn
  if (t < LOOSE + 0.08) moonBow(p, C, 20, -28, pull, 0.9 * fade, ph);
  // the arrow on the string: a silver pin with a white head
  if (t > 0.18 && t < LOOSE + 0.01) {
    const x0 = 20 - 14 - pull * 9 + 2;
    p.line(x0, -28, x0 + 28, -28, C[5], 0.8 * drawK);
    p.dot(x0 + 30, -28, WHITE, 0.9 * drawK);
    p.glow(x0 + 30, -28, 6, C[5], 0.16 * drawK);
  }

  // the loose: a silver shaft with a crescent wake
  if (t >= LOOSE && hitAge < 0.02) {
    const u = clamp((t - LOOSE) / FLY);
    const x = 34 + SPEED * (t - LOOSE);
    const trail = 18 + 10 * u;
    p.line(x - trail, -28, x, -28, C[5], 0.5);
    p.line(x - trail + 4, -29, x, -29, C[6], 0.4);
    p.line(x - trail, -28, x + 3, -28, WHITE, 0.9);
    p.dot(x + 4, -28, WHITE, 1);
    p.glow(x, -28, 12, C[5], 0.24);
    p.glow(x - trail * 0.6, -28, 8, C[4], 0.08);
    // moon dust hangs in the wake
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 11), q = B.range(0, 1);
      const px = x - q * trail * 1.6, py = -28 + B.range(-5, 5) * (1 - q);
      p.dot(px, py, i % 3 ? C[4] : C[6], 0.6 * (1 - q));
    }
  }

  // the hit: a white crescent cut, a ring of cold light and the scar it leaves
  if (hitAge >= 0) {
    const q = clamp(hitAge / 0.5), open = 1 - smooth(0.12, 0.5, hitAge);
    if (open > 0.02) {
      crescent(p, C, TX, TY, 10 + q * 10, t * 0.6, 0.95 * open, { w: 3.4 });
      crescent(p, C, TX - 2, TY + 1, 18 + q * 8, t * 0.6, 0.55 * open, { w: 1.6 });
      p.line(TX - 22, TY, TX + 22, TY, WHITE, 0.85 * (1 - q));
      p.glow(TX, TY, 34, C[4], 0.2 * open);
      p.glow(TX, TY, 12, WHITE, 0.2 * open);
      sparkle(p, TX, TY, 15 * open + 4, WHITE, C[4], 0.8 * open);
      p.ellipse(TX, -1, 12 + q * 26, 3.2 + q * 2, C[5], 0.2 * open);
      p.ellipse(TX, -1, 8 + q * 16, 2.2 + q * 1.2, WHITE, 0.16 * open);
      pool(p, TX, 0, 26, 6, C[4], 0.28 * open);
      for (let i = 0; i < 16; i++) {
        const B = rng(S, i, 13), a = B.range(-Math.PI, 0.1), sp = B.range(22, 80);
        const d = q * sp, x = Math.max(-80, Math.min(224, TX + Math.cos(a) * d)), y = TY + Math.sin(a) * d + q * q * 20;
        p.dot(x, Math.min(2, y), i % 3 ? C[5] : WHITE, 0.8 * open);
      }
    }
    // the vertical scar, cooling from white to moon silver
    const scar = smooth(0.05, 0.2, hitAge) * (1 - smooth(1.9, 2.8, t));
    if (scar > 0.02) {
      p.beam(TX, TY - 34, TX, TY + 22, 1, C[6], 0.35 * scar);
      p.glowLine(TX, TY - 34, TX, TY + 22, 7, C[4], 0.05 * scar);
      glint(p, TX, TY, Math.round(1 + 3 * scar), WHITE, 0.16 * scar);
    }
    // falling petals of moonlight
    const petalK = smooth(0.05, 0.4, hitAge) * fade;
    if (petalK > 0.02) {
      for (let i = 0; i < 14; i++) {
        const B = rng(S, i, 17), born = HIT + B.range(0, 1.1), age = t - born;
        if (age < 0) continue;
        const life = 1.2 + B.next() * 0.8, q2 = age / life;
        if (q2 > 1) continue;
        const x = Math.min(226, TX + B.range(-34, 34) + Math.sin(age * 2.2 + i) * 5);
        const y = TY - 20 + age * B.range(10, 26) + q2 * 30;
        const k = (1 - q2) * petalK;
        p.line(x, y, x + 1, y + 2, i % 3 ? C[5] : WHITE, 0.55 * k);
        if (i % 4 === 0) p.dot(x - 1, y + 1, C[4], 0.4 * k);
      }
    }
  }

  // motes drift through the cold air for the whole shot
  const amb = smooth(0.1, 0.5, t) * fade;
  if (amb > 0.02) {
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 19), x = -40 + B.range(0, 250), y = -34 - B.range(0, 80) + ((t * 8 + B.range(0, 40)) % 40);
      p.dot(Math.max(-84, Math.min(228, x)), y, i % 3 ? C[4] : C[6], 0.35 * amb * B.range(0.4, 1));
    }
  }
}
