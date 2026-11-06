// Destructo disc: a razor of ki spun up over one palm and thrown flat. It screams across the field as a
// spinning sawblade, and the cut it leaves behind stays white-hot for a beat before it cools.
import { Lights, P, Particles, Rng, clamp, ease, fit, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { GOLD, floorLight, hotStar } from "./_lib.js";

const D = 2.9, WIND = 0.85, THROW = 0.92, CUT = 1.42, END = 2.9;
const PALM = [13, -30], TX = 214;

export const meta = {
  name: "Destructo disc",
  desc: "A razor of ki spins up over one palm, then screams across the field flat: a sawblade with hooked teeth and a white hub, leaving a cut that stays white-hot before it cools.",
  tags: ["ki", "dragonball", "disc", "saw", "cut", "throw", "technique", "one-shot"],
  size: [330, 170],
  origin: [56, 148],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: GOLD, seed: 27, reach: TX },
};

const WINDUP = { ...READY, x: 2, crouch: 5, lean: 0, turn: 1, fx: 13, fy: -30, bx: 6, by: -22, ffx: 8, fbx: -8 };
const HOLD = { ...WINDUP, x: 1, crouch: 5, fx: 12, fy: -29 };
const THROWN = { ...READY, x: 2, crouch: 4, lean: 7, turn: 1, fx: 15, fy: -29, bx: 7, by: -24, ffx: 9, fbx: -9, toeB: true };
export const act = {
  target: { x: TX },
  poses: [
    [-0.45, READY],
    [0.1, WINDUP],
    [0.55, HOLD],
    [THROW, { ...THROWN, crouch: 3, lean: 10 }, "snap"],
    [1.15, { ...THROWN, crouch: 4, lean: 6 }],
    [1.8, { ...THROWN, crouch: 5, lean: 4 }],
    [2.4, { ...READY, x: 1 }],
    [D, READY],
  ],
  hits: [
    { t: CUT, stop: 0.1, shake: 0.3, amp: 2, push: 1.6, straw: 22, skin: "char" },
    { t: D - 0.6, push: 0, straw: 0, flash: 0, skin: null },
  ],
  dust: [{ t: THROW, x: 8, n: 5, dir: 1 }],
};

// A sawblade of ki seen edge-on-flat: a white hub, churning spiral arms, a bright rim and hooked teeth whose
// leading faces run white. k fades it, rot turns it.
function blade(p, C, x, y, r, rot, k = 1) {
  const N = 8, seg = TAU / N;
  p.shade(x - r - 6, y - r - 6, x + r + 6, y + r + 6, (px, py) => {
    const dx = px - x, dy = py - y, d = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
    if (d > r + 5.2) return;
    if (d <= r) {
      if (d < 2) return WHITE;
      if (d < 3.1) return C[1];
      if (d > r - 1.2) return C[5];
      const arm = Math.sin(2.6 * (th - rot * 0.5) - d * 0.8);
      return arm > 0.62 ? C[5] : arm > 0.2 ? C[4] : arm > -0.3 ? C[3] : C[2];
    }
    const q = ((th - rot) % TAU + TAU) % TAU / seg;
    const h = 4.6 * Math.pow(q, 1.35);
    if (d - r < h) return q > 0.86 ? WHITE : q > 0.6 ? C[6] : q > 0.35 ? C[5] : C[4];
    if (d - r < 1.5) return C[2];
  });
  p.ring(x, y, r + 0.5, 1, C[6], k);
  // filaments from the hub to the rim, rebuilt every frame from the clock
  const fr = Math.floor(rot * 30);
  for (let j = 0; j < 3; j++) {
    const g = rng(fr, j, 7), a0 = g.range(0, TAU), pts = [];
    for (let i = 0; i <= 4; i++) {
      const rr = 2.4 + ((r - 3) * i) / 4, a = a0 + i * 0.24 + (i ? g.range(-0.32, 0.32) : 0);
      pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    p.polyline(pts, j ? C[6] : WHITE);
  }
  p.glow(x, y, r * 1.9, C[4], 0.34 * k);
  p.glow(x, y, r * 0.42, C[6], 0.3 * k);
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const target = o.reach ?? TX;
  let t = 0, cut = false, thrown = false;

  const discX = (T) => {
    if (T < THROW) return PALM[0];
    const q = clamp((T - THROW) / (CUT - THROW));
    return PALM[0] + (target + 26 - PALM[0]) * q * (0.4 + 0.6 * q);
  };

  return {
    update(dt) {
      t += dt;
      if (t < THROW) {
        if (t > 0.2 && R.chance(0.6)) {
          const a = R.range(0, TAU), d = R.range(16, 34);
          ps.spawn(P.MOTE, PALM[0] + Math.cos(a) * d, PALM[1] + Math.sin(a) * d * 0.8, -Math.cos(a) * d * 1.6, -Math.sin(a) * d * 1.4, R.range(0.2, 0.4), R.chance(0.5) ? WHITE : C[6], R.range(0.5, 1));
        }
        lights.add(PALM[0], PALM[1], 34, C[4], 0.5, 0.12);
      } else {
        if (!thrown) {
          thrown = true;
          lights.add(PALM[0], PALM[1], 52, C[6], 1.2, 0.3);
        }
        // sparks thrown back off the rim as it flies
        if (t < CUT + 0.2 && R.chance(0.9)) {
          const x = discX(t);
          for (let i = 0; i < 2; i++) {
            const a = Math.PI * (0.5 + R.next() * 0.9) + Math.PI * 0.5, sp = R.range(40, 160);
            ps.spawn(P.SPARK, x, PALM[1] + R.range(-12, 12), -R.range(60, 220), Math.sin(a) * sp, R.range(0.15, 0.4), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1.1));
          }
        }
        if (!cut && t >= CUT) {
          cut = true;
          lights.add(target, -30, 54, C[6], 1.6, 0.5);
          for (let i = 0; i < 30; i++) {
            const a = Math.PI + R.range(-1.1, 1.1), sp = R.range(60, 240);
            ps.spawn(P.SPARK, target, -30 + R.range(-8, 8), Math.cos(a) * sp, Math.sin(a) * sp - R.range(0, 60), R.range(0.25, 0.7), R.chance(0.4) ? WHITE : C[6], R.range(0.6, 1.3));
          }
          for (let i = 0; i < 10; i++) {
            const a = Math.PI + R.range(-0.8, 0.8), sp = R.range(40, 120);
            ps.spawn(P.GRIT, target + R.range(-4, 4), -R.range(2, 8), Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp) - R.range(50, 200), R.range(1, 1.8), C[3], R.range(0.8, 1.8));
          }
          ps.spawn(P.VAPOUR, target, -28, -30, -20, 1.1, C[4], 2.6);
        }
        if (t > CUT + 0.5 && t < 2.35 && R.chance(0.18))
          ps.spawn(P.EMBER, target + R.range(-20, 20), -R.range(2, 10), R.range(-8, 8), -R.range(10, 30), R.range(0.4, 0.6), C[5], R.range(0.4, 0.8));
      }
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      floorLight(p, 4, C, 0.6, 18);

      if (T < CUT + 0.5) {
        // the cut: a hot line the blade has already passed through, cooling from white to gold
        const x1 = discX(T);
        const heat = T < CUT ? 1 : 1 - smooth(CUT, CUT + 0.5, T);
        if (x1 > PALM[0] + 4) {
          for (let x = PALM[0] + 6; x <= x1; x += 0.5) {
            p.px(x, -30, heat > 0.6 ? WHITE : heat > 0.3 ? C[6] : C[4]);
            p.px(x, -31, heat > 0.6 ? C[6] : C[5], 0.55 * heat);
          }
          if (heat > 0.2) p.glowLine(PALM[0] + 8, -30, x1, -30, 5, C[5], 0.25 * heat);
        }
      }

      if (T < THROW) {
        // spinning up over the palm, growing
        const g = smooth(0.05, WIND, T);
        const r = 4 + 13 * g + 0.4 * Math.sin(T * 24);
        const rot = T * 26;
        blade(p, C, PALM[0], PALM[1] - g * 3, r, rot, 0.4 + 0.6 * g);
        p.glow(PALM[0], PALM[1], 30, C[4], 0.2 + 0.25 * g);
        // the throw's wind-up: the arm and the disc get a hot edge
        if (T > WIND - 0.16) {
          const f = smooth(WIND - 0.16, WIND, T);
          for (let i = 0; i < 4; i++) {
            const a = rot + (i / 4) * TAU, rr = r + 5 + 4 * f;
            p.line(PALM[0], PALM[1] - g * 3, PALM[0] + Math.cos(a) * rr, PALM[1] - g * 3 + Math.sin(a) * rr, WHITE, f * 0.7);
          }
        }
      } else if (T < CUT + 0.55) {
        const x = discX(T), r = 16 * (1 - 0.15 * clamp((T - THROW) / (CUT - THROW)));
        const fade = 1 - smooth(CUT + 0.2, CUT + 0.55, T);
        blade(p, C, x, PALM[1], r, T * 34, fade);
        // a smear of speed behind it
        for (let i = 1; i < 6; i++) {
          p.dot(x - i * 7, PALM[1] + Math.sin(i + T * 20) * 1.2, i % 2 ? C[5] : C[4], (1 - i / 6) * 0.5 * fade);
        }
      }

      if (T >= CUT) {
        const q = T - CUT;
        // the slice: a cross of white light on the target, then sparks
        if (q < 0.26) {
          const f = 1 - q / 0.26;
          p.line(target - 14, -30 - 10, target + 14, -30 + 10, WHITE, f);
          p.line(target - 14, -30 + 10, target + 14, -30 - 10, WHITE, f * 0.8);
          p.circle(target, -30, 4 + 4 * (1 - f), WHITE, f);
          p.glow(target, -30, 30, C[5], 0.5 * f);
        }
        if (q < 0.3) hotStar(p, target, -30, 10 + 14 * (1 - q / 0.3), T * 3, C, 1 - q / 0.3);
      }

      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
