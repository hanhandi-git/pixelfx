// 八岐大蛇: eight heads form a circular storm around one red heart. The necks coil from
// a shared basin, eyes wake around the ring, then the heads breathe inward before Kusanagi's
// gold cut collapses the formation.
import { WHITE, clamp, ease, fit, rng, smooth, TAU } from "../../core/index.js";
import { hotStar } from "../dragonball/_lib.js";
import { glint } from "../pickups/_lib.js";
import { BLOOD, GOLD_BLADE, GOLD_HOT, cloudBank, serpentHead } from "./_lib.js";

const END = 4.5, WAKE = 0.5, BREATH = 1.48, CUT = 2.42;
const W = 420, H = 300, OX = 210, OY = 280, FLOOR = -14;

export const meta = {
  name: "Yamata no Orochi, eightfold coil",
  desc: "Eight serpent heads coil around a shared blood-red heart, wake one by one, breathe inward and collapse under a single gold sword cut.",
  tags: ["kami", "japan", "shinto", "orochi", "serpent", "eight-headed", "boss", "八岐大蛇", "八俣远吕智", "dragon", "one-shot"],
  size: [W, H], origin: [OX, OY], duration: END, loop: false, fps: 30, bg: "dark",
  options: { palette: BLOOD, blade: GOLD_BLADE, seed: 188 },
};

const RING = [
  { a: -2.92, r: 92, h: 64, len: 25 }, { a: -2.5, r: 77, h: 102, len: 28 },
  { a: -1.92, r: 60, h: 132, len: 29 }, { a: -1.22, r: 42, h: 154, len: 27 },
  { a: -0.18, r: 42, h: 154, len: 27 }, { a: 0.52, r: 60, h: 132, len: 29 },
  { a: 1.1, r: 77, h: 102, len: 28 }, { a: 1.54, r: 92, h: 64, len: 25 },
];

function coilNeck(p, C, x0, y0, x1, y1, bend, w, k, seed) {
  if (k <= 0.02) return;
  const cx = (x0 + x1) * 0.5 + bend, cy = (y0 + y1) * 0.5;
  for (let i = 9; i >= 0; i--) {
    const u = i / 9, v = 1 - u;
    const x = v * v * x0 + 2 * v * u * cx + u * u * x1;
    const y = v * v * y0 + 2 * v * u * cy + u * u * y1;
    const rr = w * (1 - u * 0.52);
    p.circle(x, y, rr, C[2], 0.9 * k);
    p.circle(x - rr * 0.28, y - rr * 0.2, rr * 0.6, C[3], 0.5 * k);
    if (i % 2 === 0) {
      const B = rng(seed, i, 7);
      p.dot(x + B.range(-rr, rr), y + B.range(-rr * 0.4, rr * 0.4), C[1], 0.45 * k);
      p.dot(x - rr * 0.5, y - rr * 0.5, C[4], 0.36 * k);
    }
  }
}

function inwardBreath(p, C, x, y, tx, ty, k, seed, t) {
  if (k <= 0.02) return;
  const dx = tx - x, dy = ty - y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const reach = L * (0.55 + 0.45 * ease.outCubic(k)), w = 4 + 8 * k;
  p.poly([[x + nx * 2, y + ny * 2], [x - nx * 2, y - ny * 2], [x + ux * reach - nx * w, y + uy * reach - ny * w], [x + ux * reach + nx * w, y + uy * reach + ny * w]], C[5], 0.38 * k);
  p.line(x + ux * 2, y + uy * 2, x + ux * reach * 0.94, y + uy * reach * 0.94, C[6], 0.7 * k);
  p.line(x + ux * 5, y + uy * 5, x + ux * reach * 0.65, y + uy * reach * 0.65, WHITE, 0.4 * k);
  for (let i = 0; i < 5; i++) {
    const B = rng(seed, i, 12), q = B.range(0.1, 1), px = x + ux * reach * q + nx * B.range(-w, w) * q;
    const py = y + uy * reach * q + ny * B.range(-w, w) * q + q * q * 8;
    p.dot(px, py, i % 3 ? C[6] : GOLD_HOT, 0.6 * k * (1 - q * 0.35));
  }
  p.glow(x + ux * reach * 0.55, y + uy * reach * 0.55, 20, C[5], 0.11 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END, fade = 1 - smooth(3.72, END, t);
  cloudBank(p, C, 0, -238, 330, 56, 12, ph, 0.46 * fade, { body: 1, mid: 2, rim: 3, hot: 4, lumps: 8, minY: -274 });
  cloudBank(p, C, 0, -176, 300, 42, 6, ph + 0.25, 0.34 * fade, { body: 1, mid: 2, rim: 3, hot: 4, wisps: false, lumps: 7 });
  p.ellipse(0, FLOOR + 5, 142, 10, C[1], 0.42 * fade);
  p.ellipse(0, FLOOR + 1, 108, 5, C[3], 0.28 * fade);
  if (fade > 0.02) p.glow(0, -108, 54, C[3], 0.06 * fade);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.blade ?? GOLD_BLADE, 8), S = o.seed, ph = t / END;
  const fade = 1 - smooth(3.82, END, t), rise = smooth(0.18, WAKE + 0.75, t), cutAge = t - CUT;
  const recoil = cutAge > 0 ? ease.outCubic(clamp(cutAge / 0.45)) : 0;
  const heart = smooth(0.58, 1.25, t) * (1 - smooth(3.45, END, t));

  // Shared heart gives the eight separate heads one readable focal centre.
  if (heart > 0.02) {
    p.circle(0, -106, 16, C[2], 0.82 * heart);
    p.circle(-2, -108, 10, C[4], 0.72 * heart);
    p.circle(-3, -110, 4, G[6], 0.82 * heart);
    p.dot(-4, -112, WHITE, 0.8 * heart);
    p.ring(0, -106, 22 + Math.sin(t * 4) * 2, 1, C[5], 0.42 * heart);
    p.glow(0, -106, 40, C[4], 0.18 * heart);
  }

  // Rear coils first, then the four nearer heads to establish depth around the ring.
  for (const back of [true, false]) {
    for (let i = 0; i < RING.length; i++) {
      const h = RING[i], isBack = i === 1 || i === 3 || i === 5 || i === 7;
      if (isBack !== back) continue;
      const dim = isBack ? 0.58 : 1;
      const wake = smooth(0.24 + i * 0.045, WAKE + 0.64 + i * 0.035, t);
      const ang = h.a - recoil * (i % 2 ? 0.2 : -0.16);
      const hx = Math.cos(h.a) * h.r - Math.cos(h.a) * recoil * 16;
      const hy = -106 + Math.sin(h.a) * h.r * 0.38 - h.h * wake * 0.44 - recoil * 12;
      const bx = Math.cos(h.a) * 18, by = FLOOR + 4;
      coilNeck(p, C, bx, by, hx, hy + 5, Math.sin(h.a) * 26, 7.2, dim * wake * fade, S + i * 9);
      const eye = smooth(0.46 + i * 0.06, 0.62 + i * 0.06, t) * (1 - smooth(3.55, 4.3, t));
      serpentHead(p, C, hx, hy, ang, h.len * (1.18 + 0.12 * wake), (0.45 + 0.5 * smooth(BREATH, BREATH + 0.38, t)) * (1 - recoil * 0.68), dim * wake * fade, { eye: C[6], horns: !isBack });
      if (!isBack && t >= BREATH) {
        const mx = hx + Math.cos(ang) * h.len * 0.75, my = hy + Math.sin(ang) * h.len * 0.75;
        inwardBreath(p, C, mx, my, 0, -106, smooth(BREATH, BREATH + 0.28, t) * (1 - smooth(BREATH + 0.8, BREATH + 1.22, t)), S + i * 4, t);
      }
      if (eye > 0.02) {
        p.glow(hx + Math.cos(ang) * h.len * 0.24, hy + Math.sin(ang) * h.len * 0.24, 7, C[6], 0.14 * eye);
      }
    }
  }

  // A diagonal gold cut closes the ring; it is visibly separate from the red breath attack.
  if (cutAge >= 0) {
    const q = ease.outQuart(clamp(cutAge / 0.16)), k = 1 - smooth(0.16, 0.78, cutAge);
    const x0 = -202, y0 = -174, x1 = x0 + 392 * q, y1 = y0 + 90 * q;
    p.line(x0, y0, x1, y1, WHITE, 0.96 * k);
    p.line(x0, y0 + 3, x1, y1 + 3, G[6], 0.62 * k);
    p.glowLine(x0, y0, x1, y1, 8, G[5], 0.08 * k);
    if (cutAge < 0.45) {
      glint(p, x1, y1, Math.round(2 + 5 * (1 - q)), WHITE, 0.28 * k);
      hotStar(p, 0, -126, 22, 0.3, G, 0.58 * k);
    }
  }

  // Scale shards and red embers fall inward after the hit.
  if (cutAge > 0 && cutAge < 1.62) {
    const k = 1 - cutAge / 1.62;
    for (let i = 0; i < 28; i++) {
      const B = rng(S, i, 27), a = B.range(-2.8, -0.32), d = B.range(32, 120) * cutAge;
      const x = Math.max(-200, Math.min(200, B.range(-150, 150) + Math.cos(a) * d));
      const y = -126 + Math.sin(a) * d + cutAge * cutAge * 56;
      if (y > FLOOR + 4) continue;
      p.rect(x, y, 2 + i % 3, 2, i % 3 ? C[3] : C[5], 0.78 * k);
      if (i % 5 === 0) p.glow(x, y, 5, C[5], 0.1 * k);
    }
  }
  const cool = smooth(CUT + 0.24, CUT + 0.6, t) * fade;
  if (cool > 0.02) {
    p.ellipse(0, FLOOR + 1, 120, 4, C[4], 0.16 * cool);
    for (let i = 0; i < 16; i++) {
      const B = rng(S, i, 43), x = B.range(-170, 170), y = FLOOR - ((cutAge * B.range(28, 76) + B.range(0, 100)) % 104);
      p.dot(x, y, i % 2 ? C[5] : G[5], 0.42 * cool);
    }
  }
}
