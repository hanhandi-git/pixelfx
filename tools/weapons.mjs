#!/usr/bin/env node
// node tools/weapons.mjs [--gif] [--sheet]: equipment icons, held views and complete acted exports.
import { join } from "node:path";
import { ARMORY, WEAPONS, posed, createFrame, composite } from "../src/core/index.js";
import { ROOT, canvas, upscale, save, loadEffect, renderAct, spriteSheet, writeVideo } from "./lib/fxlib.mjs";

const out = join(ROOT, "records", "weapons"), cols = 3, cw = 340, ch = 300;
const sheet = canvas(cols * cw, Math.ceil(ARMORY.length / cols) * ch + 32);
sheet.text(`ARMORY / ${ARMORY.length} MELEE AND THROWN WEAPONS`, 12, 10, 2);
const manifest = [];
const icons = new Map();
for (let i = 0; i < ARMORY.length; i++) {
  const w = ARMORY[i], frame = createFrame(104, 36), iconX = 28, iconY = 18;
  const T = (a, b, color) => {
    const x = Math.round(a) + iconX, y = Math.round(b) + iconY;
    if (x >= 0 && y >= 0 && x < frame.w && y < frame.h) frame.color[y * frame.w + x] = color;
  };
  WEAPONS[w.id].draw(T, {});
  const pixels = composite(frame, new Uint8ClampedArray(frame.w * frame.h * 4), null);
  icons.set(w.id, pixels);
  const icon = canvas(frame.w, frame.h, [0, 0, 0, 0]); icon.paste(pixels, frame.w, frame.h, 0, 0);
  save(join(out, `${w.id}.png`), icon.png());
  manifest.push({ ...w, image: `${w.id}.png`, size: [frame.w, frame.h], grip: [iconX, iconY], source: "Original procedural geometry, MIT" });
  const x = i % cols * cw, y = 32 + Math.floor(i / cols) * ch;
  sheet.rect(x + 4, y, cw - 8, ch - 8, [21, 20, 32, 255]);
  sheet.text(w.name.toUpperCase(), x + 14, y + 9, 2);
  sheet.paste(upscale(pixels, frame.w, frame.h, 2), frame.w * 2, frame.h * 2, x + 60, y + 26);
  const held = createFrame(112, 86), q = { weapon: w.id, two: ["staff", "spear", "lance", "holy-sword", "war-mace"].includes(w.id),
    fx: 6, fy: -24, bx: -5, by: -24, sa: -0.6, ffx: 4, fbx: -5, crouch: 1 };
  const r = posed(q, "ember-duelist");
  for (let j = 0; j < r.n; j++) {
    const xx = 34 + r.xs[j], yy = 76 + r.ys[j];
    if (xx >= 0 && yy >= 0 && xx < held.w && yy < held.h) held.color[yy * held.w + xx] = r.color[j];
  }
  sheet.paste(upscale(composite(held, new Uint8ClampedArray(held.w * held.h * 4), null), held.w, held.h, 2), held.w * 2, held.h * 2, x + 42, y + 112);
}
console.log(save(join(out, "armory.png"), sheet.png()));
const additions = ARMORY.filter((w) => w.id !== "sword" && w.id !== "spear"), boardCols = 3, boardRows = Math.ceil(additions.length / boardCols), board = canvas(1020, 36 + boardRows * 172);
board.text(`${additions.length} MODELS + REFINED DAGGER`, 14, 12, 2);
additions.forEach((w, i) => {
  const x = i % 3 * 340, y = 36 + Math.floor(i / 3) * 172;
  board.rect(x + 4, y + 4, 332, 164, [21, 20, 32, 255]);
  board.text(w.name.toUpperCase(), x + 14, y + 15, 2);
  board.paste(upscale(icons.get(w.id), 104, 36, 3), 312, 108, x + 14, y + 44);
});
console.log(save(join(out, "additions.png"), board.png()));
save(join(out, "weapons.json"), JSON.stringify({ filtering: "nearest", weapons: manifest }, null, 2));
if (process.argv.includes("--gif") || process.argv.includes("--sheet")) for (const w of ARMORY) {
  const fx = await loadEffect(w.fx), r = renderAct(fx, { fps: 30, options: { character: "ember-duelist" }, hold: 0.15 });
  if (process.argv.includes("--gif")) {
    const path = join(out, `${w.id}.gif`);
    if (!writeVideo(path, r, 3)) throw new Error("ffmpeg is required for --gif");
    console.log(path);
  }
  if (process.argv.includes("--sheet")) {
    const s = spriteSheet(fx, r, w.id);
    s.json.meta.pixelfx.pivot = r.pivot; s.json.meta.pixelfx.weapon = w.id;
    save(join(out, `${w.id}.sheet.png`), s.png);
    save(join(out, `${w.id}.sheet.json`), JSON.stringify(s.json, null, 1));
  }
}
