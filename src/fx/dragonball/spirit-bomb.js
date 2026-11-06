// Spirit bomb: light is pulled up out of the ground and the air from the whole field, packs into a cold
// blue-green sphere overhead, and is hurled down onto the target. The sphere is the subject; the gather, the
// throw and the dust column sell its weight.
import { Lights, P, Particles, Rng, clamp, ease, fit, fract, loopNoise, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { SPIRIT, kiOrb, inwardStreaks, floorLight, hotStar, crackFan, drawCracks, kiImpact, orbitMotes } from "./_lib.js";

const D = 5.6, LIFT = 1.95, THROW = 2.45, HIT = 2.95, END = 5.6;
const ORB = [14, -70], TX = 198;

export const meta = {
  name: "Spirit bomb",
  desc: "Light rises out of the whole field, packs itself into a cold blue-green sphere overhead, and is hurled down: a dome of light, a broken floor and a column of dust that keeps rising.",
  tags: ["ki", "dragonball", "spirit", "orb", "gather", "grand", "technique", "one-shot"],
  size: [386, 236],
  origin: [96, 212],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: SPIRIT, seed: 55, reach: TX },
};

const REACH = { ...READY, x: -1, crouch: 3, lean: -3, turn: 1, fx: 3, fy: -38, bx: -7, by: -33, ffx: 6, fbx: -7 };
const LIFTP = { ...READY, x: -2, crouch: 4, lean: -6, turn: 1, fx: 2, fy: -35, bx: -7, by: -34, ffx: 6, fbx: -7 };
const HURL = { ...READY, x: 4, crouch: 7, lean: 10, turn: 1, fx: 15, fy: -24, bx: 4, by: -30, ffx: 11, fbx: -9, toeB: true };
export const act = {
  target: { x: TX },
  poses: [
    [-0.5, READY],
    [0.15, REACH],
    [0.9, LIFTP],
    [THROW - 0.1, { ...LIFTP, crouch: 5, lean: -7, fx: 2, fy: -35, bx: -6, by: -33 }],
    [THROW, HURL, "snap"],
    [HIT, { ...HURL, crouch: 9, lean: 12 }, "snap"],
    [4.0, { ...HURL, crouch: 8, lean: 7 }],
    [4.6, { ...READY, x: 2 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.22, shake: 0.6, amp: 5, push: 4, straw: 40, skin: "holy" },
    { t: END - 0.9, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: THROW, x: 6, n: 7, dir: 1 }, { t: HIT, x: TX, n: 12, dir: -1 }],
};

const ballAt = (t) => {
  if (t < THROW) return { x: ORB[0], y: ORB[1], r: 5 + 23 * smooth(0.35, LIFT + 0.3, t) + 0.8 * Math.sin(t * 5) };
  const q = clamp((t - THROW) / (HIT - THROW));
  const e = ease.inQuad(q);
  return { x: ORB[0] + (TX - ORB[0]) * e, y: ORB[1] + (-26 - ORB[1]) * e * e, r: 28 - 4 * e };
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const target = o.reach ?? TX;
  const cracks = crackFan(o.seed + 7, 11, 62);
  // the filaments that feed the bomb: fixed launch points, speeds and arrival angles
  const FIL = Array.from({ length: 54 }, (_, i) => {
    const Q = rng(o.seed, 21, i);
    return {
      sx: Q.range(-94, 208), sy: -Q.range(0, 5),
      a: Q.range(0, TAU), sp: Q.range(0.42, 0.85), off: Q.next(),
      bend: Q.range(-9, 9), len: Q.chance(0.55) ? 1 : 0,
    };
  });
  let t = 0, hit = false;

  return {
    update(dt) {
      t += dt;
      if (t < THROW) {
        const { x, y, r } = ballAt(t);
        // a few flecks tearing off the surface as it packs tighter
        if (R.chance(0.5)) {
          const a = R.range(0, TAU), rr = r + R.range(2, 8);
          ps.spawn(P.MOTE, x + Math.cos(a) * rr, y + Math.sin(a) * rr, Math.cos(a) * 22, Math.sin(a) * 22 - 16, R.range(0.25, 0.5), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1));
        }
        if (R.chance(0.25))
          ps.spawn(P.EMBER, R.range(-90, 200), -R.range(1, 6), R.range(-5, 5), -R.range(30, 70), R.range(0.5, 0.9), C[5], R.range(0.4, 0.8));
        lights.add(x, y, 44 + r * 2.2, C[4], 0.55, 0.12);
      } else if (!hit && t < HIT) {
        const { x, y, r } = ballAt(t);
        for (let i = 0; i < 2; i++)
          ps.spawn(P.MOTE, x - r * R.range(0.2, 0.9), y + R.range(-r, r) * 0.7, -R.range(50, 140), R.range(-40, 30), R.range(0.2, 0.45), R.chance(0.5) ? C[6] : WHITE, R.range(0.5, 1.1));
        lights.add(x, y, 52, C[5], 1.1, 0.1);
      } else if (!hit) {
        hit = true;
        lights.add(target, -30, 46, WHITE, 2.8, 0.9);
        lights.add(target, -4, 24, C[4], 2.2, 2.2);
        for (let i = 0; i < 60; i++) {
          const a = Math.PI + R.range(-1.4, 1.4), sp = R.range(90, 320);
          ps.spawn(P.SPARK, target, -30 + R.range(-10, 10), Math.cos(a) * sp, Math.sin(a) * sp - R.range(20, 120), R.range(0.35, 1), R.chance(0.4) ? WHITE : i % 3 ? C[6] : C[5], R.range(0.7, 1.6));
        }
        for (let i = 0; i < 40; i++) {
          const a = R.range(0, TAU), sp = R.range(60, 220);
          ps.spawn(P.VAPOUR, target + R.range(-14, 14), -26 + R.range(-12, 10), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.6) - R.range(10, 60), R.range(0.8, 1.7), C[4], R.range(2, 4));
        }
        for (let i = 0; i < 34; i++) {
          const a = R.range(0, TAU), sp = R.range(30, 150);
          ps.spawn(P.DUST, target + R.range(-30, 20), -R.range(2, 12), Math.cos(a) * sp * (Math.cos(a) > 0 ? 0.45 : 0.9), -Math.abs(Math.sin(a) * sp * 0.45) - R.range(20, 90), R.range(1.3, 2.2), C[3], R.range(1.6, 3.2));
        }
        for (let i = 0; i < 40; i++) {
          const a = Math.PI + R.range(-1.3, 1.3), sp = R.range(60, 240);
          ps.spawn(P.GRIT, target + R.range(-6, 6), -R.range(2, 10), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp) - R.range(80, 320), R.range(1.2, 2.2), R.chance(0.3) ? C[6] : C[3], R.range(1, 2.4));
        }
        for (let i = 0; i < 16; i++)
          ps.spawn(P.SMOKE, target + R.range(-20, 20), -R.range(8, 30), R.range(-20, 20), -R.range(10, 50), R.range(1.6, 2.4), 0, R.range(1.4, 2.6), R.range(0, 0.2), 2);
        for (let i = 0; i < 26; i++) {
          const a = R.range(0, TAU), sp = R.range(10, 70);
          ps.spawn(P.EMBER, target + R.range(-34, 34), -R.range(2, 14), Math.cos(a) * sp, -R.range(30, 110), R.range(1.2, 2.2), i % 2 ? C[6] : C[5], R.range(0.5, 1.1));
        }
      } else if (t < HIT + 1.5 && R.chance(0.3)) {
        ps.spawn(P.EMBER, target + R.range(-50, 50), -R.range(1, 8), R.range(-10, 10), -R.range(16, 54), R.range(0.7, 1.1), R.chance(0.4) ? C[6] : C[5], R.range(0.4, 0.9));
      }
      if (t > HIT && t < HIT + 0.9 && R.chance(0.4))
        ps.spawn(P.DUST, target + R.range(-40, 40), -R.range(0, 5), R.range(-20, 20), -R.range(6, 26), R.range(1, 1.7), C[3], R.range(1.4, 2.6));
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      floorLight(p, -4, C, 0.9, 26);
      p.glow(target, 0, 40, C[4], T > HIT ? 0.2 : 0);

      if (T < THROW) {
        const { x, y, r } = ballAt(T);
        const ph = T / 1.6;
        // the field answers in filaments: light pulled off the ground, accelerating into the ball and gone
        for (const f of FIL) {
          const u = fract(T * f.sp + f.off);
          const e = u * u * (3 - 2 * u);
          const ex = x + Math.cos(f.a) * r * 0.92, ey = y + Math.sin(f.a) * r * 0.72;
          const px = f.sx + (ex - f.sx) * e, py = f.sy + (ey - f.sy) * e + Math.sin(u * Math.PI) * f.bend;
          const fade = smooth(0.04, 0.16, u) * (1 - smooth(0.72, 0.94, u));
          if (fade <= 0.02) continue;
          p.dot(px, py, u > 0.62 ? WHITE : u > 0.3 ? C[6] : C[5], fade * 0.95);
          if (f.len > 0.5) {
            const u2 = Math.max(0, u - 0.02);
            const e2 = u2 * u2 * (3 - 2 * u2);
            p.line(f.sx + (ex - f.sx) * e2, f.sy + (ey - f.sy) * e2 + Math.sin(u2 * Math.PI) * f.bend, px, py, C[5], fade * 0.45);
          }
        }
        // standing light near the ground where it is being taken from
        for (let i = 0; i < 9; i++) {
          const Q = rng(o.seed, 12, i), bx = Q.range(-88, 200);
          const a = 0.3 + 0.4 * loopNoise(T * 0.8, 2, i + 7);
          const hgt = 8 + 16 * loopNoise(T * 1.1, 3, i + 31);
          p.line(bx, -1, bx + Math.sin(T * 2 + i) * 2, -1 - hgt, (u) => (u < 0.5 ? C[4] : C[6]), (u) => (1 - u) * a * 0.7);
        }
        inwardStreaks(p, C, x, y, r, T, 2.4, o.seed * 3 + 3, 22, r * 1.5 + 18, -1);
        kiOrb(p, C, x, y, r, ph, { arms: 5, turns: 1.7, tilt: 0.42, seed: o.seed });
        orbitMotes(p, C, x, y, r, ph, o.seed * 5 + 1, 14);
        // a slow ring of gathered light standing off the sphere
        if (T > 1.0) {
          const a = 0.3 * smooth(1.0, 1.8, T);
          for (let i = 0; i < 26; i++) {
            const g = (i / 26) * TAU + T * 0.6;
            p.dot(x + Math.cos(g) * (r + 7), y + Math.sin(g) * (r + 7) * 0.92, i % 3 ? C[5] : WHITE, a);
          }
        }
        p.glow(x, y, r * 3.2, C[4], 0.32);
      } else {
        const { x, y, r } = ballAt(T);
        if (T < HIT) {
          kiOrb(p, C, x, y, r, T / 0.5, { arms: 5, turns: 1.2, tilt: 0.4, seed: o.seed });
          // a tail of shed light dragging behind it on the way down
          for (let i = 1; i < 7; i++) {
            const b = ballAt(T - i * 0.03);
            p.circle(b.x, b.y, b.r * (1 - i * 0.1), C[4], 0.28 * (1 - i / 7));
          }
          p.glow(x, y, r * 3, C[5], 0.55);
        }
        if (T >= HIT) {
          const q = T - HIT;
          kiImpact(p, C, target, -30, q, { seed: o.seed + 1, ground: 0, n: 34, life: 0.9 });
          if (q < 2.2) {
            const f = 1 - smooth(0.25, 2.2, q);
            drawCracks(p, cracks, target, -1, q < 0.3 ? WHITE : q < 0.8 ? C[6] : C[4], f);
            p.glow(target, 0, 22, C[4], 0.4 * f);
          }
          // the dome: a standing ring of light that swells out of the contact, then sags
          if (q < 0.7) {
            const f = 1 - smooth(0.2, 0.7, q);
            for (let i = 0; i < 3; i++) {
              const rr = Math.min(16 + q * (52 + i * 20), 66);
              p.arc(target, -2, rr, 2, Math.PI * 1.06, Math.PI * 1.94, i ? C[6] : WHITE, f * (0.7 - i * 0.15));
            }
            p.glow(target, -18, 40, C[5], 0.55 * f);
          }
          if (q < 0.4) hotStar(p, target - 4, -34, 20 + 34 * (1 - q / 0.4), T * 2, C, 1 - q / 0.4);
        }
      }
      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
