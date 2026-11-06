import { Particles, Lights, P, Rng, fit, sparkle, clamp, seg, ease, WHITE, hex } from "../../core/index.js";
import { spell, drawWord, panel, shake } from "./_lib.js";

export const meta = {
  name: "XP bar fill",
  desc: "An XP bar tops up: the level badge pops onto the plate, the bar races for the next level behind a white-hot edge that sheds sparks, then it shines and folds away.",
  tags: ["ui", "xp", "bar", "hud", "progress", "level", "one-shot"],
  size: [208, 76],
  origin: [104, 38],
  duration: 2.45,
  loop: false,
  fps: 30,
  bg: "dark",
  options: {
    palette: ["#2a1405", "#5c3008", "#9a5a0e", "#d48e18", "#f5b92c", "#ffde5e", "#fff4bc", "#ffffff"],
    level: 12,
    total: 1500,
    from: 0.62,
    to: 0.98,
    seed: 4,
  },
};

const PX = -98, PY = -15, PW = 196, PH = 30;
const BX = -60, BY = -5, BW = 150, BH = 12, CELLS = 12;
const OPEN = 0.16, FILL0 = 0.24, FILL1 = 1.16, SHINE = 1.6, FOLD = 2.06, FOLD_END = 2.24;
const BADGE = -80, BS = 24;
const INK = { outline: hex("#0d0a14"), rim: hex("#5a4f74"), top: hex("#2a2338"), body: hex("#211b2d"), low: hex("#15111c") };

const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed), from = clamp(o.from), to = clamp(Math.max(o.to, from));
  const total = Math.max(1, o.total);
  const ps = new Particles({ rng: R, sparks: [C[7], C[6], C[5], C[3]] }), lights = new Lights();
  const lv = spell(String(o.level), "mini"), lw = lv.w * 2;
  let t = 0, burst = false;
  const end = meta.duration - 0.05;
  const valAt = (t) => (t < FILL0 ? from : from + (to - from) * ease.outCubic(seg(t, FILL0, FILL1)));
  return {
    update(dt) {
      t += dt;
      const val = valAt(t), edge = BX + BW * val;
      // sparks shed off the racing edge while the bar fills
      if (t >= FILL0 && t < FILL1 && R.chance(0.55)) {
        ps.spawn(P.SPARK, edge, BY + R.range(1, BH - 1), R.range(-30, 30), R.range(-45, 15), Math.min(R.range(0.12, 0.3), end - t));
        if (R.chance(0.3)) ps.spawn(P.STAR, edge, BY + R.range(0, BH), R.range(-12, 26), R.range(-36, -8), Math.min(R.range(0.25, 0.45), end - t), C[6], R.range(0.5, 1.1));
      }
      if (!burst && t >= FILL1) {
        burst = true;
        lights.add(edge, BY + BH / 2, 24, C[5], 0.75, 0.4);
        lights.add(edge, BY + BH / 2, 12, WHITE, 0.6, 0.12);
        for (let i = 0; i < 16; i++) {
          const an = R.range(-Math.PI, Math.PI), sp = R.range(50, 150);
          ps.spawn(P.STAR, edge, BY + R.range(0, BH), Math.cos(an) * sp * 0.7 - 22, Math.sin(an) * sp * 0.6, R.range(0.22, 0.42), R.pick([C[7], C[6], C[5]]), R.range(0.6, 1.4));
        }
        for (let i = 0; i < 10; i++) ps.spawn(P.SPARK, edge, BY + R.range(0, BH), R.range(-100, 40), R.range(-80, 30), R.range(0.15, 0.3));
      }
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const open = clamp(ease.outBack(seg(t, 0, OPEN), 2) * (1 - ease.inBack(seg(t, FOLD, FOLD_END), 2)), 0, 1);
      if (open <= 0.02) {
        ps.draw(p);
        lights.draw(p);
        return;
      }
      const [jx, jy] = shake(t, 2.5, FILL1, 0.22, o.seed);
      const h = PH * open, py = PY + (PH - h) / 2 + jy, sh = seg(t, SHINE, SHINE + 0.34);
      const shine = sh > 0 && sh < 1 ? PX - 14 + (PW + 34) * ease.inOutSine(sh) : null;
      panel(p, PX + jx, py, PW, h, INK, { r: 4, shine: shine === null ? null : shine + jx });
      if (open < 0.9) {
        ps.draw(p);
        lights.draw(p);
        return;
      }
      const val = valAt(t), edge = BX + BW * val, hot = t >= FILL1 && t < FILL1 + 0.07;

      // the level badge: a gold tile with the number in it
      const bIn = ease.outBack(seg(t, 0.1, 0.26), 1.7);
      if (bIn > 0.02) {
        const bs = BS * bIn, bx = BADGE + jx - bs / 2, by = -bs / 2 + jy;
        panel(p, bx, by, bs, bs, { outline: C[0], rim: hot ? WHITE : C[6], top: C[3], body: C[2], low: C[1] }, { r: 5 });
        if (bIn > 0.9) {
          const items = lv.letters.filter((L) => L.g).map((L) => ({ g: L.g, x: BADGE + jx - lw / 2 + L.x * 2, y: -5 + jy, sx: 2, sy: 2, flash: hot ? 1 : 0 }));
          drawWord(p, items, { fill: [C[3], C[5], C[6]], edge: C[7], under: C[2], outline: C[0], shadow: 0, shine: shine === null ? null : shine, shineY: -12 });
          if (Math.sin(t * 5) > 0.4) sparkle(p, BADGE + 8 + jx, -8 + jy, 1.5, C[7], C[6], 0.35);
        }
        p.glow(BADGE + jx, jy, 18, C[4], hot ? 0.5 : 0.16);
      }

      // the track and the fill: a hard gold ramp, lit on top and deep at the base
      const x0 = BX + jx, y0 = BY + jy;
      p.shade(x0, y0, x0 + BW, y0 + BH, (x, y, q) => {
        const u = (x - x0) / BW, v = y - y0;
        if (u < val) {
          if (hot && u > val - 0.07) return WHITE;
          return v < 1 ? C[6] : v < 3 ? C[5] : v < 6 ? C[4] : v < 9 ? C[3] : C[2];
        }
        return v < 1 ? hex("#332b42") : v < 2 ? hex("#241f30") : hex("#171320");
      });
      // cell dividers over the whole bar, like a segmented HUD bar
      for (let i = 1; i < CELLS; i++) p.rect(x0 + Math.round((BW * i) / CELLS), y0, 1, BH, hex("#0d0a14"));
      // the leading edge: white-hot while it moves, then a clean glint
      if (t >= FILL0) {
        p.rect(x0 + Math.round(BW * val) - 1, y0 - 1, 2, BH + 2, hot ? WHITE : C[7]);
        p.glow(x0 + BW * val, y0 + BH / 2, 9, C[5], t < FILL1 ? 0.5 : 0.22);
        if (t < FILL1 + 0.35) {
          const u = seg(t, FILL1, FILL1 + 0.35);
          p.ring(x0 + BW * val, y0 + BH / 2, 5 + 7 * ease.outCubic(u), 2, C[6], 1 - u);
        }
      }
      // the gold shine of what is already earned
      p.glow(x0 + BW * val * 0.5, y0 + BH / 2, BW * 0.5, C[4], 0.1);

      // header: the XP tag on the left, the count ticking up on the right
      const ty = PY + 3 + jy;
      p.text("XP", x0, ty, hot ? WHITE : C[6]);
      p.text(`${fmt(total * val)} / ${fmt(total)}`, x0 + BW, ty, hot ? WHITE : C[6], { align: "right" });
      if (t < FILL0 && (t * 3) % 1 < 0.35) sparkle(p, x0 + 5, ty - 1, 2, C[7], C[6], 0.4);

      ps.draw(p);
      lights.draw(p);
    },
  };
}
