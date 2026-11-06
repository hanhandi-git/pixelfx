// Sage art: Gate of the Great God. A pillar of sage light opens overhead and three vermilion torii gates
// drop out of it, the last one landing over the target. Gold is the chakra, jade the natural energy, and the
// gates themselves are old red wood with black iron caps and a little sage script on the posts.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, band, READY } from "../../core/index.js";
import { SAGE, JADE, floorSeal, glintStar } from "../ninjutsu/_lib.js";

const TX = 250, FALL = 140, END = 3.4;
const VERMILION = ["#100506", "#25090a", "#48100e", "#6d1a13", "#96281a", "#c23c22", "#e86838", "#ffb06a"];

export const meta = {
  name: "Gate of the Great God",
  desc: "A sage-light pillar opens in the sky and three red torii gates drop through it, the last pinning the target: dust, gold rings, jade motes and old wood shaking on the floor.",
  tags: ["chakra", "senjutsu", "sage", "gate", "torii", "wood", "pin", "technique", "one-shot"],
  size: [440, 300],
  origin: [80, 260],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SAGE, natural: JADE, gate: VERMILION, seed: 92, reach: TX },
};

const SEAL = { ...READY, x: -2, crouch: 6, lean: -2, turn: 1, fx: 6, fy: -24, bx: -6, by: -24, armsFront: true };
const PRAY = { ...READY, x: 0, crouch: 8, lean: -4, turn: 1, fx: 0, fy: -26, bx: 0, by: -26, armsFront: true };
const CALL = { ...READY, x: 2, crouch: 5, lean: 2, turn: 1, fx: 7, fy: -30, bx: -2, by: -30, ffx: 4, fbx: -4 };
const SLAM = { ...READY, x: 5, crouch: 7, lean: 7, turn: 1, fx: 13, fy: -17, bx: -7, by: -24, ffx: 10, fbx: -7, toeB: true };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [0.1, SEAL],
    [0.48, { ...SEAL, crouch: 9, lean: -5 }],
    [0.7, PRAY],
    [0.93, CALL],
    [1.05, { ...SLAM, crouch: 6, lean: 5 }, "snap"],
    [1.54, { ...SLAM, crouch: 8, lean: 8 }, "snap"],
    [2.4, { ...SLAM, crouch: 5, lean: 4 }],
    [3.0, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [
    { t: 1.06, stop: 0.16, shake: 0.4, amp: 3.5, push: 2.4, straw: 22, skin: "holy" },
    { t: 1.30, stop: 0.1, shake: 0.3, amp: 2.6, push: 1.6, straw: 12 },
    { t: 1.54, stop: 0.14, shake: 0.36, amp: 3.2, push: 1.8, straw: 16, skin: "holy" },
  ],
  dust: [
    { t: 1.06, x: 208, n: 8, dir: 1 },
    { t: 1.30, x: 292, n: 8, dir: -1 },
    { t: 1.54, x: TX, n: 10, dir: -1 },
  ],
};

const GATES = [
  { x: 208, h: 82, w: 54, delay: 0.86, land: 1.06, back: true },
  { x: 292, h: 78, w: 50, delay: 1.1, land: 1.3, back: true },
  { x: TX, h: 98, w: 64, delay: 1.34, land: 1.54, back: false },
];

function post(p, G, x, top, h, a) {
  p.rect(x - 4, top + 2, 8, h, G[3], a);
  p.rect(x - 4, top + 2, 2, h, G[4], a * 0.9);
  p.rect(x + 2, top + 2, 2, h, G[2], a * 0.8);
  // black iron foot and cap
  p.rect(x - 6, -1, 12, 6, G[0], a);
  p.rect(x - 5, top, 10, 4, G[1], a);
  p.rect(x - 4, top + 3, 8, 1, G[5], a * 0.7);
}

function gate(p, C, G, J, g, t, a) {
  const { x, h, w } = g, top = -h;
  // the shadow on the floor, soft and long while the gate is still high
  p.ellipse(x, 0, w * 0.62, 3.2, C[1], 0.35 * a);
  p.ellipse(x, 0, w * 0.45, 1.4, C[3], 0.25 * a);
  post(p, G, x - w / 2 + 7, top + 4, h - 4, a);
  post(p, G, x + w / 2 - 7, top + 4, h - 4, a);
  // the doubled top beam: a curved kasagi with upturned ends, a dark cap and a gold underside
  const lx = w / 2 + 10;
  p.poly([[x - lx, top - 8], [x - lx + 7, top - 3], [x + lx - 7, top - 3], [x + lx, top - 8], [x + lx - 3, top + 1], [x + lx - 11, top + 3], [x - lx + 11, top + 3], [x - lx + 3, top + 1]], G[4], a);
  p.line(x - lx + 2, top - 7, x + lx - 2, top - 7, G[0], a * 0.9);
  p.line(x - lx + 9, top + 2, x + lx - 9, top + 2, C[5], a * 0.8);
  p.poly([[x - lx + 7, top - 3], [x - lx + 14, top + 1], [x + lx - 14, top + 1], [x + lx - 7, top - 3]], G[2], a * 0.7);
  // nuki: the straight second beam
  p.rect(x - w / 2 + 2, top + 13, w - 4, 5, G[3], a);
  p.rect(x - w / 2 + 2, top + 13, w - 4, 1, G[5], a * 0.7);
  p.rect(x - w / 2 + 2, top + 17, w - 4, 1, G[1], a * 0.8);
  // plaque between the beams, with a jade gem
  p.rect(x - 7, top + 5, 14, 8, G[2], a);
  p.rect(x - 7, top + 5, 14, 1, C[6], a * 0.7);
  p.rect(x - 6, top + 6, 12, 6, G[1], a * 0.55);
  p.circle(x, top + 9, 2.2, J[5], a * 0.9);
  p.dot(x - 0.5, top + 8, WHITE, a * 0.8);
  p.glow(x, top + 9, 12, JADE[5], 0.18 * a);
  // sage script on the posts: a few gold ticks, a jade dot
  for (const sx of [x - w / 2 + 7, x + w / 2 - 7]) {
    for (let i = 0; i < 4; i++) {
      const yy = top + 26 + i * 9;
      p.line(sx - 2, yy, sx + 2, yy + 1, C[5], a * 0.7);
    }
    p.dot(sx, -12, J[5], a * 0.7);
  }
  // a rim of sage light along the whole gate
  p.line(x - w / 2 + 3, top + 20, x - w / 2 + 3, -3, C[5], a * 0.45);
  p.line(x + w / 2 - 3, top + 20, x + w / 2 - 3, -3, C[4], a * 0.35);
  if (J) p.glow(x, top + 12, w * 0.65, C[5], 0.14 * a);
}

function gateImpact(p, C, G, g, t, a) {
  const q = t - g.land;
  if (q < 0 || q > 1.1) return;
  const k = 1 - smooth(0, 1.1, q), w = g.w;
  p.ellipse(g.x, 0, w * 0.7 + q * 22, 3.2, C[5], 0.4 * k);
  p.ellipse(g.x, 0, w * 0.45 + q * 14, 1.6, C[6], 0.3 * k);
  p.ellipse(g.x, 0, 12 + q * 22, 1.4, C[5], 0.3 * k);
  for (let i = 0; i < 12; i++) {
    const B = rng(g.x, i, 5), side = i % 2 ? 1 : -1, age = q - B.range(0, 0.18);
    if (age < 0) continue;
    const x = g.x + side * (w * 0.3 + age * B.range(16, 46));
    const y = -1 - B.range(1, 10) - age * B.range(5, 24) + age * age * 120;
    if (y > 0) continue;
    p.dot(x, y, i % 3 ? C[4] : C[6], 0.45 * k);
  }
  for (let i = 0; i < 8; i++) {
    const B = rng(g.x, i, 7), a0 = B.range(-2.8, -0.3), sp = B.range(30, 90);
    const [x, y] = [g.x + Math.cos(a0) * sp * q, -1 + Math.sin(a0) * sp * q + 180 * q * q];
    if (y < -1 || y > 0) continue;
    p.dot(x, y, i % 2 ? G[6] : C[5], 0.5 * k);
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.gate ?? VERMILION, 8), J = fit(o.natural ?? JADE, 8), S = o.seed;
  const fade = 1 - smooth(2.7, 3.25, t);
  // the pillar of sage light: a narrow shaft, a wide halo, motes climbing it
  const shaft = smooth(0.18, 0.7, t) * fade;
  if (shaft > 0.01) {
    p.rect(TX - 30, -246, 60, 246, C[2], 0.06 * shaft);
    p.rect(TX - 13, -246, 26, 246, C[3], 0.07 * shaft);
    p.line(TX - 22, -246, TX - 22, -4, C[5], 0.2 * shaft);
    p.line(TX + 22, -246, TX + 22, -4, J[5], 0.16 * shaft);
    p.glow(TX, -66, 64, C[4], 0.09 * shaft);
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 13), q = (t * 0.5 + B.next()) % 1;
      p.dot(TX + B.range(-30, 30) * (1 - q * 0.3), -4 - q * 210, i % 3 ? G[5] : J[5], 0.35 * shaft * (1 - q));
    }
    for (let i = 0; i < 6; i++) {
      const y = -28 - ((t * 90 + i * 37) % 190);
      p.line(TX - 18 + i * 7, y, TX - 14 + i * 7, y - 8, i % 2 ? J[5] : C[6], 0.32 * shaft);
    }
  }
  floorSeal(p, C, TX, 0, 28 + 3 * Math.sin(t * 2), 0.22, 0.2, shaft * 0.9);
  // back gates fall behind the target
  for (const g of GATES) {
    if (!g.back) continue;
    const q = ease.inQuad(clamp((t - g.delay) / (g.land - g.delay), 0, 1));
    if (t < g.delay) continue;
    const base = -FALL * (1 - q);
    const p2 = p; // keep geometry local to the gate
    // draw at a raised base by shifting the gate's floor: use a temporary offset through lines
    drawRaisedGate(p2, C, G, J, g, base, fade);
    gateImpact(p2, C, G, { ...g, x: g.x }, t, fade);
  }
  // the cracks the first two gates opened, before the target
  for (const g of GATES) {
    const q = t - g.land;
    if (q < 0) continue;
    const k = smooth(0, 0.5, q) * fade;
    for (let i = 0; i < 4; i++) {
      const R = rng(g.x, i, 17), side = i % 2 ? 1 : -1;
      let x = g.x + side * g.w * 0.44, y = -1;
      p.line(x, y, x + side * R.range(4, 14), y - R.range(0, 2), G[1], 0.45 * k);
    }
  }
  // jade and gold dust settling on the floor
  for (let i = 0; i < 16; i++) {
    const B = rng(S, i, 23);
    p.dot(B.range(170, 330), B.range(-2, 1), i % 3 ? G[5] : J[5], 0.3 * fade);
  }
}

// gates in drawBack need a raised floor; drawGate works in floor space, so shift a copy with a small wrapper.
function drawRaisedGate(p, C, G, J, g, base, a) {
  // a simple translated version of the gate body, used only for the two back gates
  const x = g.x, h = g.h, w = g.w, top = base - h;
  p.ellipse(x, 0, w * 0.62, 3.2, C[1], 0.3 * a);
  postAt(p, G, x - w / 2 + 7, top + 4, h - 4, a);
  postAt(p, G, x + w / 2 - 7, top + 4, h - 4, a);
  const lx = w / 2 + 10;
  p.poly([[x - lx, top - 8], [x - lx + 7, top - 3], [x + lx - 7, top - 3], [x + lx, top - 8], [x + lx - 3, top + 1], [x + lx - 11, top + 3], [x - lx + 11, top + 3], [x - lx + 3, top + 1]], G[4], a);
  p.line(x - lx + 2, top - 7, x + lx - 2, top - 7, G[0], a * 0.9);
  p.line(x - lx + 9, top + 2, x + lx - 9, top + 2, C[5], a * 0.8);
  p.rect(x - w / 2 + 2, top + 13, w - 4, 5, G[3], a);
  p.rect(x - w / 2 + 2, top + 13, w - 4, 1, G[5], a * 0.7);
  p.rect(x - 7, top + 5, 14, 8, G[2], a);
  p.circle(x, top + 9, 2.2, J[5], a * 0.9);
  p.dot(x - 0.5, top + 8, WHITE, a * 0.8);
}

function postAt(p, G, x, top, h, a) {
  p.rect(x - 4, top + 2, 8, h, G[3], a);
  p.rect(x - 4, top + 2, 2, h, G[4], a * 0.9);
  p.rect(x + 2, top + 2, 2, h, G[2], a * 0.8);
  p.rect(x - 6, top + h - 2, 12, 6, G[0], a);
  p.rect(x - 5, top, 10, 4, G[1], a);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), G = fit(o.gate ?? VERMILION, 8), J = fit(o.natural ?? JADE, 8), S = o.seed;
  const fade = 1 - smooth(2.7, 3.25, t);
  const g = GATES[2];
  if (t >= g.delay) {
    const q = ease.inQuad(clamp((t - g.delay) / (g.land - g.delay), 0, 1));
    const base = -FALL * (1 - q);
    if (base > -0.5) gate(p, C, G, J, g, t, fade);
    else {
      // during the fall the same geometry is translated; a compact version keeps the silhouette
      drawRaisedGate(p, C, G, J, g, base, fade);
    }
    gateImpact(p, C, G, { ...g, x: g.x }, t, fade);
  }
  // gold and jade motes around the main gate
  if (t > 0.7) {
    for (let i = 0; i < 18; i++) {
      const B = rng(S, i, 41), q = (t * 0.4 + B.next()) % 1;
      p.dot(g.x + B.range(-g.w * 0.7, g.w * 0.7), -q * 130 - B.range(0, 10), i % 3 ? G[6] : J[6], 0.35 * fade * (1 - q));
    }
  }
  glintStar(p, g.x, -g.h * 0.55, 16 + 4 * Math.sin(t * 3), t, C, 0.35 * fade);
  if (t > g.land && t < g.land + 0.28) {
    const q = (t - g.land) / 0.28, k = 1 - q;
    for (let i = 0; i < 10; i++) {
      const a = i * TAU / 10, len = 18 + 42 * q;
      p.line(g.x + Math.cos(a) * 6, -2 + Math.sin(a) * 2,
        g.x + Math.cos(a) * len, -2 + Math.sin(a) * len * 0.3,
        i % 2 ? C[5] : J[5], k * 0.65);
    }
  }
}
