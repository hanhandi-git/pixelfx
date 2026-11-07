// A stage/wave/boss banner in the pixel UI language: a dark plate with a gold inner line, a small
// kicker, a big pixel-font title and an optional sub-line. It slides in, holds, and leaves empty.
import { fit, hex, seg, ease } from "../../core/index.js";
import { panel as plate, spell, drawWord, UI_GOLD, UI_INK } from "./_lib.js";

export const meta = {
  name: "HUD banner",
  desc: "A stage or wave banner: a dark plate with a gold rim, a small kicker, a big pixel-font title and a sub-line. It slides in with a shine, holds, then slides away and ends empty.",
  tags: ["ui", "banner", "stage", "wave", "boss", "one-shot"],
  size: [240, 70],
  origin: [120, 35],
  duration: 2.4,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { kicker: "STAGE I", text: "MOSSY RUINS", sub: "THE OLD SANCTUM", seed: 5 },
};

export function draw(p, t, o) {
  const ain = seg(t, 0, 0.16), aout = seg(t, 2.12, 2.3);
  const a = Math.min(ain, 1 - aout);
  if (a <= 0.01) return;
  const G = fit(UI_GOLD, 8);
  const x = Math.round((1 - ease.outCubic(ain)) * 26 - ease.inCubic(aout) * 26);
  const y = 0;
  const sh = seg(t, 0.3, 0.8) > 0 && seg(t, 0.3, 0.8) < 1 ? -90 + 180 * ease.inOutSine(seg(t, 0.3, 0.8)) + x : null;
  plate(p, x - 104, y - 13, 208, 30, UI_INK, { r: 4, a, shine: sh });
  p.rect(x - 101, y - 10, 202, 1, G[3], a);
  p.rect(x - 101, y + 14, 202, 1, UI_INK.low, a);
  // small end diamonds
  p.px(x - 100, y - 4, G[4], a); p.px(x + 100, y - 4, G[4], a);

  if (o.kicker) p.text(o.kicker, x, y - 22, G[5], { align: "center", outline: UI_INK.outline, a });
  const word = spell(o.text ?? "", "big");
  const s = word.w * 2 <= 176 ? 2 : 1, tw = word.w * s;
  const items = word.letters.filter((L) => L.g).map((L) => ({
    g: L.g, x: x - tw / 2 + L.x * s, y: y - 7, sx: s, sy: s, a,
  }));
  drawWord(p, items, {
    fill: [G[3], G[4], G[5], G[6]], edge: G[7], under: G[2],
    outline: UI_INK.outline, shadow: UI_INK.low,
    shine: sh === null ? null : sh, shineY: y - 8, glint: G[7],
  });
  if (o.sub) p.text(o.sub, x, y + 18, hex("#c8c0d8"), { align: "center", outline: UI_INK.outline, a });
  p.glow(x, y - 12, 70, G[4], 0.08 * a);
}
