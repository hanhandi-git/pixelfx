// Shared art language for the eastern ink assets. These are local drawing helpers, not effect modules.
import { hex, fit, cycle, TAU, rng, combineFields, attractionField, vortexField,
  turbulenceField, fieldTrajectory } from "../core/index.js";

export const INK_PALETTE = ["#080c13", "#121c26", "#293642", "#46535c", "#69777b", "#939f9e", "#c0c6b9", "#e4dfc9"];
export const RED = ["#23121b", "#421c29", "#6b2837", "#943c43", "#bb6158", "#d69a7e", "#e7cead"].map(hex);
export const PAPER = ["#332e2c", "#5e554b", "#948775", "#bdaf91", "#ded2b3"].map(hex);
export const GOLD = ["#30251d", "#58432a", "#82623c", "#a68b58", "#c4af7e"].map(hex);

/** A torn strip of paper with invented seal strokes; no font dependency. */
export function talisman(p, x, y, length = 15, width = 5, angle = 0, alpha = 1, hot = false) {
  const cs = Math.cos(angle), sn = Math.sin(angle);
  const at = (u, v) => [x + u * cs - v * sn, y + u * sn + v * cs];
  const w = width / 2, L = length;
  p.poly([at(-w, -L / 2), at(w, -L / 2 + 1), at(w, L / 2 - 2), at(w - 1, L / 2),
    at(0, L / 2 - 1), at(-w, L / 2)], hot ? PAPER[4] : PAPER[3], alpha);
  p.line(...at(-w, -L / 2), ...at(-w, L / 2 - 1), PAPER[1], alpha);
  p.line(...at(-w + 1, -L / 2 + 2), ...at(w - 1, -L / 2 + 2), RED[3], alpha);
  p.line(...at(0, -L / 2 + 3), ...at(0, L / 2 - 2), hot ? RED[4] : RED[2], alpha);
  for (let i = 0; i < 3; i++) {
    const v = -L / 2 + 5 + i * (L - 6) / 4;
    p.line(...at(-w + 1, v), ...at(w - 1, v + (i % 2 ? -1 : 1)), RED[2], alpha);
  }
}

/** A rectangular floor seal with perspective compression; preserve its outline during the whole tell. */
export function floorSeal(p, x, radius, progress, alpha, C) {
  const ry = Math.max(2, radius * 0.15);
  p.poly([[x - radius, 1], [x, 1 - ry], [x + radius, 1], [x, 1 + ry]], C[0], alpha * 0.55);
  p.polyline([[x - radius, 1], [x, 1 - ry], [x + radius, 1], [x, 1 + ry], [x - radius, 1]],
    progress > 0.86 ? RED[5] : GOLD[3], alpha);
  p.line(x - radius * 0.55, 1, x + radius * 0.55, 1, RED[3], alpha * 0.6);
  for (const side of [-1, 1]) {
    p.line(x + side * radius, -2, x + side * radius, 4, GOLD[3], alpha);
    p.line(x + side * radius * 0.62, 1 - ry * 0.4, x + side * radius * 0.62, 1 + ry * 0.4, RED[4], alpha);
  }
}

/** Repeatable, very low opacity volumes; solid silhouettes do not depend on these. */
export function inkMist(p, t, period, seed, cx, cy, width, height, C, strength = 1) {
  cycle(t, period, 7, seed, period * 0.7, (age, life, r) => {
    const k = age / life, x = cx + r.range(-width, width) + Math.sin(k * TAU) * 3;
    const y = cy - k * height, alpha = Math.sin(k * Math.PI) * 0.075 * strength;
    p.disc(x, y, 5 + 8 * k, C[2], alpha);
  });
}

/** Bake acceleration-driven paper/ash trajectories at initialization; draw can then seek freely. */
export function inkTrajectories(seed, count, cx, cy, radius, duration) {
  const field = combineFields(attractionField(cx, cy, 20, radius * 3), vortexField(cx, cy, 16, radius * 3),
    turbulenceField({ strength: 5, scale: 20, speed: 0, seed }));
  return Array.from({ length: count }, (_, i) => {
    const r = rng(seed, i, 39), a = r.range(0, TAU), d = r.range(radius * 0.6, radius);
    return fieldTrajectory({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * 0.6,
      vx: -Math.sin(a) * 4, vy: -3 + Math.cos(a) * 3 }, field, duration);
  });
}

export const inkColors = (o, n = 8) => fit(o.palette ?? INK_PALETTE, n);
