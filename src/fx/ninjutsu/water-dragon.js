// Water release: a seal, a spiral of water at the feet, and a serpent of water that rears up and lunges. The
// water body is built from a cubic spine sampled by arc length, shaded as a rounded tube with a foam crest.
import { fit, clamp, smooth, ease, band, TAU, WHITE, cubicBezier, createPath, rng, sparkle, noise2, tileNoise, READY } from "../../core/index.js";
import { WATER, bead, billow, lace } from "../water/_lib.js";

const CAST = 0.5, RISE = 0.78, LUNGE = 1.56, SINK = 2.5, END = 3.9;
const BASE_X = 25, BASE_Y = -3, TARGET = 152;
const HEAD0 = [44, -94];

export const meta = {
  name: "Water dragon",
  desc: "He seals, a spiral opens at his feet, and a horned serpent of water rears and lunges: foam crest, a splash across the target, then rain and a spreading puddle.",
  tags: ["chakra", "ninjutsu", "water", "dragon", "serpent", "technique", "one-shot"],
  size: [320, 200],
  origin: [76, 166],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: WATER, seed: 21 },
};

const SEAL = { ...READY, x: -1, crouch: 5, lean: -2, turn: 1, fx: 7, fy: -20, bx: 4, by: -22, ffx: 6, fbx: -4, armsFront: true };
const CASTP = { ...READY, x: 4, crouch: 4, lean: 5, turn: 1, fx: 16, fy: -21, bx: -5, by: -25, ffx: 13, fbx: -9, toeB: true };
export const act = {
  target: { x: TARGET },
  poses: [
    [-0.4, READY],
    [0.05, SEAL],
    [CAST - 0.06, { ...SEAL, crouch: 7, lean: -4 }],
    [CAST, { ...CASTP, crouch: 4, lean: 6 }, "snap"],
    [LUNGE - 0.05, { ...CASTP, crouch: 3, lean: 4 }],
    [LUNGE, { ...CASTP, crouch: 4, lean: 2 }, "snap"],
    [LUNGE + 0.7, { ...CASTP, crouch: 3, lean: 1, fx: 14 }],
    [SINK + 0.3, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [
    { t: LUNGE, stop: 0.14, shake: 0.32, amp: 3, push: 3, straw: 26, skin: "ice" },
    { t: SINK + 0.6, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: CAST, x: 8, n: 5, dir: 1, c: "#bfe9ff" }, { t: LUNGE, x: TARGET, n: 8, dir: -1, c: "#bfe9ff" }],
};

const headAt = (t) => {
  const q = ease.inOutQuad(clamp((t - RISE) / (LUNGE - RISE)));
  return [HEAD0[0] + (TARGET - HEAD0[0]) * q, HEAD0[1] + 52 * q];
};

// the body: a cubic from the water at the feet to the head, breathing and slithering as it goes
function spineAt(t) {
  const [hx, hy] = headAt(t);
  const sway = Math.sin(t * 5.2) * 4;
  const c1 = [BASE_X - 4 + sway * 0.5, -54 - 8 * Math.sin(t * 3.1)];
  const c2 = [hx - 38 - sway, hy - 26 + 8 * Math.sin(t * 2.3 + 1)];
  const curve = cubicBezier([BASE_X, BASE_Y], c1, c2, [hx, hy]);
  return { path: createPath(curve, { samples: 96 }), head: [hx, hy] };
}

const radiusAt = (u) => 2.4 + 6.4 * Math.pow(Math.sin(Math.PI * clamp(0.12 + u * 0.88)), 0.55);

// a row of spikes down the spine, so the silhouette reads as a dragon and not a hose
function dorsal(p, C, path, grow, fade, t) {
  for (let d = 8; d < path.length - 6; d += 10) {
    const s = path.at(d), u = d / path.length, r = radiusAt(u) * grow;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    const bx = s.x + nx * r * 0.82, by = s.y + ny * r * 0.82;
    const h = 3 + r * 0.22 + 2.4 * Math.max(0, Math.sin(u * 16 - t * 5));
    const tip = [bx + nx * h + s.tx * 2.6, by + ny * h + s.ty * 2.6];
    const a = [bx - s.tx * 3.2, by - s.ty * 3.2], b = [bx + s.tx * 3.2, by + s.ty * 3.2];
    p.tri(a[0], a[1], tip[0], tip[1], b[0], b[1], u > 0.62 ? C[5] : C[4], fade * 0.8);
    p.dot(tip[0], tip[1], C[6], fade * 0.85);
  }
}

function body(p, C, t, path, grow, fade, S) {
  const L = path.length;
  if (fade <= 0.01) return L;
  const step = 1.6;
  // draw the tail first. A dark rim, then a per-pixel cross-section: the upper side catches the light, the
  // belly stays deep, and white dashes run along the body in fall time so the surface reads as moving water
  // rather than a smooth blue hose.
  for (let d = 0; d <= L; d += step) {
    const s = path.at(d), u = d / L, r = radiusAt(u) * grow;
    if (r < 0.6) continue;
    const wob = Math.sin(u * 12 - t * 9) * 1.8 * Math.sin(Math.PI * u);
    const x = s.x + s.nx * wob, y = s.y + s.ny * wob;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    p.circle(x, y, r + 0.35, C[1], fade * 0.7);
    p.circle(x, y, r, C[3], fade * 0.8);
    const texRow = Math.floor(d * 2.1);
    for (let q = -r; q <= r; q += 0.8) {
      const e = Math.abs(q) / r, px = x + nx * q, py = y + ny * q;
      const tex = noise2(u * 22 - t * 2.6, q * 0.75 + t * 3.4, S + texRow);
      const dash = tileNoise(d * 1.42 + Math.floor(q * 1.7), u * 9 - t * 9, 0, 12, S + 3);
      let col;
      if (e > 0.9) col = C[1];
      else if (q > r * 0.32) col = tex > 0.28 ? C[6] : C[5];
      else if (q > 0) col = tex > 0.5 ? C[5] : C[4];
      else col = tex > 0.4 ? C[3] : C[2];
      // sliding foam: short white streaks on the upper half and the crown, not a dotted line
      if (q > -r * 0.15 && dash > 0.56 && tex > -0.35) col = dash > 0.78 ? WHITE : C[6];
      // the underside is translucent: the dark ground reads through it
      if (q < -r * 0.35 && e > 0.3) {
        p.blend(px, py, col, fade * 0.45);
        continue;
      }
      p.dot(px, py, col, fade * (0.72 + 0.24 * (1 - e)));
    }
    // the lit rim and the deep belly are single-pixel accents, so the silhouette stays crisp
    p.dot(x + nx * r * 0.98, y + ny * r * 0.98, C[6], fade * 0.65);
    p.dot(x - nx * r * 0.82, y - ny * r * 0.82, C[1], fade * 0.55);
  }
  // foam crest running along the back, broken by the slither
  for (let d = 2; d < L; d += 2.2) {
    const s = path.at(d), u = d / L, r = radiusAt(u) * grow;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    const n = Math.sin(u * 20 - t * 11), k = Math.max(0, n);
    if (k < 0.25) continue;
    const x = s.x + nx * r * 0.98, y = s.y + ny * r * 0.98;
    p.dot(x, y, k > 0.7 ? WHITE : C[6], fade * (0.35 + 0.6 * k));
    if (k > 0.72) bead(p, x + nx * 1.3, y + ny * 1.3, 0, -40, 1, C, fade * 0.5);
  }
  // scale rings every few px, only on the upper half
  for (let d = 8; d < L - 4; d += 9) {
    const s = path.at(d), u = d / L, r = radiusAt(u) * grow;
    let nx = s.nx, ny = s.ny;
    if (ny > 0) (nx = -nx), (ny = -ny);
    for (let i = -2; i <= 3; i++) {
      const px = s.x + s.tx * i * 1.1 - nx * (r * 0.55 - Math.abs(i) * 0.6);
      const py = s.y + s.ty * i * 1.1 - ny * (r * 0.55 - Math.abs(i) * 0.6);
      p.dot(px, py, i % 2 ? C[5] : C[6], fade * 0.36);
    }
  }
  for (const u of [0.3, 0.55, 0.8]) {
    const s = path.at(L * u);
    p.glow(s.x, s.y, 16, C[4], 0.05 * fade);
  }
  return L;
}

function fins(p, C, path, grow, fade, t) {
  // tail fan where the body leaves the water
  const s0 = path.at(2);
  for (let i = 0; i < 3; i++) {
    const ang = 2.35 + i * 0.4, len = 8 + i * 4;
    const tx = s0.x - 4 + Math.cos(ang) * len, ty = s0.y + Math.sin(ang) * len;
    p.tri(s0.x - 2, s0.y + 1, tx, ty, s0.x + 3, s0.y - 2, i % 2 ? C[4] : C[5], fade * 0.75);
    p.dot(tx, ty, C[6], fade * 0.7);
  }
  for (const u of [0.32, 0.5, 0.66, 0.8]) {
    const s = path.at(path.length * u), r = radiusAt(u) * grow;
    const flap = Math.sin(t * 7 + u * 9) * 2;
    const bx = s.x - s.tx * 4, by = s.y - s.ty * 4;
    const tip = [bx + s.nx * -(r + 5 + flap), by + s.ny * -(r + 5 + flap)];
    const a = [bx + s.nx * -r, by + s.ny * -r];
    const b = [bx - s.tx * 5 + s.nx * -r * 0.4, by - s.ty * 5 + s.ny * -r * 0.4];
    p.poly([a, tip, b], C[4], fade * 0.9);
    p.line(tip[0], tip[1], bx, by, C[5], fade * 0.7);
    p.dot(tip[0], tip[1], C[6], fade);
  }
}

function head(p, C, t, path, grow, fade) {
  const s = path.at(path.length - 3), ang = Math.atan2(s.ty, s.tx), ca = Math.cos(ang), sa = Math.sin(ang);
  const R = (x, y) => [s.x + x * ca - y * sa, s.y + x * sa + y * ca];
  const k = Math.max(0.001, grow) * fade;
  const P = (pts, c, a = k) => p.poly(pts.map(([x, y]) => R(x, y)), c, a);
  // a dark outline a pixel outside the skull, so the head reads against the body
  const skull = [[-8, -6], [3, -7], [12, -4], [16, -0.5], [14, 1.5], [4, 3], [-3, 5], [-9, 3]];
  const cx = skull.reduce((a, q) => a + q[0], 0) / skull.length, cy = skull.reduce((a, q) => a + q[1], 0) / skull.length;
  const outline = skull.map(([x, y]) => [cx + (x - cx) * 1.12, cy + (y - cy) * 1.22]);
  P(outline, C[1]);

  // mane spikes fanning back, and two long horns
  for (let i = 0; i < 6; i++) {
    const g = -2.5 + i * 0.42, len = 9 + (i % 3) * 5;
    const a0 = R(-5, -2 + (i % 3) * 2), a1 = R(-5 + Math.cos(g) * len, -2 + Math.sin(g) * len);
    const a2 = R(0 + Math.cos(g + 0.5) * len * 0.5, -1 + Math.sin(g + 0.5) * len * 0.5);
    p.tri(a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], i % 2 ? C[4] : C[5], k * 0.9);
    p.dot(a1[0], a1[1], C[6], k * 0.8);
  }
  for (const [x0, y0, x1, y1, x2, y2] of [[-4, -6, -13, -14, -18, -12], [-2, -7, -8, -17, -13, -18]]) {
    const a = R(x0, y0), b = R(x1, y1), c = R(x2, y2);
    p.line(a[0], a[1], b[0], b[1], C[5], k);
    p.line(b[0], b[1], c[0], c[1], C[6], k);
    p.dot(c[0], c[1], WHITE, k * 0.9);
  }

  // open jaw: the lower jaw is dropped a few px at the tip
  const drop = 2.6 + Math.sin(t * 8) * 0.8;
  const jaw = [[-2, 2], [14, 2], [15 + drop * 0.5, 5 + drop], [2, 6 + drop], [-4, 4]];
  P(jaw, C[3]);
  P(skull, C[4]);
  // the lit crown and a white edge along the snout
  P([[-7, -5], [2, -6], [11, -3.4], [13, -1.4], [3, 0], [-6, 1]], C[5]);
  p.line(...R(-5, -5.6), ...R(11, -3.2), WHITE, k * 0.9);
  // the mouth: a dark wedge between the jaws, with teeth
  P([[0, 2], [14, 2], [15, 3.6], [1, 4.6]], C[1]);
  for (let i = 0; i < 4; i++) {
    const x = 3 + i * 3.1;
    p.dot(...R(x, 2.2), WHITE, k);
    p.dot(...R(x + 1.4, 4.2 - i * 0.2), C[6], k * 0.8);
  }
  // eye: a dark socket, a white slit, a black pupil, a wet glint
  P([[0, -4.6], [4.5, -4.2], [4.6, -1.6], [0.4, -1.8]], C[1]);
  p.dot(...R(1.7, -3.4), WHITE, k);
  p.dot(...R(2.6, -3.4), WHITE, k);
  p.dot(...R(2.9, -3.3), C[1], k);
  p.dot(...R(2.2, -3.9), C[6], k * 0.8);
  // brow ridge and nostril
  p.line(...R(-1, -5.4), ...R(5.5, -4.8), C[6], k * 0.9);
  p.dot(...R(13, -1.6), C[1], k);
  // a foam crest on the crown
  for (let i = 0; i < 7; i++) {
    const x = -5 + i * 2.3, y = -6.6 - Math.sin((i / 7) * Math.PI) * 2.4;
    p.dot(...R(x, y), i % 2 ? WHITE : C[6], k * 0.9);
    if (i % 2 === 0) p.dot(...R(x, y - 1.4), C[6], k * 0.6);
  }
  // whiskers: two long curves off the snout
  for (const [dy, up] of [[-0.8, -1], [2.2, 1]]) {
    let px = 14, py = dy;
    for (let i = 0; i < 9; i++) {
      const nx = px + 1.3, ny = py + up * (0.3 + i * 0.2) + Math.sin(t * 6 + i) * 0.25;
      const A = R(px, py), B = R(nx, ny);
      p.line(A[0], A[1], B[0], B[1], i < 4 ? WHITE : C[6], k * (0.9 - i * 0.06));
      px = nx; py = ny;
    }
  }
  p.glow(s.x, s.y, 22, C[5], 0.28 * k);
  p.glow(...R(8, -1), 10, C[5], 0.2 * k);
}

// water thrown off the body and the hit: analytic droplets, no state
function spray(p, t, t0, x, y, n, seed, C, power = 1, life = 0.9) {
  const g = 900;
  for (let i = 0; i < n; i++) {
    const R = rng(seed, i, 71), delay = R.next() * 0.12, age = t - t0 - delay;
    if (age < 0 || age > life) continue;
    const a = R.range(-2.8, -0.2) + (R.chance(0.2) ? Math.PI : 0), sp = R.range(30, 170) * power;
    const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
    const px = x + vx * ((1 - Math.exp(-3 * age)) / 3), py = y + vy * age + 0.5 * g * age * age;
    if (py > 0) continue;
    const q = age / life;
    p.px(px, py, q < 0.5 ? WHITE : C[6]);
    if (i % 3 === 0) p.dot(px - 1, py - 1, C[5], 1 - q);
    if (i % 5 === 0) p.glow(px, py, 4, C[5], 0.08 * (1 - q));
  }
}

function vortex(p, C, t, a, grow) {
  if (a <= 0) return;
  // spiral arms of water climbing out of the floor ring
  for (let k = 0; k < 3; k++) {
    const off = (k / 3) * TAU;
    for (let i = 0; i <= 26; i++) {
      const u = i / 26, ang = off + u * 3.2 + t * 3.4, rr = 4 + u * 20 * grow;
      const x = BASE_X + Math.cos(ang) * rr, y = -2 - u * 64 * grow + Math.sin(ang) * rr * 0.15;
      p.dot(x, y, u > 0.7 ? C[6] : u > 0.35 ? C[5] : C[4], a * (1 - u * 0.5));
      if (i % 4 === 0) p.glow(x, y, 5, C[5], 0.06 * a);
    }
  }
  for (let i = 0; i < 3; i++) {
    const rr = 8 + i * 7 + Math.sin(t * 4 + i) * 2;
    band(p, BASE_X, 0, rr, 0.2, 1.5, a * 0.7, C, (g) => Math.sin(g) > -0.2);
  }
  // a thin column climbing out of the swirl, and a crown of foam on the rim
  for (let i = 0; i < 10; i++) {
    const u = i / 9, x = BASE_X + Math.sin(u * 7 + t * 5) * 6 * (1 - u), y = -2 - u * 40 * grow;
    p.dot(x, y, i % 3 ? C[5] : C[6], a * 0.35 * (1 - u * 0.4));
  }
  for (let i = 0; i < 12; i++) {
    const g = (i / 12) * TAU + t * 2, rr = 12 + 2 * Math.sin(t * 5 + i);
    p.dot(BASE_X + Math.cos(g) * rr, Math.sin(g) * rr * 0.2 - 1, i % 2 ? C[5] : WHITE, a * 0.5);
  }
}

// the hit throws a crown of water up around the target, with a thin wall and stones
function crown(p, C, t, q, S) {
  if (q < 0 || q > 1.4) return;
  const B = rng(S, 3, 77);
  for (let i = 0; i < 9; i++) {
    const x0 = TARGET + (i - 4) * 7.2 + B.range(-1.5, 1.5), vx = (i - 4) * 9;
    const vy = B.range(95, 170);
    for (let k = 0; k < 4; k++) {
      const age = q - k * 0.035;
      if (age < 0) continue;
      const y = -vy * age + 450 * age * age;
      if (y > -1) continue;
      p.dot(x0 + vx * age, y, k === 0 ? WHITE : C[6], 0.75 * (1 - clamp(q / 1.4)));
    }
  }
  for (const [i, sy] of [[0, 0.92], [1, 0.96]]) {
    const rr = 14 + q * (30 + i * 12), a = (1 - smooth(0.1, 0.85, q)) * (i ? 0.2 : 0.28);
    if (a > 0.005) band(p, TARGET, 0, rr, sy, 2, a, C, (g) => Math.sin(g) < 0.12, q < 0.12);
  }
  for (let i = 0; i < 8; i++) {
    const B2 = rng(S, i, 83), a = B2.range(-2.2, -0.5), sp = B2.range(40, 110), age = q - 0.02 - B2.next() * 0.1;
    if (age < 0) continue;
    const x = TARGET + Math.cos(a) * sp * age, y = -1 + Math.sin(a) * sp * age + 250 * age * age;
    if (y > -1) continue;
    p.rect(x, y, B2.chance(0.3) ? 2 : 1, 1, C[1], 0.7 * (1 - clamp(q / 1.2)));
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  const fade = 1 - smooth(SINK + 0.6, END - 0.2, t);
  if (t > 0.12) band(p, BASE_X, 0, 14 + t * 8, 0.2, 2, 0.6 * fade, C, (g) => Math.sin(g) < 0);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), S = o.seed;
  const grow = smooth(RISE, RISE + 0.22, t);
  const fade = 1 - smooth(SINK, END - 0.3, t);

  // the seal: a cold ring drawing itself under the caster
  if (t < SINK + 0.5) {
    const seal = smooth(0.05, CAST, t) * (1 - smooth(SINK, SINK + 0.5, t));
    band(p, BASE_X, 0, 16 + 6 * smooth(0, CAST, t), 0.2, 1.2, seal * 0.5, C);
    spiralSeal(p, C, t, seal);
  }

  if (t > 0.22) vortex(p, C, t, smooth(0.2, CAST + 0.4, t) * (t > SINK ? fade : 1), clamp(t / 0.8, 0, 1));

  if (t > RISE - 0.12) {
    const { path } = spineAt(t);
    const fadeBody = fade * smooth(RISE - 0.12, RISE + 0.05, t);
    if (fadeBody > 0.01) {
      fins(p, C, path, grow, fadeBody, t);
      dorsal(p, C, path, grow, fadeBody, t);
      body(p, C, t, path, grow, fadeBody, S);
      head(p, C, t, path, grow, fadeBody);
    }
    // droplets shed from the body as it moves
    for (let i = 0; i < 10; i++) {
      const R = rng(S, i, 13), u = 0.2 + R.next() * 0.75, s = path.at(path.length * u);
      const fall = ((t * 1.6 + R.next()) % 1) * 10;
      const px = s.x + s.nx * R.range(-4, 4), py = s.y + s.ny * R.range(-2, 4) + fall;
      if (py < -1) p.dot(px, py, R.chance(0.4) ? WHITE : C[6], fade * 0.6);
    }
  }

  // a cone of spray from the open mouth just before the hit
  if (t > LUNGE - 0.24 && t < LUNGE + 0.08) {
    const [hx, hy] = headAt(t), age = t - (LUNGE - 0.24), B = rng(S, Math.floor(t * 20), 91);
    for (let i = 0; i < 10; i++) {
      const a = B.range(-0.55, 0.55), sp = B.range(20, 64) * age;
      const x = hx + Math.cos(a) * sp, y = hy + Math.sin(a) * sp;
      if (y < -1) p.dot(x, y, i % 3 ? C[6] : WHITE, 0.5 * (1 - smooth(0, 0.32, age)));
    }
  }

  // the lunge breaks on the target: a white burst, a spray, foam rings and a mist
  if (t > LUNGE) {
    const q = t - LUNGE;
    if (q < 0.12) {
      const k = 1 - q / 0.12;
      p.circle(TARGET, -34, 8 + 18 * (1 - k), WHITE, k);
      sparkle(p, TARGET, -34, 16, C[6], C[4], k);
      p.glow(TARGET, -34, 70, C[5], 0.5 * k);
    }
    if (q < 0.2) {
      const k = 1 - q / 0.2;
      for (let i = 0; i < 5; i++) {
        const x0 = TARGET + (i - 2) * 5.5, tipx = x0 + (i - 2) * 4, tipy = -18 - (i % 2 ? 9 : 4);
        p.tri(x0 - 3, -1, tipx, tipy, x0 + 3, -1, i % 2 ? C[6] : WHITE, k * 0.6);
      }
    }
    spray(p, t, LUNGE, TARGET, -34, 46, S * 5 + 3, C, 1.2, 1.0);
    crown(p, C, t, q, S);
    for (let i = 0; i < 3; i++) {
      const rr = 10 + q * (52 + i * 14), a = (1 - rr / 92) * 0.35;
      if (a > 0) band(p, TARGET, 0, rr, 0.18, 1.5, a, C, undefined, q < 0.12);
    }
    // mist where the head broke
    for (let i = 0; i < 4; i++) {
      const R = rng(S, i, 29), a = (1 - smooth(0, 1.1, q)) * 0.3;
      p.disc(TARGET + R.range(-20, 18) + q * R.range(-24, 24), -30 + R.range(-14, 10) - q * 10, 8 + q * 10, C[5], a * 0.7);
    }
    // foam lace floating on the broken surface
    const lk = (1 - smooth(0.15, 1.5, q)) * 0.9;
    if (lk > 0.02) lace(p, TARGET, 0, 44, 7, lk, C, t, S * 3 + 5);
    // foam billows thrown up with the crown
    for (let i = 0; i < 8; i++) {
      const B = rng(S, i, 101), a = (1 - smooth(0.05, 0.9, q)) * B.range(0.35, 0.7);
      if (a <= 0.02) continue;
      billow(p, TARGET + B.range(-24, 20) + q * B.range(-12, 12), -4 - q * B.range(10, 32), B.range(2, 4.5), C, a);
    }
    // rain falls back onto the floor
    for (let i = 0; i < 26; i++) {
      const R = rng(S * 3, i, 41), x0 = TARGET + R.range(-40, 26), y0 = -34 + R.range(-18, 20);
      const age = q - 0.2 - R.next() * 0.5;
      if (age < 0) continue;
      const py = y0 + 0.5 * 900 * age * age;
      if (py > 0) {
        if (py < 1.5) p.dot(x0, -1, C[5], 0.35 * (1 - clamp(age / 1.4)));
        continue;
      }
      p.px(x0, py, age < 0.3 ? WHITE : C[6]);
    }
    // the puddle spreads and calms
    if (q > 0.1) {
      const f = 1 - smooth(0.2, 2.2, q), rr = 18 + q * 26;
      for (let x = TARGET - rr; x <= TARGET + rr; x++) {
        const d = Math.abs(x + 0.5 - TARGET) / rr;
        if (d > 1) continue;
        p.dot(x, 0, d < 0.5 ? C[4] : C[3], 0.4 * f);
        if (d < 0.85 && Math.floor(x) % 3 === 0) p.dot(x, 1, C[3], 0.25 * f);
      }
      p.glow(TARGET, -1, 40, C[4], 0.13 * f);
      for (let i = 0; i < 3; i++) {
        const rr = 10 + q * (26 + i * 12), a = clamp(1 - rr / 78, 0, 1) * 0.26 * (1 - smooth(0.6, 1.8, q));
        if (a > 0.005) band(p, TARGET, 1, rr, 0.12, 1.4, a, C);
      }
    }
  }

  // the base keeps a ring of water and its wake
  if (t < SINK + 0.8) {
    const f = 1 - smooth(SINK, SINK + 0.8, t);
    const rr = 16 + Math.min(t, SINK) * 6;
    for (let x = BASE_X - rr; x <= BASE_X + rr; x++) {
      const d = Math.abs(x + 0.5 - BASE_X) / rr;
      if (d > 1) continue;
      if (Math.floor(x) % 2 === 0) p.dot(x, 0, d < 0.6 ? C[4] : C[3], 0.35 * f);
    }
    p.glow(BASE_X, -1, 30, C[4], 0.16 * f);
  }
}

// a small water seal: two rings of ticks turning against each other
function spiralSeal(p, C, t, a) {
  if (a <= 0) return;
  for (let i = 0; i < 16; i++) {
    const g = (i / 16) * TAU + t * 1.6;
    p.dot(BASE_X + Math.cos(g) * 9, Math.sin(g) * 9 * 0.22, C[5], a * 0.7);
    const h = (i / 16) * TAU - t * 2.2;
    p.dot(BASE_X + Math.cos(h) * 14, Math.sin(h) * 14 * 0.22, C[4], a * 0.5);
  }
  for (let i = 0; i < 8; i++) {
    const g = (i / 8) * TAU - t * 2.8;
    p.dot(BASE_X + Math.cos(g) * 5, Math.sin(g) * 5 * 0.22, C[6], a * 0.8);
    p.dot(BASE_X + Math.cos(g) * 20, Math.sin(g) * 20 * 0.22, C[4], a * 0.35);
  }
  p.dot(BASE_X, -1, C[6], a * 0.8);
}
