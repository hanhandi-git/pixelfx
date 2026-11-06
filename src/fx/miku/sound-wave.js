// A teal sound bullet for the miku set: a note rides inside a spinning waveform hoop, trailing echoes
// and small notes, then pops into a ring of thrown notes.
import { Particles, Lights, P, Rng, fit, sparkle, clamp, smooth, ease, WHITE } from "../../core/index.js";
import { MIKU, PINK, note, soundRing } from "./_lib.js";

export const meta = {
  name: "Sound wave",
  desc: "A teal sound bullet: an eighth note rides inside a spinning waveform hoop, leaving echoes and small notes, then bursts into a ring of thrown notes.",
  tags: ["miku", "sound", "note", "projectile", "directional", "one-shot"],
  size: [208, 88],
  origin: [34, 46],
  duration: 1.15,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: MIKU, seed: 8 },
};

const T0 = 0.05, HIT = 0.62, DIST = 110;

export function create(o) {
  const C = fit(o.palette, 8), P2 = fit(PINK, 6), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, sparks: [C[7], C[6], C[5], C[4]], haze: C[4] });
  const lights = new Lights();
  const flown = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI * 0.85 + (i / 5) * Math.PI * 0.7 + R.range(-0.12, 0.12);
    return { a, v: R.range(28, 62), s: i % 3 === 0 ? 2 : 1, life: R.range(0.42, 0.6), kind: i % 2 ? "eighth" : "tiny" };
  });
  let t = 0, popped = false;
  const pos = (tt) => {
    const u = clamp((tt - T0) / (HIT - T0));
    const x = DIST * (1 - Math.pow(1 - u, 1.55));
    return [x, Math.sin(u * Math.PI * 2) * 2.2];
  };

  return {
    update(dt) {
      t += dt;
      const [x, y] = pos(t);
      if (t > T0 && t < HIT && R.chance(0.7)) {
        ps.spawn(P.MOTE, x - 10 + R.range(-2, 2), y + R.range(-5, 5), -R.range(20, 60), R.range(-14, 14), R.range(0.18, 0.35), R.chance(0.5) ? C[5] : C[4], R.range(0.6, 1.3));
      }
      if (t > HIT && t < HIT + 0.3 && R.chance(0.5)) {
        const a = R.range(-Math.PI, 0), sp = R.range(30, 100);
        ps.spawn(P.STAR, DIST, 0, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.5), R.chance(0.6) ? C[6] : WHITE, R.range(0.7, 1.4));
      }
      if (t >= HIT && !popped) {
        popped = true;
        lights.add(DIST, 0, 56, C[4], 0.8, 0.4);
        lights.add(DIST, 0, 30, WHITE, 0.8, 0.1);
        for (let i = 0; i < 22; i++) {
          const a = R.range(-Math.PI, 0.1), sp = R.range(50, 200);
          ps.spawn(P.SPARK, DIST, 0, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.18, 0.4), R.pick([C[6], C[5], C[4]]), 1);
        }
      }
      ps.update(dt);
      lights.update(dt);
    },

    drawBack(p) {
      const out = smooth(0.95, 1.13, t);
      if (out >= 1) return;
      const [x, y] = pos(t);
      // three after-images thinning out behind the bullet
      if (t > T0 && t < HIT) {
        for (let i = 1; i <= 3; i++) {
          const [ax, ay] = pos(t - i * 0.035);
          if (ax < x - 1) drawBullet(p, C, ax, ay, 1 - i * 0.24, t - i * 0.035, false);
        }
      }
      // small notes shed along the flight
      for (let i = 0; i < 7; i++) {
        const bt = T0 + 0.12 + i * 0.065, age = t - bt;
        if (age < 0 || age > 0.42 || bt > HIT) continue;
        const [bx, by] = pos(bt);
        const drift = age * 22, wob = Math.sin(age * 9 + i) * 5;
        const fa = Math.sin((age / 0.42) * Math.PI);
        note(p, bx - 12 - drift * 0.35, by + 4 + age * -26 + wob, { kind: "tiny", s: i % 2 ? 1 : 2, C, a: fa, outline: C[0] });
      }
    },

    draw(p) {
      const out = smooth(0.95, 1.13, t);
      if (out >= 1) return;
      const [x, y] = pos(t);
      // the bullet: a waveform hoop with a bright note in its heart
      if (t > T0 && t < HIT) {
        const born = smooth(T0, T0 + 0.06, t);
        if (born > 0) drawBullet(p, C, x, y, born, t, true);
        p.glow(x, y, 26, C[4], 0.4 * born);
      }
      // launch pop
      if (t > T0 && t < T0 + 0.14) {
        const k = 1 - (t - T0) / 0.14;
        sparkle(p, 0, 0, 3 + 8 * k, WHITE, C[6], 0.4 * k);
      }
      // impact: a white core, one ring, a fan of notes
      const age = t - HIT;
      if (age >= 0) {
        const u = clamp(age / 0.34);
        if (u < 1) {
          const w = 1 - u;
          soundRing(p, DIST, 0, 10 + 40 * ease.outQuart(u), (10 + 40 * ease.outQuart(u)) * 0.72, { C, amp: 2.2, lobes: 9, phase: u * 2, th: 2.4, a: w, rim: C[7], glow: false });
          p.glow(DIST, 0, 40, C[5], 0.4 * w);
        }
        if (age < 0.14) {
          const k = 1 - age / 0.14;
          p.circle(DIST, 0, 3 + 4 * k, WHITE);
          sparkle(p, DIST, 0, 4 + 10 * k, WHITE, C[6], 0.4 * k);
          p.glow(DIST, 0, 52, WHITE, 0.45 * k);
        }
        for (const f of flown) {
          if (age > f.life) continue;
          const d = (f.v * age) / (1 + age * 0.8), fx = DIST + Math.cos(f.a) * d, fy = Math.sin(f.a) * d * 0.8 - age * age * 12;
          const fa = 1 - smooth(f.life * 0.6, f.life, age);
          note(p, fx, fy, { kind: f.kind, s: f.s, C: f.a < -1.9 ? P2 : C, a: fa, outline: C[0], glint: f.s > 1 });
        }
      }
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}

// the hoop, its rolling edges and the note riding in the middle; the note holds still while the hoop spins
function drawBullet(p, C, x, y, a, t, front) {
  const spin = t * 7;
  soundRing(p, x, y, 15, 15, { C, amp: 1.6, lobes: 8, phase: spin, th: 1.8, a: a * 0.95, rim: front ? C[7] : C[6], glow: false });
  soundRing(p, x, y, 10.5, 10.5, { C, amp: 1.2, lobes: 6, phase: -spin * 1.4, th: 1.3, a: a * 0.8, rim: C[6], glow: false });
  if (front) {
    p.glow(x, y, 18, C[5], 0.3 * a);
    p.px(x + 1, y - 1, WHITE);
  }
  note(p, x + 1, y + 1, { kind: "eighth", s: 1, C, a, outline: C[0], glint: true });
  // a comet tail of light behind the hoop
  for (let i = 1; i <= 4; i++) p.dot(x - 12 - i * 4, y + Math.sin(spin + i) * 1.4, C[4 - Math.min(3, i)], a * (0.5 - i * 0.09));
}
