// 掌天瓶: the little green bottle of the sect. It hangs in the air, turns through the light, gathers a dew at its
// lip every turn and lets it fall; where the drop lands a spirit herb unfolds. A loop, seamless at the seam.
import { WHITE, band, fit, loopNoise, smooth, TAU, cycle } from "../../core/index.js";
import { BOTTLE, artifactMotes, runeSeal } from "./_lib.js";

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

/** The bottle: a round jade body, a narrow neck, a lip and a stop; a carved band and one hot seam of light. */
function bottle(p, C, x, y, ph, k) {
  const bob = Math.sin(ph * TAU) * 2.2, tilt = Math.sin(ph * TAU + 0.9) * 0.05;
  const cx = x + bob * 0.3, cy = y + bob;
  const ca = Math.cos(tilt), sa = Math.sin(tilt);
  const P = (u, v) => [cx + ca * u - sa * v, cy + sa * u + ca * v];

  // the body: a fat oval with a flat base
  p.circle(cx, cy + 18, 17.5, C[1], k);
  p.ellipse(cx, cy + 18, 17.5, 16, C[2], k);
  p.ellipse(cx - 5, cy + 15, 11, 10, C[3], 0.9 * k);
  p.ellipse(cx - 7, cy + 13, 5.5, 5, C[4], 0.9 * k);
  // the base sits a little darker
  p.ellipse(cx, cy + 33, 15, 2.6, C[0], 0.5 * k);

  // neck and lip
  p.rect(cx - 5, cy - 12, 10, 24, C[1], k);
  p.rect(cx - 5, cy - 12, 4, 24, C[3], k);
  p.rect(cx - 7, cy - 15, 14, 4, C[2], k);
  p.rect(cx - 7, cy - 15, 14, 1.5, C[4], 0.9 * k);
  // stop
  p.rect(cx - 4, cy - 22, 8, 8, C[2], k);
  p.rect(cx - 4, cy - 22, 3, 8, C[4], k);
  p.rect(cx - 5, cy - 24, 10, 3, C[3], k);
  p.dot(cx, cy - 25, C[6], 0.8 * k);

  // carved band of cloud script round the belly
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + ph * TAU * 0.6;
    if (Math.sin(a) < -0.1) continue;
    p.dot(cx + Math.cos(a) * 15.5, cy + 17 + Math.sin(a) * 5.5, i % 3 === 0 ? C[5] : C[3], 0.55 * k);
  }
  // the seam of living light down the bottle's left side
  const sheen = 0.5 + 0.5 * Math.sin(ph * TAU * 2);
  p.line(cx - 11, cy + 7, cx - 12, cy + 28, WHITE, 0.35 * k + sheen * 0.2);
  p.line(cx - 1, cy - 10, cx - 12, cy + 6, C[5], 0.4 * k);
  p.glow(cx, cy + 16, 26, C[4], 0.22 * k + sheen * 0.08);
  p.glow(cx, cy - 8, 14, C[5], 0.15 * k);
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8);
  const ph = t / D;
  runeSeal(p, 0, -1, 15, ph * TAU * 0.4, C, 0.28, { sq: 0.18, n: 18, tick: 2 });
  p.glow(0, -1, 22, C[3], 0.18);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), S = o.seed;
  const ph = t / D;

  // the drop cycle: forms at the lip, hangs, falls, opens the herb
  const form = smooth(0.1, 0.42, ph);
  const fall = smooth(0.46, 0.62, ph);
  const land = smooth(0.6, 0.7, ph);
  const bloom = smooth(0.62, 0.9, ph) * (1 - smooth(0.94, 1, ph) * 0.85);
  const lipX = BX + Math.sin(ph * TAU) * 0.7;
  const lipY = BY + Math.cos(ph * TAU) * 2.2 - 24;

  bottle(p, C, BX, BY, ph, 1);

  // the dew gathers: a bright bead, then a falling teardrop with a thin trail
  if (ph < 0.6) {
    const x = lipX, y = lipY - form * 1.5;
    const r = 0.8 + form * 1.8;
    p.circle(x, y, r, C[5], 0.9);
    p.dot(x - 0.5, y - 0.5, WHITE, 0.95);
    p.glow(x, y, 8, C[5], 0.28 * form);
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
      p.glow(lipX, y, 7, C[5], 0.2);
    }
  }

  // the impact: a small ring and a burst of green light on the floor
  if (land > 0.01 && ph < 0.82) {
    const q = (ph - 0.6) / 0.22;
    band(p, 0, -1, 4 + q * 10, 0.18, 1, 0.4 * (1 - q), C, undefined, q < 0.15);
    p.ellipse(0, -1, 6 + q * 8, 1.4, C[5], 0.3 * (1 - q));
    p.glow(0, -1, 18, C[4], 0.3 * (1 - q));
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
    // the bud
    const bh = 5 + 3 * hk;
    p.circle(0, -bh, 2.2, C[5], 0.85 * hk);
    p.dot(0, -bh - 2, C[6], hk);
    p.glow(0, -bh, 10, C[4], 0.2 * hk);
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
  p.glow(0, -1, 26, C[3], 0.1);
}
