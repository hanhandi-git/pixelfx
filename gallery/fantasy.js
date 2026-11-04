// The fantasy gallery: play an encounter as a game would, with its map, minions, boss, attack effects, boss bar and
// phase banners all coming from the same timeline the tools render. URL: fantasy.html?enc=verdant-throne
import { encounters } from "../src/encounters/index.js";
import { createEncounter } from "../src/core/encounter.js";
import { createFrame, clearFrame, composite } from "../src/core/fx.js";

const $ = (s) => document.querySelector(s);
const defaults = { fps: 30, duration: 20, tags: [], size: [320, 180] };
const ENTRIES = Object.entries(encounters).map(([id, mod]) => ({ id, mod, meta: { ...defaults, ...mod.meta } })).sort((a, b) => a.meta.name.localeCompare(b.meta.name));
const state = { current: null, player: null };
const list = $("#encounter-list"), canvas = $("#stage"), ctx = canvas.getContext("2d");

function el(tag, props = {}, kids = []) {
  const e = Object.assign(document.createElement(tag), props);
  for (const k of [].concat(kids)) e.append(k);
  return e;
}

class Player {
  constructor(entry) {
    this.entry = entry;
    this.meta = entry.meta;
    this.E = entry.mod.encounter;
    this.W = this.E.w ?? this.meta.size?.[0] ?? 320;
    this.H = this.E.h ?? this.meta.size?.[1] ?? 180;
    canvas.width = this.W;
    canvas.height = this.H;
    this.frame = createFrame(this.W, this.H);
    this.img = ctx.createImageData(this.W, this.H);
    this.speed = Number($("#speed").value);
    this.playing = true;
    this.restart();
  }
  restart() {
    this.inst = createEncounter(this.entry.mod, { seed: 1 });
    this.acc = 0;
    this.wait = 0;
    this.playing = true;
    this.render();
    this.update();
  }
  tick(dt) {
    const step = 1 / (this.meta.fps || 30);
    if (this.playing) {
      this.acc = Math.min(this.acc + dt * this.speed, step * 10);
      let moved = false;
      while (this.acc >= step) {
        this.acc -= step;
        if (this.inst.done()) {
          this.wait += step;
          if (this.wait > 1.0) { this.restart(); return; }
        } else this.inst.update(step);
        moved = true;
      }
      if (moved) this.render();
    }
    this.update();
  }
  render() {
    const f = clearFrame(this.frame);
    this.inst.draw(f);
    composite(f, this.img.data, null);
    const [sx, sy] = this.inst.shake;
    if (sx || sy) ctx.clearRect(0, 0, this.W, this.H);
    ctx.putImageData(this.img, sx, sy);
  }
  seek(t) {
    this.restart();
    const step = 1 / (this.meta.fps || 30);
    while (this.inst.t < t && !this.inst.done()) this.inst.update(step);
    this.render();
    this.update();
  }
  update() {
    const d = this.inst.duration || this.meta.duration || 1, u = Math.min(1, this.inst.t / d);
    $("#track-fill").style.width = `${u * 100}%`;
    const ph = this.inst.phase;
    $("#phase-label").textContent = ph ? `${ph.name} · ${Math.round(this.inst.hp * 100)}%` : "";
    const name = ph?.name;
    document.querySelectorAll(".phase-chip").forEach((chip) => chip.setAttribute("aria-current", String(chip.dataset.name === name)));
    $("#play").textContent = this.playing ? "pause" : "play";
    $("#status").textContent = this.playing ? "playing" : "paused";
  }
}

function renderList() {
  list.replaceChildren();
  for (const entry of ENTRIES) {
    const b = el("button", { type: "button", className: "encounter-item" }, [
      el("strong", { textContent: entry.meta.name }),
      el("small", { textContent: `${entry.meta.duration}s · ${entry.meta.boss ? "boss" : "minions"}${entry.meta.map ? ` · ${entry.meta.map}` : ""}` }),
    ]);
    b.addEventListener("click", () => select(entry.id));
    b.dataset.id = entry.id;
    list.append(b);
  }
  $("#enc-count").textContent = `${ENTRIES.length}`;
}

function select(id, push = true) {
  const entry = ENTRIES.find((e) => e.id === id) ?? ENTRIES[0];
  if (!entry) return;
  state.current = entry;
  if (push) {
    const url = new URL(location.href);
    url.searchParams.set("enc", entry.id);
    history.replaceState(null, "", url);
  }
  document.querySelectorAll(".encounter-item").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === entry.id)));
  const meta = entry.meta, E = entry.mod.encounter;
  $("#enc-name").textContent = meta.name;
  $("#enc-id").textContent = entry.id;
  $("#enc-desc").textContent = meta.desc ?? "";
  const map = E.map?.meta?.name ?? meta.map ?? "—";
  const minions = E.mobs?.length ?? 0;
  const facts = [["map", map], ["minions", String(minions)], ["boss", E.boss?.name ?? meta.boss ?? "—"], ["length", `${meta.duration ?? E.duration}s`]];
  $("#facts").replaceChildren(...facts.flatMap(([k, v]) => [el("dt", { textContent: k }), el("dd", { textContent: v })]));
  const phases = E.phases ?? [];
  $("#phases").replaceChildren(...phases.map((p) => {
    const b = el("button", { type: "button", className: "phase-chip", textContent: `${p.name}` });
    b.dataset.at = p.at;
    b.dataset.name = p.name;
    b.title = `jump to ${p.at.toFixed(2)}s`;
    b.addEventListener("click", () => state.player?.seek(p.at + 0.01));
    return b;
  }));
  const marks = $("#track-marks");
  marks.replaceChildren();
  for (const p of phases) {
    const m = el("div", { className: "fg-track-mark phase", title: p.name });
    m.style.left = `${Math.min(100, (p.at / (meta.duration || E.duration || 1)) * 100)}%`;
    marks.append(m);
  }
  for (const c of E.timeline ?? []) {
    if (c.type !== "attack") continue;
    const m = el("div", { className: "fg-track-mark", title: `${c.fx?.meta?.name ?? "attack"} @ ${c.at.toFixed(2)}s` });
    m.style.left = `${Math.min(100, (c.at / (meta.duration || E.duration || 1)) * 100)}%`;
    marks.append(m);
  }
  state.player = new Player(entry);
  $("#play").textContent = "pause";
  $("#status").textContent = "playing";
}

$("#play").addEventListener("click", () => {
  if (!state.player) return;
  state.player.playing = !state.player.playing;
  state.player.update();
});
$("#again").addEventListener("click", () => state.player?.restart());
$("#speed").addEventListener("change", (e) => { if (state.player) state.player.speed = Number(e.target.value); });
$("#prev").addEventListener("click", () => {
  const i = ENTRIES.findIndex((e) => e.id === state.current?.id);
  select(ENTRIES[(i - 1 + ENTRIES.length) % ENTRIES.length].id);
});
$("#next").addEventListener("click", () => {
  const i = ENTRIES.findIndex((e) => e.id === state.current?.id);
  select(ENTRIES[(i + 1) % ENTRIES.length].id);
});

renderList();
const wanted = new URLSearchParams(location.search).get("enc");
select(wanted && ENTRIES.some((e) => e.id === wanted) ? wanted : ENTRIES[0]?.id, false);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  state.player?.tick(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
