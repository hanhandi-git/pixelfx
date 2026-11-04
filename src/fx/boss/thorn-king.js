// The Thorn King: a forest tyrant whose silhouette is the point. Big antlers, a staff, a heart burning in a hollow
// chest and a cloak of leaves; the loop breathes, so the encounter has something alive to cut its attacks against.
import { fit, hex, lerp, bump, cycle, TAU, sparkle } from "../../core/index.js";
import { Grid, shift, shadow } from "../mobs/_lib.js";
import * as rootQuake from "./root-quake.js";
import * as thornVolley from "./thorn-volley.js";
import * as phaseRoar from "./phase-roar.js";

export const meta = {
  name: "Thorn King",
  desc: "An antlered tyrant of the old forest: bark limbs, branching antlers, a burning heart in a hollow chest and a staff crowned with a green ember.",
  tags: ["boss", "fantasy", "forest", "treant", "antlers", "loop"],
  kind: "boss",
  size: [128, 168],
  origin: [64, 152],
  duration: 3.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#05080a", "#0c1812", "#16301f", "#24512e", "#3a7a3a", "#63a844", "#a8d96a", "#e8ffb0"],
    seed: 1,
  },
};

export const boss = {
  tier: "boss",
  hp: 1200,
  radius: 28,
  height: 96,
  phases: [{ hp: 1, name: "The Waking Wood" }, { hp: 0.55, name: "Thorns Unleashed" }],
  attacks: [rootQuake, thornVolley, phaseRoar],
  loot: "pickups/loot-beam",
};

const D = meta.duration, GRID = new Grid(-64, -152, 128, 172);
const BARK = ["#050403", "#100b08", "#1d130d", "#2e1e13", "#442d1b", "#5d3f26", "#7a5634"].map(hex);
const BONE = ["#16120c", "#2f2820", "#514636", "#746648", "#9c8a62", "#c8b486", "#eee0b8"].map(hex);
const INK = hex("#030203");
const GOLD = ["#2a1608", "#5a2e0c", "#9a4e12", "#d07818", "#f0a82a", "#ffd45a", "#fff0b0"].map(hex);

function at(t) {
  const ph = (t / D) * TAU;
  return {
    ph,
    breath: Math.sin(ph * 2),
    sway: Math.sin(ph) * 1.4,
    lean: Math.sin(ph * 2 + 0.6) * 0.8,
    head: Math.sin(ph + 1.4) * 1.6,
    heart: 0.65 + 0.35 * Math.sin(ph * 2 + 1.1),
    orb: 0.7 + 0.3 * Math.sin(ph * 3 + 0.4),
    flare: bump(t, 2.55, 2.95),
    blink: t > 3.28 && t < 3.35,
  };
}

function tube(g, pts, r, colors, flip = false) {
  g.tube(pts, r, (u, d) => {
    if (d > 0.82) return colors[1];
    const lit = (1 - u) * 0.65 - (flip ? -1 : 1) * 0.1;
    return d < 0.28 && lit > 0.15 ? colors[3] : d < 0.5 ? colors[2] : colors[1];
  }, 1);
}

function antlers(g, hx, hy, P, C) {
  // six main branches, asymmetric, with tines: bone at the roots, dark at the tips
  const branches = [
    [[hx - 5, hy - 8], [hx - 15, hy - 20], [hx - 25, hy - 31], [hx - 37, hy - 36]],
    [[hx - 2, hy - 10], [hx - 6, hy - 25], [hx - 10, hy - 38], [hx - 15, hy - 48]],
    [[hx - 8, hy - 4], [hx - 22, hy - 10], [hx - 33, hy - 15], [hx - 43, hy - 15]],
    [[hx + 5, hy - 8], [hx + 17, hy - 19], [hx + 28, hy - 29], [hx + 39, hy - 33]],
    [[hx + 2, hy - 10], [hx + 8, hy - 26], [hx + 13, hy - 39], [hx + 12, hy - 49]],
    [[hx + 9, hy - 4], [hx + 24, hy - 9], [hx + 36, hy - 13], [hx + 46, hy - 12]],
  ];
  for (const pts of branches) {
    for (let k = 1; k < pts.length; k++) {
      const [ax, ay] = pts[k - 1], [bx, by] = pts[k], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let s = 0; s <= n; s++) {
        const u = s / n, x = lerp(ax, bx, u), y = lerp(ay, by, u);
        const r = lerp(2.8, 0.6, (k - 1 + u) / (pts.length - 1));
        for (let q = -r; q <= r; q += 0.7) {
          const shade = q < -r * 0.3 ? BONE[5] : q > r * 0.35 ? BONE[1] : BONE[3];
          g.set(x + q * 0.45, Math.round(y + q), shade);
        }
      }
    }
    const [tx, ty] = pts[pts.length - 1];
    g.set(tx, ty - 1, BONE[6]);
    g.set(tx - 1, ty - 3, C[5]);
    g.set(tx + 2, ty - 4, C[4]);
  }
  // tines off the first two branches
  for (const [i, dir] of [[0, -1], [3, 1]]) {
    const a = branches[i][1], b = branches[i][2];
    for (let k = 0; k < 8; k++) {
      const x = lerp(a[0], b[0], 0.35 + k * 0.08), y = lerp(a[1], b[1], 0.35 + k * 0.08);
      g.set(x + dir * k * 0.8, y - k * 1.2, k > 5 ? BONE[5] : BONE[3]);
    }
  }
  // a crown of twigs and leaves where the antlers meet the brow
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU, r = 12 + (i % 4) * 3;
    g.set(hx + Math.cos(a) * r, hy - 3 + Math.sin(a) * r * 0.45, i % 2 ? C[4] : BONE[4]);
  }
}

function body(g, C, P, t) {
  const x = P.sway * 0.4, by = P.breath * 0.7, lean = P.lean;
  // the cloak of old leaves: a ragged mass behind the trunk, not a set of floating dots
  for (const side of [-1, 1]) {
    g.ellipse(x + side * 27, -58 + by, 14, 27, (nx, ny) => (ny < -0.2 ? C[3] : C[2]));
    for (let i = 0; i < 8; i++) {
      const yy = -34 - i * 6 + by, xx = x + side * (20 + (i % 3) * 4) + Math.sin(i * 1.7) * 2;
      g.ellipse(xx, yy, 4 + (i % 2), 3, i % 2 ? C[3] : C[2]);
      if (i % 3 === 0) g.set(xx + side * 2, yy - 3, C[4]);
    }
  }
  for (let i = 0; i < 15; i++) {
    const side = i % 2 ? 1 : -1, xx = x + side * (32 + (i % 3) * 5), yy = -82 + i * 3.2;
    g.set(xx, yy, i % 3 ? C[2] : C[3]);
    g.set(xx + side, yy + 1, C[1]);
  }
  // far arm behind the torso
  tube(g, [[x - 30, -78 + by], [x - 46, -62 + by], [x - 51, -42]], 5, BARK, true);
  for (let i = 0; i < 4; i++) g.line(x - 51, -42, x - 58 - i * 2, -33 - i, i % 2 ? BARK[2] : BARK[3], 1);
  g.set(x - 64, -36, BONE[4]);
  // legs: thick roots with toes
  for (const s of [-1, 1]) {
    tube(g, [[x + s * 13, -44 + by], [x + s * 19, -22], [x + s * 17, -5]], 6.2, BARK, s > 0);
    for (let i = 0; i < 5; i++) {
      const tx = x + s * (13 + i * 3);
      g.line(x + s * 17, -4, tx + s * 2, -1, i % 2 ? BARK[4] : BARK[2], 1);
      g.set(tx + s * 2, -1, BARK[1]);
    }
    g.ellipse(x + s * 17, -2.5, 9, 3, (nx, ny) => (ny < 0 ? BARK[4] : BARK[2]));
    for (let k = 0; k < 4; k++) g.set(x + s * (12 + k * 3), -1, BARK[1]);
  }
  // torso: not a barrel but a split, jagged old trunk
  const T = (dx, dy) => [x + dx, -dy + by];
  const torso = [T(-20, 38), T(-29, 52), T(-25, 68), T(-33, 80), T(-28, 89), T(-12, 94), T(8, 93), T(24, 88), T(31, 78), T(24, 65), T(29, 50), T(20, 38)];
  g.poly(torso, BARK[3]);
  // lit left plate, dark right plate, a deep central seam
  g.poly([T(-20, 38), T(-29, 52), T(-25, 68), T(-33, 80), T(-28, 89), T(-12, 94), T(-2, 92), T(-5, 74), T(-2, 55), T(-4, 39)], BARK[4]);
  g.poly([T(8, 93), T(24, 88), T(31, 78), T(24, 65), T(29, 50), T(20, 38), T(6, 37), T(9, 58), T(5, 76)], BARK[2]);
  for (let i = 0; i < 9; i++) {
    const yy = 42 + i * 5.4;
    g.line(T(-18 + (i % 2) * 3, yy)[0], T(-18, yy)[1], T(-7, yy - 1)[0], T(-7, yy - 1)[1], BARK[1], 0.85);
    g.line(T(9, yy + 2)[0], T(9, yy + 2)[1], T(20 + (i % 2) * 2, yy + 1)[0], T(20, yy + 1)[1], BARK[1], 0.7);
  }
  // tattered bark strips hanging from the waist
  for (let i = 0; i < 6; i++) {
    const bx = x - 18 + i * 7, len = 6 + (i % 3) * 4;
    g.poly([[bx, -40 + by], [bx + 4, -40 + by], [bx + 2, -40 + by + len], [bx + 1, -40 + by + len - 2]], BARK[1]);
  }
  // shoulder pauldrons
  for (const s of [-1, 1]) {
    g.poly([[x + s * 18, -90 + by], [x + s * 34, -88 + by], [x + s * 40, -78 + by], [x + s * 32, -72 + by], [x + s * 20, -76 + by]], BARK[3]);
    g.line(x + s * 20, -88 + by, x + s * 35, -86 + by, BARK[5], 1);
    g.line(x + s * 22, -76 + by, x + s * 34, -73 + by, BARK[1], 1);
    for (let k = 0; k < 4; k++) g.set(x + s * (24 + k * 3), -84 + by + (k % 2) * 2, k % 2 ? C[4] : C[3]);
  }
  // hollow chest with ribs and the burning heart
  g.ellipse(x, -64 + by, 11, 13, BARK[0]);
  g.ellipse(x, -64 + by, 8.5, 10.5, hex("#071008"));
  for (let i = 0; i < 4; i++) {
    const yy = -72 + i * 4 + by;
    g.line(x - 9, yy, x - 3, yy + 1, BARK[3], 1);
    g.line(x + 9, yy, x + 3, yy + 1, BARK[2], 1);
  }
  const hk = P.heart;
  g.ellipse(x, -63 + by, 3.2 + hk * 1.1, 4.2 + hk * 1.4, (nx, ny) => (ny < -0.2 ? GOLD[5] : ny < 0.4 ? GOLD[4] : GOLD[2]));
  g.ellipse(x - 1, -65 + by, 1.6, 2, GOLD[6]);
  g.line(x - 6, -67 + by, x - 4, -59 + by, GOLD[4], 0.8);
  g.line(x + 5, -68 + by, x + 4, -60 + by, GOLD[3], 0.7);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.4;
    g.line(x + Math.cos(a) * 5, -63 + by + Math.sin(a) * 6, x + Math.cos(a) * 11, -63 + by + Math.sin(a) * 13, GOLD[3], 0.55);
  }
  // near arm and the staff hand
  tube(g, [[x + 28, -78 + by], [x + 43, -64 + by], [x + 45, -48]], 5, BARK, false);
  g.ellipse(x + 45, -47, 4.6, 4.2, (nx, ny) => (ny < 0 ? BARK[5] : BARK[3]));
  for (let i = 0; i < 3; i++) g.line(x + 45, -45, x + 49 + i * 2, -36 - i, BARK[2], 1);
  // head: a wide brow, hollow sockets, a carved maw
  const hx = x + P.head, hy = -100 + by - P.breath * 0.6;
  g.ellipse(hx, hy, 14, 13, (nx, ny) => {
    const lit = -nx * 0.45 - ny * 0.7;
    if (lit > 0.45) return BARK[5];
    if (lit > 0.05) return BARK[4];
    if (lit > -0.35) return BARK[3];
    return BARK[2];
  });
  g.poly([[hx - 14, hy - 2], [hx - 8, hy + 7], [hx - 1, hy + 13], [hx + 8, hy + 10], [hx + 14, hy + 1]], BARK[2]);
  g.poly([[hx - 13, hy - 6], [hx - 4, hy - 10], [hx + 5, hy - 9], [hx + 13, hy - 5], [hx + 9, hy - 2], [hx - 9, hy - 3]], BARK[1]);
  for (const s of [-1, 1]) {
    g.ellipse(hx + s * 6, hy - 1, 4.8, 3.4, BARK[0]);
    if (!P.blink) {
      g.rect(hx + s * 6 - 2, hy - 1, 4, 2, (Math.abs(s) && s > 0) ? hex("#ffe680") : hex("#ffd050"));
      g.set(hx + s * 6 + (s > 0 ? 1 : -1), hy - 1, P.flare > 0.3 ? hex("#ffffff") : hex("#fff0a0"));
      g.set(hx + s * 6, hy - 2, hex("#a85e12"), 0.8);
    } else g.line(hx + s * 6 - 2, hy - 1, hx + s * 6 + 2, hy - 1, BARK[0]);
    g.line(hx + s * 10, hy - 5, hx + s * 4, hy - 2, BARK[0], 1);
  }
  // a collar of broken bark spikes around the neck, so the head reads as a crown, not a face on a barrel
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI + (i / 8) * Math.PI, ex = hx + Math.cos(a) * 16, ey = hy + 10 + Math.sin(a) * 5;
    g.line(hx + Math.cos(a) * 10, hy + 8 + Math.sin(a) * 4, ex, ey, BARK[1], 1);
    g.set(ex, ey, BARK[3]);
    if (i % 2 === 0) g.set(ex, ey - 1, BARK[5]);
  }
  for (let i = 0; i < 5; i++) g.line(hx - 4 + i * 2, hy + 5, hx - 3 + i * 2, hy + 8, INK, 0.8);
  g.line(hx - 5, hy + 9, hx + 4, hy + 9, INK, 1);
  antlers(g, hx, hy, P, C);
  // the staff in the near hand, crowned with a green ember
  const sx = x + 45, sy = -48;
  for (let y = sy; y > -112; y--) {
    const wob = Math.sin(y * 0.13 + 1) * 2.5;
    g.set(sx + wob, y, y % 5 === 0 ? BARK[4] : BARK[3]);
    g.set(sx + wob + 1, y, BARK[2]);
    if (y % 13 === 0) { g.set(sx + wob - 1, y - 2, BARK[5]); g.set(sx + wob + 2, y, BARK[1]); }
  }
  const ox = sx + Math.sin(-112 * 0.13 + 1) * 2.5, oy = -113;
  g.ellipse(ox, oy, 5.5, 5.5, (nx, ny) => (nx * nx + ny * ny < 0.3 ? C[7] : nx < 0 ? C[5] : C[4]));
  g.ring(ox, oy, 7, 1.2, BONE[3], 1);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    g.set(ox + Math.cos(a) * 9, oy + Math.sin(a) * 9, C[6]);
  }
  // vines winding up the trunk and the staff
  for (let i = 0; i < 10; i++) {
    const yy = -44 - i * 4.6 + by, xx = x - 19 + Math.sin(i * 1.2) * 8;
    g.set(xx, yy, i % 2 ? C[4] : C[3]);
    g.set(xx + 1, yy - 1, C[5]);
  }
  for (let i = 0; i < 5; i++) g.set(sx + 2 + Math.sin(i * 2) * 2, -58 - i * 8, C[3]);
  return { hx, hy, ox, oy, hk };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8), P = at(t), g = GRID;
  g.clear();
  const B = body(g, C, P, t);
  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? INK : C[0]), 1);
  g.draw(p);
  // the heart and staff light the bark and the ground
  p.glow(0, -64, 20, GOLD[4], 0.16 + 0.12 * P.heart);
  p.glow(B.ox, B.oy, 26, C[5], 0.18 + 0.1 * P.orb);
  p.glow(0, -96, 20, C[4], 0.08);
  p.glow(0, -2, 60, C[3], 0.08);
  if (P.flare > 0.1) p.glow(B.hx, B.hy - 2, 10, hex("#ffe680"), 0.3 * P.flare);
  // falling leaves from the old canopy
  cycle(t, D, 9, (o.seed ?? 1) * 19 + 3, (r) => r.range(1.8, 3.2), (age, L, r, i) => {
    const k = age / L, x0 = (i % 2 ? 1 : -1) * (18 + r.range(0, 30)), y0 = -104 + r.range(0, 18);
    const x = x0 + Math.sin(age * 1.8 + i) * 7, y = y0 + age * r.range(18, 30);
    const a = Math.min(1, k * 4) * Math.min(1, (1 - k) * 3);
    p.px(x, y, i % 3 ? C[4] : C[5]);
    if (a > 0.4) p.px(x + 1, y, C[3]);
    if (i % 2 && a > 0.3) p.glow(x, y, 4, C[4], 0.06);
  });
  // a glint runs up the antlers late in the breath
  const gl = bump(t, 1.55, 1.95);
  if (gl > 0) sparkle(p, B.hx - 30, -124 + B.hy + 24, 2 + gl * 3, C[7], C[6], 0.35 * gl);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8), P = at(t);
  shadow(p, P.sway * 0.5, 0, 30, 5, "#04060a", 0.55);
  p.glow(0, -62, 50, C[3], 0.06 + 0.02 * P.heart);
  p.glow(0, -2, 36, C[4], 0.05);
}
