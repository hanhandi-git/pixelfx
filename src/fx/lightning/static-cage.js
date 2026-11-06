import { fit, rng, TAU } from "../../core/index.js";
import { VOLT } from "./_lib.js";
import { arc, rim, spray } from "./_storm.js";

export const meta = {
  name: "Static cage",
  desc: "Six electric ribs arch over a ground seal, with current jumping between the bars and orbiting sparks tracing a seamless containment field.",
  tags: ["lightning", "electric", "cage", "barrier", "shield", "trap", "loop"],
  size: [160, 144], origin: [80, 112], duration: 2, loop: true, fps: 30, bg: "ground",
  options: { palette: VOLT, seed: 25 },
};

function layer(p, t, o, near) {
  const C = fit(o.palette, 8), phase = ((t % 2) + 2) % 2, f = Math.floor(phase * 30), turn = phase * TAU / 2;
  rim(p, C, o.seed, f >> 1, 0, 0, 38, 10, 0.9, near, turn);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + Math.PI / 6;
    if ((Math.sin(a) >= 0) !== near) continue;
    const x = Math.cos(a) * 38, y = Math.sin(a) * 10, pts = [];
    for (let j = 0; j <= 12; j++) {
      const u = j / 12, r = rng(o.seed, i, j, f >> 1);
      pts.push([x * Math.cos(u * Math.PI / 2) + (j > 0 && j < 12 ? r.range(-2, 2) : 0), y * (1 - u) - 70 * Math.sin(u * Math.PI / 2)]);
    }
    p.polyline(pts, C[near ? 4 : 2]);
    if ((f + i * 7) % 30 < 8) {
      p.polyline(pts, C[6]);
      for (let j = 0; j < pts.length; j += 3) p.glow(...pts[j], 8, C[4], 0.22);
    }
    p.circle(x, y, 2, C[5]);
    p.px(x, y - 1, C[7]);
    spray(p, C, o.seed + i * 11, (phase + i / 3) % 2, x, y - 1, 5, 30, y);
  }
  for (let i = 0; i < 6; i++) {
    const a = turn + i / 6 * TAU, x = Math.cos(a) * 34, y = -30 + Math.sin(a) * 10;
    if ((Math.sin(a) >= 0) !== near) continue;
    const b = a + 0.5;
    arc(p, C, o.seed + i, f, x, y, Math.cos(b) * 34, -30 + Math.sin(b) * 10, 0.65, 0.4);
  }
  if (near) {
    p.glow(0, -66, 16, C[4], 0.25);
    p.circle(0, -70, 2, C[6]);
    p.px(0, -71, C[7]);
  }
}
export const drawBack = (p, t, o) => layer(p, t, o, false);
export const draw = (p, t, o) => layer(p, t, o, true);
