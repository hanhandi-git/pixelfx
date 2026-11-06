import { rng, smooth, noise2, createPath, cubicBezier } from "../../core/index.js";
import { INK_PALETTE, PAPER, RED, inkColors, talisman } from "../_ink.js";

export const meta = {
  name: "Ink Unravel",
  desc: "A departing silhouette comes apart into hanging ink threads, torn paper and slow ash; width and height fit either a small shade guard or the ritualist.",
  tags: ["spawn", "death", "eastern", "ink", "paper", "one-shot"],
  size: [128, 160], origin: [64, 144], duration: 2.2, loop: false, fps: 30, bg: "ground",
  options: { palette: INK_PALETTE, width: 35, height: 108, seed: 1 },
};
export function create(o) {
  const height = Math.max(8, Math.min(112, o.height ?? 108)), width = Math.max(4, Math.min(40, o.width ?? 35));
  const trails = Array.from({ length: 24 }, (_, i) => {
    const r = rng(o.seed ?? 1, i), x = r.range(-width / 2, width / 2), y = r.range(-height, -5);
    return { path: createPath(cubicBezier([x, y], [x + r.range(-8, 8), y - 6],
      [x + r.range(-22, 22), y + 7], [x + r.range(-22, 22), y + 15]), { samples: 26 }),
      delay: r.range(0, 0.35), paper: i % 5 === 0, shade: i % 3 };
  });
  return { draw(p, t) {
    if (t >= meta.duration) return;
    const C = inkColors(o);
    // A short-lived ink silhouette bridges the unit's disappearance and the falling fragments.
    if (t < 0.65) {
      const dissolve = smooth(0, 0.65, t), opacity = 1 - smooth(0.25, 0.65, t);
      p.shade(-width / 2, -height, width / 2, 0, (x, y, out) => {
        const q = -y / height;
        const inside = q > 0.73
          ? (x / (width * 0.18)) ** 2 + ((y + height * 0.86) / (height * 0.14)) ** 2 <= 1
          : Math.abs(x) < width * (0.48 - q * 0.35);
        if (!inside || noise2(Math.floor(x / 2), Math.floor(y / 3), o.seed ?? 1) < dissolve * 2 - 1) return;
        out.c = x < -width * 0.1 ? C[2] : C[1];
        out.a = opacity;
      });
    }
    for (const item of trails) {
      const age = Math.max(0, t - item.delay), q = smooth(0, 1.7, age), fade = 1 - smooth(1.1, meta.duration, t);
      const tail = Math.max(0, q - 0.25 * (1 - q));
      p.strokePath(item.path, (u) => 1.5 * (1 - u) + 0.6, item.shade ? C[2] : C[0], fade, tail, q);
      const pos = item.path.sample(q);
      if (item.paper) talisman(p, pos.x, pos.y, 8, 3, q * 0.8, fade);
      else p.dot(pos.x, pos.y, item.shade ? C[4] : RED[2], fade * 0.7);
    }
    p.ellipse(0, 0, width * 0.65, 2, C[0], (1 - smooth(0.1, 1.7, t)) * 0.7);
    if (t < 0.12) p.line(-3, -height * 0.6, 3, -height * 0.6 - 2, PAPER[2], 1 - t / 0.12);
  } };
}
