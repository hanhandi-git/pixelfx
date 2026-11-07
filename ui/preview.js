import { bar, setBar, skillSlot, setSkill, badge, pips, panel, stat, icons, el } from "./pixel-ui.js";

/* ---- theme switch */
const themes = ["px-theme-ember", "px-theme-ink"];
for (const btn of document.querySelectorAll("[data-theme]")) {
  btn.addEventListener("click", () => {
    for (const c of themes) document.body.classList.toggle(c, c === btn.dataset.theme);
    for (const b of document.querySelectorAll("[data-theme]")) b.classList.toggle("is-on", b === btn);
  });
}

/* ---- icons */
for (const slot of document.querySelectorAll("[data-icon]")) slot.innerHTML = icons[slot.dataset.icon] ?? "";

/* ---- bars */
const state = { hp: 78, hpMax: 124, mp: 46, mpMax: 86, xp: 0.62, boss: 0.61 };
const bars = [
  ["生命", "hp", () => `${state.hp} / ${state.hpMax}`],
  ["法力", "mp", () => `${state.mp} / ${state.mpMax}`],
  ["经验", "xp", () => null],
  ["守卫者", "boss", () => null],
];
const barNodes = {};
const barWrap = document.querySelector("#bars");
for (const [label, tone, text] of bars) {
  const row = el("div", "uip-bar-row");
  row.append(el("span", "px-label", label));
  const value = tone === "hp" ? state.hp / state.hpMax : tone === "mp" ? state.mp / state.mpMax : tone === "xp" ? state.xp : state.boss;
  const node = bar({ tone, value, text: text(), thin: tone === "xp", seg: true });
  barNodes[tone] = node;
  row.append(node);
  barWrap.append(row);
}
function paintBars() {
  setBar(barNodes.hp, state.hp / state.hpMax, `${state.hp} / ${state.hpMax}`);
  setBar(barNodes.mp, state.mp / state.mpMax, `${state.mp} / ${state.mpMax}`);
  setBar(barNodes.xp, state.xp, null);
  setBar(barNodes.boss, state.boss, "");
}
paintBars();

document.querySelector('[data-demo="hit"]').addEventListener("click", () => {
  state.hp = Math.max(1, state.hp - 18);
  state.mp = Math.max(0, state.mp - 12);
  paintBars();
});
document.querySelector('[data-demo="heal"]').addEventListener("click", () => {
  state.hp = Math.min(state.hpMax, state.hp + 24);
  state.mp = Math.min(state.mpMax, state.mp + 20);
  paintBars();
});

/* ---- hero cards */
const heroBars = document.querySelector("#hero-bars");
const heroHp = bar({ tone: "hp", value: 0.82, text: "102 / 124" });
const heroMp = bar({ tone: "mp", value: 0.54, text: "46 / 86" });
const heroXp = bar({ tone: "xp", value: 0.62, thin: true, text: null });
heroBars.append(heroHp, heroMp, heroXp);

/* ---- skills */
const SKILLS = [
  { id: "j", key: "J", glyph: "斩", name: "星刃斩", cost: 0, accent: "#ffe0a0", glow: "rgba(255,190,90,.55)" },
  { id: "k", key: "K", glyph: "火", name: "烈焰术", cost: 10, accent: "#ffb05a", glow: "rgba(255,120,40,.6)" },
  { id: "l", key: "L", glyph: "霜", name: "霜环", cost: 18, accent: "#b8ecff", glow: "rgba(120,210,255,.6)" },
  { id: "u", key: "U", glyph: "雷", name: "雷罚", cost: 22, accent: "#d8c8ff", glow: "rgba(170,140,255,.65)" },
  { id: "i", key: "I", glyph: "愈", name: "圣愈", cost: 26, accent: "#c8ffb0", glow: "rgba(150,240,120,.55)" },
  { id: "o", key: "O", glyph: "陨", name: "陨星", cost: 40, accent: "#ffcf6a", glow: "rgba(255,160,50,.8)" },
];
const skillRow = document.querySelector("#skills");
const slots = {};
for (const s of SKILLS) {
  const node = skillSlot(s);
  slots[s.id] = node;
  skillRow.append(node);
}
const cd = { j: 0, k: 0, l: 3.2, u: 5.5, i: 0, o: 12 };
const totals = { j: 0.36, k: 1.1, l: 5, u: 6, i: 11, o: 15 };
let mp = 22;
for (const s of SKILLS) {
  setSkill(slots[s.id], { left: cd[s.id], total: totals[s.id], mp, cost: s.cost });
}
setInterval(() => {
  for (const s of SKILLS) {
    cd[s.id] = Math.max(0, cd[s.id] - 0.12);
    if (cd[s.id] === 0 && Math.random() < 0.02) cd[s.id] = totals[s.id];
    setSkill(slots[s.id], { left: cd[s.id], total: totals[s.id], mp, cost: s.cost });
  }
}, 120);

/* ---- a tiny procedural portrait so the component is not empty */
const cv = document.querySelector("#portrait");
const ctx = cv.getContext("2d");
const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
px(0, 0, 30, 42, "#0b0812");
px(11, 7, 8, 8, "#dca076");
px(10, 6, 10, 2, "#42334f");
px(9, 4, 12, 3, "#292538");
px(12, 10, 1, 1, "#fff4be");
px(17, 10, 1, 1, "#fff4be");
px(11, 17, 9, 10, "#8d2e48");
px(13, 17, 5, 10, "#d84f52");
px(8, 20, 3, 12, "#42233c");
px(20, 20, 3, 12, "#42233c");
px(12, 27, 7, 13, "#42233c");
px(12, 34, 3, 8, "#242744");
px(17, 34, 3, 8, "#242744");
px(11, 39, 5, 3, "#0e0c14");
px(16, 39, 5, 3, "#0e0c14");
px(13, 5, 6, 1, "#e9b957");
