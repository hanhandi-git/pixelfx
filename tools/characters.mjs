#!/usr/bin/env node
// Render the cast at the same pixel scale in four poses. --gif adds one acted preview per character.
import { join } from "node:path";
import { CHARACTERS, posed, createFrame, composite } from "../src/core/index.js";
import { ROOT, canvas, upscale, save, loadEffect, renderAct, writeVideo } from "./lib/fxlib.mjs";

const out = join(ROOT, "records", "characters"), scale = 3, cw = 232, ch = 232;
const cols = 5, rows = Math.ceil(CHARACTERS.length / cols);
const poses = [
  ["REST", {}],
  ["SWORD", { weapon: "sword", fx: 11, fy: -21, bx: 8, by: -21, crouch: 3, ffx: 6, fbx: -6, sa: -0.8 }],
  ["CAST", { fx: -10, fy: -34, bx: 11, by: -32, turn: 1, armsFront: true, ffx: 4, fbx: -5 }],
  ["TURN", { yaw: 2.4, fx: -3, fy: -17, bx: 6, by: -19 }],
];
const img = canvas(cw * cols, rows * poses.length * ch + 38);
img.text("ACTION CAST / SAME SKELETON, DISTINCT COSTUMES", 12, 12, 2);
for (let row = 0; row < poses.length * rows; row++) for (let col = 0; col < cols; col++) {
  const index = (row % rows) * cols + col;
  if (index >= CHARACTERS.length) continue;
  const character = CHARACTERS[index], [label, pose] = poses[Math.floor(row / rows)], r = posed(pose, character.id);
  const frame = createFrame(72, 64);
  for (let i = 0; i < r.n; i++) {
    const x = 22 + r.xs[i], y = 57 + r.ys[i];
    if (x >= 0 && y >= 0 && x < frame.w && y < frame.h) frame.color[y * frame.w + x] = r.color[i];
  }
  const x = col * cw, y = row * ch + 38;
  img.rect(x + 3, y, cw - 6, ch - 6, [21, 20, 32, 255]);
  img.text(character.id.toUpperCase(), x + 10, y + 8, 1);
  img.text(label, x + 10, y + 23, 1, [146, 157, 183]);
  const pixels = composite(frame, new Uint8ClampedArray(frame.w * frame.h * 4), null);
  img.paste(upscale(pixels, frame.w, frame.h, scale), frame.w * scale, frame.h * scale, x + 4, y + 30);
}
console.log(save(join(out, "roster.png"), img.png()));
// Signature stances make the silhouettes easy to compare without an effect covering them.
const stances = {
  dummy: {},
  "ember-duelist": { weapon: "sword", fx: 6, fy: -21, bx: -3, by: -18, sa: -1.2, ffx: 4, fbx: -4, crouch: 1 },
  "moon-oracle": poses[2][1],
  "laurel-ranger": { weapon: "bow", fx: 11, fy: -25, bx: -5, by: -25, sa: 0, pull: 1, nocked: true, ffx: 5, fbx: -5 },
  "styx-warden": { weapon: "scythe", fx: 3, fy: -23, bx: -3, by: -17, sa: -1.4, ffx: 3, fbx: -4 },
  naruto: { weapon: "kunai", fx: 8, fy: -24, bx: -2, by: -23, ffx: 5, fbx: -5, crouch: 2, sa: -0.6 },
  sasuke: { weapon: "katana", fx: 6, fy: -22, bx: -3, by: -18, sa: -1.2, ffx: 4, fbx: -4, crouch: 1 },
  "hatsune-miku": poses[2][1],
  daoist: { weapon: "staff", fx: 9, fy: -22, bx: 4, by: -20, sa: -0.4, ffx: 4, fbx: -6 },
  "lu-mingfei": { fx: 8, fy: -21, bx: -4, by: -20, ffx: 3, fbx: -5 },
  "uesugi-eriyi": { fx: 10, fy: -23, bx: 8, by: -22, turn: 0.8, ffx: 4, fbx: -4 },
  "iron-man": { fx: 11, fy: -27, bx: -8, by: -26, ffx: 6, fbx: -6, turn: 0.5 },
  hulk: { fx: 9, fy: -15, bx: -2, by: -17, ffx: 5, fbx: -5, crouch: 5 },
  thor: { weapon: "war-mace", fx: 8, fy: -30, bx: -4, by: -22, sa: -1.4, ffx: 4, fbx: -5 },
  "captain-america": { fx: 6, fy: -24, bx: -5, by: -21, ffx: 3, fbx: -5, turn: 0.6 },
};
const lineCols = 5, lineW = 300, lineH = 340;
const lineup = canvas(lineW * lineCols, Math.ceil(CHARACTERS.length / lineCols) * lineH);
for (let i = 0; i < CHARACTERS.length; i++) {
  const c = CHARACTERS[i], r = posed(stances[c.id] ?? {}, c.id), f = createFrame(72, 70);
  for (let j = 0; j < r.n; j++) {
    const x = 28 + r.xs[j], y = 64 + r.ys[j];
    if (x >= 0 && y >= 0 && x < f.w && y < f.h) f.color[y * f.w + x] = r.color[j];
  }
  const left = (i % lineCols) * lineW, top = Math.floor(i / lineCols) * lineH;
  lineup.rect(left + 4, top + 4, lineW - 8, lineH - 8, [21, 20, 32, 255]);
  lineup.text(c.name.toUpperCase(), left + 15, top + 18, 2);
  lineup.paste(upscale(composite(f, new Uint8ClampedArray(f.w * f.h * 4), null), f.w, f.h, 4), f.w * 4, f.h * 4, left + 6, top + 49);
}
console.log(save(join(out, "lineup.png"), lineup.png()));
if (process.argv.includes("--gif")) {
  const fx = await loadEffect("melee/sword-slash");
  for (const c of CHARACTERS) {
    const r = renderAct(fx, { fps: 30, options: { character: c.id } });
    const path = join(out, `${c.id}.gif`);
    if (!writeVideo(path, r, 4)) throw new Error("ffmpeg is required for --gif");
    console.log(path);
  }
}
