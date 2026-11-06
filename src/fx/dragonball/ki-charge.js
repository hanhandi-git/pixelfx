// Ki charge: the held breath of the whole set. Power pulls in from the air, presses into a blue sphere
// between cupped hands at the hip, and the ground answers with a pool of light. A loop, so it can sit under a
// beam or any other technique as its charge beat.
import { TAU, band, cycle, fit, loopNoise, smooth, READY } from "../../core/index.js";
import { KI, kiOrb, inwardStreaks, orbitMotes, floorLight, boltFleck } from "./_lib.js";

const D = 1.6, OX = 7, OY = -19.5;

export const meta = {
  name: "Ki charge",
  desc: "Power pulls in from the air and presses into a blue sphere between cupped hands at the hip: the ball breathes, charge crawls over its shell, and the floor catches cold light.",
  tags: ["ki", "dragonball", "charge", "orb", "hand", "power", "loop"],
  size: [156, 124],
  origin: [64, 116],
  duration: D,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: KI, seed: 9 },
};

const HOLD = { ...READY, x: -1, crouch: 6, lean: -2, turn: 1, fx: 9, fy: -19, bx: 2, by: -18, ffx: 7, fbx: -8, armsFront: true };
export const act = {
  poses: [
    [0, HOLD],
    [0.4, { ...HOLD, crouch: 7, lean: -3, fx: 10, fy: -18.5, bx: 3, by: -17.5 }],
    [0.8, { ...HOLD, crouch: 6, fx: 8.5, fy: -19.5, bx: 1.5, by: -18.5 }],
    [1.2, { ...HOLD, crouch: 7, lean: -3, fx: 10, fy: -18.5, bx: 3, by: -18 }],
    [1.6, HOLD],
  ],
};

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  floorLight(p, 9, C, 1, 24);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / D, S = o.seed;
  const breath = Math.sin(ph * TAU * 2);
  const r = 5.4 + 0.55 * breath + 0.3 * Math.sin(ph * TAU * 5);
  const x = OX, y = OY;

  // the ground and the body take the light first
  p.glow(9, -1, 26, C[4], 0.16);
  p.glow(9, -18, 26, C[4], 0.2);
  p.glow(2, -26, 14, C[5], 0.12);

  // two flat pressure rings, squeezed off the sphere half a loop apart and flattened by the view
  for (let i = 0; i < 2; i++) {
    const q = (ph * 2 + i * 0.5) % 1;
    const a = 0.4 * (1 - smooth(0.55, 1, q));
    if (a > 0.02) band(p, x, y, r + 1.5 + q * 13, 0.5, 1, a, C);
  }

  inwardStreaks(p, C, x, y, r, t, D, S * 3 + 1, 34, 28, -1);
  kiOrb(p, C, x, y, r, ph, { arms: 3, turns: 1.4, tilt: 0.4, seed: S });

  // charge crawling between the palms, off the ball and back
  for (let i = 0; i < 3; i++) {
    const q = loopNoise(ph, 3, S + i * 9);
    if (q < 0.45) continue;
    const a = ph * TAU + i * 1.9;
    boltFleck(p, x - 2, y - 2, a, 4.5 + 2.5 * q, C, (q - 0.45) * 1.6);
  }

  orbitMotes(p, C, x, y, r, ph, S * 7 + 3, 7);

  // a thin wisp of the ball torn off upwards
  cycle(t, D, 4, S * 5 + 2, D * 0.75, (age, life, R) => {
    const q = age / life, a = R.range(-2.6, -0.6);
    const px = x + Math.cos(a) * (3 + q * 9), py = y + Math.sin(a) * (3 + q * 9) - q * 5;
    p.dot(px, py, q < 0.4 ? C[6] : C[4], (1 - q) * 0.7);
  });

  // the hands are lit from inside
  p.glow(9, -19, 7, C[6], 0.18 + 0.05 * breath);
}
