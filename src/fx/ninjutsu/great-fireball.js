// A great fireball breathed from the mouth: the ball is drawn as a churning flame sphere (radial fire ramp and
// turbulent noise), everything around it is simulated fire, embers, smoke and debris. Original to pixelfx; the
// particle physics comes from the library's Sprite Fusion-derived simulation core (MIT).
import { Particles, Lights, P, PF, Rng, fit, fbm, clamp, smooth, ease, sparkle, flare, band, WHITE, TAU, READY } from "../../core/index.js";
import { PAL } from "../../core/color.js";

const CHARGE = 0.6, RELEASE = 0.66, HIT = 1.32, END = 4.3;
const MX = 9, MY = -29, START = 24, TARGET = 152;

export const meta = {
  name: "Great fireball",
  desc: "He draws a breath, embers pulling into his mouth, and breathes out a rolling ball of fire that grows as it flies, bursts on the target and leaves the floor burning.",
  tags: ["chakra", "ninjutsu", "fire", "fireball", "breath", "technique", "one-shot"],
  size: [348, 206],
  origin: [80, 170],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: PAL.fire, seed: 12, reach: TARGET },
};

const INHALE = { ...READY, x: -3, crouch: 6, lean: -5, turn: 1, fx: 7, fy: -30, bx: 8, by: -22, ffx: 6, fbx: -6 };
const BREATH = { ...READY, x: 2, crouch: 5, lean: 7, turn: 1, fx: 12, fy: -28, bx: -7, by: -20, ffx: 12, fbx: -9, toeB: true };
const RECOIL = { ...READY, x: 5, crouch: 4, lean: 3, fx: 10, fy: -24, bx: 8, by: -20 };
export const act = {
  target: { x: TARGET },
  poses: [
    [-0.4, { ...READY, x: -3 }],
    [0.1, INHALE],
    [CHARGE - 0.04, { ...INHALE, crouch: 8, lean: -7, fx: 5 }],
    [RELEASE, { ...BREATH, crouch: 5, lean: 8 }, "snap"],
    [HIT - 0.02, { ...BREATH, crouch: 4, lean: 6 }],
    [HIT, { ...BREATH, crouch: 5, lean: 3 }, "snap"],
    [HIT + 0.7, RECOIL],
    [HIT + 1.6, { ...READY, x: 3 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.16, shake: 0.4, amp: 3, push: 3.2, straw: 30, skin: "char" },
    { t: END - 0.7, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: RELEASE, x: 9, n: 6, dir: 1 }, { t: HIT, x: TARGET, n: 8, dir: -1 }],
};

// the ball at time t: a radius that grows as it flies, a churning surface, a white leading core
function fireBall(p, C, x, y, r, t, seed) {
  const R = Math.max(2, r);
  for (let py = Math.floor(y - R - 2); py <= Math.ceil(y + R + 2); py++)
    for (let px = Math.floor(x - R - 2); px <= Math.ceil(x + R + 2); px++) {
      const dx = (px + 0.5 - x) / R, dy = (py + 0.5 - y) / R, d = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx), ca = Math.cos(ang), sa = Math.sin(ang);
      const n = fbm(ca * 2.4 + 4 + t * 3.2, sa * 2.4 + 4 + t * 2.4, seed, 3);
      const edge = 0.9 + 0.12 * n;
      if (d > edge) continue;
      // hot toward the leading face and the top, cooler and darker at the trailing rim
      let v = 1.05 - d * 0.78 + n * 0.32 - Math.max(0, -ca) * d * 0.28;
      if (d < 0.34) v += 0.45 * (1 - d / 0.34);
      if (v > 0.96) p.px(px, py, WHITE);
      else if (v > 0.82) p.px(px, py, C[7]);
      else if (v > 0.64) p.px(px, py, C[6]);
      else if (v > 0.46) p.px(px, py, C[5]);
      else if (v > 0.3) p.px(px, py, C[4]);
      else if (v > 0.16) p.px(px, py, C[3]);
      else p.dot(px, py, C[2], 0.85);
    }
  p.glow(x, y, R * 3.2, C[4], 0.34);
  p.glow(x + R * 0.35, y - R * 0.25, R * 1.2, C[6], 0.28);
  p.glow(x - R * 0.1, y, R * 0.5, WHITE, 0.2);
}

const ballX = (t) => START + (TARGET - START) * ease.inOutQuad(clamp((t - RELEASE) / (HIT - RELEASE)));
const ballR = (t) => 12 + 13 * ease.outQuad(clamp((t - RELEASE) / (HIT - RELEASE)));

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), floor = () => 0;
  const ps = new Particles({ rng: R, ground: floor }), lights = new Lights();
  let t = 0, last = 0, hit = false;
  const target = o.reach ?? TARGET;

  const ember = (x, y, hot = 1) => ps.spawn(P.EMBER, x, y, R.range(-12, 12), R.range(-45, -12), R.range(0.6, 1.4), hot > 0.6 ? C[7] : C[5], R.range(0.6, 1.3));
  const puff = (x, y, vx, vy, life, size) => ps.spawn(P.FIRE, x, y, vx, vy, life, 0, size, 0, PF.SMOKES);

  function impact(x, y) {
    lights.add(x, y - 10, 72, C[6], 1.4, 0.8);
    lights.add(x, y - 4, 54, C[4], 1, 1.6);
    for (let i = 0; i < 46; i++) {
      const a = R.range(0, TAU), sp = R.range(60, 330);
      puff(x + R.range(-6, 6), y + R.range(-10, 4), Math.cos(a) * sp, Math.sin(a) * sp * 0.7 - R.range(20, 90), R.range(0.35, 1.0), R.range(1.2, 3.1));
    }
    for (let i = 0; i < 54; i++) {
      const a = R.range(-2.7, 2.7), sp = R.range(90, 360);
      ps.spawn(P.SPARK, x, y - R.range(2, 18), Math.cos(a) * sp, Math.sin(a) * sp - R.range(20, 120), R.range(0.3, 0.95), R.chance(0.35) ? WHITE : C[6], R.range(0.8, 1.6));
    }
    for (let i = 0; i < 14; i++) {
      const a = R.range(-2.9, 2.9), sp = R.range(50, 175);
      ps.spawn(P.BRAND, x, y - R.range(1, 10), Math.cos(a) * sp, Math.sin(a) * sp - R.range(30, 150), R.range(1.2, 2.3), C[5], R.range(1, 2.2));
    }
    for (let i = 0; i < 16; i++) {
      const a = R.range(0, TAU), sp = R.range(20, 75);
      ps.spawn(P.GRIT, x, y, Math.cos(a) * sp, -R.range(80, 260), R.range(1.2, 2.2), C[4], R.range(1, 2));
    }
    for (let i = 0; i < 10; i++) ps.spawn(P.SMOKE, x + R.range(-14, 14), y - R.range(4, 20), R.range(-16, 16), R.range(-40, -10), R.range(1.4, 2.6), 0, R.range(1.4, 2.8), 0, PF.BIG);
  }

  return {
    update(dt) {
      t += dt;
      const prev = last;
      last = t;
      if (t < CHARGE) {
        // the breath pulls inward: embers and streaks off the air, light at the mouth
        const q = t / CHARGE;
        if (R.chance(0.55)) {
          const a = R.range(0, TAU), d = R.range(34, 58);
          const x = MX + Math.cos(a) * d, y = MY + Math.sin(a) * d * 0.85;
          const tx = MX + (x - MX) * 0.02, ty = MY + (y - MY) * 0.02;
          ps.spawn(P.MOTE, x, y, (tx - x) * 2.4, (ty - y) * 2.4, R.range(0.24, 0.42), R.chance(0.5) ? C[6] : C[5], R.range(0.7, 1.3));
        }
        if (t - prev > 0.05) lights.add(MX + 2, MY, 16, C[4], 0.22 + 0.3 * q, 0.1);
      } else if (t < HIT) {
        const q = (t - RELEASE) / (HIT - RELEASE);
        const x = ballX(t), y = -27 - 2 * Math.sin(q * Math.PI), r = ballR(t);
        // fire shed off the ball: corona puffs, a smoke trail, sparks behind
        for (let i = 0; i < 2; i++) puff(x - r * R.range(0.4, 0.9), y + R.range(-r, r) * 0.7, -R.range(30, 90), R.range(-30, 20), R.range(0.26, 0.6), R.range(0.8, 1.9));
        if (R.chance(0.8)) ps.spawn(P.SPARK, x - r * 0.4, y + R.range(-r, r) * 0.6, -R.range(80, 220), R.range(-60, 40), R.range(0.25, 0.6), C[6], R.range(0.6, 1.2));
        for (let i = 0; i < 2; i++) ember(x - r * R.range(0.2, 1), y + R.range(-r, r) * 0.5);
        if (R.chance(0.3)) ps.spawn(P.SMOKE, x - r, y + R.range(-r, r) * 0.5, -R.range(22, 50), R.range(-20, 0), R.range(0.9, 1.8), 0, R.range(0.8, 1.5));
        if (t - prev > 0.04) lights.add(x, y, 54 + r * 2, C[5], 0.7, 0.16);
      } else if (!hit) {
        hit = true;
        impact(target, -12);
      }
      ps.update(dt);
      lights.update(dt);
    },
    draw(p) {
      const T = t;
      if (T < CHARGE) {
        const q = T / CHARGE, a = smooth(0.2, 1, q);
        sparkle(p, MX + 2, MY, 2 + 4 * a, C[6], C[4], 0.25 + 0.4 * q);
        p.glow(MX + 2, MY, 12 + 8 * q, C[4], 0.25 * a);
        p.glow(MX + 2, MY - 2, 5, C[6], 0.3 * a);
      }
      if (T >= RELEASE && T < HIT) {
        const x = ballX(T), y = -27 - 2 * Math.sin(((T - RELEASE) / (HIT - RELEASE)) * Math.PI), r = ballR(T);
        // a white flash and a cone of flame at the lips on the release frame
        if (T < RELEASE + 0.1) {
          const k = 1 - (T - RELEASE) / 0.1;
          flare(p, MX + 4, MY, 14 + 20 * k, 1, C);
          p.glow(MX + 6, MY, 26, WHITE, 0.5 * k);
        }
        fireBall(p, C, x, y, r, T, o.seed);
        // flame licking back toward the mouth while the ball is close
        if (T < RELEASE + 0.28) {
          for (let i = 0; i < 10; i++) {
            const u = i / 10, px = MX + 6 + (x - MX) * u, py = MY + 1 + Math.sin(u * 9 + T * 20) * (2 + 5 * u);
            p.dot(px, py, u < 0.5 ? C[6] : C[4], 0.75);
          }
        }
      }
      if (T >= HIT) {
        const q = T - HIT;
        if (q < 0.16) {
          const k = 1 - q / 0.16;
          p.circle(target, -12, 10 + 22 * (1 - k), WHITE, 0.9 * k);
          flare(p, target, -12, 34 + 50 * k, 1, C);
          p.glow(target, -12, 74, C[6], 0.5 * k);
        }
        if (q < 0.9) {
          const k = 1 - q / 0.9;
          band(p, target, 0, 22 + q * 110, 0.18, 3.5 * k + 0.5, k, C, undefined, q < 0.2);
          band(p, target, -6, 14 + q * 74, 0.24, 2.2 * k + 0.4, k * 0.8, C);
        }
        // the ground keeps a hot scar, cooling through the ramp
        const sm = T - HIT;
        if (sm < 2.4) {
          const f = sm / 2.4, h = (1 - f) * (1 - f);
          const rx = 34 + sm * 10;
          for (let x = target - rx; x <= target + rx; x++) {
            const d = Math.abs(x - target), q2 = clamp((rx - d) / 10);
            if (q2 <= 0) continue;
            const c = h > 0.55 ? C[6] : h > 0.32 ? C[5] : h > 0.16 ? C[3] : C[2];
            p.dot(x, 0, c, 0.5 + 0.5 * q2 * (0.35 + h));
            if (d < 8 && h > 0.4) p.dot(x, 1, C[2], 0.4 * h);
          }
          p.glow(target, -1, 44, C[3], 0.3 * h);
        }
        if (q > 0.35 && q < 2.2) {
          for (let i = 0; i < 3; i++) {
            const rr = (q * 26 + i * 17) % 52, a = (1 - rr / 52) * 0.25;
            band(p, target, 0.5, rr + 6, 0.16, 1, a, C);
          }
        }
      }
      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
      if (T < HIT + 2.9) p.glow(target, -1, 34, C[4], 0.22 * (1 - smooth(HIT, HIT + 2.9, T)));
      p.glow(MX + 2, -1, 16, C[4], 0.1 * (1 - smooth(END - 1.2, END, T)));
    },
  };
}
