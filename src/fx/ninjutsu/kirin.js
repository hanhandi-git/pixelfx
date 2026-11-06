// Kirin: the sky answers. Storm clouds gather over the field, a stepped leader feels down, and a colossal
// white-blue bolt tears through the target, branching across the floor. The caster only raises a hand.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, band, burst, fly, READY } from "../../core/index.js";
import { VOLT, PLASMA } from "../lightning/_lib.js";
import { zigzag, stroke, crackle } from "../lightning/_lib.js";

const CHARGE = 0.88, HIT = 1.0, END = 3.2;
const TX = 280, TY = -30;
const TOP = -234;

export const meta = {
  name: "Kirin",
  desc: "Storm clouds gather over the field, a stepped leader feels for the target, and a colossal white-blue bolt tears down through it — branches, a shattered floor and a cold afterglow.",
  tags: ["chakra", "ninjutsu", "lightning", "kirin", "storm", "sky", "technique", "one-shot"],
  size: [420, 300],
  origin: [80, 260],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: VOLT, sparks: PLASMA, seed: 31 },
};

const RAISE = { ...READY, x: 0, crouch: 3, lean: -2, turn: 1, fx: 5, fy: -35, bx: -6, by: -20 };
const CALL = { ...READY, x: 0, crouch: 4, lean: 3, turn: 1, fx: 8, fy: -32, bx: -7, by: -24, ffx: 6, fbx: -6 };
const RECOIL = { ...READY, x: -2, crouch: 4, lean: -3, fx: 4, fy: -27, bx: -6, by: -20 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [0.12, RAISE],
    [0.72, { ...RAISE, crouch: 4, fx: 7, fy: -33 }],
    [0.94, CALL, "snap"],
    [HIT, { ...CALL, crouch: 5, lean: 5, fx: 10, fy: -30 }, "snap"],
    [HIT + 0.3, RECOIL],
    [2.4, { ...READY, x: -1 }],
    [END, READY],
  ],
  hits: [{ t: HIT, stop: 0.16, shake: 0.5, amp: 3, target: true, skin: "char" }],
  dust: [{ t: 0.2, x: 0, n: 6, dir: -1, c: "#9fdcff" }, { t: HIT, x: TX, n: 10, dir: -1, c: "#9fdcff" }],
};

const cloudK = (t) => smooth(0.02, 0.75, t) * (1 - smooth(2.7, 3.15, t));
const rainK = (t) => smooth(0.15, 0.7, t) * (1 - smooth(2.6, 3.05, t));

function cloud(p, C, t, S) {
  const k = cloudK(t);
  if (k <= 0.01) return;
  for (let i = 0; i < 20; i++) {
    const B = rng(S, i, 1);
    const x = 98 + B.range(0, 198), y = TOP + B.range(0, 40), r = 15 + B.range(0, 12);
    p.disc(x, y, r, C[1], 0.52 * k);
    p.disc(x - 2, y - 3, r * 0.62, C[2], 0.36 * k);
    p.dot(x + B.range(-r * 0.6, r * 0.6), y + r * 0.7, C[3], 0.14 * k);
  }
  // the cloud's own lightning: small, restless, never the main bolt
  if (t > 0.35) {
    const R = rng(S, Math.floor(t * 18), 3);
    for (let i = 0; i < 3; i++) {
      const x = 112 + R.range(0, 172);
      const b = zigzag(R, x, TOP + 20, x + R.range(-28, 28), TOP + 44 + R.range(0, 16), 0.35, 0.4, 0.4, 1);
      stroke(p, b, 0.35 * k, C, 1, { light: 0.5 });
    }
    p.glow(TX, TOP + 30, 36, C[4], 0.05 * k);
  }
  // the shadow the storm casts on the floor
  p.ellipse(200, 0, 132, 7.5, C[0], 0.22 * k);
}

function bolt(p, C, t, S) {
  if (t < CHARGE) return;
  const R = rng(S, Math.floor(t * 30), 5);
  const lead = t < HIT ? smooth(CHARGE, 0.98, t) * 0.45 : 0;
  const main = t >= HIT ? 1 - smooth(1.4, 1.9, t) : 0;
  const b = zigzag(R, TX, TOP + 4, TX, TY - 2, 0.16, 0, 1.8, 0);
  if (lead > 0) stroke(p, b, lead, C, 1.1, { light: 0.35 });
  if (main > 0) {
    stroke(p, b, main, C, 2.5, { hero: true, light: 0.62, core: 2.0 });
    crackle(p, b, main * 0.8, C, 0.38);
    for (let j = 0; j < 7; j++) {
      const y0 = TOP + 22 + j * 27;
      const bb = zigzag(R, TX, y0, TX + R.range(-34, 34), y0 + R.range(24, 56), 0.22, 0, 0.55, 1);
      stroke(p, bb, main * (0.55 + 0.3 * (1 - j / 7)), C, 1.3, { light: 0.5, core: 1.3 });
    }
  }
  if (main > 0.02) p.glow(TX, -110, 58, C[4], 0.12 * main);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), P = fit(o.sparks ?? PLASMA, 8), S = o.seed;
  const rain = rainK(t);

  // rain: thin, wind-slanted, and gone before the afterglow ends
  if (rain > 0.01) {
    const R = rng(S, Math.floor(t * 20), 7);
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 9);
      const x = 82 + B.range(0, 224) + t * 6;
      const y = -206 + ((t * (180 + B.range(0, 80)) + i * 27) % 195);
      if (y > -2 || x > 330) continue;
      p.line(x, y, x - 2.4, y + 8, i % 3 ? C[3] : C[4], 0.22 * rain);
    }
    for (let i = 0; i < 5; i++) {
      const B = rng(S, i, 11), q = (t * 0.8 + i / 5) % 1;
      if (q > 0.5) continue;
      p.ellipse(110 + i * 46, 0, 2 + q * 4, 1, C[4], 0.2 * rain);
    }
  }

  // the target gets a cold seal before the strike
  if (t < HIT) {
    const q = smooth(0.1, 0.8, t), k = 0.25 + 0.35 * q;
    p.ellipse(TX, 0, 20, 4.4, C[3], 0.35 * k);
    p.ellipse(TX, 0, 16, 3.2, C[5], 0.28 * k);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + t * 0.7;
      p.dot(TX + Math.cos(a) * 18, Math.sin(a) * 4, C[6], 0.35 * k);
    }
    if (t > CHARGE - 0.12) p.glow(TX, TY, 26, C[4], 0.3 * smooth(CHARGE - 0.12, HIT, t));
  }

  // the main stroke and its branches
  bolt(p, C, t, S);

  // contact: a white core, a flat crown, forks walking out along the floor
  if (t >= HIT && t < HIT + 0.55) {
    const q = (t - HIT) / 0.55, f = 1 - q;
    p.circle(TX, TY, 4 + 17 * ease.outQuad(q), WHITE, 0.95 * f);
    p.glow(TX, TY, 48, C[6], 0.42 * f);
    sparkle(p, TX, TY, 18 * f + 5, C[6], C[4], 0.8 * f);
    band(p, TX, 0, 14 + q * 44, 0.2, 1.8, 0.4 * f, C, undefined, q < 0.1);
    p.ellipse(TX, 0, 16 + q * 42, 3.4, C[6], 0.35 * f);
    const R = rng(S, Math.floor(t * 30), 13);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + R.range(-0.2, 0.2);
      const b = zigzag(R, TX, TY, TX + Math.cos(a) * R.range(28, 42), TY + Math.sin(a) * R.range(18, 38), 0.16, 0, 0.45, 1);
      stroke(p, b, f * 0.9, C, 1.1, { light: 0.4, core: 1.2 });
    }
    for (let i = 0; i < 38; i++) {
      const A = rng(S, i, 17), age = (t - HIT) * A.range(0.6, 1.5);
      const [x, y] = fly(TX, TY, A.range(-1, 1) * A.range(40, 170), A.range(-120, 40), age, 260, 0.6);
      if (y > -1 || x < 238 || x > 328) continue;
      p.dot(x, y, i % 5 ? C[5] : WHITE, 0.65 * f);
    }
  }

  // afterglow: smoke, a cooling channel, a few crawling arcs
  if (t > HIT && t < END) {
    const after = 1 - smooth(1.8, END, t);
    const R = rng(S, Math.floor(t * 12), 19);
    for (let i = 0; i < 5; i++) {
      const B = rng(S, i, 23), q = clamp((t - HIT) / 1.5);
      p.disc(TX + B.range(-20, 20) + q * B.range(-8, 8), -10 - q * B.range(10, 34), 5 + q * 6, C[2], 0.1 * after * (1 - q));
    }
    for (let i = 0; i < 5; i++) {
      const B = rng(S, i, 29), y = -2, x = TX + B.range(-34, 34);
      if (x < 236 || x > 326) continue;
      p.line(x, y, x + B.range(-9, 9), y - B.range(1, 4), C[4], 0.35 * after);
    }
    for (let i = 0; i < 4; i++) {
      const age = t - HIT - 0.3 - i * 0.22;
      if (age < 0 || age > 0.5) continue;
      const b = zigzag(R, TX - 36 + i * 22, -2, TX - 30 + i * 22, -12 - i * 3, 0.5, 0.1, 0.3, 1);
      stroke(p, b, (1 - age / 0.5) * 0.5, C, 1, { light: 0.4 });
    }
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  cloud(p, C, t, S);

  // scorched floor, branching cracks, and the black channel the current leaves
  if (t > HIT - 0.05) {
    const fade = 1 - smooth(2.4, END, t), q = smooth(HIT - 0.05, HIT + 0.2, t);
    p.ellipse(TX, 0, 16 + 10 * q, 3.4, C[1], 0.6 * fade);
    p.ellipse(TX, 0, 10 + 8 * q, 2.0, C[0], 0.5 * fade);
    const R = rng(S, 3, 31);
    for (let i = 0; i < 7; i++) {
      let x = TX, y = 0;
      const a = R.range(0, TAU);
      for (let k = 0; k < 5; k++) {
        const nx = x + Math.cos(a + R.range(-0.8, 0.8)) * R.range(3, 8);
        const ny = y - R.range(0, 2.2);
        if (nx < 230 || nx > 332) break;
        p.line(x, y, nx, ny, k === 0 ? C[3] : C[1], 0.45 * fade * (1 - k / 6));
        x = nx; y = ny;
      }
    }
  }
}
