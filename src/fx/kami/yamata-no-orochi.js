// 八岐大蛇: eight heads over the red storm. They rise out of a blood-coloured fog in two ranks, eyes lighting
// one by one, rears open their jaws and breathe fire across the field; a single white-gold sword line cuts the
// whole rank, and the heads recoil in a rain of scales and embers.
import { WHITE, ease, fit, rng, smooth, TAU } from "../../core/index.js";
import { hotStar } from "../dragonball/_lib.js";
import { glint } from "../pickups/_lib.js";
import { BLOOD, GOLD_BLADE, GOLD_HOT, cloudBank, serpentHead } from "./_lib.js";

const END = 4.5, RISE = 0.55, BREATH = 1.5, CUT = 2.35;
const W = 420, H = 300, OX = 210, OY = 280;
const FLOOR = -18; // the fog line the creature rises from, not the player's floor

export const meta = {
  name: "Yamata no Orochi",
  desc: "Eight heads rise out of a blood-red fog in two ranks, eyes lighting one by one; they rear, breathe fire, and one white-gold sword line cuts the rank, scattering scales and embers.",
  tags: ["kami", "japan", "shinto", "orochi", "serpent", "eight-headed", "boss", "八岐大蛇", "八俣远吕智", "dragon", "one-shot"],
  size: [W, H],
  origin: [OX, OY],
  duration: END,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: BLOOD, blade: GOLD_BLADE, seed: 88 },
};

/** The eight heads: base x, how high the head rears, which way the snout points and how wide the jaw is. */
const HEADS = [
  { bx: -158, rear: -74, ang: -1.18, len: 23, open: 0.55, back: false },
  { bx: -110, rear: -126, ang: -1.46, len: 25, open: 0.75, back: true },
  { bx: -58, rear: -96, ang: -1.62, len: 27, open: 1, back: false },
  { bx: -2, rear: -150, ang: -1.7, len: 24, open: 0.7, back: true },
  { bx: 54, rear: -108, ang: 1.82, len: 26, open: 0.9, back: false },
  { bx: 106, rear: -158, ang: 1.66, len: 24, open: 0.6, back: true },
  { bx: 158, rear: -116, ang: 1.4, len: 25, open: 0.85, back: false },
  { bx: 180, rear: -70, ang: 1.16, len: 21, open: 0.5, back: true },
];

/** A neck from its base to the head: a quadratic sweep, drawn as tapering discs with a lit ridge. */
function neck(p, C, x0, y0, x1, y1, bow, w, k, seed) {
  if (k <= 0.02) return;
  const n = 10;
  const cx = (x0 + x1) / 2 + bow, cy = (y0 + y1) / 2;
  for (let i = n; i >= 0; i--) {
    const u = i / n, iu = 1 - u;
    const x = iu * iu * x0 + 2 * iu * u * cx + u * u * x1;
    const y = iu * iu * y0 + 2 * iu * u * cy + u * u * y1;
    const r = w * (1 - u * 0.55);
    p.circle(x, y, r, C[2], 0.9 * k);
    p.circle(x - r * 0.28, y - r * 0.2, r * 0.62, C[3], 0.55 * k);
    if (i % 3 === 0) {
      const B = rng(seed, i, 5);
      p.dot(x + B.range(-r, r), y + B.range(-r * 0.4, r * 0.4), C[1], 0.5 * k);
      p.dot(x - r * 0.5, y - r * 0.5, C[4], 0.45 * k);
    }
  }
  p.glow((x0 + x1) / 2, (y0 + y1) / 2, w * 2.2, C[2], 0.05 * k);
}

/** A cone of fire from a mouth at (x, y) toward (tx, ty): three nested tongues and thrown embers. */
function breath(p, C, x, y, tx, ty, k, seed, t) {
  if (k <= 0.02) return;
  const dx = tx - x, dy = ty - y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const nx = -uy, ny = ux;
  const reach = L * (0.72 + 0.28 * ease.outCubic(k));
  const w0 = 3.5, w1 = 13 + 8 * k;
  const cy = (yy) => Math.min(-10, yy);
  p.poly([
    [x + nx * w0, cy(y + ny * w0)], [x - nx * w0, cy(y - ny * w0)],
    [x + ux * reach + nx * w1, cy(y + uy * reach + ny * w1)],
    [x + ux * reach - nx * w1, cy(y + uy * reach - ny * w1)],
  ], C[5], 0.5 * k);
  // the hot core is a thick line, so the cone itself can stay one cheap polygon
  p.line(x + ux * 2, cy(y + uy * 2), x + ux * reach * 0.92, cy(y + uy * reach * 0.92), C[6], 0.75 * k);
  p.line(x + ux * 4, cy(y + uy * 4), x + ux * reach * 0.6, cy(y + uy * reach * 0.6), WHITE, 0.55 * k);
  // ragged tongues along the cone
  for (let i = 0; i < 8; i++) {
    const B = rng(seed, i, 7), q = B.range(0.15, 1), spread = B.range(-1.1, 1.1);
    const bx = x + ux * reach * q + nx * w1 * q * spread, by = y + uy * reach * q + ny * w1 * q * spread;
    const len = 4 + B.range(0, 9) * (1 - q * 0.5);
    const a = Math.atan2(uy, ux) + spread * 0.35;
    p.line(bx, by, bx + Math.cos(a) * len, Math.min(-8, by + Math.sin(a) * len), B.next() > 0.4 ? C[6] : C[5], 0.7 * k);
  }
  p.glow(x + ux * reach * 0.5, y + uy * reach * 0.5, 26, C[5], 0.16 * k);
  p.glow(x + ux * reach * 0.8, y + uy * reach * 0.8, 12, C[6], 0.18 * k);
  // embers thrown past the cone's tip
  for (let i = 0; i < 6; i++) {
    const B = rng(seed, i, 11), q = B.range(0, 1), sp = B.range(20, 60);
    const px = x + ux * (reach + sp * q) + nx * B.range(-10, 10);
    const py = y + uy * (reach + sp * q) + ny * B.range(-10, 10) + q * q * 10;
    p.dot(px, Math.min(-6, py), i % 3 ? C[6] : WHITE, 0.7 * k * (1 - q));
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END;
  const fade = 1 - smooth(3.7, 4.45, t);
  // the storm floor: two ranks of blood cloud and a low fog the necks come out of
  cloudBank(p, C, 0, -238, 330, 54, 12, ph, 0.55 * fade, { body: 1, mid: 2, rim: 3, hot: 4, minY: -266, lumps: 7 });
  cloudBank(p, C, -20, -172, 300, 44, 6, ph + 0.2, 0.45 * fade, { body: 1, mid: 2, rim: 3, hot: 4, wisps: false, lumps: 6 });
  const fog = smooth(0.02, 0.45, t) * fade;
  for (let i = 0; i < 10; i++) {
    const B = rng(o.seed, i, 3), x = -150 + i * 33 + Math.sin(ph * TAU * 2 + i) * 5;
    p.ellipse(x, FLOOR + 6 + B.range(-4, 6), 26 + B.range(0, 10), 9 + B.range(0, 4), C[1], 0.4 * fog);
    p.ellipse(x - 6, FLOOR + 2 + B.range(-3, 4), 18, 5, C[2], 0.3 * fog);
  }
  p.rect(-210, -278, 420, 278, C[0], 0.22 * fog);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.blade ?? GOLD_BLADE, 8), S = o.seed, ph = t / END;
  const fade = 1 - smooth(3.75, 4.45, t);
  const R = rng(S, Math.floor(t * 30), 13);
  const rear = smooth(0.3, RISE + 0.55, t);
  const breathK = smooth(BREATH, BREATH + 0.35, t) * (1 - smooth(BREATH + 0.75, BREATH + 1.1, t));
  const cutAge = t - CUT;
  const cut = cutAge >= 0 ? Math.min(1, cutAge / 0.14) : 0;
  const recoil = cutAge >= 0 ? ease.outCubic(Math.min(1, cutAge / 0.35)) : 0;

  // the eyes light one by one before the heads are up: hard orange points in the fog
  for (let i = 0; i < 8; i++) {
    const h = HEADS[i], lit = smooth(0.08 + i * 0.055, 0.2 + i * 0.055, t) * (1 - smooth(3.6, 4.2, t));
    if (lit <= 0.02) continue;
    const rx = h.bx + Math.sin(ph * TAU * 2 + i) * (3 + rear * 3), ry = FLOOR - 18 - rear * 8 - i * 2;
    p.dot(rx, ry, C[7], 0.9 * lit);
    p.glow(rx, ry, 8, C[6], 0.18 * lit);
  }

  // the heads, far rank first
  for (const pass of [true, false]) {
    for (let i = 0; i < 8; i++) {
      const h = HEADS[i];
      if (h.back !== pass) continue;
      const dim = h.back ? 0.62 : 1;
      const rise = smooth(0.25 + i * 0.03, RISE + 0.55 + i * 0.03, t);
      const sway = Math.sin(ph * TAU * 2 + i * 1.3) * (3 + 4 * rise);
      const hx = h.bx + sway - Math.cos(h.ang) * recoil * 14;
      const hy = FLOOR + h.rear * rise - Math.sin(-h.ang) * recoil * 10 - recoil * 12;
      const ang = h.ang - recoil * 0.28;
      neck(p, C, h.bx, FLOOR + 4, hx, hy + 6, (h.bx - hx) * 0.35, 7.4, dim * 0.95 * fade, S + i * 7);
      const open = Math.max(0, h.open * smooth(0.5, 1.2, t)) * (1 - recoil * 0.6);
      serpentHead(p, C, hx, hy, ang, h.len * (1.32 + 0.12 * rise), open, dim * fade, { eye: C[6], horns: !h.back });
      // breath from the four front mouths, aimed across the field
      if (!h.back) {
        const mouthX = hx + Math.cos(ang) * h.len * 0.8, mouthY = hy + Math.sin(ang) * h.len * 0.8;
        breath(p, C, mouthX, mouthY, -120 + i * 46, 2, breathK * (0.55 + 0.45 * Math.sin(t * 9 + i)), S + i * 3, t);
      }
    }
  }

  // the sword line: one white-gold cut across the whole rank, then the seam it leaves
  if (cut > 0) {
    const reach = ease.outQuart(cut), y = -118;
    const x0 = -204, x1 = x0 + 412 * reach;
    p.line(x0, y, x1, y - 4, WHITE, 0.95 * (1 - smooth(0.2, 0.7, cutAge)));
    p.line(x0, y + 2, x1, y - 2, G[6], 0.6 * (1 - smooth(0.2, 0.7, cutAge)));
    p.glowLine(x0, y, x1, y - 4, 12, G[5], 0.06 * (1 - smooth(0.2, 0.7, cutAge)));
    if (cutAge < 0.45) {
      const head = Math.min(200, x0 + 412 * reach);
      glint(p, head, y - 4, Math.round(2 + 5 * (1 - reach)), WHITE, 0.25);
      hotStar(p, 0, y - 2, 22, 0.2, G, 0.6 * (1 - cutAge / 0.45));
    }
  }

  // scales and embers thrown by the cut, then a long red rain
  if (cutAge > 0 && cutAge < 1.6) {
    const k = 1 - cutAge / 1.6;
    for (let i = 0; i < 26; i++) {
      const B = rng(S, i, 17), a = B.range(-2.6, -0.5), sp = B.range(30, 110);
      const x = Math.max(-200, Math.min(200, B.range(-180, 180) + Math.cos(a) * sp * cutAge));
      const y = -118 + Math.sin(a) * sp * cutAge + 0.5 * 170 * cutAge * cutAge;
      if (y > FLOOR + 6) continue;
      p.rect(x, y, 2 + (i % 3), 2, i % 3 ? C[2] : C[4], 0.85 * k);
      if (i % 5 === 0) p.glow(x, y, 4, C[4], 0.1 * k);
    }
  }
  if (cutAge > 0.2) {
    const k = smooth(0.2, 0.5, cutAge) * (1 - smooth(2.9, 3.8, t));
    for (let i = 0; i < 30; i++) {
      const B = rng(S, i, 19), x = B.range(-200, 200) + cutAge * B.range(-6, 6);
      const y = FLOOR + 4 - ((cutAge * B.range(50, 120) + B.range(0, 90)) % 120);
      p.line(x, y, x - 1, y + 4, C[3], 0.5 * k);
    }
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 23);
      const x = B.range(-200, 200), y = FLOOR + 4 - ((cutAge * B.range(18, 40) + B.range(0, 60)) % 70);
      p.dot(x, y, i % 2 ? C[5] : C[6], 0.55 * k);
    }
  }

  // the fog burns where the cut passed: a low line of light and a scatter of embers
  const scar = smooth(CUT + 0.1, CUT + 0.3, t) * fade;
  if (scar > 0.02) {
    p.ellipse(0, FLOOR + 2, 150, 5, C[3], 0.16 * scar);
    p.line(-170, FLOOR + 1, 170, FLOOR + 1, C[4], 0.3 * scar);
    for (let i = 0; i < 8; i++) {
      const B = rng(S, i, 29);
      p.dot(B.range(-160, 160), FLOOR + B.range(-2, 4), GOLD_HOT, 0.4 * scar);
    }
  }
  // the eyes dim last, like coals under ash
  const die = 1 - smooth(3.4, 4.3, t);
  if (die > 0.02) {
    for (let i = 0; i < 8; i++) {
      const h = HEADS[i], w = smooth(0.1 + i * 0.04, 0.3 + i * 0.04, t);
      if (w <= 0.02) continue;
      const x = h.bx + Math.sin(ph * TAU * 2 + i) * 3 - Math.cos(h.ang) * recoil * 14;
      const y = FLOOR + (h.rear - 10) - recoil * 12;
      p.dot(x, y, C[7], 0.5 * die * w);
      p.glow(x, y, 5, C[6], 0.08 * die * w);
    }
  }
}
