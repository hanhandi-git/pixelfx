// Ki volley: a rapid barrage of small blasts thrown from one palm. Each shot has its own muzzle flash, a
// short comet of gold ki and a pop where it lands, so the effect is a rhythm rather than a wall of light.
import { Lights, P, Particles, Rng, clamp, ease, fit, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { GOLD, floorLight, hotStar } from "./_lib.js";

const D = 2.7, START = 0.28, GAP = 0.11, N = 7, END = 2.7;
const PALM = [14, -24], FIRST = 60;

export const meta = {
  name: "Ki volley",
  desc: "Seven small ki blasts leave one palm in a fast rhythm: a muzzle flash on each throw, a short gold comet with a white head, and a pop with dust where each one lands.",
  tags: ["ki", "dragonball", "volley", "barrage", "blasts", "hand", "technique", "one-shot"],
  size: [320, 150],
  origin: [52, 132],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: GOLD, seed: 17, reach: 264 },
};

const AIM = { ...READY, x: 0, crouch: 4, lean: 3, turn: 1, fx: 15, fy: -24, bx: 8, by: -22, ffx: 8, fbx: -8 };
const KICK = { ...AIM, x: -1, crouch: 5, lean: 1, fx: 13, fy: -23 };
export const act = {
  poses: [
    [-0.4, READY],
    [0.06, AIM],
    [START, KICK, "snap"],
    [0.42, AIM],
    [0.62, KICK, "snap"],
    [0.9, AIM],
    [1.1, KICK, "snap"],
    [1.5, AIM],
    [2.0, { ...AIM, crouch: 5, lean: 2 }],
    [D, READY],
  ],
  hits: [{ t: 1.02, push: 1.2, straw: 12, flash: 0.03, y: -24 }, { t: D - 0.5, push: 0, straw: 0, flash: 0, skin: null }],
  dust: [{ t: START, x: 10, n: 4, dir: 1 }],
};

// each shot: when it leaves, where it lands, how big
function shots(seed, reach) {
  const Q = rng(seed, 5, 41), out = [];
  for (let i = 0; i < N; i++) {
    const tx = FIRST + ((reach - FIRST) * (i + 0.4)) / N + Q.range(-8, 8);
    out.push({ t: START + i * GAP, tx, ty: -12 - Q.range(0, 26), r: 3.4 + Q.range(0, 1.5), seed: Q.range(0, 1000) });
  }
  return out;
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const reach = o.reach ?? 264;
  const S = shots(o.seed, reach);
  let t = 0, popped = new Set(), flashed = new Set();

  const pop = (s) => {
    lights.add(s.tx, s.ty, 30, C[6], 1.1, 0.35);
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + R.range(-0.9, 0.9), sp = R.range(40, 170);
      ps.spawn(P.SPARK, s.tx, s.ty, Math.cos(a) * sp, Math.sin(a) * sp - R.range(0, 30), R.range(0.2, 0.5), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1.1));
    }
    ps.spawn(P.VAPOUR, s.tx, s.ty, -R.range(10, 30), -R.range(4, 20), R.range(0.5, 0.9), C[4], R.range(1.6, 2.8));
  };

  return {
    update(dt) {
      t += dt;
      S.forEach((s, i) => {
        if (!flashed.has(i) && t >= s.t) {
          flashed.add(i);
          lights.add(PALM[0], PALM[1], 34, C[5], 1, 0.22);
          for (let k = 0; k < 5; k++) {
            const a = R.range(-0.9, 0.9), sp = R.range(30, 120);
            ps.spawn(P.SPARK, PALM[0] + 2, PALM[1], Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.12, 0.3), C[6], R.range(0.5, 1));
          }
        }
        if (!popped.has(i) && t >= s.t + 0.24) {
          popped.add(i);
          pop(s);
        }
      });
      // the palm keeps glowing between shots
      lights.add(PALM[0], PALM[1], 18, C[4], 0.3, 0.1);
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      floorLight(p, 6, C, 0.6, 20);

      // the palm: a small held glare that pulses with each shot, and goes out when the barrage does
      const near = S.reduce((a, s) => (T >= s.t && T - s.t < 0.16 ? Math.max(a, 1 - (T - s.t) / 0.16) : a), 0);
      const live = 1 - smooth(START + N * GAP + 0.1, START + N * GAP + 0.45, T);
      if (live > 0.02) {
        p.circle(PALM[0], PALM[1], 2.6 + 1.6 * near, C[6], 0.9 * live);
        p.circle(PALM[0], PALM[1], 1.5 + near, WHITE, live);
      }
      if (near > 0.02) {
        for (let i = 0; i < 4; i++) {
          const a = -0.6 + i * 0.4 + T * 8, l = 5 + 4 * near;
          p.line(PALM[0], PALM[1], PALM[0] + Math.cos(a) * l, PALM[1] + Math.sin(a) * l, WHITE, near);
        }
        p.glow(PALM[0], PALM[1], 26, C[5], 0.5 * near);
      }

      for (const s of S) {
        const q = (T - s.t) / 0.24;
        if (q < 0 || q > 1) continue;
        const e = ease.outQuad(q);
        const x = PALM[0] + (s.tx - PALM[0]) * e;
        const y = PALM[1] + (s.ty - PALM[1]) * e - Math.sin(q * Math.PI) * 6;
        const r = s.r * (1 - q * 0.35);
        // the comet: a short tail, a white head, a corona
        for (let d = 1; d <= 9; d++) {
          const u = d / 9, yy = y + Math.sin(d * 0.9 + s.seed) * 0.6;
          const c = u < 0.3 ? WHITE : u < 0.6 ? C[6] : C[5];
          p.dot(x - d * 1.5, yy, c, (1 - u) * 0.9);
        }
        p.circle(x, y, r + 1.4, C[5], 0.9);
        p.circle(x, y, r, C[6]);
        p.circle(x - r * 0.15, y - r * 0.2, r * 0.55, WHITE);
        p.glow(x, y, 18, C[5], 0.4);
        p.glow(x - 6, y, 10, C[4], 0.2);
        // the pop
        if (q > 0.62) {
          const k = (q - 0.62) / 0.38, rr = 3 + 11 * ease.outQuad(k);
          p.ring(s.tx, s.ty, rr, 1.5, k < 0.4 ? WHITE : C[6], 0.7 * (1 - k));
          for (let i = 0; i < 6; i++) {
            const a = Math.PI + (i / 6) * TAU, d = rr * 1.1;
            p.dot(s.tx + Math.cos(a) * d, s.ty + Math.sin(a) * d, C[5], (1 - k) * 0.8);
          }
        }
      }

      // the wall behind: a few scorch pocks where earlier shots landed
      for (const s of S) {
        const age = T - s.t - 0.24;
        if (age < 0) continue;
        const f = clamp(1 - age / 1.35);
        if (f <= 0) continue;
        p.disc(s.tx, s.ty, 3.6, C[2], 0.3 * f);
        p.glow(s.tx, s.ty, 8, C[4], 0.2 * f);
      }

      // stray glints in the air, one every few frames
      for (let i = 0; i < 3; i++) {
        const s = S[(i * 3) % N];
        const age = T - s.t - 0.24;
        if (age > 0 && age < 0.5) hotStar(p, s.tx + 4, s.ty - 4, 3.2 * (1 - age / 0.5), T * 4 + i, C, (1 - age / 0.5) * 0.8);
      }

      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
