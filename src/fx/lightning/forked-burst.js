import { fit, clamp, rng, sparkle } from "../../core/index.js";
import { VOLT, zigzag, stroke, trace } from "./_lib.js";
import { spray } from "./_storm.js";

export const meta = {
  name: "Forked burst",
  desc: "A compact charge splits into five jagged lightning fingers, sweeping a forward cone before its branching channels cool and break into sparks.",
  tags: ["lightning", "electric", "cone", "fork", "burst", "one-shot"],
  size: [224, 176], origin: [42, 98], duration: 1.3, loop: false, fps: 30, bg: "dark",
  options: { palette: VOLT, seed: 22 },
};
const FIRE = 0.25, Y = -12;
const tip = (i) => { const a = -0.66 + i * 0.33; return [Math.cos(a) * (i % 2 ? 104 : 122), Y + Math.sin(a) * 100]; };

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), age = t - FIRE;
  if (age < 0) {
    const k = clamp(t / FIRE);
    sparkle(p, 0, Y, 2 + 6 * k, C[6], C[3]);
    p.glow(0, Y, 20, C[4], k * 0.5);
    return;
  }
  const k = clamp(1 - age / 0.45), f = Math.floor(Math.min(age, 0.38) * 24);
  for (let i = 0; i < 5; i++) {
    const [x, y] = tip(i), b = zigzag(rng(o.seed, i, f), 0, Y, x, y, 0.16, 0.3);
    if (age < 0.4) stroke(p, b, k * (i === 2 ? 1 : 0.85), C, i === 2 ? 1 : 0.65,
      { upTo: clamp(age / 0.06), hero: age < 0.05, light: 0.22, a: clamp(k * 3) });
    else if (age < 0.66) trace(p, b.paths[0].pts, C[3], (0.66 - age) * 2);
    if (age >= 0.06) spray(p, C, o.seed + i * 17, age - 0.06, x, y, 9, 55, y + 8);
  }
  if (age < 0.12) sparkle(p, 0, Y, 13 * (1 - age / 0.12), C[7], C[4]);
}
