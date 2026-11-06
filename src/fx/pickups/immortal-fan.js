// A painted silk fan that opens and closes on its gilt ribs. The fanning silhouette, wind ribbons and
// drifting leaves follow Sprite Fusion's open-source pickup language
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
import { fit, cycle, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { PAPER, GILT, CINNABAR, JADE } from "./_eastern.js";

export const meta = {
  name: "Immortal fan",
  desc: "A painted silk fan opens above its shadow: gilt ribs catch the light, a mountain-and-cloud painting rides the leaf, wind ribbons curl off the edge, and a red tassel swings below.",
  tags: ["pickup", "fan", "silk", "wind", "eastern", "xianxia", "loop"],
  size: [88, 80],
  origin: [44, 72],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: PAPER, seed: 41 },
};

const HOVER = 27, PIVOT = 15, R = 26, L = new Layer(80, 72), INK = hex("#171008");
const pose = (ph) => ({
  y: -HOVER - 2 * Math.sin(ph * TAU),
  a: 0.1 * Math.sin(ph * TAU + 0.35),
  open: 0.56 + 0.075 * Math.sin(ph * TAU * 2 + 0.5),
});

/** Wind curls leaving the fan's leading edge; they sit behind the silk so the fan stays the read. */
function wind(p, x, y, ph, C) {
  for (let k = 0; k < 3; k++) {
    const t0 = ph * TAU * 2 + k * 1.9, pts = [];
    for (let i = 0; i <= 13; i++) {
      const s = i / 13;
      pts.push([
        x + 13 + k * 1.7 + s * (16 + k * 2) + Math.sin(t0 + s * 5) * 2.5 * s,
        y - 13 + k * 4.4 - s * (9 + k * 2) + Math.cos(t0 + s * 4.2) * 2.2 * s,
      ]);
    }
    p.polyline(pts, C[4], 0.42);
    p.polyline(pts.slice(7).map(([px, py]) => [px, py - 1]), C[6], 0.3);
    const [tx, ty] = pts[pts.length - 1];
    p.glow(tx, ty, 4, C[5], 0.16);
  }
  // a few silk fibres and leaves carried on the gust
  cycle(ph * meta.duration, meta.duration, 5, 41, 0.9, (age, life, r) => {
    const t = age / life, an = r.range(-0.4, 0.8), d = 17 + t * 13;
    const px = Math.cos(an) * d + r.range(-2, 2), py = y - 14 + Math.sin(an) * d * 0.55 + t * 5;
    p.dot(px, py, t < 0.35 ? WHITE : C[5], Math.sin(t * Math.PI) * 0.8);
    p.px(px + 1, py, C[6]);
  });
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), { y } = pose(t / meta.duration), lift = (-y - HOVER + 2) / 4;
  blobShadow(p, 0, 8.5 - lift * 1.4, 0.76 - lift * 0.15);
  pool(p, 0, 0.5, 14, 3.2, C[4], 0.14);
  wind(p, 0, y - 3, t / meta.duration, C);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(GILT, 8), Rr = fit(CINNABAR, 8), J = fit(JADE, 8);
  const T = meta.duration, ph = t / T, { y, a, open } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * cs - v * sn, y + u * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [dx * cs + dy * sn, -dx * sn + dy * cs]; };
  const step = (2 * open) / 6;

  p.glow(0, y - 9, 25, C[4], 0.18 + 0.04 * Math.sin(ph * TAU * 2));
  p.glowRing(0, y - 8, 4, 15, C[5], 0.12);

  L.begin(-40, Math.floor(y) - 44);
  L.fill(-40, Math.floor(y) - 44, 39, Math.floor(y) + 30, (px, py) => {
    const [u, v] = local(px, py);
    const dx = u, dy = v - PIVOT, rr = Math.hypot(dx, dy), ang = Math.atan2(dx, -dy);
    // the two guard sticks below the pivot
    if (v > PIVOT && Math.abs(u) < 1.8 && v < PIVOT + 9) return G[3];
    if (rr > R || Math.abs(ang) > open) return 0;
    // gilt rim and the seven ribs
    if (rr > R - 1.2) return G[5];
    const rib = Math.round((ang + open) / step), ribA = -open + rib * step;
    const ribD = Math.abs(ang - ribA) * rr;
    if (ribD < 0.62) return rr > R - 4 ? G[6] : G[4];
    // silk panels: warmer toward the lit left side, slightly deeper at the outer right
    let idx = 5;
    if (u < -4) idx = 6;
    if (u > 5) idx = 4;
    if (rib % 2 === 0) idx = Math.min(6, idx + 1);
    if (rr > R - 3) idx = 6;
    // a painted mountain ridge in the middle panels, dark enough to read at 1x
    const ridge = R - 9.5 + 2.1 * Math.sin(ang * 11 + 0.8) + 1.1 * Math.sin(ang * 23 + 2.2);
    if (Math.abs(ang) < open * 0.78 && rr > ridge && rr < R - 4.5) {
      const k = rr < ridge + 1.2 ? J[4] : rr > R - 7 ? J[2] : J[1];
      return k;
    }
    // cloud scrolls and a tiny moon daub
    if (Math.abs(rr - 15.5) < 0.7 && Math.abs(ang + 0.16) < 0.18) return C[6];
    if (Math.abs(rr - 18.5) < 0.6 && Math.abs(ang - 0.28) < 0.13) return C[6];
    if (Math.hypot(u + 7.2, v + 5.5) < 2.2) return C[6];
    return C[idx];
  });
  L.outline(INK).draw(p);

  // the gilt rivet at the pivot, two guard tips, and the red tassel
  const [px0, py0] = at(0, PIVOT);
  p.px(px0, py0, G[6]), p.px(px0 - 1, py0, G[4]), p.px(px0, py0 - 1, G[5]);
  for (const s of [-1, 1]) {
    const [ax, ay] = at(s * 2.2, PIVOT + 1), [bx, by] = at(s * 4.2, PIVOT + 10);
    p.line(ax, ay, bx, by, G[4]);
    p.px(bx, by, G[6]);
  }
  const [tx, ty] = at(0, PIVOT + 1);
  p.px(tx, ty, G[5]), p.px(tx, ty + 1, Rr[5]);
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(ph * TAU + 0.6 + i * 0.55) * 1.6;
    const ex = tx + (i - 2) * 1.1 + sway, ey = ty + 4 + 7 + (i % 2) * 1.3;
    p.line(tx + (i - 2) * 0.35, ty + 3, ex, ey, i % 2 ? Rr[5] : Rr[4]);
    p.px(ex, ey, Rr[6]);
  }

  // a sheen crossing the ribs as the fan opens, then the idle glints
  const shine = ((ph * 1.6) % 1) * 2 - 1;
  if (Math.abs(shine) < 0.75) {
    for (let v = -18; v < PIVOT; v++) {
      const [sx, sy] = at(shine * 13, v);
      if (p.get(sx, sy)) p.px(sx, sy, WHITE);
    }
  }
  for (let i = 0; i < 3; i++) {
    const life = 0.35, age = (((t - ((i + 0.4) / 3) * T) % T) + T) % T;
    if (age > life) continue;
    const an = -0.3 + i * 0.45, d = 18 + i * 3, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y - 12 + Math.sin(an) * d * 0.55, Math.round(1.5 * k), i % 2 ? C[6] : WHITE, 0.26 * k);
  }
  cycle(t, T, 5, o.seed, 1, (age, life, r) => {
    const k = age / life, an = r.range(-0.7, 0.7), d = 12 + k * 14;
    const x = Math.cos(an) * d, yy = y - 12 + Math.sin(an) * d * 0.6 + k * 4;
    p.dot(x, yy, k > 0.6 ? C[6] : J[4], Math.sin(k * Math.PI) * 0.75);
    if (k < 0.35) p.px(x + 1, yy, WHITE);
  });
}
