// Earth release: earth wall. A rampart of broken stone slabs tears out of the ground in front of the caster,
// holds under its own dust, then crumbles. Slabs are deterministic polygons; no target, the wall is the subject.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, READY } from "../../core/index.js";
import { PAL } from "../../core/color.js";

const RISE = 0.5, HOLD = 1.78, FALL = 2.24, END = 2.8;
const WX = 84, WALL_W = 54;

export const meta = {
  name: "Earth wall",
  desc: "He drives both palms into the ground and a rampart of broken stone tears up in front of him — slabs, dust and a cracked floor, holding for a breath before it crumbles.",
  tags: ["chakra", "ninjutsu", "earth", "stone", "defense", "wall", "technique", "one-shot"],
  size: [270, 170],
  origin: [70, 146],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: PAL.stone, dirt: PAL.earth, seed: 61 },
};

const SEAL = { ...READY, x: -3, crouch: 8, lean: -2, turn: 1, fx: 5, fy: -22, bx: -5, by: -24 };
const SLAM = { ...READY, x: 4, crouch: 9, lean: 8, turn: 1, fx: 10, fy: -14, bx: -7, by: -24, ffx: 8, fbx: -6, toeB: true };
const HOLD_POSE = { ...READY, x: 3, crouch: 4, lean: 2, fx: 9, fy: -18, bx: -6, by: -24 };

export const act = {
  poses: [
    [-0.4, { ...READY, x: -3 }],
    [0.08, SEAL],
    [0.36, { ...SEAL, crouch: 9, lean: -4 }],
    [0.46, SLAM, "snap"],
    [1.7, HOLD_POSE],
    [2.35, { ...HOLD_POSE, crouch: 3, lean: 1 }],
    [END, READY],
  ],
  hits: [],
  dust: [{ t: 0.46, x: 10, n: 10, dir: 1, c: "#c9ad82" }, { t: 2.2, x: WX, n: 8, dir: 1, c: "#b79768" }],
};

function slabAt(S, i, t) {
  const R = rng(S, i, 3);
  const col = i % 3, row = Math.floor(i / 3);
  const delay = row * 0.035 + R.range(0, 0.06);
  const u = smooth(RISE + delay, 0.74 + delay, t);
  const fall = smooth(HOLD + delay, FALL + 0.3 + delay, t);
  const a = smooth(RISE + delay, 0.62 + delay, t) * (1 - smooth(FALL + 0.3 + delay, END - 0.05, t));
  return {
    x: WX + (col - 1) * 16 + R.range(-2.5, 2.5),
    y: -7 - row * 15 - R.range(0, 4) + (1 - u) * 24 + fall * 10,
    w: R.range(13, 19),
    h: R.range(10, 16),
    rot: R.range(-0.28, 0.28) + fall * 0.35 * R.sign(),
    a,
    u,
    seed: Math.floor(R.range(0, 1000)),
  };
}

function slab(p, C, s) {
  if (s.a <= 0.01) return;
  const { x, y, w, h, rot, a } = s;
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = rot + (i / 6) * TAU + 0.2;
    const rx = (w / 2) * (i % 2 ? 0.88 : 1.04);
    const ry = (h / 2) * (i % 2 ? 0.8 : 1.02);
    pts.push([x + Math.cos(ang) * rx, y + Math.sin(ang) * ry]);
  }
  p.poly(pts, C[1], a);
  const inner = pts.map(([px, py]) => [x + (px - x) * 0.86, y + (py - y) * 0.86]);
  p.poly(inner, C[3], a);
  // the top facet catches the light, the bottom stays in shade
  const top = inner.filter(([px, py]) => py < y - h * 0.08);
  if (top.length >= 3) p.poly([...top, [x, y - h * 0.08]], C[4], a * 0.9);
  p.line(inner[4][0], inner[4][1], inner[5][0], inner[5][1], C[5], 0.75 * a);
  p.line(inner[0][0], inner[0][1], inner[1][0], inner[1][1], C[2], 0.8 * a);
  // cracks and texture, deterministic per slab
  const R = rng(s.seed, 9, 4);
  for (let i = 0; i < 3; i++) {
    const sx = x + R.range(-w * 0.35, w * 0.35), sy = y + R.range(-h * 0.35, h * 0.35);
    p.line(sx, sy, sx + R.range(-4, 5), sy + R.range(1, 5), C[2], 0.7 * a);
  }
  for (let i = 0; i < 4; i++) p.dot(x + R.range(-w * 0.38, w * 0.38), y + R.range(-h * 0.38, h * 0.38), i % 2 ? C[4] : C[2], 0.6 * a);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), D = fit(o.dirt ?? PAL.earth, 8), S = o.seed;

  // the wall builds from the base up, then loses its face
  for (let i = 0; i < 9; i++) slab(p, C, slabAt(S, i, t));

  // the first strike throws grit and loose stones forward
  if (t > 0.44 && t < 1.15) {
    const R = rng(S, Math.floor(t * 30), 7);
    for (let i = 0; i < 12; i++) {
      const a = R.range(-2.9, -0.25), sp = R.range(30, 110), age = t - 0.46 - R.range(0, 0.12);
      if (age < 0) continue;
      const [x, y] = [WX + Math.cos(a) * sp * age, -4 + Math.sin(a) * sp * age + 110 * age * age];
      if (y > 1 || x > 150) continue;
      p.rect(x, y, 1, 1, R.chance(0.4) ? C[5] : C[3], 0.8 * (1 - age / 0.7));
    }
  }

  // dust rolling off the base and the crumbling top
  const dust = smooth(0.46, 0.8, t) * (1 - smooth(2.2, 2.75, t));
  if (dust > 0.01) {
    const R = rng(S, Math.floor(t * 14), 11);
    for (let i = 0; i < 9; i++) {
      const q = clamp((t - 0.5) / 1.6), B = rng(S, i, 13);
      const x = WX + B.range(-WALL_W / 2 - 16, WALL_W / 2 + 16) + q * B.range(-10, 18);
      const y = -2 - q * B.range(2, 14) - B.range(0, 5);
      p.disc(x, y, 4 + B.range(0, 4) + q * 5, i % 3 ? D[2] : D[3], 0.1 * dust);
    }
  }

  // a few bright chips at the crown while it holds
  if (t > 0.7 && t < 1.8) {
    const R = rng(S, Math.floor(t * 10), 17);
    for (let i = 0; i < 5; i++) p.dot(WX + R.range(-WALL_W / 2, WALL_W / 2), -48 + R.range(-5, 6), R.chance(0.5) ? C[5] : C[4], 0.6);
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), D = fit(o.dirt ?? PAL.earth, 8);
  const fade = 1 - smooth(FALL, END, t);

  // the cracked ground, the dirt lip and the seal under the caster
  p.ellipse(WX, 0, WALL_W / 2 + 13, 3.2, D[3], 0.4 * fade);
  const R = rng(o.seed, 3, 19);
  for (let i = 0; i < 5; i++) {
    const x0 = WX - 24 + i * 12;
    let x = x0, y = 0;
    p.line(x, y, x + R.range(-4, 4), -R.range(1, 3), C[1], 0.55 * fade);
    for (let k = 0; k < 3; k++) {
      const nx = x + R.range(-7, 7), ny = y - R.range(0.5, 2);
      p.line(x, y, nx, ny, C[1], 0.4 * fade);
      x = nx; y = ny;
    }
  }
  const seal = smooth(0.06, 0.3, t) * (1 - smooth(0.6, 0.95, t));
  p.ellipse(4, 0, 20, 4.4, D[2], 0.35 * seal);
  p.ellipse(4, 0, 17, 3.4, C[4], 0.35 * seal);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.7;
    p.dot(4 + Math.cos(a) * 16, Math.sin(a) * 3.6, C[5], 0.4 * seal);
  }
  // wet-dark pit at the base of the wall
  p.ellipse(WX, 0, WALL_W / 2 + 4, 2.4, D[1], 0.35 * fade);
}
