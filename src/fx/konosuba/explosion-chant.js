// 爆裂魔法的咏唱: a blood-red seal spins under her feet with its runes standing up one by one, threads of dark
// crimson spiral off the ring and climb past her head, and the chant drags the air inward onto her chest. A
// seamless loop, so the incantation holds as long as it needs to; the blow is konosuba/explosion-strike.
import { fit, TAU, WHITE, clamp, ease, cycle } from "../../core/index.js";
import { floorRing, arc, drawArc } from "../arcane/_lib.js";
import { BLOOD, SEAL, floorSeal, sealLight, gatherMotes, rune } from "./_lib.js";

const D = 4, R = 50, SY = 0.27;

export const meta = {
  name: "Explosion chant",
  desc: "A blood-red seal spins under her feet, its runes standing up one by one, crimson threads spiralling off the ring past her head while the chant drags the air inward.",
  tags: ["konosuba", "explosion", "chant", "cast", "seal", "rune", "charge", "crimson", "loop"],
  size: [240, 180],
  origin: [120, 146],
  duration: D,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: BLOOD, seed: 13 },
};

// both hands on the staff, its butt on the floor, the tip over her head; she sinks a little on each beat
const CHANT = { turn: 1.02, crouch: 3, lean: 1, fx: 11, fy: -21, weapon: "staff", two: true, sa: -1.43, hy: 1 };
const DEEP = { ...CHANT, crouch: 5, lean: 3, fy: -20, sa: -1.37, hy: 2, hx: -1 };
export const act = {
  poses: [[0, CHANT], [1.1, DEEP], [2.1, { ...CHANT, crouch: 4 }], [3.0, DEEP], [D, CHANT]],
};

const CACHE = new Map();
function rampOf(palette) {
  const key = palette.join();
  let C = CACHE.get(key);
  if (!C) CACHE.set(key, (C = fit(palette, 8)));
  return C;
}

export function drawBack(p, t, o) {
  const C = rampOf(o.palette), ph = t / D, spin = ph * TAU, pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
  // the floor: one broad warm pool, then the seal's own light
  sealLight(p, 0, 0, R, SY, C[3], 0.55 + 0.35 * pulse);
  floorSeal(p, {
    r: R, sy: SY, spin, starSpin: -spin, write: 1, level: 0.72 + 0.22 * pulse, fill: 0.16, hot: 0.15 + 0.2 * pulse,
    C, keep: (g) => Math.sin(g) < 0,
  });
  aura(p, t, C, true);
  // the far half of the climbing threads
  threads(p, t, C, true);
}

export function draw(p, t, o) {
  const C = rampOf(o.palette), ph = t / D, spin = ph * TAU, pulse = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
  floorSeal(p, {
    r: R, sy: SY, spin, starSpin: -spin, write: 1, level: 0.78 + 0.18 * pulse, fill: 0, hot: 0.25 + 0.3 * pulse,
    C, keep: (g) => Math.sin(g) >= 0,
  });
  arcs(p, t, C);
  cinders(p, t, C);
  // three pressure rings crawl out of the seal, one per beat
  for (let i = 0; i < 3; i++) {
    const u = (((ph * 3 + i / 3) % 1) + 1) % 1, k = Math.pow(1 - u, 1.6);
    floorRing(p, 0, 0, R * (1 + 0.42 * ease.outCubic(u)), SY, () => (u < 0.2 ? WHITE : C[4]), () => 0.5 * k, (g) => Math.sin(g) >= 0);
    floorRing(p, 0, 0, R * (1 + 0.42 * ease.outCubic(u)), SY, () => (u < 0.2 ? WHITE : C[3]), () => 0.32 * k, (g) => Math.sin(g) < 0);
  }
  gatherMotes(p, { x: 0, y: -24, r0: 84, life: 1.05, period: D, t, n: 22, seed: o.seed, swirl: 1.7, squash: 0.5, C: SEAL, k: 0.95 });
  threads(p, t, C, false);
  aura(p, t, C, false);
  p.glow(0, -26, 24, C[5], 0.3 + 0.16 * pulse);
  p.glow(0, -14, 60, C[4], 0.1 + 0.05 * pulse);
  p.glow(0, 0, 44, C[4], 0.16 + 0.06 * pulse);
}

// a tight ring of six runes turning over her chest, thin enough that the body still reads through it
function aura(p, t, C, back) {
  const ph = t / D, rot = -ph * TAU;
  const rx = 16, ry = 10, cy = -25;
  for (let i = 0; i < 6; i++) {
    const g = rot + (i * TAU) / 6, z = Math.sin(g);
    if (z < 0 !== back) continue;
    const x = Math.cos(g) * rx, y = cy + z * ry * 0.55, k = 0.5 + 0.5 * Math.sin(ph * TAU * 3 + i);
    if (back) p.dot(x, y, C[3], 0.4);
    else rune(p, i + 2, x, y + 1, k > 0.6 ? C[6] : C[5], 0.85, C[2]);
    p.glow(x, y - 1, 5, C[4], 0.16 * k);
  }
}

// crimson arcs crawling over the seal and one longer bolt jumping off the rim
function arcs(p, t, C) {
  cycle(t, D, 9, 3, 0.3, (age, life, r) => {
    const k = 1 - age / life;
    const g0 = r.range(0, TAU), g1 = g0 + r.range(-0.9, 0.9), rr = R * r.range(0.3, 0.95);
    const paths = arc(r, Math.cos(g0) * rr, Math.sin(g0) * rr * SY, Math.cos(g1) * rr, Math.sin(g1) * rr * SY, { jag: 0.55, forks: 1, forkLen: 0.4 });
    drawArc(p, paths, { core: WHITE, body: C[6], halo: C[3], glow: C[4] }, k, 0.35);
  });
  cycle(t, D, 2, 11, 0.22, (age, life, r) => {
    const k = 1 - age / life, g = r.range(0, TAU);
    const paths = arc(r, Math.cos(g) * R, Math.sin(g) * R * SY, Math.cos(g + 0.5) * R * 1.5, Math.sin(g + 0.5) * R * 1.5 * SY, { jag: 0.6, forks: 2, forkLen: 0.45 });
    drawArc(p, paths, { core: WHITE, body: C[5], halo: C[2], glow: C[3] }, k * 0.8, 0.3);
  });
}

// cinders lifting off the ring, cooling as they climb
function cinders(p, t, C) {
  cycle(t, D, 24, 5, 1.5, (age, life, r) => {
    const u = age / life, g = r.range(0, TAU), rad = R * r.range(0.35, 1.02);
    const rise = 52 * ease.outCubic(u) * r.range(0.6, 1.3), sway = Math.sin(age * 4 + r.next() * TAU) * 4 * u;
    const x = Math.cos(g) * rad + sway, y = Math.sin(g) * rad * SY - rise;
    const k = Math.sin(Math.PI * clamp(u * 1.1)) * (0.75 + 0.25 * r.next());
    p.dot(x, y, u < 0.18 ? WHITE : u < 0.45 ? C[6] : u < 0.75 ? C[5] : C[4], k);
    if (u < 0.55) p.glow(x, y, 3.5, C[4], 0.22 * k);
  });
}

// the chant's air: threads of dark crimson spiralling off the ring and climbing well past her head
function threads(p, t, C, back) {
  cycle(t, D, 34, 9, 1.9, (age, life, r) => {
    const u = age / life, turn = r.range(1.4, 3.1);
    const g = r.range(0, TAU) + u * turn;
    const rad = r.range(26, R * 0.95) * (1 - 0.4 * u);
    const wob = Math.sin(age * 3.4 + r.next() * TAU) * 2.5 * u;
    const x = Math.cos(g) * rad + wob, y = Math.sin(g) * rad * SY - 108 * u * r.range(0.7, 1.15);
    const z = Math.sin(g);
    if (z < -0.15 !== back) return;
    const fade = Math.sin(Math.PI * clamp(u * 1.05)) * (back ? 0.6 : 1);
    // a short tail along the path so it reads as motion, not dots
    const g2 = g - turn * 0.02, rad2 = rad * 1.02, x2 = Math.cos(g2) * rad2, y2 = Math.sin(g2) * rad2 * SY - 108 * (u - 0.02) * r.range(0.7, 1.15);
    const c = u < 0.12 ? C[6] : u < 0.4 ? C[5] : u < 0.72 ? C[4] : C[3];
    p.line(x2, y2, x, y, c, 0.9 * fade);
    p.dot(x, y, u < 0.12 ? WHITE : c, fade);
    if (u < 0.4 && !back) p.glow(x, y, 3.5, C[4], 0.16 * fade);
  });
}
