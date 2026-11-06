import { fit, clamp, smooth, rng, sparkle } from "../../core/index.js";
import { VOLT } from "./_lib.js";
import { arc, spray } from "./_storm.js";

export const meta = {
  name: "Thunder spear",
  desc: "A pointed lightning lance condenses, shoots right with braided electric trails, then shatters into a starburst and falling sparks.",
  tags: ["lightning", "electric", "projectile", "spear", "impact", "one-shot"],
  size: [256, 128], origin: [48, 92], duration: 1.5, loop: false, fps: 30, bg: "ground",
  options: { palette: VOLT, seed: 21 },
};
const FIRE = 0.3, HIT = 0.6, TX = 146, Y = -26;

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), f = Math.floor(t * 30), r = rng(o.seed, f);
  if (t < HIT) {
    const charge = clamp(t / FIRE), u = clamp((t - FIRE) / (HIT - FIRE));
    const x = TX * u, len = 12 + charge * 20;
    for (let i = 0; i < 2; i++) {
      const y = Y + (i ? 1 : -1) * (4 + Math.sin(t * 30) * 2);
      arc(p, C, o.seed + i, f, x - len - 6, y, x - 4, Y, charge, 0.5);
    }
    p.poly([[x + 13, Y], [x - 2, Y - 6], [x - len, Y], [x - 2, Y + 6]], C[2], charge);
    p.poly([[x + 12, Y], [x - 3, Y - 4], [x - len + 3, Y], [x - 3, Y + 4]], C[4], charge);
    p.poly([[x + 11, Y], [x - 3, Y - 2], [x - len + 7, Y], [x - 3, Y + 2]], C[6], charge);
    p.line(x - len + 8, Y, x + 9, Y, C[7], charge);
    p.glow(x, Y, 18, C[4], 0.45 * charge);
    if (t >= FIRE) for (let i = 1; i <= 5; i++) {
      const hx = Math.max(-22, x - i * 12);
      p.line(hx - 7, Y + r.range(-7, 7), hx, Y + r.range(-5, 5), C[i < 3 ? 5 : 2]);
    }
  }
  const age = t - HIT;
  if (age >= 0 && age < 0.23) {
    const k = 1 - age / 0.23;
    sparkle(p, TX, Y, 23 * k, C[7], C[4]);
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * Math.PI * 2, d = 13 + age * 60;
      arc(p, C, o.seed + i, f, TX, Y, TX + Math.cos(a) * d, Y + Math.sin(a) * d, k);
    }
    p.glow(TX, Y, 38, C[4], 0.55 * k);
  }
  spray(p, C, o.seed + 40, age, TX, Y, 26, 105);
  if (age >= 0) p.glow(TX, 0, 30, C[3], 0.15 * (1 - smooth(HIT, 1.1, t)));
}
