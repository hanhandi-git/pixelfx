// Spiral drill beam: two fingers to the forehead, a violet screw of ki winds in tight, then it fires as a
// corkscrew that bores through the target. The ridges turn along the column, the tip is a spinning bit, and the
// contact keeps drilling after the hit, throwing spirals of debris.
import { Lights, P, Particles, Rng, clamp, ease, fit, fract, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { DRILL, kiOrb, inwardStreaks, floorLight, muzzleFlare, hotStar, boltFleck, crackFan, drawCracks, kiImpact } from "./_lib.js";

const D = 4.0, SHOT = 1.18, HIT = 1.5, END = 4.0;
const HAND = [15, -31], TX = 232, len0 = TX - HAND[0];

export const meta = {
  name: "Drill beam",
  desc: "Fingers to the forehead, a violet screw of ki tightens, then it fires as a corkscrew: turning ridges, a spinning bit at the tip, and a contact that keeps boring into the target.",
  tags: ["ki", "dragonball", "beam", "drill", "pierce", "violet", "technique", "one-shot"],
  size: [350, 200],
  origin: [66, 176],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: DRILL, seed: 44, reach: TX },
};

const FOCUS = { ...READY, x: -1, crouch: 4, lean: -2, turn: 1, fx: 9, fy: -32, bx: 3, by: -25, ffx: 6, fbx: -7 };
const COCK = { ...FOCUS, x: -2, crouch: 6, lean: -4, fx: 9, fy: -31, bx: 3, by: -23 };
const STAB = { ...READY, x: 2, crouch: 4, lean: 6, turn: 1, fx: 15, fy: -31, bx: 9, by: -26, ffx: 9, fbx: -9, toeB: true };
export const act = {
  target: { x: TX },
  poses: [
    [-0.5, READY],
    [0.12, FOCUS],
    [0.62, { ...COCK, crouch: 6, lean: -4, fx: 9, fy: -30 }],
    [SHOT - 0.04, STAB, "snap"],
    [HIT, { ...STAB, crouch: 5, lean: 8 }, "snap"],
    [2.2, { ...STAB, crouch: 5, lean: 6 }],
    [2.9, { ...READY, x: 1 }],
    [END, READY],
  ],
  hits: [
    { t: HIT, stop: 0.14, shake: 0.4, amp: 3, push: 2.6, straw: 26, skin: "char" },
    { t: END - 0.6, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: SHOT, x: 7, n: 5, dir: 1 }, { t: HIT, x: TX, n: 7, dir: -1 }],
};

// The corkscrew: a tapered column with two bright helical ridges turning around it and a spinning bit at the
// head. t drives the turn rate so the drill visibly rotates.
function corkscrew(p, C, x0, y, len, w, t, k, head) {
  const L = len * head;
  const LV = [WHITE, C[6], C[5], C[4], C[3], C[2]];
  for (let d = 0; d <= L; d += 0.5) {
    const x = x0 + d;
    const grow = Math.min(1, (d + 6) / 13);
    const taper = 1 - 0.32 * (d / Math.max(1, len));
    const ww = Math.max(1.2, w * grow * taper);
    const hot = L - d < 8;
    for (let q0 = -ww * 1.18; q0 <= ww * 1.18; q0 += 0.5) {
      const q = Math.abs(q0) / ww;
      if (q > 1.16) continue;
      let lv = q < 0.24 ? 0 : q < 0.46 ? 1 : q < 0.68 ? 2 : q < 0.85 ? 3 : 4;
      if (hot) lv = Math.max(0, lv - 2);
      if (lv >= 4 && ((x + q0) & 1)) continue;
      p.px(x, y + q0, LV[lv]);
    }
    // two ridges on the near face, dim echoes behind
    for (let s = 0; s < 2; s++) {
      const a = d * 0.34 - t * 30 + s * Math.PI;
      const off = Math.sin(a) * ww * 0.9, near = Math.cos(a);
      if (near > 0.05) {
        // the front face of the helix catches the light
        p.px(x, y + off, near > 0.45 ? WHITE : C[6]);
        p.px(x, y + off * 0.86, C[6]);
        p.px(x, y + off * 1.12, C[4]);
      } else {
        // the far side is a groove turning away behind the core
        p.px(x, y + off, C[2]);
        p.px(x, y + off * 0.9, C[2]);
      }
    }
    if ((Math.round(d) & 5) === 0) p.glow(x, y, ww * 2.2 + 4, C[5], 0.12 * k);
  }
  // the bit: three blades turning fast, white on their leading edges
  const hx = x0 + L, spin = t * 34;
  for (let i = 0; i < 3; i++) {
    const a = spin + (i * TAU) / 3;
    const ex = hx + Math.cos(a) * w * 1.5, ey = y + Math.sin(a) * w * 1.5;
    p.line(hx, y, ex, ey, (u) => (u < 0.5 ? WHITE : C[6]), (u) => (u < 0.7 ? 1 : 1.4 - u));
  }
  p.circle(hx, y, w * 0.45, WHITE, 0.9);
  p.glow(hx, y, w * 3.4, C[5], 0.45 * k);
  p.glowLine(x0, y, hx, y, w * 2.4, C[4], 0.16 * k);
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const target = o.reach ?? TX;
  const cracks = crackFan(o.seed + 3, 8, 46);
  let t = 0, hit = false, fired = false;

  return {
    update(dt) {
      t += dt;
      if (t < SHOT) {
        if (t > 0.3 && R.chance(0.8)) {
          // violet static pulled into the fingertips
          const a = R.range(0, TAU), d = R.range(20, 44);
          ps.spawn(P.MOTE, HAND[0] + Math.cos(a) * d, HAND[1] + Math.sin(a) * d * 0.9, -Math.cos(a) * d * 2.2, -Math.sin(a) * d * 2, R.range(0.2, 0.36), R.chance(0.5) ? C[6] : C[5], R.range(0.6, 1.2));
        }
        lights.add(HAND[0], HAND[1], 30, C[4], 0.4, 0.12);
      } else {
        if (!fired) {
          fired = true;
          lights.add(HAND[0], HAND[1], 70, C[6], 1.5, 0.4);
          for (let i = 0; i < 14; i++) {
            const a = R.range(0, TAU), sp = R.range(30, 120);
            ps.spawn(P.SPARK, HAND[0], HAND[1], Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.2, 0.5), C[5], R.range(0.6, 1.2));
          }
        }
        const live = 1 - smooth(2.1, 2.5, t);
        if (live > 0.05 && R.chance(0.9)) {
          // drill filings spiralling off the column
          const d = R.range(6, len0);
          const a = R.range(0, TAU), rr = R.range(5, 11);
          ps.spawn(P.SPARK, HAND[0] + d, HAND[1] + Math.sin(a) * rr, R.range(-50, 20), Math.cos(a) * R.range(40, 120) - 30, R.range(0.2, 0.5), R.chance(0.5) ? WHITE : C[5], R.range(0.5, 1));
        }
        if (!hit && t >= HIT) {
          hit = true;
          lights.add(target, -30, 46, C[6], 2.4, 0.7);
          lights.add(target, -2, 21, C[4], 2, 1.4);
          for (let i = 0; i < 44; i++) {
            const a = Math.PI + R.range(-1.2, 1.2), sp = R.range(70, 260);
            ps.spawn(P.SPARK, target, -30 + R.range(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp - R.range(0, 60), R.range(0.3, 0.8), R.chance(0.4) ? WHITE : C[6], R.range(0.7, 1.4));
          }
          for (let i = 0; i < 26; i++) {
            const a = R.range(0, TAU), sp = R.range(50, 190);
            ps.spawn(P.VAPOUR, target + R.range(-8, 8), -28 + R.range(-10, 8), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.6) - R.range(6, 40), R.range(0.7, 1.5), C[4], R.range(1.6, 3.2));
          }
          for (let i = 0; i < 22; i++) {
            const a = R.range(0, TAU), sp = R.range(20, 100);
            ps.spawn(P.DUST, target + R.range(-20, 20), -R.range(2, 9), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.4) - R.range(10, 44), R.range(1, 1.9), C[3], R.range(1.2, 2.6));
          }
          for (let i = 0; i < 20; i++) {
            const a = Math.PI + R.range(-1.1, 1.1), sp = R.range(40, 160);
            ps.spawn(P.GRIT, target + R.range(-4, 4), -R.range(2, 8), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp) - R.range(50, 240), R.range(1.1, 1.9), R.chance(0.3) ? C[6] : C[3], R.range(0.9, 2));
          }
          for (let i = 0; i < 10; i++)
            ps.spawn(P.SMOKE, target + R.range(-12, 12), -R.range(8, 26), R.range(-14, 16), -R.range(10, 40), R.range(1.2, 1.8), 0, R.range(1.2, 2.3), R.range(0, 0.12), 2);
        }
        // the bore keeps eating: sparks and dust while the drill turns
        if (t < HIT + 0.6 && R.chance(0.7)) {
          const a = Math.PI + R.range(-1.0, 1.0), sp = R.range(40, 140);
          ps.spawn(P.SPARK, target + R.range(-4, 4), -30 + R.range(-6, 6), Math.cos(a) * sp, Math.sin(a) * sp - 30, R.range(0.2, 0.5), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1.1));
        }
        if (t > 2.5 && t < 2.9 && R.chance(0.2))
          ps.spawn(P.EMBER, target + R.range(-24, 24), -R.range(1, 6), R.range(-8, 8), -R.range(10, 34), R.range(0.6, 0.9), C[5], R.range(0.4, 0.8));
      }
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      floorLight(p, 6, C, 0.7, 20);
      p.glow(target, 0, 30, C[4], T > HIT ? 0.14 : 0);

      if (T < SHOT) {
        // the screw tightens at the fingertips: a small orb with two counter-turning rings
        const grow = smooth(0.1, 1.0, T);
        const r = 1.5 + 5.5 * grow + 0.4 * Math.sin(T * 20);
        inwardStreaks(p, C, HAND[0], HAND[1], r, T, SHOT, o.seed * 3 + 2, 26, 30, -1);
        kiOrb(p, C, HAND[0], HAND[1], r, T / 0.55, { arms: 3, turns: 2.4, tilt: 0.5, seed: o.seed });
        for (let i = 0; i < 2; i++) {
          const a0 = T * (i ? -5 : 7);
          p.arc(HAND[0], HAND[1], r + 2.5 + i * 2.5, 1, a0, a0 + 2.4, i ? C[6] : C[5], 0.8);
        }
        for (let i = 0; i < 3; i++) {
          const q = fract(T * 1.7 + i / 3);
          if (q < 0.55) boltFleck(p, HAND[0] + Math.cos(i * 2.1) * 6, HAND[1] + Math.sin(i * 2.1) * 5, i * 2.1 + T * 4, 6 + q * 6, C, (1 - q) * 0.9);
        }
        p.glow(HAND[0], HAND[1], 26, C[4], 0.22 + 0.2 * grow);
        if (T > SHOT - 0.18) muzzleFlare(p, C, HAND[0], HAND[1], 3 + 4 * smooth(SHOT - 0.18, SHOT, T), T, smooth(SHOT - 0.18, SHOT, T));
      }

      if (T >= SHOT) {
        const head = clamp(ease.outExpo(clamp((T - SHOT) / 0.1)));
        const live = 1 - smooth(2.1, 2.5, T);
        if (live > 0.02) {
          corkscrew(p, C, HAND[0], HAND[1], len0, 5.4, T, live, head);
          muzzleFlare(p, C, HAND[0] - 1, HAND[1], 6.5, T, live);
          // pressure cones sliding out along the shaft
          for (let i = 0; i < 2; i++) {
            const q = ((T - SHOT) * 1.5 + i / 2) % 1;
            const x = HAND[0] + 10 + q * (len0 - 16);
            p.arc(x, HAND[1], 9 + 2 * q, 2, -1.4, 1.4, C[6], 0.5 * (1 - q) * live);
          }
        }
        if (T >= HIT) {
          const q = T - HIT;
          kiImpact(p, C, target, -30, q, { seed: o.seed + 4, ground: 0, n: 20, life: 0.75 });
          if (q < 1.5) {
            const f = 1 - smooth(0.2, 1.5, q);
            drawCracks(p, cracks, target, -1, q < 0.25 ? WHITE : q < 0.7 ? C[6] : C[4], f);
          }
          // the bore: a white-hot point with rings turning around it
          if (q < 0.9) {
            const f = 1 - smooth(0.25, 0.9, q), spin = T * 16;
            p.circle(target, -30, 5 + 3 * f, WHITE, f);
            p.circle(target, -30, 9 + 5 * f, C[6], f * 0.6);
            for (let i = 0; i < 3; i++) {
              const a0 = spin + (i * TAU) / 3;
              p.arc(target, -30, 12 + 6 * (1 - f), 2, a0, a0 + 2.2, i % 2 ? C[6] : WHITE, f * 0.8);
            }
            p.glow(target, -30, 30, C[5], 0.4 * f);
          }
          if (q < 0.3) hotStar(p, target, -32, 14 + 20 * (1 - q / 0.3), -T * 2, C, 1 - q / 0.3);
        }
      }
      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
