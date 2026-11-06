// Sage art: natural energy gathers from the whole frame into a great orb of amber chakra, then it is driven
// into the ground. Gold is the chakra, jade is the natural energy riding on it.
import { Particles, Lights, P, Rng, fit, clamp, smooth, ease, flare, band, TAU, WHITE, READY } from "../../core/index.js";
import { SAGE, JADE, chakraOrb, floorSeal, glintStar } from "../ninjutsu/_lib.js";

const CHARGE = 1.05, THROW = 1.55, HIT = 1.9, END = 4.4;
const ORB = [2, -58], TARGET = 150;

export const meta = {
  name: "Sage orb",
  desc: "Natural energy pours in; a great amber orb of sage chakra swells overhead, then he drives it into the ground: a dome of light, cracked earth and rising green motes.",
  tags: ["chakra", "senjutsu", "sage", "orb", "grand", "technique", "one-shot"],
  size: [382, 238],
  origin: [112, 196],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SAGE, natural: JADE, seed: 33, reach: TARGET },
};

const GATHER = { ...READY, x: -1, crouch: 7, lean: -4, turn: 1, fx: 5, fy: -22, bx: 1, by: -22, ffx: 4, fbx: -3, armsFront: true };
const LIFT = { ...READY, x: -2, crouch: 5, lean: -2, turn: 1, fx: -6, fy: -36, bx: 8, by: -36, ffx: -5, fbx: 7 };
const SLAM = { ...READY, x: 7, crouch: 8, lean: 9, turn: 1, fx: 16, fy: -16, bx: -4, by: -22, ffx: 12, fbx: -8, toeB: true };
export const act = {
  target: { x: TARGET },
  poses: [
    [-0.4, READY],
    [0.12, GATHER],
    [0.62, { ...GATHER, crouch: 9, lean: -6 }],
    [0.95, LIFT],
    [THROW - 0.06, { ...LIFT, crouch: 4, lean: -5, fy: -38 }],
    [THROW, { ...SLAM, crouch: 6, lean: 6 }, "snap"],
    [HIT, { ...SLAM, crouch: 9, lean: 11 }, "snap"],
    [HIT + 0.8, { ...SLAM, crouch: 7, lean: 7 }],
    [HIT + 1.7, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.2, shake: 0.5, amp: 4, push: 3.6, straw: 34, skin: "holy" },
    { t: END - 0.9, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: THROW, x: 6, n: 7, dir: 1 }, { t: HIT, x: TARGET, n: 10, dir: -1 }],
};

const orbAt = (t) => {
  if (t < THROW) return { x: ORB[0], y: ORB[1], r: 18 * smooth(0.45, 1.18, t) + 1.2 * Math.sin(t * 6) };
  const q = ease.inQuad(clamp((t - THROW) / (HIT - THROW)));
  return { x: ORB[0] + (TARGET - ORB[0]) * q, y: ORB[1] + (-8 - ORB[1]) * q * q, r: 18 + 8 * q };
};

export function create(o) {
  const C = fit(o.palette, 8), G = fit(o.natural ?? JADE, 8), R = new Rng(o.seed), floor = () => 0;
  const ps = new Particles({ rng: R, ground: floor, sparks: [WHITE, C[6], C[4]] }), lights = new Lights();
  let t = 0, last = 0, hit = false;
  const target = o.reach ?? TARGET;

  const CRACKS = crackLines(o.seed + 4, 9);

  function impact(x, y) {
    lights.add(x, y - 16, 74, C[6], 1.7, 0.9);
    lights.add(x, y - 2, 62, C[4], 1.2, 1.8);
    for (let i = 0; i < 40; i++) {
      const a = R.range(0, TAU), sp = R.range(50, 190);
      ps.spawn(P.VAPOUR, x + R.range(-10, 10), y - R.range(2, 18), Math.cos(a) * sp, Math.sin(a) * sp * 0.6 - R.range(20, 80), R.range(0.6, 1.5), C[4], R.range(1.6, 3.4));
    }
    for (let i = 0; i < 30; i++) {
      const a = R.range(0, TAU), sp = R.range(20, 90);
      ps.spawn(P.DUST, x + R.range(-18, 18), y - R.range(0, 8), Math.cos(a) * sp, Math.sin(a) * sp * 0.4 - R.range(10, 40), R.range(1.2, 2.1), C[3], R.range(1.5, 3.2), R.range(0, 0.2));
    }
    for (let i = 0; i < 46; i++) {
      const a = R.range(-2.9, 2.9), sp = R.range(60, 210);
      ps.spawn(P.GRIT, x, y - R.range(1, 8), Math.cos(a) * sp, Math.sin(a) * sp - R.range(100, 320), R.range(1.2, 2.2), R.chance(0.3) ? C[5] : C[3], R.range(1, 2.4));
    }
    for (let i = 0; i < 36; i++) {
      const a = R.range(-2.6, 2.6), sp = R.range(60, 220);
      ps.spawn(P.SPARK, x, y - R.range(2, 12), Math.cos(a) * sp, Math.sin(a) * sp - R.range(10, 90), R.range(0.3, 0.9), R.chance(0.4) ? WHITE : i % 3 ? C[6] : G[6], R.range(0.7, 1.5));
    }
    for (let i = 0; i < 24; i++) {
      const a = R.range(0, TAU), sp = R.range(10, 60);
      ps.spawn(P.EMBER, x + R.range(-16, 16), y - R.range(2, 10), Math.cos(a) * sp, -R.range(20, 90), R.range(1.2, 2.4), i % 2 ? G[6] : G[5], R.range(0.6, 1.3));
    }
    for (let i = 0; i < 14; i++) {
      const a = R.range(-2.4, 2.4), sp = R.range(30, 140);
      ps.spawn(P.BRAND, x, y - 2, Math.cos(a) * sp, Math.sin(a) * sp - R.range(40, 160), R.range(1.0, 2.0), C[5], R.range(1, 2));
    }
  }

  return {
    update(dt) {
      t += dt;
      const prev = last;
      last = t;
      if (t < THROW) {
        const { x, y, r } = orbAt(t);
        // natural energy: motes drawn in from off-frame, gold and jade
        if (t > 0.2) {
          const want = t < 1.2 ? 2 : 0;
          for (let i = 0; i < want; i++) {
            const a = R.range(0, TAU), d = R.range(46, 96);
            const x0 = x + Math.cos(a) * d, y0 = y + Math.sin(a) * d * 0.85;
            if (y0 > 6) continue;
            const sp = d * 1.6;
            ps.spawn(P.MOTE, x0, y0, -Math.cos(a) * sp, -Math.sin(a) * sp * 0.85, R.range(0.3, 0.52), R.chance(0.35) ? G[6] : R.chance(0.5) ? C[6] : C[5], R.range(0.7, 1.4));
          }
        }
        if (t > 0.9 && R.chance(0.5)) {
          const a = R.range(0, TAU), rr = r + R.range(2, 8);
          ps.spawn(P.MOTE, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9, Math.cos(a) * 30, Math.sin(a) * 30 - 20, R.range(0.25, 0.5), G[5], R.range(0.5, 1), 0, 0);
        }
        lights.add(x, y, 40 + r * 2.4, C[4], 0.5, 0.1);
      } else if (t < HIT) {
        const { x, y, r } = orbAt(t);
        for (let i = 0; i < 2; i++) ps.spawn(P.MOTE, x - r * R.range(0.3, 0.9), y + R.range(-r, r) * 0.6, -R.range(40, 120), R.range(-30, 20), R.range(0.2, 0.4), R.chance(0.5) ? G[6] : C[6], R.range(0.7, 1.3));
        lights.add(x, y, 70, C[5], 0.7, 0.1);
      } else if (!hit) {
        hit = true;
        impact(target, -10);
      } else if (t - prev > 0.1 && t < END - 1.6) {
        // green motes keep rising out of the broken ground
        ps.spawn(P.EMBER, target + R.range(-34, 34), -R.range(1, 8), R.range(-8, 8), -R.range(12, 40), R.range(0.8, 1.4), R.chance(0.4) ? G[5] : C[4], R.range(0.5, 1));
      }
      ps.update(dt);
      lights.update(dt);
    },
    draw(p) {
      const T = t;
      const seal = smooth(0.1, CHARGE, T) * (1 - smooth(HIT, HIT + 0.8, T));
      if (seal > 0) {
        floorSeal(p, C, 0, 0, 34, 0.2, T / 2.4, seal * 0.9);
        floorSeal(p, G, 0, 0, 24, 0.2, -T / 3, seal * 0.5);
      }
      // streaks of natural energy in the air during the gather
      if (T < THROW) {
        const { x, y, r } = orbAt(T);
        // golden shoulder rings and a jade counter-ring
        for (let i = 0; i < 2; i++) {
          const g = T * (i ? -2.2 : 3.4) + i * 1.7;
          for (let k = 0; k < 26; k++) {
            if ((k + Math.floor(T * 20)) % 4 === 0) continue;
            const a = g + (k / 26) * TAU;
            p.dot(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5) * (0.55 + i * 0.25), i ? G[5] : C[5], 0.55);
          }
        }
        chakraOrb(p, C, x, y, r, T / 1.3, { arms: 4, turns: 2, tilt: 0.42 });
        // jade flecks orbiting the gold
        for (let i = 0; i < 10; i++) {
          const a = T * (2.4 + i * 0.17) + i * 2.4, rr = r + 7 + 9 * (0.5 + 0.5 * Math.sin(T * 3 + i));
          p.dot(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8, i % 2 ? G[6] : G[5], 0.8);
        }
        if (T > 1.25) glintStar(p, x + r * 0.3, y - r * 0.5, 4 + 3 * Math.sin(T * 12) ** 2, T, C, 0.55);
        p.glow(x, y, r * 3, C[4], 0.34);
      }
      if (T >= HIT) {
        const q = T - HIT;
        if (q < 0.2) {
          const k = 1 - q / 0.2;
          p.circle(target, -14, 12 + 30 * ease.outQuad(q / 0.2), WHITE, q < 0.08 ? 1 : 0.9 * k);
          flare(p, target, -14, 40 + 60 * k, 1, C);
          p.glow(target, -14, 74, C[6], 0.55 * k);
          p.glow(target, -14, 50, G[6], 0.3 * k);
          // A short, hard release crown keeps the slam readable at 1x.
          for (let i = 0; i < 14; i++) {
            const a = (i / 14) * TAU + 0.12;
            const len = 22 + (i % 2 ? 28 : 44) * ease.outQuad(q / 0.2);
            p.line(target + Math.cos(a) * 7, -14 + Math.sin(a) * 5,
              target + Math.cos(a) * len, -14 + Math.sin(a) * len * 0.72,
              i % 3 ? C[6] : G[6], k * (i % 2 ? 0.68 : 0.9));
          }
        }
        // the dome: three gold rings and a jade one, then a slower dust ring
        for (let i = 0; i < 4; i++) {
          const rr = 18 + q * (70 + i * 22);
          const a = clamp(1 - rr / (96 + i * 4), 0, 1) * 0.5 * (1 - smooth(1.2, 2.2, q));
          if (a > 0.004) band(p, target, -2, rr, 0.3, i === 3 ? 1 : 2, a, i === 3 ? G : C, undefined, q < 0.18);
        }
        if (q < 2.4) {
          const ca = 0.6 * (1 - smooth(1.7, 2.4, q));
          p.disc(target, -1, 24 + 5 * Math.min(1, q), C[1], ca);
          p.disc(target, -2, 11 + 2 * q, C[0], ca * 0.8);
        }
        if (q > 0.15 && q < 2.4) {
          const rr = 30 + q * 16;
          band(p, target, 0, rr, 0.16, 1.4, 0.35 * (1 - smooth(0.4, 2.2, q)), C);
        }
        // Jade motes erupt upward after the gold shock ring, giving the impact a second beat.
        if (q < 1.35) {
          const f = 1 - smooth(0.2, 1.35, q);
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU + 0.4;
            const rr = 12 + q * 34 + (i % 3) * 4;
            const x = target + Math.cos(a) * rr;
            const y = -2 - Math.abs(Math.sin(a)) * rr * 0.38 - q * (12 + (i % 4) * 6);
            if (y < -1) p.dot(x, y, i % 2 ? G[5] : G[6], 0.58 * f);
          }
        }
        // cracked, cooling ground
        if (q < 2.4) {
          const f = 1 - smooth(0.2, 2.4, q), hot = q < 0.35 ? WHITE : q < 0.9 ? C[6] : q < 1.6 ? C[4] : G[4];
          for (const pts of CRACKS)
            for (let i = 0; i < pts.length - 1; i++) p.line(target + pts[i][0], pts[i][1], target + pts[i + 1][0], pts[i + 1][1], hot, f * 0.85);
          p.glow(target, -1, 56, C[4], 0.34 * f);
        }
      }
      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}

// jagged cracks radiating from a point, built once so they do not crawl between frames
function crackLines(seed, n) {
  const Q = new Rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const a0 = Q.range(0, TAU), len = Q.range(14, 54);
    let px = 0, py = 0, a = a0;
    const pts = [[0, 0]];
    for (let d = 0; d < len; d += 3) {
      a += Q.range(-0.25, 0.25);
      px += Math.cos(a) * 3;
      py += Math.sin(a) * 1.1;
      pts.push([px, py]);
    }
    out.push(pts);
  }
  return out;
}
