// Three cut spirit stones: a tall central crystal flanked by two smaller shards, all turning in the same
// cold qi light. The crystal solid and facet shading come from the pickup lib's prism/drawGem, adapted from
// Sprite Fusion's open-source ice crystal (https://www.spritefusion.com/pixel-art-vfx/ice), MIT License,
// Copyright (c) 2026 Hugo Duprez.
import { fit, rand, cycle, TAU, WHITE } from "../../core/index.js";
import { Layer, prism, drawGem, glint, blobShadow, pool } from "./_lib.js";
import { AZURE } from "./_eastern.js";

export const meta = {
  name: "Spirit stone",
  desc: "A cluster of jade-cyan spirit crystals hovers and turns: facets catch the light, a pulse climbs the tall stone, splinters and motes circle it, and its cold glow pools on the floor.",
  tags: ["pickup", "spirit", "stone", "crystal", "eastern", "xianxia", "cultivation", "loop"],
  size: [64, 88],
  origin: [32, 80],
  duration: 3.2,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: AZURE, seed: 23 },
};

const HOVER = 31, L = new Layer(48, 48);
const MAIN = prism({ r: 5.6, half: 6.5, top: 8, bottom: 7, n: 6 });
const SIDE = prism({ r: 3.5, half: 4, top: 5, bottom: 4.5, n: 6 });
const pose = (ph) => ({ y: -HOVER - 2 * Math.sin(ph * TAU), spin: 0.24 + 0.42 * Math.sin(ph * TAU + 0.3) });

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration, { y, spin } = pose(ph), lift = (-y - HOVER + 2) / 4;
  blobShadow(p, 0, 9.5 - lift * 1.4, 0.8 - lift * 0.16);
  pool(p, 0, 0.5, 15, 3.4, C[4], 0.18);
  // light bent through the stones slides across the floor as they turn
  for (let k = 0; k < 3; k++) {
    const a = spin * 2.2 + (k * TAU) / 3, x = Math.sin(a) * 10, b = 0.5 + 0.5 * Math.cos(a);
    if (b < 0.2) continue;
    p.dot(x, 0, b > 0.7 ? C[5] : C[4], b * 1.1);
    p.glow(x, 0, 5, C[4], 0.22 * b);
  }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / meta.duration, T = meta.duration, { y, spin } = pose(ph);
  const beat = 0.5 + 0.5 * Math.sin(ph * TAU * 2), rise = ((-y - HOVER + 2) / 4);
  // a cold halo, a bright core and two soft rings
  p.glow(0, y - 1, 26, C[4], 0.24 + 0.06 * beat);
  p.glowRing(0, y, 5, 16, C[5], 0.2);
  p.glow(0, y + 1, 10, C[5], 0.22 + 0.12 * beat);

  const stones = [
    { g: SIDE, x: -7.2, yy: y + 6.2, spin: spin - 0.55, gain: 0.92 },
    { g: SIDE, x: 6.4, yy: y + 7, spin: spin + 0.7, gain: 0.96 },
    { g: MAIN, x: 0, yy: y, spin, gain: 1 },
  ];
  const hi = [];
  for (const s of stones) {
    const h = drawGem(L, p, s.g, s.x, s.yy, s.spin, C, { tilt: 0.22, gain: s.gain });
    hi.push(h);
    p.glow(h.x, h.y, 6, C[5], 0.2);
  }
  // a white core line up the tall stone, clipped to the crystal pixels that are already there
  for (let v = -13; v <= 13; v++) {
    if (!p.get(0, y + v)) continue;
    if (v < -9 || v > 8) continue;
    p.px(0, y + v, v % 3 === 0 ? WHITE : C[5]);
  }
  // a pulse climbs the tall stone and flares at its point
  const climb = ((ph * 1.35) % 1) * 30 - 14;
  for (let v = Math.floor(climb) - 2; v <= Math.floor(climb) + 2; v++) {
    if (p.get(0, y + v)) p.px(0, y + v, Math.abs(v - climb) < 1 ? WHITE : C[6]);
  }
  if (climb > -14 && climb < 15) p.glow(0, y + climb, 8, C[6], 0.3 * Math.sin(((climb + 14) / 29) * Math.PI));

  // facet flashes: the brightest point of the front stone, and one of the shards
  const blink = 0.5 + 0.5 * Math.sin(ph * TAU * 2 + 1);
  glint(p, hi[2].x, hi[2].y, 1.3 + 1.8 * blink, C[6], 0.3 * blink);
  if (blink > 0.65) glint(p, hi[0].x, hi[0].y, 1.4, WHITE, 0.24);

  // splinters and motes orbiting the cluster
  cycle(t, T, 8, o.seed, 1.1, (age, life, r) => {
    const k = age / life, a = r.range(0, TAU) + ph * TAU * 0.7, d = r.range(11, 17);
    const x = Math.cos(a) * d, yy = y + 2 + Math.sin(a) * d * 0.55 - k * 4;
    const s = k > 0.7 ? C[5] : C[4];
    p.dot(x, yy, s, Math.sin(k * Math.PI));
    if (k > 0.35 && k < 0.6) p.px(x + 1, yy, C[6]);
    p.glow(x, yy, 2.5, C[5], 0.16 * Math.sin(k * Math.PI));
  });
  // three small splinters turning with the stones, each a 1-2 px glint of its own
  for (let i = 0; i < 3; i++) {
    const a = spin * 1.4 + (i * TAU) / 3 + 0.4, d = 9 + i * 1.6;
    const x = Math.cos(a) * d, yy = y + 4 + Math.sin(a) * d * 0.42 - rise * 2;
    p.px(x, yy, C[5]);
    if (i % 2) p.px(x + 0.6, yy + 0.6, C[6]);
  }
  // idle twinkles round the base
  for (let i = 0; i < 4; i++) {
    const life = 0.4, age = (((t - ((i + 0.3) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 2) * TAU, d = 10 + rand(i, o.seed, 3) * 5, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y + 4 + Math.sin(an) * d * 0.7, Math.round(1.5 * k), i % 2 ? C[6] : WHITE, 0.26 * k);
  }
}
