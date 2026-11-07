// The gallery: every effect playing live from its own code. Tiles start when they scroll into view; a click
// opens one effect with its options, a sprite sheet and the code to use it.

import { effects, categories, provenance } from "../src/fx/index.js";
import { createFrame, clearFrame, createFx, createAct, actBounds, composite, backdrop, drawActor, painterFor, stockActor, actorAlphaOf, PAL, BACKDROPS, CHARACTERS, characterOf, ARMORY, WEAPON_CLASSES, weaponOf } from "../src/core/index.js";
import { LANGS, detectLang, getLang, setLang, t as tr, applyStatic, categoryText, characterText, characterOption, weaponText, weaponOption, weaponClassText, backdropText } from "./i18n.js";
import { THEMES, themeOfCat } from "./themes.js";

const REPO = "https://github.com/hanhandi-git/pixelfx-extended";
const FX = Object.entries(effects).map(([id, mod]) => {
  const meta = { fps: 30, bg: "dark", loop: false, duration: 1, tags: [], options: {}, ...mod.meta };
  return { id, cat: id.split("/")[0], name: meta.name, prov: provenance[id] ?? "original", mod: { ...mod, meta }, meta };
});
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
// full-screen effects (transitions, weather, impact frames) fill a 16:9 stage edge to edge instead of floating in it
const isScreen = (fx) => fx.meta.size[0] >= 320 && Math.abs(fx.meta.size[0] / fx.meta.size[1] - 16 / 9) < 0.05;
const $ = (s) => document.querySelector(s);
function el(tag, props = {}, kids = []) {
  const e = Object.assign(document.createElement(tag), props);
  for (const k of [].concat(kids)) e.append(k);
  return e;
}

// ---- a live effect on a canvas, at an integer scale that fits the stage
class Player {
  constructor(canvas, fx, aspect, pad, options = {}) {
    Object.assign(this, { canvas, fx, ctx: canvas.getContext("2d"), opts: { ...options }, flip: false, actor: true, speed: 1, playing: true });
    this.bg = fx.meta.bg;
    this.layout(aspect, pad);
  }
  // the art-pixel stage: the effect's canvas plus some room, stretched to the tile's aspect; CSS scales it up
  layout(aspect, pad) {
    Object.assign(this, { aspect, pad });
    // an act needs room for the whole performance, not just the effect's canvas
    const acted = this.acted, b = acted ? { ...actBounds(this.fx.mod, this.opts) } : null;
    // an act happens above the floor: don't spend the tile on bricks
    if (b) b.y1 = Math.min(b.y1, 22);
    const [w, h] = acted ? [b.x1 - b.x0, b.y1 - b.y0] : this.fx.meta.size, [ox, oy] = acted ? [-b.x0, -b.y0] : this.fx.meta.origin;
    this.W = Math.ceil(Math.max(w * (acted ? Math.min(pad, 1.1) : pad), h * (acted ? Math.min(pad, 1.1) : pad) * aspect));
    this.H = Math.ceil(this.W / aspect);
    this.artW = w;
    this.artH = h;
    this.x = Math.floor((this.W - w) / 2) + ox;
    // an act stands near the bottom of its tile, with the room above it
    this.y = acted ? Math.max(oy + 2, this.H - b.y1 - 2) : Math.floor((this.H - h) / 2) + oy;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    // shrinking pixel art nearest-neighbour drops whole 1 px lines; smooth it only when it has to shrink
    const shown = this.canvas.getBoundingClientRect().width * devicePixelRatio;
    this.canvas.style.imageRendering = shown && shown < this.W ? "auto" : "";
    this.frame = createFrame(this.W, this.H);
    this.img = this.ctx.createImageData(this.W, this.H);
    this.setBg(this.bg);
    this.restart();
  }
  setBg(kind) {
    this.bg = kind;
    this.bgBuf = kind === "none" ? null : backdrop(kind, this.W, this.H, this.y);
    this.dirty = true;
  }
  setCharacter(id) {
    this.opts.character = id;
    this.layout(this.aspect, this.pad);
  }
  // an effect with an act plays it, unless the character is switched off
  get acted() {
    return !!this.fx.mod.act && this.actor;
  }
  // flip mirrors around local (0, 0); shift the anchor so the art box [0, artW) stays on the stage
  get anchorX() {
    return this.flip ? this.x + this.artW - 1 : this.x;
  }
  restart() {
    this.inst = (this.acted ? createAct : createFx)(this.fx.mod, { x: this.anchorX, y: this.y, flip: this.flip, ...this.opts });
    this.acc = 0;
    this.wait = 0;
    this.dirty = true;
  }
  tick(dt) {
    const m = this.fx.meta, step = 1 / m.fps;
    if (this.playing) this.acc = Math.min(this.acc + dt * this.speed, 0.25);
    let moved = false;
    while (this.acc >= step) {
      this.acc -= step;
      if (!m.loop && (this.acted ? this.inst.done() : this.inst.t >= m.duration)) {
        this.wait += step;
        if (this.wait > 0.45) this.restart();
      } else this.inst.update(step);
      moved = true;
    }
    if (moved || this.dirty) this.render();
  }
  seek(t) {
    this.restart();
    this.inst.update(t);
    this.render();
  }
  render() {
    const f = clearFrame(this.frame);
    if (this.acted) {
      this.inst.draw(f);
      composite(f, this.img.data, this.bgBuf);
      const [sx, sy] = this.inst.shake;
      if (sx || sy) this.ctx.clearRect(0, 0, this.W, this.H);
      this.ctx.putImageData(this.img, sx, sy);
      this.dirty = false;
      return;
    }
    this.inst.draw(f, "back");
    const m = this.fx.meta, tt = m.loop ? this.inst.t % m.duration : Math.min(this.inst.t, m.duration);
    if (m.actor && this.actor) drawActor(painterFor(f).place(this.anchorX, this.y, this.flip), this.inst.options.actor ?? stockActor(), actorAlphaOf(this.fx.mod, tt, this.inst.options));
    this.inst.draw(f, "front");
    composite(f, this.img.data, this.bgBuf);
    this.ctx.putImageData(this.img, 0, 0);
    this.dirty = false;
  }
}

// ---- tiles
const tiles = [];
const sections = [];
function build() {
  $("#count").textContent = FX.length;
  const main = $("#grid");
  for (const c of categories) {
    const list = FX.filter((f) => f.cat === c.id);
    if (!list.length) continue;
    const grid = el("div", { className: "grid" });
    const head = el("div", { className: "section-head" }, [el("h2"), el("p")]);
    const sec = el("section", { id: c.id }, [head, grid]);
    sections.push({ c, sec, head: head.children[0], blurb: head.children[1], list, theme: themeOfCat(c.id) });
    for (const fx of list) {
      const cv = el("canvas", { ariaLabel: fx.name });
      const b = fx.mod.act ? actBounds(fx.mod) : null, [fw, fh] = b ? [b.x1 - b.x0, b.y1 - b.y0] : fx.meta.size;
      const tag = fx.prov === "new" ? el("em", { className: "origin-tag new" }) : null;
      const small = el("small");
      // every tile carries its name on a one-click copy button; it must not open the effect
      const copy = el("button", { className: "tile-copy", type: "button" });
      copy.setAttribute("aria-label", tr("tile.copy.aria", { name: fx.name }));
      copy.title = tr("tile.copy.aria", { name: fx.name });
      const fig = el("figure", { className: isScreen(fx) ? "tile big screen" : fw > 200 || fh > 170 || (b && (fw > 130 || fx.mod.act.target || fx.mod.act.targets)) ? "tile big" : "tile", tabIndex: 0 }, [
        el("div", { className: "stage" }, [cv, copy]),
        el("figcaption", {}, [
          el("b", { textContent: fx.name }),
          el("span", { className: "tile-meta" }, [...(tag ? [tag] : []), small]),
        ]),
      ]);
      const t = { fx, fig, cv, player: null, visible: false, hover: false, small, tag, copy };
      copy.addEventListener("click", (e) => {
        e.stopPropagation();
        copyName(t);
      });
      copy.addEventListener("keydown", (e) => e.stopPropagation());
      fig.addEventListener("click", () => openDetail(fx));
      fig.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openDetail(fx)));
      fig.addEventListener("pointerenter", () => (t.hover = true));
      fig.addEventListener("pointerleave", () => (t.hover = false));
      grid.append(fig);
      tiles.push(t);
    }
    main.append(sec);
  }
  updateSections();
  updateTiles();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const t = tiles.find((x) => x.fig === e.target);
      t.visible = e.isIntersecting;
      if (t.visible && !t.player) {
        t.player = isScreen(t.fx) ? new Player(t.cv, t.fx, 16 / 9, 1, { character: state.character }) : new Player(t.cv, t.fx, 6 / 5, 1.25, { character: state.character });
        if (reduced) t.player.seek(t.fx.meta.duration * 0.4);
      }
    }
  }, { rootMargin: "200px" });
  tiles.forEach((t) => io.observe(t.fig));
}

// ---- copy an effect name from its tile: the async clipboard on a secure page, execCommand on plain http
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
  document.body.append(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  ta.remove();
  return ok;
}
async function copyName(t) {
  if (!(await copyText(t.fx.name))) return;
  const btn = t.copy;
  btn.textContent = "✓";
  btn.classList.add("done");
  clearTimeout(t.copyTimer);
  t.copyTimer = setTimeout(() => {
    btn.textContent = tr("tile.copy");
    btn.classList.remove("done");
  }, 1200);
  const status = $("#copy-status");
  if (status) status.textContent = tr("copy.status", { name: t.fx.name });
}

// ---- language: the page speaks 中文, English and 日本語. Switching swaps the words in place, live —
// no reload, so the scroll position, the open effect and the playing previews all stay put.
function updateSections() {
  for (const s of sections) {
    const text = categoryText(s.c);
    s.head.textContent = text.name + tr("section.dot");
    s.blurb.textContent = text.blurb;
  }
}
function updateTiles() {
  for (const t of tiles) {
    t.small.textContent = t.fx.meta.loop ? tr("tile.loop") : `${+t.fx.meta.duration.toFixed(2)}s`;
    if (t.tag) t.tag.textContent = tr("tag.new");
    t.copy.textContent = t.copy.classList.contains("done") ? "✓" : tr("tile.copy");
    t.copy.setAttribute("aria-label", tr("tile.copy.aria", { name: t.fx.name }));
    t.copy.title = t.copy.getAttribute("aria-label");
  }
}
function syncLang() {
  for (const b of $("#langs").children) b.setAttribute("aria-pressed", String(b.dataset.lang === getLang()));
}
function applyLanguage(id) {
  if (!LANGS.some((l) => l.id === id)) return;
  setLang(id);
  const url = new URL(location.href);
  url.searchParams.set("lang", getLang());
  history.replaceState(null, "", url);
  applyStatic();
  syncLang();
  chips();
  updateSections();
  updateTiles();
  rebuildCast();
  if (detail) refreshDetail();
  filter();
}
function wireLang() {
  for (const b of $("#langs").children) b.addEventListener("click", () => applyLanguage(b.dataset.lang));
  syncLang();
}

// ---- filters
const initialParams = new URLSearchParams(location.search), initialSource = initialParams.get("source"), initialTheme = initialParams.get("theme");
const THEME_IDS = ["all", "classic", ...THEMES.map((t) => t.id)];
const state = { cat: "all", theme: THEME_IDS.includes(initialTheme) ? initialTheme : "all", q: "", prov: ["original", "new"].includes(initialSource) ? initialSource : "all", character: characterOf(initialParams.get("character")).id, weapon: weaponOf(initialParams.get("weapon"))?.id ?? "sword" };
let castPreview = null;
function buildCharacters() {
  $("#cast-weapon").addEventListener("change", (event) => {
    state.weapon = event.target.value;
    const url = new URL(location.href); url.searchParams.set("weapon", state.weapon);
    history.replaceState(null, "", url);
    resetCastPreview(); updateCharacters();
  });
  rebuildCast();
  resetCastPreview();
  $("#cast-replay").addEventListener("click", () => {
    if (reduced) castPreview.seek(0.37);
    else { castPreview.restart(); castPreview.render(); }
  });
}
// choice buttons, weapon groups and the role line — rebuilt whenever the language changes
function rebuildCast() {
  const picker = $("#gallery-characters");
  const intro = document.querySelector(".cast-intro");
  if (intro) intro.textContent = tr("cast.intro", { n: CHARACTERS.length });
  picker.replaceChildren();
  for (const c of CHARACTERS) {
    const text = characterText(c);
    const choice = el("button", { className: "cast-choice", type: "button", title: `${text.label} · ${text.role}` });
    choice.setAttribute("role", "radio"); choice.setAttribute("aria-label", characterOption(c));
    choice.dataset.character = c.id;
    choice.style.setProperty("--cast-accent", c.accent);
    const portrait = el("canvas", { width: 40, height: 48 });
    portrait.setAttribute("aria-hidden", "true");
    const frame = createFrame(40, 48), ctx = portrait.getContext("2d"), img = ctx.createImageData(40, 48);
    drawActor(painterFor(frame).place(20, 45), stockActor(2, c.id));
    composite(frame, img.data, null); ctx.putImageData(img, 0, 0);
    choice.append(portrait, el("span", { textContent: text.label }));
    if (c.id !== "dummy") choice.append(el("em", { className: "cast-new", textContent: tr("tag.new") }));
    choice.addEventListener("click", () => chooseCharacter(c.id));
    choice.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const i = CHARACTERS.findIndex((v) => v.id === state.character);
      const next = event.key === "Home" ? 0 : event.key === "End" ? CHARACTERS.length - 1 : (i + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + CHARACTERS.length) % CHARACTERS.length;
      chooseCharacter(CHARACTERS[next].id); picker.children[next].focus();
    });
    picker.append(choice);
  }
  $("#cast-weapon").replaceChildren(...WEAPON_CLASSES.map((klass) => el("optgroup", { label: weaponClassText(klass) },
    ARMORY.filter((w) => w.class === klass.id).map((w) => el("option", { value: w.id, textContent: weaponOption(w) })))));
  updateCharacters();
}
function resetCastPreview() {
  const weapon = weaponOf(state.weapon);
  castPreview = new Player($("#cast-stage"), FX.find((fx) => fx.id === weapon.fx), 16 / 10, 1.1, { character: state.character });
  if (reduced) castPreview.seek(0.37);
  else castPreview.render();
}
function updateCharacters() {
  for (const choice of $("#gallery-characters").children) {
    const selected = choice.dataset.character === state.character;
    choice.setAttribute("aria-checked", String(selected)); choice.tabIndex = selected ? 0 : -1;
  }
  const weapon = weaponOf(state.weapon);
  $("#cast-weapon").value = weapon.id;
  $("#cast-role").textContent = `${characterText(characterOf(state.character)).label} · ${weaponText(weapon)}`;
}
function chooseCharacter(id) {
  state.character = characterOf(id).id;
  const url = new URL(location.href); url.searchParams.set("character", state.character);
  history.replaceState(null, "", url);
  castPreview.setCharacter(state.character);
  if (reduced) castPreview.seek(0.37);
  else castPreview.render();
  for (const t of tiles) if (t.player && (t.fx.meta.actor || t.fx.mod.act)) {
    t.player.setCharacter(state.character);
    if (reduced) t.player.seek(t.fx.meta.duration * 0.4);
    else t.player.render();
  }
  if (detail) {
    detail.setCharacter(state.character); detail.render();
    $("#d-character").value = state.character; code(detail.fx);
  }
  updateCharacters();
}
// the categories a theme owns: null means "every category", which is what the all-themes chip means
function themeSections(id = state.theme) {
  return id === "all" ? sections : sections.filter((s) => s.theme === id);
}
const tally = (list) => list.reduce((n, s) => n + s.list.length, 0);

function chips() {
  const themeBox = $("#themes"), box = $("#chips"), srcBox = $("#origins");
  if (!themeBox || !srcBox) return;
  themeBox.replaceChildren();
  box.replaceChildren();
  srcBox.replaceChildren();
  const mk = (parent, { id, label, n, field, pressed, cls = "", onPick }) => {
    const b = el("button", { className: `chip ${cls}`.trim(), type: "button" }, [label, el("span", { textContent: n })]);
    b.dataset[field] = id;
    b.setAttribute("aria-pressed", String(pressed));
    b.addEventListener("click", onPick);
    parent.append(b);
    return b;
  };
  // themes first: a work can own several categories, so pick the series and the material list narrows to it
  mk(themeBox, { id: "all", label: tr("theme.all"), n: FX.length, field: "theme", pressed: state.theme === "all", cls: "theme", onPick: () => setTheme("all") });
  for (const t of THEMES) {
    const list = themeSections(t.id);
    if (!list.length) continue;
    mk(themeBox, { id: t.id, label: tr(`theme.${t.id}`), n: tally(list), field: "theme", pressed: state.theme === t.id, cls: "theme", onPick: () => setTheme(t.id) });
  }
  const classic = themeSections("classic");
  if (classic.length) mk(themeBox, { id: "classic", label: tr("theme.classic"), n: tally(classic), field: "theme", pressed: state.theme === "classic", cls: "theme", onPick: () => setTheme("classic") });

  const shown = themeSections();
  mk(box, { id: "all", label: tr("chip.all"), n: tally(shown), field: "cat", pressed: state.cat === "all", onPick: () => setCat("all") });
  for (const s of shown) mk(box, { id: s.c.id, label: categoryText(s.c).name, n: s.list.length, field: "cat", pressed: state.cat === s.c.id, onPick: () => setCat(s.c.id) });

  mk(srcBox, { id: "all", label: tr("prov.all"), n: FX.length, field: "origin", pressed: state.prov === "all", cls: "origin", onPick: () => setProv("all") });
  mk(srcBox, { id: "original", label: tr("prov.original"), n: FX.filter((f) => f.prov === "original").length, field: "origin", pressed: state.prov === "original", cls: "origin", onPick: () => setProv("original") });
  mk(srcBox, { id: "new", label: tr("prov.new"), n: FX.filter((f) => f.prov === "new").length, field: "origin", pressed: state.prov === "new", cls: "origin", onPick: () => setProv("new") });
}

function setTheme(id) {
  state.theme = THEME_IDS.includes(id) ? id : "all";
  // a category that the new theme does not own can't stay selected
  if (!themeSections().some((s) => s.c.id === state.cat)) state.cat = "all";
  chips();
  const url = new URL(location.href);
  if (state.theme === "all") url.searchParams.delete("theme");
  else url.searchParams.set("theme", state.theme);
  url.hash = state.cat === "all" ? "" : state.cat;
  history.replaceState(null, "", url);
  filter();
  window.scrollTo({ top: 0 });
}

function setCat(id, fromHash = false) {
  const hit = sections.find((s) => s.c.id === id);
  state.cat = hit ? id : "all";
  // deep links land on a category, so open the theme that owns it too
  if (hit && hit.theme !== "classic" && hit.theme !== state.theme) {
    state.theme = hit.theme;
    chips();
  }
  document.querySelectorAll(".chip[data-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
  if (!fromHash) {
    const url = new URL(location.href);
    url.hash = state.cat === "all" ? "" : state.cat;
    history.replaceState(null, "", url);
  }
  filter();
  if (!fromHash) window.scrollTo({ top: 0 });
}
function setProv(id) {
  state.prov = ["all", "original", "new"].includes(id) ? id : "all";
  document.querySelectorAll(".chip[data-origin]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.origin === state.prov)));
  const url = new URL(location.href);
  if (state.prov === "all") url.searchParams.delete("source");
  else url.searchParams.set("source", state.prov);
  history.replaceState(null, "", url);
  filter();
}
function filter() {
  const q = state.q.trim().toLowerCase();
  const inTheme = new Set(themeSections().map((s) => s.c.id));
  let shown = 0;
  for (const s of sections) {
    let any = false;
    for (const fx of s.list) {
      const t = tiles.find((x) => x.fx === fx);
      // the category's localized name is searchable too, so "火焰" finds the fire section
      const hit = inTheme.has(s.c.id) && (state.cat === "all" || state.cat === s.c.id) && (state.prov === "all" || fx.prov === state.prov) && (!q || [fx.id, fx.name, fx.prov, categoryText(s.c).name, fx.meta.desc, ...fx.meta.tags].join(" ").toLowerCase().includes(q));
      t.fig.hidden = !hit;
      any ||= hit;
      shown += hit;
    }
    s.sec.hidden = !any;
  }
  $("#none").hidden = shown > 0;
}

// ---- detail
let detail = null;
function openDetail(fx) {
  const d = $("#detail");
  const big = $("#big"), screen = isScreen(fx);
  big.parentElement.classList.toggle("screen", screen);
  detail = screen ? new Player(big, fx, 16 / 9, 1, { character: state.character }) : new Player(big, fx, 16 / 10, 1.6, { character: state.character });
  fillDetail();
  d.showModal();
  d.scrollTop = 0;
}
// the sheet's words and controls; called on open and again when the language changes
function fillDetail() {
  const fx = detail.fx, m = fx.meta;
  $("#d-name").textContent = m.name;
  $("#d-id").textContent = fx.id;
  $("#d-desc").textContent = m.desc;
  $("#d-facts").replaceChildren(...facts());
  $("#d-bg").replaceChildren(...BACKDROPS.concat("none").map((b) => btn(backdropText(b), () => detail.setBg(b), b === detail.bg, "bg")));
  $("#d-speed").replaceChildren(...[0.25, 0.5, 1].map((s) => btn(`${s}×`, () => (detail.speed = s), s === detail.speed, "speed")));
  const pal = $("#d-pal");
  pal.replaceChildren(el("option", { value: "", textContent: tr("detail.palette.own") }), ...Object.keys(PAL).map((k) => el("option", { value: k, textContent: k })));
  pal.value = Object.keys(PAL).find((k) => detail.opts.palette === PAL[k]) ?? "";
  const character = $("#d-character");
  character.replaceChildren(...CHARACTERS.map((c) => el("option", { value: c.id, textContent: characterOption(c) })));
  character.value = state.character;
  character.disabled = !m.actor && !fx.mod.act;
  $("#d-actor").hidden = !m.actor;
  $("#d-actor").setAttribute("aria-pressed", String(detail.actor));
  $("#d-flip").setAttribute("aria-pressed", String(detail.flip));
  $("#d-play").setAttribute("aria-pressed", String(detail.playing));
  $("#d-play").textContent = detail.playing ? tr("control.pause") : tr("control.play");
  $("#d-copy").textContent = tr("detail.copy");
  $("#d-sheet").replaceChildren();
  code(fx);
}
function refreshDetail() {
  applyStatic($("#detail"));
  fillDetail();
}
function facts() {
  const fx = detail.fx, m = fx.meta;
  const frames = Math.round(m.duration * m.fps) + (m.loop ? 0 : 1);
  const rows = [
    [tr("facts.source"), tr(`prov.${fx.prov}`)],
    [tr("facts.kind"), m.loop ? tr("kind.loop") : tr("kind.oneshot")],
    [tr("facts.length"), tr("facts.length.value", { t: +m.duration.toFixed(2), frames, fps: m.fps })],
    ...(fx.mod.act ? [[tr("facts.acted"), actFacts(fx.mod)]] : []),
    [tr("facts.canvas"), `${m.size[0]} × ${m.size[1]} px`],
    [tr("facts.tags"), m.tags.join(", ")],
  ];
  return rows.flatMap(([k, v]) => [el("dt", { textContent: k }), el("dd", { textContent: v })]);
}
// what the body does around the effect, in a line: the wind-up, the freeze, the recovery
function actFacts(mod) {
  const k = mod.act.poses, lead = Math.max(0, -k[0][0]), end = k[k.length - 1][0] - mod.meta.duration, hits = (mod.act.hits ?? []).filter((h) => h.stop);
  const parts = [];
  if (lead > 0) parts.push(tr("act.windup", { t: lead.toFixed(2) }));
  if (hits.length) parts.push(hits.length === 1 ? tr("act.freeze", { ms: Math.round(hits[0].stop * 1000), t: hits[0].t.toFixed(2) }) : tr("act.freezes", { n: hits.length, t: hits[0].t.toFixed(2) }));
  if (!mod.meta.loop && end > 0.02) parts.push(tr("act.recovery", { t: end.toFixed(2) }));
  return parts.join(tr("act.sep")) || tr("act.none");
}
function btn(label, fn, on, group) {
  const b = el("button", { className: "btn", type: "button", textContent: label });
  b.setAttribute("aria-pressed", String(!!on));
  b.addEventListener("click", () => {
    if (group) b.parentElement.querySelectorAll(".btn").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    fn();
  });
  return b;
}
function code(fx) {
  const v = fx.id.split("/")[1].replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const opts = { x: 160, y: 120, ...(detail.opts.character && detail.opts.character !== "dummy" ? { character: detail.opts.character } : {}), ...(detail.opts.palette ? { palette: "[…]" } : {}), ...(detail.flip ? { flip: true } : {}) };
  const acted = !!fx.mod.act, make = acted ? "createAct" : "createFx";
  $("#d-code").textContent = [
    `import { createFrame, ${make}, composite } from "pixelfx";`,
    `import * as ${v} from "pixelfx/fx/${fx.id}";`,
    ``,
    `const frame = createFrame(320, 180);`,
    `const fx = ${make}(${v}, ${JSON.stringify(opts).replace(/"\[…\]"/, "[…]").replace(/"(\w+)":/g, "$1: ").replace(/,/g, ", ")});`,
    ``,
    `// every tick`,
    `fx.update(dt);`,
    `fx.draw(frame);          // color + light buffers`,
    `composite(frame, imageData.data, null);`,
    ...(acted ? [``, `// your own character? read the timing: ${v}.act (poses, hits, freezes)`] : []),
  ].join("\n");
  $("#d-src").href = `${REPO}/blob/main/src/fx/${fx.id}.js`;
}
function sheet() {
  const fx = detail.fx, m = fx.meta, [w, h] = m.size, n = Math.max(1, Math.round(m.duration * m.fps) + (m.loop ? 0 : 1));
  const cols = Math.min(n, Math.max(1, Math.ceil(Math.sqrt((n * h) / w)))), rows = Math.ceil(n / cols);
  const cv = el("canvas", { width: cols * w, height: rows * h }), ctx = cv.getContext("2d");
  const frame = createFrame(w, h), img = ctx.createImageData(w, h);
  const ax = detail.flip ? m.origin[0] + w - 1 : m.origin[0];
  const inst = createFx(fx.mod, { x: ax, y: m.origin[1], ...detail.opts, flip: detail.flip });
  for (let i = 0; i < n; i++) {
    if (i) inst.update(1 / m.fps);
    inst.draw(clearFrame(frame));
    composite(frame, img.data, null);
    ctx.putImageData(img, (i % cols) * w, Math.floor(i / cols) * h);
  }
  const k = Math.max(1, Math.min(4, Math.floor(1100 / (cols * w))));
  const pic = el("img", { src: cv.toDataURL("image/png"), alt: `${m.name} sprite sheet`, width: cols * w * k, height: rows * h * k });
  $("#d-sheet").replaceChildren(pic, el("p", { textContent: tr("sheet.text", { n, w, h, cols, fps: m.fps, plays: m.loop ? tr("sheet.loops") : tr("sheet.once"), cmd: `node tools/render.mjs ${fx.id} --sheet` }) }));
}
function wireDetail() {
  const d = $("#detail");
  $("#d-close").addEventListener("click", () => d.close());
  d.addEventListener("close", () => (detail = null));
  d.addEventListener("click", (e) => e.target === d && d.close());
  $("#d-play").addEventListener("click", (e) => {
    detail.playing = !detail.playing;
    e.target.setAttribute("aria-pressed", String(detail.playing));
    e.target.textContent = detail.playing ? tr("control.pause") : tr("control.play");
  });
  $("#d-again").addEventListener("click", () => detail.restart());
  $("#d-flip").addEventListener("click", (e) => {
    detail.flip = !detail.flip;
    e.target.setAttribute("aria-pressed", String(detail.flip));
    detail.restart();
    code(detail.fx);
  });
  $("#d-actor").addEventListener("click", (e) => {
    detail.actor = !detail.actor;
    e.target.setAttribute("aria-pressed", String(detail.actor));
    // with an act, the character is the performance: off shows the effect alone, as a sprite sheet has it
    if (detail.fx.mod.act) detail.layout(detail.aspect, detail.pad);
    detail.dirty = true;
  });
  $("#d-seed").addEventListener("click", () => {
    detail.opts.seed = 1 + Math.floor(Math.random() * 9999);
    detail.restart();
  });
  $("#d-pal").addEventListener("change", (e) => {
    if (e.target.value) detail.opts.palette = PAL[e.target.value];
    else delete detail.opts.palette;
    detail.restart();
    code(detail.fx);
  });
  $("#d-character").addEventListener("change", (e) => {
    chooseCharacter(e.target.value);
  });
  $("#d-make").addEventListener("click", sheet);
  $("#d-copy").addEventListener("click", async (e) => {
    const text = $("#d-code").textContent;
    try {
      await navigator.clipboard.writeText(text);
      e.target.textContent = tr("detail.copied");
    } catch {
      getSelection().selectAllChildren($("#d-code"));
      e.target.textContent = tr("detail.selected");
    }
    setTimeout(() => (e.target.textContent = tr("detail.copy")), 1400);
  });
}

// ---- the clock
let last = performance.now();
function frameLoop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (detail) detail.tick(dt);
  else {
    if (!reduced) castPreview?.tick(dt);
    for (const t of tiles) if (t.visible && t.player && !t.fig.hidden && (!reduced || t.hover)) t.player.tick(dt);
  }
  requestAnimationFrame(frameLoop);
}

// The gallery owns the page when its grid exists.
if ($("#grid")) {
  setLang(detectLang());
  applyStatic();
  build();
  chips();
  wireDetail();
  wireLang();
  buildCharacters();
  $("#q").addEventListener("input", (e) => {
    state.q = e.target.value;
    filter();
  });
  setCat(location.hash.slice(1) || "all", true);
  addEventListener("hashchange", () => setCat(location.hash.slice(1) || "all", true));
  requestAnimationFrame(frameLoop);
}

export { FX, Player, categories, isScreen };
