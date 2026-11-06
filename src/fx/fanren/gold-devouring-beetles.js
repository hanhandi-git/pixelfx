// 噬金虫: the sleeve opens and a stream of gold beetles pours out. They gather into a boiling gold cloud over
// the target, strip it to a dark hollow, then burst apart into glittering dust. Chitin clicks are sold as
// hard little glints riding a soft amber swarm.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { GOLD_BEETLE, runeSeal } from "./_lib.js";
import { glint, blobShadow, pool } from "../pickups/_lib.js";

const END = 2.95;
const TX = 246;
const STREAM = 0.34, CLOUD = 0.78, DEVOUR = 1.12, BURST = 1.94;
const HAND = [13, -31], CLOUD_C = [TX, -26];
const N = 64;

export const meta = {
  name: "Gold-devouring beetles",
  desc: "A sleeve opens and a stream of gold beetles pours out, gathering into a boiling cloud over the target, stripping it to a dark hollow before bursting into glittering dust.",
  tags: ["xianxia", "fanren", "swarm", "insects", "gold", "devour", "噬金虫", "technique", "one-shot"],
  size: [420, 212],
  origin: [58, 188],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: GOLD_BEETLE, seed: 97 },
};

const SLEEVE = { ...READY, x: -1, crouch: 2, lean: -2, turn: 0.3, fx: 9, fy: -29, bx: -4, by: -22, ffx: 6 };
const FAN = { ...READY, x: 1, crouch: 2, lean: 3, turn: 0.1, fx: 17, fy: -31, bx: 1, by: -21, ffx: 11 };
const PRESS = { ...FAN, x: 2, crouch: 4, lean: 5, fx: 19, fy: -30 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.4, READY],
    [0.06, SLEEVE],
    [0.26, PRESS],
    [STREAM, FAN, "snap"],
    [1.5, { ...PRESS, lean: 6 }],
    [2.2, { ...FAN, x: 1, crouch: 3, lean: 2 }],
    [END, READY],
  ],
  hits: [
    { t: STREAM + 0.24, stop: 0.04, shake: 0.1, amp: 1.6, push: 0.6, straw: 4 },
    { t: DEVOUR, stop: 0.12, shake: 0.3, amp: 2.6, push: 1.4, straw: 10, skin: "char" },
    { t: BURST, stop: 0.08, shake: 0.22, amp: 2.4, push: 2, straw: 14 },
  ],
  dust: [{ t: STREAM, x: 14, n: 4, dir: 1, c: "#f0c84a" }, { t: BURST, x: TX, n: 7, dir: -1, c: "#f0c84a" }],
};


/** Where beetle i is: streaming out, boiling over the target, or scattering. */
function bugAt(i, t, seed) {
  const R = rng(seed, i, 3);
  const wait = 0.06 + R.next() * 0.34;
  const depart = STREAM + wait, arrive = depart + 0.3 + R.next() * 0.12;
  const a0 = R.range(0, TAU), spin = R.range(2.6, 4.6) * (R.chance(0.15) ? -1 : 1);
  const z = R.range(0.55, 1.25), r0 = R.range(15, 33);
  const burstAt = BURST + R.next() * 0.26;

  if (t < arrive) {
    const q = clamp((t - depart) / (arrive - depart));
    if (t < depart) return { x: HAND[0] + R.range(-3, 3), y: HAND[1] + R.range(-3, 3), a: 0, k: 0, mode: "wait" };
    const e = ease.inCubic(q);
    const sx = HAND[0], sy = HAND[1];
    const ex = CLOUD_C[0] + Math.cos(a0) * r0, ey = CLOUD_C[1] + Math.sin(a0) * r0 * 0.55;
    const cx = (sx + ex) / 2 + 14, cy = Math.min(sy, ey) - 22;
    return {
      x: (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * ex,
      y: (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * ey,
      a: Math.atan2(ey - cy, ex - cx),
      k: clamp(q * 3),
      mode: "fly",
    };
  }
  if (t < burstAt) {
    const age = t - arrive;
    const squash = 1 - 0.22 * smooth(CLOUD, DEVOUR + 0.3, t) + 0.2 * smooth(DEVOUR + 0.4, BURST, t);
    const a = a0 + age * spin;
    const rr = (r0 * squash + 4 * Math.sin(age * 6 + i)) * (1 - 0.12 * z);
    return {
      x: CLOUD_C[0] + Math.cos(a) * rr,
      y: CLOUD_C[1] + Math.sin(a) * rr * 0.6,
      a: a + Math.PI / 2,
      k: 0.6 + 0.4 * z,
      z,
      mode: "cloud",
    };
  }
  const age = t - burstAt, sp = 36 + R.next() * 66, a = a0 + 0.6 + R.range(-0.5, 0.5);
  const d = 1 - Math.exp(-age * 2.6);
  return {
    x: CLOUD_C[0] + Math.cos(a) * (sp * d) * 1.1,
    y: CLOUD_C[1] + Math.sin(a) * (sp * d) * 0.55 - age * 8,
    a,
    k: 1 - smooth(burstAt + 0.5, END, t),
    mode: "scatter",
  };
}

/** A single beetle: dark gold shell, a hard rim glint, wing blur and two legs. */
function beetle(p, C, x, y, a, s, k, flap, far) {
  if (k <= 0.04) return;
  const ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => [x + ca * u - sa * v, y + sa * u + ca * v];
  // wings: pale gold smears, alternating with the flap
  const wc = far ? C[3] : C[5];
  const wa = (0.55 + 0.35 * flap) * k;
  const w0 = P(-0.4, 1.7 * s), w1 = P(-1.6, 3.0 * s);
  p.dot(w0[0], w0[1], wc, wa);
  p.dot(w1[0], w1[1], wc, wa * 0.6);
  if (!far) {
    const w2 = P(-0.4, -1.7 * s), w3 = P(-1.6, -3.0 * s);
    p.dot(w2[0], w2[1], wc, wa);
    p.dot(w3[0], w3[1], wc, wa * 0.6);
  }
  // the shell: an oval 2 px wide at s = 1, gold rim, almost-black seam
  const shell = C[2], rim = far ? C[3] : C[5];
  p.dot(x, y, shell, k);
  const b0 = P(0.2, 0), b1 = P(-1.0, 0);
  p.dot(b0[0], b0[1], rim, 0.95 * k);
  p.dot(b1[0], b1[1], C[1], 0.9 * k);
  if (!far) {
    p.dot(P(0.9, 0)[0], P(0.9, 0)[1], C[6], 0.8 * k);
    const h = P(-0.2, -0.8);
    p.dot(h[0], h[1], WHITE, 0.5 * k * (0.5 + 0.5 * flap));
    // antennae
    const l0 = P(1.3, -0.8), l1 = P(1.9, -1.4);
    p.dot(l0[0], l0[1], C[4], 0.5 * k);
    p.dot(l1[0], l1[1], C[4], 0.4 * k);
  }
  p.dot(x, y, shell, k);
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const cloud = smooth(STREAM, CLOUD + 0.15, t) * (1 - smooth(BURST, BURST + 0.35, t));
  if (cloud <= 0.01) return;
  // the mass has a dark heart: a translucent soot disc that gold rides over, grounded by a shadow
  blobShadow(p, CLOUD_C[0], 15 + 8 * cloud, 0.45, -1);
  p.disc(CLOUD_C[0], CLOUD_C[1], 24 + 6 * cloud, C[0], 0.4 * cloud);
  p.disc(CLOUD_C[0] - 4, CLOUD_C[1] - 6, 14, C[1], 0.3 * cloud);
  // a pool of gold light under the swarm and a halo round its rim, brightest where the mass is thickest
  pool(p, CLOUD_C[0], 0, 26, 4.5, C[4], 0.32 * cloud);
  p.glowRing(CLOUD_C[0], CLOUD_C[1], 23, 13, C[4], 0.16 * cloud);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 1.1;
    p.glow(CLOUD_C[0] + Math.cos(a) * 26, CLOUD_C[1] + Math.sin(a) * 14, 5 + 2 * Math.sin(a * 3), C[5], 0.07 * cloud);
  }
  // far half of the swarm
  for (let i = 0; i < N; i += 2) {
    const b = bugAt(i, t, S);
    if (b.mode !== "cloud") continue;
    if (Math.sin(b.a) < 0.05) beetle(p, C, b.x, b.y, b.a, 0.7 + b.z * 0.55, b.k * 0.85, Math.sin(t * 36 + i), true);
  }
  // a dim ring of dust on the floor where it feeds
  p.ellipse(TX, -1, 16, 3, C[3], 0.16 * cloud);
  pool(p, TX, 0, 18, 3.4, C[4], 0.18 * cloud);
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const body = smooth(0.02, 0.4, t) * (1 - smooth(2.55, 2.92, t));
  const cloud = smooth(STREAM, CLOUD + 0.15, t) * (1 - smooth(BURST, BURST + 0.3, t));
  const devour = smooth(CLOUD, DEVOUR + 0.2, t) * (1 - smooth(BURST - 0.1, BURST + 0.2, t));

  // the sleeve: amber dust at the cuff, a few beetles crawling on the cloth
  if (body > 0.01 && t < CLOUD + 0.2) {
    p.glow(HAND[0], HAND[1], 14, C[4], 0.28 * body);
    for (let i = 0; i < 5; i++) {
      const B = rng(S, i, 29), a = B.range(0, TAU) + t * 3;
      const d = 3 + B.range(0, 8);
      p.dot(HAND[0] + Math.cos(a) * d, HAND[1] + Math.sin(a) * d * 0.8, i % 2 ? C[5] : C[3], 0.7 * body);
    }
  }

  // the stream: gold specks on a curve from cuff to cloud, with a faint amber light along the flow
  const streamK = smooth(STREAM, CLOUD, t) * (1 - smooth(BURST, BURST + 0.3, t));
  if (streamK > 0.01) {
    p.glowLine(HAND[0], HAND[1], CLOUD_C[0], CLOUD_C[1], 9, C[3], 0.035 * streamK);
    p.glow(CLOUD_C[0], CLOUD_C[1], 18, C[5], 0.07 * streamK);
  }
  for (let i = 0; i < N; i++) {
    const b = bugAt(i, t, S);
    if (b.mode === "fly") {
      beetle(p, C, b.x, b.y, b.a, 0.8 + (i % 3) * 0.18, b.k, Math.sin(t * 40 + i), false);
      if (i % 3 === 0) p.dot(b.x - Math.cos(b.a) * 3, b.y - Math.sin(b.a) * 3, C[3], 0.3);
    }
  }

  // the near half of the boiling cloud
  if (cloud > 0.01) {
    for (let i = 1; i < N; i += 2) {
      const b = bugAt(i, t, S);
      if (b.mode !== "cloud") continue;
      if (Math.sin(b.a) < 0.05) continue;
      beetle(p, C, b.x, b.y, b.a, 0.8 + b.z * 0.6, b.k, Math.sin(t * 36 + i * 1.7), false);
    }
    // hard glints: the sound of chewing
    const flick = Math.floor(t * 22);
    for (let i = 0; i < 9; i++) {
      const B = rng(S, i, flick + 41);
      if (!B.chance(0.6)) continue;
      const a = B.range(0, TAU), r = B.range(4, 26);
      const x = CLOUD_C[0] + Math.cos(a) * r, y = CLOUD_C[1] + Math.sin(a) * r * 0.6;
      p.dot(x, y, B.chance(0.5) ? WHITE : C[6], 0.8 * cloud);
      if (B.chance(0.35)) glint(p, x, y, 1 + Math.round(B.next() * 2), C[6], 0.16 * cloud);
    }
    // a sheen orbits the cloud like a caught lamp: one hard star, its own light riding with it
    const sa = t * 2.2, sx2 = CLOUD_C[0] + Math.cos(sa) * 24, sy2 = CLOUD_C[1] + Math.sin(sa) * 13;
    glint(p, sx2, sy2, 2, C[6], 0.24 * cloud);
    p.glow(sx2, sy2, 9, C[5], 0.12 * cloud);
    // and the rim breathes
    const breath = 0.5 + 0.5 * Math.sin(t * 6.5);
    p.glow(CLOUD_C[0], CLOUD_C[1], 28 + 4 * breath, C[4], 0.06 + 0.05 * breath);
    if (devour > 0.01) {
      // the target is a hollow inside the cloud: a violet-black bite and a gold rim
      p.disc(CLOUD_C[0], CLOUD_C[1], 15, C[0], 0.32 * devour);
      p.ring(CLOUD_C[0], CLOUD_C[1], 15 + Math.sin(t * 9), 1, C[4], 0.25 * devour);
      sparkle(p, CLOUD_C[0], CLOUD_C[1], 16 * devour, C[5], C[4], 0.55 * devour);
      // gold dust falling out of the hollow
      for (let i = 0; i < 8; i++) {
        const B = rng(S, i, 47), born = CLOUD + B.range(0, 0.8), age = t - born;
        if (age < 0) continue;
        const x = CLOUD_C[0] + B.range(-12, 12), y = CLOUD_C[1] + 8 + age * 26;
        if (y > -1) continue;
        p.dot(x, y, i % 3 ? C[4] : C[6], 0.7 * devour * (1 - age * 0.4));
      }
    }
    p.glow(CLOUD_C[0], CLOUD_C[1], 40, C[3], 0.14 * cloud);
  }

  // the burst outward, then dust settling
  for (let i = 0; i < N; i++) {
    const b = bugAt(i, t, S);
    if (b.mode !== "scatter" || b.k <= 0.04) continue;
    if (i % 2) beetle(p, C, b.x, b.y, b.a, 0.8, b.k, Math.sin(t * 46 + i), false);
    else p.dot(b.x, b.y, i % 3 ? C[4] : C[6], 0.65 * b.k);
  }
  const dust = smooth(BURST + 0.2, BURST + 0.5, t) * (1 - smooth(2.5, 2.93, t));
  if (dust > 0.01) {
    for (let i = 0; i < 16; i++) {
      const B = rng(S, i, 53), a = B.range(0, TAU), d = B.range(14, 46);
      const x = CLOUD_C[0] + Math.cos(a) * d, y = Math.min(-2, CLOUD_C[1] + Math.sin(a) * d * 0.5 + (1 - dust) * 16);
      p.dot(x, y, i % 4 ? C[3] : C[5], 0.4 * dust);
    }
  }

  // a thin gold seal under the feeding site
  const seal = smooth(STREAM, CLOUD, t) * (1 - smooth(BURST, BURST + 0.4, t));
  if (seal > 0.01) runeSeal(p, TX, -1, 20, t * 1.2, C, 0.3 * seal, { sq: 0.18, n: 20, tick: 2 });
}
