// A fight as data: a map, a hero, mobs, a boss, its attack effects and a timeline of phases. The map, the units and
// the attacks are ordinary pixelfx effects; this runner only places them, plays the cues and draws the fight's UI,
// so a showcase encounter and the real game read the same timing. See docs/FANTASY.md for the data contract.

import { createFx, painterFor } from "./fx.js";
import { clamp, rand } from "./math.js";
import { hex } from "./color.js";
import { stockActor, drawActor } from "./actor.js";

const UI = {
  ink: hex("#090711"), panel: hex("#171120"), edge: hex("#4a3a58"),
  gold: hex("#f0c860"), lit: hex("#fff2b8"), white: hex("#ffffff"),
  bar: hex("#d4472f"), barLit: hex("#ff8a5a"), barDark: hex("#731d28"), barBg: hex("#2a1520"),
  phase: hex("#9adf7a"),
};

const CUES = new Set(["attack", "phase", "text", "shake", "hit", "defeat", "summon"]);

/**
 * Create a choreographed encounter from a module's `encounter` export (or the definition itself).
 * o: { seed, mapOptions, options }.
 * Returns { update(dt), draw(frame), t, duration, phase, hp, shake, events, done() }.
 */
export function createEncounter(mod, o = {}) {
  const E = mod.encounter ?? mod;
  if (!E.map) throw new Error("an encounter needs encounter.map (a world map module)");
  const meta = mod.meta ?? E.meta ?? {};
  const W = E.w ?? meta.size?.[0] ?? E.map.meta?.size?.[0] ?? 320;
  const H = E.h ?? meta.size?.[1] ?? E.map.meta?.size?.[1] ?? 180;
  const D = E.duration ?? meta.duration ?? 20;
  const seed = o.seed ?? meta.options?.seed ?? 1;
  const ground = E.map.map?.groundY ?? (H - 32);
  const hero = { x: 52, y: ground, face: 1, ...E.hero };
  const phases = (E.phases ?? []).map((p) => ({ hp: 1, at: 0, dur: 2.4, ...p })).sort((a, b) => a.at - b.at);
  const mapFx = createFx(E.map, { x: 0, y: 0, seed: seed + 101, ...(o.mapOptions ?? {}) });
  const actor = hero.actor ?? stockActor(2);

  let unitIndex = 0;
  const makeUnit = (def, role) => {
    if (!def?.mod) throw new Error(`${role} needs a .mod effect module`);
    const x = def.x ?? hero.x + 100, y = def.y ?? ground;
    unitIndex++;
    return {
      ...def, role, id: def.id ?? `${role}-${unitIndex}`, x, y,
      appearAt: def.appearAt ?? 0, until: def.until ?? Infinity, gone: false,
      fx: createFx(def.mod, { x, y, flip: def.flip ?? x > hero.x, seed: seed + unitIndex * 37, ...(o.options ?? {}), ...(def.options ?? {}) }),
    };
  };
  const boss = E.boss ? makeUnit(E.boss, "boss") : null;
  const units = (E.mobs ?? []).map((m) => makeUnit(m, "mob"));
  if (boss) units.push(boss);

  // the timeline: authored cues plus the phase markers, all in one ordered stream
  const cues = [
    ...(E.timeline ?? []).map((c) => ({ ...c })),
    ...phases.map((p) => ({ ...p, type: "phase" })),
  ].sort((a, b) => a.at - b.at);
  for (const c of cues) if (!CUES.has(c.type)) throw new Error(`encounter cue at ${c.at}: unknown type "${c.type}"`);
  const tail = E.tail ?? 0.8;
  const duration = Math.max(D, ...cues.map((c) => c.at + (c.fx?.meta?.duration ?? 0) + tail));

  let t = 0, cueAt = 0;
  let hp = 1, hpTarget = 1;
  let hurtFlash = 0;
  let shakeState = { amp: 0, t0: -1, dur: 0 };
  let banner = null;
  const acts = [], hits = [];
  let hitAt = 0;

  const startShake = (amp = 3, dur = 0.3) => {
    const left = shakeState.amp * (1 - clamp((t - shakeState.t0) / Math.max(1e-6, shakeState.dur)));
    if (amp >= left) shakeState = { amp, t0: t, dur };
  };
  const showBanner = (text, sub, kind = "phase", dur = 2.4) => {
    banner = { text, sub, kind, t0: t, dur };
  };
  const unitFor = (target) => {
    if (target === "boss") return boss;
    return units.find((u) => u.id === target) ?? null;
  };

  function fire(c) {
    switch (c.type) {
      case "phase": {
        hpTarget = clamp(c.hp ?? hpTarget, 0, 1);
        showBanner(c.name ?? "PHASE", c.sub, "phase", c.dur ?? 2.4);
        if (c.shake) startShake(c.shake, c.shakeDur ?? 0.4);
        break;
      }
      case "text":
        showBanner(c.text ?? "", c.sub, "text", c.dur ?? 2.2);
        break;
      case "shake":
        startShake(c.amp ?? 3, c.dur ?? 0.3);
        break;
      case "hit": {
        const h = c.hit ?? c;
        if (!h.target || h.target === "hero") hurtFlash = Math.max(hurtFlash, 0.08);
        startShake(h.amp ?? 2, h.shake ?? 0.2);
        break;
      }
      case "attack": {
        if (!c.fx) break;
        const inst = createFx(c.fx, {
          x: c.x ?? hero.x, y: c.y ?? ground, flip: !!c.flip,
          seed: seed + 200 + acts.length * 53, ...(o.options ?? {}), ...(c.options ?? {}),
        });
        acts.push({ inst, over: false, until: c.until ?? Infinity });
        for (const h of c.fx.attack?.hits ?? []) hits.push({ at: c.at + (h.t ?? 0), hit: h, cue: c });
        if (c.shake) startShake(c.shake, c.shakeDur ?? 0.3);
        break;
      }
      case "defeat": {
        const u = unitFor(c.target);
        if (u) u.gone = true;
        if (c.target === "boss") hpTarget = 0;
        if (c.shake !== false) startShake(c.shake ?? 3, c.shakeDur ?? 0.35);
        break;
      }
      case "summon": {
        const u = makeUnit({ ...c, appearAt: t }, "mob");
        units.push(u);
        break;
      }
    }
  }

  const api = {
    meta,
    get t() { return t; },
    get duration() { return duration; },
    get phase() {
      let p = phases[0] ?? null;
      for (const q of phases) if (t >= q.at) p = q;
      return p;
    },
    get hp() { return hp; },
    get boss() { return boss; },
    get units() { return units; },
    get events() { return cues.map((c) => ({ at: c.at, type: c.type, name: c.name ?? c.text ?? c.target ?? "", hp: c.hp })); },
    get shake() {
      const k = shakeState.amp * Math.pow(1 - clamp((t - shakeState.t0) / Math.max(1e-6, shakeState.dur)), 1.5);
      if (k < 0.25) return [0, 0];
      const step = Math.floor(t * 60);
      return [Math.round((rand(step, 91) * 2 - 1) * k), Math.round((rand(step, 92) * 2 - 1) * k)];
    },
    update(dt) {
      t += dt;
      mapFx.update(dt);
      for (const u of units) {
        if (u.gone || t < u.appearAt || t >= u.until) continue;
        u.fx.update(dt);
      }
      for (const a of acts) {
        if (a.over) continue;
        if (t >= a.until) a.inst.stop();
        a.inst.update(dt);
        if (a.inst.done()) a.over = true;
      }
      while (cueAt < cues.length && cues[cueAt].at <= t) fire(cues[cueAt++]);
      while (hitAt < hits.length && hits[hitAt].at <= t) fire({ ...hits[hitAt].hit, type: "hit", at: hits[hitAt].at }), hitAt++;
      if (hurtFlash > 0) hurtFlash -= dt;
      hp += (hpTarget - hp) * Math.min(1, dt * 5.5);
      if (Math.abs(hp - hpTarget) < 0.0005) hp = hpTarget;
      // effects that have played out are dropped once their last pixel could still be on screen
      for (let i = acts.length - 1; i >= 0; i--) if (acts[i].over) acts.splice(i, 1);
    },
    draw(frame) {
      const p = painterFor(frame);
      // the map is one screen-sized loop: it covers the frame before anything stands on it
      mapFx.draw(frame);
      const living = units.filter((u) => !u.gone && t >= u.appearAt && t < u.until);
      for (const a of acts) if (!a.over) a.inst.draw(frame, "back");
      for (const u of living) u.fx.draw(frame, "back");
      // the hero, standing on the map's floor
      p.reset();
      p.place(hero.x, hero.y, hero.face < 0);
      drawActor(p, actor, 1);
      for (const u of living) u.fx.draw(frame, "front");
      for (const a of acts) if (!a.over) a.inst.draw(frame, "front");
      // the hit is read on the body: a white silhouette for a couple of frames
      if (hurtFlash > 0) {
        p.reset();
        p.place(hero.x, hero.y, hero.face < 0);
        p.mask(actor.mask, actor.x, actor.y, UI.white, clamp(hurtFlash / 0.08));
      }
      drawUi(p, frame);
    },
    done() { return t >= duration; },
  };

  function drawUi(p, frame) {
    p.reset();
    p.place(0, 0);
    // a banner is the phase call-out: the words that tell the player the fight just changed
    if (banner) {
      const u = (t - banner.t0) / Math.max(0.1, banner.dur);
      if (u >= 0 && u <= 1) {
        const a = Math.min(1, u * 7) * Math.min(1, (1 - u) * 4);
        const big = banner.kind === "phase" ? 3 : 2;
        const y = Math.round(H * 0.24 - u * 5);
        p.text(banner.text.toUpperCase(), W / 2, y, UI.lit, { font: "big", scale: big, align: "center", outline: UI.ink, shadow: UI.ink, a });
        if (banner.sub) p.text(banner.sub, W / 2, y + 7 * big + 6, UI.gold, { font: "mini", scale: 2, align: "center", outline: UI.ink, a: a * 0.9 });
        p.glow(W / 2, y + 4 * big, 48, UI.gold, 0.16 * a);
      }
    }
    if (!boss || E.showBossBar === false) return;
    const name = boss.name ?? boss.mod.meta?.name ?? "BOSS";
    const bw = Math.min(228, W - 56), x = Math.round((W - bw) / 2), y = 25;
    p.text(name.toUpperCase(), W / 2, 7, UI.lit, { font: "big", scale: 2, align: "center", outline: UI.ink, shadow: UI.ink });
    p.rect(x - 2, y - 2, bw + 4, 9, UI.ink);
    p.rect(x - 1, y - 1, bw + 2, 7, UI.edge);
    p.rect(x, y, bw, 5, UI.barBg);
    const w = Math.max(0, Math.round(bw * clamp(hp)));
    if (w > 0) {
      p.rect(x, y, w, 5, UI.bar);
      p.rect(x, y, w, 1, UI.barLit);
      p.rect(x, y + 4, w, 1, UI.barDark);
    }
    for (const ph of phases) {
      const px = Math.round(x + bw * clamp(ph.hp ?? 1));
      p.rect(px, y - 1, 1, 7, UI.ink);
      p.rect(px, y - 1, 1, 1, UI.edge);
    }
    if (phases.length) p.text(`${Math.max(1, phases.indexOf(api.phase) + 1)} / ${phases.length}`, x + bw + 6, y - 1, UI.phase, { font: "mini", scale: 1 });
  }

  return api;
}
