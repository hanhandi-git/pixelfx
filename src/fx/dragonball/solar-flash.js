// Solar flare: a handful of light held at the face, then released as a blinding white burst. Every ray is
// drawn from the face outward, so the frame whites out from one point and the after-image comes back slowly.
import { Lights, P, Particles, Rng, clamp, ease, fit, rng, smooth, TAU, WHITE, READY } from "../../core/index.js";
import { KI, floorLight, hotStar } from "./_lib.js";

const D = 2.3, FLASH = 0.42, END = 2.3;
const FACE = [8, -33];

export const meta = {
  name: "Solar flare",
  desc: "Light is held at the face for a breath, then let go: a white burst with sixteen rays, a shock ring, and a slow after-image of drifting sparks while the field stays blinded.",
  tags: ["ki", "dragonball", "flash", "blind", "light", "burst", "technique", "one-shot"],
  size: [280, 180],
  origin: [92, 164],
  duration: D,
  loop: false,
  fps: 30,
  bg: "ground",
  actor: 2,
  options: { palette: KI, seed: 61 },
};

const GUARD = { ...READY, x: 0, crouch: 5, lean: -1, turn: 1, fx: 8, fy: -33, bx: 2, by: -32, ffx: 6, fbx: -7, armsFront: true };
const BURST = { ...READY, x: 2, crouch: 3, lean: -2, turn: 1, fx: 12, fy: -27, bx: -7, by: -27, ffx: 8, fbx: -9, toeB: true };
export const act = {
  poses: [
    [-0.4, READY],
    [0.1, GUARD],
    [FLASH - 0.05, { ...GUARD, crouch: 6, lean: -2, fx: 8.5, fy: -33.5 }],
    [FLASH, BURST, "snap"],
    [0.95, { ...BURST, crouch: 4, fx: 11, fy: -26, bx: -6, by: -26 }],
    [1.5, { ...BURST, crouch: 4, lean: 0, fx: 10, fy: -24, bx: -5, by: -24 }],
    [END, READY],
  ],
  hits: [{ t: FLASH, stop: 0.12, shake: 0.5, amp: 4, push: 1.4, straw: 18, skin: "holy" }],
  dust: [{ t: FLASH, x: 0, n: 8, dir: 0 }],
};

export function create(o) {
  const C = fit(o.palette, 8), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => -1.5, sparks: [WHITE, C[6], C[5]] }), lights = new Lights();
  const rays = (() => {
    const Q = rng(o.seed, 9, 3), out = [];
    for (let i = 0; i < 16; i++) out.push({ a: (i / 16) * TAU + Q.range(-0.08, 0.08), l: Q.range(0.55, 1), w: Q.range(0.6, 1.4) });
    return out;
  })();
  let t = 0, flashed = false;

  return {
    update(dt) {
      t += dt;
      if (t < FLASH) {
        // the light gathering between the hands
        if (t > 0.06 && R.chance(0.7)) {
          const a = R.range(0, TAU), d = R.range(16, 40);
          ps.spawn(P.MOTE, FACE[0] + Math.cos(a) * d, FACE[1] + Math.sin(a) * d * 0.9, -Math.cos(a) * d * 2, -Math.sin(a) * d * 1.8, R.range(0.18, 0.34), R.chance(0.4) ? WHITE : C[6], R.range(0.5, 1.1));
        }
        lights.add(FACE[0], FACE[1], 26, C[5], 0.4 + 0.6 * (t / FLASH), 0.1);
      } else if (!flashed) {
        flashed = true;
        lights.add(FACE[0], FACE[1], 58, WHITE, 3.6, 0.5);
        lights.add(FACE[0], -2, 20, C[4], 2, 1.2);
        for (let i = 0; i < 26; i++) {
          const a = R.range(0, TAU), sp = R.range(50, 210);
          ps.spawn(P.SPARK, FACE[0], FACE[1], Math.cos(a) * sp, Math.sin(a) * sp * 0.8, R.range(0.25, 0.6), R.chance(0.5) ? WHITE : C[6], R.range(0.6, 1.2));
        }
        for (let i = 0; i < 10; i++) {
          const a = R.range(0, TAU), sp = R.range(30, 90);
          ps.spawn(P.VAPOUR, FACE[0], FACE[1], Math.cos(a) * sp, -Math.abs(Math.sin(a) * sp * 0.6), R.range(0.6, 1.1), C[4], R.range(2, 3.4));
        }
      } else if (t > FLASH + 0.3 && t < END - 0.9 && R.chance(0.2)) {
        // the after-image: slow sparks drifting off the burst
        const a = R.range(0, TAU), d = R.range(20, 60);
        ps.spawn(P.MOTE, FACE[0] + Math.cos(a) * d, FACE[1] + Math.sin(a) * d * 0.8, Math.cos(a) * 8, -R.range(4, 16), R.range(0.4, 0.8), R.chance(0.5) ? WHITE : C[6], R.range(0.4, 0.9));
      }
      ps.update(dt);
      lights.update(dt);
    },

    draw(p) {
      const T = t;
      floorLight(p, 0, C, 0.7, 22);
      const gather = smooth(0.1, FLASH, T) * (1 - smooth(FLASH, FLASH + 0.12, T));

      if (T < FLASH + 0.06) {
        // the point of light between the hands
        const r = 1.2 + 4.2 * gather;
        p.circle(FACE[0], FACE[1], r + 1.6, C[5], 0.9);
        p.circle(FACE[0], FACE[1], r, C[6]);
        p.circle(FACE[0] - 0.4, FACE[1] - 0.5, r * 0.5, WHITE);
        p.glow(FACE[0], FACE[1], 18 + 20 * gather, C[5], 0.4 + 0.4 * gather);
        if (gather > 0.5) {
          const f = (gather - 0.5) * 2;
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU + T * 2;
            p.dot(FACE[0] + Math.cos(a) * (r + 3 + 5 * f), FACE[1] + Math.sin(a) * (r + 3 + 5 * f), WHITE, f * 0.8);
          }
        }
      }

      if (T >= FLASH) {
        const q = T - FLASH;
        const k = 1 - smooth(0.02, 0.34, q);
        // the burst: a white core that opens like a shutter, then sixteen spikes standing off it
        const core = 6 + 22 * ease.outQuad(clamp(q / 0.2));
        if (k > 0.02) {
          p.circle(FACE[0], FACE[1], core + 2, C[6], k);
          p.circle(FACE[0], FACE[1], core, WHITE, k);
          p.circle(FACE[0], FACE[1], Math.max(2, core * 0.55), WHITE, k);
          p.ring(FACE[0], FACE[1], core + 2.5, 1.5, C[6], k * 0.9);
          for (const ray of rays) {
            const ca = Math.cos(ray.a), sa = Math.sin(ray.a);
            const grow = ease.outQuad(clamp(q / 0.12));
            const l = (30 + 66 * ray.l) * (0.6 + 0.4 * grow);
            // keep every spike inside the frame: it stops at the floor and at the side walls
            let len = l;
            if (sa > 0.001) len = Math.min(len, (2 - FACE[1]) / sa);
            if (ca > 0.001) len = Math.min(len, (170 - FACE[0]) / ca);
            if (ca < -0.001) len = Math.min(len, (-86 - FACE[0]) / ca);
            len = Math.max(core + 2, len);
            const w = ray.w * (1 - 0.5 * clamp(q / 0.5));
            for (let d = core; d <= len; d += 0.5) {
              const u = d / len;
              p.dot(FACE[0] + ca * d, FACE[1] + sa * d, u < 0.4 ? WHITE : u < 0.78 ? C[6] : C[5], k * (1 - u * 0.8) * w);
              if (w > 1 && u < 0.7) p.dot(FACE[0] + ca * d + (sa > 0 ? 0.8 : -0.8), FACE[1] + sa * d, C[5], k * (1 - u) * 0.5);
            }
          }
          p.glow(FACE[0], FACE[1], 52, C[5], 0.7 * k);
          p.glow(FACE[0], FACE[1], 28, WHITE, 0.5 * k);
        }
        // the shock ring, standing on the floor and flattening out
        for (let i = 0; i < 2; i++) {
          const qq = q - i * 0.05;
          if (qq <= 0) continue;
          const rr = 10 + qq * 90, a = clamp(1 - rr / 92, 0, 1) * (0.55 - i * 0.2);
          if (a > 0.01) p.arc(FACE[0], -2, rr, 2, Math.PI * 1.04, Math.PI * 1.96, i ? C[5] : WHITE, a);
        }
        if (q < 0.5) hotStar(p, FACE[0], FACE[1], 18 + 24 * (1 - q / 0.5), T * 2.5, C, (1 - q / 0.5) * 0.9);
        // the white-out: the whole canvas flashes, not a disc that leaves the frame
        const wash = 1 - smooth(0.01, 0.1, q);
        if (wash > 0.02) {
          p.rect(-92, -164, 280, 180, WHITE, wash * 0.8);
          p.glow(FACE[0], FACE[1], 52, WHITE, wash * 0.7);
        }
        // after-image: dim arcs crawling out and fading, kept above the floor
        if (q > 0.3 && q < 1.2) {
          const f = 1 - smooth(0.3, 1.2, q);
          for (let i = 0; i < 2; i++) p.arc(FACE[0], FACE[1], 26 + (q - 0.3) * (36 + i * 20), 1, Math.PI * 1.05, Math.PI * 1.95, C[5], f * 0.3);
        }
      }

      ps.draw(p, "back");
      ps.draw(p);
      lights.draw(p);
    },
  };
}
