// 须佐之男 · 十拳剑: the storm god's answer. Cloud ranks roll in over the field, a ring of tomoe drums beats
// around them, arcs climb the raised Totsuka blade, and one downward cut pulls a forked pillar of thunder
// through the clouds onto the target: a white hero frame, a torn floor, rain and cooling violet arcs.
import { READY, WHITE, clamp, ease, fit, loopNoise, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks, hotStar } from "../dragonball/_lib.js";
import { bend, crackle, stroke, zigzag } from "../lightning/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { STORM, VOLT, cloudBank, floorSeal, magatama } from "./_lib.js";

const END = 3.5, CUT = 0.9, HIT = 1.06;
const TX = 198, TY = -34;
const BY = -150, BX = 146;

export const meta = {
  name: "Susanoo, storm sword",
  desc: "The storm god raises the Totsuka blade; tomoe drums beat around a sea of cloud, and one downward cut pulls a forked pillar of thunder onto the target and leaves violet arcs.",
  tags: ["kami", "japan", "shinto", "storm", "thunder", "sword", "susanoo", "须佐之男", "建速须佐之男命", "十拳剑", "technique", "one-shot"],
  size: [340, 240],
  origin: [100, 210],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: STORM, fork: VOLT, seed: 47 },
};

const GUARD = { ...READY, weapon: "totsuka", two: true, x: -2, sa: -0.5, fx: 10, fy: -22, ffx: 6, fbx: -7 };
const RAISE = { ...GUARD, x: -6, crouch: 4, lean: -7, turn: 0.32, fx: 2, fy: -38, sa: -1.9, ffx: 6, fbx: -8 };
const CUTP = { ...GUARD, x: 5, crouch: 6, lean: 8, turn: 0.05, fx: 20, fy: -26, sa: 0.55, ffx: 13, fbx: -10, toeB: true };

export const act = {
  target: { x: TX },
  poses: [
    [-0.5, GUARD],
    [0.05, RAISE],
    [0.7, { ...RAISE, fy: -39, sa: -2.0 }],
    [CUT, CUTP, "snap"],
    [HIT, { ...CUTP, lean: 9, fy: -24, sa: 0.62 }, "snap"],
    [1.5, { ...CUTP, crouch: 4, lean: 5, sa: 0.4 }],
    [2.4, GUARD],
    [3.2, GUARD],
  ],
  hits: [
    { t: HIT, stop: 0.2, shake: 0.55, amp: 4, push: 2.6, straw: 24, skin: "shock" },
    { t: 1.34, stop: 0.04, shake: 0.16, amp: 1, push: 0, straw: 4, skin: null },
  ],
  dust: [{ t: HIT, x: TX, n: 10, dir: -1, c: "#c4fff0" }],
};

/** Keep every point of a bolt inside the canvas: forks try to leave, the frame does not. */
const keep = (b) => bend(b, (x, y) => [Math.max(-88, Math.min(232, x)), Math.max(-202, Math.min(2, y))]);

/** A taiko drum with a mitsudomoe on its face: two rings, a jade swirl and a bright rim. */
function tomoeDrum(p, C, x, y, r, ph, k) {
  if (k <= 0.02) return;
  p.ring(x, y, r, 1, C[4], 0.8 * k);
  p.ring(x, y, r - 1.4, 1, C[2], 0.6 * k);
  for (let i = 0; i < 3; i++) magatama(p, C, x + Math.cos(ph + (i / 3) * TAU) * r * 0.3, y + Math.sin(ph + (i / 3) * TAU) * r * 0.3, Math.max(1.5, r * 0.28), ph + (i / 3) * TAU + 1.8, 0.9 * k, { hole: false });
  p.dot(x, y, k > 0.5 ? WHITE : C[5], 0.7 * k);
  p.glow(x, y, r * 2.2, C[4], 0.12 * k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END;
  const fade = 1 - smooth(2.8, 3.45, t);
  // the storm's ceiling: two ranks of cloud, the lower one dragged down by the cut
  const pull = smooth(CUT, HIT + 0.3, t);
  cloudBank(p, C, BX, BY, 126, 52, 4, ph, 0.8 * fade, { body: 1, mid: 2, rim: 3, hot: 4 });
  cloudBank(p, C, BX + 22, BY + 26 + pull * 8, 96, 36, 9, ph + 0.3, 0.6 * fade, { body: 1, mid: 2, rim: 3, hot: 4, wisps: false });
  // a dim violet discharge inside the cloud, so the ceiling is never flat
  const flicker = Math.max(0, loopNoise(ph, 2, o.seed + 4) - 0.55) * 2.2;
  if (flicker > 0.02) p.glow(BX - 40 + 70 * loopNoise(ph, 1, o.seed + 8), BY + 10, 34, fit(o.fork ?? VOLT, 8)[4], 0.14 * flicker * fade);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), V = fit(o.fork ?? VOLT, 8), S = o.seed, ph = t / END;
  const R = rng(S, Math.floor(t * 30), 5);
  const fade = 1 - smooth(2.85, 3.45, t);
  const charge = smooth(0.03, CUT, t) * (1 - smooth(CUT + 0.05, CUT + 0.3, t));
  const after = smooth(HIT, HIT + 0.06, t) * (1 - smooth(2.9, 3.45, t));

  // the floor seal under the target, storm pale, and a pressure pool
  const sealK = smooth(0.12, 0.65, t) * (1 - smooth(2.7, 3.4, t));
  if (sealK > 0.02) {
    floorSeal(p, C, TX, -1, 22 + 2 * Math.sin(t * 4), -t * 1.2, 0.5 * sealK, { sq: 0.22, n: 22, core: 0.4, pool: true });
    p.ellipse(TX, -1, 15, 3, C[4], 0.2 * sealK);
    p.glow(TX, -1, 26, C[4], 0.14 * sealK);
  }

  // the tomoe drums: six of them beat around the cloud, faster as the cut approaches
  const drumK = smooth(0.05, 0.4, t) * fade;
  if (drumK > 0.02) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * (0.5 + charge * 1.2);
      const x = BX + 10 + Math.cos(a) * 56, y = BY + 16 + Math.sin(a) * 18;
      const beat = 0.55 + 0.45 * Math.sin(t * (7 + charge * 8) + i * 1.7);
      tomoeDrum(p, C, x, y, 4.2 + beat * 1.2, a + t, drumK * (0.4 + 0.6 * beat));
    }
  }

  // the blade collects the storm: arcs along its line, a violet corona on the raised tip
  if (charge > 0.02) {
    const tip = [2 + 12 * charge, -92 - 8 * charge];
    for (let i = 0; i < 3; i++) {
      const b = keep(zigzag(R, tip[0] + R.range(-8, 8), tip[1] + 6, tip[0] + R.range(-26, 26), tip[1] - R.range(10, 30), 0.3, 0.2, 0.6, 1));
      stroke(p, b, 0.5 * charge, V, 0.8, { light: 0.3, a: 0.8 });
    }
    p.glow(tip[0], tip[1], 16 + 8 * charge, C[4], 0.2 * charge);
    p.glow(tip[0], tip[1], 6, WHITE, 0.2 * charge);
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 7), a = B.range(0, TAU) + t * 2;
      const d = 4 + B.range(0, 16);
      p.dot(tip[0] + Math.cos(a) * d, tip[1] + Math.sin(a) * d, i % 3 ? C[4] : V[5], 0.5 * charge);
    }
  }

  // the cut: a horizontal tear of light across the cloud, then the leader drops
  if (t >= CUT) {
    const tear = 1 - smooth(CUT + 0.04, CUT + 0.22, t);
    if (tear > 0.02) {
      const reach = ease.outQuart(clamp((t - CUT) / 0.08));
      p.line(BX - 80, BY + 18, BX - 80 + 164 * reach, BY + 18, WHITE, 0.9 * tear);
      p.line(BX - 80, BY + 20, BX - 80 + 164 * reach, BY + 20, V[5], 0.6 * tear);
      p.glowLine(BX - 80, BY + 18, BX + 84, BY + 18, 9, C[4], 0.06 * tear);
    }
    const lead = t < HIT ? smooth(CUT, HIT, t) * 0.5 : 0;
    if (lead > 0.01) {
      const b = keep(zigzag(R, TX + 4, BY + 20, TX, TY - 4, 0.12, 0.16, 0.9, 0));
      stroke(p, b, lead, V, 0.9, { light: 0.35 });
    }
  }

  // the strike: a white pillar with violet forks, wide enough to own the frame
  if (t >= HIT && t < HIT + 1.5) {
    const k = 1 - smooth(HIT + 0.9, HIT + 1.45, t), hero = 1 - smooth(HIT, HIT + 0.08, t);
    if (k > 0.02) {
      const b = keep(zigzag(R, TX + 2, BY + 18, TX, TY, 0.1, 0.28, 2.2, 0));
      stroke(p, b, k, C, 1.5 + hero * 0.7, { hero: hero > 0.4, light: 0.4, core: 1.4 + hero });
      crackle(p, b, k * 0.9, C, 0.35);
      for (let j = 0; j < 7; j++) {
        const y0 = BY + 30 + j * 24;
        const bb = keep(zigzag(R, TX, y0, TX + R.range(-44, 44), y0 + R.range(16, 46), 0.28, 0.16, 0.6, 1));
        stroke(p, bb, k * (0.35 + 0.4 * (1 - j / 7)), C, 0.8, { light: 0.28 });
        if (j % 2 === 0) {
          const v = keep(zigzag(R, TX, y0 + 10, TX + R.range(-52, 40), y0 + R.range(24, 54), 0.32, 0.1, 0.4, 1));
          stroke(p, v, k * 0.5, V, 0.7, { light: 0.2, a: 0.85 });
        }
      }
      p.glowLine(TX + 2, BY + 20, TX, TY, 9, C[3], 0.06 * k);
      p.glow(TX - 8, -100, 26, C[3], 0.07 * k);
    }
  }

  // contact: a white heart, a ground ring, torn stone and rain thrown out of the strike
  if (t >= HIT && t < HIT + 0.7) {
    const q = (t - HIT) / 0.7, f = 1 - q;
    p.circle(TX, TY, 4 + 15 * ease.outQuad(q), WHITE, 0.95 * f);
    hotStar(p, TX, TY, 18 * f + 4, 0.3, C, 0.85 * f);
    sparkle(p, TX, TY, 20 * f + 5, C[6], C[4], 0.9 * f);
    sparkle(p, TX, TY, 12 * f + 3, V[6], V[4], 0.6 * f);
    pool(p, TX, 0, 30, 8, C[4], 0.4 * f);
    p.ellipse(TX, -1, 16 + q * 32, 3.6 + q * 2.6, C[5], 0.22 * f);
    p.ellipse(TX, -1, 11 + q * 22, 2.4 + q * 1.8, WHITE, 0.18 * f);
    p.glow(TX, TY, 28, C[4], 0.24 * f);
    p.glow(TX, TY, 14, WHITE, 0.24 * f);
    for (let i = 0; i < 22; i++) {
      const B = rng(S, i, 11), a = B.range(-Math.PI, 0.2), sp = B.range(24, 100);
      const d = q * sp, x = Math.max(-84, Math.min(228, TX + Math.cos(a) * d)), y = TY + Math.sin(a) * d + q * q * 26;
      p.dot(x, Math.min(2, y), i % 3 ? C[5] : WHITE, 0.85 * f);
      if (i % 4 === 0) p.glow(x, Math.min(2, y), 4, C[4], 0.1 * f);
    }
  }

  // the torn floor: a fan of cracks holding violet light
  const crackK = smooth(HIT - 0.02, HIT + 0.1, t) * (1 - smooth(2.6, 3.4, t));
  if (crackK > 0.02) {
    const hot = t < HIT + 0.4 ? C[6] : t < HIT + 0.9 ? C[5] : V[4];
    drawCracks(p, crackFan(S + 13, 10, 40, 1.0, 7), TX, -1, hot, crackK * 0.85);
    p.ellipse(TX, -1, 18, 3.2, C[4], 0.26 * crackK);
  }

  // rain and cooling arcs: the storm keeps falling after the strike
  if (after > 0.01) {
    for (let i = 0; i < 26; i++) {
      const B = rng(S, i, 17), born = HIT + B.range(0, 1.5), age = t - born;
      if (age < 0) continue;
      const k = (1 - age / 1.4) * after;
      if (k <= 0.02) continue;
      const x = Math.min(232, TX - 60 + B.range(0, 120) + age * 8), y = BY + 30 + age * B.range(50, 110) + B.range(0, 40);
      p.line(x, Math.min(2, y), x - 1, Math.min(2, y) + 3, C[4], 0.6 * k);
    }
    const s = keep(zigzag(R, TX - 40, -20, TX - 20, -2, 0.3, 0.1, 0.5, 1));
    stroke(p, s, 0.35 * after * (0.5 + 0.5 * Math.sin(t * 13)), V, 0.7, { light: 0.2 });
    p.glow(TX, -1, 28, C[4], 0.1 * after);
  }

  // a last wink of white on the seal before it goes out
  const wink = smooth(2.2, 2.4, t) * (1 - smooth(2.7, 3.2, t));
  if (wink > 0.02) glint(p, TX, -2, Math.round(1 + 2 * wink), C[6], 0.16 * wink);
}
