#!/usr/bin/env node
// Material map for a pixelfx character: one letter per pixel, at native 1x resolution.
//
//   node skills/pixelfx-character/references/ascii-preview.mjs <character-id> [rest|sword|cast|turn]
//
// Run from the pixelfx checkout root, or set PIXELFX_ROOT to it. Letters:
//   s skin  c cloth  h hair  g gold  l leather  b bone  n lining  * glow  # ink  . empty  ? unknown
// Lowercase is a light ramp step, uppercase the darkest step. Use this to see occlusion,
// skin leaks and sub-pixel details that are hard to judge in the roster PNG.

import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

const root = resolve(process.env.PIXELFX_ROOT ?? process.cwd());
const entry = join(root, "src/core/index.js");
if (!existsSync(entry)) {
  console.error(`No pixelfx checkout at ${root}. Run from the repo root or set PIXELFX_ROOT.`);
  process.exit(1);
}
const { CHARACTERS, posed, characterOf } = await import(pathToFileURL(entry).href);
const { toHex } = await import(pathToFileURL(join(root, "src/core/color.js")).href);

const MATS = { 3: "skin", 4: "cloth", 5: "hair", 6: "gold", 7: "leather", 8: "glow", 9: "bone", 10: "lining" };
const GLYPH = { skin: "s", cloth: "c", hair: "h", gold: "g", leather: "l", glow: "*", bone: "b", lining: "n" };
const INK = "#0e0c14";

const POSES = {
  rest: {},
  sword: { weapon: "sword", fx: 11, fy: -21, bx: 8, by: -21, crouch: 3, ffx: 6, fbx: -6, sa: -0.8 },
  cast: { fx: -10, fy: -34, bx: 11, by: -32, turn: 1, armsFront: true, ffx: 4, fbx: -5 },
  turn: { yaw: 2.4, fx: -3, fy: -17, bx: 6, by: -19 },
};

const id = process.argv[2];
const poseName = process.argv[3] ?? "rest";
if (!id || !(poseName in POSES)) {
  console.error(`usage: ascii-preview.mjs <id> [${Object.keys(POSES).join("|")}]`);
  console.error(`ids: ${CHARACTERS.map((c) => c.id).join(", ")}`);
  process.exit(1);
}

const look = characterOf(id);
const lookup = new Map();
for (const [index, name] of Object.entries(MATS)) {
  const ramp = look[name];
  if (!ramp) continue;
  ramp.forEach((color, step) => lookup.set(color.toLowerCase(), step === 3 ? GLYPH[name].toUpperCase() : GLYPH[name]));
}
lookup.set(INK, "#");

const result = posed(POSES[poseName], look.id);
const w = result.x1 - result.x0 + 1, h = result.y1 - result.y0 + 1;
const rows = Array.from({ length: h }, () => Array(w).fill("."));
for (let i = 0; i < result.n; i++)
  rows[result.ys[i] - result.y0][result.xs[i] - result.x0] = lookup.get(toHex(result.color[i])) ?? "?";

console.log(`===== ${look.id} (${look.label}) style=${look.style} pose=${poseName} bounds ${result.x0},${result.y0} ${w}x${h} =====`);
console.log(Array.from({ length: w }, (_, i) => String(Math.abs((result.x0 + i) % 10))).join(""));
for (let y = 0; y < h; y++) console.log(String(result.y0 + y).padStart(3) + " " + rows[y].join(""));
console.log(`legend: s skin  c cloth  h hair  g gold  l leather  b bone  n lining  * glow  # ink  ? unknown`);
