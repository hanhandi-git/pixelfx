import { fit, clamp, smooth, rng, sparkle } from "../../core/index.js";
import { VOLT } from "./_lib.js";
import { arc, spray, rim } from "./_storm.js";

export const meta = {
  name: "Thunder rain",
  desc: "Five warning marks light in sequence; staggered bolts hammer the marked area, each strike scattering sparks and a small electric shock ring.",
  tags: ["lightning", "electric", "rain", "storm", "area", "strike", "one-shot"],
  size: [288, 224], origin: [144, 188], duration: 2.5, loop: false, fps: 30, bg: "ground",
  options: { palette: VOLT, seed: 24 },
};
const targets = [[-76, 0], [28, -9], [-24, 9], [78, 4], [0, -2]];
const hit = (i) => 0.55 + i * 0.2;

export function drawBack(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8);
  targets.forEach(([x, y], i) => {
    const age = t - hit(i), k = clamp((t - i * 0.1) / 0.24) * (1 - smooth(0.08, 0.5, age));
    for (const near of [false, true]) rim(p, C, o.seed + i, 0, x, y, 13, 4, k, near);
    if (age < 0 && k > 0) {
      p.line(x - 3, y, x + 3, y, C[4], k);
      p.line(x, y - 2, x, y + 2, C[5], k);
    }
  });
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), f = Math.floor(t * 30);
  targets.forEach(([x, y], i) => {
    const age = t - hit(i), r = rng(o.seed, i);
    if (age >= -0.09 && age < 0) {
      const u = (age + 0.09) / 0.09;
      arc(p, C, o.seed + i, 0, x + r.range(-14, 14), -158, x, -158 + 148 * u, 0.25, 0.3);
    }
    if (age >= 0 && age < 0.26) {
      const k = (1 - age / 0.26) * (f % 3 === 1 ? 0.55 : 1);
      arc(p, C, o.seed + i, f >> 1, x + r.range(-14, 14), -158, x, y - 1, k, i === 4 ? 1.1 : 0.8);
      sparkle(p, x, y - 1, 13 * k, C[7], C[4]);
      p.glow(x, y - 4, 26, C[4], k * 0.45);
    }
    if (age >= 0 && age < 0.5) {
      const k = 1 - age / 0.5;
      for (const near of [false, true]) rim(p, C, o.seed + i, f >> 1, x, y, 8 + age * 45, 2 + age * 12, k, near);
    }
    spray(p, C, o.seed + i * 31, age, x, y - 1, 18, 85, y);
  });
}
