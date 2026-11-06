// Chakra blue, a held sphere: the chakra winds in from the air, the arms turn inside a pressed shell, and the
// heart goes white. The composition is original to pixelfx; the spiral-in choreography follows the library's
// energy-charge recipe (Sprite Fusion, MIT).
import { READY, TAU, cycle, fit, smooth } from "../../core/index.js";
import { CHAKRA, chakraOrb, inwardStreaks, orbitingMotes, floorLight, glintStar } from "./_lib.js";

const D = 1.4, HX = 16, HY = -23;

export const meta = {
  name: "Spiral orb",
  desc: "Chakra winds into a churning sphere above his palm: three spiral arms turn inside a pressed shell, the heart burns white, and the rim throws a cold pool of light.",
  tags: ["chakra", "ninjutsu", "orb", "hand", "technique", "spiral", "loop"],
  size: [116, 84],
  origin: [44, 78],
  duration: D,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: CHAKRA, seed: 6 },
};

const HOLD = { ...READY, x: 2, crouch: 4, lean: 2, turn: 1, fx: 16, fy: -23, bx: 10, by: -17, ffx: 10, fbx: -8 };
export const act = {
  poses: [
    [0, HOLD],
    [0.35, { ...HOLD, crouch: 5, fy: -24, x: -1 }],
    [0.7, { ...HOLD, crouch: 4, fy: -22.5, x: -2.5 }],
    [1.05, { ...HOLD, crouch: 5, fy: -23.5, x: -1.5 }],
    [1.4, HOLD],
  ],
};

export function drawBack(p, t, o) {
  floorLight(p, 4, fit(o.palette, 8), 1, 26);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), ph = t / D, S = o.seed;
  const breath = 0.45 * Math.sin(ph * TAU * 2);
  const r = 8.8 + breath;
  // an unsettled core: it jumps a pixel on the peak of each breath
  const jx = Math.sin(ph * TAU * 2 + 0.6) > 0.92 ? 0.5 : 0;
  const x = HX + jx, y = HY - 0.3 * Math.sin(ph * TAU * 4);

  // pressure shells: one squeezed out of the ball four times a loop
  for (let k = 0; k < 2; k++) {
    const q = (ph * 4 + k * 0.5) % 1;
    const fade = (1 - smooth(0.55, 1, q)) * 0.3;
    if (fade <= 0) continue;
    p.arc(x, y, r + 2 + q * 9, 1, -2.4, 1.6, C[5], fade);
  }

  inwardStreaks(p, C, x, y, r, t, D, S * 3 + 1, 46, 34, -1);
  chakraOrb(p, C, x, y, r, ph, { arms: 3, turns: 2, tilt: 0.3 });

  // three wisps torn off the rim, each orbiting the ball
  cycle(t, D, 3, S * 5 + 2, D * 0.9, (age, life, R) => {
    const q = age / life, a0 = R.range(0, TAU), a = a0 + q * 1.4;
    const d = r + 2 + 7 * q;
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.9;
    p.dot(px, py, q < 0.4 ? C[6] : C[4], (1 - q) * 0.8);
    if (q < 0.5) p.dot(px - Math.cos(a) * 1.5, py - Math.sin(a) * 1.4, C[3], (1 - q) * 0.5);
  });

  orbitingMotes(p, C, x, y, r, ph, S * 7 + 3, 8);
  if (Math.sin(ph * TAU * 3) > 0.2) glintStar(p, x + 3.5, y - 5, 3.2, ph, C, 0.5 * Math.sin(ph * TAU * 3));

  // the palm and forearm are lit from the ball
  p.glow(16, -20, 20, C[4], 0.24);
  p.glow(10, -17, 9, C[5], 0.16);
}
