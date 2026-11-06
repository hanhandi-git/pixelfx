// A teal sonic nova for the miku set: notes spiral into a hovering microphone, then the held note bursts
// into three sound rings, a fan of giant notes and unfurling twin-tail ribbons.
import { Particles, Lights, P, Rng, fit, band, sparkle, clamp, smooth, ease, TAU, WHITE } from "../../core/index.js";
import { MIKU, PINK, note, ribbon, soundRing, mic, eqBars } from "./_lib.js";

export const meta = {
  name: "Vocal burst",
  desc: "Notes spiral into a hovering mic, then a sonic nova bursts in three sound rings; giant notes fly off trailing ribbons and sparkles rain on a glowing stage mark.",
  tags: ["miku", "vocal", "sound", "notes", "nova", "aoe", "one-shot"],
  size: [288, 192],
  origin: [144, 150],
  duration: 3,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: MIKU, seed: 39 },
};

const CORE = -47, CHARGE = 0.52, RELEASE = 0.56, D = meta.duration;
const RINGS = [
  { at: 0, life: 0.62, r: 112, floor: true },
  { at: 0.09, life: 0.7, r: 88, floor: true },
  { at: 0.05, life: 0.5, r: 64, floor: false },
];

export function create(o) {
  const C = fit(o.palette, 8), P2 = fit(PINK, 6), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], C[4]], haze: C[4] });
  const lights = new Lights();
  // notes gathering in, each on its own spiral
  const gather = Array.from({ length: 11 }, (_, i) => ({
    a: R.range(0, TAU), r: R.range(46, 92), t0: 0.02 + R.range(0, 0.4), s: i % 4 === 0 ? 2 : 1,
    kind: i % 5 === 0 ? "beamed" : "eighth", flip: R.chance(0.5), tint: i % 6 === 0 ? P2 : C, spin: R.range(1.4, 2.4),
  }));
  // the fan of notes thrown out at release
  const fly = Array.from({ length: 8 }, (_, i) => {
    const a = -Math.PI + 0.16 + (i / 7) * (Math.PI - 0.32) + R.range(-0.055, 0.055);
    return {
      a, v: R.range(92, 142), t0: RELEASE + 0.03 + i * 0.035, s: i % 4 === 0 ? 3 : 2,
      kind: i % 4 === 1 ? "beamed" : "eighth", flip: Math.cos(a) < 0, life: R.range(1.45, 1.75), off: R.range(7, 14),
      tint: i % 5 === 3 ? P2 : C, trail: R.chance(0.6),
    };
  });
  let t = 0, burst = false;
  const since = (x) => t - x;

  return {
    update(dt) {
      t += dt;
      if (t < CHARGE) {
        // streaks and motes race into the mic; the room brightens with each breath
        if (R.chance(0.85)) {
          const a = R.range(0, TAU), d = R.range(30, 96), T = R.range(0.22, 0.36), v = (d * 2.6) / (Math.exp(2.6 * T) - 1);
          const x = Math.cos(a) * d, y = CORE + Math.sin(a) * d * 0.7;
          ps.spawn(P.STREAK, x, y, (-Math.cos(a) * d * v) / d, (-Math.sin(a) * d * 0.7 * v) / d, T, R.chance(0.5) ? C[6] : C[5]);
        }
        if (R.chance(0.12)) {
          const a = R.range(0, TAU), d = R.range(8, 30);
          ps.spawn(P.FLAKE, Math.cos(a) * d, CORE + Math.sin(a) * d, 0, -R.range(4, 14), R.range(0.3, 0.5), WHITE, 1);
        }
      }
      if (t >= RELEASE && !burst) {
        burst = true;
        lights.add(0, CORE, 110, C[4], 0.95, 0.7);
        lights.add(0, CORE, 52, WHITE, 0.85, 0.16);
        for (let i = 0; i < 34; i++) {
          const a = R.range(0, TAU), sp = R.range(90, 300);
          ps.spawn(P.SPARK, 0, CORE, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.6), R.pick([C[6], C[5], C[4]]), 1);
        }
        for (let i = 0; i < 16; i++) {
          const a = R.range(-Math.PI, 0.2), sp = R.range(30, 120);
          ps.spawn(P.FLAKE, 0, CORE, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.9, 1.5), R.chance(0.55) ? WHITE : C[6], R.range(0.6, 1.5));
        }
        for (let i = 0; i < 8; i++) {
          const a = R.range(0, TAU), sp = R.range(40, 90);
          ps.spawn(P.MOTE, 0, CORE, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.7, 1.2), C[5], R.range(0.8, 1.4));
        }
      }
      // the burst throws notes and sparkles off the floor as it spreads
      if (t > RELEASE && t < RELEASE + 0.5 && R.chance(0.5)) {
        const a = R.range(0, TAU), d = R.range(60, 120);
        ps.spawn(P.STAR, Math.cos(a) * d, Math.sin(a) * d * 0.2 - R.range(0, 8), 0, -R.range(4, 16), R.range(0.3, 0.7), C[5], R.range(0.8, 1.7));
      }
      ps.update(dt);
      lights.update(dt);
    },

    drawBack(p) {
      const out = smooth(2.3, 2.95, t);
      if (out >= 1) return;
      const a = 1 - out;
      // the stage mark: a floor ellipse with ticks and four small notes, drawing itself on during the charge
      const mark = smooth(0.06, 0.4, t) * a;
      if (mark > 0) {
        band(p, 0, 0, 54, 0.2, 1.4, 0.45 * mark, [C[0], C[1], C[2], C[3], C[4], C[5]], (g) => Math.sin(g) < 0);
        p.glow(0, 0, 66, C[3], 0.16 * mark);
        for (let i = 0; i < 12; i++) {
          const g = (i / 12) * TAU, x = Math.cos(g) * 54, y = Math.sin(g) * 54 * 0.2;
          p.dot(x, y, i % 3 ? C[4] : C[6], 0.55 * mark);
          if (i % 3 === 0) p.dot(x, y - 1, C[5], 0.4 * mark);
        }
      }
      // the twin-tail ribbons unfurl behind the notes and frame the burst
      const rage = since(RELEASE);
      if (rage >= 0 && rage < 1.25) {
        const u = clamp(rage / 1.1), fa = 1 - smooth(0.9, 1.2, rage);
        for (const s of [-1, 1]) {
          ribbon(p, s * 3, CORE + 3, {
            len: 66 + 30 * ease.outCubic(u), w: 4, dir: -Math.PI / 2 + s * 0.95, curl: s * 34, wave: 6,
            phase: rage * 1.6 + (s > 0 ? 1.7 : 0), C, a: fa, accent: P2[3], accent2: P2[4], split: true,
          });
        }
      }
      // the far half of every floor ring
      for (const ring of RINGS) {
        const age = since(RELEASE + ring.at);
        if (age < 0 || age > ring.life || !ring.floor) continue;
        const u = age / ring.life, r = ease.outQuart(u) * ring.r;
        soundRing(p, 0, 0, r, r * 0.2, { C, amp: 2.4, lobes: 10, phase: u * 2, th: 1.6, a: (1 - u) * 0.9, keep: (g) => Math.sin(g) < 0, glow: false, rim: C[6] });
      }
    },

    draw(p) {
      const out = smooth(2.3, 2.95, t);
      if (out >= 1) return;
      const a = 1 - out, charge = smooth(0, CHARGE, t) * (1 - smooth(RELEASE, RELEASE + 0.12, t));
      // the floor pool keeps the colour of the note after the light has gone
      p.glow(0, 0, 92, C[4], 0.24 * a * (t < RELEASE ? smooth(0.1, 0.5, t) : 1));
      // the near half of the rings, in front of the mark
      for (const ring of RINGS) {
        const age = since(RELEASE + ring.at);
        if (age < 0 || age > ring.life) continue;
        const u = age / ring.life, r = ease.outQuart(u) * ring.r;
        if (ring.floor) soundRing(p, 0, 0, r, r * 0.2, { C, amp: 2.4, lobes: 10, phase: u * 2, th: 1.6, a: (1 - u) * 1.05, keep: (g) => Math.sin(g) >= 0, glow: false, rim: C[6] });
        else soundRing(p, 0, CORE, r, r * 0.88, { C, amp: 1.8, lobes: 12, phase: u * 3, th: 2.2, a: (1 - u) * 0.75, glow: false });
      }
      // charge: notes spiral in and wink out at the mic
      for (const g of gather) {
        const u = (t - g.t0) / 0.45;
        if (u < 0 || u > 1) continue;
        const r = g.r * (1 - ease.inCubic(u)) + 3, ang = g.a + u * g.spin;
        const x = Math.cos(ang) * r, y = CORE + Math.sin(ang) * r * 0.78;
        if (u < 0.08) continue;
        const fa = 1 - smooth(0.82, 1, u);
        if (u > 0.72) p.glow(x, y, 6, C[5], 0.4 * fa);
        note(p, x, y, { kind: g.kind, s: g.s, C: g.tint, flip: g.flip, a: fa, outline: C[0], glint: g.s > 1 });
        for (let i = 1; i <= 3; i++) {
          const ang2 = ang - i * 0.06, r2 = r + i * 3;
          p.dot(Math.cos(ang2) * r2, CORE + Math.sin(ang2) * r2 * 0.78, C[4], 0.5 - i * 0.1);
        }
      }
      // the microphone: a small bright object at the heart of the light
      if (t < RELEASE) {
        const ma = smooth(0.02, 0.22, t);
        if (ma > 0) {
          p.glow(0, CORE, 26, C[5], 0.4 * ma);
          mic(p, 0, CORE, 2, C, ma);
          const spin = t * 3;
          for (let i = 0; i < 24; i++) {
            const g = spin + (i / 24) * TAU;
            p.dot(Math.cos(g) * 17, CORE + Math.sin(g) * 17, i % 2 ? C[5] : C[3], ma * 0.65);
          }
        }
        if (t > 0.24 && t < RELEASE) eqBars(p, -6, CORE + 30, 5, 5 + 5 * charge, t * 8, C, { a: 0.85 });
      }
      // release: the white hero frame and its ring
      const ra = since(RELEASE);
      if (ra >= 0 && ra < 0.2) {
        // two hero frames: a tiny white core, one fast ring, a star glint; the light does the rest
        const k = 1 - ra / 0.2;
        p.circle(0, CORE, 3 + 3 * k, WHITE);
        p.circle(0, CORE - 1, 1.5 * k, WHITE);
        const rr = 12 + 46 * ease.outQuart(1 - Math.max(0, ra - 0.03) / 0.17);
        soundRing(p, 0, CORE, rr, rr * 0.92, { C, amp: 1.2, lobes: 7, phase: 0.4, th: 2.2, a: k, glow: false });
        sparkle(p, 0, CORE, 5 + 11 * k, WHITE, C[6], 0.45 * k);
        p.glow(0, CORE, 86, WHITE, 0.5 * k);
      }

      // thrown notes: they slow, drift up and fade
      for (const f of fly) {
        const age = since(f.t0);
        if (age < 0 || age > f.life) continue;
        const k = 1 - Math.exp(-age * 2.2), d = f.off + (f.v * k) / 2.2, lift = age * age * 8;
        const x = Math.cos(f.a) * d, y = CORE + Math.sin(f.a) * d * 0.82 - lift;
        const fa = 1 - smooth(f.life * 0.7, f.life, age);
        if (f.trail) {
          for (let i = 1; i <= 5; i++) {
            const a2 = age - i * 0.04;
            if (a2 < 0) continue;
            const k2 = 1 - Math.exp(-a2 * 2.2), d2 = f.off + (f.v * k2) / 2.2;
            p.dot(Math.cos(f.a) * d2, CORE + Math.sin(f.a) * d2 * 0.82 - a2 * a2 * 9, C[4], fa * (0.45 - i * 0.07));
          }
        }
        if (age > 0.04) note(p, x, y, { kind: f.kind, s: f.s, C: f.tint, flip: f.flip, a: fa, outline: C[0], glint: true });
        p.glow(x, y, 8, C[5], 0.14 * fa);
      }
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}
