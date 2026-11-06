// Two baked stages share one quiet combat floor. Only paper, mist and dim lanterns animate.
import { TAU, rng, cycle, SDF, createPath, cubicBezier } from "../../core/index.js";
import { bake, blit } from "./_lib.js";
import { INK_PALETTE, RED, PAPER, GOLD, inkColors, talisman } from "../_ink.js";

export const meta = {
  name: "Inkbound Shrine",
  desc: "An abandoned eastern shrine: broken tiled eaves, a sealed altar, soul banners and low mist; phase two stains the stone and loosens the hanging paper wards.",
  tags: ["map", "eastern", "shrine", "ink", "talisman", "arena", "loop"], kind: "map",
  size: [320, 180], origin: [0, 0], duration: 8, loop: true, fps: 30, bg: "dark",
  options: { palette: INK_PALETTE, phase: 1, seed: 1 },
};
export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [52, 150], mobs: [[132, 150], [178, 150]], boss: [254, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};

function build(C, seed, phase) {
  const r = rng(seed, 41);
  return bake(320, 180, (p) => {
    p.rect(0, 0, 320, 180, C[0]);
    p.rect(0, 53, 320, 85, C[1]);
    p.circle(69, 45, 15, C[2]);
    p.circle(73, 41, 13, C[1]);
    // Far hills, bent trunks and tomb-like roof masses keep the skyline asymmetrical.
    for (let x = 0; x < 320; x++) {
      const top = 84 + Math.round(Math.sin(x * 0.024 + seed) * 9 + Math.sin(x * 0.071) * 3);
      p.rect(x, top, 1, 50, C[0]);
    }
    for (const [x, s] of [[18, 1], [300, -1]]) {
      p.poly([[x, 142], [x - 4, 85], [x + 3 * s, 53], [x + 6 * s, 63], [x + 3, 92], [x + 6, 142]], C[2]);
      p.polyline([[x + 1, 89], [x + s * 13, 69], [x + s * 25, 62]], C[2]);
      p.polyline([[x + 2, 100], [x - s * 11, 81], [x - s * 13, 65]], C[2]);
    }
    // A recessed sanctuary beneath layered, upturned tiled eaves.
    p.rect(100, 77, 126, 61, C[2]);
    p.rect(109, 85, 107, 49, C[1]);
    p.rect(138, 92, 48, 42, C[0]);
    for (const x of [111, 207]) {
      p.rect(x, 82, 5, 56, C[3]); p.rect(x + 3, 84, 2, 54, C[1]);
      p.rect(x - 2, 134, 9, 4, C[2]);
    }
    p.poly([[84, 77], [105, 70], [145, 52], [161, 43], [180, 55], [213, 69], [241, 76],
      [220, 82], [104, 82]], C[0]);
    p.polyline([[85, 77], [106, 74], [145, 59], [162, 49], [182, 61], [214, 75], [240, 76]], C[3]);
    p.polyline([[97, 80], [114, 78], [212, 78], [231, 80]], C[2]);
    for (let i = 0; i < 13; i++) {
      const x = 106 + i * 9, top = 77 - (1 - Math.abs(x - 163) / 65) * 17;
      p.line(x, top, x + 7, 77, C[1]);
      if (i % 3) p.px(x + 7, 77, C[3]);
    }
    p.rect(151, 68, 25, 9, C[1]);
    p.rect(153, 70, 21, 5, GOLD[1]);
    for (let i = 0; i < 4; i++) p.line(156 + i * 5, 71, 155 + i * 5, 73, PAPER[1]);
    // Plinth and altar, deliberately dimmer than the mage and incoming seals.
    for (let i = 0; i < 3; i++) {
      p.rect(128 - i * 7, 131 + i * 4, 68 + i * 14, 4, C[2]);
      p.rect(128 - i * 7, 131 + i * 4, 68 + i * 14, 1, C[3]);
    }
    p.rect(148, 118, 29, 13, C[2]); p.rect(144, 116, 37, 3, C[3]);
    p.rect(152, 121, 21, 8, C[1]);
    talisman(p, 162, 99, 22, 7, -0.08, 1);
    for (const [x, y] of [[125, 107], [199, 107]]) {
      p.rect(x, y, 3, 20, C[2]); p.rect(x - 3, y - 2, 9, 7, GOLD[1]);
      p.rect(x - 1, y, 5, 3, phase === 2 ? RED[3] : GOLD[2]);
    }
    // Edge pillars and mourning banners frame the 40 px combat strip without crossing it.
    for (const [x, height] of [[38, 82], [279, 91]]) {
      p.rect(x, 150 - height, 4, height, C[3]); p.rect(x + 3, 150 - height, 2, height, C[1]);
      p.rect(x - 8, 150 - height - 2, 20, 3, C[2]);
      p.poly([[x + 6, 152 - height], [x + 21, 152 - height], [x + 20, 188 - height],
        [x + 15, 184 - height], [x + 11, 191 - height], [x + 6, 187 - height]], C[1]);
      p.line(x + 8, 155 - height, x + 8, 183 - height, GOLD[1]);
    }
    // A continuous floor with larger stone groups, restrained joints and a clear foot line.
    p.rect(0, 150, 320, 30, C[1]);
    for (let row = 0; row < 4; row++) for (let x = -22 + row % 2 * 19; x < 320; x += 43) {
      p.rect(Math.max(0, x + 1), 153 + row * 7, Math.min(41, 319 - Math.max(0, x + 1)), 6, C[2]);
      p.line(Math.max(0, x + 2), 153 + row * 7, Math.min(319, x + 37), 153 + row * 7, C[3]);
    }
    p.rect(0, 149, 320, 1, C[3]); p.rect(0, 150, 320, 1, C[4]);
    for (let i = 0; i < 18; i++) {
      const x = r.int(8, 307), y = r.int(157, 176);
      p.line(x, y, Math.min(318, x + r.int(3, 8)), y + 1, C[1]);
    }
    if (phase === 2) {
      // Persistent stage geometry; the safe middle of the floor stays brighter than the ink.
      const stain = SDF.union(SDF.capsule(210, 157, 309, 168, 5), SDF.capsule(15, 168, 100, 160, 4));
      p.sdf(stain, [4, 151, 317, 178], C[0]);
      p.sdf(SDF.shell(stain, 1), [4, 151, 317, 178], RED[1]);
      for (const x of [107, 216]) p.line(x, 110, x + (x < 160 ? 8 : -7), 135, RED[2]);
    }
  });
}

export function create(o) {
  let key, C, stages;
  const prepare = () => {
    const next = `${o.seed ?? 1}:${o.palette}`;
    if (next === key) return;
    key = next; C = inkColors(o);
    stages = [build(C, o.seed ?? 1, 1), build(C, o.seed ?? 1, 2)];
  };
  prepare();
  const cord = createPath(cubicBezier([40, 66], [102, 93], [215, 89], [281, 59]), { samples: 72 });
  return { draw(p, t) {
    prepare();
    const phase = o.phase === 2 ? 2 : 1, u = t / meta.duration;
    blit(p, stages[phase - 1]);
    p.strokePath(cord, 1, C[3]);
    for (let i = 0; i < 7; i++) {
      const q = cord.sample(0.12 + i * 0.12), sway = Math.sin(u * TAU + i) * (phase === 2 ? 0.3 : 0.12);
      talisman(p, q.x, q.y + 7, 11 + i % 3 * 2, 4, sway, 0.85);
    }
    cycle(t, meta.duration, 8, o.seed ?? 1, 5.5, (age, life, r) => {
      const k = age / life, x = r.range(29, 291) + Math.sin(k * TAU) * 3, y = 144 - k * 7;
      p.disc(x, y, r.range(9, 14), C[3], Math.sin(k * Math.PI) * (phase === 2 ? 0.065 : 0.04));
    });
    for (const x of [125, 199]) p.glow(x + 1, 108, 10, phase === 2 ? RED[3] : GOLD[2],
      0.08 + 0.015 * Math.cos(u * TAU * 2));
  } };
}
