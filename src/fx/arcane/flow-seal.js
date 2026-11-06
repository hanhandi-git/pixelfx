// One composition of reusable paths, signed distances and field-driven motion.
import {
  PAL, fit, TAU, rng, cycle, smooth, createPath, cubicBezier, SDF,
  combineFields, attractionField, vortexField, turbulenceField, fieldTrajectory,
} from "../../core/index.js";

const D = 4, CY = -65;
const ribbon = createPath(cubicBezier([-65, -12], [-78, -119], [77, -123], [45, -48]));
const seal = SDF.subtract(SDF.circle(0, CY, 23), SDF.union(
  SDF.circle(0, CY, 19), SDF.box(0, CY, 2, 28), SDF.box(0, CY, 28, 2)));
const bounds = [-30, CY - 30, 30, CY + 30];
const runeRows = ["....#....", "...###...", "..##.##..", ".##...##.", "##..#..##", ".##.#.##.",
  "..#####..", "...###...", "....#....", "...###...", "..##.##..", "...###...", "....#...."];
const rune = SDF.fromMask({ w: 9, h: 13, data: runeRows.flatMap((row) => [...row].map((ch) => ch === "#" ? 1 : 0)) }, -4, CY - 6);

export const meta = {
  name: "Flow seal",
  desc: "A broken arcane seal: a Bezier ribbon writes around a distance-field rune, while motes spiral inward under attraction, vortex and seeded turbulence.",
  tags: ["arcane", "sigil", "path", "distance-field", "vortex", "loop"],
  size: [192, 156], origin: [96, 140], duration: D, loop: true, fps: 30, bg: "ground",
  options: { palette: PAL.arcane, seed: 7 },
};

// Keep one seed's baked trajectories. Motion is integrated once, never during a draw/seek.
let cache;
function trajectories(seed) {
  if (cache && cache.seed === seed) return cache.paths;
  const field = combineFields(attractionField(0, CY, 100, 110), vortexField(0, CY, 65, 100),
    turbulenceField({ strength: 10, scale: 23, speed: 0, seed }));
  const paths = Array.from({ length: 32 }, (_, i) => {
    const r = rng(seed, i), angle = r.range(0, TAU), radius = r.range(35, 54);
    const state = { x: Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius * 0.7,
      vx: -Math.sin(angle) * 17, vy: Math.cos(angle) * 17 };
    return fieldTrajectory(state, field, 1.65);
  });
  cache = { seed, paths };
  return paths;
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 7), pulse = 0.85 + 0.15 * Math.cos(t / D * TAU * 2);
  p.ellipse(0, -1, 29, 4, C[0], 0.7);
  p.ellipse(0, -1, 23, 2, C[2], 0.45 * pulse);
  p.glow(0, -3, 29, C[3], 0.2 * pulse);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 7), phase = t / D, pulse = 0.5 + 0.5 * Math.cos(phase * TAU * 2);
  const paths = trajectories(o.seed);
  p.glow(0, CY, 38, C[3], 0.17 + 0.03 * pulse);

  // A color body, a tight lit rim and a small source. Boolean cuts remain readable without glow.
  p.sdf(SDF.expand(seal, 1), bounds, C[1]);
  p.sdf(seal, bounds, (d, x, y) => {
    const angle = Math.atan2(y - CY, x);
    const hot = Math.max(0, Math.cos(angle - phase * TAU));
    return hot > 0.96 ? C[6] : hot > 0.65 ? C[5] : y < CY ? C[4] : C[3];
  });
  p.sdf(SDF.expand(rune, 1 + pulse * 1.2), [-8, CY - 10, 9, CY + 11], C[2]);
  p.sdf(rune, [-6, CY - 8, 7, CY + 9], (d, x, y) => y < CY ? C[6] : C[4]);
  p.glow(0, CY, 13, C[4], 0.22 + pulse * 0.12);
  const lit = phase * TAU;
  p.glow(Math.cos(lit) * 21, CY + Math.sin(lit) * 21, 9, C[5], 0.28);
  // Four fixed pinpoints give the moving light a readable frame of reference.
  for (let i = 0; i < 4; i++) {
    const angle = i * TAU / 4, x = Math.cos(angle) * 27, y = CY + Math.sin(angle) * 27;
    p.dot(x, y, C[4], 0.7);
    p.glow(x, y, 4, C[3], 0.14);
  }

  // The same geometric curve becomes a tapered ribbon, a bright core, and a moving source.
  for (let i = 0; i < 2; i++) {
    const head = (phase + i * 0.5) % 1, tail = Math.max(0, head - 0.24);
    const fade = smooth(0, 0.07, head) * (1 - smooth(0.9, 1, head));
    const width = (u) => 0.7 + 4 * Math.sin(Math.max(0, (u - tail) / (head - tail || 1)) * Math.PI * 0.5);
    p.strokePath(ribbon, width, (u, v) => v > 0.65 ? C[2] : C[4], fade, tail, head);
    p.strokePath(ribbon, 1, C[6], fade, Math.max(tail, head - 0.12), head);
    const q = ribbon.sample(head);
    p.glow(q.x, q.y, 11, C[4], 0.4 * fade);
  }

  cycle(t, D, paths.length, o.seed, 1.65, (age, life, r, i) => {
    const u = age / life, pos = paths[i](u), prev = paths[i](Math.max(0, u - 0.035));
    const fade = smooth(0, 0.12, u) * (1 - smooth(0.72, 1, u));
    p.line(prev[0], prev[1], pos[0], pos[1], r.chance(0.25) ? C[6] : C[4], fade);
    p.glow(pos[0], pos[1], 3, C[4], 0.25 * fade);
  });
}
