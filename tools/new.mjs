#!/usr/bin/env node
// Start a new piece of the fantasy kit from a working template.
//
//   node tools/new.mjs fire/blue-torch                   an effect (add --loop for a loop)
//   node tools/new.mjs world/mossy-crypt --map            a battle map with a layout
//   node tools/new.mjs mobs/rat-scout --mob               a looping minion
//   node tools/new.mjs mobs/rat-bite --mob-attack         its attack effect
//   node tools/new.mjs boss/bog-witch --boss              a boss unit
//   node tools/new.mjs boss/bog-nova --boss-attack        a boss attack / telegraph
//   node tools/new.mjs bog-witch --encounter              an encounter timeline over existing content
//
// Writes the source, then prints the render and check commands for that role.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { FX_DIR, ENCOUNTER_DIR } from "./lib/fxlib.mjs";

const args = process.argv.slice(2);
const kindFlags = { "--map": "map", "--mob": "mob", "--boss": "boss", "--mob-attack": "mob-attack", "--boss-attack": "boss-attack", "--encounter": "encounter" };
const kind = kindFlags[args.find((a) => kindFlags[a])] ?? "effect";
const loop = args.includes("--loop");
let id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.error("usage: node tools/new.mjs <category>/<name> [--loop] [--map|--mob|--mob-attack|--boss|--boss-attack|--encounter]");
  process.exit(1);
}
const DEFAULT_CAT = { map: "world", mob: "mobs", "mob-attack": "mobs", boss: "boss", "boss-attack": "boss" };
if (kind !== "encounter" && !id.includes("/")) id = `${DEFAULT_CAT[kind] ?? "ui"}/${id}`;
if (kind === "encounter") id = id.replace(/^encounters\//, "");
if (!/^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(id)) {
  console.error(`"${id}" is not kebab-case (category/name)`);
  process.exit(1);
}
const name = id.split("/").pop().replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const file = kind === "encounter" ? join(ENCOUNTER_DIR, id + ".js") : join(FX_DIR, id + ".js");
if (existsSync(file)) {
  console.error(`${file} already exists`);
  process.exit(1);
}

const palette = {
  map: '["#05080d", "#08140f", "#0e2218", "#173522", "#26502c", "#3f7238", "#6aa04c", "#a8d97a"]',
  mob: '["#06100a", "#0c2414", "#14401e", "#1f6028", "#2f8432", "#52a83e", "#8ccf5a", "#d4f49a"]',
  boss: '["#05080a", "#0c1812", "#16301f", "#24512e", "#3a7a3a", "#63a844", "#a8d96a", "#e8ffb0"]',
  "mob-attack": "PAL.fire",
  "boss-attack": "PAL.leaf",
}[kind] ?? "PAL.arcane";

const effectBody = loop
  ? `  // a loop: everything is a function of the phase, so t = 0 and t = duration match
  const C = ramp(o.palette), ph = t / meta.duration;
  cycle(t, meta.duration, 12, o.seed, 0.8, (age, life, r) => {
    const k = age / life, a = r.range(0, TAU) + ph * TAU, rad = 6 + k * 12;
    p.px(Math.cos(a) * rad, Math.sin(a) * rad - 8, at(C.slice(2), 1 - k));
  });
  p.circle(0, -8, 4 + Math.sin(ph * TAU) * 1.5, C[5]);
  p.glow(0, -8, 20, C[4], 0.35);`
  : `  // a one-shot: a hero frame, then everything falls away and is gone by t = duration
  const C = ramp(o.palette);
  if (t < 0.06) p.circle(0, -8, 6, WHITE);
  burst(14, o.seed, (r) => {
    const a = r.range(0, TAU), sp = r.range(40, 90), life = r.range(0.3, 0.6);
    if (t > life) return;
    const [x, y] = fly(0, -8, Math.cos(a) * sp, Math.sin(a) * sp, t, 120, 2);
    p.px(x, y, at(C.slice(2), 1 - t / life));
    p.light(x, y, C[4], 0.5 * (1 - t / life));
  });
  p.glow(0, -8, 24, C[4], 0.5 * (1 - seg(t, 0, 0.4)));`;

const templates = {
  effect: `import { PAL, ramp, at, ${loop ? "cycle" : "burst, fly, seg, WHITE"}, TAU } from "../../core/index.js";

export const meta = {
  name: "${name}",
  desc: "One line: what it is, how it moves.",
  tags: ["${id.split("/")[0]}"],
  size: [48, 48],
  origin: [24, 32],
  duration: ${loop ? 1.2 : 0.7},
  loop: ${loop},
  fps: 30,
  bg: "dark",
  options: { palette: PAL.arcane, seed: 1 },
};

export function draw(p, t, o) {
${effectBody}
}
`,
  map: `import { fit, hex, TAU } from "../../core/index.js";
import { bake, blit, sky, stars, ground, tufts, mist, fireflies, leaves, motes } from "./_lib.js";

export const meta = {
  name: "${name}",
  desc: "A one-line picture of this arena: its light, its floor and what moves in the background.",
  tags: ["map", "fantasy", "arena", "loop"],
  kind: "map",
  size: [320, 180],
  origin: [0, 0],
  duration: 8,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ${palette}, seed: 1 },
};

/** The layout gameplay reads: feet stand on groundY, inside walk, at one of the spawns. */
export const map = {
  groundY: 150,
  bounds: [8, 312],
  walk: [[8, 312]],
  platforms: [],
  spawns: { hero: [52, 150], mobs: [[150, 150], [196, 150]], boss: [262, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};

const W = 320, H = 180, D = meta.duration;

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1;
  const skyL = bake(W, H, (p) => {
    sky(p, W, H, hex("#05040c"), hex("#132134"), { horizon: 130, steps: 7 });
    stars(p, W, H, seed, 90, 112, "#cfc8ff");
    p.glow(252, 39, 60, C[3], 0.08);
  });
  const floorL = bake(W, H, (p) => {
    ground(p, W, 150, H, [hex("#141714"), hex("#090c09"), hex("#1b2118"), hex("#262e1d"), hex("#334226"), hex("#4a5c30"), hex("#6d8340")], { grass: true, seed });
    tufts(p, W, 150, C, seed + 4, 26);
    p.glow(160, 149, 40, C[4], 0.05);
  });
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const tt = t % D;
      blit(p, skyL);
      mist(p, tt, D, { y0: 90, y1: 142, color: "#a8c8c0", seed: seed + 2, bands: 2, alpha: 0.06 });
      blit(p, floorL);
      fireflies(p, tt, D, { count: 8, color: "#d8ff8a", seed: seed + 3 });
      leaves(p, tt, D, { count: 6, color: "#8fb45a", back: "#cfe49a", seed: seed + 5 });
      motes(p, tt, D, { count: 12, color: "#e8f0d0", seed: seed + 7 });
    },
  };
}
`,
  mob: `import { fit, hex, bump, TAU } from "../../core/index.js";
import { Grid, shift, shadow } from "./_lib.js";

export const meta = {
  name: "${name}",
  desc: "A looping minion: its silhouette, its idle and the tell that says an attack is coming.",
  tags: ["mob", "fantasy", "minion", "loop"],
  kind: "mob",
  size: [64, 72],
  origin: [32, 58],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: ${palette}, seed: 1 },
};

/** What the encounter reads: the body, its reach and its attacks. Add attack effects with --mob-attack. */
export const mob = {
  tier: "minion",
  hp: 30,
  radius: 8,
  height: 28,
  speed: 24,
  xp: 8,
  attacks: [],
  loot: "pickups/coin-spin",
};

const D = meta.duration, GRID = new Grid(-24, -42, 48, 48);

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7), P = { bob: Math.sin((t / D) * TAU * 2) * 1.2, blink: t > 1.9 && t < 1.98 };
  const g = GRID;
  g.clear();
  // a readable body: dark feet, a pear-shaped torso, two bright eyes
  g.ellipse(0, -13 + P.bob, 10, 11, (nx, ny) => (ny < -0.25 ? C[5] : ny < 0.35 ? C[4] : C[3]));
  g.ellipse(-4, -4, 3, 4, C[2]); g.ellipse(4, -4, 3, 4, C[2]);
  g.ellipse(-3, -16 + P.bob, 2, 2.4, C[0]); g.ellipse(3, -16 + P.bob, 2, 2.4, C[0]);
  if (!P.blink) { g.set(-3, -17 + P.bob, C[6]); g.set(3, -17 + P.bob, C[6]); }
  else { g.line(-4, -16 + P.bob, -2, -16 + P.bob, C[0]); g.line(2, -16 + P.bob, 4, -16 + P.bob, C[0]); }
  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? C[1] : C[0]), 1);
  g.draw(p);
  p.glow(0, -14, 26, C[3], 0.12);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 7);
  shadow(p, 0, 0, 9, 2.2, hex("#05070a"), 0.5);
  p.glow(0, -2, 22, C[3], 0.05);
}
`,
  boss: `import { fit, hex, bump, TAU } from "../../core/index.js";
import { Grid, shift, shadow } from "../mobs/_lib.js";

export const meta = {
  name: "${name}",
  desc: "A large boss unit: a heavy silhouette, a glowing core and a breathing loop the encounter can cut against.",
  tags: ["boss", "fantasy", "loop"],
  kind: "boss",
  size: [128, 168],
  origin: [64, 152],
  duration: 3.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: ${palette}, seed: 1 },
};

/** The boss's stats and phases. Add attack effects with --boss-attack and list them here. */
export const boss = {
  tier: "boss",
  hp: 900,
  radius: 26,
  height: 92,
  phases: [{ hp: 1, name: "Phase One" }, { hp: 0.5, name: "Phase Two" }],
  attacks: [],
  loot: "pickups/loot-beam",
};

const D = meta.duration, GRID = new Grid(-64, -152, 128, 172);

export function draw(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8), P = { bob: Math.sin((t / D) * TAU * 2) * 1.1, pulse: 0.65 + 0.35 * Math.sin((t / D) * TAU * 2 + 1), flare: bump(t, 2.4, 2.8) };
  const g = GRID;
  g.clear();
  // legs, a heavy trunk, a crown of horns and a hot core
  g.tube([[-14, -36], [-20, -16], [-18, -2]], 6, () => C[2], 1);
  g.tube([[14, -36], [20, -16], [18, -2]], 6, () => C[2], 1);
  g.poly([[-26, -36], [-32, -76], [-18, -94], [18, -94], [32, -76], [26, -36]], (nx) => (nx < -10 ? C[3] : nx > 10 ? C[1] : C[2]));
  g.poly([[-14, -88], [-20, -124], [-4, -112], [0, -130], [6, -112], [22, -126], [14, -88]], C[1]);
  g.ellipse(0, -64, 10, 12, hex("#071008"));
  g.ellipse(0, -64, 4 + P.pulse * 2, 5 + P.pulse * 2, (nx, ny) => (ny < 0 ? C[6] : C[4]));
  g.ellipse(0, -98, 14, 12, (nx, ny) => (ny < -0.2 ? C[4] : C[2]));
  for (const s of [-1, 1]) {
    g.ellipse(s * 6, -99, 3, 2.2, C[0]);
    g.set(s * 6, -99, P.flare > 0.3 ? hex("#ffffff") : C[6]);
    g.line(s * 10, -103, s * 4, -101, C[0], 1);
  }
  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? C[0] : hex("#05070a")), 1);
  g.draw(p);
  p.glow(0, -64, 28, C[5], 0.2 + 0.12 * P.pulse);
  p.glow(0, -98, 16, C[4], 0.08);
  p.glow(0, -2, 50, C[3], 0.06);
}

export function drawBack(p, time, o) {
  const t = shift(time, D, o.seed), C = fit(o.palette, 8);
  shadow(p, 0, 0, 28, 5, hex("#04060a"), 0.55);
  p.glow(0, -60, 36, C[3], 0.06);
}
`,
  "mob-attack": `import { PAL, fit, hex, clamp, seg, ease, TAU, burst, fly, sparkle } from "../../core/index.js";

export const meta = {
  name: "${name}",
  desc: "A small minion attack: a short tell, one hot frame and a hard hit star at arm's length.",
  tags: ["mob", "attack", "fantasy", "one-shot"],
  kind: "mob-attack",
  size: [112, 72],
  origin: [20, 56],
  duration: 0.9,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: ${palette}, seed: 1 },
};

/** The hit timing an encounter reads. Keep the hit on the animation's contact frame. */
export const attack = {
  telegraph: 0.18,
  hits: [{ t: 0.26, amp: 1.2, shake: 0.12, damage: 5, range: 22, target: "hero" }],
};

const HIT = attack.hits[0].t;

export function draw(p, t, o) {
  const C = fit(o.palette, 7), H = hex("#fff8e0");
  if (t < HIT) {
    const k = seg(t, 0, HIT);
    sparkle(p, 14, -18, 1.5 + k * 2.5, H, C[5], 0.45 * k);
    p.glow(14, -18, 8, C[4], 0.25 * k);
  }
  const u = seg(t, HIT - 0.08, HIT + 0.06);
  if (u > 0 && u < 1) {
    p.arc(14, -18, 15 + u * 5, (x) => 3.5 * Math.sin(Math.PI * x) + 0.6, -1.5 + u * 0.2, 0.1, (x, v) => (v > 0.5 ? H : C[5]));
  }
  if (t >= HIT && t < HIT + 0.22) {
    const k = (t - HIT) / 0.22, hx = 26, hy = -17;
    p.circle(hx, hy, 2.4 + (1 - k) * 2, H, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + 0.3, L = (i % 2 ? 5 : 9) * (0.5 + (1 - k) * 0.8);
      p.line(hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L * 0.9, i % 2 ? C[5] : H, 1 - k);
    }
    p.glow(hx, hy, 14, C[5], 0.4 * (1 - k));
  }
  burst(8, (o.seed ?? 1) * 7 + 1, (r) => {
    const age = t - HIT;
    if (age < 0 || age > 0.35) return;
    const a = -0.9 + r.range(-0.8, 0.8), sp = r.range(30, 80);
    const [x, y] = fly(26, -17, Math.cos(a) * sp, Math.sin(a) * sp, age, 200, 0);
    if (y > -1) return;
    p.dot(x, y, C[5], 1 - age / 0.35);
  });
}
`,
  "boss-attack": `import { PAL, fit, hex, clamp, lerp, seg, ease, TAU, burst, fly, band, sparkle } from "../../core/index.js";

export const meta = {
  name: "${name}",
  desc: "A boss attack: a floor tell draws itself in, the line flashes, and a shockwave throws debris across the arena.",
  tags: ["boss", "attack", "fantasy", "telegraph", "one-shot"],
  kind: "boss-attack",
  size: [320, 180],
  origin: [160, 150],
  duration: 2.4,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: ${palette}, seed: 1 },
};

/** The tell and the hit the encounter reads. The hit lands on the flash. */
export const attack = {
  telegraph: 0.9,
  hits: [{ t: 1.0, amp: 4, shake: 0.4, damage: 80, radius: 120, target: "hero" }],
};

const TELL = attack.telegraph, HIT = attack.hits[0].t, END = meta.duration;

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 7), H = hex("#fff8dc");
  // the tell: a floor seal and a warning line
  if (t < HIT + 0.05) {
    const k = seg(t, 0, TELL), pulse = 0.55 + 0.45 * Math.sin(t * 16);
    p.ellipse(0, 2, 120, 10, hex("#050406"), 0.3);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU, rr = 30 + k * 50;
      p.dot(Math.cos(a) * rr * 1.2, 2 + Math.sin(a) * rr * 0.11, i % 8 ? C[4] : C[6], (0.3 + 0.5 * k) * pulse);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU, r0 = 20 + k * 20, r1 = r0 + 10;
      p.line(Math.cos(a) * r0 * 1.2, 2 + Math.sin(a) * r0 * 0.12, Math.cos(a) * r1 * 1.2, 2 + Math.sin(a) * r1 * 0.12, C[5], 0.4 + 0.4 * k);
    }
    if (t > TELL - 0.25) {
      const f = seg(t, TELL - 0.25, TELL);
      for (let x = -140; x < 140; x += 3) p.dot(x, 0, C[6], f * (0.4 + 0.4 * Math.sin(x * 0.4 + t * 28)));
      p.glowLine(-140, 0, 140, 0, 10, C[4], 0.2 * f);
    }
  }
  // the release: a white seam, a floor ring and thrown debris
  if (t >= HIT) {
    const age = t - HIT, flash = Math.max(0, 1 - age / 0.16);
    if (flash > 0) {
      p.rect(-150, -2, 300, 4, H, flash);
      p.circle(0, -4, 5 + flash * 6, H, 0.95);
      p.glow(0, -4, 70, C[5], 0.4 * flash);
    }
    for (const [d, sp, th] of [[0, 200, 2.2], [0.07, 140, 1.3]]) {
      const rr = (age - d) * sp;
      if (rr > 0 && rr < 150) band(p, 0, 1, rr, 0.17, th, (1 - rr / 150) * 0.7, C);
    }
    burst(30, (o.seed ?? 1) * 13 + 2, (r, i) => {
      const a = -Math.PI / 2 + r.range(-0.8, 0.8), sp = r.range(50, 150), life = r.range(0.4, 0.9);
      if (age > life) return;
      const [x, y] = fly(r.range(-130, 130), 0, Math.cos(a) * sp, Math.sin(a) * sp, age, 300, 0.6);
      if (y > 0) return;
      p.rect(x, y, i % 4 ? 1 : 2, 1, i % 3 ? C[3] : C[5], 1 - age / life);
    });
    p.glow(0, -2, 60, C[3], 0.12 * Math.max(0, 1 - age / 1));
    if (age < 0.3) sparkle(p, Math.sin(age * 40) * 4, -30, 2 + (0.3 - age) * 10, H, C[5], 0.3);
  }
}
`,
  encounter: `// A generated encounter template: a map, a hero and a few attack cues on one timeline. Replace the map and
// effect imports with your own, then cut the timeline to the fight you want to see.
import * as map from "../fx/world/ember-depths.js";
import * as blast from "../fx/explosions/small-explosion.js";
import * as poof from "../fx/spawn/poof.js";

export const meta = {
  name: "${name}",
  desc: "An encounter template: replace the map and attack imports, then edit the timeline and phases.",
  tags: ["encounter", "fantasy"],
  duration: 14.5,
  fps: 30,
  size: [320, 180],
  map: "world/ember-depths",
};

const GROUND = map.map.groundY;

export const encounter = {
  w: 320,
  h: 180,
  duration: 14.5,
  map,
  hero: { x: 52, y: GROUND },
  phases: [
    { at: 0.3, hp: 1, name: "The Skirmish", sub: "WAVE I", dur: 2.4 },
    { at: 8.4, hp: 1, name: "All Quiet", sub: "THE DEPTHS GO STILL", dur: 2.4 },
  ],
  timeline: [
    { at: 2.2, type: "attack", fx: blast, x: 160, y: GROUND, flip: true },
    { at: 5.2, type: "attack", fx: poof, x: 160, y: GROUND },
    { at: 7.4, type: "attack", fx: blast, x: 210, y: GROUND, flip: true },
  ],
};
`,
};

mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, templates[kind]);
const next = kind === "encounter"
  ? `node tools/encounter.mjs ${id}\nnode tools/index.mjs && node tools/check.mjs`
  : `node tools/check.mjs ${id}\nnode tools/render.mjs ${id} --zoom 3\n${kind === "map" ? `node tools/map.mjs ${id}\n` : ""}${kind === "mob" || kind === "boss" ? `# give it an attack: node tools/new.mjs ${kind === "mob" ? "mobs" : "boss"}/<attack-name> --${kind}-attack\n` : ""}${kind === "boss" ? "# then an encounter: node tools/new.mjs <name> --encounter (set encounter.boss)\n" : ""}node tools/index.mjs && node tools/check.mjs`;
console.log(`wrote ${file}\nrole: ${kind}\nnext:\n${next.split("\n").map((line) => "  " + line).join("\n")}`);
