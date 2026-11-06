// Melee choreography and contact VFX for the equipment set. Pixels and light stay separate.
import { fit, rng, fly, clamp, smooth, ease, sparkle, skeleton, meleeWeaponOf } from "../../core/index.js";
import { swing, slash } from "./_lib.js";

export function weaponAttack(config) {
  const weapon = meleeWeaponOf(config.weapon), thrust = weapon.family === "thrust", heavy = weapon.family === "slam";
  const D = config.duration ?? 1.5;
  const style = weapon.id === "kunai" || weapon.id === "dagger" ? "rapid"
    : weapon.id === "staff" ? "staff"
    : weapon.id === "lance" || weapon.id === "spear" ? "lance"
    : weapon.id === "holy-sword" ? "holy"
    : weapon.id === "katana" ? "draw"
    : weapon.id === "war-mace" ? "mace"
    : weapon.id === "rapier" ? "rapier" : thrust ? "lance" : heavy ? "mace" : "sweep";
  const STYLE = {
    rapid: { two: false, guard: { x: -3, fx: 3, fy: -20, bx: 5, by: -25, sa: -1.35, crouch: 3, lean: -1 }, wind: { x: -7, fx: -5, fy: -18, bx: 3, by: -28, sa: -1.9, crouch: 5, lean: -3 }, recovery: { x: 1, fx: 12, fy: -22, bx: 1, by: -26, sa: -0.65, crouch: 3 }, sweep: 2 / 30, span: 1.55 },
    staff: { two: true, guard: { x: -4, fx: 8, fy: -20, bx: -9, by: -27, sa: -0.75, crouch: 3, lean: 0 }, wind: { x: -9, fx: -13, fy: -27, bx: -11, by: -18, sa: -2.55, crouch: 5, lean: -4 }, recovery: { x: 2, fx: 11, fy: -28, bx: -7, by: -22, sa: 0.6, crouch: 3 }, sweep: 4 / 30, span: 2.45 },
    lance: { two: true, guard: { x: -6, fx: 8, fy: -21, bx: -3, by: -25, sa: -0.2, crouch: 3, lean: -1 }, wind: { x: -13, fx: -9, fy: -19, bx: -2, by: -29, sa: 0.05, crouch: 6, lean: -5, ffx: 9, fbx: -8 }, recovery: { x: 6, fx: 22, fy: -20, bx: 6, by: -25, sa: 0.05, crouch: 5, lean: 7, ffx: 15, fbx: -11, toeB: true }, sweep: 2 / 30, span: 0.25 },
    holy: { two: true, guard: { x: -5, fx: 8, fy: -22, bx: -3, by: -25, sa: -0.7, crouch: 2 }, wind: { x: -8, fx: -3, fy: -39, bx: 7, by: -34, sa: -2.55, crouch: 5, lean: -5, ffx: 7, fbx: -7 }, recovery: { x: 3, fx: 19, fy: -23, bx: 2, by: -29, sa: 0.7, crouch: 6, lean: 6, ffx: 12, fbx: -10, toeB: true }, sweep: 5 / 30, span: 2.35 },
    draw: { two: false, guard: { x: -5, fx: 8, fy: -22, bx: 4, by: -24, sa: -0.15, crouch: 2 }, wind: { x: -11, fx: -5, fy: -20, bx: 7, by: -25, sa: -2.9, crouch: 5, lean: -5, ffx: 8, fbx: -8 }, recovery: { x: 5, fx: 20, fy: -27, bx: -4, by: -25, sa: -0.1, crouch: 4, lean: 5, ffx: 12, fbx: -10 }, sweep: 2 / 30, span: 2.7 },
    mace: { two: true, guard: { x: -5, fx: 7, fy: -21, bx: -3, by: -27, sa: -0.8, crouch: 3 }, wind: { x: -8, fx: 0, fy: -35, bx: 9, by: -30, sa: -2.75, crouch: 8, lean: -7, ffx: 7, fbx: -8 }, recovery: { x: 4, fx: 17, fy: -19, bx: -1, by: -27, sa: 0.75, crouch: 8, lean: 8, ffx: 14, fbx: -11, toeB: true }, sweep: 6 / 30, span: 1.8 },
    rapier: { two: false, guard: { x: -5, fx: 9, fy: -25, bx: 4, by: -23, sa: -0.25, crouch: 2, lean: -1 }, wind: { x: -11, fx: -4, fy: -21, bx: 7, by: -27, sa: -0.45, crouch: 4, lean: -3, ffx: 7, fbx: -8 }, recovery: { x: 8, fx: 25, fy: -21, bx: -5, by: -24, sa: 0.02, crouch: 3, lean: 8, ffx: 16, fbx: -11, toeB: true }, sweep: 2 / 30, span: 0.2 },
    sweep: { two: !!config.two, guard: { x: -4, fx: 7, fy: -24, bx: -4, by: -23, sa: -0.9, crouch: 2 }, wind: { x: -6, fx: 0, fy: -33, bx: 7, by: -27, sa: -2.1, crouch: 4, lean: -2 }, recovery: { x: 2, fx: 12, fy: -25, bx: -5, by: -24, sa: 0.3, crouch: 3, lean: 3 }, sweep: 3 / 30, span: 2.1 },
  }[style];
  const two = STYLE.two;
  const guard = { weapon: weapon.id, two, ffx: 5, fbx: -6, ...STYLE.guard };
  const wind = { ...guard, ...STYLE.wind };
  const cues = config.hits.map((time, i) => {
    const angle = style === "lance" || style === "rapier" ? STYLE.recovery.sa : style === "draw" ? -0.1 : style === "mace" ? 0.7 : style === "holy" ? 0.6 : style === "staff" ? (i % 2 ? 0.75 : -0.85) : style === "rapid" ? (i % 2 ? -0.55 : -1.05) : i % 2 ? -0.3 : 0.3;
    const q = { ...guard, ...STYLE.recovery, weapon: weapon.id, two, sa: angle, ghost: 1 };
    const hand = skeleton(q).joints.handN;
    const tx = hand[0] + q.x + Math.cos(angle) * weapon.tip, ty = hand[1] + Math.sin(angle) * weapon.tip;
    const sweep = STYLE.sweep;
    const start = Math.max(0, time - sweep), dir = i % 2 ? -1 : 1;
    const span = STYLE.span;
    const sy = weapon.id === "katana" ? 0.28 : weapon.id === "staff" ? 0.62 : 1;
    const arc = swing({ cx: tx - Math.cos(angle) * weapon.tip, cy: ty - Math.sin(angle) * weapon.tip * sy,
      R: weapon.tip, sy, a0: angle - dir * span, dir, span, W: config.width ?? 6,
      t0: start, sweep: Math.max(1 / 30, time - start), hold: 1 / 30, trail: heavy ? 0.35 : 0.23 });
    return { time, start, tx, ty, q, arc };
  });
  const poses = [[-config.windup, guard], [-0.12, wind], [0, wind]];
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    if (i) poses.push([c.start, { ...wind, x: style === "staff" ? -2 : 2, sa: c.q.sa - c.arc.dir * (style === "rapid" ? 0.4 : 1.7) }, "snap"]);
    if (!thrust && style !== "rapid" && style !== "draw") poses.push([(c.start + c.time) / 2, { ...c.q, ...wind, fx: c.q.fx - (style === "staff" ? 3 : 6), fy: c.q.fy - (style === "holy" ? 5 : 3), sa: c.q.sa - c.arc.dir * 0.9 }, "snap"]);
    poses.push([c.time, c.q, "snap"], [c.time + (style === "rapid" ? 0.045 : 0.09), { ...STYLE.recovery, weapon: weapon.id, two, x: STYLE.recovery.x, ghost: 0 }]);
  }
  poses.push([cues.at(-1).time + (style === "mace" ? 0.6 : 0.48), guard]);
  const meta = {
    name: config.name, desc: config.desc, tags: ["melee", weapon.id, weapon.family, "combat", "one-shot"],
    size: [208, 144], origin: [64, 116], duration: D, loop: false, fps: 30, bg: "ground", actor: 2,
    options: { palette: config.palette, seed: config.seed },
  };
  const act = {
    target: { x: Math.round(cues[0].tx) }, poses,
    hits: cues.map((c) => ({ t: c.time, y: c.ty, stop: heavy ? 0.18 : weapon.id === "kunai" ? 0.035 : 0.1,
      shake: heavy ? 0.22 : 0.1, amp: heavy ? 3 : 1, push: heavy ? 3.4 : 1.5,
      straw: heavy ? 20 : 7, ...(weapon.id === "holy-sword" ? { skin: "holy" } : {}) })),
    dust: cues.map((c) => ({ t: c.time, x: c.q.x, n: heavy ? 10 : 4, dir: -1 })),
  };

  function drawBack(p, t, o) {
    if (t < 0 || t >= D) return;
    const C = fit(o.palette, 7);
    if (heavy) for (const c of cues) {
      const age = t - c.time;
      if (age < 0 || age > 0.65) continue;
      const k = 1 - age / 0.65, radius = 6 + ease.outCubic(clamp(age / 0.4)) * 30;
      for (let a = 0; a < Math.PI * 2; a += 0.06)
        p.dot(c.tx + Math.cos(a) * radius, Math.sin(a) * radius * 0.18, C[3], k);
      for (let i = 0; i < 5; i++) {
        const r = rng(o.seed, i), dx = r.range(-26, 26);
        p.polyline([[c.tx, 1], [c.tx + dx * 0.4, r.range(0, 3)], [c.tx + dx, r.range(0, 5)]], C[1], k);
      }
      p.glow(c.tx, -2, 30, C[3], 0.25 * k);
    }
  }
  function draw(p, t, o) {
    if (t < 0 || t >= D) return;
    const C = fit(o.palette, 7);
    for (let ci = 0; ci < cues.length; ci++) {
      const c = cues[ci], age = t - c.time;
      if (thrust) {
        const u = clamp((t - c.start) / Math.max(0.001, c.time - c.start));
        const tail = 1 - smooth(c.time + 0.025, c.time + 0.2, t);
        if (t >= c.start && tail > 0) {
          const x0 = c.tx - weapon.tip - 6, end = x0 + (weapon.tip + 6) * ease.outCubic(u), width = weapon.id === "lance" ? 4 : 2;
          p.poly([[x0, c.ty - width], [end, c.ty], [x0, c.ty + width]], C[3], tail);
          p.line(x0 + 4, c.ty, end, c.ty, C[6], tail);
          for (const s of [-1, 1]) p.line(x0 - 6, c.ty + s * (width + 2), end - 8, c.ty + s, C[2], tail * 0.6);
          p.glow(end, c.ty, 12, C[4], 0.3 * tail);
        }
      } else slash(p, { ...c.arc, ramp: C }, t);

      if (age >= 0 && age < 0.14) {
        const k = 1 - age / 0.14;
        sparkle(p, c.tx, c.ty, (heavy ? 17 : thrust ? 9 : 12) * k, C[6], C[4]);
        p.glow(c.tx, c.ty, heavy ? 36 : 23, C[4], 0.5 * k);
      }
      if (age < 0 || age > 0.85) continue;
      for (let i = 0; i < (heavy ? 26 : 16); i++) {
        const r = rng(o.seed, ci, i), life = r.range(0.25, 0.75);
        if (age >= life) continue;
        const a = r.range(-Math.PI + 0.2, -0.2), speed = r.range(35, heavy ? 125 : 90);
        const [x, y] = fly(c.tx, c.ty, Math.cos(a) * speed, Math.sin(a) * speed, age, 180, 3);
        const yy = Math.min(-1, y), k = 1 - age / life;
        if (heavy && i % 3 === 0) p.rect(x, yy, 2, 2, C[k > 0.5 ? 2 : 1], k);
        else p.line(x, yy, x - Math.cos(a) * (2 + 3 * k), yy - Math.sin(a) * (2 + 3 * k), C[k > 0.55 ? 6 : 4], k);
        p.glow(x, yy, 3, C[4], 0.2 * k);
      }
      if (weapon.id === "lance" || weapon.id === "rapier") {
        const k = 1 - smooth(0, 0.3, age), rx = 3 + age * 8, ry = 5 + age * 26;
        for (let a = 0; a < Math.PI * 2; a += 0.08)
          p.dot(c.tx + Math.cos(a) * rx, c.ty + Math.sin(a) * ry, C[4], k);
      }
      if (weapon.id === "holy-sword") {
        const k = 1 - smooth(0.05, 0.65, age);
        p.line(c.tx, c.ty - 22 * k, c.tx, c.ty + 13 * k, C[5], k);
        p.line(c.tx - 12 * k, c.ty - 6, c.tx + 12 * k, c.ty - 6, C[5], k);
        for (let i = 0; i < 7; i++) {
          const r = rng(o.seed, i), x = c.tx + r.range(-23, 23), y = c.ty - r.range(2, 17) - age * 18;
          const pulse = k * (0.5 + 0.5 * Math.sin(age * 22 + i));
          sparkle(p, x, y, 1 + pulse * 2, C[5], C[3], pulse);
        }
      }
      if (weapon.id === "katana" && age < 0.24) {
        const k = 1 - age / 0.24;
        p.line(c.tx - 44, c.ty, c.tx + 8, c.ty - 1, C[5], k);
        p.line(c.tx - 26, c.ty + 3, c.tx, c.ty + 2, C[2], k);
      }
    }
  }
  return { meta, act, draw, drawBack };
}
