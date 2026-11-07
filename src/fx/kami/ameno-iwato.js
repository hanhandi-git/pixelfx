// 天岩户: the sealed cave is rebuilt as one heavy, circular boulder door. Its two stone
// halves slide apart on a bright seam; the old shimenawa snaps loose and the hidden sun spills out.
import { WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { glint } from "../pickups/_lib.js";
import { CAVE, SUN, GOLD_HOT, STRAW, STRAW_D, shide } from "./_lib.js";

const END = 3.8, CRACK = 0.74, OPEN = 1.28;
const W = 320, H = 200, OX = 160, OY = 180;
const CY = -88, R = 78;

export const meta = {
  name: "Ama-no-Iwato",
  desc: "A single cave boulder splits along a living seam; the shimenawa snaps, warm sun pours from the hollow and stone dust settles over the threshold.",
  tags: ["kami", "japan", "shinto", "cave", "rock", "light", "amaterasu", "天岩户", "天岩戸", "shimenawa", "event", "one-shot"],
  size: [W, H], origin: [OX, OY], duration: END, loop: false, fps: 30, bg: "dark",
  options: { palette: CAVE, gold: SUN, seed: 152 },
};

function stoneHalf(p, C, side, slide, k, seed, t) {
  if (k <= 0.02) return;
  const seam = side * (3 + slide), outer = side * (R + slide * 0.32);
  const pts = [[seam, CY - 66], [side * (R * 0.35 + slide), CY - 70]];
  for (let i = 0; i <= 8; i++) {
    const a = side < 0 ? Math.PI * 1.5 - i * Math.PI / 8 : -Math.PI * 1.5 + i * Math.PI / 8;
    const wob = Math.sin(seed + i * 4.7) * 2.5;
    pts.push([side * (R + slide * 0.32) + Math.cos(a) * (R * 0.28 + wob), CY + Math.sin(a) * (R * 0.98 + wob)]);
  }
  pts.push([seam, CY + 66]);
  p.poly(pts, C[2], 0.96 * k);
  // top and bottom facets establish stone volume at one pixel scale.
  p.poly([pts[0], pts[1], pts[2], [side * (R * 0.68 + slide * 0.25), CY - 50]], C[4], 0.65 * k);
  p.poly([[seam, CY + 42], pts[pts.length - 2], pts[pts.length - 1], [side * (R * 0.7 + slide * 0.25), CY + 50]], C[1], 0.75 * k);
  p.line(seam, CY - 62, seam, CY + 60, C[6], 0.26 * k);
  for (let i = 0; i < 11; i++) {
    const B = rng(seed, i, 9), y = CY - 54 + i * 10 + B.range(-2, 2);
    const x = side * (R * (0.25 + B.range(0, 0.55)) + slide * 0.28);
    p.line(x, y, x + side * B.range(-8, 5), y + B.range(3, 8), i % 3 ? C[3] : C[5], 0.36 * k);
  }
  p.glow(seam, CY, 16, C[5], 0.025 * k);
}

function rope(p, x0, x1, y, k, t) {
  if (k <= 0.02) return;
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const u = i / 18, x = x0 + (x1 - x0) * u;
    pts.push([x, y + Math.sin(u * TAU * 2 + t * 2) * (1.3 + 2 * u) + u * (1 - u) * 6]);
  }
  p.polyline(pts, STRAW_D, 1 * k);
  p.polyline(pts.map(([x, yy]) => [x, yy - 1]), STRAW, 0.72 * k);
  for (let i = 0; i < 8; i++) {
    const x = x0 + 8 + i * 17, yy = y + Math.sin(i * 1.8 + t * 2) * 1.5;
    p.line(x, yy - 4, x + (i % 2 ? -2 : 2), yy + 4, STRAW_D, 0.45 * k);
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.gold ?? SUN, 8), fade = 1 - smooth(3.08, END, t);
  p.ellipse(0, CY, 92, 78, C[0], 0.78);
  p.ellipse(0, -2, 82, 8, C[1], 0.45 * fade);
  p.rect(-120, -2, 240, 4, C[0], 0.85 * fade);
  const light = smooth(CRACK, OPEN + 0.28, t) * fade;
  if (light > 0.02) {
    p.ellipse(0, CY, 58 + light * 20, 48 + light * 14, G[3], 0.1 * light);
    p.glow(0, CY, 50 + light * 30, G[4], 0.17 * light);
    p.ellipse(0, 1, 52 + light * 30, 4, G[4], 0.18 * light);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.gold ?? SUN, 8), S = o.seed;
  const fade = 1 - smooth(3.08, END, t), open = ease.outCubic(clamp((t - OPEN) / 0.52));
  const stress = smooth(0.05, CRACK, t) * (1 - smooth(CRACK + 0.1, OPEN, t));
  const slide = open * 48;

  // A stitched line and paper streamers make the object read as a shrine seal before it opens.
  rope(p, -76, 76, CY - 20 - open * 5, 1 - open * 0.8, t);
  for (let i = 0; i < 5; i++) {
    const x = -52 + i * 26 + Math.sin(t * 3 + i) * stress * 3;
    const yy = CY - 17 - open * 5;
    shide(p, x, yy, 5, 15 + (i % 2) * 4, (0.76 - open * 0.5) * fade, { folds: 3 });
  }

  // The door is two irregular stone halves, not two clean rectangular panels.
  const stoneK = 1 - smooth(OPEN + 0.45, 2.18, t) * 0.78;
  stoneHalf(p, C, -1, slide, stoneK, S + 1, t);
  stoneHalf(p, C, 1, slide, stoneK, S + 3, t);

  // The crack writes itself from the centre outward before the stone moves.
  if (stress > 0.02) {
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 21), a = -Math.PI * 0.95 + i * Math.PI * 0.17;
      const len = 8 + 46 * stress + B.range(0, 12);
      p.line(Math.cos(a) * 2, CY + Math.sin(a) * 2, Math.cos(a) * len, CY + Math.sin(a) * len, i % 3 ? G[4] : GOLD_HOT, 0.32 * stress);
    }
    p.glow(0, CY, 10 + 28 * stress, G[5], 0.11 * stress);
  }

  const light = smooth(CRACK, OPEN + 0.3, t) * fade;
  if (light > 0.02) {
    // Light escapes as a fan through the gap and lands on the threshold.
    p.beam(0, CY - 50, 0, -2, 2 + 5 * light, WHITE, 0.36 * light);
    for (let i = 0; i < 15; i++) {
      const a = -Math.PI * 0.95 + (i / 14) * Math.PI * 0.9, len = 28 + 72 * light;
      p.line(0, CY, Math.cos(a) * len, CY + Math.sin(a) * len, i % 3 ? G[5] : WHITE, 0.3 * light);
    }
    p.arc(0, CY, 28 + 28 * light, 1.5, -2.7, -0.42, G[5], 0.48 * light);
    p.glow(0, CY, 42, G[5], 0.14 * light);
    sparkle(p, 0, CY, 12 + 18 * light, WHITE, G[5], 0.48 * light);
  }

  // Chips fall from the broken edges and collect on the threshold.
  const debris = smooth(OPEN + 0.02, OPEN + 0.28, t) * fade;
  if (debris > 0.02) {
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 33), age = t - OPEN - B.range(0.05, 0.42), life = 1.3 + B.range(0, 0.8);
      if (age < 0 || age > life) continue;
      const q = age / life, side = i % 2 ? -1 : 1;
      const x = side * (22 + slide * 0.6 + age * B.range(6, 18)) + B.range(-8, 8);
      const y = CY - 44 + age * B.range(26, 54) + age * age * 11;
      p.rect(x, Math.min(1, y), 2 + (i % 3), 2, q > 0.6 ? C[1] : C[4], (1 - q) * 0.8 * debris);
      if (i % 5 === 0) glint(p, x, y, 1 + Math.round(2 * (1 - q)), G[6], 0.12 * (1 - q) * debris);
    }
  }
  if (fade > 0.02) {
    p.ellipse(0, 0, 46 + open * 28, 3, G[4], 0.14 * fade);
    for (let i = 0; i < 8; i++) {
      const B = rng(S, i, 49), x = B.range(-70, 70), y = -5 + B.range(0, 5);
      p.dot(x, y, i % 2 ? G[4] : G[6], 0.24 * fade);
    }
  }
}
