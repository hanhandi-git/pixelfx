// A bundle of jade writing slips, bound in red cord. The fanned slats, gilt inscriptions and seal follow
// the eastern pickup language; the hover, shadow and motes are the library's standard pickup support.
import { fit, cycle, rand, TAU, WHITE, hex, mix } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { JADE, GILT, CINNABAR } from "./_eastern.js";

export const meta = {
  name: "Jade slip",
  desc: "A bundle of jade writing slips fans open on its red binding: gilt characters light down each slat, a cinnabar seal catches the last scripture, and cold motes drift from the text.",
  tags: ["pickup", "jade", "slip", "scroll", "scripture", "eastern", "xianxia", "loop"],
  size: [72, 88],
  origin: [36, 80],
  duration: 2.8,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: JADE, seed: 42 },
};

const HOVER = 31, TOP = -14, W = 4.6, H = 26, N = 6, L = new Layer(64, 76), INK = hex("#061015");
const pose = (ph) => ({
  y: -HOVER - 1.8 * Math.sin(ph * TAU),
  a: 0.06 * Math.sin(ph * TAU + 0.3),
  spread: 0.06 + 0.035 * (0.5 + 0.5 * Math.sin(ph * TAU * 2 + 0.4)),
});

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), { y } = pose(t / meta.duration), lift = (-y - HOVER + 1.8) / 4;
  blobShadow(p, 0, 9 - lift * 1.3, 0.78 - lift * 0.15);
  pool(p, 0, 0.5, 14, 3.2, C[4], 0.15);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(GILT, 8), R = fit(CINNABAR, 8);
  const T = meta.duration, ph = t / T, { y, a, spread } = pose(ph);
  const cs = Math.cos(a), sn = Math.sin(a);
  const at = (u, v) => [u * cs - v * sn, y + u * sn + v * cs];
  const local = (px, py) => { const dx = px, dy = py - y; return [dx * cs + dy * sn, -dx * sn + dy * cs]; };
  const sheen = -16 + 32 * ((ph * 1.35) % 1);

  p.glow(0, y - 8, 24, C[4], 0.2 + 0.05 * Math.sin(ph * TAU * 2));
  p.glowRing(0, y - 8, 4, 14, C[5], 0.13);

  L.begin(-32, Math.floor(y) - 38);
  // draw the outer slats first, the middle pair last, so the bundle reads as a shallow fan
  const order = [0, 5, 1, 4, 2, 3];
  for (const i of order) {
    const ix = i - (N - 1) / 2, ang = ix * spread;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const x0 = ix * 6.6;
    L.fill(-32, Math.floor(y) - 38, 31, Math.floor(y) + 28, (px, py) => {
      const [u, v] = local(px, py), dx = u - x0, dy = v - TOP;
      const su = dx * ca + dy * sa, sv = -dx * sa + dy * ca;
      if (Math.abs(su) > W / 2 || sv < 0 || sv > H) return 0;
      // rounded top and a slightly chipped foot
      if (sv < 1 && Math.abs(su) > W / 2 - (1 - sv)) return 0;
      if (sv > H - 1.4 && Math.abs(su) > W / 2 - (sv - (H - 1.4))) return 0;
      const edge = Math.abs(su) > W / 2 - 0.75;
      const lit = (-su * 0.55 - sv * 0.45) / Math.max(1, Math.hypot(su, sv));
      let k = ix < 0 ? 4 : ix > 0 ? 3 : 4;
      if (sv < 3) k = 5;
      if (sv > H - 3) k = Math.max(2, k - 1);
      if (edge) k = lit > 0 ? 5 : 2;
      // a cold crack/vein down the outer slats
      if (Math.abs(su - 0.9) < 0.35 && sv > 5 && sv < 21 && i % 2) k = Math.min(6, k + 1);
      // the inscribed column: a spine, crossbars and a little seal near the foot
      const glyph = (Math.abs(su) < 0.45 && sv > 6 && sv < 19)
        || (Math.abs(sv - 8) < 0.4 && Math.abs(su) < 1.2)
        || (Math.abs(sv - 13) < 0.4 && Math.abs(su) < 1.35)
        || (Math.abs(sv - 17.5) < 0.4 && Math.abs(su) < 0.95);
      if (i === 2 && Math.abs(su) < 1.55 && sv > 21.1 && sv < 23.3) {
        if (Math.abs(su) > 0.85 || Math.abs(sv - 22.2) < 0.4) return R[3];
        return C[2];
      }
      if (glyph) {
        const glint = Math.abs(sv - sheen) < 1.2;
        const warm = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(sv * 0.7 - ph * TAU * 2 + i));
        return glint ? C[6] : mix(G[3], G[5], warm);
      }
      // the moving sheen runs across the whole bundle, then a gold cap at the crown
      if (Math.abs(u - sheen) < 0.4) return C[5];
      if (sv < 1.2) return G[3];
      return C[Math.max(2, Math.min(5, k))];
    });
  }
  L.outline(INK).draw(p);

  // the red binding across the crown, its knot and the hanging tassel
  const [lx, ly] = at(-10, TOP + 2.5), [rx, ry] = at(10, TOP + 2.5);
  p.line(lx, ly, rx, ry, R[3]);
  p.line(lx, ly + 1, rx, ry + 1, R[2], 0.8);
  for (let i = 0; i < 3; i++) {
    const [gx, gy] = at(-7 + i * 7, TOP + 2.5);
    p.px(gx, gy, G[6]), p.px(gx, gy - 1, G[4]);
  }
  const [kx, ky] = at(0, TOP + 2.5);
  p.px(kx, ky, R[5]), p.px(kx - 1, ky + 1, R[3]), p.px(kx + 1, ky + 1, R[4]);
  const [cx, cy] = at(0, TOP - 2);
  p.ring(cx, cy, 2.1, 1, R[3], 0.9);
  p.px(cx, cy - 2, R[5]);

  const [bx, by] = at(0, H + 0.3);
  p.px(bx, by, G[6]), p.px(bx, by + 1, G[4]);
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(ph * TAU + 0.5 + i * 0.6) * 1.7;
    const ex = bx + (i - 2) * 0.9 + sway, ey = by + 4 + 5 + (i % 2) * 1.0;
    p.line(bx + (i - 2) * 0.3, by + 2, ex, ey, i % 2 ? R[5] : R[4]);
    p.px(ex, ey, R[6]);
  }

  // a star on the binding and cold dust off the open leaves
  const beat = 0.5 + 0.5 * Math.sin(ph * TAU * 2 + 0.8);
  if (beat > 0.5) glint(p, kx, ky - 2, 1.2 + 1.5 * beat, G[6], 0.25 * beat);
  for (let i = 0; i < 4; i++) {
    const life = 0.4, age = (((t - ((i + 0.35) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 7) * TAU, d = 10 + rand(i, o.seed, 8) * 6, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, y - 4 + Math.sin(an) * d * 0.6, Math.round(1.4 * k), i % 2 ? C[6] : WHITE, 0.24 * k);
  }
  cycle(t, T, 6, o.seed, 0.9, (age, life, r) => {
    const k = age / life, an = r.range(-0.9, 0.9), d = 10 + k * 12;
    const x = Math.cos(an) * d, yy = y - 7 + Math.sin(an) * d * 0.55 + k * 4;
    p.dot(x, yy, k > 0.6 ? C[6] : G[4], Math.sin(k * Math.PI) * 0.75);
  });
}
