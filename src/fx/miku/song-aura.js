// A looping idol aura for the miku set: twin teal ribbons rise and wave behind the singer, notes orbit the
// body in a slow carousel, a waveform halo turns above the head and a small stage mark glows at the feet.
import { fit, cycle, TAU, WHITE, band } from "../../core/index.js";
import { MIKU, PINK, note, ribbon, soundRing } from "./_lib.js";

export const meta = {
  name: "Song aura",
  desc: "A looping idol aura: twin teal ribbons rise and wave behind the singer, music notes orbit the body, a waveform halo turns overhead and a small stage mark glows at the feet.",
  tags: ["miku", "aura", "buff", "song", "notes", "ribbon", "loop"],
  size: [96, 128],
  origin: [48, 120],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: MIKU, seed: 39 },
};

const D = meta.duration;

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), ph = t / D;
  // the floor pool and the far half of the stage mark
  p.glow(0, 0, 40, C[4], 0.16 + 0.04 * Math.sin(ph * TAU));
  band(p, 0, 0, 25, 0.2, 0.8, 0.45, C, (g) => Math.sin(g) < 0);
  for (let i = 0; i < 20; i++) {
    const g = (i / 20) * TAU, x = Math.cos(g) * 25, y = Math.sin(g) * 25 * 0.2;
    if (Math.sin(g) > 0.15) continue;
    p.dot(x, y, i % 3 ? C[3] : C[4], 0.55);
  }
  // far ribbons: the twin tails fan out and up, drawn behind the body
  for (const s of [-1, 1]) {
    ribbon(p, s * 7, -36, {
      len: 46 + 3 * Math.sin(ph * TAU + (s > 0 ? 1.2 : 0)), w: 3.6, dir: -Math.PI / 2 - s * 0.32,
      curl: -s * 24, wave: 4, phase: ph * TAU * 2 + (s > 0 ? 1.6 : 0), C, a: 0.9,
    });
    ribbon(p, s * 5, -34, {
      len: 38, w: 2.2, dir: -Math.PI / 2 - s * 0.48, curl: -s * 20, wave: 5,
      phase: ph * TAU * 2 + 2 + (s > 0 ? 1.1 : 0), C, a: 0.55,
    });
  }
  // the back half of the note carousel
  for (let i = 0; i < 6; i++) {
    const a = ph * TAU + (i * TAU) / 6, y = -24 + Math.sin(a) * 3;
    if (Math.sin(a) > -0.1) continue;
    const x = Math.cos(a) * 24;
    note(p, x, y, { kind: i % 3 === 0 ? "beamed" : "eighth", s: i % 3 === 0 ? 1 : 2, C: i % 4 === 3 ? fit(PINK, 6) : C, flip: Math.cos(a) < 0, a: 0.6, outline: C[0], glint: true });
  }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), P2 = fit(PINK, 6), ph = t / D;
  // halo: a waveform ring above the head, turning slowly, with a note holding its centre
  const hy = -50 + Math.sin(ph * TAU) * 1.2, hr = 15 + Math.sin(ph * TAU * 2) * 1.2;
  soundRing(p, 0, hy, hr, 4.2, { C, amp: 1.2, lobes: 7, phase: ph * TAU, th: 1.3, a: 0.6, rim: C[6], glow: false });
  p.glow(0, hy, 26, C[4], 0.18);
  note(p, 0, hy + 1, { kind: "eighth", s: 1, C, a: 0.95, outline: C[0], glint: true });
  p.px(3, hy + 4, P2[4]);
  // sparkles running round the halo
  for (let i = 0; i < 4; i++) {
    const a = ph * TAU * 2 + (i / 4) * TAU, x = Math.cos(a) * hr, y = hy + Math.sin(a) * 4.2;
    p.dot(x, y, i % 2 ? WHITE : C[5], 0.5 + 0.5 * Math.sin(a * 2));
  }
  // the near half of the carousel
  for (let i = 0; i < 6; i++) {
    const a = ph * TAU + (i * TAU) / 6, y = -24 + Math.sin(a) * 3;
    if (Math.sin(a) <= -0.1) continue;
    const x = Math.cos(a) * 24;
    note(p, x, y, { kind: i % 3 === 0 ? "beamed" : "eighth", s: i % 3 === 0 ? 1 : 2, C: i % 4 === 3 ? P2 : C, flip: Math.cos(a) < 0, a: 0.95, outline: C[0], glint: true });
    p.glow(x, y, 7, C[5], 0.12);
  }
  // the near half of the stage mark, with ticks and two small notes sitting on it
  band(p, 0, 0, 25, 0.2, 0.8, 0.6, C, (g) => Math.sin(g) >= 0);
  for (let i = 0; i < 20; i++) {
    const g = (i / 20) * TAU, x = Math.cos(g) * 25, y = Math.sin(g) * 25 * 0.2;
    if (Math.sin(g) <= 0.15) continue;
    p.dot(x, y, i % 3 ? C[4] : WHITE, 0.7);
  }
  for (const s of [-1, 1]) {
    const bx = s * 20 + Math.sin(ph * TAU + s) * 2, by = 4.8 + Math.cos(ph * TAU + s) * 0.6;
    note(p, bx, by, { kind: "tiny", s: 1, C, a: 0.7, outline: C[0] });
  }
  // motes rising off the mark
  cycle(t, D, 7, o.seed, 1.2, (age, life, r) => {
    const k = age / life, a = r.range(0, TAU) + ph * TAU * 0.5, d = 10 + k * 24;
    const x = Math.cos(a) * d, y = -k * 52 + Math.sin(a) * 5;
    p.dot(x, y, k > 0.6 ? C[5] : C[4], Math.sin(k * Math.PI) * 0.8);
    if (k > 0.3 && k < 0.55) p.px(x + 1, y - 1, WHITE);
    p.glow(x, y, 2.5, C[4], 0.1 * Math.sin(k * Math.PI));
  });
  // a slow pulse out of the mark, twice per loop (the beat)
  const beat = (ph * 2) % 1, br = 26 + beat * 9;
  for (let i = 0; i < 24; i++) {
    const g = (i / 24) * TAU, x = Math.cos(g) * br, y = Math.sin(g) * br * 0.2;
    p.dot(x, y, beat < 0.5 ? C[5] : C[4], (1 - beat) * 0.5);
  }
}
