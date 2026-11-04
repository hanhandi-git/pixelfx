import { FX, Player, categories } from "./app.js";

const $ = (selector) => document.querySelector(selector);
const requestedId = new URLSearchParams(location.search).get("fx");
const initialIndex = Math.max(0, FX.findIndex((fx) => fx.id === requestedId));
const state = { category: "all", query: "", selected: initialIndex, player: null, filtered: FX };
const list = $("#effect-list"), categoryBar = $("#categories"), canvas = $("#stage");

function text(node, value) { node.textContent = value; return node; }
function button(label, className = "") {
  const node = document.createElement("button");
  node.type = "button";
  node.className = className;
  node.textContent = label;
  return node;
}
function current() { return state.filtered[state.selected] ?? null; }
function matches(fx) {
  const q = state.query.trim().toLowerCase();
  return (state.category === "all" || fx.cat === state.category) && (!q || [fx.id, fx.name, fx.meta.desc, ...fx.meta.tags].join(" ").toLowerCase().includes(q));
}

function renderCategories() {
  categoryBar.replaceChildren();
  const all = [{ id: "all", name: "all", count: FX.length }, ...categories.map((category) => ({ id: category.id, name: category.name, count: FX.filter((fx) => fx.cat === category.id).length })).filter((category) => category.count)];
  for (const category of all) {
    const b = button(`${category.name} ${category.count}`, "category");
    b.setAttribute("aria-pressed", String(category.id === state.category));
    b.addEventListener("click", () => {
      state.category = category.id;
      state.selected = 0;
      renderCategories();
      renderList();
      select(0);
    });
    categoryBar.append(b);
  }
}

function renderList() {
  state.filtered = FX.filter(matches);
  list.replaceChildren();
  state.filtered.forEach((fx, index) => {
    const item = button("", "effect-item");
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(index === state.selected));
    item.append(text(document.createElement("span"), String(index + 1).padStart(3, "0")), text(document.createElement("strong"), fx.name), text(document.createElement("small"), fx.meta.loop ? "loop" : `${+fx.meta.duration.toFixed(2)}s`));
    item.addEventListener("click", () => select(index));
    list.append(item);
  });
  $("#count").textContent = `${FX.length} effects · ${state.filtered.length} shown`;
}

function select(index) {
  if (!state.filtered.length) {
    state.player = null;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    $("#effect-name").textContent = "No matching effects";
    $("#effect-id").textContent = "Try another search or category.";
    $("#description").textContent = "";
    $("#facts").replaceChildren();
    $("#status").textContent = "no results";
    $("#play").textContent = "play";
    document.querySelectorAll(".controls button, #speed").forEach((control) => control.disabled = true);
    return;
  }
  document.querySelectorAll(".controls button, #speed").forEach((control) => control.disabled = false);
  state.selected = Math.max(0, Math.min(index, state.filtered.length - 1));
  const fx = current();
  const url = new URL(location.href);
  url.searchParams.set("fx", fx.id);
  history.replaceState(null, "", url);
  document.querySelectorAll(".effect-item").forEach((item, i) => item.setAttribute("aria-selected", String(i === state.selected)));
  state.player = new Player(canvas, fx, 16 / 10, 1.6);
  state.player.speed = Number($("#speed").value);
  state.player.render();
  updateDetails(fx);
  $("#play").textContent = "pause";
  $("#status").textContent = "playing";
}

function updateDetails(fx) {
  $("#effect-name").textContent = fx.name;
  $("#effect-id").textContent = fx.id;
  $("#description").textContent = fx.meta.desc;
  const facts = [["kind", fx.meta.loop ? "loop" : "one-shot"], ["duration", `${fx.meta.duration}s`], ["frames", `${Math.round(fx.meta.duration * fx.meta.fps) + (fx.meta.loop ? 0 : 1)} @ ${fx.meta.fps} fps`], ["canvas", `${fx.meta.size[0]} × ${fx.meta.size[1]} px`], ["tags", fx.meta.tags.join(" · ")]];
  $("#facts").replaceChildren(...facts.flatMap(([key, value]) => [text(document.createElement("dt"), key), text(document.createElement("dd"), value)]));
}

$("#search").addEventListener("input", (event) => {
  state.query = event.target.value;
  state.selected = 0;
  renderList();
  select(0);
});
$("#play").addEventListener("click", (event) => {
  if (!state.player) return;
  state.player.playing = !state.player.playing;
  event.currentTarget.textContent = state.player.playing ? "pause" : "play";
  $("#status").textContent = state.player.playing ? "playing" : "paused";
});
$("#again").addEventListener("click", () => { if (state.player) { state.player.restart(); state.player.playing = true; $("#play").textContent = "pause"; $("#status").textContent = "playing"; } });
$("#previous").addEventListener("click", () => select((state.selected - 1 + state.filtered.length) % state.filtered.length));
$("#next").addEventListener("click", () => select((state.selected + 1) % state.filtered.length));
$("#speed").addEventListener("change", (event) => { if (state.player) state.player.speed = Number(event.target.value); });

list.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !state.filtered.length) return;
  event.preventDefault();
  const index = event.key === "Home" ? 0 : event.key === "End" ? state.filtered.length - 1 : state.selected + (event.key === "ArrowDown" ? 1 : -1);
  select(index);
  const selected = list.children[state.selected];
  selected?.focus({ preventScroll: true });
  selected?.scrollIntoView({ block: "nearest" });
});

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  state.player?.tick(dt);
  requestAnimationFrame(animate);
}

renderCategories();
renderList();
select(initialIndex);
requestAnimationFrame(animate);
