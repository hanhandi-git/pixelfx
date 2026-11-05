import { Particles, Lights, P, Rng, fit, hex, mix, clamp, smooth, ease, TAU, WHITE, sparkle } from "../../core/index.js";

export const meta = {
  name: "Talisman suppression",
  desc: "In a ruined shrine, yellow talismans rise and write themselves in cinnabar, join into a rotating seal, slam down as a taiji shadow, then burn to ash that drifts upward.",
  tags: ["xianxia", "spawn", "talisman", "taiji", "seal", "aoe", "ground", "one-shot"],
  size: [256, 160],
  origin: [128, 124],
  duration: 4.6,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#0A0C14", "#2A3448", "#CFEDF5", "#D9B65A", "#C0392B", "#C9A227", "#F2EDE4", "#FFF3C4"],
    seed: 13,
  },
};

const RISE = 0.6, INK = 1.4, RING = 2.2, PRESS = 2.25, BURN = 2.4, FADE = 3.6;

function glyph(p, x, y, s, c, a = 1) {
  p.line(x - s * 0.45, y - s * 0.7, x + s * 0.35, y + s * 0.62, c, a);
  p.line(x + s * 0.4, y - s * 0.65, x - s * 0.3, y + s * 0.55, c, a);
  p.line(x - s * 0.42, y, x + s * 0.42, y, c, a);
  p.line(x - s * 0.2, y - s * 0.72, x - s * 0.2, y + s * 0.7, c, a * 0.8);
}

function talisman(p, x, y, a, s, C, ink, alpha = 1) {
  const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
  const w = s * 0.62, h = s;
  const pts = [[x + vx * w + ux * h * 0.5, y + vy * w + uy * h * 0.5], [x - vx * w + ux * h * 0.5, y - vy * w + uy * h * 0.5], [x - vx * w - ux * h * 0.5, y - vy * w - uy * h * 0.5], [x + vx * w - ux * h * 0.5, y + vy * w - uy * h * 0.5]];
  p.polyline([...pts, pts[0]], C[3], alpha);
  p.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], C[6], alpha * 0.65);
  const gx = x - ux * h * 0.05, gy = y - uy * h * 0.05;
  glyph(p, gx, gy, s * 0.5, ink ? C[4] : C[1], alpha * (ink ? 1 : 0.42));
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), ps = new Particles({ rng: R, ground: () => 0, sparks: [WHITE, C[7], C[5], C[4]] }), lights = new Lights();
  const papers = Array.from({ length: 18 }, (_, i) => ({ a: (i / 18) * TAU + R.range(-0.09, 0.09), r: R.range(39, 57), s: R.range(7, 12), ph: R.range(0, TAU) }));
  const cracks = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * TAU + R.range(-0.2, 0.2), pts = [[0, 0]]; let r = 6;
    while (r < R.range(34, 57)) { r += R.range(4, 8); pts.push([Math.cos(a + R.range(-0.16, 0.16)) * r, Math.sin(a) * r * 0.22]); }
    return pts;
  });
  let t = 0, pressed = false;
  const floor = (p, k) => {
    p.ellipse(0, 2, 69, 11, C[0], 1); p.ellipse(0, 0, 63, 8, C[1], 0.75);
    for (let i = 0; i < 8; i++) p.polyline(cracks[i], C[0], 0.8);
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + t * 0.05; p.line(Math.cos(a) * 20, Math.sin(a) * 20 * 0.22, Math.cos(a) * 53, Math.sin(a) * 53 * 0.22, C[2], 0.16 * k); }
  };
  return {
    update(dt) {
      t += dt;
      if (t > INK && t < BURN && R.chance(0.3)) {
        const a = R.range(0, TAU), rr = R.range(35, 57), x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.22;
        ps.spawn(P.EMBER, x, y - 2, R.range(-10, 10), -R.range(15, 46), R.range(0.3, 0.7), R.pick([C[4], C[5], C[7]]), R.range(0.7, 1.5));
      }
      if (!pressed && t >= PRESS) {
        pressed = true; lights.add(0, -4, 92, C[5], 0.9, 0.55); lights.add(0, -2, 46, WHITE, 0.95, 0.1);
        for (let i = 0; i < 34; i++) { const a = R.range(0, TAU), sp = R.range(55, 190); ps.spawn(P.EMBER, R.range(-4, 4), -1, Math.cos(a) * sp, Math.sin(a) * sp * 0.35 - R.range(12, 70), R.range(0.3, 0.85), R.pick([C[4], C[5], C[7]]), R.range(0.7, 1.5)); }
      }
      if (t > BURN && t < FADE + 0.5 && R.chance(0.45)) {
        const a = R.range(0, TAU), rr = R.range(10, 60);
        ps.spawn(P.MOTE, Math.cos(a) * rr, -R.range(4, 70), R.range(-8, 8), -R.range(8, 28), R.range(0.45, 1.1), R.pick([C[4], C[5], C[6]]), R.range(0.6, 1.4));
      }
      ps.update(dt); lights.update(dt);
    },
    drawBack(p) {
      if (t >= meta.duration) return;
      const cold = 0.45 + 0.12 * Math.sin(t * 0.7);
      p.line(-128, -92, -89, -96, C[0], 1); p.line(84, -94, 127, -90, C[0], 1);
      p.line(-110, -90, -110, -38, C[1], 0.65); p.line(103, -90, 104, -38, C[1], 0.65);
      for (let i = 0; i < 8; i++) { const x = -120 + i * 34 + Math.sin(i) * 4; p.disc(x, -81 + (i % 3) * 9, 16, C[1], cold * 0.06); }
      floor(p, 0.35);
      if (t < RING) {
        const u = clamp((t - RISE) / (RING - RISE));
        for (const q of papers) {
          const rr = q.r, x = Math.cos(q.a) * rr, y = Math.sin(q.a) * rr * 0.22 - ease.outCubic(u) * 5;
          talisman(p, x, y, q.a + Math.sin(t * 2 + q.ph) * 0.08, q.s, C, t > INK, 0.55 + 0.35 * u);
        }
      }
    },
    draw(p) {
      if (t >= meta.duration) return;
      const floorK = 1 - smooth(FADE, meta.duration, t);
      floor(p, floorK);
      if (t >= RISE && t < RING + 0.08) {
        const u = clamp((t - RISE) / (RING - RISE));
        for (const q of papers) {
          const ringA = q.a + t * 0.42, rr = q.r * (1 - 0.08 * u), x = Math.cos(ringA) * rr, y = -69 + Math.sin(ringA) * rr * 0.28;
          talisman(p, x, y, ringA + Math.PI / 2, q.s * (0.92 + 0.12 * u), C, t > INK, 0.72 + 0.28 * u);
          if (t > INK) p.glow(x, y, 6, C[4], 0.12 + 0.2 * u);
        }
      }
      if (t >= INK && t < RING) {
        const u = clamp((t - INK) / (RING - INK));
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * TAU + t * 0.42, x = Math.cos(a) * 48, y = -69 + Math.sin(a) * 13;
          p.line(x, y, x + Math.cos(a) * 13, y + Math.sin(a) * 4, i % 3 ? C[5] : C[7], (0.3 + 0.7 * u) * (i % 2 ? 0.55 : 1));
        }
      }
      if (t >= RING && t < FADE) {
        const ringFade = t > PRESS ? 1 - smooth(3.0, 3.55, t) : 1;
        p.ellipse(0, -69, 61, 7, C[0], 0.28 * ringFade);
        for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU + t * 0.5, x = Math.cos(a) * 53, y = -69 + Math.sin(a) * 13; p.line(x, y, x + Math.cos(a) * 5, y + Math.sin(a) * 2, i % 4 ? C[5] : C[7], 0.8 * ringFade); }
        for (const q of papers) { const a = q.a + t * 0.42, x = Math.cos(a) * q.r, y = -69 + Math.sin(a) * q.r * 0.28; talisman(p, x, y, a + Math.PI / 2, q.s, C, t < BURN, ringFade); }
      }
      if (t >= PRESS) {
        const k = t < PRESS + 0.08 ? 1 : 1 - smooth(PRESS + 0.08, PRESS + 0.4, t);
        const taiji = 44 * (0.85 + 0.15 * ease.outBack(clamp((t - PRESS) / 0.2), 1.4));
        p.polyline([[-taiji, 0], [-taiji * 0.45, -taiji * 0.12], [0, 0], [taiji * 0.45, taiji * 0.12], [taiji, 0]], C[3], 0.88 * (0.5 + k * 0.5));
        p.polyline([[-taiji * 0.7, 2], [-taiji * 0.25, 0.18], [taiji * 0.25, -0.18], [taiji * 0.7, -2]], C[1], 0.88 * (0.5 + k * 0.5));
        p.line(-taiji * 0.72, 0, taiji * 0.72, 0, C[5], 0.5 * k); p.glow(0, 0, taiji * 0.48, C[5], 0.12 * k);
        if (t < PRESS + 0.2) sparkle(p, 0, -2, 14 * k, WHITE, C[5], 0.7);
      }
      if (t >= BURN) {
        const k = 1 - smooth(FADE, meta.duration, t);
        for (let i = 0; i < papers.length; i++) {
          const q = papers[i], a = q.a + t * 0.18, x = Math.cos(a) * q.r * 0.92, y = -69 + Math.sin(a) * q.r * 0.25;
          const gone = smooth(BURN + (i % 5) * 0.06, BURN + 0.45 + (i % 5) * 0.06, t);
          if (gone < 1) talisman(p, x, y - gone * 4, a + Math.PI / 2, q.s * (1 - gone * 0.35), C, false, (1 - gone) * k);
          for (let j = 0; j < 2; j++) { const ax = x + (j ? -1 : 1) * (j + 1) * 2, ay = y - 5 - (t - BURN) * (9 + j * 4) - i * 0.15; p.dot(ax, ay, j ? C[6] : C[5], k * 0.55); }
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
