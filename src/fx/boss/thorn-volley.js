// A three-beat ranged boss attack: three runes mark the floor, then a thorn the size of a spear falls on each in
// turn. The gaps between impacts are the dodge rhythm; the lingering thorns tell the player where not to stand.
import { PAL, fit, hex, clamp, lerp, seg, ease, TAU, fly, sparkle } from "../../core/index.js";

export const meta = {
  name: "Thorn Volley",
  desc: "Three runes burn onto the floor and a rain of giant thorns falls on them one after another, each impact bursting into barbs, splinters and a ring of dust.",
  tags: ["boss", "attack", "ranged", "thorns", "fantasy", "telegraph", "one-shot"],
  kind: "boss-attack",
  size: [320, 180],
  origin: [160, 150],
  duration: 3.2,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: PAL.poison, seed: 1 },
};

export const attack = {
  telegraph: 1.15,
  hits: [
    { t: 1.15, amp: 2.4, shake: 0.3, damage: 65, radius: 42, target: "hero" },
    { t: 1.6, amp: 2.4, shake: 0.3, damage: 65, radius: 42, target: "hero" },
    { t: 2.05, amp: 2.4, shake: 0.3, damage: 65, radius: 42, target: "hero" },
  ],
};

const IMPACTS = [
  { x: -78, at: 1.15, delay: 0 },
  { x: 2, at: 1.6, delay: 0.04 },
  { x: 80, at: 2.05, delay: 0 },
];
const FALL = 0.42, END = 3.2;
const BARK = ["#060504", "#150e0a", "#25170f", "#3a2316", "#55341e", "#764b2a"].map(hex);
const INK = hex("#040306");

function thorn(p, x, y, len, w, ang, C, white = 0, alpha = 1) {
  const cs = Math.cos(ang), sn = Math.sin(ang);
  const rot = (px, py) => [x + px * cs - py * sn, y + px * sn + py * cs];
  const pts = [
    rot(-w, 0), rot(-w * 0.65, -len * 0.32), rot(-w * 0.9, -len * 0.36),
    rot(-w * 0.3, -len * 0.7), rot(-w * 0.38, -len * 0.76), rot(0, -len),
    rot(w * 0.38, -len * 0.76), rot(w * 0.3, -len * 0.7),
    rot(w * 0.9, -len * 0.36), rot(w * 0.65, -len * 0.32), rot(w, 0),
  ];
  p.poly(pts, white > 0.5 ? hex("#fff6d8") : BARK[3], alpha);
  if (white <= 0.5) {
    p.line(...rot(-w * 0.9, 0), ...rot(-w * 0.34, -len * 0.86), BARK[5], alpha);
    p.line(...rot(w * 0.9, 0), ...rot(w * 0.34, -len * 0.86), BARK[1], alpha);
    p.line(...rot(0, -len), ...rot(0.5, -len * 0.9), C[4], alpha);
    for (let i = 0; i < 2; i++) {
      const u = 0.25 + i * 0.3;
      p.line(...rot(-w * 0.55, -len * u), ...rot(w * 0.4, -len * (u + 0.04)), BARK[1], alpha * 0.8);
    }
  }
  p.polyline([rot(-w, 0), rot(-w * 0.3, -len * 0.7), rot(0, -len)], INK, alpha);
  p.polyline([rot(w, 0), rot(w * 0.3, -len * 0.7), rot(0, -len)], INK, alpha);
}

function sigil(p, x, k, hot, C) {
  const R = 26 + 10 * (1 - k), pulse = 0.6 + 0.4 * Math.sin((1 - k) * 22);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * TAU, rr = R * 1.18;
    p.dot(x + Math.cos(a) * rr, 1 + Math.sin(a) * rr * 0.12, i % 8 === 0 ? C[6] : C[4], (0.35 + 0.4 * k) * pulse);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + k * 0.5, r0 = R * 0.55, r1 = R * 0.86;
    p.line(x + Math.cos(a) * r0 * 1.2, 1 + Math.sin(a) * r0 * 0.12, x + Math.cos(a) * r1 * 1.2, 1 + Math.sin(a) * r1 * 0.12, i % 2 ? C[5] : C[3], 0.3 + 0.4 * k);
  }
  p.line(x - 4, 1, x, -4, C[5], 0.4 + 0.4 * k); p.line(x, -4, x + 4, 1, C[5], 0.4 + 0.4 * k);
  p.glow(x, 0, 26, C[4], 0.12 * hot);
  if (hot > 0 && hot < 1) {
    p.circle(x, 1, 3 + hot * 5, hex("#fff4d0"), 0.2 * hot);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 7), H = hex("#fff8dc"), seed = o.seed ?? 1;
  // the three marks are drawn together, then each is consumed in turn
  IMPACTS.forEach((m, i) => {
    const age = t - m.at;
    const tell = seg(t, 0.1 + i * 0.08, m.at);
    if (age < -FALL) {
      sigil(p, m.x, tell, 1, C);
      if (tell > 0.8) {
        for (let k = 0; k < 5; k++) p.disc(m.x + Math.sin(k * 2.1) * 8, -1, 2 + k + tell * 3, C[2], 0.06 * tell);
      }
    } else if (age < 0) {
      // the thorn falls out of the dark ahead of the hit, growing and leaving a thread of light
      const u = clamp(1 + age / FALL), len = 30 + u * 14;
      const y = lerp(-146 + len, -len, ease.outCubic(u)), x = m.x + Math.sin(u * 6 + i) * 3;
      sigil(p, m.x, 1, 1 - u * 0.4, C);
      p.ellipse(m.x, 1, 22 - u * 8, 2.4, C[1], 0.4);
      thorn(p, x, y, len, 3.5 + u * 1.5, Math.PI + Math.sin(u * 2 + i) * 0.08, C, 0);
      for (let k = 0; k < 4; k++) p.dot(x + (k % 2 ? 2 : -2), y + 6 + k * 5, k % 2 ? C[4] : C[3], (1 - u) * 0.7);
      p.glow(x, y, 12, C[4], 0.18);
    } else {
      // impact: a flash, a ring, a crown of thorns thrown out, then the spears left standing
      const k = clamp(age / 0.8), flash = Math.max(0, 1 - age / 0.14);
      const hot = flash > 0;
      if (hot) {
        p.circle(m.x, -2, 5 + flash * 7, H, 0.9);
        p.rect(m.x - 24, -2, 48, 4, H, flash * 0.7);
        p.glow(m.x, -2, 30, C[5], 0.4 * flash);
      }
      if (age < 0.5) {
        const rr = age * 120;
        for (let j = 0; j < 36; j++) {
          const a = (j / 36) * TAU;
          p.dot(m.x + Math.cos(a) * rr, 1 + Math.sin(a) * rr * 0.13, j % 2 ? C[4] : C[5], (1 - age / 0.5) * 0.7);
        }
      }
      // the crown: seven thorns thrown out and left in the floor
      for (let j = 0; j < 7; j++) {
        const a = -Math.PI / 2 + (j - 3) * 0.34 + Math.sin(j * 2.3 + i) * 0.12;
        const grow = ease.outCubic(clamp(age / 0.18));
        const len = (10 + (j % 3) * 6) * grow * (1 - seg(t, 2.5 + i * 0.05, 3.1) * 0.8);
        if (len < 1) continue;
        thorn(p, m.x + Math.cos(a) * (4 + j * 1.5), -1 + Math.sin(a) * (4 + j), len, 2 + (j % 2), a + Math.PI / 2, C, 0, 1 - seg(t, 2.7, 3.15) * 0.9);
      }
      // dust and splinters
      if (age < 0.7) for (let j = 0; j < 3; j++) p.disc(m.x + (j - 1) * 7, -1 - j * 2, 2 + age * 10, C[2], 0.1 * (1 - age / 0.7));
      if (age < 0.2) {
        for (let j = 0; j < 8; j++) {
          const a = -Math.PI + (j / 7) * Math.PI, [x, y] = fly(m.x, -2, Math.cos(a) * 45, Math.sin(a) * 40 - 30, age, 180, 0);
          p.dot(x, y, j % 2 ? C[4] : C[5], 1 - age / 0.2);
        }
      }
      if (age > 0.1 && age < 0.45) sparkle(p, m.x + Math.sin(age * 20) * 3, -10, 2 + (0.45 - age) * 8, H, C[4], 0.3 * (1 - age / 0.45));
    }
  });
  // ash and thorns settling at the centre of the arena
  if (t > 1.2) {
    const k = seg(t, 1.2, END);
    p.glow(0, -2, 60, C[3], 0.06 * (1 - k));
    for (let i = 0; i < 8; i++) {
      const x = -60 + i * 17, y = -1 - ((t * 7 + i * 9) % 10);
      p.dot(x, y, i % 2 ? C[3] : C[4], (1 - k) * 0.35);
    }
  }
}
