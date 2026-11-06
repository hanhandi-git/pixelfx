// An old square-holed cash coin turning on its edge, strung through the middle by its own light. The coin
// shading and the flash follow Sprite Fusion's open-source coin (https://www.spritefusion.com/pixel-art-vfx/pickup),
// MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, rand, TAU, WHITE, hex, clamp } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { BRONZE } from "./_eastern.js";

export const meta = {
  name: "Cash coin",
  desc: "A square-holed bronze cash coin turns on its edge over its shadow: patina and struck marks catch the light, a flash runs over the face as it squares, and pale motes wink around it.",
  tags: ["pickup", "coin", "cash", "bronze", "eastern", "money", "loop"],
  size: [56, 56],
  origin: [28, 48],
  duration: 1.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: BRONZE, seed: 31 },
};

const R = 8, TH = 2.6, HOVER = 17, L = new Layer(32, 32), INK = hex("#0b0d08");
const pose = (ph) => ({ y: -HOVER - 2 * Math.sin(ph * TAU), theta: ph * TAU - 0.7 });

// a thick coin with a square hole: the face squashes as it turns, the reeded edge shows beside it, and the
// four struck marks around the hole ride the face. Returns the face's flash strength 0..1.
function cash(p, x, y, th, C) {
  const ct = Math.cos(th), st = Math.sin(th), sg = ct < 0 ? -1 : 1, act = Math.abs(ct), ast = Math.abs(st);
  const xc = (TH / 2) * st * sg, Lx = -0.55, Ly = 0.45, Lz = 0.7, Ln = Math.hypot(Lx, Ly, Lz);
  const sp = Math.pow(Math.abs(ct), 40);
  const X = Math.round(x), Y = Math.round(y), B = Math.ceil(R + TH) + 2;
  let flash = 0;
  L.begin(X - B, Y - B);
  L.fill(X - B, Y - B, X + B, Y + B, (px, py) => {
    const sx = px - X, sy = -(py - Y);
    if (Math.abs(sy) > R) return 0;
    const s = Math.sqrt(1 - (sy / R) ** 2), hw = R * s * act, xr = -(st < 0 ? -1 : 1) * s * R * ct, rw = (TH / 2) * ast;
    if (act > 0.05 && Math.abs(sx - xc) <= hw) {
      const fx = (sx - xc) / act, fy = sy, d = Math.hypot(fx, fy) / R;
      // the hole: a square cut clean through the coin
      const square = Math.max(Math.abs(fx), Math.abs(fy));
      if (square < 2.8) return 0;
      // the struck rim around the hole
      if (square < 4.2) {
        const lit = (-fx * 0.55 - fy * 0.83) / Math.max(0.8, Math.hypot(fx, fy));
        return C[lit > 0.15 ? 5 : 3];
      }
      // four abstract struck marks, one on each side of the hole
      const mx = Math.abs(fx) > 4.4 && Math.abs(fx) < 6.2 && Math.abs(fy) < 1.1 && Math.abs(fy) > 0.2;
      const my = Math.abs(fy) > 4.4 && Math.abs(fy) < 6.2 && Math.abs(fx) < 1.1 && Math.abs(fx) > 0.2;
      if (mx || my) return C[2];
      flash = Math.max(flash, sp);
      if (sp > 0.72) return WHITE;
      if (sp > 0.38) return C[6];
      const lit = (-fx * 0.55 - fy * 0.83) / Math.max(0.8, Math.hypot(fx, fy));
      if (d > 0.78) return C[lit > 0.25 ? 6 : lit > -0.4 ? 4 : 3]; // raised rim
      return C[lit > 0.35 ? 5 : lit > -0.2 ? 4 : 3]; // recessed field
    }
    if (Math.abs(sx - xr) <= rw + 0.05) {
      // the reeded edge, lit by its own normal and cut by shallow grooves
      const cphi = xr < 0 ? -s : s, n = [cphi * ct, sy / R, -cphi * st];
      const l = (n[0] * Lx + n[1] * Ly + n[2] * Lz) / Ln;
      const groove = Math.floor((Math.asin(clamp(sy / R, -1, 1)) + Math.PI) * 9) % 2;
      const edge = Math.abs(sx - xr) > rw - 0.6 && Math.sign(sx - xr) === Math.sign(xc - xr);
      return C[Math.max(1, Math.min(6, Math.round(2.6 + l * 2.6) - groove + (edge ? 1 : 0)))];
    }
    return 0;
  });
  L.outline(INK).draw(p);
  return flash;
}

export function drawBack(p, t, o) {
  const { y, theta } = pose(t / meta.duration);
  blobShadow(p, 0, 2.5 + 4.5 * Math.abs(Math.cos(theta)) + 1.5 * Math.abs(Math.sin(theta)), 0.82 - (-y - HOVER + 2) * 0.06);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), T = meta.duration, ph = t / T, { y, theta } = pose(ph);
  const facing = Math.abs(Math.cos(theta));
  p.glow(0, y, 21, C[4], 0.25 + 0.12 * facing);
  p.glowRing(0, y, 3, 13, C[5], 0.14);
  const flash = cash(p, 0, y, theta, C);
  if (flash > 0.25) {
    p.glow(-1, y - 1, 12, C[6], 0.36 * flash);
    glint(p, -3, y - 4, 1 + 3 * flash, C[6], 0.5 * flash);
  }
  // a few pale motes and twinkles round the coin
  for (let i = 0; i < 5; i++) {
    const life = 0.34, age = (((t - (i / 5) * T - rand(i, o.seed, 3) * 0.08) % T) + T) % T;
    if (age > life) continue;
    const a = rand(i, o.seed, 1) * TAU + i * 2.1, d = 10 + rand(i, o.seed, 2) * 5, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(a) * d, y + Math.sin(a) * d * 0.85 - age * 8, Math.round(1.9 * k), i % 2 ? C[6] : WHITE, 0.32 * k);
  }
  pool(p, 0, 0.5, 13, 3, C[4], 0.12);
}
