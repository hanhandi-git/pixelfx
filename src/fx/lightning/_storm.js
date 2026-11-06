// Small drawing recipes for the storm set; all positions are local to the effect anchor.
import { rng, TAU, clamp } from "../../core/index.js";
import { zigzag, stroke, flight, spark } from "./_lib.js";

export function arc(p, C, seed, frame, x0, y0, x1, y1, k = 1, width = 0.7) {
  stroke(p, zigzag(rng(seed, frame), x0, y0, x1, y1, 0.13, 0), k, C, width,
    { light: 0.22, a: clamp(k * 2) });
}

// A broken, stepped ellipse: the rear half can be drawn behind an actor.
export function rim(p, C, seed, frame, cx, cy, rx, ry, k, near, spin = 0) {
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * TAU, b = (i + 1) / 64 * TAU;
    if ((Math.sin(a) >= 0) !== near) continue;
    const r = rng(seed, frame, i), d = r.range(-1.2, 1.2);
    if ((i + Math.floor(spin * 8)) % 13 > 10) continue;
    p.line(cx + Math.cos(a) * (rx + d), cy + Math.sin(a) * ry,
      cx + Math.cos(b) * rx, cy + Math.sin(b) * ry,
      near ? C[5] : C[3], k);
    if (i % 8 === 0) p.glow(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 8, C[4], 0.15 * k);
  }
}

// Analytic, seeded sparks with drag, gravity and a bounce; bounded speed/life keeps sheets tight.
export function spray(p, C, seed, age, x, y, count = 18, speed = 90, floor = 0) {
  if (age < 0 || age > 0.8) return;
  for (let i = 0; i < count; i++) {
    const r = rng(seed, i), life = r.range(0.25, 0.75);
    if (age >= life) continue;
    const a = r.range(-Math.PI + 0.15, -0.15), v = r.range(speed * 0.3, speed);
    const q = flight(x, y, Math.cos(a) * v, Math.sin(a) * v, age, { floor });
    spark(p, ...q, 1 - age / life, [C[7], C[6], C[4], C[2]]);
  }
}
