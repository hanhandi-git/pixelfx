// 六勾玉: six jade magatama turn around a bright seed, the far half dimmed behind the near half so the string
// reads as a solid object. Gold cord dust and a slow collar of motes keep the loop alive without a seam.
import { TAU, fit, loopNoise, smooth, WHITE } from "../../core/index.js";
import { JEWEL, GOLD, GOLD_HOT, GOLD_D, magatama } from "./_lib.js";

export const meta = {
  name: "Six magatama",
  desc: "Six jade magatama strung on a gold cord turn around a bright seed, the far jewels dimmed behind the near ones, with dust winking between them.",
  tags: ["kami", "japan", "shinto", "magatama", "jewel", "artifact", "六勾玉", "勾玉", "loop"],
  size: [140, 112],
  origin: [70, 56],
  duration: 3.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: JEWEL, seed: 6 },
};

const RX = 41, RY = 15, CY = 0, R = 7.6;

/** Where bead i sits at phase ph, with its depth (1 near, 0 far). */
function bead(i, ph, seed) {
  const a = ph * TAU + (i / 6) * TAU;
  const bob = Math.sin(ph * TAU * 2 + i) * 1.1;
  return { a, z: Math.sin(a) * 0.5 + 0.5, x: Math.cos(a) * RX, y: CY + Math.sin(a) * RY + bob };
}

/** The gold cord the jewels are strung on: a dim dotted ellipse, brighter on the near half. */
function cord(p, ph, near) {
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU;
    if ((Math.sin(a) >= 0) !== near) continue;
    const sway = Math.sin(ph * TAU + i * 0.7) * 0.7;
    const x = Math.cos(a) * (RX + sway), y = CY + Math.sin(a) * (RY + sway * 0.4);
    p.dot(x, y, i % 5 ? GOLD_D : GOLD, near ? 0.5 : 0.22);
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration, S = o.seed;
  cord(p, ph, false);
  // the far half: smaller, dimmer, seen through the haze
  for (let i = 0; i < 6; i++) {
    const { a, z, x, y } = bead(i, ph, S);
    if (z >= 0.5) continue;
    magatama(p, C, x, y - 1, R * (0.72 + 0.28 * z), a + Math.PI / 2 + Math.sin(ph * TAU + i) * 0.16, 0.4 + 0.4 * z);
    p.glow(x, y, 8, C[3], 0.07);
  }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration, S = o.seed;
  // jade air behind the string: three soft discs turning at different rates
  for (let i = 0; i < 3; i++) {
    const a = ph * TAU * (i % 2 ? -1 : 2) + (i / 3) * TAU;
    p.disc(Math.cos(a) * 18, CY + Math.sin(a) * 8, 26 + i * 5, C[2], 0.05);
  }
  p.glow(0, CY, 52, C[3], 0.1);
  p.glow(0, CY, 26, C[4], 0.08);

  // the seed at the centre: a jade bead with a white heart and a ring of gold ticks
  const pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
  p.circle(0, CY, 7.5, C[2], 0.95);
  p.circle(-1, CY - 1, 5.8, C[3], 0.95);
  p.circle(-1, CY - 1, 4.2, C[4], 0.95);
  p.circle(-1, CY - 2, 2.6, C[5], 0.95);
  p.circle(-1, CY - 2, 1.2, WHITE, 1);
  for (let i = 0; i < 10; i++) {
    const a = ph * TAU + (i / 10) * TAU + pulse * 0.18;
    const d = 9.4 + (i % 2 ? 1.1 : 0);
    p.dot(Math.cos(a) * d, CY + Math.sin(a) * d * 0.9, i % 3 ? GOLD : GOLD_HOT, 0.55 + 0.35 * pulse);
  }
  p.glow(-1, CY - 1, 14, C[5], 0.14 + 0.06 * pulse);
  p.glow(0, CY, 26, GOLD, 0.04);

  // the cord, then the near jewels in depth order
  cord(p, ph, true);
  const near = [];
  for (let i = 0; i < 6; i++) {
    const b = bead(i, ph, S);
    if (b.z >= 0.5) near.push(b);
  }
  near.sort((a, b) => a.z - b.z);
  for (const { a, z, x, y } of near) {
    const wob = Math.sin(ph * TAU + a * 3) * 0.14;
    magatama(p, C, x, y - 1, R * (0.82 + 0.18 * z), a + Math.PI / 2 + wob, 0.72 + 0.28 * z);
    p.glow(x, y, 12, C[4], 0.12 + 0.06 * z);
    // a gold bead sits at the head of every jewel
    p.dot(x + Math.cos(a + Math.PI / 2 + wob) * -1.6, y - 2.4, GOLD_HOT, 0.7);
  }

  // dust: slow gold specks on the cord and two or three hard winks per loop
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + ph * TAU;
    const d = RX + 7 + loopNoise(ph, 1.4, S + i * 9) * 5;
    const x = Math.cos(a) * d, y = CY + Math.sin(a) * d * 0.42;
    p.dot(x, y, i % 3 ? GOLD : GOLD_HOT, 0.25 + 0.3 * loopNoise(ph, 2, S + i * 5));
  }
  for (let i = 0; i < 6; i++) {
    const w = loopNoise(ph, 2, S + i * 11);
    if (w < 0.74) continue;
    const { x, y } = bead(i, ph, S);
    const arm = 1 + Math.round((w - 0.74) * 8);
    p.px(x + 2, y - 5, WHITE); p.px(x + 3, y - 5, GOLD_HOT); p.px(x + 2, y - 6, GOLD_HOT);
    p.px(x + 2 + arm, y - 5, GOLD); p.px(x + 2 - arm, y - 5, GOLD_D);
    p.glow(x + 2, y - 5, 5, GOLD_HOT, 0.12);
  }
}
