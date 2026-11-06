// 爆裂魔法 · Explosion. The signature blow of the crimson archmage: a beat of chant, a needle of blood-red light
// over the target, then a white-out and a rayed crimson star that caves into a rolling crown of fire, throwing
// rocks and dust across the field and leaving the ground burning. The blast recipe (fire puffs that cool into
// smoke, sparks, embers, brands, grit, rocks, scorch, rings) is adapted from Sprite Fusion's open-source explosion
// (https://www.spritefusion.com/pixel-art-vfx/explosion), MIT License, Copyright (c) 2026 Hugo Duprez.
import { Particles, Bits, Lights, Blazes, P, PF, B, Rng, fit, band, flare, sparkle, clamp, smooth, ease, TAU, WHITE, hex, mix } from "../../core/index.js";
import { fireRamp, heatRamp, drawPs, draft, cull, scorch, rock, pool, trail, stone, Plume, Column } from "../explosions/_lib.js";
import { CRIMSON, ASH, SEAL, floorSeal, blastStar, blastRays, rune } from "./_lib.js";

const GATHER = 0.92, FLASH = 1.0, END = 9;
const RAD = 34, POWER = 1.6, EARTH = 2.1;

export const meta = {
  name: "Explosion",
  desc: "The chant closes to a needle of blood-red light, the frame goes white, and a rayed crimson star tears into a rolling crown of fire, rock and burning ground, cooling to ash.",
  tags: ["konosuba", "explosion", "crimson", "ultimate", "spell", "debris", "ground", "one-shot"],
  size: [460, 340],
  origin: [230, 300],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: CRIMSON, stone: "#4a3f5a", seed: 5 },
};

// smoke over a crimson blast, lit on top to sooty underneath
const SM = ASH.map(hex);
// the air is torn three times: the main blow, then two smaller crowns thrown off it
const BLASTS = [
  { t: FLASH, x: 0, y: -18, rad: RAD, power: POWER, main: true },
  { t: FLASH + 0.16, x: -46, y: -58, rad: 19, power: 0.9 },
  { t: FLASH + 0.31, x: 42, y: -74, rad: 17, power: 0.8 },
];

export function create(o) {
  const F = fit(o.palette, 8), FR = fireRamp(F), HR = heatRamp(FR), st = stone(o.stone), R = new Rng(o.seed), floor = () => 0;
  const WARM = mix(F[3], F[5], 0.4);
  const [W, H] = meta.size, [OX, OY] = meta.origin, X0 = -OX + 4, X1 = W - OX - 4, Y0 = -OY + 4, Y1 = H - OY - 4;
  let blazes;
  const ps = new Particles({ rng: R, ground: floor, sparks: [F[7], F[6], F[4], F[3]], onLand: (x, y) => blazes.add(x, y - 0.25, R.range(3, 4.4), R.range(0.7, 1.25)) });
  blazes = new Blazes(ps);
  const rocks = new Bits({ ground: floor }), lights = new Lights(), flashes = [], rings = [];
  // the crown: a wide rolling fireball that climbs off the ground and cools from white-hot fire into smoke
  const plume = new Plume(R, {
    x: 0, y: -30, rise: 130, tau: 1.3, drift: 4.5, tube: [11, 27], ring: [2, 34], grow: 1.2, n: 48, size: [8, 13], swell: 0.8,
    spin: 2.8, spinTau: 1.9, heat: 1.3, cool: 0.4, under: 0.55, tilt: 0.2, squash: 0.66, fade: [5.4, 7.8], spread: 30,
  });
  plume.onFray = (x, y, r, ux, uy) => ps.spawn(P.SMOKE, x, y, ux * R.range(10, 26), uy * R.range(4, 12) - R.range(2, 8), R.range(1, 1.7), SM[R.int(1, 2)], r * R.range(0.3, 0.45));
  // a column of fire and dust boiling up off the floor into the crown
  const column = new Column(R, { w: 6, foot: 22, speed: 92, size: [7, 12], n: 34, sway: 3 });
  const top = () => { const S = plume.shape(); return S.y + S.tube * 0.4; };
  let t = 0, next = 0;

  const blast = ({ x, y, rad, power, main }) => {
    if (!main) flashes.push({ x, y, r: rad * 1.05, life: 0.07, max: 0.07 });
    if (!main) rings.push({ x, y, r0: rad * 0.45, r1: rad * 3.0, life: 0.38, max: 0.38, thick: 3, c: F[6] }, { x, y, r0: rad * 0.3, r1: rad * 1.7, life: 0.26, max: 0.26, thick: 1.8, c: F[4] });
    lights.add(x, main ? y - 40 : y, main ? 120 : rad * 3.6, WARM, 0.75 * power, 1.1);
    lights.add(x, main ? y - 16 : y, main ? 62 : rad * 1.8, WHITE, 0.85, 0.14);
    const down = main ? 0.25 : Math.PI;
    for (let i = 0; i < 6; i++) ps.spawn(P.FIRE, x + R.range(-3, 3), y + R.range(-3, 3), R.range(-24, 24), R.range(-48, -12), R.range(0.18, 0.32), 0, R.range(rad * 0.42, rad * 0.6));
    for (let i = 0; i < Math.round(30 * power); i++) {
      const a = main ? R.range(-Math.PI - down, down) : R.range(0, TAU), d = R.range(0, rad * 0.55), sp = R.range(50, 230) * power;
      ps.spawn(P.FIRE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.8 - 46, R.range(0.6, 1.2), 0, R.range(rad * 0.24, rad * 0.5), 0, R.chance(0.45) ? PF.SMOKES | PF.BIG : 0);
    }
    for (let i = 0; i < 6; i++) {
      const a = R.range(-Math.PI, 0), d = R.range(rad * 0.1, rad * 0.5);
      ps.spawn(P.SMOKE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * 34, Math.sin(a) * 22 - 34, R.range(1, 1.6), SM[4], R.range(rad * 0.16, rad * 0.28), R.range(0.06, 0.2), PF.BIG);
    }
    for (let i = 0; i < Math.round(10 * power); i++) {
      const a = R.range(-Math.PI, 0), d = R.range(0, rad * 0.7), sp = R.range(15, 100);
      ps.spawn(P.SMOKE, x + Math.cos(a) * d, y + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.6 - 40, R.range(2, 3.2), 0, R.range(rad * 0.26, rad * 0.42), R.range(0.12, 0.45), PF.BIG);
    }
    for (let i = 0; i < Math.round(90 * power); i++) {
      const a = R.range(0, TAU), sp = R.range(190, main ? 520 : 400);
      ps.spawn(P.SPARK, x, y, Math.cos(a) * sp, Math.sin(a) * sp - 80, R.range(0.2, 0.7));
    }
    for (let i = 0; i < Math.round(34 * power); i++) {
      const a = R.range(0, TAU), sp = R.range(30, 160);
      ps.spawn(P.EMBER, x + Math.cos(a) * rad * 0.4, y + Math.sin(a) * rad * 0.4, Math.cos(a) * sp, Math.sin(a) * sp - 80, R.range(1.5, 3.4), F[4]);
    }
    if (!main) return;
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + R.range(-1.35, 1.35), sp = R.range(170, 360);
      ps.spawn(P.BRAND, x, y, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.8, 1.5));
    }
    // the ground's part: dust rolling out flat, a dust column, grit and heavy rock lifted out of it
    for (let i = 0; i < 20; i++) {
      const s = R.sign();
      ps.spawn(P.SMOKE, s * R.range(0, RAD * 0.7), -R.range(1, 7), s * R.range(4, 10) * RAD, -R.range(2, 16), R.range(1.4, 2.4), st.dust, R.range(9, 13), R.range(0, 0.06), PF.BIG);
    }
    for (let i = 0; i < Math.round(EARTH * 13); i++)
      ps.spawn(P.SMOKE, R.range(-0.3, 0.3) * RAD, -R.range(2, RAD * 0.6), R.range(-16, 16), -R.range(64, 200) * EARTH * 0.55, R.range(1.6, 2.8), st.dust, R.range(9, 13), R.range(0, 0.15), PF.BIG);
    for (let i = 0; i < Math.round(EARTH * RAD * 4.4); i++) {
      const u = R.range(-1, 1), a = -Math.PI / 2 + u * 0.6, sp = R.range(5, 16) * RAD * (1 - 0.45 * Math.abs(u));
      ps.spawn(P.GRIT, u * 0.25 * RAD, -1, Math.cos(a) * sp, Math.sin(a) * sp, R.range(1.4, 2.5), R.pick([st.light, st.body, st.body, st.shade]), R.chance(0.45) ? 2 : 1);
    }
    for (let i = 0; i < 30; i++) {
      const big = i < 12, hot = R.chance(0.5), sx = R.sign();
      rocks.add({ kind: B.CHUNK, x: R.range(-0.4, 0.4) * RAD, y: -4, vx: sx * R.range(34, big ? 130 : 170), vy: -R.range(big ? 300 : 340, big ? 520 : 600), g: 1, drag: 0.3, bounce: 0.3, life: R.range(4.2, 6), a: R.range(0, TAU), va: R.range(-14, 14), s: big ? R.range(2.8, 4.2) : R.range(1.2, 2.5), heat: hot ? R.range(0.6, 1) : 0 });
    }
  };

  return {
    update(dt) {
      t += dt;
      while (next < BLASTS.length && t >= BLASTS[next].t) blast(BLASTS[next++]);
      // the chant: the air is dragged in toward the needle over the target, and the ground gives up its dust
      if (t < GATHER) {
        if (R.chance(50 * dt) && t > 0.05) {
          const a = R.range(0, TAU), d = R.range(90, 190), sp = R.range(150, 280);
          ps.spawn(P.STREAK, Math.cos(a) * d, -70 + Math.sin(a) * d * 0.7, -Math.cos(a) * sp, -Math.sin(a) * sp * 0.7, R.range(0.28, 0.5), F[5]);
        }
        if (t > 0.35 && R.chance(14 * dt)) ps.spawn(P.DUST, R.range(-70, 70), -R.range(0.5, 2), R.range(-3, 3), -R.range(8, 26), R.range(0.6, 1.1), st.dust, R.range(2, 4));
      }
      if (t > FLASH - 0.06 && t < FLASH + 0.3) {
        for (let i = 0; i < 26; i++) {
          const a = R.range(0, TAU), sp = R.range(120, 300), d = R.range(0, 30);
          ps.spawn(P.STREAK, Math.cos(a) * d, -26 + Math.sin(a) * d, Math.cos(a) * sp, Math.sin(a) * sp * 0.8, R.range(0.12, 0.26), F[6]);
        }
      }
      if (t > FLASH) plume.update(dt);
      const S = plume.shape(), hot = plume.hot();
      // the column keeps feeding the crown, then breaks up
      if (t > FLASH && t < 3.6) {
        if (R.chance(9 * (1 - smooth(2.4, 3.4, t)) * dt)) ps.spawn(P.SMOKE, R.range(-12, 12), -R.range(1, 6), R.range(-9, 9), -R.range(44, 88), R.range(1.5, 2.4), st.dust, R.range(6, 9), 0, PF.BIG);
        if (t < FLASH + 1.5 && R.chance(18 * dt)) ps.spawn(P.FIRE, R.range(-8, 8), -R.range(4, 16), R.range(-12, 12), -R.range(95, 165), R.range(0.5, 0.85), 0, R.range(4, 8), 0, R.chance(0.5) ? PF.SMOKES | PF.BIG : 0);
      }
      // embers shed off the crown, then ash drifts down out of it
      if (t > FLASH + 0.2 && t < 4.6 && R.chance(13 * hot * dt)) {
        const a = R.range(0, TAU);
        ps.spawn(P.EMBER, S.x + Math.cos(a) * (S.ring + S.tube), S.y + Math.sin(a) * S.tube * 0.5, Math.cos(a) * R.range(40, 100), -R.range(10, 60), R.range(1.2, 2.6), F[4]);
      }
      if (t > 2.2 && t < 5.6 && R.chance(8 * dt)) ps.spawn(P.FLAKE, S.x + R.range(-1, 1) * (S.ring + S.tube), S.y + S.tube * 0.6, R.range(-7, 7), R.range(0, 11), R.range(2, 3.2), R.pick([SM[0], SM[1], F[3]]), R.range(0.6, 1.2));
      // the afterwinds: dust drawn in along the floor toward the crater
      if (t > FLASH + 0.4 && t < 5 && R.chance(8 * dt)) {
        const s = R.sign();
        ps.spawn(P.VAPOUR, s * R.range(90, 210), -R.range(2, 8), -s * R.range(24, 54), -R.range(0, 8), R.range(1.2, 1.9), st.dust, R.range(6, 10));
      }
      column.update(dt, top(), t > FLASH + 0.12 && t < 4.2 ? 1 : 0);
      draft(ps, dt, { x: 0, top: S.y + S.tube * 0.4, w: 11 + 8 * Math.min(1, t), up: 180, pull: 150, low: 14, reach: 190, k: 1 - smooth(4.6, 6.2, t) });
      for (const a of [flashes, rings]) for (let i = a.length - 1; i >= 0; i--) if ((a[i].life -= dt) <= 0) a.splice(i, 1);
      for (const b of rocks.list) b.pvy = b.vy;
      rocks.update(dt);
      for (let i = rocks.list.length - 1; i >= 0; i--) {
        const b = rocks.list[i];
        if (b.x < X0 + 4 || b.x > X1 - 4) {
          rocks.list.splice(i, 1);
          continue;
        }
        if (b.heat > 0) {
          b.heat = Math.max(0, b.heat - dt * 0.28);
          if (!b.rest && b.heat > 0.25) {
            (b.pts ??= []).push({ x: b.x, y: b.y, t });
            if (R.chance(16 * dt)) ps.spawn(P.FIRE, b.x, b.y, b.vx * 0.1, b.vy * 0.1 - 9, R.range(0.16, 0.3), 0, R.range(1.2, 2.4));
          } else if (b.rest && R.chance(3 * b.heat * dt)) ps.spawn(P.SMOKE, b.x, b.y - 1, R.range(-3, 3), -R.range(5, 12), R.range(0.8, 1.4), 0, R.range(1.6, 2.6));
        }
        const landed = (b.pvy > 0 && b.vy <= 0) || (b.rest && !b.dusted);
        if (landed && b.pvy > 60) {
          for (let j = 0; j < 2 + Math.round(b.s); j++) ps.spawn(P.DUST, b.x + R.range(-1.5, 1.5), -0.5, R.sign() * R.range(10, 50), -R.range(2, 22), R.range(0.3, 0.7), st.dust, R.range(1.3, 1 + b.s));
          if (b.heat > 0.5 && !b.dusted) blazes.add(b.x, -0.25, R.range(1.2, 2.2), 0.45);
        }
        if (b.rest) b.dusted = true;
        if (b.pts) while (b.pts.length && t - b.pts[0].t > 0.45) b.pts.shift();
      }
      blazes.update(dt);
      ps.update(dt);
      cull(ps, X0, Y0, X1, Y1);
      for (let i = ps.list.length - 1; i >= 0; i--) if (ps.list[i].k === P.FLAKE && ps.list[i].y > 0.5) ps.list.splice(i, 1);
      lights.update(dt);
    },

    drawBack(p) {
      // the ground first: a seal burning under the target while the chant closes, then the burn of the blow
      if (t < FLASH) sealDraw(p, t, F, true);
      scorch(p, HR, Math.max(0, t - FLASH), 118, 4.2, 1 - smooth(END - 1.8, END - 0.4, t), 4);
      const k = (t - FLASH + 0.05) / 1.1;
      if (k > 0 && k < 1) band(p, 0, 0.5, Math.min(224, 250 * ease.outCubic(k)), 0.15, Math.max(1, 6 * (1 - k)), 1.15 - k, [st.body, st.light, F[4], F[6]], (g) => Math.sin(g) < 0);
      drawPs(p, ps, "back", FR);
      if (t > FLASH) {
        column.draw(p, top(), FR, SM, 1 - (t - FLASH) / 1.8, plume.hot());
        plume.draw(p, FR, SM);
      }
      blazes.drawBack(p);
    },

    draw(p) {
      const { W: w, H: h } = meta.size;
      // the chant: a seal writing itself, the needle above it, and the dark it pulls in
      if (t < FLASH) sealDraw(p, t, F, false);
      {
        const k = (t - FLASH + 0.05) / 1.1;
        if (k > 0 && k < 1) band(p, 0, 0.5, Math.min(224, 250 * ease.outCubic(k)), 0.15, Math.max(1, 6 * (1 - k)), 1.15 - k, [st.body, st.light, F[4], F[6]], (g) => Math.sin(g) >= 0);
      }
      // the white-out: two frames of light, then the star
      const u = t - FLASH;
      if (u >= 0 && u < 0.055) {
        wash(p, OX, OY, w, h, 0, -40, WHITE, 2.2);
        disc(p, 0, -40, 120, WHITE);
        return;
      }
      if (u >= 0 && u < 0.45) {
        // the star: a rayed, jittering bloom that cools from white through gold into the crimson body
        const g = ease.outExpo(clamp(u / 0.34)), fade = 1 - smooth(0.24, 0.45, u);
        const r = 80 + 190 * g, warm = 1 - smooth(0.02, 0.34, u) * 0.75;
        blastRays(p, 0, -34, r * 1.35, { n: 16, rot: 0.06 + u * 3.2, C: F, k: 0.9 * fade, inner: 0.34, box: BOX });
        blastStar(p, 0, -34, r, { spikes: 12, rot: 0.1 + u * 0.5, thin: 0.34, sharp: 0.7, C: F, warm: 0.55 + 0.6 * warm, rim: 1, k: 1, box: BOX });
        disc(p, 0, -34, r * 0.42, F[6], F[7], WHITE);
        if (u < 0.16) wash(p, OX, OY, w, h, 0, -34, F[7], 0.9 * (1 - u / 0.16));
      } else if (u > 0.3) {
        // out of the star: the first white-hot sphere, cooling into the fireball
        const f = clamp((u - 0.3) / 0.22);
        if (f < 1) {
          const r = 44 + 26 * f;
          disc(p, 0, -30, r + 2, F[3]);
          disc(p, 0, -30, r, f < 0.45 ? F[7] : F[6]);
          disc(p, 0, -30, r * 0.6, f < 0.45 ? WHITE : F[7]);
        }
      }
      // the spell's own debris: runes blown out of the seal, tumbling away and burning out
      if (u >= 0 && u < 1.5) {
        for (let i = 0; i < 8; i++) {
          const a = -0.35 + (i / 8) * (TAU - 0.7) + 1.9, v = 60 + 30 * (i % 3), d = 26 + v * u, k2 = 1 - smooth(0.7, 1.5, u);
          const x = Math.cos(a) * d, y = -30 + Math.sin(a) * d * 0.72 - 40 * u * u;
          rune(p, i, x, y, u < 0.12 ? WHITE : F[6], k2, F[2]);
          p.glow(x, y - 2, 7, F[4], 0.25 * k2);
        }
      }
      for (const b of rocks.list) {
        if (b.pts) trail(p, b.pts, t, FR, SM, 0.45, 0.6 + b.s * 0.3, b.heat);
        rock(p, b, st, FR);
      }
      drawPs(p, ps, "front", FR);
      for (const f of flashes) {
        const k2 = f.life / f.max, r = f.r * (0.8 + 0.2 * k2);
        p.circle(f.x, f.y, r + 1.2, F[2]);
        p.circle(f.x, f.y, r, k2 > 0.45 ? F[7] : F[6]);
        p.circle(f.x, f.y, r * 0.6, k2 > 0.45 ? WHITE : F[7]);
      }
      for (const r of rings) {
        const k2 = r.life / r.max, e = 1 - Math.pow(k2, 3);
        p.ring(r.x, r.y, r.r0 + (r.r1 - r.r0) * e, Math.max(1, r.thick * k2 + 0.4), r.c, Math.min(1, k2 * 1.6));
      }
      // the fireball lights the floor under it, the flash lights everything
      const hot = t > FLASH ? plume.hot() : 0, flash = Math.max(0, 1 - (t - FLASH) / 1.1);
      pool(p, 0, 1, 190, 26, F[4], 0.26 * hot + 0.55 * flash * flash);
      if (t < FLASH) {
        // the needle: a blood-red point that swells, its rim brightening to white just before it goes
        const c = clamp((t - 0.15) / (GATHER - 0.15));
        p.glow(0, -74, 44 + 24 * c, F[4], 0.28 + 0.5 * c);
        p.circle(0, -74, 1.5 + 5 * c, F[3]);
        p.circle(0, -74, 0.8 + 2.6 * c, c > 0.55 ? WHITE : F[5]);
        flare(p, 0, -74, 18 + 26 * c * c, 0.5 + 0.5 * c, F);
        sparkle(p, 0, -74, 3 + 4 * c, F[6], WHITE, 0.5);
      }
      lights.draw(p);
    },
  };
}

// the seal under the target: it writes itself during the chant, its rune ring lights, then the blow wipes it out
function sealDraw(p, t, F, back) {
  const write = clamp((t - 0.08) / 0.72), v = clamp((t - GATHER) / (FLASH - GATHER)), lvl = 0.5 + 0.5 * write;
  floorSeal(p, {
    r: 38, sy: 0.22, spin: write * 1.6, write, level: lvl + 0.4 * v, hot: 0.1 + 0.55 * v, fill: 0.14 * write,
    C: [SEAL[0], SEAL[1], SEAL[2], SEAL[3], SEAL[4], F[6], F[7], WHITE], keep: back ? (g) => Math.sin(g) < 0 : (g) => Math.sin(g) >= 0,
  });
}

// a filled disc that never writes past the canvas: a hot core sitting low in the frame would otherwise spill
const BOX = [-226, -296, 226, 36];
function disc(p, x, y, r, c, c2, c3) {
  p.shade(Math.max(BOX[0], x - r), Math.max(BOX[1], y - r), Math.min(BOX[2], x + r), Math.min(BOX[3], y + r), (px, py) => {
    const d = Math.hypot(px - x, py - y) / r;
    if (d > 1) return 0;
    return c3 !== undefined ? (d < 0.4 ? c3 : d < 0.8 ? c2 : c) : c;
  });
}

// light over most of the canvas, brightest near (cx, cy), falling to nothing just inside the canvas edges
function wash(p, OX, OY, W, H, cx, cy, c, k) {
  const rx = Math.min(OX + cx, W - OX - cx) - 4, up = OY + cy - 4, down = H - OY - cy - 4;
  p.shade(-OX, -OY, W - OX - 1, H - OY - 1, (x, y, out) => {
    const d = Math.hypot((x - cx) / rx, (y - cy) / (y < cy ? up : down));
    out.l = c;
    out.k = k * (1 - smooth(0, 1, d));
  });
}
