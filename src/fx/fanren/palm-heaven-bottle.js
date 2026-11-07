// 掌天瓶: the little green bottle of the sect. It hangs in the air, turns through the light, gathers a dew at its
// lip every turn and lets it fall; where the drop lands a spirit herb unfolds. A loop, seamless at the seam.
import { WHITE, band, fit, hex, loopNoise, smooth, TAU, cycle } from "../../core/index.js";
import { BOTTLE, artifactMotes, runeSeal } from "./_lib.js";
import { glint, blobShadow, pool, Layer } from "../pickups/_lib.js";

const D = 3.2;
const BX = 0, BY = -74;

export const meta = {
  name: "Heaven-palm bottle",
  desc: "The little green bottle hangs in the air and turns through the light; a dewdrop gathers at its lip each turn and falls, and where it lands a spirit herb unfolds.",
  tags: ["xianxia", "fanren", "artifact", "bottle", "jade", "loop", "spirit-herb", "掌天瓶", "holy"],
  size: [148, 164],
  origin: [74, 150],
  duration: D,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: BOTTLE, seed: 147 },
};

const INK = hex("#04110b");
const L = new Layer(64, 88);

/** The bottle's silhouette on a scratch layer, so it keeps a crisp 1 px dark rim in front of its own halo. */
function bottleSprite(p, C, x, y, ph) {
  const bob = Math.sin(ph * TAU) * 2.2, tilt = Math.sin(ph * TAU + 0.9) * 0.05;
  const cx = x + bob * 0.3, cy = y + bob;
  const ca = Math.cos(tilt), sa = Math.sin(tilt);
  const q = L.begin(Math.floor(cx) - 26, Math.floor(cy) - 44);

  // the body: a fat oval with a flat base
  q.circle(cx, cy + 18, 17.5, C[1], 1);
  q.ellipse(cx, cy + 18, 17.5, 16, C[2], 1);
  q.ellipse(cx - 5, cy + 15, 11, 10, C[3], 1);
  q.ellipse(cx - 7, cy + 13, 5.5, 5, C[4], 1);
  q.ellipse(cx, cy + 33, 15, 2.6, C[0], 1);

  // neck and lip
  q.rect(cx - 5, cy - 12, 10, 24, C[1], 1);
  q.rect(cx - 5, cy - 12, 4, 24, C[3], 1);
  q.rect(cx - 7, cy - 15, 14, 4, C[2], 1);
  q.rect(cx - 7, cy - 15, 14, 1.5, C[4], 1);
  // stop
  q.rect(cx - 4, cy - 22, 8, 8, C[2], 1);
  q.rect(cx - 4, cy - 22, 3, 8, C[4], 1);
  q.rect(cx - 5, cy - 24, 10, 3, C[3], 1);
  q.px(cx, cy - 25, C[6]);

  // carved band of cloud script round the belly
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + ph * TAU * 0.6;
    if (Math.sin(a) < -0.1) continue;
    q.dot(cx + Math.cos(a) * 15.5, cy + 17 + Math.sin(a) * 5.5, i % 3 === 0 ? C[5] : C[3], 1);
  }
  // the seam of living light down the bottle's left side
  q.line(cx - 11, cy + 7, cx - 12, cy + 28, WHITE, 1);
  q.line(cx - 1, cy - 10, cx - 12, cy + 6, C[5], 1);

  // a sheen sweeps across the belly once a turn: a slanted white band, clipped to the body's oval
  const sweep = (ph * 1.6) % 1, sx = cx - 22 + sweep * 44;
  for (let yy = Math.ceil(cy + 2); yy <= cy + 34; yy++) {
    const half = 17.5 * Math.sqrt(Math.max(0, 1 - ((yy - (cy + 18)) / 16) ** 2));
    const x0 = sx + (yy - cy - 18) * 0.32;
    for (let d = -1; d <= 1; d++) {
      const xx = Math.round(x0 + d);
      if (Math.abs(xx - cx) > half - 0.5) continue;
      q.dot(xx, yy, d === 0 ? WHITE : C[6], 1);
    }
  }

  L.outline(INK).draw(p);
  return { cx, cy };
}

/** The light that belongs to the bottle: three depths on the belly, a halo ring and a breathing heart. */
function bottleGlow(p, C, cx, cy, ph) {
  const sheen = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
  p.glow(cx, cy + 16, 30, C[3], 0.09 + sheen * 0.02);
  p.glow(cx, cy + 16, 15, C[5], 0.17 + sheen * 0.05);
  p.glow(cx, cy + 16, 6, C[6], 0.2 + sheen * 0.1);
  p.glowRing(cx, cy + 15, 16.5, 7, C[5], 0.1 + sheen * 0.05);
  p.glow(cx, cy - 9, 8, C[5], 0.12);
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  const ph = t / D;
  blobShadow(p, 0.5, 9, 0.55);
  runeSeal(p, 0, -1, 15, ph * TAU * 0.4, C, 0.28, { sq: 0.18, n: 18, tick: 2 });
  // the bottle's light lies on the floor as a pool, not a flat blob
  pool(p, 0.5, 0, 30, 5.5, C[4], 0.4);
  pool(p, 0.5, 0, 14, 3, C[5], 0.3);
  // a soft halo round the artifact itself, behind it
  p.glowRing(0, BY + 14, 24, 14, C[4], 0.2);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), S = o.seed;
  const ph = t / D;

  // the drop cycle: forms at the lip, hangs, falls, opens the herb
  const form = smooth(0.1, 0.42, ph);
  const land = smooth(0.6, 0.7, ph);
  // the herb breathes all the way down before the seam, so it doesn't pop off as the loop wraps
  const bloom = smooth(0.62, 0.9, ph) * (1 - smooth(0.94, 1, ph));
  const lipX = BX + Math.sin(ph * TAU) * 0.7;
  const lipY = BY + Math.cos(ph * TAU) * 2.2 - 24;

  const { cx, cy } = bottleSprite(p, C, BX, BY, ph);
  bottleGlow(p, C, cx, cy, ph);

  // the dew gathers: a bright bead, then a falling teardrop with a thin trail
  if (ph < 0.6) {
    const x = lipX, y = lipY - form * 1.5;
    const r = 0.8 + form * 1.8;
    p.circle(x, y, r, C[5], 0.9);
    p.dot(x - 0.5, y - 0.5, WHITE, 0.95);
    p.glow(x, y, 9, C[3], 0.1 * form);
    p.glow(x, y, 4, C[6], 0.2 * form);
    if (form > 0.55) glint(p, x, y, Math.round(2 * form), C[6], 0.25 * form);
    for (let i = 0; i < 3; i++) {
      const B = loopNoise(ph, 1.2, S + i * 7);
      p.dot(x + Math.sin(ph * TAU * 3 + i * 2) * (2 + B * 3), y + 2 + i * 2, C[4], 0.35 * form);
    }
  } else if (ph < 0.72) {
    const q = (ph - 0.6) / 0.12, y = lipY + q * 98;
    if (y < -2) {
      p.circle(lipX, y, 1.8, C[5], 0.9);
      p.dot(lipX - 0.5, y - 0.5, WHITE, 0.95);
      p.line(lipX, lipY, lipX, y - 2, C[4], 0.3 * (1 - q));
      p.glow(lipX, y, 8, C[3], 0.08);
      p.glow(lipX, y, 3.5, C[6], 0.22);
    }
  }

  // the impact: a small ring and a burst of green light on the floor
  if (land > 0.01 && ph < 0.82) {
    const q = (ph - 0.6) / 0.22;
    band(p, 0, -1, 4 + q * 10, 0.18, 1, 0.4 * (1 - q), C, undefined, q < 0.15);
    p.ellipse(0, -1, 6 + q * 8, 1.4, C[5], 0.3 * (1 - q));
    pool(p, 0.5, 0, 16 + q * 6, 3, C[4], 0.35 * (1 - q));
    glint(p, 0.5, -1, Math.round(3 * (1 - q)), C[6], 0.3 * (1 - q));
  }

  // the spirit herb: three leaves unroll and a pale bud opens, then it breathes down before the seam
  const hk = bloom;
  if (hk > 0.01) {
    for (let i = 0; i < 3; i++) {
      const side = i - 1, len = (7 + i * 2.5) * (0.4 + 0.6 * hk);
      const a = -Math.PI / 2 + side * 0.62;
      for (let d = 0; d < len; d += 1.2) {
        const q = d / len, x = Math.cos(a) * d * 1.15, y = Math.sin(a) * d;
        const w = Math.sin(q * Math.PI) * (1.6 + (i === 1 ? 1 : 0));
        p.dot(x, y, q < 0.55 ? C[4] : C[5], 0.85 * hk);
        if (w > 1) p.dot(x + 1, y, C[3], 0.5 * hk);
      }
    }
    // the bud: a hot white tip over a green heart
    const bh = 5 + 3 * hk;
    p.circle(0, -bh, 2.2, C[5], 0.85 * hk);
    p.dot(0, -bh - 2, WHITE, hk);
    p.glow(0, -bh, 10, C[4], 0.12 * hk);
    p.glow(0, -bh, 4, C[6], 0.22 * hk);
    if (hk > 0.7) glint(p, 0, -bh, 2, WHITE, 0.25 * hk);
    pool(p, 0.5, 0, 9, 2, C[4], 0.25 * hk);
    // motes rising off the herb
    cycle(t, D, 8, S + 3, D * 0.5, (age, life, R) => {
      const q = age / life, x = R.range(-8, 8) + Math.sin(q * 4 + R.next() * 6) * 2;
      const y = -2 - q * R.range(10, 26);
      p.dot(x, y, q < 0.5 ? C[5] : C[3], 0.5 * hk * (1 - q));
    });
  }

  // the bottle's own dust
  artifactMotes(p, C, BX, BY - 2, 22, 34, ph, S + 5, 9, 0.8);

  // a thin pool of green light on the floor, breathing with the bottle
  const breath = 0.5 + 0.5 * Math.sin(ph * TAU);
  p.ellipse(0, -1, 16 + breath * 2, 2.6, C[3], 0.16);
  pool(p, 0.5, 0, 16 + breath * 2, 3, C[4], 0.12);
}
