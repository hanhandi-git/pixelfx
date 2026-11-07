// 云从剑 / 天丛云剑: Kusanagi cuts through a moving storm. The new read is a rising,
// hooked sword arc wrapped by a living cloud ribbon, not a flat beam across the screen.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { floorLight, hotStar } from "../dragonball/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { STORM, cloudBank, floorSeal } from "./_lib.js";

const END = 3.2, DRAW = 0.5, HIT = 0.68;
const TX = 226, TY = -32;

export const meta = {
  name: "Ame-no-Murakumo",
  desc: "Kusanagi winds up inside a low cloud sea, then carves a hooked rising arc that peels the murakumo open and leaves a cool wind spiral on the floor.",
  tags: ["kami", "japan", "shinto", "sword", "storm", "cloud", "wind", "云从剑", "天丛云剑", "草薙剑", "technique", "one-shot"],
  size: [360, 220], origin: [90, 190], duration: END, loop: false, fps: 30, bg: "ground", actor: 2,
  options: { palette: STORM, seed: 132 },
};

const REST = { ...READY, weapon: "kusanagi", x: -2, sa: -0.25, fx: 10, fy: -21, bx: 5, by: -24, ffx: 6, fbx: -7 };
const COIL = { ...REST, x: -8, crouch: 5, lean: -5, turn: 0.55, fx: -4, fy: -17, bx: 8, by: -27, sa: -2.7, ffx: 8, fbx: -9 };
const SWING = { ...REST, x: 5, crouch: 4, lean: 6, turn: 0.02, fx: 21, fy: -30, bx: -4, by: -23, sa: 0.5, ffx: 13, fbx: -10, ghost: 1 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, REST], [0.12, COIL], [0.42, { ...COIL, fy: -20 }],
    [DRAW, SWING, "snap"], [HIT, { ...SWING, x: 7, lean: 8 }, "snap"],
    [1.2, { ...SWING, x: 6, crouch: 3, lean: 3, ghost: 0 }], [2.0, REST], [3.0, REST],
  ],
  hits: [{ t: HIT, stop: 0.16, shake: 0.42, amp: 3, push: 2.6, straw: 22, skin: "shock" }],
  dust: [{ t: HIT, x: TX, n: 10, dir: -1, c: "#c4fff0" }],
};

function arcPoint(u, r = 1) {
  const a = -2.72 + u * 2.05;
  return [TX - 56 + Math.cos(a) * 88 * r, -34 + Math.sin(a) * 88 * r];
}

function cloudRibbon(p, C, u, k, seed, t) {
  if (k <= 0.02) return;
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const q = i / 18, [x, y] = arcPoint(q);
    const wob = Math.sin(q * 8 + t * 5 + seed) * (3 + 6 * u);
    pts.push([x, y + wob]);
  }
  p.polyline(pts, C[2], 0.26 * k);
  p.polyline(pts.map(([x, y]) => [x, y - 2]), C[4], 0.42 * k);
  for (let i = 0; i < 10; i++) {
    const q = (i / 9 + t * 0.18) % 1, [x, y] = arcPoint(q);
    p.ellipse(x, y + Math.sin(t * 3 + i) * 3, 7 + 3 * u, 2.5 + 1.5 * u, i % 3 ? C[3] : C[5], 0.3 * k);
  }
}

function swordArc(p, C, reach, k, hot = false) {
  const r = 88 * reach;
  p.arc(TX - 56, -34, r, 2.6, -2.72, -0.67, hot ? WHITE : C[4], 0.76 * k);
  p.arc(TX - 56, -34, r + 2.4, 1, -2.65, -0.74, hot ? C[6] : C[5], 0.72 * k);
  p.arc(TX - 56, -34, r + 5, 0.6, -2.53, -0.82, C[3], 0.35 * k);
  p.glowLine(TX - 56, -34, TX + 2, -96, 6, C[4], 0.06 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END, fade = 1 - smooth(2.62, END, t);
  cloudBank(p, C, 116, -92, 172, 48, 7, ph, 0.72 * fade, { body: 1, mid: 2, rim: 3, hot: 4, lumps: 8 });
  cloudBank(p, C, 180, -54, 112, 34, 11, ph + 0.2, 0.46 * fade, { body: 1, mid: 2, rim: 3, hot: 4, wisps: false, lumps: 6 });
  const seal = smooth(0.1, 0.55, t) * (1 - smooth(2.4, END, t));
  if (seal > 0.02) {
    floorSeal(p, C, TX, -1, 22, -t * 1.1, 0.34 * seal, { sq: 0.22, n: 22, core: 0.3, pool: true });
    floorLight(p, TX, C, 0.11 * seal, 28);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, ph = t / END, fade = 1 - smooth(2.58, END, t);
  const gather = smooth(0.03, DRAW, t) * (1 - smooth(DRAW, DRAW + 0.12, t));
  const cutAge = t - DRAW, reach = cutAge >= 0 ? ease.outQuart(clamp(cutAge / 0.17)) : 0;

  // A low current of wind pulls toward the blade before the swing.
  if (gather > 0.02) {
    for (let i = 0; i < 9; i++) {
      const B = rng(S, i, 3), y = -12 - i * 13 + Math.sin(t * 4 + i) * 2;
      const x = -58 + ((t * (28 + i * 4) + B.range(0, 180)) % 250);
      p.line(x, y, x + 18 + B.range(0, 18), y - 2, C[3], 0.38 * gather);
      p.dot(x + 20, y - 2, i % 3 ? C[5] : C[6], 0.42 * gather);
    }
    p.glow(17, -22, 16 + 10 * gather, C[5], 0.12 * gather);
  }

  const arcK = smooth(DRAW - 0.02, DRAW + 0.08, t) * fade;
  if (arcK > 0.02) {
    swordArc(p, C, 0.45 + 0.55 * reach, arcK, t < DRAW + 0.16);
    cloudRibbon(p, C, reach, arcK, 4, t);
    const [hx, hy] = arcPoint(reach);
    glint(p, hx, hy, Math.round(2 + 4 * (1 - reach)), WHITE, 0.26 * arcK);
    p.dot(hx, hy, WHITE, 0.8 * arcK);
  }

  if (t >= HIT && t < HIT + 0.74) {
    const q = (t - HIT) / 0.74, f = 1 - q;
    p.circle(TX, TY, 3 + 13 * ease.outQuad(q), WHITE, 0.92 * f);
    hotStar(p, TX, TY, 17 * f + 5, -0.6, C, 0.82 * f);
    sparkle(p, TX, TY, 19 * f + 4, WHITE, C[5], 0.82 * f);
    p.glow(TX, TY, 38, C[4], 0.18 * f);
    p.ellipse(TX, -1, 14 + q * 34, 3 + q * 2, C[5], 0.24 * f);
    pool(p, TX, 0, 28, 7, C[4], 0.28 * f);
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 17), a = B.range(-2.9, -0.15), d = q * B.range(20, 96);
      const x = Math.max(-78, Math.min(244, TX + Math.cos(a) * d));
      const y = Math.min(1, TY + Math.sin(a) * d + q * q * 22);
      p.line(x, y, x + B.range(-2, 3), y + B.range(1, 4), i % 3 ? C[5] : WHITE, 0.72 * f);
    }
  }

  // After the cut the cloud behaves like a torn cloth, curling around the empty seam.
  const after = smooth(HIT + 0.08, HIT + 0.38, t) * fade;
  if (after > 0.02) {
    const spin = (t - HIT) * 1.8;
    for (let j = 0; j < 2; j++) {
      const r = 26 + j * 13 + (t - HIT) * 10;
      p.arc(TX, -34, r, 2.2, -2.35 + spin + j * 0.2, -0.8 + spin + j * 0.2, j ? C[3] : C[5], 0.34 * after);
    }
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 29), age = t - HIT - B.range(0.1, 0.8);
      if (age < 0 || age > 1.6) continue;
      const q = age / 1.6, [x, y] = arcPoint(B.range(0.1, 0.95));
      p.ellipse(x + B.range(-18, 18), y + age * B.range(-12, 18), 5 + 4 * q, 2, i % 3 ? C[4] : C[6], (1 - q) * 0.38 * after);
    }
    p.glow(TX, -1, 30, C[4], 0.08 * after);
  }
  if (fade > 0.02) {
    const motes = smooth(0.3, 0.7, t) * fade;
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 41), x = -34 + B.range(0, 260), y = -26 - B.range(0, 76) + ((t * 8 + i * 9) % 32);
      p.dot(x, y, i % 3 ? C[4] : C[6], 0.26 * motes);
    }
  }
}
