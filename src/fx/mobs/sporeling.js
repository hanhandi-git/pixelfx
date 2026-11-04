// A ranged fantasy minion: a mushroom with a bad temper. The cap is the silhouette, the gills are the tell, and the
// loop keeps leaking spores so the player learns the colour before the first puff lands.
import { PAL, fit, hex, bump, cycle, TAU, sparkle } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";
import * as sporePuff from "./spore-puff.js";

export const meta = {
  name: "Sporeling",
  desc: "A squat toadstool creature that sways on root feet: its cap pulses, the gills leak glowing spores, it blinks one eye at a time and puffs a warning cloud when it gets excited.",
  tags: ["mob", "mushroom", "spore", "fantasy", "minion", "ranged", "loop"],
  kind: "mob",
  size: [64, 72],
  origin: [32, 58],
  duration: 3,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.poison, seed: 1 },
};

export const mob = {
  tier: "minion",
  hp: 30,
  radius: 10,
  height: 28,
  speed: 19,
  xp: 10,
  attacks: [{ id: "puff", name: "Spore puff", fx: sporePuff, range: 84, windup: 0.45, cooldown: 2.8, damage: 5 }],
  loot: "pickups/xp-orb",
};

const D = meta.duration, GRID = new Grid(-32, -45, 64, 52);
const STEM = ["#100f0c", "#2a2318", "#463a24", "#6a5838", "#94805a", "#c4b080", "#e8d8a8"].map(hex);
const GILL = ["#1a0f1e", "#3a1f44", "#5c2c66", "#86408a", "#b45cb0"].map(hex);

function pose(t) {
  const ph = (t / D) * TAU;
  return {
    sway: Math.sin(ph) * 1.6,
    bob: Math.sin(ph * 2) * 1.1,
    squash: Math.sin(ph * 2 + 0.8) * 0.05,
    puff: bump(t, 1.75, 2.25),
    blink: t > 2.55 && t < 2.63,
    look: Math.sin(ph * 0.5) * 1.2,
  };
}

function body(g, C, P, t) {
  const x = P.sway, yb = -P.bob;
  // root feet and the little claw toes
  for (const s of [-1, 1]) {
    g.tube([[x + s * 3, yb - 6], [x + s * 6, yb - 2], [x + s * 9, 0]], 2.1, (u, d) => (d > 0.65 ? STEM[2] : STEM[4]), 1);
    g.set(x + s * 10, 0, STEM[3]);
    g.set(x + s * 10, 0, STEM[5]);
    for (let k = 0; k < 2; k++) g.set(x + s * (9 - k * 2), 0, STEM[2]);
  }
  // the stem: pale, ridged, widening into a bell
  for (let yy = yb - 19; yy <= 0; yy++) {
    const u = (0 - yy) / 19, hw = 4.6 + u * 3.4;
    for (let xx = Math.round(x - hw); xx <= Math.round(x + hw); xx++) {
      let c = STEM[4];
      if (xx < x - hw * 0.35) c = STEM[5];
      if (xx > x + hw * 0.45) c = STEM[3];
      if ((xx + yy) % 7 === 0) c = STEM[3];
      g.px(xx, yy, c);
    }
  }
  // tiny arms, one scratching its chin
  g.tube([[x - 4, yb - 13], [x - 8, yb - 11], [x - 10, yb - 8]], 1.6, () => STEM[4], 1);
  g.tube([[x + 4, yb - 13], [x + 8, yb - 12 + P.puff], [x + 7, yb - 9 + P.puff]], 1.6, () => STEM[4], 1);
  // the cap: a dome with a darker underside, a lit top-left, and spots that catch the glow
  const cr = 14.5 * (1 + P.squash), cy = yb - 24;
  g.ellipse(x, cy, cr, 8.5, (nx, ny) => {
    const lit = -nx * 0.5 - ny * 0.85;
    if (ny > 0.5) return GILL[2];
    if (lit > 0.4) return C[5];
    if (lit > 0.05) return C[4];
    if (lit > -0.4) return C[3];
    return C[2];
  });
  g.ellipse(x, cy + 6, cr * 0.82, 3.2, (nx, ny) => (ny < 0 ? GILL[3] : GILL[1]));
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI + (i / 7) * Math.PI, px = x + Math.cos(a) * cr * 0.75, py = cy + 5.6 + Math.sin(a) * 1.4;
    g.set(px, py, i % 2 ? GILL[4] : GILL[3]);
  }
  for (const [dx, dy, r] of [[-7, -3, 2.2], [4, -5, 1.6], [8, 1, 1.3], [-2, -7, 1.2], [-10, 2, 1]]) {
    g.ellipse(x + dx, cy + dy, r, r * 0.8, (nx, ny) => (ny < 0 ? C[6] : C[5]));
  }
  // eyes and a small mouth in the stem
  for (const s of [-1, 1]) {
    const ex = x + s * 3 + P.look * 0.4, ey = yb - 13;
    if (P.blink) g.line(ex - 1, ey, ex + 1, ey, hex("#1a1420"));
    else {
      g.ellipse(ex, ey, 1.9, 2.2, hex("#0c0a10"));
      g.set(ex + (s > 0 ? 1 : 0), ey - 1, C[5]);
      g.set(ex, ey - 1, hex("#f0ffe0"));
    }
  }
  const my = yb - 8;
  g.line(x - 1, my, x + 2, my + 1, hex("#2a1420"));
  if (P.puff > 0.22) g.set(x + 1, my + 2, hex("#2a1420"));
  // the gills glow through the cap and the spores lift off them
  return { x, cy, cr };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t), g = GRID;
  g.clear();
  const b = body(g, C, P, t);
  g.outline((x, y, nx, ny) => (ny < 0 && nx < 0 ? GILL[0] : C[0]), 1);
  g.draw(p);
  // spores drift off the gills all loop, and a little warning puff at the peak
  cycle(t, D, 9, (o.seed ?? 1) * 11 + 1, (r) => r.range(1.4, 2.6), (age, L, r, i) => {
    const k = age / L, x = b.x + r.range(-11, 11) + Math.sin(age * 2.4 + i) * 3, y = b.cy + 5 - r.range(2, 9) * k;
    const a = Math.min(1, k * 5) * Math.min(1, (1 - k) * 2.4), tw = 0.5 + 0.5 * Math.sin(age * 7 + i * 1.7);
    p.dot(x, y, tw > 0.7 ? C[6] : C[5], a * 0.8);
    p.glow(x, y, 5, C[4], 0.12 * a);
  });
  if (P.puff > 0) {
    const k = P.puff;
    for (let i = 0; i < 4; i++) {
      const x = b.x + (i - 1.5) * 4, y = b.cy + 3 - i * 1.5 - k * 4;
      p.disc(x, y, (2 + i) * (0.5 + k), C[3], 0.2 * k);
    }
    p.glow(b.x, b.cy + 1, 18, C[4], 0.16 * k);
  }
  p.glow(b.x, b.cy, 30, C[2], 0.1);
  p.glow(b.x, b.cy + 5, 14, GILL[3], 0.12);
  if (P.puff > 0.7) sparkle(p, b.x + 2, b.cy - 6, 2.2, C[6], C[5], 0.35);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = pose(t);
  shadow(p, P.sway, 0, 11, 2.4, "#05070a", 0.5);
  p.glow(0, -2, 26, C[3], 0.06);
}
