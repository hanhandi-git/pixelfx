// 灭仙珠: a single black bead is flicked out, hangs over the target and cracks. What follows is quiet: a perfect
// white sphere unfolds, the target is simply gone, and only a glassy crater, gold dust and a violet halo are left.
import { READY, WHITE, band, clamp, ease, fit, hex, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks } from "../dragonball/_lib.js";
import { MIE, runeSeal } from "./_lib.js";

const END = 3.2;
const THROW = 0.3, HOVER = 0.62, BURST = 0.9;
const TX = 232, TY = -30, HAND = [15, -30];
const GOLD = hex("#f0cd7a");

export const meta = {
  name: "Immortal-slaying bead",
  desc: "A black bead is flicked out and hangs over the target; it cracks and a perfect white sphere unfolds without smoke, leaving a glassy crater, gold dust and a violet halo.",
  tags: ["xianxia", "fanren", "explosion", "bead", "annihilation", "white", "void", "灭仙珠", "technique", "one-shot"],
  size: [420, 260],
  origin: [70, 236],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: MIE, seed: 127 },
};

const HOLD = { ...READY, x: -1, crouch: 2, lean: -2, turn: 0.35, fx: 8, fy: -31, bx: -4, by: -22, ffx: 5 };
const Flick = { ...READY, x: 1, crouch: 2, lean: 4, turn: 0.08, fx: 18, fy: -31, bx: 1, by: -20, ffx: 11 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, READY],
    [0.06, HOLD],
    [THROW, Flick, "snap"],
    [1.2, { ...Flick, x: 2, crouch: 3, lean: 5, fx: 19, fy: -29 }],
    [2.2, { ...Flick, x: 1, crouch: 3, lean: 2, fx: 12, fy: -26 }],
    [END, READY],
  ],
  hits: [
    { t: BURST, stop: 0.24, shake: 0.6, amp: 4.5, push: 3.2, straw: 30, skin: "char" },
    { t: 1.16, stop: 0.05, shake: 0.2, amp: 2, push: 1, straw: 6 },
  ],
  dust: [{ t: BURST, x: TX, n: 10, dir: -1, c: "#efe2ff" }],
};

/** The bead: a black pearl with one white star inside and a gold band of script round its equator. */
function bead(p, x, y, r, spin, k) {
  if (k <= 0.02) return;
  p.circle(x, y, r, hex("#0a0710"), k);
  p.circle(x - r * 0.25, y - r * 0.25, r * 0.55, hex("#1c1530"), 0.8 * k);
  for (let i = 0; i < 8; i++) {
    const a = spin + (i / 8) * TAU;
    if (Math.sin(a) < -0.2) continue;
    p.dot(x + Math.cos(a) * (r + 0.4), y + Math.sin(a) * r * 0.55, GOLD, 0.55 * k);
  }
  p.dot(x - 0.5, y - 0.5, WHITE, 0.9 * k);
  p.glow(x, y, r * 3, hex("#bfa0d8"), 0.22 * k);
}

function beadAt(t, S) {
  if (t < THROW) return { x: HAND[0], y: HAND[1], k: smooth(0.02, 0.16, t), r: 2 };
  if (t < HOVER) {
    const q = ease.outCubic(clamp((t - THROW) / (HOVER - THROW))), R = rng(S, 3, 5);
    const cx = (HAND[0] + TX) / 2 + 10, cy = Math.min(HAND[1], TY) - 52;
    return {
      x: (1 - q) * (1 - q) * HAND[0] + 2 * (1 - q) * q * cx + q * q * (TX - 2),
      y: (1 - q) * (1 - q) * HAND[1] + 2 * (1 - q) * q * cy + q * q * TY,
      k: 1,
      r: 2 + q * 1.4,
      spin: q * 6 + R.next(),
    };
  }
  const q = smooth(HOVER, BURST, t);
  return { x: TX - 2, y: TY + Math.sin(t * 9) * 0.8, k: 1, r: 2.4 + q * 1.6, spin: 6 + (t - HOVER) * 8 };
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, B = beadAt(t, S);
  // a floor seal lights under the target as the bead hangs
  const seal = smooth(THROW + 0.15, HOVER, t) * (1 - smooth(2.4, 3.1, t));
  if (seal > 0.01) {
    runeSeal(p, TX, -1, 22, t * 1.1, C, 0.34 * seal, { sq: 0.2, n: 24, tick: 2 });
    p.ellipse(TX, -1, 14, 3, C[4], 0.16 * seal);
  }
  // the bead's shadow and the distorting shell before it opens
  if (B.k > 0.01 && t < BURST) {
    p.ellipse(B.x, -1, 5 + B.r, 1.4, C[2], 0.3 * B.k);
    for (let i = 0; i < 3; i++) {
      const r = B.r + 5 + i * 5 + Math.sin(t * 8 + i) * 1.5;
      p.ring(B.x, B.y, r, 0.6, C[3], 0.14 * B.k);
      p.ring(B.x, B.y, r * 0.68, 0.5, C[5], 0.1 * B.k);
    }
    p.glow(B.x, B.y, 22, C[4], 0.2 * B.k);
  }
  // the crater stays after everything: black glass, a violet rim
  const scar = smooth(BURST + 0.1, BURST + 0.4, t) * (1 - smooth(2.7, 3.18, t));
  if (scar > 0.01) {
    p.ellipse(TX, -1, 22, 4.2, hex("#07050c"), 0.5 * scar);
    p.ellipse(TX, -2, 15, 2.6, hex("#0e0a18"), 0.4 * scar);
    p.arc(TX, -1, 20, 0.8, 0.2, 3.0, C[4], 0.3 * scar);
    p.arc(TX, -1, 20, 0.8, 3.3, 5.9, C[5], 0.25 * scar);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, B = beadAt(t, S);
  const live = smooth(0.05, 0.3, t);

  // the throw
  if (t < BURST) {
    if (B.k > 0.01) {
      bead(p, B.x, B.y, B.r, B.spin ?? 0, B.k);
      // a thin gold line of flight, then the bead's own pinched light
      if (t > THROW && t < HOVER) {
        for (let j = 1; j <= 3; j++) {
          const q = beadAt(t - j * 0.035, S);
          p.dot(q.x, q.y, j < 2 ? GOLD : C[3], 0.4 * (1 - j * 0.22));
        }
        p.line(B.x - 16, B.y - 2, B.x - 4, B.y, GOLD, 0.25);
      }
      if (t > HOVER) {
        // cracks of white light open along the bead
        const q = smooth(HOVER, BURST, t);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * TAU + t * 2;
          p.line(B.x, B.y, B.x + Math.cos(a) * (2 + 6 * q), B.y + Math.sin(a) * (2 + 6 * q), WHITE, 0.5 * q);
        }
        p.glow(B.x, B.y, 16 + 24 * q, WHITE, 0.3 * q);
      }
    }
    // faint pressure ring on the floor
    p.ellipse(B.x, -1, 8 + (t / BURST) * 10, 1.8, C[4], 0.15 * live);
  }

  // the bloom: a pure white sphere, a gold rim, thin shells running out of it
  if (t >= BURST) {
    const age = t - BURST;
    const open = smooth(0, 0.12, age), thin = smooth(0.16, 0.9, age);
    if (age < 1.5) {
      const r = 3 + 38 * ease.outQuart(open);
      // the core stays white and hard; the shell thins to a ring
      p.circle(TX, TY, r, WHITE, 1 - thin * 0.55);
      p.circle(TX, TY, r * 0.74, WHITE, 1 - thin);
      p.ring(TX, TY, r + 1.5, 1.2, WHITE, 0.9 * (1 - thin));
      p.ring(TX, TY, r + 3.5, 1, GOLD, 0.55 * (1 - thin));
      p.ring(TX, TY, r + 8, 0.8, C[3], 0.32 * (1 - thin));
      p.glow(TX, TY, r * 2.2, C[4], 0.35 * (1 - thin));
      p.glow(TX, TY, r * 1.2, WHITE, 0.4 * (1 - thin));
      // the erasure: everything within the sphere is white, including the target
      if (age < 0.24) {
        p.circle(TX, TY, 34 + 9 * (age / 0.24), WHITE, 0.85 * (1 - age / 0.24));
        sparkle(p, TX, TY, 26, WHITE, C[4], 0.9 * (1 - age / 0.24));
      }
    }
    // the pressure shells, rushing outward faster than the light
    if (age < 0.9) {
      const q = age / 0.9;
      p.ellipse(TX, TY, 30 + q * 90, 5 + q * 10, C[5], 0.22 * (1 - q));
      p.ellipse(TX, TY, 22 + q * 60, 3 + q * 7, WHITE, 0.18 * (1 - q));
      p.ellipse(TX, -1, 20 + q * 70, 4 + q * 4, C[4], 0.2 * (1 - q));
    }
    // debris: bright fragments thrown out, then settling into gold dust
    if (age < 1.2) {
      const q = age / 1.2, f = 1 - q;
      for (let i = 0; i < 26; i++) {
        const R = rng(S, i, 17), a = R.range(0, TAU), sp = R.range(30, 120);
        const d = ease.outCubic(q) * sp;
        const x = TX + Math.cos(a) * d, y = Math.min(-1, TY + Math.sin(a) * d * 0.8 + q * q * 30);
        p.dot(x, y, i % 3 ? C[5] : WHITE, 0.8 * f);
      }
    }
    // the floor crack fan and the glassy crater
    const crackK = smooth(BURST, BURST + 0.1, t) * (1 - smooth(2.6, 3.1, t));
    if (crackK > 0.02) drawCracks(p, crackFan(S + 13, 8, 52, 1.0, 7), TX, -1, C[4], crackK * 0.7);
    // a vertical needle of light where the sphere stood
    if (age < 1.1) {
      const f = 1 - smooth(0.2, 1.1, age);
      p.beam(TX, TY - 120 * f, TX, -4, 1, WHITE, 0.3 * f);
    }
    // slow violet motes climbing out of the crater
    const motes = smooth(BURST + 0.2, 1.4, t) * (1 - smooth(2.75, 3.18, t));
    if (motes > 0.01) {
      for (let i = 0; i < 16; i++) {
        const R = rng(S, i, 23), born = BURST + 0.2 + R.range(0, 1.3), a2 = t - born;
        if (a2 < 0) continue;
        const x = TX + R.range(-22, 22) + Math.sin(a2 * 2 + i) * 2, y = -2 - a2 * R.range(9, 24);
        p.dot(x, y, i % 4 ? C[4] : WHITE, 0.65 * motes);
      }
    }
  }
}
