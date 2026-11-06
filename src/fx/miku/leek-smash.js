// A giant leek falls out of the sky and plants itself in the floor for the miku set: green shock ring,
// leaves and vegetable bits, dust and a wobbling stem.
import { Particles, Bits, Lights, P, B, Rng, fit, hex, sparkle, flare, clamp, smooth, ease, rand, TAU, WHITE } from "../../core/index.js";
import { MIKU, LEEK, BULB, note, soundRing, leek } from "./_lib.js";

export const meta = {
  name: "Leek smash",
  desc: "A giant leek drops from the sky, plants its white bulb in the floor and kicks up a green shock ring, leaf confetti, vegetable bits and a puff of dust.",
  tags: ["miku", "leek", "green", "smash", "impact", "comedy", "one-shot"],
  size: [224, 168],
  origin: [110, 132],
  duration: 1.7,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: MIKU, seed: 7, leek: LEEK },
};

const HIT = 0.3, TX = 48, TOP = -84;
const BASE = { x: TX - 19, y: -23.2, ang: -2.35 };

export function create(o) {
  const C = fit(o.palette, 8), G = (o.leek ?? LEEK).map(hex), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], G[6], G[5]], haze: C[4] });
  const bits = new Bits({ ground: () => 0 });
  const lights = new Lights();
  // leaves kicked out at the impact
  const leaves = Array.from({ length: 14 }, (_, i) => {
    const a = -Math.PI + R.range(0.15, Math.PI - 0.15), sp = R.range(38, 68);
    return { a, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - R.range(30, 90), spin: R.range(-8, 8), life: R.range(0.7, 1.25), s: R.range(1.6, 2.8), c: R.pick([G[5], G[4], G[6]]) };
  });
  let t = 0, hit = false;

  return {
    update(dt) {
      t += dt;
      if (t >= HIT && !hit) {
        hit = true;
        lights.add(TX, 0, 46, G[5], 0.8, 0.45);
        lights.add(TX, 0, 32, C[6], 0.7, 0.15);
        for (let i = 0; i < 26; i++) {
          const a = R.range(-Math.PI, 0), sp = R.range(55, 135);
          ps.spawn(P.SPARK, TX, -2, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.2, 0.38), R.pick([G[6], G[5], C[6], WHITE]), 1);
        }
        for (let i = 0; i < 12; i++) {
          const a = R.range(-Math.PI, 0), sp = R.range(10, 80);
          ps.spawn(P.DUST, TX + R.range(-6, 6), -R.range(0, 3), Math.cos(a) * sp, -R.range(3, 18), R.range(0.5, 0.9), R.pick([G[2], G[3], "#8a9a62"]), R.range(2, 4.5));
        }
        for (let i = 0; i < 10; i++) {
          const a = R.range(-Math.PI, 0), sp = R.range(50, 104);
          bits.add({ kind: B.CHUNK, x: TX + R.range(-4, 4), y: -R.range(1, 4), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1, drag: 0.4, bounce: 0.3, life: R.range(0.55, 0.85), a: R.range(0, TAU), va: R.range(-14, 14), s: R.range(1, 2.2), ramp: G });
        }
        for (let i = 0; i < 6; i++) {
          const a = R.range(-Math.PI - 0.3, 0.3), sp = R.range(30, 90);
          ps.spawn(P.FLAKE, TX, -2, Math.cos(a) * sp, Math.sin(a) * sp - 20, R.range(0.7, 1.2), R.chance(0.6) ? G[6] : C[6], R.range(0.6, 1.2));
        }
      }
      // the leek drags a little wind and dust as it falls
      if (t > 0.02 && t < HIT && R.chance(0.5)) {
        ps.spawn(P.MOTE, BASE.x + R.range(-10, 10), -R.range(20, 100), R.range(-6, 6), -R.range(20, 60), R.range(0.2, 0.4), R.chance(0.5) ? C[5] : G[5], R.range(0.5, 1));
      }
      ps.update(dt);
      bits.update(dt);
      lights.update(dt);
    },

    drawBack(p) {
      const out = smooth(1.3, 1.65, t);
      if (out >= 1) return;
      const a = 1 - out;
      // floor shadow under the leek, growing as it falls
      const fall = clamp((t - 0.02) / (HIT - 0.02));
      const lift = 1 - fall;
      p.disc(TX - 10, 0.5, 9 + 8 * fall, G[1], 0.22 * a);
      // cracks in the floor after the hit
      if (t > HIT) {
        const k = smooth(HIT, HIT + 0.18, t) * a;
        for (let i = 0; i < 7; i++) {
          const ang = -0.2 - (i / 6) * Math.PI * 0.9 + rand(i, 3) * 0.2, len = 8 + rand(i, 4) * 16;
          let x = TX, y = 0;
          for (let d = 0; d < len; d += 1) {
            const w = Math.sin(d * 1.2 + i) * 0.8;
            x += Math.cos(ang + w * 0.2); y += Math.sin(ang + w * 0.2) * 0.34;
            p.dot(x, y, d < 3 ? WHITE : d < len * 0.5 ? G[5] : G[3], k * (1 - d / len));
          }
        }
        p.glow(TX, -2, 40, G[4], 0.24 * a * (1 - smooth(HIT, HIT + 0.6, t)));
      }
    },

    draw(p) {
      const out = smooth(1.3, 1.65, t);
      if (out >= 1) return;
      const a = 1 - out;
      // the leek's path: it drops in fast, plants, then bounces and wobbles
      let cx, cy, ang, lk;
      if (t < HIT) {
        const u = ease.inQuad(clamp((t - 0.02) / (HIT - 0.02)));
        cx = 46 + (BASE.x - 46) * u;
        cy = TOP + (BASE.y - TOP) * u;
        ang = -1.75 - 0.6 * u;
        lk = smooth(0.02, 0.16, t) * a;
      } else {
        const age = t - HIT, bounce = Math.sin(Math.min(1, age / 0.28) * Math.PI) * 5, wob = Math.sin(age * 26) * 0.05 * Math.exp(-age * 4);
        cx = BASE.x + Math.sin(age * 17) * 0.8;
        cy = BASE.y - bounce;
        ang = BASE.ang + wob;
        lk = a * (1 - smooth(0.9, 1.3, age));
      }
      if (lk > 0.02) {
        // the swing smear above the leek as it comes down
        if (t < HIT + 0.06 && t > 0.08) {
          const k = smooth(0.08, 0.2, t) * (1 - smooth(HIT, HIT + 0.06, t));
          for (let i = 1; i <= 3; i++) {
            leek(p, cx + i * 2, cy - i * 3, ang - i * 0.05, { len: 76, w: 3.6, C: G, B: BULB, a: k * (0.18 - i * 0.04) });
          }
        }
        p.glow(cx, cy, 34, G[4], 0.18 * lk);
        leek(p, cx, cy, ang, { len: 76, w: 4.2, C: G, B: BULB, a: lk });
        // the bulb's hot glint on the way down
        if (t < HIT) sparkle(p, cx + Math.cos(ang) * 34, cy + Math.sin(ang) * 34, 2, WHITE, G[6], 0.3);
      }
      // impact: white star, green shock ring, rolling dust
      if (t >= HIT && t < HIT + 0.05) {
        const k = 1 - (t - HIT) / 0.05;
        p.circle(TX, -1, 3 + 4 * k, WHITE);
        sparkle(p, TX, -1, 8 + 16 * k, WHITE, G[6], 0.5 * k);
        flare(p, TX, -1, 26 * k, k, G);
        p.glow(TX, -1, 44, WHITE, 0.5 * k);
      }
      const age = t - HIT;
      if (age >= 0 && age < 0.5) {
        const u = age / 0.5, r = 8 + 48 * ease.outQuart(u), w = 1 - u;
        soundRing(p, TX, 0, r, r * 0.26, { C: G, amp: 3, lobes: 9, phase: u * 2.4, th: 2.6, a: w, rim: G[7], glow: false });
        for (const s of [-1, 1]) p.glow(TX + s * r, -2, 20, G[4], 0.3 * w);
        // clumps of leaves kicking up out of the ring
        for (let i = 0; i < 8; i++) {
          const g = (i / 8) * TAU + 0.2, x = TX + Math.cos(g) * r, y = Math.sin(g) * r * 0.26;
          p.dot(x, y - 2, G[5], w * 0.8);
          p.dot(x + 1, y - 2, G[3], w * 0.5);
        }
      }
      // leaf confetti tumbling out
      for (const f of leaves) {
        if (age < 0 || age > f.life) continue;
        const u = age / f.life, drag = 1 - 0.5 * u;
        const x = TX + f.vx * age * drag;
        const y = Math.min(-1.5, -2 + f.vy * age * drag + 260 * age * age * (0.5 + u) + Math.sin(age * 8 + f.spin) * 4);
        const fl = Math.abs(Math.sin(age * f.spin * 0.7)) * 0.7 + 0.3, s = f.s;
        const ca = Math.cos(f.spin * age), sa = Math.sin(f.spin * age * 0.8);
        for (let d = -s; d <= s; d += 0.6) {
          const px = x + ca * d, py = y + sa * d * fl;
          p.dot(px, py, Math.abs(d) > s - 0.8 ? G[2] : d < 0 ? f.c : G[3], a * (1 - smooth(f.life * 0.7, f.life, age)));
        }
      }
      // a couple of notes drift up off the impact: the leek is a performance
      if (age > 0.05) {
        for (let i = 0; i < 3; i++) {
          const t0 = 0.06 + i * 0.12, u = (age - t0) / 0.8;
          if (u < 0 || u > 1) continue;
          const x = TX - 6 + Math.sin(u * 4 + i) * 7, y = -8 - u * 44;
          note(p, x, y, { kind: i % 2 ? "tiny" : "eighth", s: i % 2 ? 1 : 2, C, flip: i % 2 === 0, a: Math.sin(u * Math.PI), outline: C[0], glint: true });
        }
      }
      bits.draw(p);
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}
