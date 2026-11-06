// 爆裂魔法 · what the blow leaves. A burned bowl in the ground, ringed by blocks of cracked, charred stone, its
// seams still glowing, three thin columns of smoke climbing off it, embers crawling along the cracks and ash
// drifting down, until its own smoke rolls in and swallows the scar. Ground-burn and ramp helpers adapted from
// Sprite Fusion's open-source explosion (MIT License, Copyright (c) 2026 Hugo Duprez).
import { Particles, P, PF, Rng, fit, clamp, smooth, rand, TAU, WHITE, hex } from "../../core/index.js";
import { fireRamp, heatRamp, drawPs, scorch, pool, stone, cull } from "../explosions/_lib.js";
import { CRIMSON, ASH } from "./_lib.js";

const END = 6.5, RX = 106, RY = 27, ROWS = 5;

export const meta = {
  name: "Explosion crater",
  desc: "The blow's scar: a burned bowl ringed with charred cracked stone, seams still glowing, smoke columns climbing off it, embers crawling, until the smoke swallows it.",
  tags: ["konosuba", "explosion", "crater", "aftermath", "ground", "smoke", "ember", "one-shot"],
  size: [360, 190],
  origin: [180, 148],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: CRIMSON, stone: "#514667", seed: 21 },
};

const SM = ASH.map(hex), HOLE = hex("#0a0710"), HOLE2 = hex("#150f1c");

export function create(o) {
  const F = fit(o.palette, 8), FR = fireRamp(F), HR = heatRamp(FR), R = new Rng(o.seed), st = stone(o.stone);
  const ps = new Particles({ rng: R, ground: () => 0, sparks: [F[7], F[6], F[4]] });
  // the rim: blocks heaved up round the hole, heaped highest and most broken where the blast threw them
  const rim = [];
  for (let i = 0; i < 54; i++) {
    const a = (i / 54) * TAU + R.range(-0.04, 0.04), d = RX * R.range(0.96, 1.1);
    rim.push({
      a, x: Math.cos(a) * d, y: Math.sin(a) * d * (RY / RX), s: R.range(2.4, 5.8), tilt: R.range(-1, 1),
      heat: R.range(0.15, 1) * (R.chance(0.45) ? 1 : 0.35), far: Math.sin(a) < -0.15,
    });
  }
  // the seams: polylines running out from the heart of the hole, brightest now and cooling
  const cracks = [];
  for (let i = 0; i < 13; i++) {
    const a0 = R.range(0, TAU), pts = [{ x: Math.cos(a0) * RX * R.range(0.03, 0.12), y: Math.sin(a0) * RY * R.range(0.03, 0.12) }];
    let a = a0 + R.range(-0.6, 0.6), x = pts[0].x, y = pts[0].y;
    for (let j = 0, n = R.int(3, 6); j < n; j++) {
      a += R.range(-0.55, 0.55);
      const step = R.range(6, 13);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step * (RY / RX) * R.range(0.5, 1.2);
      if ((x / (RX * 1.02)) ** 2 + (y / (RY * 1.06)) ** 2 > 1) break;
      pts.push({ x, y });
    }
    if (pts.length > 1) cracks.push({ pts, hot: R.range(0.55, 1), cool: R.range(1.8, 3.6) });
  }
  // charcoal lumps and half-buried stones inside the bowl, so the hole has a floor and not a void
  const chars = [];
  for (let i = 0; i < 54; i++) {
    const a = R.range(0, TAU), d = Math.sqrt(R.range(0, 0.86));
    chars.push({ x: Math.cos(a) * RX * d, y: RY * d * Math.sin(a), s: R.range(0.8, 2.6), hot: R.range(0, 1) });
  }
  // smoke: thin columns off separate seams, each with its own rate and lean
  const vents = [
    { x: -RX * 0.44, y: -2, rate: 5.5, rise: [26, 44], sz: [3.4, 5.6], until: 4.6, lean: -7 },
    { x: RX * 0.14, y: -3, rate: 4.4, rise: [34, 56], sz: [4.4, 7.2], until: 5.2, lean: 3 },
    { x: RX * 0.54, y: -1, rate: 3.4, rise: [22, 40], sz: [2.8, 4.6], until: 4.0, lean: 10 },
  ];
  let t = 0;

  return {
    update(dt) {
      t += dt;
      // embers crawl out of the seams and wink out
      if (t < 3.6 && R.chance(28 * (1 - smooth(2, 3.6, t)) * dt)) {
        const c = R.pick(cracks), q = R.pick(c.pts);
        ps.spawn(P.EMBER, q.x + R.range(-1, 1), q.y, R.range(-7, 7), -R.range(6, 24), R.range(0.7, 1.7), F[4]);
      }
      for (const v of vents) {
        if (t < v.until && R.chance(v.rate * dt)) {
          const k = 1 - smooth(v.until - 1.2, v.until, t);
          ps.spawn(P.SMOKE, v.x + R.range(-4, 4), v.y, v.lean * 0.5 + R.range(-3, 3), -R.range(v.rise[0], v.rise[1]) * (0.8 + 0.4 * k),
            R.range(2.2, 3.6), R.pick([SM[1], SM[2], SM[2], SM[3]]), R.range(v.sz[0], v.sz[1]), 0, PF.BIG);
        }
      }
      // sparks popping out of the hottest seams
      if (t < 2.8 && R.chance(24 * (1 - t / 2.8) * dt)) {
        const c = R.pick(cracks), q = R.pick(c.pts);
        ps.spawn(P.SPARK, q.x, q.y - 0.5, R.range(-30, 30), -R.range(24, 70), R.range(0.3, 0.8));
      }
      // ash drifting down, then a low bank of dust rolling in to close the frame
      if (t < 5.0 && R.chance(10 * dt)) ps.spawn(P.FLAKE, R.range(-150, 150), R.range(-92, -40), R.range(-5, 5), R.range(3, 12), R.range(2.4, 3.4), R.pick([SM[0], SM[1], F[3]]), R.range(0.6, 1.1));
      if (t > 4.0 && t < END - 0.3 && R.chance(18 * dt)) {
        const s = R.sign();
        ps.spawn(P.VAPOUR, s * R.range(30, 150), R.range(-7, -1), -s * R.range(8, 26), -R.range(1, 6), R.range(1.6, 2.6), st.dust, R.range(8, 12));
      }
      ps.update(dt);
      // ash that has reached the floor stops being ash; nothing lives outside the canvas
      for (let i = ps.list.length - 1; i >= 0; i--) if (ps.list[i].k === P.FLAKE && ps.list[i].y > 0.5) ps.list.splice(i, 1);
      cull(ps, -176, -144, 176, 40);
    },

    drawBack(p) {
      const fade = 1 - smooth(END - 1.6, END - 0.15, t);
      if (fade <= 0) return;
      const heat = Math.pow(clamp(1 - t / 4.6), 1.3);
      burn(p, HR, t, fade);
      lip(p, st, FR, true, heat, fade);
      // the far rim, dimmer than the near one, and the smoke standing behind it
      for (const r of rim) if (r.far) chunk(p, r, st, FR, heat, fade * 0.72);
      drawPs(p, ps, "back", FR);
      pool(p, 0, 1, RX * 1.6, 34, F[4], 0.1 * heat * fade);
    },

    draw(p) {
      const fade = 1 - smooth(END - 1.6, END - 0.15, t);
      if (fade <= 0) return;
      const heat = Math.pow(clamp(1 - t / 4.6), 1.3);
      // the bowl's floor: charcoal and stones half sunk in the soot
      for (const c of chars) {
        const w = Math.max(1, c.s * 0.9);
        p.rect(c.x - w, c.y, w * 2, Math.max(1, c.s * 0.7), st.shade, fade * 0.9);
        p.rect(c.x - w, c.y, w * 1.1, 1, st.body, fade * 0.75);
        if (heat > 0.3 && c.hot > 0.86) p.dot(c.x, c.y, FR[Math.min(8, Math.floor((1 - heat) * 7) + 1)], fade);
      }
      // the seams in the floor, and the molten heart cooling to a dull red
      for (const c of cracks) {
        const h = c.hot * Math.pow(clamp(1 - t / c.cool), 1.4) * fade;
        if (h > 0.05) {
          seam(p, c.pts, FR, h);
          if (h > 0.35) p.glow(c.pts[0].x, c.pts[0].y, 26, F[4], 0.12 * h);
        }
      }
      const heart = Math.pow(clamp(1 - t / 3.4), 1.5) * fade;
      if (heart > 0.02) {
        const c = FR[Math.min(8, Math.floor((1 - heart) * 7) + 1)];
        p.disc(0, -1, 9 + 5 * heart, c, heart * 0.85);
        p.disc(0, -1, 4 + 3 * heart, heart > 0.55 ? WHITE : F[7], heart * 0.7);
        p.glow(0, -2, 46, F[4], 0.34 * heart);
      }
      // the near rim, in front of the hole and catching the last of the light
      lip(p, st, FR, false, heat, fade);
      for (const r of rim) if (!r.far) chunk(p, r, st, FR, heat, fade);
      drawPs(p, ps, "front", FR);
    },
  };
}

// the burned floor: the blast's scorch under a darker bowl, its lip dithered into the stone around it
function burn(p, HR, t, fade) {
  scorch(p, HR, t + 0.7, RX * 0.95, 3.6, fade, ROWS);
  p.shade(-RX * 1.02, -RY * 1.05, RX * 1.02, RY * 1.05, (x, y, out) => {
    const d = Math.hypot(x / RX, (y - 0.5) / RY);
    if (d > 1) return;
    // deepest at the heart, dithered out to the lip so the hole does not read as a pasted ellipse
    if (d < 0.52) { out.c = HOLE; out.a = 1; }
    else if (d < 0.82) { out.c = HOLE2; out.a = 1 - (d - 0.52) * 1.15; }
    else { out.c = HOLE; out.a = (1 - d) * 2.6; }
  });
}

// the lip of the hole: a continuous line of broken stone round the bowl, so the crater reads by its edge at 1x.
// The near half is lit and two rows thick; the far half is a single dim row.
function lip(p, st, FR, far, heat, fade) {
  const N = Math.round(RX * 2.6);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU, x = Math.cos(a) * RX, y = Math.sin(a) * RY + 0.5;
    const back = Math.sin(a) < -0.15;
    if (back !== far) continue;
    const k = rand(i, 9);
    const c = k > 0.86 ? st.light : k > 0.4 ? st.body : st.shade;
    p.dot(x, y, c, fade * (far ? 0.75 : 1));
    if (!far) {
      p.dot(x, y + 1, k > 0.5 ? st.body : st.shade, fade * 0.9);
      if (k > 0.93 && heat > 0.25) p.dot(x, y, FR[Math.min(8, Math.floor((1 - heat) * 7) + 1)], fade);
    }
  }
}

// one block of the rim: a squat stepped stone, lit on its upper left, its base sunk into the scorch
function chunk(p, r, st, FR, heat, fade) {
  const s = r.s, x = r.x, y = r.y, w = s * (0.85 + 0.3 * r.tilt), h = s * 0.85, top = y - h * 0.5;
  // the shadow it throws first, so the block sits on the floor rather than in it
  p.rect(x - w * 0.9, y + h * 0.34, w * 1.8, 1.4, HOLE, fade * 0.5);
  p.rect(x - w, top, w * 2, h, st.body, fade);
  p.rect(x - w, top, w * 2, Math.max(1, h * 0.3), st.light, fade * 0.8);
  p.rect(x - w * 0.55, top - 1, w * 1.1, 1, st.light, fade * 0.55);
  p.rect(x - w, y + h * 0.34, w * 2, Math.max(1, h * 0.16), st.shade, fade);
  if (heat > 0.08 && r.heat > 0.32) {
    const c = FR[Math.min(8, Math.floor((1 - Math.min(1, heat * r.heat)) * 7) + 1)];
    p.dot(x - w * 0.35, y, c, fade);
    p.dot(x + w * 0.2, top + 1, c, fade * 0.7);
    if (r.heat > 0.8) p.glow(x, y - 1, 7, c, 0.14 * heat);
  }
}

// a glowing seam: a 2 px line with a hotter 1 px core, cooling as it runs out from the heart
function seam(p, pts, FR, h) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], u = i / (pts.length - 1), f = 1 - u * 0.5;
    const c = FR[Math.min(8, Math.floor((1 - h * f) * 8))];
    p.line(a.x, a.y, b.x, b.y, c, Math.min(1, h * f * 1.4));
    if (h * f > 0.5) p.line(a.x, a.y + 1, b.x, b.y + 1, c, h * f * 0.5);
    if (h * f > 0.62) p.dot(b.x, b.y, WHITE, h * f * 0.5);
  }
}
