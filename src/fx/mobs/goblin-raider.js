// A small, fast fantasy minion: the silhouette is the read (big head, long ears, one big dagger), and the loop is
// an idle that tells you what it is before it attacks. Its attack is a separate effect, mobs/goblin-jab, so the
// encounter can wind it up, hold the hit and recover without this loop knowing anything about combat.
import { fit, lerp, bump, sparkle, hex, TAU } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";
import * as goblinJab from "./goblin-jab.js";

export const meta = {
  name: "Goblin Raider",
  desc: "A hunched green raider with a rusty dagger: it bounces on its toes, sniffs the air, taps its foot and turns the blade so the edge catches the light. A minion, not a monster.",
  tags: ["mob", "goblin", "fantasy", "minion", "melee", "loop"],
  kind: "mob",
  size: [64, 72],
  origin: [32, 60],
  duration: 2.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#06100a", "#0c2414", "#14401e", "#1f6028", "#2f8432", "#52a83e", "#8ccf5a", "#d4f49a"],
    seed: 1,
  },
};

export const mob = {
  tier: "minion",
  hp: 42,
  radius: 9,
  height: 33,
  speed: 31,
  xp: 12,
  attacks: [{ id: "jab", name: "Rusty jab", fx: goblinJab, range: 22, windup: 0.18, cooldown: 2.2, damage: 7 }],
  loot: "pickups/coin-spin",
};

const D = meta.duration;
const GRID = new Grid(-32, -52, 64, 60);
const LEATHERP = ["#0a0806", "#241a10", "#3b2a18", "#5a4024", "#7a5a34", "#a47c4a"].map(hex);
const IRON = ["#0a0b0e", "#181b20", "#2b3038", "#454c56", "#6b747e", "#9aa4ad", "#d4dbe0"].map(hex);
const BONE = ["#1a1610", "#3a3224", "#61563c", "#8c7c58", "#b8a67a", "#e4d4a8"].map(hex);
const EYE = hex("#1a0c04"), EYE_Y = hex("#ffd63c"), EYE_W = hex("#fff8d0"), EYE_R = hex("#c86a18"), INK = hex("#08050a");

function at(t) {
  const ph = (t / D) * TAU;
  const sniff = bump(t, 0.92, 1.55), tap = bump(t, 1.7, 2.2), look = Math.sin(ph) * 1.4 + sniff * 1.5;
  return {
    bob: Math.sin(ph * 2) * 1.2,
    sway: Math.sin(ph) * 1.1,
    sniff, tap, look,
    blink: t > 2.3 && t < 2.38,
    crouch: 1 + Math.sin(ph * 2 + 0.6) * 0.7 + tap * 1.2,
  };
}

function ellipseShade(g, cx, cy, rx, ry, colors, { flip = false } = {}) {
  g.ellipse(cx, cy, rx, ry, (nx, ny) => {
    const lit = (-nx * 0.55 - ny * 0.75) * (flip ? -1 : 1);
    if (lit > 0.45) return colors[5];
    if (lit > 0.1) return colors[4];
    if (lit > -0.35) return colors[3];
    return colors[2];
  });
}

function body(g, C, P, t, o) {
  const yb = -P.bob, x0 = P.sway * 0.4;
  // legs: short, bent, wrapped in leather; the near leg takes the weight while the far foot taps
  const hipN = [x0 - 3, yb - 13], hipF = [x0 + 4, yb - 13];
  const kneeN = [x0 - 9, yb - 7], kneeF = [x0 + 9, yb - 7 - P.tap * 1.5];
  const footN = [x0 - 10, -1], footF = [x0 + 10, -1 - P.tap * 2];
  for (const [hip, knee, foot, near] of [[hipN, kneeN, footN, 1], [hipF, kneeF, footF, 0]]) {
    g.tube([hip, knee, foot], 2.6, (u, d) => (d > 0.7 ? C[1] : near ? C[3] : C[2]), 1);
    g.ellipse(foot[0] + 1.5, foot[1] + 0.5, 4.6, 2.1, (nx, ny) => (ny < 0 ? LEATHERP[4] : ny > 0.3 ? LEATHERP[1] : LEATHERP[3]));
    for (let i = -1; i <= 1; i++) g.px(foot[0] + i + 2, foot[1] + 1, LEATHERP[0]);
    g.set(foot[0] - 1, foot[1], LEATHERP[1]);
    // wraps across the shin
    for (let k = 0; k < 3; k++) g.set(knee[0] + (k % 2 ? 1 : -1), knee[1] + 1 + k, LEATHERP[3]);
  }
  // torso: hunched, leather vest over a green belly
  g.ellipse(x0, yb - 21, 10.5, 11.5, (nx, ny) => {
    const lit = -nx * 0.5 - ny * 0.8;
    if (lit > 0.4) return C[5];
    if (lit > 0.1) return C[4];
    if (lit > -0.3) return C[3];
    return C[2];
  });
  g.poly([[x0 - 9, yb - 26], [x0 - 3, yb - 27], [x0 - 1, yb - 14], [x0 - 8, yb - 13]], LEATHERP[3]);
  g.poly([[x0 - 6, yb - 26], [x0 + 1, yb - 26], [x0 + 1, yb - 15], [x0 - 4, yb - 15]], LEATHERP[4]);
  for (let i = 0; i < 5; i++) g.set(x0 - 5 + i, yb - 23 + i * 2, LEATHERP[2]);
  // belt and a bone buckle
  g.rect(x0 - 10, yb - 13, 20, 2, LEATHERP[2]);
  g.rect(x0 - 1, yb - 14, 3, 4, BONE[3]);
  g.set(x0, yb - 13, BONE[5]);
  // pouch
  g.ellipse(x0 - 9, yb - 11, 3, 3.4, (nx, ny) => (ny > 0 ? LEATHERP[2] : LEATHERP[3]));
  // far arm hangs, near arm rests the dagger across the knee
  g.tube([[x0 - 8, yb - 25], [x0 - 14, yb - 21], [x0 - 15, yb - 16]], 2.2, (u, d) => (d > 0.7 ? C[1] : C[2]), 1);
  g.tube([[x0 + 8, yb - 25], [x0 + 14, yb - 22], [x0 + 15, yb - 17]], 2.4, (u, d) => (d > 0.7 ? C[1] : C[3]), 1);
  g.ellipse(x0 + 15, yb - 17, 2.8, 2.5, (nx, ny) => (ny < 0 ? C[4] : C[3]));
  // head: too big for the body, long ears, a nose like a knife, one eye squinting
  const hx = x0 + 5 + P.look * 0.5, hy = yb - 35;
  g.poly([[hx - 4, hy - 3], [hx - 17, hy - 8 + P.look], [hx - 6, hy + 3]], C[3]);
  g.poly([[hx + 4, hy - 3], [hx + 17, hy - 10 + P.look], [hx + 7, hy + 2]], C[3]);
  g.line(hx - 5, hy - 3, hx - 15, hy - 7 + P.look, C[4]);
  g.line(hx + 5, hy - 3, hx + 15, hy - 9 + P.look, C[4]);
  ellipseShade(g, hx, hy, 9.5, 8.5, C);
  // jaw and nose
  g.ellipse(hx + 4, hy + 6.5, 6.5, 4, (nx, ny) => (ny > 0 ? C[2] : C[3]));
  g.poly([[hx + 7, hy - 2], [hx + 16, hy + 2], [hx + 8, hy + 5]], C[4]);
  g.line(hx + 8, hy + 4, hx + 13, hy + 3, C[2]);
  g.set(hx + 14, hy + 2, C[1]);
  // eyes: one yellow slit, one narrowed under a scar
  if (P.blink) {
    g.line(hx + 6, hy - 1, hx + 9, hy - 1, C[0]);
  } else {
    g.rect(hx + 6, hy - 3, 3, 3, EYE);
    g.rect(hx + 7, hy - 2, 2, 2, EYE_Y);
    g.set(hx + 8, hy - 2, EYE_W);
    g.rect(hx + 2, hy - 2, 2, 2, EYE);
    g.set(hx + 3, hy - 2, EYE_R);
  }
  g.line(hx + 1, hy - 5, hx + 5, hy - 6, C[1]);
  // mouth, teeth and a bone earring
  g.line(hx + 5, hy + 6, hx + 11, hy + 5, C[0]);
  g.rect(hx + 7, hy + 5, 1, 2, BONE[5]); g.rect(hx + 9, hy + 5, 1, 2, BONE[5]);
  g.rect(hx - 16, hy - 6 + P.look, 1, 3, BONE[4]); g.set(hx - 16, hy - 3 + P.look, BONE[2]);
  // a bone charm and stitches on the vest
  g.rect(hx - 7, hy + 9, 2, 2, BONE[3]);
  g.set(hx - 7, hy + 11, LEATHERP[1]);
  // the dagger: a short iron blade angled up, a crossguard, a wrapped grip
  const bx = x0 + 18, by = yb - 19, a = -0.32 + P.tap * 0.2 + Math.sin(t * 2) * 0.02;
  const tip = [bx + Math.cos(a) * 15, by + Math.sin(a) * 15];
  g.line(bx, by, tip[0], tip[1], IRON[4]);
  g.line(bx, by + 1, tip[0], tip[1] + 1, IRON[2]);
  g.line(bx - 2, by + 1, tip[0] - 1, tip[1] + 1, IRON[5]);
  g.set(tip[0], tip[1], IRON[6]);
  g.line(bx - 3, by + 2, bx + 3, by - 2, LEATHERP[3]);
  g.line(bx - 1, by + 4, bx + 1, by + 1, LEATHERP[1]);
  g.set(bx - 1, by + 5, BONE[4]);
  // the edge catches a glint late in the loop
  const gl = bump(t, 2.05, 2.35);
  if (gl > 0) g.set(Math.round(lerp(bx, tip[0], 0.45)), Math.round(lerp(by, tip[1], 0.45)), IRON[6]);
  return { bx, by, tip, gl, hx, hy };
}

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8), P = at(t), g = GRID;
  g.clear();
  const bits = body(g, C, P, t, o);
  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? C[0] : INK), 1);
  g.draw(p);
  // dust when the foot taps, a glint off the blade
  if (P.tap > 0.05) {
    for (let i = 0; i < 3; i++) {
      const a = P.tap * Math.PI, x = 8 + Math.cos(a) * (4 + i * 3), y = -1 - Math.sin(a) * (1 + i);
      p.dot(x, y, C[5], P.tap * 0.7);
    }
  }
  if (bits.gl > 0) sparkle(p, lerp(bits.bx, bits.tip[0], 0.45), lerp(bits.by, bits.tip[1], 0.45), 2.2 * bits.gl, 0xffffffff, IRON[6], 0.5 * bits.gl);
  // a faint green pool under it and hot eyes
  p.glow(0, -16, 26, C[3], 0.12);
  p.glow(bits.hx + 8, bits.hy - 2, 5, EYE_Y, 0.22);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8), P = at(t);
  shadow(p, P.sway * 0.3, 0, 10, 2.2, hex("#05070a"), 0.5);
  for (let i = 0; i < 5; i++) p.glow(-8 + i * 4, -1, 9, C[2], 0.04);
}
