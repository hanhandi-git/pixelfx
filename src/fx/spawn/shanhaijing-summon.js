import { Particles, Bits, Lights, P, PF, B, Rng, fit, clamp, smooth, ease, noise, rand, TAU, WHITE, hex, mix } from "../../core/index.js";

export const meta = {
  name: "Shanhaijing summon",
  desc: "A cinnabar circle inks itself in oracle-bone glyphs, the air drags inward, the floor tears open and an antlered beast heaves up out of the dark, throat and eyes catching fire.",
  tags: ["spawn", "summon", "ritual", "runes", "cinnabar", "dragon", "beast", "ink", "ground", "one-shot"],
  size: [224, 160],
  origin: [112, 124],
  duration: 6.4,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#1a0608", "#3d0c0c", "#7a1a10", "#c0381a", "#f06a1e", "#ffae3a", "#ffe08a", "#ffffff"],
    body: ["#05040a", "#0e0b1a", "#181228", "#231b35", "#322748"],
    horn: ["#100b0e", "#241a1c", "#3d2d28", "#5e4433", "#8a6540"],
    gold: ["#2a1a10", "#5c3a16", "#8f6321", "#c9954a", "#f0cd7a", "#fff0b8"],
    stone: ["#15121c", "#241f2d", "#3b3448", "#57506a", "#7d7694"],
    seed: 4,
  },
};

const SOOT = hex("#0c0812");
const DRAW = 0.9, CHARGE = 1.05, RIFT = 1.9, EYES = 3.4, FADE = 4.95, SY = 0.3, R0 = 54, R1 = 41;

// ---- the beast: an antlered head on an arched neck, three-quarters towards us, facing right. Built part by
// part so overlapping forms keep their own edges: each pixel keeps the frontmost part over it, that part's
// surface direction (from its own blurred shape), and whether it sits on a crease over a part behind.
const PARTS = ["skull", "brow", "snout", "maw", "jaw", "ear", "antler", "frill", "neck", "spines"];
function beast() {
  const W = 78, H = 92, N = W * H, parts = PARTS.map(() => new Uint8Array(N));
  let cur;
  const put = (x, y) => {
    x = Math.round(x), y = Math.round(y);
    if (x >= 0 && y >= 0 && x < W && y < H) cur[y * W + x] = 1;
  };
  const ell = (cx, cy, rx, ry) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) put(x, y);
      }
  };
  const stroke = (pts, r0, r1) => {
    const L = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += L[i - 1] = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    for (let i = 1, acc = 0; i < pts.length; acc += L[i - 1], i++) {
      const n = Math.ceil(L[i - 1] * 3) + 1;
      for (let j = 0; j <= n; j++) {
        const u = j / n, r = r0 + (r1 - r0) * ((acc + L[i - 1] * u) / total);
        ell(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, r, r);
      }
    }
  };
  const [SKULL, BROW, SNOUT, MAW, JAW, EAR, ANTLER, FRILL, NECK, SPINES] = parts;
  cur = NECK;
  stroke([[28, 40], [22, 58], [28, 76], [33, 94], [34, 98]], 9, 14);
  // a mane of spines down the back of the neck: the silhouette that says beast, not worm
  cur = SPINES;
  stroke([[20, 45], [11, 42]], 2.4, 0.5);
  stroke([[17, 53], [7, 52]], 2.6, 0.5);
  stroke([[16, 61], [6, 61]], 2.8, 0.5);
  stroke([[17, 69], [7, 71]], 2.8, 0.5);
  stroke([[19, 77], [9, 80]], 2.6, 0.5);
  stroke([[22, 85], [12, 88]], 2.4, 0.5);
  stroke([[25, 92], [16, 96]], 2.2, 0.5);
  cur = ANTLER;
  stroke([[23, 22], [16, 13], [10, 6], [5, 1]], 3.4, 0.8);
  stroke([[16, 13], [21, 5], [22, 1]], 1.7, 0.5);
  stroke([[10, 6], [3, 6], [0, 3]], 1.5, 0.5);
  cur = EAR;
  stroke([[20, 30], [13, 28], [8, 26]], 3, 0.7);
  cur = FRILL;
  stroke([[25, 42], [17, 45], [12, 47]], 2.4, 0.6);
  stroke([[26, 48], [18, 52], [13, 56]], 2.2, 0.6);
  stroke([[26, 20], [21, 14], [19, 10]], 1.8, 0.5);
  cur = JAW;
  stroke([[34, 46], [47, 50], [60, 49]], 4.4, 2.8);
  cur = SNOUT;
  stroke([[34, 34], [50, 37], [64, 40]], 5.8, 3);
  ell(65, 40, 3, 3);
  cur = MAW;
  stroke([[36, 43], [50, 45], [64, 44]], 3.8, 2.6);
  cur = SKULL;
  ell(28, 28, 10, 9.5);
  cur = BROW;
  ell(36, 27, 6, 3.6);
  ell(41, 31, 4.5, 3.6);

  const part = new Uint8Array(N);
  for (let i = 0; i < N; i++) for (let k = 0; k < parts.length; k++) if (parts[k][i]) { part[i] = k + 1; break; }
  const on = (x, y) => x >= 0 && y >= 0 && x < W && y < H && part[y * W + x] > 0;
  // surface direction per part: the gradient of the part blurred on its own
  const blur = (src) => {
    let a = Float32Array.from(src), b = new Float32Array(N);
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let s = 0;
          for (let d = -2; d <= 2; d++) s += x + d >= 0 && x + d < W ? a[y * W + x + d] : 0;
          b[y * W + x] = s / 5;
        }
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let s = 0;
          for (let d = -2; d <= 2; d++) s += y + d >= 0 && y + d < H ? b[(y + d) * W + x] : 0;
          a[y * W + x] = s / 5;
        }
    }
    return a;
  };
  const amb = new Float32Array(N), down = new Float32Array(N), rim = new Float32Array(N), top = new Uint8Array(N), crease = new Uint8Array(N), plate = new Uint8Array(N);
  const LX = -0.46, LY = -0.52, LZ = 0.72; // moonlight, up and to the left, a little in front
  parts.forEach((pm, k) => {
    // the part's own box gives it a round form: a big part shades like a dome, a thin one like a rod
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) if (pm[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2, rx = Math.max(2, (x1 - x0 + 1) / 2), ry = Math.max(2, (y1 - y0 + 1) / 2);
    const B = blur(pm), at = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? B[y * W + x] : 0);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (part[i] !== k + 1) continue;
        const gx = at(x + 1, y) - at(x - 1, y), gy = at(x, y + 1) - at(x, y - 1), g = Math.hypot(gx, gy) || 1e-6;
        const oy = -gy / g, e = clamp(g / 0.28);
        // a dome normal from the part's own box, lit from up and left
        const dx = clamp((x + 0.5 - cx) / rx, -1, 1), dy = clamp((y + 0.5 - cy) / ry, -1, 1);
        const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
        const lam = clamp(0.5 + 0.5 * (dx * LX + dy * LY + z * LZ) * 1.35);
        const thin = k === 6; // the antlers: a rod's edge, not a dome
        amb[i] = thin ? 0.42 + e * (0.4 * Math.max(0, -oy) - 0.3 * Math.max(0, oy)) : lam;
        down[i] = thin ? e * Math.max(0, oy) : Math.max(0, dy) * 0.8;
        for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const j = (y + ay) * W + x + ax;
          if (on(x + ax, y + ay) && part[j] > k + 1) crease[i] = 1;
        }
      }
  });
  // bronze scale rows: a wavy 1 px seam every six rows, running down the skull, the neck and the jaw
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x, pt = part[i];
      if (!pt || pt === 5 || pt === 6 || pt === 7) continue;
      const u = (((y * 0.17 + Math.sin(x * 0.17) * 0.55) % 1) + 1) % 1;
      if (u < 0.11) plate[i] = 1;
    }
  // the underlight's rim (bottom of the silhouette, two pixels deep) and the moon's rim along its top
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!on(x, y)) continue;
      rim[y * W + x] = !on(x, y + 1) ? 1 : !on(x, y + 2) ? 0.5 : 0;
      if (!on(x, y - 1) && part[y * W + x] !== 4) top[y * W + x] = 1;
    }
  const outline = [];
  for (let y = -1; y <= H; y++)
    for (let x = -1; x <= W; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) outline.push([x, y]);
  const eyes = [[38, 29], [39, 29], [38, 30], [39, 30]];
  const teethU = [], teethL = [];
  for (const x of [46, 49, 52, 55, 58]) for (let k = 0; k < 2; k++) teethU.push([x, 41 + k]);
  for (const x of [47, 51, 55]) for (let k = 0; k < 2; k++) teethL.push([x, 48 - k]);
  return { w: W, h: H, part, amb, down, rim, top, crease, plate, outline, eyes, teethU, teethL };
}
const BEAST = beast();

// oracle-bone glyphs: little strokes in (along, across) units, set round the circle between its two rings
const GLYPHS = [
  [[[0, -2], [0, 2]], [[-1.3, -1.2], [1.3, -1.2]], [[-0.9, -1.2], [0, 2]], [[0.9, -1.2], [0, 2]]],
  [[[-1.4, 2], [0, -2], [1.4, 2]], [[-0.9, 0.5], [0.9, 0.5]], [[0, -2], [0, 2]]],
  [[[-1.5, -2], [-1.5, 2], [1.5, 2]], [[-1.5, 0], [0.6, 0]], [[0.6, 0], [1.5, -1.2]]],
  [[[0, -2], [0, 2]], [[0, -2], [1.5, -0.6], [0, 0.6]], [[-1.4, 1.4], [1.4, 1.4]]],
  [[[-1.5, -2], [1.5, 2]], [[1.5, -2], [-1.5, 2]], [[-1.4, 0], [1.4, 0]]],
  [[[-1.4, -2], [1.4, -2], [-1.4, 2], [1.4, 2]], [[0, -2], [0, 2]]],
  [[[-1.2, -2], [1.2, -2]], [[0, -2], [0, 2]], [[-1.2, 2], [1.2, 2]], [[-0.6, 0], [0.6, 0]]],
  [[[1.4, -2], [-0.4, 0], [1.4, 2]], [[-1.3, -2], [-1.3, 2]]],
];

// broken pillars ringing the altar: x, half width, height, lean
const PILLARS = [
  [-98, 4, 58, -1.5], [-76, 3, 40, 1], [76, 3, 44, -1], [98, 4, 62, 1.5],
];

export function create(o) {
  const C = fit(o.palette, 8), SH = fit(o.body, 5), HR = fit(o.horn, 5), GD = fit(o.gold, 6), ST = fit(o.stone, 5);
  const MOON = mix(SH[4], ST[3], 0.55);
  const DUST = mix(ST[2], hex("#7a6c78"), 0.4), R = new Rng(o.seed), floor = () => 0;
  const ps = new Particles({ rng: R, ground: floor, sparks: [C[6], C[5], C[4], C[3]] });
  const rocks = new Bits({ ground: floor }), lights = new Lights();
  const RUB = [ST[0], ST[1], mix(ST[2], C[2], 0.35), mix(ST[3], C[4], 0.3), mix(ST[4], C[5], 0.35)];
  const runes = Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * TAU + 0.13, g: GLYPHS[(i * 5 + 2) % GLYPHS.length] }));
  // cracks radiating from the middle of the circle, on the floor plane
  const cracks = [];
  for (let i = 0; i < 7; i++) {
    let a = (i / 7) * TAU + R.range(-0.25, 0.25), r = 3;
    const pts = [[0, 0]], len = R.range(R1 * 0.6, R1 * 1.1);
    while (r < len) {
      r += R.range(2, 4);
      a += R.range(-0.3, 0.3);
      pts.push([Math.cos(a) * r, Math.sin(a) * r * SY]);
    }
    cracks.push(pts);
  }
  // the rise: two heaves with a sag between, an overshoot at the top
  const rise = (t) => {
    if (t < RIFT) return 0;
    const a = ease.outCubic(clamp((t - RIFT) / 0.35)) * 0.5;
    const sag = 0.04 * Math.sin(Math.PI * clamp((t - RIFT - 0.38) / 0.26));
    const b = ease.outBack(clamp((t - RIFT - 0.58) / 0.5), 1.3) * 0.5;
    return a - sag + b;
  };
  // the circle's fire: lights up as it inks itself, flares at the tear and when the eyes open, dies in the fade
  const heat = (t) =>
    smooth(0, DRAW, t) * (1 - smooth(FADE, FADE + 0.9, t)) * (1 - 0.2 * smooth(EYES + 0.2, EYES + 0.9, t)) *
    (0.85 + 0.15 * noise(t * 9, 3) + 0.5 * Math.exp(-((t - RIFT) ** 2) / 0.02) + 0.3 * Math.exp(-((t - EYES) ** 2) / 0.012));
  let t = 0;
  const done = {};
  const left = (a, b) => Math.max(0.05, Math.min(R.range(a, b), meta.duration - 0.1 - t));
  const once = (k, at) => !done[k] && t >= at && (done[k] = true);
  const topEdge = () => {
    const off = BEAST.h * (1 - rise(t)), pts = [];
    for (let x = 0; x < BEAST.w; x++)
      for (let y = 0; y < BEAST.h; y++)
        if (BEAST.part[y * BEAST.w + x]) {
          const ly = y - BEAST.h + off;
          if (ly < 0) pts.push([x - BEAST.w / 2, ly]);
          break;
        }
    return pts;
  };

  return {
    update(dt) {
      t += dt;
      const h = heat(t);
      // the circle inks itself in from the front round to the back: sparks ride the burning tip
      if (t < DRAW) {
        const ph = (t / DRAW) * Math.PI;
        for (const s of [-1, 1]) {
          const a = Math.PI / 2 + s * ph, y = Math.sin(a) * R0 * SY;
          if (R.chance(0.5)) y < -0.5 ? ps.spawn(P.SPARK, Math.cos(a) * R0, y, R.range(-40, 40), -R.range(40, 130), R.range(0.2, 0.45)) : ps.spawn(P.EMBER, Math.cos(a) * R0, y, R.range(-20, 20), -R.range(30, 70), R.range(0.3, 0.6), C[6], 1.4);
        }
      }
      // embers smouldering off the lines, thin smoke climbing off the circle
      if (t > 0.2 && t < FADE + 0.6 && R.chance(0.2 * h)) {
        const a = R.range(0, TAU), r = R.pick([R0, R1, R0]);
        ps.spawn(P.EMBER, Math.cos(a) * r, Math.sin(a) * r * SY, R.range(-10, 10), -R.range(20, 50), left(0.8, 1.6), C[5], R.range(1, 1.8));
      }
      if (t > 0.3 && t < FADE + 0.4 && R.chance(0.05 * h)) {
        const a = R.range(0, TAU);
        ps.spawn(P.SMOKE, Math.cos(a) * R0 * 0.9, Math.sin(a) * R0 * SY - 1, R.range(-4, 4), -R.range(12, 24), left(1.3, 2.1), 0, R.range(2.2, 3.4));
      }
      if (once("ign", DRAW)) lights.add(0, -4, 62, C[4], 0.55, 0.55);
      if (once("runes", DRAW + 0.05)) lights.add(0, -4, 52, C[5], 0.5, 0.4);
      // the charge: grit lifts off the floor and streaks inward, embers spiral down into the hole
      if (t > CHARGE && t < RIFT) {
        const u = (t - CHARGE) / (RIFT - CHARGE);
        if (R.chance(0.9 * u)) {
          const a = R.range(0, TAU), r = R.range(R0 * 0.7, R0 * 1.25), sp = R.range(80, 140) * (0.6 + u * 0.6);
          ps.spawn(P.STREAK, Math.cos(a) * r, Math.sin(a) * r * SY - R.range(0, 16), -Math.cos(a) * sp, -Math.sin(a) * sp * SY - 18, R.range(0.2, 0.32), R.chance(0.5) ? C[5] : GD[3], R.range(1, 2));
        }
        if (R.chance(0.5 * u)) {
          const a = R.range(0, TAU), r = R.range(R0 * 0.8, R0 * 1.4);
          ps.spawn(P.MOTE, Math.cos(a) * r, R.range(-30, -4), -Math.cos(a) * R.range(40, 90), -R.range(30, 70), R.range(0.4, 0.8), C[4], R.range(1, 2));
        }
        if (R.chance(0.35)) ps.spawn(P.GRIT, R.range(-R1, R1), -0.5, R.range(-20, 20), -R.range(40, 120), R.range(0.5, 0.9), R.pick([ST[2], ST[3], ST[4]]), 1);
        if (R.chance(0.1)) ps.spawn(P.DUST, R.range(-R1, R1), -1, R.range(-12, 12), -R.range(6, 16), R.range(0.4, 0.7), DUST, R.range(1.5, 2.5));
        // the pillar marks answer the circle
        if (t > RIFT - 0.5 && R.chance(0.15)) {
          const x = R.pick([-98, -76, 76, 98]) + R.range(-2, 2);
          ps.spawn(P.EMBER, x, -R.range(6, 40), R.range(-8, 8), -R.range(10, 30), left(0.6, 1.2), C[5], 1);
        }
      }
      // the tear: the floor splits, a fist of ink bursts out of it, everything white for two frames
      if (once("rift", RIFT)) {
        lights.add(0, -14, 78, C[5], 0.8, 0.45);
        lights.add(0, -6, 30, C[6], 0.7, 0.12);
        lights.add(0, -46, 64, C[4], 0.4, 0.7);
        for (let i = 0; i < 18; i++)
          rocks.add({ kind: B.CHUNK, x: R.range(-8, 8), y: -2, vx: R.range(-38, 38), vy: -R.range(190, 360), g: 1, drag: 0.7, bounce: 0.32, life: R.range(1.6, 2.5), a: R.range(0, TAU), va: R.range(-14, 14), s: R.range(1.3, 3.2), ramp: RUB });
        for (let i = 0; i < 70; i++) {
          const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.8, sp = R.range(90, 250) * (1 - 0.4 * Math.abs(u));
          ps.spawn(P.GRIT, u * 12, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 1.8), R.pick([ST[2], ST[3], ST[3], ST[4]]), R.chance(0.4) ? 2 : 1);
        }
        // ink: heavy near-black plumes rolling out low and climbing
        for (let i = 0; i < 16; i++) {
          const s = R.sign();
          ps.spawn(P.SMOKE, s * R.range(2, 20), -R.range(1, 8), s * R.range(45, 120), -R.range(6, 40), R.range(1.3, 2.2), SOOT, R.range(4, 7.5), R.range(0, 0.12), PF.BIG);
        }
        for (let i = 0; i < 6; i++) {
          const s = R.sign();
          ps.spawn(P.SMOKE, s * R.range(12, 26), -R.range(6, 16), s * R.range(10, 40), -R.range(50, 110), R.range(1.4, 2.2), SOOT, R.range(4.5, 7), R.range(0, 0.15), PF.BIG);
        }
        for (let i = 0; i < 26; i++) {
          const a = -Math.PI / 2 + R.range(-1.15, 1.15), sp = R.range(160, 380);
          ps.spawn(P.SPARK, R.range(-8, 8), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.65));
        }
      }
      // the heave: earth slides off its neck, dust rolls out round its base
      const rv = rise(t) - rise(t - dt);
      if (t > RIFT && t < RIFT + 1.3 && rv > 0) {
        if (R.chance(Math.min(0.9, rv * 140))) {
          const e = topEdge();
          if (e.length) {
            const [x, y] = R.pick(e);
            ps.spawn(P.GRIT, x, y, R.range(-25, 25), -R.range(10, 60), R.range(0.8, 1.4), R.pick([ST[2], ST[3], ST[4]]), R.chance(0.3) ? 2 : 1);
          }
        }
        if (R.chance(Math.min(0.9, rv * 80))) {
          const s = R.sign();
          ps.spawn(P.SMOKE, s * R.range(8, 22), -R.range(1, 4), s * R.range(30, 80), -R.range(2, 12), R.range(1, 1.8), DUST, R.range(3, 5.5), 0, PF.BIG);
        }
      }
      if (once("heave2", RIFT + 0.6)) {
        lights.add(0, -10, 60, C[4], 0.6, 0.4);
        for (let i = 0; i < 9; i++)
          rocks.add({ kind: B.CHUNK, x: R.sign() * R.range(10, 24), y: -2, vx: R.sign() * R.range(25, 70), vy: -R.range(90, 180), g: 1, drag: 0.7, bounce: 0.3, life: R.range(1.2, 1.8), a: R.range(0, TAU), va: R.range(-12, 12), s: R.range(1.2, 2.4), ramp: RUB });
      }
      // the eyes open: the maw floods with light, the whole ring answers
      if (once("eyes", EYES)) {
        lights.add(1, -BEAST.h + 22, 40, C[6], 0.9, 0.35);
        lights.add(0, -6, 80, C[5], 0.7, 0.5);
        for (let i = 0; i < 7; i++) ps.spawn(P.SPARK, 1, -BEAST.h + 22, R.range(-70, 80), R.range(-80, 20), R.range(0.12, 0.3));
        for (let i = 0; i < 12; i++) {
          const s = R.sign();
          ps.spawn(P.DUST, s * R.range(10, 24), -1, s * R.range(30, 80), -R.range(3, 10), R.range(0.4, 0.8), DUST, R.range(1.5, 3));
        }
        for (let i = 0; i < 16; i++) {
          const a = R.range(0, TAU);
          ps.spawn(P.DUST, Math.cos(a) * 20, Math.sin(a) * 20 * SY, Math.cos(a) * R.range(60, 130), Math.sin(a) * R.range(10, 30), R.range(0.5, 0.9), DUST, R.range(1.6, 3));
        }
      }
      // hold: embers drifting up off the beast's rim, ink bleeding off its outline
      if (t > EYES && t < FADE + 0.4 && R.chance(0.35)) {
        const x = R.int(6, BEAST.w - 6), y = R.int(6, BEAST.h - 6);
        if (BEAST.part[y * BEAST.w + x]) {
          const off = BEAST.h * (1 - rise(t)), lx = x - BEAST.w / 2, ly = y - BEAST.h + off;
          if (R.chance(0.6)) ps.spawn(P.EMBER, lx, ly, R.range(-12, 12), -R.range(20, 60), left(0.7, 1.4), C[5], R.range(1, 1.8));
          if (R.chance(0.35)) ps.spawn(P.SMOKE, lx, ly, R.range(-8, 8), -R.range(6, 20), left(0.7, 1.2), SOOT, R.range(1.4, 2.6));
        }
      }
      // the sinking: the body goes soft, ink runs off it and the last embers fall
      if (t > FADE + 0.05 && t < FADE + 0.9 && R.chance(0.5)) {
        const x = R.int(4, BEAST.w - 5), y = R.int(2, BEAST.h - 4);
        if (BEAST.part[y * BEAST.w + x]) {
          const off = BEAST.h * (1 - rise(t)), lx = x - BEAST.w / 2, ly = y - BEAST.h + off;
          ps.spawn(P.EMBER, lx, ly, R.range(-10, 10), R.range(-10, 20), left(0.6, 1.3), C[4], 1);
          if (R.chance(0.4)) ps.spawn(P.SMOKE, lx, ly, R.range(-6, 6), -R.range(10, 26), left(0.9, 1.6), SOOT, R.range(2, 3.4));
        }
      }
      rocks.update(dt);
      for (const b of rocks.list)
        if (b.rest && !b.dusted) {
          b.dusted = true;
          for (let i = 0; i < 2; i++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(6, 30), -R.range(2, 12), R.range(0.3, 0.6), DUST, R.range(1.2, 2.4));
        }
      ps.update(dt);
      lights.update(dt);
    },

    drawBack(p) {
      const h = heat(t);
      // the pillars: dark, broken, their marks warming with the circle, breaking up into ash at the end
      const diss = smooth(FADE - 0.1, FADE + 0.85, t);
      for (const [px, hw, tall, lean] of PILLARS) {
        const k = smooth(0.5, 1.6, t) * (1 - smooth(FADE, FADE + 0.9, t));
        for (let y = 0; y > -tall; y--) {
          const u = -y / tall, w = hw - Math.round(u * 1.2), x = px + lean * u;
          for (let i = -w; i <= w; i++) {
            if (diss > 0 && rand(Math.round(x + i), y, 12) < diss * 1.3 - u * 0.3) continue;
            const edge = Math.abs(i) >= w - 0.5;
            p.px(x + i, y, edge ? ST[1] : i < 0 ? ST[1] : ST[0]);
          }
          if (y === -tall + 1 && diss < 0.9) for (let i = -w; i <= w; i++) if (rand(px, i, 7) > 0.5) p.px(x + i, y - 1, ST[1]);
        }
        if (k > 0.02)
          for (let i = 0; i < 4; i++) {
            const gy = -10 - i * (tall / 5), gx = px + lean * (10 / tall);
            const fl = 0.55 + 0.45 * noise(t * 3 + i * 2 + px, 5);
            p.dot(gx - 1, gy - 1, C[4], k * fl);
            p.dot(gx + 1, gy - 1, C[3], k * fl * 0.8);
            p.dot(gx, gy + 1, C[3], k * fl * 0.6);
            if (i === 0) p.glow(gx, gy, 7, C[4], 0.12 * k * fl);
          }
      }
      if (h <= 0.01) {
        ps.draw(p, "back");
        return;
      }
      // the warm pool on the floor
      p.glow(0, -2, 66, C[4], 0.3 * h);
      p.glow(0, -26, 84, C[4], 0.11 * h);
      p.glow(0, -1, 26, C[5], 0.22 * h);
      // the cracks open under it and glow
      const ck = smooth(DRAW + 0.1, RIFT, t) * (1 - smooth(FADE, FADE + 0.7, t));
      if (ck > 0)
        for (const pts of cracks)
          for (let i = 1; i < pts.length; i++) {
            const u = i / pts.length;
            if (u > ck * 1.1) break;
            const cool = smooth(RIFT + 0.1, RIFT + 1.1, t), ci = Math.round(6 - u * 2 - cool * 2.6);
            p.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], C[clamp(ci, 2, 6)], 1);
          }
      // the rings: burnt in from the front round to the back, flickering
      const n = 240, prog = clamp(t / DRAW) * Math.PI;
      for (let j = 0; j < n; j++) {
        const a = (j / n) * TAU, d = Math.abs(((a - Math.PI / 2 + Math.PI * 3) % TAU) - Math.PI);
        if (d > prog) continue;
        const fresh = prog - d < 0.25 && t < DRAW + 0.1, f = noise(a * 6 + t * 5, 4) * 0.5 + 0.5, k = h * (0.7 + 0.5 * f);
        const ca = Math.cos(a), sa = Math.sin(a);
        p.dot(ca * R0, sa * R0 * SY, fresh ? WHITE : k > 0.95 ? C[6] : k > 0.6 ? C[5] : k > 0.35 ? C[4] : C[3]);
        p.dot(ca * (R0 + 2.4), sa * (R0 + 2.4) * SY, k > 0.8 ? C[4] : C[3], 0.9);
        if (t > CHARGE - 0.15) p.dot(ca * R1, sa * R1 * SY, k > 0.9 ? C[5] : k > 0.5 ? C[4] : C[3], smooth(CHARGE - 0.15, CHARGE + 0.05, t));
        if (j % 13 === 0) p.glow(ca * R0, sa * R0 * SY, 10, C[4], 0.2 * k);
      }
      // the runes between the rings
      const rk = smooth(CHARGE - 0.2, CHARGE + 0.15, t);
      if (rk > 0)
        for (const r of runes) {
          const k = h * rk * (0.75 + 0.35 * noise(t * 4 + r.a * 5, 8)), mid = (R0 + R1) / 2 + 0.5, ta = [-Math.sin(r.a), Math.cos(r.a)], na = [Math.cos(r.a), Math.sin(r.a)];
          const proj = ([u, v]) => [na[0] * mid + ta[0] * u * 1.1 + na[0] * v, (na[1] * mid + ta[1] * u * 1.1 + na[1] * v) * SY];
          for (const strokes of r.g)
            for (let i = 1; i < strokes.length; i++) {
              const [x0, y0] = proj(strokes[i - 1]), [x1, y1] = proj(strokes[i]);
              p.line(x0, y0, x1, y1, k > 0.9 ? C[6] : k > 0.55 ? C[5] : C[4], Math.min(1, k * 1.5));
            }
        }
      // the tear the beast climbs out of: a gash of light with ink boiling over its lip
      const hole = smooth(RIFT - 0.05, RIFT + 0.15, t) * (1 - smooth(RIFT + 1.35, RIFT + 2.0, t));
      if (hole > 0) {
        const hw = 20 * hole;
        p.shade(-hw - 1, -1, hw + 1, 5, (x, y, out) => {
          const d = Math.hypot(x / hw, (y - 0.5) / 3.6);
          if (d > 1) return;
          out.c = d > 0.86 ? C[4] : d > 0.62 ? C[1] : C[0];
        });
        p.glow(0, 0, 30, C[5], 0.34 * hole * h);
      }
      // shock rings running out along the floor
      for (const t0 of [RIFT, EYES]) {
        const age = t - t0;
        if (age < 0 || age > 1.1) continue;
        const r = 14 + age * 100, k = (1 - age / 1.1) ** 2;
        for (let j = 0, m = Math.ceil(r * TAU * 1.1); j < m; j++) {
          const a = (j / m) * TAU, ca = Math.cos(a), sa = Math.sin(a) * SY;
          const f = 0.6 + 0.4 * noise(a * 5 + age * 6, 2);
          p.dot(ca * r, sa * r, k * f > 0.5 ? C[5] : C[4], Math.min(1, k * f * 1.6));
          if (j % 3 === 0) p.dot(ca * (r - 2), sa * (r - 2), C[3], k * 0.7);
        }
        p.glowRing(0, 0, r, 6, C[4], 0.16 * k);
      }
      ps.draw(p, "back");
    },

    draw(p) {
      const r = rise(t), h = heat(t), fade = smooth(FADE + 0.1, FADE + 0.85, t);
      const off = BEAST.h * (1 - r) + (r > 0.99 ? Math.sin(t * 2.1) * 0.7 - 0.7 : 0);
      if (r > 0) {
        const W = BEAST.w, H = BEAST.h, x0 = -W / 2, oy = off - H, k = Math.min(1, h);
        const gone = (x, y) => fade > 0 && fade > 0.06 + 0.86 * (0.55 * (1 - y / H) + 0.45 * rand(x, y, 3));
        for (const [x, y] of BEAST.outline) if (y + oy < 0 && !gone(x, clamp(y, 0, H - 1))) p.px(x0 + x, y + oy, SH[0]);
        for (let y = 0; y < H; y++) {
          const ly = y + oy;
          if (ly >= 0) break;
          // the ritual fire rakes up from the floor, the moon sits somewhere up and left
          const hot = Math.exp(ly / 21) * k, lift = Math.exp(ly / 58) * k;
          for (let x = 0; x < W; x++) {
            const i = y * W + x, pt = BEAST.part[i];
            if (!pt || gone(x, y)) continue;
            if (pt === 4) {
              // the maw: a black cave with the throat's ember deep inside
              const d = Math.hypot((x - 50) / 9.5, (y - 45) / 4.2);
              const glow = clamp(1 - d) * (0.35 + 0.65 * smooth(EYES - 0.1, EYES + 0.35, t)) * k;
              p.px(x0 + x, ly, glow > 0.62 ? C[5] : glow > 0.34 ? C[4] : glow > 0.14 ? C[2] : SH[0]);
              continue;
            }
            const ramp = pt === 7 ? HR : SH, a = BEAST.amb[i];
            let si = BEAST.crease[i] ? 0 : a > 0.78 ? 4 : a > 0.6 ? 3 : a > 0.38 ? 2 : 1;
            if (pt === 7 && si > 0) si = Math.min(4, si + (y < 3 ? 2 : 1));
            const Lr = BEAST.rim[i] * hot, Lp = BEAST.down[i] * lift * 0.95;
            let c = ramp[si];
            // scale seams catch a little bronze where the body is lit
            if (BEAST.plate[i] && si >= 3 && Lr < 0.45) c = mix(GD[2], c, 0.4 + 0.25 * noise(x * 0.3 + t * 2, 9));
            // rims can run hot; the broad planes only warm up along the seams
            if (Lr > 0.75) c = C[5];
            else if (Lr > 0.52) c = C[4];
            else if (Lr > 0.32) c = C[3];
            else if (Lp > 0.5) c = mix(ramp[si], C[2], 0.6);
            else if (Lp > 0.3) c = mix(ramp[si], C[2], 0.35);
            else if (Lr > 0.14 || Lp > 0.16) c = pt === 7 ? mix(ramp[si], C[2], 0.4) : mix(c, C[1], 0.5);
            else if (BEAST.top[i] && BEAST.plate[i]) c = mix(c, MOON, 0.35);
            else if (BEAST.top[i]) c = mix(c, MOON, 0.55);
            p.px(x0 + x, ly, c);
          }
        }
        // teeth: bone catching the mouthlight
        for (const [x, y] of BEAST.teethU) if (y + oy < 0 && !gone(x, y)) p.px(x0 + x, y + oy, mix(GD[4], WHITE, 0.2));
        for (const [x, y] of BEAST.teethL) if (y + oy < 0 && !gone(x, y)) p.px(x0 + x, y + oy, GD[3]);
        // the eye: a slit in a socket, opening on command
        const open = smooth(EYES - 0.12, EYES + 0.18, t) * (1 - smooth(FADE + 0.4, FADE + 0.9, t));
        if (open > 0) {
          const ex = 39 - W / 2, ey = 29 - H + off;
          if (ey < 0) {
            for (const [x, y] of BEAST.eyes) if (!gone(x, y)) p.px(x0 + x, y + oy, t < EYES + 0.3 ? WHITE : x === 38 && y === 29 ? WHITE : C[6]);
          for (const [x, y] of [[37, 28], [37, 31], [40, 28], [40, 31]]) if (!gone(x, y)) p.px(x0 + x, y + oy, SH[0]);
            p.glow(ex, ey, 6, C[5], 0.4 * open);
            p.glow(ex, ey, 15, C[4], 0.13 * open);
            const g = (t - EYES) / 0.35;
            if (g > 0 && g < 1) {
              const L = 7 * Math.pow(1 - g, 1.5);
              p.line(ex - L, ey, ex + L, ey, (u) => (Math.abs(u - 0.5) < 0.2 ? WHITE : Math.abs(u - 0.5) < 0.4 ? C[6] : C[5]));
              if (g < 0.4) p.line(ex, ey - 3 * (1 - g), ex, ey + 3 * (1 - g), C[6]);
            }
          }
        }
        // whiskers: long barbels trailing off the muzzle, swaying on the rise and the roar
        const wg = smooth(0.8, 0.97, r) * (1 - fade);
        if (wg > 0) {
          for (const [rootX, rootY, len, drop, ph] of [[62, 42, 20, 8, 0], [60, 45, 17, 12, 2.1]]) {
            const seg = [];
            for (let i = 1; i <= 9; i++) {
              const u = i / 9, sway = Math.sin(u * 3.4 + t * 2.2 + ph) * 2.4 * u;
              seg.push([rootX - u * (len + i * 1.2) - W / 2, rootY + u * drop + sway - H + off]);
            }
            for (let i = 1; i < seg.length; i++) {
              const u = i / seg.length;
              if (seg[i - 1][1] >= 0 || seg[i][1] >= 0) continue; // the barbels are below the floor line for a moment
              p.line(seg[i - 1][0], seg[i - 1][1], seg[i][0], seg[i][1], u < 0.5 ? GD[4] : GD[3], wg * (1 - u * 0.55));
            }
          }
        }
        // the light the beast casts on its own feet
        p.glow(0, -10, 40, C[4], 0.22 * h * r);
      }
      rocks.draw(p);
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}
