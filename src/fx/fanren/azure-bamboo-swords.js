// 青竹蜂云剑: Han Li's signature flying swords. A sleeve-flick pulls jade light out of the air, a cloud of
// bamboo-leaf blades wheels around him, and at the sword-finger they cross the field as one green storm,
// stab the target in sequence, wheel once more around it and scatter as leaves.
import { READY, WHITE, clamp, ease, fit, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { JADE, leafSword, qiMotes, runeSeal } from "./_lib.js";
import { glint, pool } from "../pickups/_lib.js";

const END = 2.85;
const N = 15;
const TX = 272;
const CLOUD_C = [-2, -54], RX = 37, RY = 16;
const HAND = [15, -31];
const FORM = 0.36, LAUNCH = 1.0, STEP = 0.034, TRAVEL = 0.28;
const VORTEX = 1.66;

export const meta = {
  name: "Azure bamboo swords",
  desc: "A sleeve-flick gathers jade light, a cloud of bamboo-leaf flying swords wheels around the caster, then the swarm crosses the field, stabs in sequence and wheels round the target.",
  tags: ["xianxia", "fanren", "flying-sword", "swarm", "jade", "bamboo", "technique", "sword", "青竹蜂云剑", "one-shot"],
  size: [376, 196],
  origin: [62, 172],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: JADE, seed: 61 },
};

const GATHER = { ...READY, x: -1, crouch: 3, lean: -3, turn: 0.35, fx: 8, fy: -32, bx: -4, by: -23, ffx: 6 };
const PRESS = { ...GATHER, x: -1, crouch: 4, lean: -4, fx: 6, fy: -33, bx: -5, by: -22 };
const FLICK = { ...READY, x: 1, crouch: 2, lean: 4, turn: 0.1, fx: 18, fy: -31, bx: 0, by: -20, ffx: 12 };
const FOLLOW = { ...FLICK, x: 2, crouch: 3, lean: 6, fx: 20, fy: -30 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, READY],
    [0.08, GATHER],
    [0.58, PRESS],
    [LAUNCH, FLICK, "snap"],
    [1.42, FOLLOW],
    [2.1, { ...FLICK, x: 1, crouch: 3, lean: 2, fx: 15, fy: -28 }],
    [END, READY],
  ],
  hits: [
    { t: LAUNCH + TRAVEL, stop: 0.03, shake: 0.08, amp: 1.5, push: 0.5, straw: 3 },
    { t: LAUNCH + 8 * STEP + TRAVEL, stop: 0.03, shake: 0.08, amp: 1.5, push: 0.5, straw: 3 },
    { t: LAUNCH + 14 * STEP + TRAVEL, stop: 0.05, shake: 0.12, amp: 2.2, push: 1.2, straw: 7 },
    { t: LAUNCH + 17 * STEP + TRAVEL, stop: 0.1, shake: 0.22, amp: 3, push: 2, straw: 12, skin: "char" },
  ],
  dust: [{ t: LAUNCH, x: 16, n: 4, dir: 1, c: "#8ce8a8" }, { t: VORTEX, x: TX, n: 6, dir: -1, c: "#8ce8a8" }],
};

const orbit = (i, t) => {
  const a = (i / N) * TAU + t * 2.6;
  const r = 0.9 + 0.1 * Math.sin(a * 2 + t * 4.2);
  const rx = RX * r, ry = RY * r;
  return {
    x: CLOUD_C[0] + Math.cos(a) * rx,
    y: CLOUD_C[1] + Math.sin(a) * ry,
    a: Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx),
    z: Math.sin(a),
  };
};

const bez = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;

/** Where sword i is at time t: { x, y, a, k, mode, hit? } — position is the hilt, the blade runs along a. */
function swordAt(i, t, seed) {
  const R = rng(seed, i, 5);
  const launch = LAUNCH + i * STEP, arrive = launch + TRAVEL;
  const hit = [TX + R.range(-5, 5), -13 - (i % 6) * 6 + R.range(-2, 2)];
  const hitA = Math.atan2(hit[1] - -34, hit[0] - CLOUD_C[0]) * 0.35 + R.range(-0.1, 0.1);

  // materialise out of the sleeve, then wheel
  const formAt = 0.04 + i * 0.012;
  if (t < formAt + 0.34) {
    const q = clamp((t - formAt) / 0.34), e = ease.outCubic(q);
    const o = orbit(i, formAt);
    return { x: HAND[0] + (o.x - HAND[0]) * e, y: HAND[1] + (o.y - HAND[1]) * e, a: -0.9 + (o.a + 0.9) * e, k: clamp(q * 1.6), mode: "form" };
  }
  if (t < launch) {
    const o = orbit(i, t);
    return { x: o.x, y: o.y, a: o.a, k: 1, mode: "orbit" };
  }
  if (t < arrive) {
    const u = clamp((t - launch) / TRAVEL), e = ease.outCubic(u), s = orbit(i, launch);
    const hx = hit[0] - Math.cos(hitA) * 7, hy = hit[1] - Math.sin(hitA) * 7;
    const cx = (s.x + hx) / 2 + 4, cy = Math.min(s.y, hy) - 10;
    return { x: bez(s.x, cx, hx, e), y: bez(s.y, cy, hy, e), a: s.a + (hitA - s.a) * ease.inOutCubic(u), k: 1, mode: "fly", tx: hit[0], ty: hit[1] };
  }
  // pinned for a beat, then pulled into the vortex around the target
  const back = arrive + 0.1;
  if (t < back) {
    const hx = hit[0] - Math.cos(hitA) * 7, hy = hit[1] - Math.sin(hitA) * 7;
    return { x: hx, y: hy, a: hitA, k: 1, mode: "stick", tx: hit[0], ty: hit[1] };
  }
  const vq = smooth(back, VORTEX + i * 0.008, t), ve = ease.inOutCubic(vq);
  const va = (i / N) * TAU + (t - VORTEX) * 3.4, vr = 26 + 5 * Math.sin(va * 2);
  const vx = TX + Math.cos(va) * vr, vy = -38 + Math.sin(va) * vr * 0.6;
  if (t < 2.16) {
    const hx = hit[0] - Math.cos(hitA) * 7, hy = hit[1] - Math.sin(hitA) * 7;
    return {
      x: hx + (vx - hx) * ve + Math.sin(ve * Math.PI) * 3,
      y: hy + (vy - hy) * ve - Math.sin(ve * Math.PI) * 9,
      a: Math.atan2(Math.cos(va) * 0.6, -Math.sin(va)),
      k: 1,
      mode: "wheel",
    };
  }
  // the cloud lifts and lets go
  const lift = smooth(2.16, 2.72, t), le = ease.inQuad(lift);
  return {
    x: vx + Math.sin(va * 2) * 6 * le,
    y: vy - 26 * le,
    a: Math.atan2(-1, Math.sin(va) * 0.5),
    k: 1 - lift,
    mode: "fade",
  };
}

/** A flying sword's passing trail: a few older positions in green, thinning behind it. */
function trail(p, C, i, t, seed) {
  for (let j = 1; j <= 4; j++) {
    const s = swordAt(i, t - j * 0.035, seed);
    if (s.k <= 0.05 || s.mode === "stick" || s.mode === "form") continue;
    const ca = Math.cos(s.a), sa = Math.sin(s.a);
    p.dot(s.x + ca * 8, s.y + sa * 8, j < 2 ? C[5] : j < 4 ? C[3] : C[2], 0.5 * s.k * (1 - j * 0.2));
    if (j < 3) p.dot(s.x + ca * 12, s.y + sa * 12, C[4], 0.32 * s.k);
  }
}

/** The impact: a white pin, a four-point glint, a leaf cut and sparks fanning off the edge. */
function cut(p, C, x, y, a, q, seed, i) {
  const f = 1 - q, R = rng(seed, i, 11);
  sparkle(p, x, y, 4 + 6 * f, C[6], C[4], 0.55 * f);
  glint(p, x, y, Math.round(2 + 4 * f), C[6], 0.4 * f);
  p.dot(x, y, WHITE, f);
  p.line(x - Math.cos(a) * 9, y - Math.sin(a) * 9, x + Math.cos(a) * 6, y + Math.sin(a) * 6, WHITE, 0.8 * f);
  for (let j = 0; j < 7; j++) {
    const B = rng(seed, i * 7 + j, 13);
    const aa = a + Math.PI + B.range(-1.3, 1.3), sp = B.range(14, 48);
    const d = q * sp, px = x + Math.cos(aa) * d, py = y + Math.sin(aa) * d + q * q * 18;
    p.dot(px, py, j % 3 ? C[4] : C[6], (1 - q) * 0.9);
  }
  // a bamboo leaf shed at the cut
  if (q < 0.5) p.dot(x + R.range(-5, 5), y + R.range(-4, 4), C[3], 0.7 * (1 - q * 2));
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const charge = smooth(0.05, 0.5, t) * (1 - smooth(2.5, 2.8, t));

  // the wheel casts a pool on the floor and a halo round its orbit, not a flat disc of light
  pool(p, CLOUD_C[0] + 8, 0, 30, 5, C[4], 0.22 * charge);
  p.glowRing(CLOUD_C[0], CLOUD_C[1], RX * 0.95, 12, C[4], 0.1 * charge);
  p.glow(CLOUD_C[0], CLOUD_C[1], 20, C[5], 0.08 * charge);
  pool(p, TX, 0, 26, 4.5, C[4], 0.3 * smooth(LAUNCH, LAUNCH + 0.4, t) * (1 - smooth(2.4, 2.8, t)));

  // the wheel's back half and the faint tracks it leaves in the air
  if (t < LAUNCH + 0.1) {
    for (let i = 0; i < N; i++) {
      const s = swordAt(i, t, S);
      if (s.mode === "orbit" && Math.sin((i / N) * TAU + t * 2.6) < 0) leafSword(p, C, s.x, s.y, s.a, 14, s.k * 0.95);
    }
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * TAU + t * 2.6;
      p.dot(CLOUD_C[0] + Math.cos(a) * RX, CLOUD_C[1] + Math.sin(a) * RY, i % 3 ? C[2] : C[3], 0.16 * charge);
    }
  }

  // swords that have already crossed pass behind the target's near half
  for (let i = 0; i < N; i++) {
    const s = swordAt(i, t, S);
    if (s.mode === "fly" && s.y > -30) trail(p, C, i, t, S);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const charge = smooth(0.04, 0.42, t) * (1 - smooth(2.5, 2.82, t));
  const after = smooth(LAUNCH - 0.06, LAUNCH + 0.2, t) * (1 - smooth(2.4, 2.8, t));

  // gathering: jade light in the palm, motes pulled in, a loose ring of leaf glints
  if (charge > 0.01) {
    const palm = smooth(0.1, 0.5, t);
    p.circle(HAND[0], HAND[1], 1.4 + 2.6 * palm, t > 0.5 ? C[6] : C[5], 0.9 * charge);
    p.dot(HAND[0], HAND[1], WHITE, charge);
    p.glow(HAND[0], HAND[1], 26 + 14 * palm, C[3], 0.1 * charge);
    p.glow(HAND[0], HAND[1], 14 + 8 * palm, C[5], 0.22 * charge);
    p.glow(HAND[0], HAND[1], 5 + 3 * palm, C[6], 0.2 * charge);
    p.glowRing(HAND[0], HAND[1], 9 + 3 * palm, 5, C[5], 0.1 * charge);
    qiMotes(p, C, HAND[0], HAND[1], 4, t, 0.7, S + 3, 14, 20, -1, charge);
    runeSeal(p, HAND[0], HAND[1], 8 + 3 * Math.sin(t * 9), t * 1.6, C, 0.5 * charge, { n: 18, sq: 0.9, tick: 2 });
  }

  // the wheel, near half
  if (t < LAUNCH + 0.1) {
    for (let i = 0; i < N; i++) {
      const s = swordAt(i, t, S);
      if (s.mode !== "orbit" || Math.sin((i / N) * TAU + t * 2.6) >= 0) leafSword(p, C, s.x, s.y, s.a, 14, s.k);
    }
  }

  // the storm: each sword on its way, its trail and its cut
  for (let i = 0; i < N; i++) {
    const s = swordAt(i, t, S);
    if (s.mode === "fly") {
      trail(p, C, i, t, S);
      // a thin green line of sword-qi from the cloud to the blade
      const back = swordAt(i, t - 0.11, S);
      if (back.mode === "fly") p.line(back.x, back.y, s.x, s.y, C[3], 0.3);
      leafSword(p, C, s.x, s.y, s.a, 15, s.k);
      const tipX = s.x + Math.cos(s.a) * 15, tipY = s.y + Math.sin(s.a) * 15;
      p.glowLine(s.x, s.y, tipX, tipY, 2.4, C[5], 0.12 * s.k);
      p.glow(tipX, tipY, 3.5, C[6], 0.16 * s.k);
      if (i % 4 === 0) glint(p, tipX, tipY, 2, C[6], 0.2 * s.k);
    } else if (s.mode === "stick" || s.mode === "wheel") {
      leafSword(p, C, s.x, s.y, s.a, 14, s.k);
      if (s.mode === "stick") p.glow(s.x, s.y, 10, C[4], 0.2);
    } else if (s.mode === "form" || s.mode === "fade") {
      leafSword(p, C, s.x, s.y, s.a, 14, s.k);
    }
    // the cut at the target
    const arrive = LAUNCH + i * STEP + TRAVEL;
    const v = t - arrive;
    if (v >= 0 && v < 0.24) cut(p, C, s.tx ?? TX, s.ty ?? -30, s.a, v / 0.24, S, i);
  }

  // contact light and the floor under the target
  if (after > 0.01) {
    p.ellipse(TX, -1, 20 + 8 * after, 4.2, C[4], 0.18 * after);
    p.glow(TX, -20, 44, C[4], 0.16 * after);
    runeSeal(p, TX, -1, 24 + 4 * Math.sin(t * 4), -t * 0.9, C, 0.32 * after, { sq: 0.2, n: 24, tick: 2 });
  }

  // the final wheel round the target flares once, then sheds leaves
  if (t > VORTEX - 0.06 && t < 2.3) {
    const q = smooth(VORTEX - 0.06, VORTEX + 0.14, t) * (1 - smooth(1.95, 2.3, t));
    p.ring(TX, -38, 30 + 4 * q, 1, C[6], 0.3 * q);
    p.glowRing(TX, -38, 30 + 4 * q, 10, C[4], 0.14 * q);
    p.ellipse(TX, -1, 30, 5, C[4], 0.2 * q);
    glint(p, TX, -38, 3, C[6], 0.25 * q);
  }

  // leaves falling out of the spent cloud
  const leafK = smooth(LAUNCH + 0.6, LAUNCH + 1.1, t) * (1 - smooth(2.55, 2.84, t));
  if (leafK > 0.01) {
    for (let i = 0; i < 10; i++) {
      const B = rng(S, i, 23), born = LAUNCH + 0.5 + B.range(0, 1.4), age = t - born;
      if (age < 0) continue;
      const x = CLOUD_C[0] + B.range(-20, 30) + Math.sin(age * 2.4 + i) * 4 + age * 6;
      const y = CLOUD_C[1] + B.range(-6, 16) + age * 13 + Math.sin(age * 3 + i * 2) * 2;
      if (y > -1) continue;
      p.dot(x, y, C[3], 0.4 * leafK);
      p.dot(x + 1, y, C[4], 0.3 * leafK);
    }
  }
}
