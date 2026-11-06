// Shared by the Explosion set (爆裂魔法): the crimson blast ramp, the mage's floor seal with its rune alphabet,
// the rayed star a detonation blooms into, and the wisps a chant pulls in. Files starting with _ are helpers.
import { clamp, hex, rand, TAU, WHITE } from "../../core/index.js";
import { floorRing, tone } from "../arcane/_lib.js";

/** The blast, dark to bright: near-black blood, crimson, scarlet, orange, gold, hot cream. */
export const CRIMSON = ["#10050c", "#2e0813", "#5c0d1e", "#96142a", "#cf2230", "#ff4a2a", "#ff8f3a", "#ffd36a"];
/** A deeper, colder step for the chant, so the incantation reads darker than the blow it sets up. */
export const BLOOD = ["#0a0410", "#1e0616", "#42081c", "#74101f", "#a81a26", "#e03028", "#ff6a44", "#ffb878"];
/** The seal's ink: dark red burning up through scarlet to a white-hot leading edge. */
export const SEAL = ["#1c0510", "#42091a", "#78121f", "#b41c2c", "#ee3a2c", "#ffb070"];
/** Smoke over a crimson blast: warm ash, light to dark. */
export const ASH = ["#ab989c", "#847175", "#64555f", "#463b46", "#2b2331"];
export const SOOT = hex("#0c080e"), CINDER = hex("#191220");

// An original rune alphabet: angular 3 x 5 glyphs, drawn standing upright on the ring.
export const RUNES = [
  ["#.#", "###", ".#.", ".#.", "#.#"],
  ["##.", "#.#", "##.", "#..", "###"],
  [".#.", "###", ".#.", "###", ".#."],
  ["#..", "###", ".#.", "###", "..#"],
  ["###", "..#", "###", "#..", "###"],
  ["#.#", ".#.", "###", ".#.", "#.#"],
  [".##", "#..", "##.", "..#", "##."],
  ["#.#", "#.#", "###", "..#", "..#"],
];

/** Rune i standing on (x, y) (its bottom row sits on y), 1 px thick, a darker copy a pixel lower underneath. */
export function rune(p, i, x, y, c, a = 1, under = 0) {
  const g = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length], X = Math.round(x) - 1, Y = Math.round(y) - g.length + 1;
  if (under) p.sprite(g, {}, X, Y + 1, { tint: under, a });
  p.sprite(g, {}, X, Y, { tint: c, a });
}

const FRONT = Math.PI / 2;
// how far round the ring an angle is from the front, 0 at the near side and 1 at the back
const pen = (g) => Math.abs(Math.atan2(Math.sin(g - FRONT), Math.cos(g - FRONT))) / Math.PI;

/**
 * A mage's seal on the floor: filled light inside, three rings, a tick band, a six-point star and a ring of
 * runes, all squashed onto the ground plane (sy) and drawn on from the front round both ways by `write`.
 * `level` is how hot it burns, `hot` (0..1) pushes the ink toward white, `keep(g)` splits the far half from the
 * near so a seal can be drawn behind and in front of a body. spin turns the star and rune ring.
 */
export function floorSeal(p, o = {}) {
  const {
    x = 0, y = 0, r = 44, sy = 0.3, spin = 0, starSpin = 0, write = 1, level = 1, hot = 0, keep = null,
    C = SEAL, fill = 0, ticks = 28, star = true, glyphs = true, shade = true,
  } = o;
  if (r < 3) return;
  const R = C.map(hex), n = R.length;
  const ink = clamp(0.34 + level * 0.46, 0, 1);
  const body = hot > 0.72 ? WHITE : hot > 0.45 ? R[n - 1] : R[clamp(Math.floor(ink * (n - 1)), 1, n - 2)];
  const soft = hot > 0.45 ? R[n - 1] : R[clamp(Math.floor(ink * (n - 1)) - 1, 1, n - 2)];
  const vis = (g) => pen(g) <= write + 1e-6;

  // light lying on the floor inside the seal, dithered so it reads as glow rather than paint
  if (fill > 0.005) {
    p.shade(x - r, y - r * sy, x + r, y + r * sy, (px, py, out) => {
      const dx = px - x, dy = (py - y) / sy, d = Math.hypot(dx, dy) / r;
      if (d > 1 || d < 0.02) return;
      if (keep && !keep(Math.atan2(dy, dx))) return;
      out.c = tone(R, fill * (1 - d) * (0.65 + 0.35 * level), px, py, 0.04, 0.55);
    });
  }

  // three rings, each written on from the front; the leading tip runs white
  for (const [rr, w] of [[1, 1], [0.86, 0.75], [0.6, 0.7]]) {
    floorRing(p, x, y, r * rr, sy,
      (g) => (pen(g) > write - 0.05 ? WHITE : pen(g) > write - 0.16 ? R[n - 1] : body),
      (g) => (vis(g) ? (pen(g) > write - 0.05 ? 1 : 0.55 + 0.45 * level) : 0), keep);
  }

  // the tick band between the two outer rings
  if (ticks > 0) {
    for (let i = 0; i < ticks; i++) {
      const g = ((i + 0.5) / ticks) * TAU;
      if (!vis(g) || (keep && !keep(g))) continue;
      const c = i % 4 === 0 ? R[n - 1] : soft, ca = Math.cos(g), sa = Math.sin(g);
      p.dot(x + ca * r * 0.86, y + sa * r * 0.86 * sy, c, 0.9);
      p.dot(x + ca * r * 0.92, y + sa * r * 0.92 * sy, c, 0.9);
      if (i % 2 === 0) p.dot(x + ca * r * 0.985, y + sa * r * 0.985 * sy, body, 0.75);
    }
  }

  // the star: two triangles, each edge grown out over the second half of the drawing
  if (star) {
    const rr = r * 0.56, s = clamp((write - 0.42) / 0.5), a0 = -Math.PI / 2 + spin + starSpin;
    const tri = (off) => [0, 1, 2].map((k) => a0 + off + (k * TAU) / 3);
    const edges = [];
    for (const off of [0, Math.PI]) {
      const A = tri(off);
      for (let k = 0; k < 3; k++) edges.push([A[k], A[(k + 1) % 3]]);
    }
    edges.forEach(([ga, gb], j) => {
      const grow = clamp(s * 1.6 - j * 0.1);
      if (grow <= 0) return;
      const ax = x + Math.cos(ga) * rr, ay = y + Math.sin(ga) * rr * sy;
      const bx = x + Math.cos(gb) * rr, by = y + Math.sin(gb) * rr * sy;
      const ex = ax + (bx - ax) * grow, ey = ay + (by - ay) * grow;
      const L = Math.hypot(ex - ax, ey - ay), steps = Math.ceil(L * 1.4) + 1;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps, px = ax + (ex - ax) * u, py = ay + (ey - ay) * u;
        if (keep && !keep(Math.atan2((py - y) / sy, px - x))) continue;
        p.dot(px, py, u > 0.96 ? WHITE : body, 0.75 + 0.25 * level);
      }
    });
  }

  // the rune ring, standing on the floor just outside the inner circle
  if (glyphs) {
    for (let i = 0; i < 8; i++) {
      const g = -Math.PI / 2 + spin + (i * TAU) / 8;
      if (!vis(g) || (keep && !keep(g))) continue;
      const gx = x + Math.cos(g) * r * 0.72, gy = y + Math.sin(g) * r * 0.72 * sy;
      const lift = Math.sin(g) < 0 ? -1 : 0;
      rune(p, i, gx, gy - 1 + lift * 0.5, pen(g) > write - 0.05 ? WHITE : body, 0.85, soft);
    }
  }
}

/**
 * The seal's light: a pool on the floor that follows a seal, faded by k. Kept here so every piece of the set sits
 * its glow in the same place.
 */
export function sealLight(p, x, y, r, sy, c, k) {
  if (k <= 0.004) return;
  p.glow(x, y - r * sy * 0.15, r * 1.15, c, 0.22 * k);
  p.glow(x, y - r * sy * 0.15, r * 0.55, c, 0.3 * k);
}

/**
 * A rayed star, the shape a detonation blooms into before it becomes a fireball: `spikes` rays with deep valleys,
 * a hot core and a crisp rim, shaded radially through ramp C so it cools from white in the middle to crimson at
 * the points. `rot` turns it; `thin` is the radius of the valleys (1 would be a disc); `warm` 0..1 lifts the
 * interior toward white.
 */
export function blastStar(p, x, y, r, o = {}) {
  const { spikes = 10, rot = 0, thin = 0.38, sharp = 0.55, C = CRIMSON, warm = 1, rim = 1, k = 1, box = null } = o;
  if (r < 2 || k <= 0.004) return;
  const R = C.map(hex), n = R.length;
  const [bx0, by0, bx1, by1] = box ?? [-Infinity, -Infinity, Infinity, Infinity];
  p.shade(Math.max(bx0, x - r), Math.max(by0, y - r), Math.min(bx1, x + r), Math.min(by1, y + r), (px, py) => {
    const dx = px - x, dy = py - y, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const lobe = Math.pow(Math.abs(Math.cos(a * spikes * 0.5 + rot)), sharp);
    const rr = r * (thin + (1 - thin) * lobe);
    if (d > rr) return;
    const u = d / rr;                       // 0 heart .. 1 ray tip
    if (u > 0.93) return R[rim];
    // the heart is white-hot, the body cools outward through the ramp, and the ray axes stay hotter than the valleys
    const heat = clamp(0.34 + warm * 0.56 - u * 0.72 + (lobe - 0.5) * 0.2, 0, 1.35);
    return tone(R, heat, px, py, 0.02, 0.85);
  });
}

/**
 * Long thin rays beyond a star's points: the light it throws past its own silhouette, drawn as 1 px needles that
 * fade along their length. n rays, alternating long and short; rot turns them.
 */
export function blastRays(p, x, y, r, o = {}) {
  const { n = 12, rot = 0, inner = 0.2, C = CRIMSON, k = 1, thin = 1, box = null } = o;
  if (k <= 0.004) return;
  const R = C.map(hex), len = R.length;
  const [bx0, by0, bx1, by1] = box ?? [-Infinity, -Infinity, Infinity, Infinity];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * TAU, long = i % 2 === 0 ? 1 : 0.62, L = r * long * (0.6 + 0.4 * rand(i, 5));
    const ca = Math.cos(a), sa = Math.sin(a);
    for (let d = r * inner; d <= L; d += 0.5) {
      const u = (d - r * inner) / (L - r * inner), px = x + ca * d, py = y + sa * d;
      if (px < bx0 || px > bx1 || py < by0 || py > by1) continue;
      p.dot(px, py, u < 0.25 ? WHITE : u < 0.55 ? R[len - 1] : R[len - 2], k * (1 - u) * (thin === 1 ? 1 : 0.7));
    }
  }
}

/**
 * Energy drawn in: `n` wisps spiralling from radius r0 onto (x, y) over `life` seconds, repeating every `period`
 * so a chant loops seamlessly. Each wisp is a short bright streak with a dark tail; `swirl` is how far it turns
 * on the way in, `squash` lays the spiral onto the floor (1 is a circle facing the viewer).
 */
export function gatherMotes(p, o = {}) {
  const { x = 0, y = -22, r0 = 74, life = 0.9, period = 2.4, t = 0, n = 18, seed = 7, swirl = 1.5, squash = 0.55, C = SEAL, k = 1, size = 1 } = o;
  const R = C.map(hex), len = R.length;
  for (let i = 0; i < n; i++) {
    const born = rand(seed, i, 1) * period, L = life * (0.7 + 0.6 * rand(seed, i, 2));
    let age = (((t - born) % period) + period) % period;
    if (age >= L) continue;
    const u = age / L, e = u * u * (3 - 2 * u);
    const a = rand(seed, i, 3) * TAU + swirl * e, rad = r0 * (1 - e) + 2;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * squash + 3 * Math.sin(e * 6 + i);
    // a streak along the direction of travel, brightest at the head
    const a2 = a + 0.12, rad2 = r0 * (1 - Math.max(0, e - 0.035)) + 2;
    const qx = x + Math.cos(a2) * rad2, qy = y + Math.sin(a2) * rad2 * squash + 3 * Math.sin((e - 0.035) * 6 + i);
    const tail = clamp(2 + u * 5, 2, 8) * size, dx = qx - px, dy = qy - py, dl = Math.hypot(dx, dy) || 1;
    const ux = dx / dl, uy = dy / dl;
    const fade = Math.sin(Math.PI * clamp(u * 1.15)) * k;
    for (let d = tail; d >= 0; d -= 0.5) p.dot(px - ux * d, py - uy * d, d < 1 ? WHITE : d < tail * 0.45 ? R[len - 2] : R[len - 3], fade * (d < tail * 0.5 ? 1 : 0.7));
    if (i % 3 === 0) p.glow(px, py, 4 + size * 2, R[len - 2], 0.3 * fade);
  }
}
