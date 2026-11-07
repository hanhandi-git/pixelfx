// A hotbar slot in the library's pixel style: a small HUD plate, a gold keycap, a 10 x 10 icon,
// the skill name, a dithered cooldown curtain and a red no-mana state. Every slot shares the frame;
// only the icon palette changes.
import { fit, clamp, hex } from "../../core/index.js";
import { panel as plate, UI_INK, UI_GOLD } from "./_lib.js";

export const meta = {
  name: "HUD skill slot",
  desc: "A pixel hotbar slot: HUD plate, gold keycap, 10x10 spell icon, name, dithered cooldown curtain and a no-mana state. One shared frame; only the icon palette changes.",
  tags: ["ui", "skill", "hotbar", "cooldown", "hud", "loop"],
  size: [52, 60],
  origin: [26, 30],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    key: "J", name: "SLASH", icon: "slash", cooldown: 0, cdText: "",
    mana: true, flash: false, deny: false, width: 40, height: 46, seed: 2,
  },
};

const ICONS = {
  slash: [
    ".........#", "........##", ".......##.", "......##..", ".....##...",
    "....##....", "...##.....", "..##......", ".##.......", "#.........",
  ],
  fire: [
    "....#.....", "...###....", "..##o##...", ".########.", ".########.",
    "..######..", "...####...", "....##....", "..........", "..........",
  ],
  frost: [
    "....#.....", "..#.#.#...", "...###....", ".#######..", ".#######..",
    "...###....", "..#.#.#...", "....#.....", "..........", "..........",
  ],
  bolt: [
    "....##....", "...##.....", "..##......", ".#####....", "...##.....",
    "..##......", ".##.......", "##........", "..........", "..........",
  ],
  mend: [
    "....##....", "....##....", "....##....", "##########", "##########",
    "....##....", "....##....", "....##....", "..........", "..........",
  ],
  meteor: [
    "........#.", ".......###", "......####", ".....####.", "....####..",
    "...###....", "..##......", ".#........", "..........", "..........",
  ],
};
const PALS = {
  slash: { "#": "#fff4be", g: "#ffd36a", o: "#ff9a4a" },
  fire: { "#": "#fff3a6", o: "#ff7a3c", r: "#e0481c" },
  frost: { "#": "#dcfbff", c: "#8fdcff", b: "#3a8bd8" },
  bolt: { "#": "#ffffff", v: "#d8c8ff", p: "#9a6cff" },
  mend: { "#": "#f0ffd0", g: "#a8e09a", d: "#6aa85a" },
  meteor: { "#": "#fff3a6", o: "#ffb05a", r: "#e0481c" },
};

export function draw(p, t, o) {
  const w = clamp(Math.round(o.width), 28, 50), h = clamp(Math.round(o.height), 34, 58);
  const x = -w / 2, y = -h / 2;
  const G = fit(UI_GOLD, 8), rows = ICONS[o.icon] ?? ICONS.slash, pal = PALS[o.icon] ?? PALS.slash;
  const accent = Object.values(pal)[0] ?? G[6];
  const cd = clamp(o.cooldown ?? 0, 0, 1);

  // the shared frame, with one gold inner line and a corner tick
  plate(p, x, y, w, h, UI_INK, { r: 3 });
  p.rect(x + 2, y + 2, w - 4, 1, G[3]);
  p.rect(x + 2, y + h - 3, w - 4, 1, UI_INK.low);

  // keycap, top-left
  const ks = Math.min(11, Math.floor(w / 3));
  plate(p, x + 2, y + 2, ks, ks, { outline: G[0], rim: G[6], top: G[3], body: G[2], low: G[1] }, { r: 2 });
  p.text(o.key ?? "", x + 2 + ks / 2, y + 3, UI_INK.outline, { align: "center" });

  // the icon sits in the middle; a dark silhouette first keeps it readable on any panel
  const ix = Math.round(-5), iy = Math.round(-6);
  p.sprite(rows, Object.fromEntries(Object.keys(pal).map((k) => [k, UI_INK.outline])), ix + 1, iy + 1);
  p.sprite(rows, pal, ix, iy);
  p.glow(0, -2, 9, hex(accent), 0.14);

  // name at the bottom, dimmed while cooling or out of mana
  const nameColor = o.mana === false ? hex("#8a6070") : cd > 0.001 ? hex("#8d829a") : G[6];
  p.text(o.name ?? "", 0, y + h - 8, nameColor, { align: "center", outline: UI_INK.outline });

  // a white shine crosses a ready slot; the frame itself stays gold
  if (cd <= 0.001 && o.mana !== false) {
    const u = (t / meta.duration) % 1;
    if (u < 0.22) {
      const sx = x + 2 + Math.round((w - 4) * (u / 0.22));
      p.rect(sx, y + 2, 1, h - 4, hex("#fff4c8"), 0.6);
    }
  }

  // cooldown curtain: a hard black veil with a gold top edge, and the remaining seconds
  if (cd > 0.001) {
    const ch = Math.max(1, Math.round((h - 2) * cd));
    p.rect(x + 1, y + 1, w - 2, ch, UI_INK.outline, 0.72);
    p.rect(x + 1, y + 1 + ch, w - 2, 1, G[3]);
    if (o.cdText) p.text(String(o.cdText), 0, 2, G[7], { font: "big", align: "center", outline: UI_INK.outline });
  }

  // a cast flash around the same frame, or a red rejection flash
  if (o.flash) {
    p.rect(x + 1, y + 1, w - 2, 1, hex("#ffffff"));
    p.rect(x + 1, y + h - 2, w - 2, 1, hex("#fff4c8"));
    p.glow(0, 0, 18, G[5], 0.18);
  }
  if (o.deny) {
    p.rect(x + 1, y + 1, w - 2, 1, hex("#ff5a4a"));
    p.rect(x + 1, y + h - 2, w - 2, 1, hex("#ff5a4a"));
  }

  // no mana: a red frame and a small red corner mark, not a different component
  if (o.mana === false) {
    p.rect(x + 1, y + 1, w - 2, 1, hex("#ff5a4a"));
    p.rect(x + 1, y + h - 2, w - 2, 1, hex("#ff5a4a"));
    p.rect(x + 1, y + 1, 1, h - 2, hex("#ff5a4a"));
    p.rect(x + w - 2, y + 1, 1, h - 2, hex("#ff5a4a"));
    p.px(x + w - 4, y + 4, hex("#ff8a7a"));
    p.px(x + w - 5, y + 4, hex("#ff8a7a"));
  }
}
