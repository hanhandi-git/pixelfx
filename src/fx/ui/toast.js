// A small pickup/status toast: a dark pixel plate with a gold rim, one line of mini pixel text,
// a slide-in, a hold and a slide-out that leaves the frame empty.
import { hex, seg, ease } from "../../core/index.js";
import { panel as plate, UI_GOLD, UI_INK, UI_TONES } from "./_lib.js";

export const meta = {
  name: "HUD toast",
  desc: "A small pickup or status toast: a dark pixel plate, a gold rim, one mini-font line. It slides in, holds, slides out and ends empty.",
  tags: ["ui", "toast", "pickup", "status", "one-shot"],
  size: [180, 30],
  origin: [90, 15],
  duration: 1.7,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { text: "HP +18", tone: "gold", seed: 6 },
};

export function draw(p, t, o) {
  const ain = seg(t, 0, 0.12), aout = seg(t, 1.42, 1.62);
  const a = Math.min(ain, 1 - aout);
  if (a <= 0.01) return;
  const G = UI_TONES[o.tone] ? UI_TONES[o.tone].map((c) => hex(c)) : UI_GOLD.map((c) => hex(c));
  const x = Math.round((1 - ease.outCubic(ain)) * 20 + ease.inCubic(aout) * 20), y = 0;
  plate(p, x - 70, y - 9, 140, 18, UI_INK, { r: 3, a });
  p.rect(x - 67, y - 7, 134, 1, G[4], a);
  p.px(x - 64, y, G[6], a); p.px(x - 63, y, G[5], a);
  p.text(o.text ?? "", x + 2, y - 2, G[7], { align: "center", outline: UI_INK.outline, a });
  p.glow(x, y, 50, G[4], 0.08 * a);
}
