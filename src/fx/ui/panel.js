// A reusable HUD plate in the same pixel language as Quest complete and Achievement: a rounded dark
// panel with a lit rim, a hard shaded base, a thin gold inner frame and two corner brackets.
import { fit, hex, clamp, seg, ease } from "../../core/index.js";
import { panel as plate, UI_GOLD, UI_INK } from "./_lib.js";

export const meta = {
  name: "HUD panel",
  desc: "A reusable pixel HUD plate: dark rounded body, lit rim, shaded base, a thin gold inner frame and two corner brackets. Sized from options, it backs bars, hotbars and dialog cards.",
  tags: ["ui", "panel", "frame", "hud", "plate", "loop"],
  size: [340, 100],
  origin: [170, 50],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { width: 320, height: 60, title: "", palette: UI_GOLD, ornament: true, shine: true, seed: 1 },
};

export function draw(p, t, o) {
  const G = fit(o.palette ?? UI_GOLD, 8), w = clamp(Math.round(o.width ?? 320), 8, 338), h = clamp(Math.round(o.height ?? 60), 8, 98);
  const x = -w / 2, y = -h / 2;
  const sh = o.shine === false ? null : ((t / meta.duration) % 1) * (w + 40) - 20 - w / 2;
  plate(p, x, y, w, h, UI_INK, { r: Math.min(5, Math.floor(h / 4)), shine: sh });
  // the thin gold inner frame, a brighter top and a dark base
  p.rect(x + 2, y + 2, w - 4, 1, G[3]);
  p.rect(x + 2, y + h - 3, w - 4, 1, UI_INK.low);
  // two corner brackets, short and hard-edged
  const L = Math.min(7, Math.floor(w / 4));
  p.rect(x + 3, y + 3, L, 1, G[2]); p.rect(x + 3, y + 3, 1, L, G[2]);
  p.rect(x + w - 3 - L, y + 3, L, 1, G[2]); p.rect(x + w - 4, y + 3, 1, L, G[2]);
  p.rect(x + 3, y + h - 4, L, 1, G[2]); p.rect(x + 3, y + h - 3 - L, 1, L, G[2]);
  p.rect(x + w - 3 - L, y + h - 4, L, 1, G[2]); p.rect(x + w - 4, y + h - 3 - L, 1, L, G[2]);
  if (o.ornament) {
    const cx = 0, cy = y + 3;
    p.px(cx, cy - 1, G[5]); p.px(cx, cy + 1, G[5]);
    p.px(cx - 1, cy, G[4]); p.px(cx + 1, cy, G[4]); p.px(cx, cy, G[7]);
    p.px(cx - 2, cy, G[2]); p.px(cx + 2, cy, G[2]);
  }
  if (o.title) {
    // an optional small tab label, useful when a panel is reused as a card
    p.text(o.title, x + 8, y + 6, G[6], { outline: UI_INK.outline });
  }
  p.glow(0, y + 2, w * 0.45, G[3], 0.035);
}
