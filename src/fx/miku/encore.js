// The set's finale: a teal concert stage built from spotlights, a waveform floor mark, a bank of equaliser
// lights, twin-tail ribbons and a neon 39, all dropping on one white downbeat.
import { Particles, Lights, P, Rng, fit, band, sparkle, flare, clamp, smooth, ease, rand, TAU, WHITE } from "../../core/index.js";
import { MIKU, PINK, note, ribbon, soundRing, mic } from "./_lib.js";

export const meta = {
  name: "Encore",
  desc: "A full-stage encore: spotlights sweep over a waveform floor mark, equaliser lights and ribbons rise, a neon 39 ignites on the downbeat, then notes and confetti burst on the stage.",
  tags: ["miku", "idol", "stage", "encore", "ultimate", "screen", "one-shot"],
  size: [320, 180],
  origin: [160, 150],
  duration: 4.2,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: MIKU, seed: 39 },
};

const D = meta.duration, DROP = 0.82, FIN = 3.5;

export function create(o) {
  const C = fit(o.palette, 8), P2 = fit(PINK, 6), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 0, sparks: [C[7], C[6], C[5], P2[4]], haze: C[4] });
  const lights = new Lights();
  // confetti: hard little squares, teal, pink and white, falling from above the stage
  const confetti = Array.from({ length: 34 }, () => ({
    x: R.range(-138, 138), y: R.range(-148, -10), vy: R.range(26, 58), sway: R.range(4, 14), ph: R.range(0, TAU),
    c: R.pick([C[6], C[5], C[4], P2[3], P2[4], WHITE]), w: R.range(1, 2) > 1.6 ? 2 : 1, spin: R.range(0.5, 1.5),
  }));
  // notes drifting through the light
  const drift = Array.from({ length: 12 }, () => ({
    x: R.range(-130, 130), y: R.range(-128, -20), vy: R.range(10, 26), sway: R.range(3, 9), ph: R.range(0, TAU),
    s: R.range(1, 2) > 1.5 ? 2 : 1, kind: R.chance(0.3) ? "beamed" : "eighth", flip: R.chance(0.5), c: R.chance(0.18) ? P2 : C,
  }));
  // the burst of notes on the downbeat
  const burst = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI + 0.2 + (i / 9) * (Math.PI - 0.4);
    return { a, v: R.range(42, 88), s: i % 4 === 0 ? 3 : 2, life: R.range(1.4, 2.1), c: i % 6 === 4 ? P2 : C };
  });
  let t = 0, hit = false;

  return {
    update(dt) {
      t += dt;
      if (t >= DROP && !hit) {
        hit = true;
        lights.add(0, -30, 92, C[4], 1, 0.8);
        lights.add(0, -30, 52, WHITE, 0.9, 0.2);
        for (let i = 0; i < 40; i++) {
          const a = R.range(0, TAU), sp = R.range(55, 185);
          ps.spawn(P.SPARK, 0, -30, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.3, 0.55), R.pick([C[6], C[5], P2[4]]), 1);
        }
        for (let i = 0; i < 14; i++) {
          const a = R.range(-Math.PI, 0), sp = R.range(30, 90);
          ps.spawn(P.FLAKE, 0, -24, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 1.8), R.chance(0.5) ? WHITE : C[6], R.range(0.6, 1.4));
        }
        for (let i = 0; i < 10; i++) {
          const a = R.range(-Math.PI, 0), sp = R.range(30, 80);
          ps.spawn(P.MOTE, 0, -30, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1, 1.6), C[5], R.range(0.8, 1.4));
        }
      }
      if (t > DROP && t < DROP + 1.4 && R.chance(0.4)) {
        const a = R.range(-Math.PI, 0), d = R.range(30, 110);
        ps.spawn(P.STAR, Math.cos(a) * d, Math.sin(a) * d * 0.25 - R.range(0, 10), 0, -R.range(3, 12), R.range(0.4, 0.9), R.chance(0.6) ? C[5] : P2[4], R.range(0.7, 1.4));
      }
      ps.update(dt);
      lights.update(dt);
    },

    drawBack(p) {
      const out = smooth(FIN, D - 0.05, t);
      if (out >= 1) return;
      const a = 1 - out, on = smooth(0.1, 0.4, t), ph = t / D;
      // the room: a broad cool glow off the back of the stage
      p.glow(0, -24, 80, C[2], 0.16 * a * on);
      // the stage mark: a wide waveform ellipse with ticks, drawing itself on like a light rig
      const draw = smooth(0.04, 0.5, t);
      if (draw > 0) {
        band(p, 0, 0, 118, 0.2, 1.6, 0.5 * draw * a, C, (g) => Math.sin(g) < 0);
        band(p, 0, 0, 92, 0.2, 1, 0.3 * draw * a, C, (g) => Math.sin(g) < 0);
        for (let i = 0; i < 20; i++) {
          const g = (i / 20) * TAU, x = Math.cos(g) * 118, y = Math.sin(g) * 118 * 0.2;
          if (Math.sin(g) > 0) continue;
          p.dot(x, y, i % 2 ? C[4] : C[6], 0.6 * draw * a);
        }
        // light stands on the far rim of the stage
        for (let i = 0; i < 14; i++) {
          const g = (i / 14) * TAU, x = Math.cos(g) * 112, y = Math.sin(g) * 112 * 0.2;
          if (Math.sin(g) > -0.5) continue;
          p.dot(x, y, C[6], 0.5 * draw * a);
          p.glow(x, y, 6, C[4], 0.14 * draw * a);
        }
      }
      // two spotlight beams from behind the stage, sweeping across the roof
      const sweep = Math.sin(ph * TAU) * 14;
      for (const s of [-1, 1]) {
        const from = [s * 148, -148], to = [s * (20 + sweep * 0.4), -14];
        p.glowLine(from[0], from[1], to[0], to[1], 40, C[3], 0.16 * on * a);
        p.glowLine(from[0], from[1], to[0], to[1], 16, C[4], 0.18 * on * a);
        p.line(from[0], from[1], to[0], to[1], C[5], 0.06 * on * a);
      }
      // the twin-tail ribbons climb from the stage and curl out under the lights
      const rage = t - 0.2;
      if (rage > 0) {
        const u = clamp(rage / 2.2), fa = smooth(0, 0.5, rage) * a;
        for (const s of [-1, 1]) {
          ribbon(p, s * 4, -6, {
            len: 70 + 58 * ease.outCubic(u), w: 4, dir: -Math.PI / 2 - s * 0.38, curl: s * (26 + 22 * u),
            wave: 5, phase: t * 1.1 + (s > 0 ? 1.8 : 0), C, a: 0.65 * fa, accent: P2[3], accent2: P2[4],
          });
        }
      }
      // equaliser lights standing on the floor, behind the mark: a small wall of sound
      for (let i = 0; i < 17; i++) {
        const x = -80 + i * 10, v = 0.2 + 0.8 * Math.abs(Math.sin(ph * TAU * 2 + i * 1.3) * Math.cos(ph * TAU + i * 0.7));
        const hh = 1 + Math.round(18 * v * (t > DROP ? 1 : smooth(0.15, 0.7, t) * 0.5));
        for (let j = 0; j < hh; j++) p.dot(x, -2 - j, j > hh - 3 ? WHITE : j > hh * 0.5 ? C[5] : C[3], 0.55 * a);
      }
      // confetti and notes behind the sign
      drawFall(p, confetti, t, a, true);
    },

    draw(p) {
      const out = smooth(FIN, D - 0.05, t);
      if (out >= 1) return;
      const a = 1 - out, ph = t / D;
      // the near half of the stage mark
      const draw = smooth(0.04, 0.5, t);
      for (let i = 0; i < 20; i++) {
        const g = (i / 20) * TAU, x = Math.cos(g) * 118, y = Math.sin(g) * 118 * 0.2;
        if (Math.sin(g) <= 0) continue;
        p.dot(x, y, i % 2 ? C[4] : C[6], 0.7 * draw * a);
      }
      // spotlight beams from the near corners, crossing over the stage
      const sweep = Math.sin(ph * TAU + 1.2) * 12;
      for (const s of [-1, 1]) {
        const from = [s * 170, -30], to = [s * 8 + sweep, -88];
        p.glowLine(from[0], from[1], to[0], to[1], 26, C[4], 0.1 * a * smooth(0.15, 0.6, t));
      }
      // centre stage: a mic on a stand, lit from the left, with a halo behind the capsule
      const micOn = smooth(0.2, 0.5, t) * a;
      if (micOn > 0) {
        const hy2 = -47;
        p.glow(0, hy2, 30, C[5], 0.16 * micOn);
        for (let i = 0; i < 26; i++) {
          const g = (i / 26) * TAU + t * 0.5, x = Math.cos(g) * 18, y = hy2 + Math.sin(g) * 5;
          p.dot(x, y, i % 4 ? C[4] : C[6], 0.5 * micOn * (0.6 + 0.4 * Math.sin(ph * TAU * 2 + i)));
        }
        // the stand: a dark stem with a mint edge and a tripod foot
        for (let y = -28; y <= -2; y++) {
          p.dot(-1, y, C[1], micOn);
          p.dot(0, y, C[3], micOn);
          p.dot(1, y, C[2], micOn);
        }
        for (const s2 of [-1, 0, 1]) p.line(0, -2, s2 * 7, 1, C[2], micOn);
        p.disc(0, 0, 9, C[1], 0.5 * micOn);
        for (let i = -5; i <= 5; i++) p.dot(i, -1 - Math.round(Math.abs(i) * 0.15), C[3], 0.6 * micOn);
        mic(p, 0, hy2, 2, C, micOn);
        // a hot rim and a small pink LED on the capsule
        for (let y = -53; y <= -39; y++) p.dot(-3, y, C[6], 0.8 * micOn);
        p.px(2, -42, P2[3]);
      }
      // the neon 39: a dark shadow, a mint face and a wide teal halo; it flickers on before the drop
      const signOn = smooth(0.45, 0.75, t) * a;
      if (signOn > 0) {
        const flick = t > 0.45 && t < DROP ? (rand(Math.floor(t * 34), 5) > 0.18 ? 1 : 0.25) : 1;
        const pulse = 0.85 + 0.15 * Math.sin(ph * TAU * 2);
        const x = 0, y = -122 + Math.sin(t * 0.9) * 1.2;
        p.glow(x, y + 32, 58, C[4], 0.34 * signOn * flick * pulse);
        p.glow(x, y + 32, 34, C[5], 0.22 * signOn * flick * pulse);
        p.text("39", x + 2, y + 2, C[1], { font: "big", scale: 4, align: "center", a: signOn * 0.7 });
        p.text("39", x, y, C[6], { font: "big", scale: 4, align: "center", a: signOn * flick });
        p.text("39", x, y, C[7], { font: "big", scale: 4, align: "center", a: signOn * flick * 0.35 });
        // a thin underline of light
        const w = 34 * signOn;
        for (let i = -w; i <= w; i++) p.dot(x + i, y + 34, Math.abs(i) < w * 0.6 ? WHITE : C[5], 0.8 * signOn * flick);
      }
      // the downbeat: white core, shock ring, rising wall of light
      const age = t - DROP;
      if (age >= 0 && age < 0.45) {
        const u = age / 0.45, w = 1 - u;
        soundRing(p, 0, 0, 14 + 126 * ease.outQuart(u), (14 + 126 * ease.outQuart(u)) * 0.2, { C, amp: 2.6, lobes: 12, phase: u * 2, th: 2.6, a: w, rim: C[7], glow: false });
        if (age < 0.16) {
          const k = 1 - age / 0.16;
          p.circle(0, -30, 4 + 5 * k, WHITE);
          sparkle(p, 0, -30, 10 + 16 * k, WHITE, C[6], 0.5 * k);
          flare(p, 0, -30, 40 * k, k, C);
          p.glow(0, -30, 80, WHITE, 0.5 * k);
        }
        // a wall of teal light lifts off the floor
        for (let i = 0; i < 60; i++) {
          const x = -150 + i * 5, h = 60 * w * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.7)));
          p.dot(x, -h - u * 30, C[4], w * 0.5);
          if (i % 3 === 0) p.dot(x, -h - u * 30 + 1, C[5], w * 0.4);
        }
      }
      // notes thrown out from the drop, and the slow drifting ones
      for (const f of burst) {
        if (age < 0 || age > f.life) continue;
        const d = f.v * age * (1 - 0.25 * age), x = Math.cos(f.a) * d, y = Math.max(-134, -30 + Math.sin(f.a) * d * 0.8 - age * age * 8);
        const fa = 1 - smooth(f.life * 0.65, f.life, age);
        note(p, x, y, { kind: "eighth", s: f.s, C: f.c, flip: Math.cos(f.a) < 0, a: fa, outline: C[0], glint: true });
        p.glow(x, y, 8, C[5], 0.12 * fa);
      }
      drawFall(p, drift, t, a, false);
      drawFall(p, confetti, t, a, false);
      // the singer's spot: a soft column of light at centre stage through the whole performance
      const spot = smooth(0.3, 0.8, t) * a;
      if (spot > 0) {
        p.glowLine(0, -150, 0, -4, 22, C[4], 0.16 * spot);
        p.glow(0, -6, 36, C[5], 0.18 * spot);
      }
      ps.draw(p, "front");
      lights.draw(p);
    },
  };
}

// falling confetti and drifting notes; `back` draws the pieces whose turn is to pass behind the sign
function drawFall(p, list, t, a, back) {
  for (let i = 0; i < list.length; i++) {
    const f = list[i], isNote = !!f.kind;
    if (!!((i + (isNote ? 1 : 0)) % 3 === 0) !== back) continue;
    const age = t - 0.1;
    if (age < 0) continue;
    const y = f.y + age * f.vy;
    if (y > (isNote ? 18 : 26)) continue;
    const x = f.x + Math.sin(age * f.spin + f.ph) * f.sway;
    const fa = a * smooth(0.1, 0.4, age) * (isNote ? 0.8 : 1);
    if (isNote) note(p, x, y, { kind: f.kind, s: f.s, C: f.c, flip: f.flip, a: fa, outline: f.c[0], glint: true });
    else {
      const w = f.w;
      p.rect(x, y, w, 2, f.c, fa);
      if (w > 1) p.rect(x, y, 1, 2, WHITE, fa * 0.5);
    }
  }
}
