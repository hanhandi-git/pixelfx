// A gourd flask of elixir: two porcelain lobes, a gold stopper and a red cord at the waist. The rocking
// liquid, rising bubbles and cork wisps follow Sprite Fusion's open-source potion and bubbles
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, cycle, SDF, TAU, WHITE, hex, mix } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { ELIXIR, CINNABAR, GILT } from "./_eastern.js";

export const meta = {
  name: "Elixir gourd",
  desc: "A double-lobed gourd of glowing elixir rocks on its red waist cord: the brew sloshes, bubbles rise and pop, a gold stopper glints, and warm wisps curl from the mouth.",
  tags: ["pickup", "elixir", "gourd", "potion", "eastern", "xianxia", "alchemy", "loop"],
  size: [56, 80],
  origin: [28, 72],
  duration: 2.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: ELIXIR, seed: 24 },
};

const HOVER = 25, L = new Layer(44, 52), INK = hex("#120a08");
// celadon porcelain: a cool glaze that makes the warm elixir inside read as light, not as fire
const SHELL = ["#0a1614", "#182c28", "#2e4a42", "#507064", "#7e9c88", "#aec4ac", "#d8e6cc", "#f4fae8"].map(hex);
const GOURD = SDF.union(
  SDF.circle(0, -10, 5.4),
  SDF.circle(0, 5.5, 8.6),
  SDF.capsule(0, -10, 0, 5.5, 3.0),
);
const pose = (ph) => ({ y: -HOVER - 1.5 * Math.sin(ph * TAU), a: 0.1 * Math.sin(ph * TAU + 0.35) });
// the brew's surface in the gourd's own frame: level-ish, with a slow slosh and a lag behind the rock
const surface = (u, ph) => 0.2 + 0.45 * Math.sin(ph * TAU - 0.8 + u * 0.42) + 0.22 * Math.sin(u * 1.4 + ph * TAU * 2);

export function drawBack(p, t, o) {
  const { y } = pose(t / meta.duration), lift = (-y - HOVER + 1.5) / 4;
  blobShadow(p, 0, 8.5 - lift * 1.4, 0.8 - lift * 0.16);
  pool(p, 0, 0.5, 14, 3.2, fit(o.palette, 8)[4], 0.17);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), R = fit(CINNABAR, 8), G = fit(GILT, 8);
  const T = meta.duration, ph = t / T, { y, a } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * cs - v * sn, y + u * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [dx * cs + dy * sn, -dx * sn + dy * cs]; };
  const hi = 1.5 + 0.5 * Math.sin(ph * TAU * 3); // the brew's own pulse

  p.glow(0, y + 4, 20, C[4], 0.16 + 0.04 * Math.sin(ph * TAU * 2));
  p.glowRing(0, y + 2, 3, 12, C[5], 0.12);

  L.begin(-22, Math.floor(y) - 26);
  // the shell, the brew behind its glass, the stopper and the surface skin
  L.fill(-22, Math.floor(y) - 26, 21, Math.floor(y) + 25, (px, py) => {
    const [u, v] = local(px, py), d = GOURD(u, v);
    const cork = v < -15.2 && v > -19.4 && Math.abs(u) < 2.8 - Math.max(0, -v - 17) * 0.5;
    if (d >= 0 && !cork) return 0;
    if (cork) {
      if (v < -18.2) return G[5];
      if (v < -16.2) return u < -0.4 ? G[5] : u > 0.9 ? G[2] : G[3];
      return R[4]; // a red cord tied under the stopper
    }
    const e = -d, lit = (-u * 0.55 - (v - 2) * 0.82) / Math.max(1, Math.hypot(u, v - 2));
    const inUpper = v < -1.2, wall = e < 1.25;
    const s = surface(u, ph);
    if (wall) {
      // glazed porcelain: a hot left shoulder, a deep right fold, and the brew showing through below
      if (inUpper) {
        let k = lit > 0.7 ? 6 : lit > 0.25 ? 5 : lit > -0.2 ? 4 : lit > -0.55 ? 2 : 1;
        if (e < 0.8) k = lit > 0.1 ? 6 : 2;
        if (Math.abs(u + 2.6) < 0.6 && v < -5 && v > -13) k = 6; // a hard highlight down the upper lobe
        if (v > -3.4 && v < -2.2) return G[2]; // a gold collar at the neck
        if (v > -6.2 && v < -5.4 && Math.abs(u) < 4.2) return G[1]; // a second band around the upper lobe
        return SHELL[k];
      }
      if (v - s < 1.2 && v > s) return mix(WHITE, C[6], 0.35);
      const k = lit > 0.55 ? 5 : lit > 0.1 ? 4 : lit > -0.35 ? 2 : 1;
      if (e < 0.75) return lit > 0.05 ? SHELL[6] : SHELL[2];
      return mix(SHELL[k], C[k], 0.42);
    }
    // the elixir: dark at the bottom and edges, a lit heart, a bright skin on the surface
    if (v < -1.2) return SHELL[lit > 0.3 ? 4 : 2];
    if (v < s) return mix(SHELL[1], C[1], 0.5); // empty glass above the brew
    const depth = v - s, core = 1 - Math.hypot(u * 0.9, v - 6.5) / 9;
    if (depth < 0.9) return Math.abs(u) < 4.2 ? WHITE : C[6];
    let k = core > 0.6 ? 5 : core > 0.36 ? 4 : core > 0.12 ? 3 : 2;
    if (depth < 2.2) k = Math.min(6, k + 1);
    if (v > 10) k = Math.max(2, k - 1);
    if (u > 2 && v > 4.5) k--;
    if (hi > 1.8 && core > 0.55) k = 5;
    return C[Math.max(2, Math.min(6, k))];
  });
  // bubbles rising through the lower lobe: clipped to the gourd pixels already drawn
  cycle(t, T, 9, o.seed, 1.1, (age, life, r) => {
    const k = age / life, u0 = r.range(-5.5, 5.5), v = 11 - k * 13 + r.range(0, 2);
    const x = u0 + Math.sin(age * r.range(4, 8) + r.range(0, TAU)) * 0.6, [sx, sy] = at(x, v);
    const s = surface(x, ph);
    if (v < s + 0.5) {
      // popping at the surface
      if (k > 0.86) {
        p.px(sx, sy, WHITE);
        if (k > 0.93) p.px(sx - 1, sy - 1, C[6]), p.px(sx + 1, sy - 1, C[6]);
      }
      return;
    }
    if (!p.get(sx, sy)) return;
    const rr = 0.8 + r.range(0, 1.1);
    p.px(sx, sy, rr > 1.3 ? C[6] : C[5]);
    p.px(sx + 1, sy, C[6]);
    if (rr > 1.2) p.px(sx, sy - 1, WHITE), p.px(sx - 1, sy, C[5]);
  });
  L.outline(INK).draw(p);

  // the red cord at the waist: a ring round the pinch, a knot and two hanging tails
  const ring = [];
  for (let i = 0; i <= 24; i++) {
    const an = (i / 24) * TAU;
    ring.push(at(Math.cos(an) * 3.5, -0.6 + Math.sin(an) * 1.15));
  }
  p.polyline(ring, R[3], 1);
  p.polyline(ring.map(([x2, y2]) => [x2, y2 + 1]), R[2], 0.8);
  const [kx, ky] = at(3.2, -0.5);
  p.px(kx, ky, R[5]), p.px(kx + 1, ky, R[4]), p.px(kx, ky + 1, R[3]);
  for (let i = 0; i < 2; i++) {
    const sway = Math.sin(ph * TAU + i * 1.7) * 1.4, len = 7 + i * 2;
    p.line(kx, ky + 1, kx + 1.5 + i * 1.5 + sway, ky + 1 + len, R[i ? 4 : 3]);
    p.px(kx + 1.5 + i * 1.5 + sway, ky + 1 + len, R[5]);
  }
  // a glint on the shoulder and on the stopper
  const sh = ((ph + 0.1) % 1) * 2 - 1;
  if (sh > -1 && sh < 1) glint(p, at(-3.2, -10)[0], at(-3.2, -10)[1], 1.4 + 1.6 * (1 - Math.abs(sh)), C[6], 0.26);
  if (((ph * 2) % 1) < 0.35) glint(p, at(0, -18)[0], at(0, -18)[1], 1.2 + 1.1 * (0.5 + 0.5 * Math.sin(ph * TAU * 2)), G[6], 0.2);
  // wisps curling off the mouth
  cycle(t, T, 3, o.seed, 1.3, (age, life, r) => {
    const k = age / life, [wx, wy] = at(Math.sin(k * 4 + r.range(0, TAU)) * 2.2, -17 - k * 8);
    p.disc(wx, wy, 1.2 + k * 2.2, C[3], 0.16 * (1 - k));
    p.dot(wx, wy, C[5], 0.5 * (1 - k));
  });
}
