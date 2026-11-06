// Chidori rush: a crouch, a palm of lightning, then he is gone — a streak of posed after-images across the
// floor, a raking current trailing the hand, and a Chidori thrust that opens the target. The dash is carried
// by the act's `ghost` poses; the effect owns the current, the speed lines, the dust and the hit.
import { fit, clamp, smooth, ease, rng, TAU, WHITE, sparkle, band, burst, fly, READY } from "../../core/index.js";
import { VOLT, zigzag, crackle, bowed, stroke } from "../lightning/_lib.js";

const CHARGE = 0.52, GO = 0.58, HIT = 1.04, END = 2.7;
const DASH = 246, TX = 292, TY = -30;       // body travels 0..DASH; the target is just past the palm
const HAND = 10;                             // palm offset from the body's feet

export const meta = {
  name: "Chidori rush",
  desc: "A crouch, a palmful of lightning, and he crosses the floor in a streak of after-images — the Chidori opens the target in a white flash, then the trail cools to a scorched line.",
  tags: ["chakra", "ninjutsu", "lightning", "chidori", "dash", "rush", "technique", "one-shot"],
  size: [420, 160],
  origin: [70, 142],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: VOLT, seed: 13 },
};

const bodyX = (t) => DASH * clamp((t - GO) / (HIT - GO), 0, 1);
const handAt = (t) => [bodyX(t) + HAND, -14 - 7 * smooth(GO, 0.7, t)];

const CHARGE_POSE = { ...READY, x: 0, crouch: 8, lean: -3, turn: 1, fx: 10, fy: -14, bx: -6, by: -20, ffx: 8, fbx: -4, armsFront: true };
const DASH_POSE = { ...READY, x: 0, crouch: 3, lean: 12, turn: 1, fx: 10, fy: -21, bx: -7, by: -16, ffx: 8, fbx: -5, toeB: true };
const HIT_POSE = { ...READY, x: DASH, crouch: 5, lean: 8, turn: 1, fx: 10, fy: -22, bx: -3, by: -16, ffx: 8, fbx: -2, toeB: true };
const SKID = { ...HIT_POSE, x: DASH + 4, crouch: 9, lean: -5, fx: 5, fy: -18, bx: -5, by: -22, ffx: 4, fbx: -4 };

const dashPose = (t) => ({ ...DASH_POSE, x: bodyX(t), ghost: 1 });

export const act = {
  ghost: "#9fefff",
  target: { x: TX },
  poses: [
    [-0.5, READY],
    [0.08, CHARGE_POSE],
    [0.46, { ...CHARGE_POSE, crouch: 9, lean: -4, fx: 9, fy: -12 }],
    [0.54, { ...CHARGE_POSE, crouch: 6, lean: 4, ghost: 1 }],
    [0.58, { ...DASH_POSE, x: 0, ghost: 1 }, "snap"],
    [0.64, dashPose(0.64), "line"],
    [0.70, dashPose(0.70), "line"],
    [0.76, dashPose(0.76), "line"],
    [0.82, dashPose(0.82), "line"],
    [0.88, dashPose(0.88), "line"],
    [0.94, dashPose(0.94), "line"],
    [1.0, dashPose(1.0), "line"],
    [HIT, { ...HIT_POSE, ghost: 1 }, "snap"],
    [1.08, { ...HIT_POSE, x: DASH + 4, crouch: 8, lean: 3 }, "snap"],
    [1.16, SKID, "snap"],
    [1.5, { ...SKID, x: DASH - 2, crouch: 7 }],
    [1.9, { ...HIT_POSE, crouch: 5, lean: 4 }],
    [2.5, { ...HIT_POSE, crouch: 4, lean: 2 }],
    [END, { ...HIT_POSE, crouch: 4, lean: 2 }],
  ],
  hits: [{ t: HIT, stop: 0.14, shake: 0.5, amp: 3, target: true }],
  dust: [
    { t: GO, x: 0, n: 10, dir: -1, c: "#9fdcff" },
    { t: 0.74, x: 70, n: 5, dir: -1 },
    { t: 0.92, x: 170, n: 5, dir: -1 },
    { t: HIT, x: DASH, n: 8, dir: 1, c: "#9fdcff" },
    { t: 1.2, x: DASH, n: 6, dir: -1 },
  ],
};

// a palm orb: dark shell, hot body, white heart, forks spitting off the rim
function palmOrb(p, C, x, y, r, k, S, frame) {
  p.circle(x, y, r + 1, C[2], 0.85 * k);
  p.circle(x, y, r, C[3], 0.9 * k);
  p.circle(x - 1, y - 1, r * 0.55, C[5], 0.95 * k);
  p.dot(x, y, WHITE, k);
  const R = rng(S, frame, 2);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + R.range(-0.3, 0.3), l = R.range(3, 9);
    const b = zigzag(R, x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l), 0.45, 0, 1);
    crackle(p, b, 0.8 * k, C, 0.18, 0.9);
  }
  p.glow(x, y, 18, C[5], 0.45 * k);
}

// two ragged ribbons trailing the palm, plus forks near the wrist
function trail(p, C, t, hx, hy, k, S) {
  for (let i = 0; i < 2; i++) {
    const R = rng(S, Math.floor(t * 30), 20 + i);
    const x1 = Math.max(-54, hx - (70 + i * 38)), y1 = -10 - i * 7;
    const b = bowed(R, hx, hy, x1, y1, R.range(-16, 10), 0.32, 0.28);
    stroke(p, b, 0.42 * k, C, 0.9, { light: 0.25, core: 0.85 });
    if (i === 0) crackle(p, b, 0.3 * k, C, 0.12, 0.9);
  }
  const R = rng(S, Math.floor(t * 40), 23);
  for (let i = 0; i < 3; i++) {
    const a = R.range(0, TAU), l = R.range(5, 16);
    const b = zigzag(R, hx, hy, hx + Math.cos(a) * l, hy + Math.sin(a) * l * 0.8, 0.5, 0, 1);
    crackle(p, b, 0.55 * k, C, 0.15, 0.9);
  }
}

function speedLines(p, C, t, hx, k) {
  for (let i = 0; i < 7; i++) {
    const y = -6 - i * 4 + Math.sin(t * 30 + i) * 1.5;
    const x0 = Math.max(-58, hx - 18 - i * 11 - ((t * 170) % 24));
    const len = 14 + (i % 3) * 9;
    p.line(x0, y, Math.max(-58, x0 - len), y, i % 3 ? C[5] : C[6], (0.18 + 0.07 * (i % 2)) * k);
  }
}

function footDust(p, C, t, x, k) {
  for (let i = 0; i < 4; i++) {
    const xx = Math.max(-50, x - i * 9 - ((t * 90) % 8));
    p.disc(xx, -1, 2 + i * 0.7, C[3], 0.11 * k);
    p.dot(xx + 1, -2 - (i % 2), i % 2 ? C[6] : C[5], 0.35 * k);
  }
  const R = rng(13, Math.floor(t * 36), 31);
  for (let i = 0; i < 5; i++) {
    const a = R.range(-2.9, -0.3), sp = R.range(10, 40);
    p.dot(x + Math.cos(a) * sp * 0.25, -1 + Math.sin(a) * sp * 0.25, i % 2 ? C[5] : C[6], 0.4 * k);
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed;
  const [hx, hy] = handAt(t);
  const x = bodyX(t);
  const orb = smooth(0.02, 0.28, t) * (1 - smooth(1.0, 1.5, t));
  const charge = smooth(0.02, 0.3, t) * (1 - smooth(0.56, 0.68, t));
  const dash = smooth(GO, 0.66, t) * (1 - smooth(1.12, 1.42, t));
  const live = 1 - smooth(1.7, 2.55, t);
  const R = rng(S, Math.floor(t * 24), 1);

  // charge: the air is pulled into the palm, current climbs the arm and the feet, dust lifts
  if (charge > 0.01) {
    for (let i = 0; i < 16; i++) {
      const a = R.range(0, TAU), d = 9 + R.range(0, 24) * (1 - clamp(t / CHARGE));
      const px = hx + Math.cos(a) * d, py = hy + Math.sin(a) * d * 0.85;
      if (py > -1) continue;
      p.dot(px, py, i % 4 ? C[5] : C[6], 0.45 * charge);
    }
    for (let i = 0; i < 3; i++) {
      const b = bowed(R, hx, hy, 5, -29, R.range(-6, 3), 0.3, 0.2);
      crackle(p, b, 0.55 * charge, C, 0.22, 0.8);
    }
    for (let i = 0; i < 3; i++) {
      const b = bowed(R, -2 + i * 3, -1, 4 + i * 4, -14, 2, 0.5, 0.2);
      crackle(p, b, 0.4 * charge, C, 0.12, 0.8);
    }
    p.circle(hx, hy, 2 + 0.6 * Math.sin(t * 40), WHITE, charge);
    p.glow(hx, hy, 16, C[4], 0.2 * charge);
  }

  // the palm orb rides the hand through the launch and the dash
  if (orb > 0.01) {
    const r = 4 + 1.6 * smooth(0.05, 0.6, t) + 0.5 * Math.sin(t * 36);
    palmOrb(p, C, hx, hy, r, orb, S, Math.floor(t * 18));
    p.ring(hx, hy, r + 3.2 + Math.sin(t * 12) * 1.4, 1, C[5], 0.3 * orb);
    p.circle(hx, hy, 1, WHITE, orb);
  }

  // the launch: a white ring on the floor, a flash and a spray of dust behind the feet
  if (t > GO - 0.05 && t < GO + 0.2) {
    const q = clamp((t - (GO - 0.05)) / 0.16, 0, 1), f = 1 - q;
    p.circle(0, -10, 5 + 22 * ease.outQuad(q), WHITE, 0.85 * f);
    sparkle(p, 0, -4, 10 * f + 4, C[6], C[4], 0.7 * f);
    band(p, 0, 0, 8 + 44 * ease.outQuad(q), 0.2, 2, 0.4 * f, C, undefined, q < 0.3);
    p.glow(0, -4, 38, C[5], 0.4 * f);
  }

  // the dash: ribbons of current off the palm, speed lines, grit off the toes, a short leading lance
  if (dash > 0.02) {
    trail(p, C, t, hx, hy, dash, S);
    speedLines(p, C, t, hx, dash);
    footDust(p, C, t, x, dash);
    if (t < HIT + 0.08) {
      const l = 10 + 24 * smooth(0.88, 0.98, t);
      const b = zigzag(R, hx, hy, Math.min(TX, hx + l), hy - 4, 0.4, 0.2, 1);
      stroke(p, b, 0.7 * dash, C, 1.0, { light: 0.3, core: 1.2 });
    }
  }

  // the thrust: the current reaches the target and the floor jumps
  if (t > 0.98 && t < 1.34) {
    const k = smooth(0.98, 1.04, t) * (1 - smooth(1.12, 1.34, t));
    const b = zigzag(R, hx, hy, TX, TY, 0.14, 0.5, 1.2, 0);
    stroke(p, b, k, C, 1.7, { hero: t < 1.12, light: 0.5, core: 1.7 });
    for (let i = 0; i < 4; i++) {
      const a = Math.atan2(TY - hy, TX - hx) + R.range(-0.5, 0.5), l = R.range(7, 18);
      const c = zigzag(R, hx, hy, hx + Math.cos(a) * l, hy + Math.sin(a) * l, 0.5, 0, 1);
      crackle(p, c, 0.7 * k, C, 0.16, 0.9);
    }
  }

  // the hit: white core, forks through the target, a ground shock and a fan of debris
  if (t >= HIT) {
    const q = t - HIT;
    if (q < 0.14) {
      const f = 1 - q / 0.14;
      p.circle(TX, TY, 5 + 12 * ease.outQuad(q / 0.14), WHITE, f);
      sparkle(p, TX, TY, 16 * f + 4, C[6], C[4], 0.85 * f);
      p.glow(TX, TY, 62, WHITE, 0.65 * f);
      p.glow(TX, TY, 38, C[5], 0.5 * f);
    }
    const k = 0.9 * (1 - smooth(0.3, 1.05, q));
    if (k > 0.02) {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + R.range(-0.3, 0.3), l = R.range(16, 40);
        const b = zigzag(R, TX, TY, TX + Math.cos(a) * l, TY + Math.sin(a) * l, 0.3, 0.2, 1);
        crackle(p, b, k, C, 0.16, 0.9);
      }
    }
    for (let i = 0; i < 3; i++) {
      const rr = 12 + q * (26 + i * 8), a = clamp(1 - rr / 58, 0, 1) * (1 - smooth(0.35, 0.95, q)) * (i ? 0.22 : 0.4);
      if (a > 0.005) band(p, TX, 0, rr, 0.22, 1.8, a, C, undefined, q < 0.12);
    }
    burst(34, S + 5, (B) => {
      const a = B.range(0, TAU), sp = B.range(20, 85), life = B.range(0.4, 1.2), age = q - B.range(0, 0.05);
      if (age < 0 || age > life) return;
      const [bx, by] = fly(TX, TY, Math.cos(a) * sp, Math.sin(a) * sp - 22, age, 120, 1.0);
      if (by > -0.5 || bx > 344 || bx < -58) return;
      p.dot(bx, by, age < 0.08 ? WHITE : B.chance(0.4) ? C[6] : C[5], 0.8 * (1 - age / life));
    });
    burst(18, S + 9, (B) => {
      const a = B.range(-2.9, -0.25), sp = B.range(18, 62), life = B.range(0.7, 1.6), age = q - B.range(0, 0.1);
      if (age < 0 || age > life) return;
      const [bx, by] = fly(TX + B.range(-10, 10), -1, Math.cos(a) * sp, Math.sin(a) * sp, age, 170, 0.5);
      if (by > -1 || bx > 344 || bx < -58) return;
      p.rect(bx, by, B.chance(0.3) ? 2 : 1, 1, B.chance(0.5) ? C[2] : C[1], 0.85 * (1 - age / life));
    });
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 11), q2 = clamp(q / 1.5);
      if (q2 >= 1) continue;
      p.disc(TX + B.range(-14, 14), -2 - q2 * 9, 3 + B.range(1, 4) + q2 * 9, C[3], 0.14 * (1 - q2));
    }
    if (q < 0.8) {
      const k2 = 0.55 * (1 - q / 0.8);
      for (let i = 0; i < 3; i++) {
        const dir = i % 2 ? 1 : -1, b = bowed(R, TX, 0, TX + dir * (14 + i * 7), -1, 2, 0.5, 0.1);
        crackle(p, b, k2, C, 0.15, 0.8);
      }
    }
  }

  // the skid and the cooling
  if (t > HIT + 0.06 && t < 2.3) {
    const q = t - HIT, k = (1 - smooth(0.2, 1.3, q)) * live;
    for (let i = 0; i < 4; i++) {
      p.disc(DASH + 2 - i * 5, -1, 3 + i * 0.7, C[3], 0.1 * k);
    }
    for (let i = 0; i < 2; i++) p.line(DASH - 16 + i * 4, 0, DASH + 2, 0 + i, C[1], 0.3 * k);
    if (live > 0.01) {
      const b = bowed(R, DASH + HAND, -21, DASH + R.range(-6, 8), -21, 3, 0.4, 0.2);
      crackle(p, b, 0.28 * live, C, 0.1, 0.7);
      p.glow(DASH, -1, 28, C[4], 0.14 * live);
    }
  }

  // last smoke and arcs, then nothing
  if (t > 1.15 && live > 0.01) {
    for (let i = 0; i < 4; i++) {
      const B = rng(S, i, 17), q = clamp((t - 1.15) / 1.3);
      p.disc(DASH + B.range(-18, 12), -6 - q * (8 + B.range(0, 10)), 5 + B.range(2, 5) + q * 6, C[3], 0.12 * live * (1 - q));
    }
    const b = bowed(R, DASH + HAND - 2, -21, DASH + R.range(-8, 10), -22, 3, 0.5, 0.2);
    crackle(p, b, 0.24 * live, C, 0.1, 0.7);
  }
}

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), x = bodyX(t);
  // the seal under the crouch, and the floor heating along the path
  if (t < 0.84) {
    const k = smooth(0.02, 0.2, t) * (1 - smooth(0.6, 0.84, t));
    if (k > 0.01) {
      for (let i = 0; i < 24; i++) {
        const g = (i / 24) * TAU + t * 2.2;
        if ((i + Math.floor(t * 24)) % 4 === 0) continue;
        p.dot(Math.cos(g) * 22, Math.sin(g) * 22 * 0.22, C[4], k * 0.6);
      }
      p.glowRing(0, 0, 20, 7, C[5], 0.1 * k);
      p.glow(0, -1, 28, C[4], 0.12 * k);
    }
  }
  if (t > GO) {
    const fade = 1 - smooth(1.9, END, t);
    for (let px = 0; px <= x; px += 2) {
      if ((px + Math.floor(px / 3)) % 7 < 2) p.dot(px, 0, C[1], 0.4 * fade);
      if (px % 5 === 0) p.dot(px, 0, C[3], 0.2 * fade);
    }
    p.line(Math.max(0, x - 26), 0, x, 0, C[4], 0.45 * fade);
    p.glow(x, -1, 20, C[4], 0.1 * fade);
    const R = rng(13, Math.floor(t * 8), 41);
    for (let i = 0; i < 8; i++) {
      const px = R.range(0, Math.max(1, x));
      p.rect(px, 0, R.range(2, 5), 1, i % 3 ? C[2] : C[1], 0.35 * fade);
    }
    // two skid gouges at the stop
    if (t > HIT + 0.05) {
      const k = (1 - smooth(0.4, 1.5, t - HIT)) * fade;
      p.line(DASH - 20, 1, DASH + 2, 1, C[1], 0.4 * k);
      p.line(DASH - 16, 2, DASH + 1, 2, C[2], 0.3 * k);
    }
  }
  // the target's floor
  if (t > HIT) {
    const fade = 1 - smooth(1.8, END, t);
    p.disc(TX, -1, 10 + 4 * smooth(0, 0.4, t - HIT), C[1], 0.5 * fade);
    p.ring(TX, -1, 10 + 3 * smooth(0, 0.5, t - HIT), 1, C[4], 0.28 * fade);
  }
}
