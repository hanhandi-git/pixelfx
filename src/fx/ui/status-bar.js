// A compact segmented HUD bar in the library's pixel style. The label and value sit inside the bar,
// so a 108 px wide HP/MP row still reads at 1x; tone picks the ramp (hp / mp / xp / boss / gold).
import { fit, hex, clamp } from "../../core/index.js";
import { bar, UI_INK, UI_TONES } from "./_lib.js";

export const meta = {
  name: "HUD status bar",
  desc: "A segmented HUD bar: dark outline, hard ramp fill, lit rim, cell dividers, white-hot leading edge. Label and value sit inside; tone picks the hp, mp, xp, boss or gold ramp.",
  tags: ["ui", "bar", "hud", "health", "mana", "xp", "boss", "loop"],
  size: [320, 24],
  origin: [160, 12],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    label: "HP", value: 0.72, text: "72 / 100", tone: "hp",
    width: 130, height: 9, cells: 10, seed: 3,
  },
};

const toneOf = (o) => (o.palette ? fit(o.palette, 8) : fit(UI_TONES[o.tone] ?? UI_TONES.hp, 8));

export function draw(p, t, o) {
  const C = toneOf(o), w = clamp(Math.round(o.width), 12, 318), h = clamp(Math.round(o.height), 4, 18);
  const x = -w / 2, y = -h / 2;
  bar(p, x, y, w, h, o.value, C, { cells: o.cells });
  // a slow glint crosses the filled part; it never changes the state, just keeps the HUD alive
  const fw = Math.round(w * clamp(o.value, 0, 1));
  if (fw > 8) {
    const u = (t / meta.duration) % 1, gx = x + 2 + Math.round((fw - 4) * u);
    p.rect(gx, y + 1, 1, h - 2, C[7], 0.55);
    p.glow(gx, y + h / 2, 5, C[5], 0.08);
  }
  const ty = Math.round(y + (h - 5) / 2);
  if (o.label) p.text(o.label, x + 2, ty, C[6], { outline: UI_INK.outline });
  if (o.text) p.text(o.text, x + w - 2, ty, C[7], { align: "right", outline: UI_INK.outline });
  if (!o.value && !o.label && !o.text) p.text("EMPTY", 0, ty, hex("#8a8098"), { align: "center" });
}
