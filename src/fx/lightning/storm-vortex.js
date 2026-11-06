import { fit, rng, TAU } from "../../core/index.js";
import { VOLT } from "./_lib.js";
import { arc, rim } from "./_storm.js";

export const meta = {
  name: "Storm vortex",
  desc: "Three braided lightning spirals climb a widening funnel, sweeping motes upward around a dark eye and discharging into a crackling ground ring.",
  tags: ["lightning", "electric", "vortex", "tornado", "storm", "area", "loop"],
  size: [184, 176], origin: [92, 140], duration: 3, loop: true, fps: 30, bg: "ground",
  options: { palette: VOLT, seed: 26 },
};

function layer(p, t, o, near) {
  const C = fit(o.palette, 8), phase = ((t % 3) + 3) % 3, turn = phase / 3 * TAU, f = Math.floor(phase * 30);
  rim(p, C, o.seed, f >> 1, 0, 0, 28, 7, 0.8, near, turn);
  rim(p, C, o.seed + 70, f >> 1, 0, -108, 49, 9, 0.75, near, -turn);
  for (let arm = 0; arm < 3; arm++) {
    for (let j = 0; j < 56; j++) {
      const u = j / 56, v = (j + 1) / 56, a = arm / 3 * TAU + turn + u * TAU * 1.65;
      if ((Math.sin(a) >= 0) !== near) continue;
      const b = arm / 3 * TAU + turn + v * TAU * 1.65;
      const r0 = 10 + u * 39, r1 = 10 + v * 39, q = rng(o.seed, arm, j, f >> 1);
      const x = Math.cos(a) * r0, y = -u * 108 + Math.sin(a) * r0 * 0.18;
      const nx = Math.cos(b) * r1, ny = -v * 108 + Math.sin(b) * r1 * 0.18;
      const jag = q.range(-1, 1);
      if (near) p.line(x + jag, y + 1, nx, ny + 1, C[3]);
      p.line(x + jag, y, nx, ny, C[near ? 6 : 3]);
      if (near && j % 4 === 0) {
        p.px(x, y, C[7]);
        p.glow(x, y, 12, C[4], 0.28);
      }
      if (j % 19 === 0) arc(p, C, o.seed + arm * 19 + j, f, x, y, x + q.range(-7, 7), y - 9, near ? 0.7 : 0.35, 0.4);
    }
  }
  // Each mote's phase wraps only outside its visible lifetime, so the loop has no spawn pop.
  for (let i = 0; i < 32; i++) {
    const q = rng(o.seed, i), u = (phase / 3 + q.next()) % 1, a = turn * 2 + q.range(0, TAU) + u * TAU;
    if ((Math.sin(a) >= 0) !== near) continue;
    const r = 14 + u * 41, x = Math.cos(a) * r, y = -u * 112 + Math.sin(a) * r * 0.18;
    const k = Math.min(1, u * 10, (1 - u) * 10);
    p.line(x, y, x - Math.cos(a + 0.7) * 3, y + 3, C[near ? 5 : 3], k);
  }
  if (near) p.glow(0, -4, 26, C[3], 0.2);
}
export const drawBack = (p, t, o) => layer(p, t, o, false);
export const draw = (p, t, o) => layer(p, t, o, true);
