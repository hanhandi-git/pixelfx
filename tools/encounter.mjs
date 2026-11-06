#!/usr/bin/env node
// Render and check a fantasy encounter: the map, the units and their attack effects on one timeline.
//
//   node tools/encounter.mjs <name>
//   node tools/encounter.mjs <name> --mp4
//
// Writes records/encounters/<id>/contact.png and timeline.json. A contact sheet is the review tool; --mp4 is for
// judging timing. The checker fails on modules of the wrong kind, a timeline out of order, an attack whose hit
// falls outside its own effect, or phases whose health goes up.

import { join } from "node:path";
import { ROOT, resolveEncounterIds, loadEncounter, renderEncounter, contactSheet, save, writeVideo } from "./lib/fxlib.mjs";
import { createFrame, clearFrame, createEncounter } from "../src/core/index.js";

const args = process.argv.slice(2), flags = {}, ids = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith("--")) ids.push(a);
  else if (["mp4", "gif", "all"].includes(a.slice(2))) flags[a.slice(2)] = true;
  else flags[a.slice(2)] = args[++i];
}
const all = !ids.length;
const list = resolveEncounterIds(all ? ["*"] : ids);
if (!list.length) {
  console.error("usage: node tools/encounter.mjs <encounter-id>... [--mp4] [--gif] [--all] [--fps N] [--seconds N]");
  process.exit(1);
}

const KNOWN = new Set(["attack", "phase", "text", "shake", "hit", "defeat", "summon"]);
function check(id, fx) {
  const errs = [], notes = [], meta = fx.meta, E = fx.mod.encounter;
  if (!meta.name) errs.push("meta.name missing");
  if (!meta.desc || meta.desc.length < 12) errs.push("meta.desc missing or too short");
  if (!(meta.duration > 0)) errs.push("meta.duration must be positive");
  if (meta.fps !== 30) notes.push(`meta.fps is ${meta.fps}: encounters normally play at 30`);
  if (!E.map?.meta || E.map.meta.kind !== "map") errs.push("encounter.map is not a map module (meta.kind should be \"map\")");
  if (E.boss) {
    if (E.boss.mod?.meta?.kind !== "boss") errs.push("encounter.boss.mod is not a boss module");
    if (!E.boss.name) notes.push("encounter.boss.name missing: the boss bar falls back to the module name");
  }
  const ids = new Set();
  for (const u of E.mobs ?? []) {
    if (u.id) {
      if (ids.has(u.id)) errs.push(`duplicate mob id "${u.id}"`);
      ids.add(u.id);
    }
    if (u.mod?.meta?.kind !== "mob") errs.push(`mob ${u.id ?? "?"} is not a mob module (kind "${u.mod?.meta?.kind}")`);
    if (!(u.x >= 0 && u.x <= (E.w ?? 320))) errs.push(`mob ${u.id ?? "?"} is outside the arena`);
    if (u.until !== undefined && u.until <= (u.appearAt ?? 0)) errs.push(`mob ${u.id ?? "?"} dies before it appears`);
  }
  if (E.boss && ids.has("boss")) errs.push("a mob id \"boss\" collides with the boss target");
  const phases = E.phases ?? [];
  for (let i = 1; i < phases.length; i++) if ((phases[i].hp ?? 1) > (phases[i - 1].hp ?? 1)) errs.push("phases must lose health: hp goes up");
  for (const p of phases) if (!(p.at >= 0 && p.at <= meta.duration)) errs.push(`phase "${p.name ?? "?"}" is outside the encounter's duration`);
  for (const c of E.timeline ?? []) {
    if (!KNOWN.has(c.type)) errs.push(`cue at ${c.at}: unknown type "${c.type}"`);
    if (!(c.at >= 0)) errs.push(`cue at ${c.at}: negative time`);
    if (c.type === "attack") {
      if (!c.fx?.meta) errs.push(`attack cue at ${c.at}: no effect module`);
      else if (!c.fx.draw && !c.fx.create) errs.push(`attack cue at ${c.at}: ${c.fx.meta.name} has no draw/create`);
      else {
        if (c.at + c.fx.meta.duration > meta.duration + 0.01) notes.push(`attack ${c.fx.meta.name} at ${c.at} runs past the encounter's duration`);
        for (const hit of c.fx.attack?.hits ?? []) {
          if (hit.t > c.fx.meta.duration) errs.push(`attack ${c.fx.meta.name}: hit at ${hit.t} is after its effect ends`);
          if (c.at + hit.t > meta.duration + 0.01) notes.push(`attack ${c.fx.meta.name}: hit at ${(c.at + hit.t).toFixed(2)} is past the encounter's duration`);
        }
      }
    }
    if (c.type === "defeat") {
      const known = c.target === "boss" ? !!E.boss : ids.has(c.target);
      if (!known) errs.push(`defeat cue at ${c.at}: target "${c.target}" is not in the encounter`);
    }
  }
  if (!errs.length) {
    try {
      const inst = createEncounter(fx.mod, { seed: 1 }), frame = createFrame(320, 180);
      let frames = 0;
      while (!inst.done() && frames < 4000) {
        inst.update(1 / 30);
        if (frames % 15 === 0) inst.draw(clearFrame(frame));
        frames++;
      }
      if (!inst.done()) errs.push("the encounter never ends");
    } catch (e) {
      errs.push(`runtime: ${String(e.message ?? e).split("\n")[0]}`);
    }
  }
  return { errs, notes };
}

let failed = 0;
for (const id of list) {
  const fx = await loadEncounter(id);
  const { errs, notes } = check(id, fx);
  if (errs.length) {
    failed++;
    console.error(`FAIL  ${id}`);
    for (const e of errs) console.error(`      ${e}`);
    for (const n of notes) console.error(`      note: ${n}`);
    continue;
  }
  const r = renderEncounter(fx, {
    fps: flags.fps ? +flags.fps : undefined,
    seed: flags.seed ? +flags.seed : undefined,
    duration: flags.seconds ? +flags.seconds : undefined,
  });
  const dir = join(flags.out ?? join(ROOT, "records", "encounters"), id);
  const made = [save(join(dir, "contact.png"), contactSheet(fx, r, { max: flags.all ? 400 : 16, zoom: flags.zoom ? +flags.zoom : undefined, title: `${id}  ${fx.meta.name}  ${r.w}x${r.h}  ${r.duration}s` }))];
  const timeline = { id, name: fx.meta.name, desc: fx.meta.desc, duration: r.duration, map: fx.meta.map, boss: fx.meta.boss, mobs: fx.meta.mobs, events: r.events, phases: fx.mod.encounter.phases ?? [], hits: (fx.mod.encounter.timeline ?? []).filter((c) => c.type === "attack").map((c) => ({ at: c.at, effect: c.fx?.meta?.name, hits: (c.fx?.attack?.hits ?? []).map((h) => ({ ...h, at: +(c.at + h.t).toFixed(2) })) })) };
  made.push(save(join(dir, "timeline.json"), JSON.stringify(timeline, null, 1)));
  const k = +(flags.scale ?? Math.max(2, Math.min(4, Math.floor(960 / r.w))));
  if (flags.mp4 && writeVideo(join(dir, "anim.mp4"), r, k)) made.push(join(dir, "anim.mp4"));
  if (flags.gif && writeVideo(join(dir, "anim.gif"), r, k)) made.push(join(dir, "anim.gif"));
  console.log(`ok    ${id}  ${r.duration}s  ${r.n} frames  ->  ${made.join("  ")}`);
  for (const n of notes) console.log(`      note: ${n}`);
}
if (failed) {
  console.error(`\n${failed} encounter${failed === 1 ? "" : "s"} failed`);
  process.exit(1);
}
