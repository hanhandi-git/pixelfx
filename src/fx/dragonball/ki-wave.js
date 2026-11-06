// Ki wave: the signature two-handed blast. Power gathers between cupped palms at the hip, both hands drive
// forward, and a thick column of blue ki tears across the field: a white core, three strands twisting down it,
// pulses running out to the tip, and a contact that flashes, rings the floor and leaves it smoking.
import { Lights, P, Particles, Rng, band, clamp, ease, fit, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { KI, kiOrb, kiBeam, muzzleFlare, kiImpact, inwardStreaks, floorLight, crackFan, drawCracks, hotStar } from "./_lib.js";

const D = 4.2, FIRE = 1.06, IMPACT = 1.3, HOLD = 2.2;
const HIP = [10, -20], PALM = [16, -26], TX = 166;
const len0 = TX - PALM[0];

export const meta = {
  name: "Ki wave",
  desc: "He cups ki at his hip until it swells, drives both palms forward, and a thick blue-white column crosses the field: twisted strands, running pulses, a contact that cracks the floor.",
  tags: ["ki", "dragonball", "beam", "blast", "wave", "two-handed", "technique", "one-shot"],
  size: [340, 190],
  origin: [74, 168],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: KI, seed: 21, reach: TX },
};

const HIPP = { ...READY, x: -2, crouch: 6, lean: -2, turn: 1, fx: 10, fy: -20, bx: 2, by: -19, ffx: 7, fbx: -8, armsFront: true };
const PULL = { ...HIPP, x: -3, crouch: 8, lean: -4, fx: 7, fy: -18, bx: 0, by: -17 };
const PUSH = { ...READY, x: 0, crouch: 5, lean: 7, turn: 1, fx: 17, fy: -26, bx: 13, by: -24, ffx: 10, fbx: -9, toeB: true };
const STRAIN = { ...PUSH, crouch: 6, lean: 8, fx: 16, fy: -25 };
export const act = {
  target: { x: TX },
  poses: [
    [-0.5, READY],
    [0.1, HIPP],
    [0.62, PULL],
    [FIRE - 0.1, { ...PULL, crouch: 9, lean: -6, fx: 5, fy: -17 }],
    [FIRE - 0.02, PUSH, "snap"],
    [IMPACT, STRAIN, "snap"],
    [1.75, STRAIN],
    [HOLD, { ...PUSH, crouch: 7, lean: 5 }],
    [2.85, { ...READY, x: 1 }],
    [D, READY],
  ],
  hits: [
    { t: IMPACT, stop: 0.18, shake: 0.45, amp: 4, push: 3.4, straw: 32, skin: "char" },
    { t: D - 0.7, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: FIRE, x: 8, n: 8, dir: 1 }, { t: IMPACT, x: TX, n: 10, dir: -1 }],
};

const orbAt = (t) => {
  if (t >= FIRE - 0.06) return { x: PALM[0], y: PALM[1], r: 6 };
  const q = smooth(FIRE - 0.22, FIRE - 0.05, t);
  return { x: HIP[0] + (PALM[0] - HIP[0]) * q, y: HIP[1] + (PALM[1] - HIP[1]) * q, r: 4 + 4.2 * smooth(0.1, FIRE - 0.1, t) };
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const target = o.reach ?? TX;
  const cracks = crackFan(o.seed + 5, 9, 58);
  let t = 0, hit = false, fired = false;

  function impact() {
    lights.add(target, -26, 62, C[6], 2.4, 0.7);
    lights.add(target, -2, 22, C[4], 2.2, 1.6);
    for (let i = 0; i < 54; i++) {
      const a = Math.PI + R.range(-1.05, 1.05), sp = R.range(80, 280);
      ps.spawn(P.SPARK, target, -26 + R.range(-8, 8), Math.cos(a) * sp, Math.sin(a) * sp - R.range(0, 70), R.range(0.35, 0.95), R.chance(0.4) ? WHITE : i % 3 ? C[6] : C[5], R.range(0.7, 1.6));
    }
    for (let i = 0; i < 30; i++) {
      const a = R.range(0, TAU), sp = R.range(40, 170);
      ps.spawn(P.VAPOUR, target + R.range(-12, 12), -22 + R.range(-12, 8), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.6) - R.range(6, 40), R.range(0.7, 1.6), C[4], R.range(1.8, 3.6));
    }
    for (let i = 0; i < 26; i++) {
      const a = R.range(0, TAU), sp = R.range(20, 110);
      ps.spawn(P.DUST, target + R.range(-20, 20), -R.range(2, 9), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.4) - R.range(10, 50), R.range(1.2, 2.2), C[3], R.range(1.4, 3));
    }
    for (let i = 0; i < 30; i++) {
      const a = R.range(-2.8, 2.8), sp = R.range(50, 210);
      ps.spawn(P.GRIT, target + R.range(-4, 4), -R.range(2, 9), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp) - R.range(60, 280), R.range(1.2, 2.1), R.chance(0.3) ? C[6] : C[3], R.range(1, 2.2));
    }
    for (let i = 0; i < 12; i++)
      ps.spawn(P.SMOKE, target + R.range(-16, 16), -R.range(6, 26), R.range(-18, 22), -R.range(14, 50), R.range(1.5, 2.4), 0, R.range(1.4, 2.6), R.range(0, 0.2), 2);
    for (let i = 0; i < 18; i++) {
      const a = R.range(0, TAU), sp = R.range(10, 60);
      ps.spawn(P.EMBER, target + R.range(-24, 24), -R.range(2, 12), Math.cos(a) * sp, -R.range(20, 90), R.range(1.2, 2.4), i % 2 ? C[6] : C[5], R.range(0.5, 1.1));
    }
  }

  return {
    update(dt) {
      t += dt;
      if (t < FIRE) {
        const { x, y, r } = orbAt(t);
        if (t > 0.15 && R.chance(0.75)) {
          const a = R.range(0, TAU), d = R.range(26, 54);
          const mx = x + Math.cos(a) * d, my = y + Math.sin(a) * d * 0.9;
          if (my < -3) ps.spawn(P.MOTE, mx, my, -Math.cos(a) * d * 1.7, -Math.sin(a) * d * 1.5, R.range(0.22, 0.4), R.chance(0.5) ? C[6] : C[5], R.range(0.6, 1.2));
        }
        lights.add(x, y, 34 + r * 3, C[4], 0.5, 0.12);
        if (t > FIRE - 0.16 && R.chance(0.6)) {
          const a = R.range(0, TAU), rr = 6 + R.range(0, 8);
          ps.spawn(P.SPARK, x + Math.cos(a) * rr, y + Math.sin(a) * rr, Math.cos(a) * R.range(40, 120), Math.sin(a) * R.range(40, 120), R.range(0.15, 0.35), WHITE, R.range(0.6, 1.1));
        }
      } else {
        if (!fired) {
          fired = true;
          // the release: a ring of grit kicked off the floor and the whole column's light
          for (let i = 0; i < 16; i++) {
            const a = R.range(0, TAU), sp = R.range(30, 120);
            ps.spawn(P.DUST, 4 + R.range(-8, 10), -R.range(0, 4), Math.cos(a) * sp, Math.sin(a) * sp * 0.3 - R.range(6, 26), R.range(0.8, 1.5), C[3], R.range(1.2, 2.4));
          }
          lights.add(PALM[0], PALM[1], 48, C[6], 2.2, 0.5);
        }
        const live = t < HOLD + 0.42 ? 1 : 0;
        if (live && R.chance(0.5)) {
          const d = R.range(0, 1) * (t < HOLD ? len0 * 0.9 : len0 * 0.55);
          ps.spawn(P.MOTE, PALM[0] + d, PALM[1] + R.sign() * R.range(9, 16), R.range(-30, 10), R.range(-40, -10), R.range(0.2, 0.45), R.chance(0.5) ? C[6] : C[5], R.range(0.6, 1.2));
        }
        if (t < HOLD + 0.5 && R.chance(0.85)) {
          // sparks shed off the beam's skin, and puffs torn from its surface
          const d = R.range(10, len0), x = PALM[0] + d;
          ps.spawn(P.SPARK, x, PALM[1] + R.range(-11, 11), R.range(-60, 30), R.range(-120, -20), R.range(0.2, 0.5), C[5], R.range(0.5, 1.1));
          if (R.chance(0.25)) ps.spawn(P.VAPOUR, x, PALM[1] + R.range(-9, 9), R.range(-20, 20), R.range(-30, -6), R.range(0.5, 1.1), C[4], R.range(1.2, 2.4));
        }
        if (t < HOLD && R.chance(0.55)) {
          const x = target + R.range(-10, 14);
          ps.spawn(P.SPARK, x, -20 + R.range(-10, 10), R.range(-140, -40), R.range(-100, -20), R.range(0.2, 0.5), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1.2));
        }
        if (t > HOLD && t < 2.9 && R.chance(0.3)) {
          ps.spawn(P.EMBER, target + R.range(-30, 30), -R.range(1, 6), R.range(-10, 10), -R.range(14, 40), R.range(0.8, 1.2), R.chance(0.4) ? C[6] : C[5], R.range(0.4, 0.9));
        }
        if (!hit && t >= IMPACT) {
          hit = true;
          impact();
        }
        if (t > IMPACT && t < IMPACT + 1.0 && R.chance(0.4))
          ps.spawn(P.DUST, target + R.range(-26, 26), -R.range(0, 4), R.range(-30, 30), -R.range(6, 24), R.range(0.9, 1.5), C[3], R.range(1.4, 2.6));
      }
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      const live = 1 - smooth(HOLD, HOLD + 0.5, T);
      floorLight(p, 8, C, 0.8, 24);
      p.glow(target, 0, 34, C[4], 0.16 * (T > IMPACT ? 1 : 0));

      // the charge
      if (T < FIRE) {
        const { x, y, r } = orbAt(T);
        p.glow(8, -18, 30, C[4], 0.18);
        inwardStreaks(p, C, x, y, r, T, FIRE, o.seed * 3 + 1, 30, 26, -1);
        kiOrb(p, C, x, y, r, T / 0.6, { arms: 3, turns: 1.3, tilt: 0.45, seed: o.seed });
        if (T > FIRE - 0.2) muzzleFlare(p, C, x, y, 3 + 3 * smooth(FIRE - 0.2, FIRE, T), T, smooth(FIRE - 0.2, FIRE, T));
      }

      // the beam
      if (T >= FIRE) {
        const grow = ease.outExpo(clamp((T - FIRE) / 0.11));
        const head = clamp(grow);
        const w = 10.5 + 1.1 * Math.sin(T * 26) + 1.6 * (1 - smooth(FIRE, FIRE + 0.25, T));
        if (live > 0.02) {
          kiBeam(p, C, PALM[0], PALM[1], len0, w, T, { k: live, head, seed: o.seed, flare: 0.1 });
          // three pressure collars running out along the column
          for (let i = 0; i < 3; i++) {
            const q = ((T - FIRE) * 1.6 + i / 3) % 1;
            const x = PALM[0] + 14 + q * (len0 - 20);
            const a = 0.55 * (1 - q) * live;
            p.arc(x, PALM[1], w + 3 + 3 * q, 2, -1.5, 1.5, C[6], a);
            p.arc(x - 2, PALM[1], w + 5 + 3 * q, 1, -1.3, 1.3, C[5], a * 0.6);
          }
          // the leading head: a white-hot disc and its glare
          const hx = PALM[0] + len0 * head;
          if (head < 1) {
            p.circle(hx, PALM[1], 7, WHITE, 0.9);
            p.circle(hx, PALM[1], 12, C[6], 0.5);
            p.glow(hx, PALM[1], 40, C[5], 0.5);
          }
          muzzleFlare(p, C, PALM[0] - 1, PALM[1], 7.5 + 1.2 * Math.sin(T * 30), T, live);
        }

        // the contact
        if (T >= IMPACT) {
          const q = T - IMPACT;
          kiImpact(p, C, target, -26, q, { seed: o.seed + 2, ground: 0, n: 26, life: 0.85 });
          if (q < 1.6) {
            const f = 1 - smooth(0.2, 1.6, q);
            drawCracks(p, cracks, target, -1, q < 0.3 ? WHITE : q < 0.8 ? C[6] : C[4], f);
            p.glow(target, -1, 22, C[4], 0.4 * f);
          }
          if (q > 0.05 && q < 1.0) {
            // the floor answers: three squashed rings running out from the contact
            for (let i = 0; i < 3; i++) {
              const qq = q - i * 0.07;
              if (qq <= 0) continue;
              const rr = 14 + qq * (40 + i * 16);
              const a = clamp(1 - rr / (58 + i * 18), 0, 1) * 0.42;
              if (a > 0.01) band(p, target, -1, Math.min(rr, 46), 0.22, 2, a, C);
            }
          }
          if (q < 0.35) hotStar(p, target - 4, -28, 16 + 26 * (1 - q / 0.35), T * 3, C, 1 - q / 0.35);
        }
      }

      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
