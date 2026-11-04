// A boss-sized ground attack: the floor cracks and glows for a beat, then a wave of roots tears up across the
// arena. The read is the bright line before the hit; the punish window is the slow retract afterwards.
import { PAL, fit, hex, clamp, lerp, seg, ease, TAU, burst, fly, band, sparkle } from "../../core/index.js";

export const meta = {
  name: "Root Quake",
  desc: "A boss ground attack: a rune splits the floor, the line flashes, and a wave of gnarled root spikes tears up through the arena, throwing dirt and splinters before sinking back.",
  tags: ["boss", "attack", "ground", "roots", "fantasy", "telegraph", "one-shot"],
  kind: "boss-attack",
  size: [320, 180],
  origin: [160, 150],
  duration: 2.8,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.leaf, seed: 1 },
};

export const attack = {
  telegraph: 0.9,
  hits: [{ t: 1.0, amp: 4, shake: 0.45, damage: 120, radius: 136, target: "hero" }],
};

const TELL = 0.9, IMP = 1.0, END = 2.8;
const BARK = ["#040303", "#0e0908", "#1a100c", "#2a1a12", "#3e2718", "#573a22"].map(hex);
const DIRT = ["#17110b", "#2b2116", "#463720", "#66512e", "#8a7046"].map(hex);
const INK = hex("#050304");
const ROOTS = Array.from({ length: 7 }, (_, i) => ({
  x: -120 + i * 40 + (i % 2 ? 4 : -3),
  h: 24 + ((i * 29) % 34),
  w: 8 + (i % 3) * 4,
  lean: (i % 2 ? 1 : -1) * (3 + (i % 3) * 2),
  d: (i % 3) * 0.05,
  seed: 7 + i * 11,
}));

function rootSpike(p, r, h, white, C) {
  if (h < 2) return;
  const x = r.x, w = r.w * (0.7 + h / r.h * 0.35), topX = x + r.lean, topY = -h;
  const left = [[x - w, 1], [x - w * 0.92, -h * 0.18], [x - w * 0.66 + 2, -h * 0.32], [x - w * 0.86 + r.lean * 0.25, -h * 0.5], [x - w * 0.5 + r.lean * 0.5, -h * 0.64], [x - w * 0.6 + r.lean * 0.75, -h * 0.82], [topX - 2, topY + 3]];
  const right = [[topX + 2, topY], [x + w * 0.25 + r.lean * 0.7, -h * 0.76], [x + w * 0.4 + r.lean * 0.4, -h * 0.56], [x + w * 0.72, -h * 0.3], [x + w, 1]];
  const pts = [...left, ...right];
  p.poly(pts, white > 0.5 ? hex("#fff4d0") : BARK[3]);
  if (white <= 0.5) {
    // flat planes: a lit left edge, a deep right edge, two grooves; much cheaper than per-pixel shading
    p.polyline(left, BARK[4], 1);
    p.polyline(left.map(([px, py]) => [px + 1, py]), BARK[5], 1);
    p.polyline(right, BARK[1], 1);
    p.polyline(right.map(([px, py]) => [px - 1, py]), BARK[2], 1);
    for (let k = 0; k < 3; k++) {
      const yy = -h * (0.25 + k * 0.16), xx = x - w * 0.32 + Math.sin(k * 2 + r.seed) * 2;
      p.line(xx, yy, xx + 2, yy - h * 0.1, BARK[1], 0.85);
    }
    // the fork splitting off the trunk
    const fy = -h * 0.55, dir = r.seed % 2 ? 1 : -1, fx = x + dir * w * 0.58;
    p.poly([[fx, fy], [fx + dir * 3, fy - 3], [fx + dir * 9, fy - 10], [fx + dir * 12, fy - 8], [fx + dir * 6, fy - 2], [fx + dir * 2, fy + 2]], BARK[3]);
    p.line(fx, fy, fx + dir * 12, fy - 9, INK, 0.9);
    // moss and a hot crack at the base
    for (let i = 0; i < 5; i++) p.dot(x - w * 0.7 + i * 3, -2 - (i % 2), i % 2 ? C[4] : C[3], 0.7);
    p.line(x - w * 0.4, 0, x - w * 0.1, -6, C[5], 0.9);
  }
  p.polyline(left, INK, 1);
  p.polyline(right, INK, 1);
  // thin root tendrils curling off the top
  for (let i = 0; i < 3; i++) {
    let px = topX + (i - 1) * 2, py = topY - 1;
    for (let k = 0; k < 5; k++) { p.px(px, py, i % 2 ? BARK[4] : BARK[2]); px += i === 1 ? 1 : i === 0 ? -1 : 0; py -= 1; }
  }
  p.glow(x, -h * 0.25, w, C[3], 0.1);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 7), H = hex("#fff8dc"), seed = o.seed ?? 1;
  // the ground darkens before it opens, so the tell reads on any map
  // anticipation: a sigil burns into the floor and a warning line gathers across it
  if (t < IMP + 0.08) {
    const k = seg(t, 0, TELL), pulse = 0.55 + 0.45 * Math.sin(t * (5 + k * 18));
    p.ellipse(0, 2, 146, 12, hex("#050406"), 0.42);
    // the outer seal: two thick broken rings, brighter as it charges
    for (const [R, th] of [[44 + k * 40, 2.4], [32 + k * 26, 1.4]]) {
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * TAU, x = Math.cos(a) * R * 1.18, y = 2 + Math.sin(a) * R * 0.115;
        for (let q = 0; q < th; q += 0.7) p.dot(x + Math.cos(a) * q, y + Math.sin(a) * q * 0.1, i % 8 === 0 ? C[6] : C[4], (0.4 + 0.4 * k) * pulse);
      }
    }
    // eight rune ticks and a central eye
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + k * 0.6, r0 = 22 + k * 24, r1 = r0 + 8;
      p.line(Math.cos(a) * r0 * 1.2, 2 + Math.sin(a) * r0 * 0.12, Math.cos(a) * r1 * 1.2, 2 + Math.sin(a) * r1 * 0.12, C[5], 0.45 + 0.4 * k);
      p.dot(Math.cos(a) * r1 * 1.2, 2 + Math.sin(a) * r1 * 0.12, C[6], 0.5 + 0.5 * k);
    }
    p.line(-6, 2, 0, -4, C[6], 0.55 + 0.4 * k); p.line(0, -4, 6, 2, C[6], 0.55 + 0.4 * k); p.line(-6, 2, 6, 2, C[5], 0.6);
    p.glow(0, 0, 26 + k * 18, C[4], 0.18 + 0.14 * k);
    // veins creeping out beyond the seal
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + 0.3, L = 60 + (i % 4) * 16;
      for (let s = 18; s <= L; s += 2.5) {
        const wob = Math.sin(s * 0.4 + i * 2) * 2.5, x = Math.cos(a) * s + Math.sin(a) * wob, y = 2 + Math.sin(a) * s * 0.1 + Math.cos(a) * wob * 0.25;
        p.dot(x, y, s > L * 0.75 ? C[5] : C[3], (0.25 + 0.3 * k) * pulse);
      }
    }
    if (t > TELL - 0.34) {
      const f = seg(t, TELL - 0.34, TELL);
      for (let x = -148; x <= 148; x += 2) p.dot(x, 0, C[6], f * (0.5 + 0.4 * Math.sin(x * 0.41 + t * 28)));
      p.glowLine(-148, 0, 148, 0, 10, C[4], 0.3 * f);
      for (let i = 0; i < 12; i++) p.disc(-140 + i * 26, -1, 3 + (i % 3) + f * 4, C[2], 0.12 * f);
      // root tips break the surface a moment before the wave
      for (let i = 0; i < 9; i++) {
        const rx = -124 + i * 31, h = f * (3 + (i % 3) * 2);
        p.poly([[rx - 2, 0], [rx, -h], [rx + 2, 0]], BARK[3]);
      }
    }
  }
  // the eruption: a white-hot seam, roots tearing up in a wave, floor shockwaves
  if (t >= IMP) {
    const age = t - IMP;
    const flash = Math.max(0, 1 - age / 0.18);
    if (flash > 0) {
      p.ellipse(0, -4, 150, 32, H, 0.13 * flash);
      p.rect(-150, -2, 300, 4, H, flash * 0.9);
      p.glow(0, -4, 74, C[5], 0.5 * flash);
    }
    for (const [delay, speed, thick] of [[0, 190, 2.2], [0.08, 136, 1.4]]) {
      const rr = (age - delay) * speed;
      if (rr > 0 && rr < 150) {
        const a = Math.max(0, 1 - rr / 150);
        band(p, 0, 1, rr, 0.17, thick, a * 0.75, C);
      }
    }
    ROOTS.forEach((r, i) => {
      const rise = seg(age, r.d, r.d + 0.18), sink = seg(t, 2.12 + i * 0.02, 2.58 + i * 0.02);
      if (rise <= 0 || sink >= 1) return;
      const h = r.h * (0.4 + 0.6 * ease.outCubic(rise)) * (1 - sink * 0.6);
      rootSpike(p, r, h, Math.max(0, 1 - age / 0.22), C);
      for (let k = 0; k < 3; k++) p.line(r.x - 5 - k * 3, 0, r.x - 10 - k * 5, -2 - k, C[3], 0.45 * (1 - sink));
      if (age < 0.4 + r.d) for (let k = 0; k < 2; k++) p.disc(r.x + (k ? 7 : -7), -2 - k * 2, 4 + k * 2 + age * 9, DIRT[2], 0.14 * (1 - age / 0.55));
    });
    // thrown clods and splinters
    burst(40, seed * 17 + 3, (r, i) => {
      const delay = (i % 8) * 0.035, a = -Math.PI / 2 + r.range(-0.85, 0.85), sp = r.range(55, 170), life = r.range(0.5, 1.15);
      const aa = age - delay;
      if (aa < 0 || aa > life) return;
      const [x, y] = fly(r.range(-130, 130), 0, Math.cos(a) * sp, Math.sin(a) * sp, aa, 320, 0.5);
      if (y > 0) return;
      const q = 1 - aa / life, big = i % 4 === 0;
      p.rect(x, y, big ? 2 : 1, big ? 2 : 1, i % 5 === 0 ? BARK[3] : DIRT[3], q);
    });
    // rolling dust, lit on top
    for (let i = 0; i < 7; i++) {
      const x = -126 + i * 42, k = clamp((age - 0.04 * i) / 1.15);
      if (k <= 0 || k >= 0.9) continue;
      p.disc(x + Math.sin(i * 2.3) * 5, -2 - k * 3, 4 + k * 7, DIRT[3], 0.16 * (1 - k));
    }
    if (age < 0.4) {
      for (let i = 0; i < 12; i++) {
        const x = Math.sin(i * 3.1 + seed) * 118, y = -4 - Math.abs(Math.sin(i * 1.7)) * 24;
        p.dot(x, y, i % 2 ? C[5] : C[6], (1 - age / 0.4) * 0.8);
      }
    }
    sparkle(p, -18 + Math.sin(age * 5) * 4, -42, 2 + Math.max(0, 1 - age) * 3, H, C[5], 0.35 * Math.max(0, 1 - age / 1.2));
  }
  // embers and settling dust
  if (t > 1.25) {
    const k = seg(t, 1.25, END);
    for (let i = 0; i < 10; i++) {
      const x = -120 + i * 24 + Math.sin(i * 2.2 + t) * 2, y = -1 - ((t * 9 + i * 7) % 18);
      p.dot(x, y, i % 3 ? C[3] : C[5], (1 - k) * 0.5);
      if (i % 2) p.glow(x, y, 4, C[2], 0.06 * (1 - k));
    }
  }
}
