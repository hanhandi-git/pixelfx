#!/usr/bin/env node
// Export pixelfx sprite sheets and metadata into a Cocos Creator resources folder.
//
//   node tools/cocos.mjs --out ../my-game/assets/resources/pixelfx
//   node tools/cocos.mjs fire ice --out ../my-game/assets/resources/pixelfx
//   node tools/cocos.mjs weather --max-size 4096 --out ../my-game/assets/resources/pixelfx
//
// The output is ordinary PNG + JSON. PixelfxSprite.ts creates SpriteFrames from
// the atlas rectangles without requiring a custom Cocos editor importer.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { ROOT, allIds, resolveIds, loadEffect, renderFrames, canvas, save } from "./lib/fxlib.mjs";
import { actTiming } from "../src/core/index.js";
import { originOf } from "../src/fx/provenance.js";

const args = process.argv.slice(2), patterns = [], flags = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg.startsWith("--")) patterns.push(arg);
  else flags[arg.slice(2)] = args[i + 1]?.startsWith("--") ? true : (args[++i] ?? true);
}

const output = resolve(flags.out ? String(flags.out) : join(ROOT, "cocos", "resources", "pixelfx"));
const ids = patterns.length ? resolveIds(patterns) : allIds();
const maxTextureSize = flags["max-size"] === undefined ? 2048 : Number(flags["max-size"]);
const fps = flags.fps === undefined ? undefined : Number(flags.fps);
const seed = flags.seed === undefined ? undefined : Number(flags.seed);
const options = flags.opts ? JSON.parse(String(flags.opts)) : undefined;
if (fps !== undefined && (!Number.isFinite(fps) || fps <= 0)) throw new Error("--fps must be a positive number");
if (seed !== undefined && !Number.isFinite(seed)) throw new Error("--seed must be a number");
if (!Number.isInteger(maxTextureSize) || maxTextureSize < 64) throw new Error("--max-size must be an integer >= 64");

// A targeted export updates the shared catalog without hiding the other exported effects.
const indexFile = join(output, "index.json");
const previous = patterns.length && existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, "utf8")) : null;
if (previous && !Array.isArray(previous.effects)) throw new Error(`${indexFile}: effects must be an array`);
const catalog = new Map((previous?.effects ?? []).map((effect) => [effect.id, effect]));
mkdirSync(output, { recursive: true });
const index = [];
let failed = 0;
for (const id of ids) {
  try {
    const fx = await loadEffect(id);
    const r = renderFrames(fx, { bg: "none", fps, seed, options });
    const name = id.split("/").at(-1);
    const sheet = cocosSheet(fx, r, name, maxTextureSize);
    const base = join(output, id);
    sheet.pages.forEach((page, i) => save(`${base}${i ? `-${i}` : ""}.png`, page.png));
    sheet.json.meta.pixelfx.cocos = {
      coordinateSystem: "top-left",
      assetPath: relative(output, base).split("\\").join("/"),
      pivot: fx.meta.origin,
      maxTextureSize,
    };
    save(`${base}.json`, JSON.stringify(sheet.json, null, 1));
    index.push({
      id,
      source: originOf(id),
      kind: fx.meta.kind ?? "effect",
      name: fx.meta.name,
      desc: fx.meta.desc,
      tags: fx.meta.tags,
      loop: !!fx.meta.loop,
      fps: r.fps,
      frames: r.n,
      frameSize: fx.meta.size,
      pivot: fx.meta.origin,
      columns: sheet.json.meta.pixelfx.columns,
      pages: sheet.pages.map((page, i) => `${relative(output, base).split("\\").join("/")}${i ? `-${i}` : ""}.png`),
      image: `${relative(output, base).split("\\").join("/")}.png`,
      json: `${relative(output, base).split("\\").join("/")}.json`,
      ...(fx.mod.act ? { act: actTiming(fx.mod) } : {}),
    });
    process.stdout.write(".");
  } catch (error) {
    failed++;
    console.error(`\n${id} FAILED: ${error.stack ?? error}`);
  }
}

for (const effect of index) catalog.set(effect.id, effect);
writeFileSync(indexFile, JSON.stringify({
  version: 1,
  generator: "pixelfx",
  coordinateSystem: "top-left",
  effects: [...catalog.values()],
}, null, 1));
console.log(`\n${index.length} Cocos effects -> ${output} (${catalog.size} in catalog)`);
if (failed) process.exit(1);

/** Pack frames into several Cocos-safe textures. Rectangles stay top-left based. */
function cocosSheet(fx, r, name, maxSize) {
  const { w, h, frames, fps } = r;
  if (w > maxSize || h > maxSize) throw new Error(`${fx.id}: frame ${w}x${h} exceeds --max-size ${maxSize}`);
  const maxCols = Math.max(1, Math.floor(maxSize / w));
  const maxRows = Math.max(1, Math.floor(maxSize / h));
  const capacity = maxCols * maxRows;
  const pageCount = Math.max(1, Math.ceil(frames.length / capacity));
  const pages = [], atlasFrames = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const from = pageIndex * capacity, count = Math.min(capacity, frames.length - from);
    const columns = Math.min(maxCols, count), rows = Math.ceil(count / columns);
    const image = `${name}${pageIndex ? `-${pageIndex}` : ""}.png`;
    const img = canvas(columns * w, rows * h, [0, 0, 0, 0]);
    for (let local = 0; local < count; local++) {
      const i = from + local, x = (local % columns) * w, y = Math.floor(local / columns) * h;
      img.paste(frames[i].clear, w, h, x, y);
      atlasFrames.push({
        filename: `${name} ${i}`,
        page: pageIndex,
        frame: { x, y, w, h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w, h },
        sourceSize: { w, h },
        // Keep the fractional duration so 30 fps loops stay exactly 1/30 s
        // per frame instead of accumulating a millisecond rounding drift.
        duration: 1000 / fps,
      });
    }
    pages.push({ image, asset: `${name}${pageIndex ? `-${pageIndex}` : ""}`, width: img.w, height: img.h, columns, png: img.png() });
  }
  const m = fx.meta;
  return {
    pages,
    json: {
      frames: atlasFrames,
      pages: pages.map(({ image, asset, width, height, columns }) => ({ image, asset, width, height, columns })),
      meta: {
        app: "https://github.com/patch-gg/pixelfx", version: "1", image: pages[0].image, format: "RGBA8888",
        size: { w: pages[0].width, h: pages[0].height }, scale: "1",
        frameTags: [{ name, from: 0, to: frames.length - 1, direction: "forward" }],
        pixelfx: { id: fx.id, source: originOf(fx.id), kind: m.kind ?? "effect", name: m.name, fps, loop: m.loop, frames: frames.length, frameSize: [w, h], pivot: m.origin, columns: pages[0].columns, ...(fx.mod.act ? { act: actTiming(fx.mod) } : {}) },
      },
    },
  };
}
