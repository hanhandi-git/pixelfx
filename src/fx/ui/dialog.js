// A pixel dialog card: the same dark plate, gold inner frame and corner ornaments as Quest complete,
// with a big pixel-font title, a divider, small lines and a blinking prompt. The game uses one layout
// for title, pause, defeat and victory; options supply the words and the tone.
import { fit, hex, clamp } from "../../core/index.js";
import { panel as plate, spell, drawWord, UI_GOLD, UI_INK, UI_TONES } from "./_lib.js";

export const meta = {
  name: "HUD dialog",
  desc: "A pixel dialog card: dark plate, gold frame, corner brackets, a big pixel-font title, divider, small lines and a blinking prompt. One card for title, pause, defeat, victory.",
  tags: ["ui", "dialog", "modal", "menu", "title", "loop"],
  size: [300, 190],
  origin: [150, 95],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    kicker: "PAUSED", title: "PAUSED", subtitle: "THE EMBERS REST",
    lines: ["KILLS 12", "LEVEL 3", "TIME 2:41"], prompt: "ESC RESUME",
    width: 250, height: 150, tone: "gold", seed: 4,
  },
};

export function draw(p, t, o) {
  const w = clamp(Math.round(o.width ?? 250), 160, 298), h = clamp(Math.round(o.height ?? 150), 100, 188);
  const x = -w / 2, y = -h / 2;
  const G = fit(o.tone === "blood" ? UI_TONES.hp : UI_GOLD, 8);
  const sh = ((t / meta.duration) % 1) * (w + 40) - w / 2 - 20;
  plate(p, x, y, w, h, UI_INK, { r: 5, shine: sh });

  // inner frame and four corner ticks
  p.rect(x + 3, y + 3, w - 6, 1, G[3]);
  p.rect(x + 3, y + h - 4, w - 6, 1, UI_INK.low);
  const L = 8;
  for (const [cx, cy, sx, sy] of [[x + 4, y + 4, 1, 1], [x + w - 5, y + 4, -1, 1], [x + 4, y + h - 5, 1, -1], [x + w - 5, y + h - 5, -1, -1]]) {
    p.rect(cx, cy, L * sx, 1, G[2]);
    p.rect(cx, cy, 1, L * sy, G[2]);
  }
  // top ornament: a small gold diamond in a dark notch
  const oy = y + 2;
  p.px(0, oy - 1, G[5]); p.px(0, oy + 1, G[5]);
  p.px(-1, oy, G[4]); p.px(1, oy, G[4]); p.px(0, oy, G[7]);
  p.px(-2, oy, G[2]); p.px(2, oy, G[2]);

  // kicker
  if (o.kicker) p.text(o.kicker, 0, y + 14, G[5], { align: "center", outline: UI_INK.outline });

  // big title, one size down if the words are too wide for the card
  const word = spell(o.title ?? "", "big");
  const s = word.w * 2 <= w - 28 ? 2 : 1;
  const tw = word.w * s, titleY = y + 24;
  const items = word.letters.filter((Lt) => Lt.g).map((Lt) => ({
    g: Lt.g, x: -tw / 2 + Lt.x * s, y: titleY, sx: s, sy: s,
  }));
  drawWord(p, items, {
    fill: [G[3], G[4], G[5], G[6]], edge: G[7], under: G[2],
    outline: UI_INK.outline, shadow: UI_INK.low,
    shine: t % 2.4 < 0.55 ? -w / 2 + ((t % 2.4) / 0.55) * (w + 20) : null,
    shineY: titleY, glint: G[7],
  });
  p.glow(0, titleY + 7, tw * 0.55, G[4], 0.1);

  // divider
  const dy = titleY + 22;
  p.rect(x + 16, dy, w - 32, 1, G[3]);
  p.px(0, dy - 1, G[6]); p.px(-1, dy, G[5]); p.px(1, dy, G[5]); p.px(0, dy, G[7]);

  // subtitle and the stat lines
  if (o.subtitle) p.text(o.subtitle, 0, dy + 7, G[6], { align: "center", outline: UI_INK.outline });
  const lines = Array.isArray(o.lines) ? o.lines : [];
  lines.forEach((line, i) => p.text(String(line), 0, dy + 18 + i * 8, hex("#d8d4e6"), { align: "center", outline: UI_INK.outline }));

  // prompt, blinking a little so the card feels alive
  if (o.prompt) {
    const a = 0.5 + 0.5 * Math.abs(Math.sin(t * 3.2));
    p.text(o.prompt, 0, y + h - 16, G[6], { align: "center", outline: UI_INK.outline, a, font: "big" });
  }
  p.glow(0, y + 1, w * 0.4, G[3], 0.035);
}
