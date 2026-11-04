// The sporeling's ranged attack: a lobbed spore sac, a soft burst and a cloud that lingers. It is built as a pure
// effect, so an encounter can drop it at any minion's feet and read its hit time from `attack`.
import { PAL, fit, hex, clamp, lerp, seg, ease, TAU, burst, cycle, sparkle } from "../../core/index.js";

export const meta = {
  name: "Spore Puff",
  desc: "The sporeling swells, its gills flare, and it spits a lumpy spore sac in a low arc; it bursts into a drifting cloud of glowing spores, a toxic ring and falling motes.",
  tags: ["mob", "spore", "mushroom", "attack", "ranged", "fantasy", "one-shot"],
  kind: "mob-attack",
  size: [128, 84],
  origin: [16, 52],
  duration: 1.8,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.poison, seed: 1 },
};

export const attack = {
  telegraph: 0.45,
  hits: [{ t: 0.95, amp: 1.5, shake: 0.2, damage: 5, range: 84, target: "hero" }],
};

const THROW = 0.45, HIT = 0.95, TX = 78, TY = -16;
const VIOLET = ["#1a0f1e", "#3a1f44", "#5c2c66", "#86408a", "#b45cb0", "#e0a8e0"].map(hex);
const SPORE = ["#e8ffc4", "#c4ee8a", "#8ad24a", "#4a9a2a"].map(hex);

export function draw(p, t, o) {
  if (t >= meta.duration) return;
  const C = fit(o.palette, 7), H = hex("#f4ffe0"), ph = (o.seed ?? 1) * 0.7;
  // wind-up: the gills flare at the mouth and spores gather in a wobbling knot
  if (t < THROW + 0.06) {
    const k = seg(t, 0, THROW), gather = Math.min(1, k * 1.6);
    p.glow(0, -22, 10 + k * 8, C[4], 0.25 * gather);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + t * 3.2, r = lerp(18, 3, gather) * (0.5 + (i % 3) * 0.2);
      const x = Math.cos(a) * r + 1, y = -22 + Math.sin(a) * r * 0.7;
      p.dot(x, y, i % 3 ? C[5] : C[6], 0.75 * gather);
      p.glow(x, y, 4, C[4], 0.1 * gather);
    }
    if (t > THROW - 0.08) {
      const f = seg(t, THROW - 0.08, THROW + 0.06);
      sparkle(p, 1, -22, 2 + f * 4, H, C[6], 0.5 * (1 - f));
      p.glow(1, -22, 18, C[5], 0.2 * (1 - f));
    }
  }
  // the sac in flight: a lumpy ball of spores, a violet glow inside, a trail of motes
  if (t >= THROW && t < HIT + 0.08) {
    const age = t - THROW, dur = HIT - THROW, u = clamp(age / dur);
    const x = lerp(0, TX, u), y = lerp(-22, TY, u) - Math.sin(u * Math.PI) * 14;
    const wob = Math.sin(age * 24 + ph) * 0.9, r = 3.2 + Math.sin(u * Math.PI) * 1.2;
    p.circle(x + wob, y, r, (d, a) => (d < 0.45 ? C[6] : d < 0.8 ? C[5] : VIOLET[4]));
    p.dot(x + wob - 1, y - 1, H, 0.9);
    p.glow(x + wob, y, 10 + r * 2, C[4], 0.3);
    p.glow(x + wob, y, 5, VIOLET[4], 0.18);
    for (let i = 0; i < 5; i++) {
      const a = age * 1.8 + i * 1.4 + ph, d = age * 18 + i * 3;
      const tx = x - Math.cos(a) * d * 0.3, ty = y + Math.sin(a) * d * 0.3 + d * 0.18;
      p.dot(tx, ty, i % 2 ? C[4] : C[3], 0.5 * (1 - u));
    }
    if (t > HIT - 0.1) p.glow(x, y, 14, H, 0.25);
  }
  // the burst: a soft cloud of overlapping translucent lobes, a crisp ring and a rain of spores
  if (t >= HIT) {
    const k = seg(t, HIT, meta.duration), grow = ease.outCubic(Math.min(1, k * 2.4)), fade = 1 - seg(t, HIT + 0.25, meta.duration);
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * TAU + 0.4, d = grow * (9 + (i % 4) * 5), x = TX + Math.cos(a) * d * 1.4, y = TY + Math.sin(a) * d * 0.55 - grow * 3;
      const r = (4 + (i % 5) * 2) * grow;
      const col = i % 4 === 0 ? VIOLET[4] : i % 3 === 0 ? C[3] : C[4];
      p.disc(x, y, r, col, 0.2 * fade);
      if (i % 2 === 0) p.disc(x - r * 0.2, y - r * 0.25, r * 0.6, C[6], 0.16 * fade);
    }
    p.ring(TX, TY, 4 + grow * 20, 1.2, C[5], 0.75 * (1 - seg(k, 0, 0.5) ** 0.5));
    p.glow(TX, TY, 26 + grow * 22, C[4], 0.3 * fade);
    p.glow(TX, -3, 22 + grow * 14, C[3], 0.12 * fade);
    // spores fall out of the cloud and settle on the floor
    cycle(t - HIT, 1.2, 18, (o.seed ?? 1) * 7 + 2, (r) => r.range(0.5, 1.1), (age, L, r, i) => {
      const q = age / L, a = r.range(0, TAU), d = r.range(4, 20) * grow;
      const x = TX + Math.cos(a) * d * 1.4 + Math.sin(age * 4 + i) * 2, y = TY + Math.sin(a) * d * 0.5 + age * 14 + age * age * 12;
      if (y > -1) return;
      const aa = Math.min(1, q * 6) * (1 - q);
      p.dot(x, y, i % 3 ? C[5] : H, aa * 0.8);
      p.glow(x, y, 4, C[4], 0.1 * aa);
    });
    // the floor ring and a few bubbles in the grass
    const ringK = seg(t, HIT, HIT + 0.5);
    if (ringK < 1) for (let i = 0; i < 22; i++) {
      const a = (i / 22) * TAU, x = TX + Math.cos(a) * (8 + ringK * 28), y = -2 + Math.sin(a) * 2.2;
      p.dot(x, y, i % 2 ? C[4] : VIOLET[3], (1 - ringK) * 0.8);
    }
    if (k < 0.35) {
      const b = 1 - k / 0.35;
      p.disc(TX - 8, -2, 4 + k * 10, C[2], 0.18 * b);
      p.disc(TX + 10, -2, 3 + k * 8, C[3], 0.15 * b);
    }
  }
  // spores hanging in the air after the cloud thins
  if (t > HIT + 0.2) {
    burst(9, (o.seed ?? 1) * 13 + 4, (r, i) => {
      const age = t - HIT - 0.2, life = 0.5 + r.range(0, 0.65);
      if (age > life) return;
      const a = r.range(0, TAU), sp = r.range(2, 12), x = TX + Math.cos(a) * sp + Math.sin(age * 2 + i) * 2, y = TY - r.range(0, 10) - age * 8;
      const q = 1 - age / life;
      p.dot(x, y, q > 0.5 ? C[6] : C[4], q * 0.7);
      p.glow(x, y, 5, C[4], 0.08 * q);
    });
  }
}
