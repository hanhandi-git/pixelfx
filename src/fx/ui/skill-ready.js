import { Particles, Lights, P, Rng, fit, sparkle, seg, ease, TAU, WHITE, hex } from "../../core/index.js";
import { spell, drawWord, panel, shake } from "./_lib.js";

export const meta = {
  name: "Skill ready",
  desc: "A hotbar skill's cooldown unwinds to the last second, then the slot flashes white, fires a ring of light and pops READY underneath with a clean shine.",
  tags: ["ui", "skill", "cooldown", "hotbar", "hud", "ready", "text", "one-shot"],
  size: [136, 140],
  origin: [68, 66],
  duration: 2.6,
  loop: false,
  fps: 30,
  bg: "dark",
  options: {
    palette: ["#061624", "#0d3048", "#155878", "#1f8ca8", "#35c4d8", "#8aeeff", "#d6ffff", "#ffffff"],
    seconds: 3,
    word: "READY",
    seed: 11,
  },
};

const TOP = -Math.PI / 2, SX = 0, SY = -16, HALF = 24;
const READY_T = 1.3, WORD = 1.34, SHINE = 1.82, FADE0 = 2.34, FADE1 = 2.56;
const INK = { outline: hex("#0d0a14"), rim: hex("#5a4f74"), top: hex("#2a2338"), body: hex("#211b2d"), low: hex("#15111c") };

// a lightning bolt, scaled about its middle: the skill's icon
function boltPts(cx, cy, k) {
  return [[5, -14], [-7, -1], [-1, -1], [-5, 14], [7, 0], [1, 0]].map(([x, y]) => [cx + x * k, cy + y * k]);
}

function inside(pts, x, y) {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// the skill's icon: a hard-edged bolt, dim while cooling, lit and white-hot when ready
function sigil(p, C, cx, cy, a, hot, lit) {
  p.ring(cx, cy, 17, 1, hot ? WHITE : lit ? C[4] : C[1], a);
  for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) p.dot(cx + dx * 13.5, cy + dy * 13.5, hot ? WHITE : lit ? C[5] : C[2], a);
  const V = boltPts(cx, cy, 1);
  p.poly(boltPts(cx, cy, 1.16), C[0], a);
  p.shade(cx - 14, cy - 15, cx + 14, cy + 15, (x, y, o) => {
    if (!inside(V, x + 0.5, y + 0.5)) return;
    o.a = a;
    if (hot) return WHITE;
    if (!lit) return !inside(V, x - 1, y - 1) ? C[3] : C[2];
    if (!inside(V, x - 1, y - 1)) return C[6];
    if (!inside(V, x + 1, y + 1)) return C[3];
    return C[5];
  });
  if (lit) {
    p.dot(cx + 1, cy - 11, WHITE, a);
    p.dot(cx + 2, cy - 10, WHITE, a);
    p.dot(cx - 2, cy + 10, C[6], a);
  }
  p.glow(cx, cy, 18, hot ? C[5] : lit ? C[3] : C[2], (hot ? 0.8 : lit ? 0.24 : 0.1) * a);
}

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
  const word = spell(o.word, "big"), ww = word.w, seconds = Math.max(1, Math.round(o.seconds));
  const rays = Array.from({ length: 10 }, (_, i) => [(i / 10) * TAU + R.range(-0.06, 0.06), 12 + R.range(0, 16)]);
  let t = 0, fired = false;
  const end = meta.duration - 0.05;
  return {
    update(dt) {
      t += dt;
      if (!fired && t >= READY_T) {
        fired = true;
        lights.add(SX, SY, 70, C[5], 0.8, 0.5);
        lights.add(SX, SY, 34, WHITE, 0.8, 0.14);
        for (let i = 0; i < 22; i++) {
          const an = R.range(0, TAU), sp = R.range(50, 150);
          ps.spawn(P.STAR, SX + Math.cos(an) * 18, SY + Math.sin(an) * 18, Math.cos(an) * sp, Math.sin(an) * sp * 0.7 - 20, Math.min(R.range(0.25, 0.5), end - t), R.pick([C[7], C[6], C[5]]), R.range(0.6, 1.4));
        }
        for (let i = 0; i < 12; i++) ps.spawn(P.SPARK, SX, SY, R.range(-120, 120), R.range(-110, 40), Math.min(R.range(0.15, 0.35), end - t));
      }
      // after it is ready, clean motes drift up off the slot
      if (t > READY_T + 0.2 && t < FADE0 && R.chance(0.08)) ps.spawn(P.STAR, SX + R.range(-18, 18), SY + R.range(-6, 18), R.range(-6, 6), -R.range(8, 22), Math.min(R.range(0.3, 0.5), end - t), C[6], R.range(0.4, 0.8));
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const a = 1 - seg(t, FADE0, FADE1);
      if (a <= 0.01) {
        ps.draw(p);
        lights.draw(p);
        return;
      }
      const [jx, jy] = shake(t, 2.2, READY_T, 0.22, o.seed);
      const drop = t < 0.2 ? -22 * (1 - ease.outCubic(t / 0.2)) : 0;
      const dy = drop + jy, cx = SX + jx, cy = SY + dy, f = Math.max(0, 1 - seg(t, 0, READY_T));
      const hot = t >= READY_T && t < READY_T + 0.06, ready = t >= READY_T;

      // the slot: a bevelled frame, a recessed well and four corner notches
      const fx = cx - HALF, fy = cy - HALF;
      const shp = seg(t, READY_T + 0.08, READY_T + 0.4), slotShine = shp > 0 && shp < 1 ? -HALF - 6 + (HALF * 2 + 12) * ease.inOutSine(shp) : null;
      panel(p, fx, fy, HALF * 2, HALF * 2, hot ? { ...INK, rim: WHITE, outline: C[1], top: C[1] } : INK, { r: 5, a, shine: slotShine === null ? null : slotShine + cx });
      p.shade(cx - 20, cy - 20, cx + 20, cy + 20, (x, y, q) => {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d > 20) return;
        q.a = a;
        if (d > 19) return C[1];
        return d > 8 ? hex("#0c1726") : hex("#091120");
      });
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const nx = cx + sx * (HALF - 3), ny = cy + sy * (HALF - 3);
        p.line(nx, ny, nx - sx * 3, ny, ready ? C[6] : C[1], a);
        p.line(nx, ny, nx, ny - sy * 3, ready ? C[6] : C[1], a);
      }

      sigil(p, C, cx, cy, a, hot, ready);
      if (ready && t < READY_T + 0.4) {
        const u = seg(t, READY_T, READY_T + 0.3);
        p.ring(cx, cy, 20 + 26 * ease.outCubic(u), 2, u < 0.2 ? WHITE : C[6], a * (1 - u));
        for (const [an, len] of rays) {
          const r0 = 24, r1 = 24 + len * ease.outCubic(u);
          p.line(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0, cx + Math.cos(an) * r1, cy + Math.sin(an) * r1, (v) => (v < 0.3 ? WHITE : C[5]), (v) => a * (1 - u) * (1 - v * 0.5));
        }
        p.glow(cx, cy, 34, C[4], 0.5 * (1 - u) * a);
      }

      // the cooldown: the dark wedge leaves clockwise from the top, with its lit edge and the seconds left
      if (f > 0.002) {
        const edge = TOP + TAU * (1 - f);
        p.shade(cx - 20, cy - 20, cx + 20, cy + 20, (x, y, q) => {
          const dx = x + 0.5 - cx, dyv = y + 0.5 - cy;
          let an = Math.atan2(dyv, dx) - TOP;
          an -= Math.floor(an / TAU) * TAU;
          if (an < TAU * (1 - f)) return;
          q.a = a * (0.62 + 0.26 * Math.min(1, Math.hypot(dx, dyv) / 20));
          return hex("#04080f");
        });
        p.arc(cx, cy, 18, 2, edge, TOP + TAU, (u) => (u < 0.05 ? WHITE : C[4]), a * Math.min(1, f * 6));
        p.line(cx, cy, cx + Math.cos(edge) * 17, cy + Math.sin(edge) * 17, WHITE, a * 0.9);
        p.dot(cx + Math.cos(edge) * 18.5, cy + Math.sin(edge) * 18.5, WHITE, a);
        p.glow(cx + Math.cos(edge) * 18, cy + Math.sin(edge) * 18, 12, C[5], 0.4 * a);
        // the seconds: a white number that pops as it changes
        const n = Math.max(1, Math.ceil(f * seconds)), u = t - READY_T * (1 - n / seconds);
        const sc = 2.7 + 0.8 * Math.exp(-u * 32);
        const num = spell(String(n), "big"), nx = cx - (num.w * sc) / 2, ny = cy - (7 * sc) / 2;
        const items = num.letters.filter((L) => L.g).map((L) => ({ g: L.g, x: nx + L.x * sc, y: ny, sx: sc, sy: sc, a }));
        drawWord(p, items, { fill: [C[4], C[5], WHITE], edge: WHITE, under: C[3], outline: INK.outline, shadow: 0 });
      }

      // READY: the word pops out of the slot, flashes, then a shine crosses it
      if (t >= WORD) {
        const ws = 0.55 + 0.45 * ease.outBack(seg(t, WORD, WORD + 0.2), 1.9), flash = t < WORD + 0.05;
        const sh = seg(t, SHINE, SHINE + 0.3), shine = sh > 0 && sh < 1 ? -ww + 2 * ww * ease.inOutSine(sh) : null;
        const items = word.letters.filter((L) => L.g).map((L) => ({ g: L.g, x: cx + (-ww + 2 * L.x) * ws, y: 27 - 7 * ws, sx: 2 * ws, sy: 2 * ws, a, flash: flash ? 1 : 0 }));
        drawWord(p, items, { fill: [C[3], C[4], C[6]], edge: WHITE, under: C[2], outline: INK.outline, shadow: 0, shine, shineY: 26 });
        if (sh > 0 && sh < 1) sparkle(p, cx - ww + 2 * ww * ease.inOutSine(sh), 28, 3, C[7], C[6], 0.5);
        // two ticks flick out beside the word as it lands
        const u = seg(t, WORD, WORD + 0.22);
        if (u < 1) for (const sd of [-1, 1]) {
          const x0 = cx + sd * (ww + 4 + 10 * u), L = 6 * (1 - u);
          p.line(x0, 28, x0 + sd * L, 28, (v) => (v < 0.4 ? WHITE : C[5]), (v) => a * (1 - u) * (1 - v));
        }
      }
      ps.draw(p);
      lights.draw(p);
    },
  };
}
