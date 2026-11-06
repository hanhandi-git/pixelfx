// Sage art: a root opens and three wooden dragons pour out of the floor like currents. They coil around each
// other, then their heads bite the target in a staggered three-beat. Wood is the body, moss the soft green,
// and amber sap runs along it like light on water.
import { fit, clamp, smooth, ease, band, WHITE, cubicBezier, createPath, rng, noise2, tileNoise, READY } from "../../core/index.js";
import { JADE, SAGE } from "../ninjutsu/_lib.js";

const SEAL = 0.05, RISE = 0.7, STRIKE = 1.9, HIT = 2.4, END = 4.2;
const TX = 330;
const WOOD = ["#080604", "#140d08", "#24170d", "#3a2412", "#54351a", "#714a24", "#956a36", "#bf9254"];

export const meta = {
  name: "Thousand wood dragons",
  desc: "A root opens and three wooden dragons pour out like currents, coil round each other and bite the target in a three-beat: bark, moss, amber sap and a cage of roots.",
  tags: ["chakra", "senjutsu", "sage", "wood", "dragon", "multiple", "roots", "flowing", "combo", "technique", "one-shot"],
  size: [480, 300],
  origin: [80, 260],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: WOOD, natural: JADE, sap: SAGE, seed: 163, reach: TX },
};

const CHARGE = { ...READY, x: -1, crouch: 6, lean: -2, turn: 1, fx: 8, fy: -23, bx: -6, by: -23, armsFront: true };
const CALL = { ...READY, x: 3, crouch: 4, lean: 4, turn: 1, fx: 15, fy: -28, bx: -6, by: -24, ffx: 12, fbx: -8, toeB: true };
const STRIKE_POSE = { ...CALL, x: 5, crouch: 3, lean: 7, fx: 18, fy: -25, ffx: 14 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [SEAL, CHARGE],
    [0.5, { ...CHARGE, crouch: 8, lean: -4 }],
    [0.64, { ...CALL, x: 1, crouch: 4, lean: 4 }, "snap"],
    [1.45, { ...CALL, x: 2, crouch: 3, lean: 3 }],
    [STRIKE, { ...STRIKE_POSE, crouch: 4, lean: 7 }, "snap"],
    [2.12, { ...STRIKE_POSE, x: 6, crouch: 3, lean: 8 }, "snap"],
    [2.4, { ...STRIKE_POSE, x: 7, crouch: 3, lean: 9 }, "snap"],
    [3.4, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [
    { t: 2.12, stop: 0.12, shake: 0.28, amp: 3, push: 2, straw: 14, skin: "char", target: true },
    { t: 2.27, stop: 0.12, shake: 0.32, amp: 3.2, push: 2.2, straw: 16, skin: "char", target: true },
    { t: HIT, stop: 0.16, shake: 0.38, amp: 3.6, push: 2.6, straw: 20, skin: "char", target: true },
  ],
  dust: [{ t: 0.64, x: 12, n: 7, dir: 1 }, { t: HIT, x: TX, n: 10, dir: -1 }],
};

const SPECS = [
  { base: [30, -2], coil: [104, -132], target: [318, -62], hit: 2.12, scale: 1.14, phase: 0.3, z: 0, step: 4.6, seed: 11 },
  { base: [80, -2], coil: [184, -154], target: [330, -96], hit: 2.27, scale: 0.98, phase: 2.1, z: 1, step: 3.8, seed: 31 },
  { base: [136, -2], coil: [218, -38], target: [344, -28], hit: HIT, scale: 0.84, phase: 3.4, z: 2, step: 4.2, seed: 53 },
];

const radiusAt = (u) => 2.2 + 6.2 * Math.pow(Math.sin(Math.PI * clamp(0.12 + u * 0.86, 0, 1)), 0.55);
const lerp = (a, b, q) => a + (b - a) * q;

function headFor(D, t) {
  if (t < STRIKE) {
    return [D.coil[0] + Math.sin(t * 3.2 + D.phase) * 4, D.coil[1] + Math.sin(t * 4.1 + D.phase) * 5];
  }
  const q = ease.inOutQuad(clamp((t - STRIKE) / (D.hit - STRIKE), 0, 1));
  let x = lerp(D.coil[0], D.target[0], q), y = lerp(D.coil[1], D.target[1], q);
  if (t > D.hit) {
    const a = t - D.hit;
    x += Math.sin(a * 5 + D.phase) * a * 2.2;
    y += a * 2.5;
  }
  return [x, y];
}

function spine(D, t) {
  const head = headFor(D, t);
  const sway = Math.sin(t * 3.5 + D.phase) * 5;
  const c1 = [D.base[0] + 58 + sway, D.base[1] - 84 - Math.sin(t * 2.7 + D.phase) * 9];
  const c2 = [head[0] - 72 - sway * 0.8, head[1] - 32 + Math.cos(t * 3 + D.phase) * 6];
  return { path: createPath(cubicBezier([D.base[0], D.base[1]], c1, c2, head), { samples: 84 }), head };
}

function roots(p, W, J, D, t, fade) {
  const b = D.base;
  p.ellipse(b[0] + 8, -1, 22, 2.6, W[1], 0.45 * fade);
  p.ellipse(b[0] + 8, -2, 13, 1.4, W[3], 0.3 * fade);
  for (let i = 0; i < 5; i++) {
    const R = rng(D.seed, i, 3), dir = i % 2 ? 1 : -1, len = R.range(12, 28);
    const x1 = b[0] + dir * len, y1 = -1 - R.range(1, 5);
    p.line(b[0], b[1], x1, y1, W[2], 0.55 * fade);
    p.line(b[0] + dir * 2, b[1] - 1, x1, y1, W[4], 0.3 * fade);
    p.dot(x1, y1, J[4], 0.45 * fade);
  }
  for (let i = 0; i < 4; i++) {
    const R = rng(D.seed, i, 7);
    p.dot(b[0] + R.range(-16, 20), -R.range(0, 2), i % 2 ? J[4] : W[5], 0.3 * fade);
  }
}

function fins(p, W, J, path, D, fade, t) {
  for (const u of [0.27, 0.46, 0.64]) {
    const s = path.at(path.length * u), r = radiusAt(u) * D.scale;
    const flap = Math.sin(t * 5 + u * 10 + D.phase) * 2;
    const bx = s.x - s.tx * 3, by = s.y - s.ty * 3;
    const tip = [bx - s.nx * (r + 6 + flap), by - s.ny * (r + 6 + flap)];
    const a = [bx - s.nx * r, by - s.ny * r];
    const b = [bx - s.tx * 6 - s.nx * r * 0.4, by - s.ty * 6 - s.ny * r * 0.4];
    p.tri(a[0], a[1], tip[0], tip[1], b[0], b[1], W[3], fade * 0.85);
    p.line(tip[0], tip[1], bx, by, W[5], fade * 0.6);
    p.dot(tip[0], tip[1], J[4], fade * 0.8);
  }
}

function dorsal(p, W, J, path, D, fade, t) {
  for (let d = 10; d < path.length - 8; d += 14) {
    const s = path.at(d), u = d / path.length, r = radiusAt(u) * D.scale;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    const bx = s.x + nx * r * 0.85, by = s.y + ny * r * 0.85;
    const h = 2.5 + r * 0.24 + 2 * Math.max(0, Math.sin(u * 15 - t * 4 + D.phase));
    const tip = [bx + nx * h + s.tx * 2.4, by + ny * h + s.ty * 2.4];
    const a = [bx - s.tx * 2.8, by - s.ty * 2.8], b = [bx + s.tx * 2.8, by + s.ty * 2.8];
    p.tri(a[0], a[1], tip[0], tip[1], b[0], b[1], d % 28 < 14 ? W[4] : W[3], fade * 0.8);
    p.dot(tip[0], tip[1], u > 0.6 ? J[5] : W[6], fade * 0.8);
  }
}

function body(p, W, J, S, D, path, grow, fade, t) {
  const L = path.length, dmax = L * clamp(grow, 0, 1);
  if (dmax < 2) return;
  for (let d = 0; d <= dmax; d += D.step) {
    const s = path.at(d), u = d / L, r = radiusAt(u) * D.scale;
    if (r < 0.6) continue;
    const wob = Math.sin(u * 11 - t * 7 + D.phase) * 4.2 * Math.sin(Math.PI * u);
    const x = s.x + s.nx * wob, y = s.y + s.ny * wob;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    const mossPatch = noise2(u * 17 + 3, 5, D.seed + 5);
    for (let q = -r; q <= r; q += D.z === 0 ? 1.9 : 1.5) {
      const e = Math.abs(q) / r, px = x + nx * q, py = y + ny * q;
      const bark = noise2(u * 28 - t * 2.2, q * 0.82 + t * 1.3, D.seed);
      let col;
      if (e > 0.9) col = W[1];
      else if (q > r * 0.32) col = bark > 0.24 ? W[6] : W[5];
      else if (q > 0) col = bark > 0.46 ? W[5] : W[4];
      else col = bark > 0.38 ? W[3] : W[2];
      if (mossPatch > 0.6 && e < 0.8) col = mossPatch > 0.78 ? J[5] : J[3];
      // the amber sap channel: a travelling line of light in the wood, like a current under bark
      if (Math.abs(q - r * 0.12) < 0.9) {
        const sap = tileNoise(d * 1.15 + Math.floor(q * 1.6), u * 10 - t * 8, 0, 15, D.seed + 9);
        if (sap > 0.63) col = sap > 0.82 ? S[6] : S[5];
      }
      if (e > 0.9) col = W[1];
      p.dot(px, py, col, fade * (0.7 + 0.25 * (1 - e)));
    }
    // bark rings and a lit upper rim
    if (Math.floor(d / (D.step * 7)) % 2 === 0) {
      for (let q = -r * 0.7; q <= r * 0.7; q += 1.6) p.dot(x + nx * q, y + ny * q, W[2], fade * 0.22);
    }
    p.dot(x + nx * r * 0.98, y + ny * r * 0.98, W[6], fade * 0.68);
    p.dot(x - nx * r * 0.9, y - ny * r * 0.9, W[1], fade * 0.55);
  }
  // head only when the neck has finished growing
  if (grow > 0.96 && fade > 0.01) head(p, W, J, S, D, path, t, fade);
}

function head(p, W, J, S, D, path, t, fade) {
  const s = path.at(path.length - 3), ang = Math.atan2(s.ty, s.tx), ca = Math.cos(ang), sa = Math.sin(ang);
  const sc = D.scale * 1.05;
  const R = (x, y) => [s.x + (x * sc) * ca - (y * sc) * sa, s.y + (x * sc) * sa + (y * sc) * ca];
  const k = fade;
  const P = (pts, c, a = k) => p.poly(pts.map(([x, y]) => R(x, y)), c, a);
  const skull = [[-8, -6], [3, -7], [12, -4], [16, -0.5], [14, 1.5], [4, 3], [-3, 5], [-9, 3]];
  const cx = skull.reduce((a, q) => a + q[0], 0) / skull.length, cy = skull.reduce((a, q) => a + q[1], 0) / skull.length;
  P(skull.map(([x, y]) => [cx + (x - cx) * 1.13, cy + (y - cy) * 1.25]), W[1]);

  // moss mane, then the branch antlers
  for (let i = 0; i < 6; i++) {
    const g = -2.6 + i * 0.42, len = 9 + (i % 3) * 4;
    const a0 = R(-5, -2 + (i % 3) * 2), a1 = R(-5 + Math.cos(g) * len, -2 + Math.sin(g) * len);
    const a2 = R(Math.cos(g + 0.5) * len * 0.45, -1 + Math.sin(g + 0.5) * len * 0.45);
    p.tri(a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], i % 2 ? J[4] : J[3], k * 0.9);
    p.dot(a1[0], a1[1], J[5], k * 0.8);
  }
  for (const side of [-1, 1]) {
    const roots = side < 0 ? [[-4, -6], [-11, -15], [-17, -22]] : [[-2, -7], [-7, -17], [-12, -26]];
    for (const [x, y] of roots) {
      p.line(...R(-3, -6), ...R(x, y), W[5], k * 0.95);
      p.line(...R(x, y), ...R(x - 5, y - 5), W[6], k * 0.8);
      p.dot(...R(x - 5, y - 5), J[5], k * 0.9);
      p.line(...R(x * 0.55, y * 0.55), ...R(x * 0.55 - 5, y * 0.55 - 2), J[4], k * 0.7);
    }
  }

  // open jaw and skull
  const drop = 2.8 + Math.sin(t * 8 + D.phase) * 0.8;
  P([[-2, 2], [14, 2], [15 + drop * 0.5, 5 + drop], [2, 6 + drop], [-4, 4]], W[3]);
  P(skull, W[4]);
  P([[-7, -5], [2, -6], [11, -3.4], [13, -1.4], [3, 0], [-6, 1]], W[5]);
  p.line(...R(-5, -5.6), ...R(11, -3.2), W[6], k * 0.9);
  p.line(...R(-2, -2), ...R(9, -1.2), W[2], k * 0.7);
  // mouth / teeth
  P([[0, 2], [14, 2], [15, 3.6], [1, 4.6]], W[1]);
  for (let i = 0; i < 4; i++) {
    const x = 3 + i * 3.1;
    p.dot(...R(x, 2.2), W[6], k);
    p.dot(...R(x + 1.4, 4.2 - i * 0.2), W[5], k * 0.8);
  }
  // amber eye
  P([[0, -4.6], [4.5, -4.2], [4.6, -1.6], [0.4, -1.8]], W[1]);
  p.dot(...R(1.7, -3.4), S[5], k);
  p.dot(...R(2.6, -3.4), S[6], k);
  p.dot(...R(2.9, -3.3), W[0], k);
  p.dot(...R(2.2, -3.9), WHITE, k * 0.8);
  p.line(...R(-1, -5.4), ...R(5.5, -4.8), S[5], k * 0.8);
  p.dot(...R(13, -1.6), W[1], k);
  // moss on the crown and a sap glint
  for (let i = 0; i < 5; i++) {
    const x = -4 + i * 2.3, y = -6.4 - Math.sin((i / 5) * Math.PI) * 2;
    p.dot(...R(x, y), i % 2 ? J[5] : J[4], k * 0.9);
  }
  p.dot(...R(6, -5), S[6], k * 0.8);
  // tendril whiskers
  for (const [dy, up] of [[-0.8, -1], [2.2, 1]]) {
    let px = 14, py = dy;
    for (let i = 0; i < 8; i++) {
      const nx = px + 1.2, ny = py + up * (0.3 + i * 0.18) + Math.sin(t * 6 + i + D.phase) * 0.22;
      p.line(...R(px, py), ...R(nx, ny), i < 3 ? W[6] : J[4], k * (0.8 - i * 0.06));
      px = nx; py = ny;
    }
  }
  p.glow(s.x, s.y, 18, S[5], 0.2 * k);
}

function drawDragon(p, W, J, S, D, t, grow, fade) {
  if (grow <= 0.01 || fade <= 0.01) return;
  const { path } = spine(D, t);
  fins(p, W, J, path, D, fade, t);
  dorsal(p, W, J, path, D, fade, t);
  body(p, W, J, S, D, path, grow, fade, t);
}

function headHit(p, W, J, S, D, t) {
  const q = t - D.hit;
  if (q < 0 || q > 0.6) return;
  const k = 1 - smooth(0, 0.6, q);
  for (let i = 0; i < 8; i++) {
    const R = rng(D.seed, i, 17), a0 = R.range(-2.8, 0.2), sp = R.range(20, 64);
    const x = D.target[0] + Math.cos(a0) * sp * q, y = D.target[1] + Math.sin(a0) * sp * q + 120 * q * q;
    if (y > -1) continue;
    p.dot(x, y, i % 3 ? W[4] : S[5], 0.55 * k);
  }
  p.dot(D.target[0], D.target[1], WHITE, 0.7 * k);
}

function impact(p, W, J, S, D, t) {
  const q = t - HIT;
  if (q < 0 || q > 2.0) return;
  const k = 1 - smooth(0, 1.9, q), flash = Math.max(0, 1 - q / 0.12);
  p.circle(TX, -34, 7 + 15 * Math.min(1, q * 8), S[6], 0.65 * flash);
  p.circle(TX, -34, 4 + 8 * Math.min(1, q * 8), WHITE, flash);
  p.glow(TX, -34, 62, S[5], 0.3 * flash);
  p.ellipse(TX, -1, 22 + q * 34, 3, S[5], 0.28 * k);
  p.ellipse(TX, -1, 11 + q * 18, 1.4, WHITE, 0.22 * k);
  // bark shards and moss leaves
  for (let i = 0; i < 14; i++) {
    const R = rng(163, i, 23), a0 = R.range(-2.9, 0.3), sp = R.range(28, 96), age = q - R.range(0, 0.12);
    if (age < 0) continue;
    const x = TX + Math.cos(a0) * sp * age, y = -3 + Math.sin(a0) * sp * age + 210 * age * age;
    if (y > -1) continue;
    const c = i % 3 ? W[4] : J[4];
    p.tri(x, y, x + R.range(-3, 3), y - R.range(2, 5), x + R.range(2, 4), y, c, 0.65 * k);
  }
  for (let i = 0; i < 12; i++) {
    const R = rng(163, i, 31), x = TX + R.range(-34, 38), age = q - R.range(0.05, 0.4);
    if (age < 0) continue;
    const y = -8 - age * R.range(8, 24) + age * age * 120;
    if (y > -1) continue;
    p.dot(x + age * R.range(-8, 8), y, i % 2 ? J[4] : S[5], 0.45 * k);
  }
  // a cage of roots closes round the target
  if (q > 0.05) {
    const ka = smooth(0.05, 0.4, q) * k;
    for (let i = 0; i < 6; i++) {
      const R = rng(163, i, 41), side = i % 2 ? 1 : -1, x0 = TX + side * R.range(7, 20);
      let x = x0, y = -1;
      for (let j = 0; j < 4; j++) {
        const nx = x + side * R.range(2, 7), ny = y - R.range(8, 15);
        p.line(x, y, nx, ny, j < 2 ? W[3] : W[5], 0.6 * ka);
        p.dot(nx, ny, J[4], 0.3 * ka);
        x = nx; y = ny;
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const R = rng(163, i, 53), age = q - R.range(0.02, 0.25);
    if (age < 0) continue;
    p.disc(TX + R.range(-26, 26) + age * R.range(-14, 14), -6 - age * R.range(5, 18), R.range(5, 11), W[3], 0.12 * k);
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const W = fit(o.palette ?? WOOD, 8), J = fit(o.natural ?? JADE, 8), S = fit(o.sap ?? SAGE, 8);
  const fade = 1 - smooth(3.25, 4.05, t), grow = smooth(RISE, RISE + 0.72, t);
  // seal and the roots under each dragon
  for (const D of SPECS) roots(p, W, J, D, t, fade * smooth(0.1, 0.6, t));
  band(p, TX, 0, 20 + 10 * smooth(0.1, 0.7, t), 0.22, 1.5, 0.35 * fade, S, (g) => Math.sin(g) < 0.2);
  if (t > 0.5) {
    for (let i = 0; i < 10; i++) {
      const R = rng(163, i, 61), q = (t * 0.35 + R.next()) % 1;
      p.dot(TX + R.range(-36, 36), -q * 36, i % 3 ? J[5] : S[5], 0.3 * fade * (1 - q));
    }
  }
  // the far dragon sits behind the target
  const far = SPECS[0];
  drawDragon(p, W, J, S, far, t, grow, fade);
  // ground shadow under the impact
  if (t > 1.4) p.ellipse(TX, -1, 28, 3.2, W[1], 0.35 * fade);
  // wood dust on the floor
  for (let i = 0; i < 14; i++) {
    const R = rng(163, i, 67);
    p.dot(R.range(160, 380), -R.range(0, 1), i % 3 ? W[4] : J[4], 0.26 * fade);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const W = fit(o.palette ?? WOOD, 8), J = fit(o.natural ?? JADE, 8), S = fit(o.sap ?? SAGE, 8);
  const fade = 1 - smooth(3.25, 4.05, t), grow = smooth(RISE, RISE + 0.72, t);
  // two front dragons weave over the far one
  for (const D of SPECS) if (D.z > 0) drawDragon(p, W, J, S, D, t, grow, fade);
  for (const D of SPECS) headHit(p, W, J, S, D, t);
  impact(p, W, J, S, SPECS[2], t);
}
