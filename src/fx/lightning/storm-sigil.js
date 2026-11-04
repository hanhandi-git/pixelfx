// The spell's staged rune, forked discharge, white-hot core and cooling ground arcs use the shared lightning
// inking recipe from Sprite Fusion's open-source lightning (https://www.spritefusion.com/pixel-art-vfx/lightning),
// MIT License, Copyright (c) 2026 Hugo Duprez. The composition and choreography are original to pixelfx.
import { Particles, Lights, P, Rng, fit, band, flare, sparkle, clamp, smooth, ease, rng, TAU, WHITE, hex, mix, READY } from "../../core/index.js";
import { VOLT, PLASMA, zigzag, bowed, stroke, crackle, scorch } from "./_lib.js";

export const meta = {
  name: "Storm sigil",
  desc: "A storm rune writes itself under the target, a charged core gathers overhead, then a forked lightning pillar slams down and leaves crawling arcs across the fading seal.",
  tags: ["lightning", "electric", "magic", "rune", "spell", "pillar", "ground", "one-shot"],
  size: [256, 256],
  origin: [44, 210],
  duration: 2.8,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: VOLT, sparks: PLASMA, seed: 11 },
};

const CAST = { ...READY, x: 0, crouch: 2, lean: -2, fx: 16, fy: -29, bx: 7, by: -36, ffx: 10, fbx: -7 };
const RELEASE = { ...CAST, x: 3, crouch: 6, lean: 4, fx: 21, fy: -19, bx: 12, by: -25, ffx: 14, fbx: -10, toeB: true };
export const act = {
  target: { x: 104 },
  poses: [
    [-0.42, READY],
    [-0.18, { ...CAST, crouch: 4, lean: -4 }],
    [0.26, CAST],
    [0.84, { ...CAST, crouch: 3, lean: 0 }],
    [0.9, RELEASE, "snap"],
    [1.35, { ...RELEASE, crouch: 4, lean: 2 }],
    [2.05, { ...CAST, x: 1, crouch: 2, lean: -1 }],
    [2.8, READY],
  ],
  hits: [
    { t: 0.9, stop: 0.12, shake: 0.26, amp: 2, target: false },
    { t: 1.02, push: 1.8, straw: 16, y: -18, skin: "shock", shiver: 0.8 },
    { t: 2.25, push: 0, straw: 0, flash: 0, skin: null },
  ],
};

const TX = 104, TOP = -190, CORE = -68, R0 = 9, R1 = 31, SY = 0.22, CHARGE = 0.78, HIT = 0.9, HOLD = 1.55;
const ASH = hex("#5b5566");
const RUNE = [
  [[-2, -5], [2, -2], [-2, 1], [2, 5]],
  [[-3, -4], [3, -4], [0, 0], [-3, 4], [3, 4]],
  [[-3, -4], [3, 0], [-3, 4], [3, 4]],
  [[-3, -4], [0, 0], [3, -4], [0, 0], [0, 5]],
];

const rune = (p, x, y, k, C, hot = false, a = 1) => {
  const q = RUNE[k % RUNE.length];
  for (let i = 1; i < q.length; i++) {
    const [x0, y0] = q[i - 1], [x1, y1] = q[i];
    p.line(x + x0, y + y0, x + x1, y + y1, hot ? WHITE : k % 2 ? C[5] : C[6], a);
  }
  p.px(x, y - 5, hot ? C[6] : C[4]);
  p.glow(x, y, 6, C[5], 0.2 * a * k);
};

function ring(p, t, C, far) {
  const keep = far ? (g) => Math.sin(g) < 0 : (g) => Math.sin(g) >= 0;
  const u = ease.outCubic(clamp(t / CHARGE)), r = R0 + (R1 - R0) * u;
  const fade = t < HOLD ? 1 : 1 - smooth(HOLD, 2.55, t);
  if (fade <= 0) return;
  const hot = t >= HIT && t < HIT + 0.07;
  band(p, TX, 0, r, SY, Math.max(1.5, 3.5 * (1 - u) + 1), fade * (0.55 + 0.45 * u), C, keep, hot);
  if (t > 0.24) band(p, TX, 0, r * 0.66, SY, 1.2, fade * 0.72, C.slice(2), keep, hot);
  const spin = t * 1.8;
  for (let i = 0; i < 8; i++) {
    const g = spin + (i * TAU) / 8, x = TX + Math.cos(g) * (r + 4), y = Math.sin(g) * (r + 4) * SY;
    if (Math.sin(g) < 0 !== far) continue;
    rune(p, x, y, i, C, hot, fade * (0.5 + 0.5 * u));
  }
  if (t > 0.48) {
    const inner = r * 0.47;
    for (let i = 0; i < 4; i++) {
      const g = -spin * 0.6 + (i * TAU) / 4 + Math.PI / 4, x = TX + Math.cos(g) * inner, y = Math.sin(g) * inner * SY;
      if (Math.sin(g) < 0 !== far) continue;
      p.line(TX + Math.cos(g) * (inner - 5), Math.sin(g) * (inner - 5) * SY, TX + Math.cos(g) * (inner + 5), Math.sin(g) * (inner + 5) * SY, hot ? WHITE : C[4], fade * 0.8);
    }
  }
}

function core(p, t, C, f, seed) {
  const q = clamp(t / CHARGE), pulse = 0.75 + 0.25 * Math.sin(t * 34) + 0.2 * Math.exp(-(((t - HIT) / 0.08) ** 2));
  const fade = t < HIT + 0.25 ? 1 : 1 - smooth(HIT + 0.25, HOLD + 0.35, t);
  if (fade <= 0) return;
  const x = TX, y = CORE, r = 3.5 + 3 * q + 1.2 * Math.max(0, pulse - 0.8);
  if (t < HIT) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 2.2, l = 5 + 9 * q * (i % 2 ? 0.7 : 1);
      p.line(x + Math.cos(a) * (r + 1), y + Math.sin(a) * (r + 1), x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l), i % 2 ? C[5] : C[6], fade);
    }
  }
  p.circle(x, y, r + 2, C[3], fade * 0.9);
  p.circle(x, y, r + 0.8, C[5], fade);
  p.circle(x - 0.7, y - 0.8, r * 0.55, C[6], fade);
  p.circle(x - 0.8, y - 0.9, r * 0.25, WHITE, fade);
  p.glow(x, y, 22 + 12 * q, C[4], 0.32 * fade * (0.7 + 0.3 * q));
  p.glowRing(x, y, r + 4, 4, C[5], 0.22 * fade);
  if (t < HIT) {
    const R = rng(seed, 71, f >> 1);
    for (let i = 0; i < 2 + Math.floor(q * 2); i++) {
      const a = R.range(0, TAU), l = R.range(6, 13), b = bowed(R, x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35, x + Math.cos(a) * l, y + Math.sin(a) * l, R.range(-2, 2), 0.42, 0);
      crackle(p, b, 0.45 + 0.35 * q, C, 0.25, fade);
    }
  }
}

function makeCracks(R) {
  const out = [];
  const grow = (x, y, a, len, depth) => {
    const pts = [[x, y]];
    for (let d = 0; d < len; d += 2) {
      a += R.range(-0.22, 0.22);
      x += Math.cos(a) * 2;
      y += Math.sin(a) * 0.7;
      pts.push([x, y]);
      if (depth < 1 && d > 7 && R.chance(0.16)) grow(x, y, a + R.sign() * R.range(0.5, 1.1), (len - d) * R.range(0.3, 0.55), depth + 1);
    }
    out.push(pts);
  };
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? -1 : 1, a = side * R.range(0.16, 0.72);
    grow(TX + R.range(-2, 2), -1, a, R.range(24, 48), 0);
  }
  return out;
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), floor = () => 0;
  const ps = new Particles({ rng: R, ground: floor, sparks: o.sparks }), hot = new Particles({ rng: R, ground: floor }), lights = new Lights();
  const cracks = makeCracks(R);
  let t = 0, struck = false;
  const bolt = (f, salt = 0) => {
    const r = rng(o.seed, 30 + salt, f);
    return zigzag(r, TX + r.range(-8, 8), TOP, TX + r.range(-2, 2), -1, 0.2, 0.15);
  };
  return {
    update(dt) {
      t += dt;
      if (t < CHARGE - 0.04) {
        if (R.chance(0.7)) {
          const a = R.range(Math.PI * 0.1, Math.PI * 0.9), d = R.range(R0 + 3, R1 + 9), T = R.range(0.12, 0.24), v = (d * 3) / (Math.exp(3 * T) - 1);
          ps.spawn(P.STREAK, TX + Math.cos(a) * d, Math.sin(a) * d * SY - 1, -Math.cos(a) * v, -Math.sin(a) * v * SY, T, R.chance(0.5) ? C[6] : C[5]);
        }
        if (R.chance(0.22)) ps.spawn(P.STAR, TX + R.range(-R1, R1), -R.range(2, 14), R.range(-8, 8), -R.range(8, 24), R.range(0.25, 0.5), R.chance(0.5) ? WHITE : C[6], R.range(0.7, 1.5));
      }
      if (!struck && t >= HIT) {
        struck = true;
        lights.add(TX, CORE, 86, C[4], 0.85, 0.5);
        lights.add(TX, -5, 42, WHITE, 0.8, 0.12);
        for (let i = 0; i < 44; i++) {
          const a = -Math.PI / 2 + R.range(-1.2, 1.2), sp = R.range(100, 280);
          ps.spawn(P.SPARK, TX + R.range(-2, 2), -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.2, 0.65));
        }
        for (let i = 0; i < 14; i++) {
          const a = R.range(0, TAU), sp = R.range(40, 150);
          hot.spawn(P.STAR, TX + R.range(-3, 3), -4, Math.cos(a) * sp, Math.sin(a) * sp - 25, R.range(0.35, 0.8), R.chance(0.5) ? WHITE : C[6], R.range(0.7, 2));
        }
        for (let i = 0; i < 6; i++) ps.spawn(P.SMOKE, TX + R.range(-8, 8), -R.range(1, 5), R.range(-12, 12), -R.range(10, 30), R.range(0.8, 1.4), mix(ASH, C[2], 0.35), R.range(3, 6), R.range(0.05, 0.2));
      }
      if (t > HIT + 0.15 && t < 2.05 && R.chance(0.55)) {
        const path = R.pick(cracks), q = R.pick(path);
        ps.spawn(P.EMBER, q[0], q[1] - 1, R.range(-12, 12), -R.range(14, 38), R.range(0.35, 0.75), C[5]);
      }
      ps.update(dt);
      hot.update(dt);
      lights.update(dt);
    },
    drawBack(p) {
      const fade = 1 - smooth(HOLD + 0.1, 2.55, t);
      if (t >= HIT) {
        scorch(p, TX, 0, 11, Math.pow(clamp(1 - (t - HIT) / 1.35), 1.2), fade);
        const q = clamp((t - HIT) / 0.45);
        for (const path of cracks) {
          const n = Math.max(1, Math.round((path.length - 1) * ease.outCubic(q)));
          for (let i = 0; i < n; i++) {
            const [x0, y0] = path[i], [x1, y1] = path[i + 1], h = clamp(1 - (t - HIT) / 1.2 - i / path.length * 0.35);
            if (h <= 0) continue;
            crackle(p, { paths: [{ pts: [[x0, y0], [x1, y1]], w: 1 }] }, h, C, 0.2, fade);
          }
        }
        if (q < 1) band(p, TX, 0, 7 + 58 * ease.outCubic(q), SY * 0.85, Math.max(1, 4 * (1 - q)), (1 - q) * 1.05, C.slice(2), (g) => Math.sin(g) < 0, q < 0.12);
      }
      ring(p, t, C, true);
      ps.draw(p, "back");
      hot.draw(p, "back");
    },
    draw(p) {
      const f = Math.floor(t * 30 + 1e-4);
      ring(p, t, C, false);
      core(p, t, C, f, o.seed);
      // a thin hand-to-core filament makes the cast read as a spell before the sky bolt arrives
      if (t < HIT) {
        const k = smooth(0.18, 0.62, t), b = bowed(rng(o.seed, 51, f >> 1), 18, -25, TX, CORE, -8, 0.18, 0.25);
        stroke(p, b, 0.2 + 0.65 * k, C, 0.55, { light: 0.35, a: k });
      }
      if (t >= HIT && t < HOLD + 0.35) {
        const age = t - HIT, f2 = Math.floor(age * 30 + 1e-4), k = age < 0.07 ? 1 : age < 0.3 ? 0.75 : Math.max(0, 1 - (age - 0.3) / 1.45);
        const b = bolt(f2, 0);
        stroke(p, b, k, C, age < 0.07 ? 1.2 : 0.86, { hero: age < 0.07, light: 0.55 });
        if (age < 0.24) flare(p, TX, -2, 40 * Math.pow(1 - age / 0.24, 1.4), 1 - age / 0.24, C);
        // two short side forks give the pillar a magical, branching silhouette
        for (let i = 0; i < 2; i++) {
          const r = rng(o.seed, 61 + i, f2), y = TOP * 0.42 + r.range(-18, 12), side = i ? 1 : -1;
          if (k > 0.3) crackle(p, zigzag(r, TX, y, TX + side * r.range(18, 34), y + r.range(18, 42), 0.32, 0.3), k * 0.72, C, 0.3);
        }
        p.glow(TX, -54, 66, C[4], 0.28 * k);
        p.glow(TX, -4, 30, C[6], 0.35 * k);
      }
      if (t >= HIT && t < HIT + 0.32) {
        const q = (t - HIT) / 0.32;
        p.circle(TX, -4, 12 * (1 - q) + 2, WHITE, 1 - q * 0.75);
        p.glow(TX, -4, 30, WHITE, 0.35 * (1 - q));
        sparkle(p, TX, -4, 13 * (1 - q), WHITE, C[5], 0.65 * (1 - q));
      }
      ps.draw(p, "front");
      hot.draw(p, "front");
      lights.draw(p);
    },
  };
}
