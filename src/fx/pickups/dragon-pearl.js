// A dragon pearl: a white orb held in a coiling qi-dragon. The orbit, cloud puffs and scale highlights
// borrow the pickup library's comet/ribbon language; the pearl is a small shaded sphere in its own layer.
import { fit, rand, cycle, TAU, WHITE, hex } from "../../core/index.js";
import { Layer, glint, blobShadow, pool } from "./_lib.js";
import { JADE, GILT, CINNABAR } from "./_eastern.js";

export const meta = {
  name: "Dragon pearl",
  desc: "A white dragon pearl turns inside a coiling qi-dragon: jade scales catch the light, gold horns trail cloud, lightning curls off the orb, and its reflection breathes on the floor.",
  tags: ["pickup", "dragon", "pearl", "orb", "eastern", "xianxia", "loop"],
  size: [80, 80],
  origin: [40, 72],
  duration: 3,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: JADE, seed: 43 },
};

const HOVER = 26, PY = -26, RR = 6.6, ORB = 16, PL = new Layer(18, 18);
const INK = hex("#050d12");
const pose = (ph) => ({ y: -HOVER - 1.6 * Math.sin(ph * TAU) });

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), { y } = pose(t / meta.duration), lift = (-y - HOVER + 1.6) / 4;
  blobShadow(p, 0, 10 - lift * 1.4, 0.8 - lift * 0.16);
  pool(p, 0, 0.5, 16, 3.4, C[4], 0.18);
  // a vertical reflection under the pearl
  for (let i = 0; i < 5; i++) {
    const k = i / 4, x = Math.sin(i * 2.1 + t) * 2.2;
    p.dot(x, 0, C[5], 0.25 * (1 - k));
    if (i < 3) p.glow(x, 0, 5, C[4], 0.06);
  }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), G = fit(GILT, 8), R = fit(CINNABAR, 8);
  const T = meta.duration, ph = t / T, { y } = pose(ph);
  const py = y + PY, head = ph * TAU + 0.72;
  p.glow(0, py, 24, C[4], 0.22 + 0.05 * Math.sin(ph * TAU * 2));
  p.glowRing(0, py, 4, 15, C[5], 0.14);

  // the coiling body: sample behind the head, then split the ring into a back and a front pass
  const segs = [];
  for (let j = 0; j <= 15; j++) {
    const th = head - j * 0.19;
    const rr = ORB + 2 * Math.sin(th * 2 + ph * TAU * 2);
    segs.push({
      x: Math.cos(th) * rr,
      y: py + Math.sin(th) * rr * 0.62,
      th, j,
      w: Math.max(0.7, 2.8 - j * 0.14),
      front: Math.sin(th) >= 0,
    });
  }
  const back = segs.filter((s) => !s.front), front = segs.filter((s) => s.front);

  const drawBody = (list, frontPass) => {
    for (let k = list.length - 1; k >= 0; k--) {
      const s = list[k], n = list[k + 1] || list[k - 1];
      if (!n) continue;
      const tx = s.x - n.x, ty = s.y - n.y, tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl;
      const cTop = s.j > 12 ? C[4] : frontPass ? C[6] : C[5];
      const cMid = s.j > 12 ? C[3] : frontPass ? C[4] : C[3];
      // dark underlay first keeps the coil readable where cloud and pearl overlap
      p.line(s.x + nx * 0.7, s.y + ny * 0.7, n.x + nx * 0.7, n.y + ny * 0.7, C[1]);
      p.line(s.x, s.y, n.x, n.y, cMid);
      p.line(s.x - nx * 0.6, s.y - ny * 0.6, n.x - nx * 0.6, n.y - ny * 0.6, cTop);
      if (s.w > 1.5) p.line(s.x + nx * 1.3, s.y + ny * 1.3, n.x + nx * 1.3, n.y + ny * 1.3, C[2]);
      if (s.j % 3 === 1) p.px(s.x - nx * 0.8, s.y - ny * 0.8, s.j % 2 ? G[5] : C[6]);
      if (s.j % 5 === 2) {
        p.dot(s.x + nx * 1.8, s.y + ny * 1.8, C[2], 0.6);
        p.dot(s.x - nx * 1.8, s.y - ny * 1.8, C[5], 0.5);
      }
      // a low cloud curl under every third joint
      if (s.j % 4 === 0 && s.j < 13) {
        p.disc(s.x + nx * 2.6, s.y + ny * 2.6, 3.2, C[3], 0.16);
        p.disc(s.x + nx * 2.6, s.y + ny * 2.6, 1.6, C[5], 0.1);
      }
    }
  };
  drawBody(back, false);

  // the pearl: a small sphere, its cool rim and a hot white window on the upper left
  const light = [-0.45, -0.6, 0.66], ll = Math.hypot(...light);
  PL.begin(-9, -9);
  PL.fill(-9, -9, 8, 8, (px, py2) => {
    const u = px, v = py2, d = Math.hypot(u, v);
    if (d > RR) return 0;
    const nz = Math.sqrt(Math.max(0, 1 - (d / RR) ** 2));
    const b = (u * light[0] + v * light[1] + nz * light[2]) / ll;
    if (d > RR - 1.0) return C[4];
    if (Math.hypot(u + 2.3, v + 2.5) < 1.25) return WHITE;
    if (Math.hypot(u + 2.3, v + 2.5) < 2.2) return C[6];
    return b > 0.85 ? C[6] : b > 0.55 ? C[5] : b > 0.15 ? C[4] : C[2];
  });
  PL.outline(INK).draw(p, 0, py);
  // a faint gold meridian and a bright crown on the orb
  const [cx0, cy0] = [0, py - RR + 0.5];
  p.px(cx0, cy0, G[6]), p.px(cx0 - 1, cy0, G[4]);
  p.ring(0, py - RR - 4, 2.0, 1, R[3], 0.9);
  p.px(0, py - RR - 6, R[5]);
  glint(p, -2.6, py - 3.4, 1.2, C[6], 0.3);

  drawBody(front, true);

  // the head: a short horned skull, a whisker curl and a red mane at the leading end
  const h = segs[0], n = segs[1];
  const dx = h.x - n.x, dy = h.y - n.y, tl = Math.hypot(dx, dy) || 1;
  const tx = dx / tl, ty = dy / tl, nx = -ty, ny = tx;
  const HS = 1.1, Hp = (u, v) => [h.x + u * HS * tx + v * HS * nx, h.y + u * HS * ty + v * HS * ny];
  p.poly([Hp(-2, -2.2), Hp(3.6, -2.7), Hp(6.4, -0.2), Hp(3.2, 2.2), Hp(-2, 1.9)], INK);
  p.poly([Hp(-1.5, -1.5), Hp(3.2, -2), Hp(5.6, 0), Hp(3, 1.7), Hp(-1.5, 1.5)], C[4]);
  p.poly([Hp(3.1, -1.4), Hp(6.4, 0), Hp(3, 1.2)], C[5]);
  p.px(...Hp(4.8, -0.5), WHITE);
  p.px(...Hp(2.2, -0.9), G[6]);
  p.px(...Hp(2.2, 0.9), C[2]);
  // horns and mane
  p.line(...Hp(-0.8, -1.4), ...Hp(-3.6, -4.2), G[4]);
  p.line(...Hp(-0.8, -1.4), ...Hp(-2.6, -4.8), G[5]);
  p.line(...Hp(-0.8, 1.4), ...Hp(-3.6, 4.0), G[3]);
  for (let i = 0; i < 3; i++) {
    const [mx, my] = Hp(-1.5 - i * 1.2, -0.6 + i * 0.9);
    p.line(...Hp(-1.2, -0.4 + i * 0.8), mx, my, i % 2 ? R[4] : G[3]);
  }
  // two whiskers, each a stepped curl, and a gold claw under the jaw
  for (const s of [-1, 1]) {
    let [wx, wy] = Hp(4.6, s * 0.7);
    for (let i = 1; i <= 5; i++) {
      const u = 4.6 + i * 1.4, v = s * (0.7 + i * 0.55 + Math.sin(ph * TAU * 2 + i * 0.8) * 0.5);
      const [ex, ey] = Hp(u, v);
      p.line(wx, wy, ex, ey, i > 3 ? G[3] : R[4]);
      wx = ex, wy = ey;
    }
  }
  p.line(...Hp(1.2, 1.6), ...Hp(2.6, 3.9), G[5]);
  p.line(...Hp(2.6, 3.9), ...Hp(1.8, 3.6), G[6]);

  // two short bolts from the pearl to the coil, timed to the pulse
  const bolt = Math.max(0, Math.sin(ph * TAU * 3 + 0.7)) ** 4;
  if (bolt > 0.08) {
    for (const off of [0.55, -1.35]) {
      const a0 = head + off, [sx, sy] = [Math.cos(a0) * RR, py + Math.sin(a0) * RR];
      const ex = Math.cos(a0 + 0.24) * (ORB - 1), ey = py + Math.sin(a0 + 0.24) * (ORB - 1) * 0.62;
      let x0 = sx, y0 = sy;
      for (let i = 1; i <= 4; i++) {
        const k = i / 4, jx = Math.sin(i * 7 + ph * TAU * 6) * (1 - k) * 2.2;
        const x1 = sx + (ex - sx) * k + jx, y1 = sy + (ey - sy) * k + jx * 0.35;
        p.line(x0, y0, x1, y1, i === 4 ? WHITE : C[6], 0.55 + 0.45 * bolt);
        x0 = x1, y0 = y1;
      }
      p.glow(ex, ey, 5, C[6], 0.2 * bolt);
    }
  }

  // jade and gold dust orbiting the coil
  cycle(t, T, 7, o.seed, 1.1, (age, life, r) => {
    const k = age / life, a = r.range(0, TAU) + ph * TAU * 0.55, d = 11 + k * 13;
    const x = Math.cos(a) * d, yy = py + Math.sin(a) * d * 0.55 + k * 3;
    p.dot(x, yy, k > 0.6 ? C[6] : k > 0.3 ? G[4] : C[4], Math.sin(k * Math.PI) * 0.85);
    p.glow(x, yy, 2.5, C[5], 0.12 * (1 - k));
  });
  for (let i = 0; i < 4; i++) {
    const life = 0.34, age = (((t - ((i + 0.3) / 4) * T) % T) + T) % T;
    if (age > life) continue;
    const an = rand(i, o.seed, 2) * TAU, d = 12 + rand(i, o.seed, 3) * 7, k = Math.sin((age / life) * Math.PI);
    glint(p, Math.cos(an) * d, py + Math.sin(an) * d * 0.6, Math.round(1.5 * k), i % 2 ? C[6] : WHITE, 0.24 * k);
  }
}
