// 云从剑 / 天丛云剑: the storm sword. Wind gathers along the blade, a sea of murakumo rolls in above the
// field, and one rising draw cut opens the sky: a white cutting line carves a dark seam through the clouds,
// the torn bank lifts and spills wind, and the target takes the point. Cloud wisps and teal motes hang after.
import { READY, WHITE, clamp, ease, fit, loopNoise, rng, smooth, sparkle, TAU } from "../../core/index.js";
import { crackFan, drawCracks, floorLight, hotStar } from "../dragonball/_lib.js";
import { glint, pool } from "../pickups/_lib.js";
import { STORM, cloudBank, floorSeal } from "./_lib.js";

const END = 3.2, CUT = 0.48, HIT = 0.64;
const TX = 226, TY = -30;
const BX = 186, BY = -62, BW = 132, BH = 58;
// the cutting line: from the blade's tip to the far edge of the cloud sea
const X0 = 26, Y0 = -18, X1 = 262, Y1 = -56;

export const meta = {
  name: "Ame-no-Murakumo",
  desc: "The storm sword gathers wind, rolls a sea of murakumo in and opens it with one rising cut: a white line carves a seam, torn clouds spill wind and the target takes the point.",
  tags: ["kami", "japan", "shinto", "sword", "storm", "cloud", "wind", "云从剑", "天丛云剑", "草薙剑", "technique", "one-shot"],
  size: [360, 220],
  origin: [90, 190],
  duration: END,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: STORM, seed: 32 },
};

const GUARD = { ...READY, weapon: "kusanagi", x: -2, sa: -0.25, fx: 10, fy: -21, bx: 5, by: -24, ffx: 6, fbx: -7 };
const WIND = { ...GUARD, x: -8, crouch: 5, lean: -5, turn: 0.5, fx: -3, fy: -17, bx: 8, by: -27, sa: -2.75, ffx: 8, fbx: -9 };
const CUTP = { ...GUARD, x: 4, crouch: 4, lean: 6, turn: 0.02, fx: 21, fy: -30, bx: -4, by: -23, sa: 0.5, ffx: 13, fbx: -10, ghost: 1 };

export const act = {
  target: { x: TX },
  poses: [
    [-0.45, GUARD],
    [0.12, WIND],
    [0.42, WIND],
    [0.52, { ...CUTP, sa: 0.24 }, "snap"],
    [HIT, CUTP, "snap"],
    [1.12, { ...CUTP, x: 6, crouch: 3, lean: 4, sa: 0.66, ghost: 0 }],
    [1.9, GUARD],
    [3.0, GUARD],
  ],
  hits: [
    { t: HIT, stop: 0.16, shake: 0.4, amp: 3, push: 2.6, straw: 22, skin: "shock" },
    { t: 1.1, stop: 0.04, shake: 0.12, amp: 1, push: 0, straw: 3, skin: null },
  ],
  dust: [{ t: HIT, x: TX, n: 10, dir: -1, c: "#c4fff0" }],
};

/** The cutting line at time t: how far it has opened, its brightness, and the width of the carved seam. */
function cutAt(t) {
  if (t < CUT) return null;
  const reach = ease.outQuart(clamp((t - CUT) / 0.14));
  const open = 1 - smooth(1.35, 2.2, t);
  return { reach, open, seam: smooth(CUT, CUT + 0.16, t) * (1 - smooth(2.4, 3.1, t)) };
}

/** The line's point at u (0 at the caster, 1 at the far edge), through the target's chest. */
const lineAt = (u) => [X0 + (X1 - X0) * u, Y0 + (Y1 - Y0) * u];

export function drawBack(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), ph = t / END;
  const fade = 1 - smooth(2.5, 3.15, t);
  const c = cutAt(t);
  // the sea of clouds: one bank that the cut carves in two along a dark seam
  const lift = c ? c.seam : 0;
  cloudBank(p, C, BX, BY - lift * 14, BW, BH, 5, ph, 0.72 * fade);
  if (lift > 0.02) {
    // the lower torn edge, peeled away below the cut
    for (let i = 0; i < 9; i++) {
      const u = i / 8, [lx, ly] = lineAt(0.28 + u * 0.7);
      const off = 10 + 12 * lift + loopNoise(ph, 1, 7 + i) * 5;
      const cx = Math.min(252, lx + 6);
      p.ellipse(cx, ly + off, 18 + lift * 8, 5 + lift * 3, C[2], 0.4 * lift * fade);
      p.ellipse(cx, ly + off - 2, 11, 3, C[3], 0.28 * lift * fade);
    }
  }
}

export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8), S = o.seed, ph = t / END;
  const R = rng(S, Math.floor(t * 30), 3);
  const c = cutAt(t);
  const fade = 1 - smooth(2.55, 3.15, t);
  const gather = smooth(0.02, CUT, t) * (1 - smooth(CUT + 0.1, CUT + 0.4, t));

  // the wind comes first: long solid streaks crossing the field toward the far edge, each with a white head
  const windK = smooth(0.02, 0.4, t) * fade;
  if (windK > 0.02) {
    for (let i = 0; i < 5; i++) {
      const B = rng(S, i, 5);
      const y = -26 - i * 22 + Math.sin(ph * TAU * 2 + i) * 2;
      const x0 = -80 + ((t * (34 + i * 12) + B.range(0, 150)) % 230);
      const len = 46 + B.range(0, 34);
      const xa = x0, xb = x0 + len * 0.55, xc = x0 + len;
      p.polyline([[xa, y + 3], [xb, y - 1], [xc - 3, y + 2]], C[3], 0.9 * windK);
      p.line(xa + 6, y + 3, xb, y, C[2], 0.6 * windK);
      p.dot(xc - 4, y + 1, C[5], 0.85 * windK);
      p.dot(xc - 3, y + 2, WHITE, 0.7 * windK);
      if (i % 2 === 0) p.line(xa + 10, y + 8, xb + 6, y + 5, C[2], 0.5 * windK);
    }
    // a low ground gale at the far end
    p.ellipse(TX - 2, -1, 26, 4, C[3], 0.18 * windK);
    floorLight(p, TX, C, 0.16 * windK, 30);
  }

  // the blade drinks the wind: sparks climb the edge, the tip holds a white point
  if (gather > 0.01) {
    const tip = [26 + 4 * gather, -18 - 2 * gather];
    p.glow(tip[0], tip[1], 6 + 10 * gather, C[5], 0.22 * gather);
    p.glow(tip[0], tip[1], 3, WHITE, 0.2 * gather);
    for (let i = 0; i < 8; i++) {
      const B = rng(S, i, 11), a = B.range(0, TAU) + t * 3;
      const d = 5 + B.range(0, 13) * (1 - gather * 0.4);
      p.dot(tip[0] + Math.cos(a) * d, tip[1] + Math.sin(a) * d * 0.7, i % 3 ? C[4] : C[6], 0.5 * gather);
    }
    p.glow(10, -26, 20, C[4], 0.1 * gather);
  }

  // the cut: a dark seam carved through the cloud, a white line inside it, a second cooler line shadowing it
  if (c) {
    const { reach, open, seam } = c;
    const x2 = X0 + (X1 - X0) * reach, y2 = Y0 + (Y1 - Y0) * reach;
    if (seam > 0.02) {
      const w = 1.5 + 3.4 * seam;
      p.line(X0, Y0, x2, y2, C[0], 0.92 * seam);
      p.line(X0, Y0 + w, x2, y2 + w, C[0], 0.55 * seam);
      // cloud rim caught on the cut: broken hot pixels along both borders
      for (let i = 0; i < 26; i++) {
        const B = rng(S, i, 17), u = B.range(0.1, 1) * reach;
        const [lx, ly] = lineAt(u);
        p.dot(lx + B.range(-2, 2), ly - w - 1 - B.range(0, 2), i % 3 ? C[5] : WHITE, 0.6 * seam);
        if (i % 2) p.dot(lx + B.range(-2, 2), ly + w + 1 + B.range(0, 2), C[4], 0.45 * seam);
      }
    }
    if (open > 0.02) {
      p.line(X0, Y0, x2, y2, WHITE, 0.95 * open);
      p.line(X0, Y0 - 1.2, x2, y2 - 1.2, C[6], 0.55 * open);
      p.line(X0, Y0 + 1.6, x2, y2 + 1.6, C[4], 0.4 * open);
      p.glowLine(X0, Y0, x2, y2, 9, C[4], 0.05 * open);
      p.glowLine(X0, Y0, x2, y2, 3, WHITE, 0.05 * open);
      // the point runs ahead of the line
      const head = lineAt(reach);
      glint(p, head[0], head[1], Math.round(2 + 4 * (1 - reach)), WHITE, 0.3 * open);
    }
  }

  // the target takes the point: a white heart, a wind ring and the floor pulled into a gale
  if (t >= HIT && t < HIT + 0.75) {
    const q = (t - HIT) / 0.75, f = 1 - q;
    p.circle(TX, TY, 3 + 13 * ease.outQuad(q), WHITE, 0.9 * f);
    hotStar(p, TX, TY, 16 * f + 5, 0.4, C, 0.8 * f);
    sparkle(p, TX, TY, 18 * f + 4, WHITE, C[5], 0.8 * f);
    for (let i = 0; i < 16; i++) {
      const B = rng(S, i, 23), a = B.range(-Math.PI, 0), sp = B.range(30, 110);
      const d = q * sp, x = Math.min(262, TX + Math.cos(a) * d), y = TY + Math.sin(a) * d + q * q * 22;
      p.dot(x, y, i % 3 ? C[5] : WHITE, 0.8 * f);
    }
    pool(p, TX, 0, 32, 8, C[4], 0.35 * f);
    p.ellipse(TX, -1, 12 + q * 30, 3.6 + q * 2.4, C[5], 0.22 * f);
    p.glow(TX, TY, 40, C[4], 0.2 * f);
    p.glow(TX, TY, 16, WHITE, 0.22 * f);
  }

  // torn cloud wisps spill from the seam and drift off; teal motes cool in the air
  const wisp = smooth(CUT + 0.08, CUT + 0.4, t) * fade;
  if (wisp > 0.02) {
    for (let i = 0; i < 12; i++) {
      const B = rng(S, i, 29);
      const [bx, by] = lineAt(0.3 + (i / 12) * 0.7);
      const age = t - CUT - B.range(0.05, 0.35);
      if (age < 0) continue;
      const up = B.next() > 0.45 ? -1 : 1;
      const x = Math.min(246, bx + B.range(-20, 22) + Math.sin(age * 1.8 + i) * 4);
      const y = by + up * (6 + age * B.range(8, 26)) + age * age * 3;
      const k = (1 - age / 1.6) * wisp;
      if (k <= 0.02) continue;
      p.ellipse(x, y, 8 + age * 4, 2.4 + age * 1.2, i % 3 ? C[3] : C[4], 0.3 * k);
      if (i % 4 === 0) p.dot(x, y - 1, C[6], 0.4 * k);
    }
    for (let i = 0; i < 14; i++) {
      const B = rng(S, i, 31);
      const x = BX - BW / 2 + B.range(0, BW), y = BY + B.range(-10, 30) - ((t - CUT) * B.range(6, 18)) % 30;
      p.dot(x, y, i % 3 ? C[4] : C[5], 0.4 * wisp * B.range(0.4, 1));
    }
  }

  // the low scar stays in the cloud, cooling from white to storm teal
  const scar = smooth(HIT, HIT + 0.15, t) * (1 - smooth(2.5, 3.05, t));
  if (scar > 0.02) {
    const x2 = X0 + (X1 - X0) * 0.94, y2 = Y0 + (Y1 - Y0) * 0.94;
    p.line(X0 + 20, Y0 - 2, x2, y2 - 2, C[4], 0.3 * scar);
    p.line(X0 + 26, Y0 - 3, x2, y2 - 3, C[5], 0.18 * scar);
  }
}
