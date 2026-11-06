import { fit, clamp, smooth, rng } from "../../core/index.js";
import { VOLT, zigzag, trace } from "./_lib.js";
import { arc, spray, rim } from "./_storm.js";

export const meta = {
  name: "Ground surge",
  desc: "A ground charge races right through branching floor fissures, throwing up successive electric teeth and leaving cooling violet cracks behind.",
  tags: ["lightning", "electric", "ground", "wave", "surge", "one-shot"],
  size: [288, 128], origin: [48, 98], duration: 1.8, loop: false, fps: 30, bg: "ground",
  options: { palette: VOLT, seed: 23 },
};

export function drawBack(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8);
  rim(p, C, o.seed, 0, 0, 0, 12, 4, clamp(t / 0.2) * (1 - smooth(0.25, 0.5, t)), true);
  for (let i = 0; i < 7; i++) {
    const age = t - (0.24 + i * 0.085), x = i * 26;
    if (age < 0) continue;
    const k = 1 - smooth(0.25, 0.9, age);
    const b = zigzag(rng(o.seed, i), x - 12, 1, x + 18, 2, 0.12, 0);
    trace(p, b.paths[0].pts, age < 0.2 ? C[5] : C[2], k);
    p.glow(x, 0, 18, C[3], 0.3 * k);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), f = Math.floor(t * 30);
  for (let i = 0; i < 7; i++) {
    const age = t - (0.24 + i * 0.085), x = i * 26, r = rng(o.seed, i);
    if (age < 0) continue;
    const h = r.range(25, 48), k = clamp(1 - age / 0.25);
    if (k > 0) {
      const tx = x + 10 + r.range(-4, 4), ty = -h * Math.min(1, age / 0.045);
      arc(p, C, o.seed + i, f, x - 8, -1, tx, ty, k, 0.8);
      arc(p, C, o.seed + i + 10, f, x + 2, ty * 0.55, x + 22, ty * 0.3, k * 0.7, 0.5);
    }
    spray(p, C, o.seed + i * 13, age, x, -2, 11, 80);
  }
}
