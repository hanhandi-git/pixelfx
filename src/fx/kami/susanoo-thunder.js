// 须佐之男 · 十拳剑: a storm-drum rite. Three tomoe drums orbit the raised blade,
// wind bands tighten around the target, and the cut calls a forked thunder tree down.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks, floorLight, hotStar } from "../dragonball/_lib.js";
import { bend, crackle, stroke, zigzag } from "../lightning/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { STORM, VOLT, floorSeal, magatama } from "./_lib.js";

const END = 3.5, CUT = 0.88, HIT = 1.08;
const TX = 198, TY = -34;

export const meta = {
  name: "Susanoo, storm-drum sword",
  desc: "Three tomoe drums circle the Totsuka blade; their beat tightens a green wind coil, then a forked violet thunder tree crashes into the marked ground.",
  tags: ["kami", "japan", "shinto", "storm", "thunder", "sword", "susanoo", "须佐之男", "建速须佐之男命", "十拳剑", "technique", "one-shot"],
  size: [340, 240], origin: [100, 210], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: STORM, fork: VOLT, seed: 167 },
};

const REST = { ...READY, weapon: "totsuka", two: true, x: -2, sa: -0.5, fx: 10, fy: -22, ffx: 6, fbx: -7 };
const RAISE = { ...REST, x: -6, crouch: 4, lean: -7, turn: 0.32, fx: 2, fy: -38, sa: -1.9, ffx: 6, fbx: -8 };
const CUTP = { ...REST, x: 5, crouch: 6, lean: 8, turn: 0.05, fx: 20, fy: -26, sa: 0.55, ffx: 13, fbx: -10, toeB: true };

export const act = {
  target: { x: TX },
  poses: [
    [-0.5, REST], [0.05, RAISE], [0.68, { ...RAISE, fy: -39, sa: -2 }],
    [CUT, CUTP, "snap"], [HIT, { ...CUTP, lean: 9, fy: -24, sa: 0.62 }, "snap"],
    [1.55, { ...CUTP, crouch: 4, lean: 5, sa: 0.4 }], [2.4, REST], [3.2, REST],
  ],
  hits: [{ t: HIT, stop: 0.2, shake: 0.5, amp: 4, push: 2.6, straw: 24, skin: "shock" }],
  dust: [{ t: HIT, x: TX, n: 10, dir: -1, c: "#c4fff0" }],
};

function tomoe(p, C, x, y, r, ph, k) {
  if (k <= 0.02) return;
  p.circle(x, y, r, C[1], 0.55 * k);
  p.ring(x, y, r, 1, C[5], 0.72 * k);
  p.ring(x, y, r - 2, 1, C[2], 0.5 * k);
  for (let i = 0; i < 3; i++) {
    const a = ph + i * TAU / 3;
    magatama(p, C, x + Math.cos(a) * r * 0.26, y + Math.sin(a) * r * 0.26, Math.max(1.3, r * 0.25), a + 1.6, 0.68 * k, { hole: false });
  }
  p.dot(x, y, WHITE, 0.42 * k);
  p.glow(x, y, r * 2.1, C[4], 0.1 * k);
}

const keep = (b) => bend(b, (x, y) => [Math.max(-88, Math.min(232, x)), Math.max(-204, Math.min(2, y))]);

function thunderTree(p, C, V, k, seed) {
  const R = rng(seed, 0, 4);
  const trunk = keep(zigzag(R, TX, -148, TX, TY, 0.12, 0.3, 2.1, 0));
  stroke(p, trunk, k, C, 1.8, { hero: k > 0.65, light: 0.5, core: 1.6 });
  crackle(p, trunk, 0.85 * k, C, 0.35);
  for (let i = 0; i < 7; i++) {
    const y = -128 + i * 17, end = TX + R.range(-48, 48);
    const b = keep(zigzag(R, TX, y, end, y + R.range(16, 48), 0.24, 0.15, 0.65, i % 2));
    stroke(p, b, k * (0.32 + 0.45 * (1 - i / 7)), i % 2 ? V : C, 0.85, { light: 0.3, a: 0.9 });
  }
  p.glowLine(TX, -146, TX, TY, 8, C[4], 0.08 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), V = fit(o.fork ?? VOLT, 8), ph = t / END, fade = 1 - smooth(2.82, END, t);
  // three layered wind plates make the sky read as pressure, not a generic cloud blob
  for (let i = 0; i < 5; i++) {
    const x = 114 + i * 23 + Math.sin(ph * TAU + i) * 4;
    p.ellipse(x, -154 + (i % 2) * 18, 24, 8, C[1], 0.32 * fade);
    p.ellipse(x - 3, -159 + (i % 2) * 18, 17, 4, C[3], 0.22 * fade);
  }
  const seal = smooth(0.1, 0.58, t) * (1 - smooth(2.65, END, t));
  if (seal > 0.02) floorSeal(p, C, TX, -1, 24, -t * 1.15, 0.38 * seal, { sq: 0.22, n: 22, core: 0.32, pool: true });
  if (fade > 0.02) p.glow(TX, -1, 30, C[4], 0.08 * fade);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), V = fit(o.fork ?? VOLT, 8), S = o.seed, ph = t / END;
  const fade = 1 - smooth(2.86, END, t), charge = smooth(0.03, CUT, t) * (1 - smooth(CUT, CUT + 0.18, t));
  if (charge > 0.02) {
    const beat = 0.55 + 0.45 * Math.sin(t * 12);
    for (let i = 0; i < 3; i++) {
      const a = ph * TAU * 0.65 + i * TAU / 3;
      tomoe(p, C, 118 + Math.cos(a) * 54, -104 + Math.sin(a) * 20, 5 + beat * 1.8, a + t, charge * (0.55 + beat * 0.45));
    }
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 5), a = B.range(0, TAU) + t * 2.4, d = 6 + B.range(0, 22);
      p.dot(3 + Math.cos(a) * d, -90 + Math.sin(a) * d, i % 3 ? C[4] : V[5], 0.48 * charge);
    }
    p.glow(6, -92, 12 + 16 * charge, C[5], 0.12 * charge);
  }

  if (t >= CUT) {
    const snap = 1 - smooth(CUT, CUT + 0.2, t);
    if (snap > 0.02) {
      p.line(-6, -100, 164, -100, WHITE, 0.78 * snap);
      p.line(-6, -97, 164, -97, V[5], 0.5 * snap);
      p.glowLine(-6, -100, 164, -100, 10, C[4], 0.06 * snap);
    }
    const leader = smooth(CUT + 0.03, HIT, t);
    if (leader > 0.02 && t < HIT) thunderTree(p, C, V, leader * 0.45, S + 17);
  }

  if (t >= HIT && t < HIT + 1.34) {
    const q = clamp((t - HIT) / 1.34), k = 1 - smooth(0.72, 1.34, q);
    thunderTree(p, C, V, k, S + 31);
    p.circle(TX, TY, 4 + 14 * ease.outQuad(q), WHITE, 0.94 * (1 - q));
    hotStar(p, TX, TY, 18 * (1 - q) + 5, 0.2, C, 0.8 * (1 - q));
    sparkle(p, TX, TY, 19 * (1 - q) + 4, V[6], C[4], 0.72 * (1 - q));
    p.ellipse(TX, -1, 15 + q * 36, 3.6 + q * 2.2, C[5], 0.22 * (1 - q));
    pool(p, TX, 0, 30, 8, C[4], 0.28 * (1 - q));
  }

  const cracks = smooth(HIT, HIT + 0.08, t) * (1 - smooth(2.58, 3.35, t));
  if (cracks > 0.02) {
    drawCracks(p, crackFan(S + 9, 9, 42, 1.05, 7), TX, -1, t < HIT + 0.4 ? C[6] : V[4], cracks * 0.8);
    floorLight(p, TX, C, 0.12 * cracks, 28);
  }
  const after = smooth(HIT + 0.16, HIT + 0.45, t) * fade;
  if (after > 0.02) {
    for (let i = 0; i < 24; i++) {
      const B = rng(S, i, 51), born = HIT + B.range(0, 1.3), age = t - born;
      if (age < 0 || age > 1.35) continue;
      const k = (1 - age / 1.35) * after, x = TX + B.range(-64, 64) + age * B.range(-10, 10), y = -126 + age * B.range(40, 108);
      p.line(x, Math.min(1, y), x - 1, Math.min(2, y + 4), i % 2 ? V[4] : C[5], 0.55 * k);
    }
    glint(p, TX, -2, 1 + Math.round(2 * after), C[6], 0.14 * after);
  }
}
