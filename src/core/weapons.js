// Original weapon equipment, drawn in grip-local coordinates through the rig's depth buffer.
import { hex } from "./color.js";

const C = Object.fromEntries(Object.entries({
  white: "#fffdf2", silver: "#d8e4ed", steel: "#8b9cb8", edge: "#53627e",
  ink: "#25283d", dark: "#3c3951", wrap: "#a8939d", leather: "#60394b",
  gold: "#f0cb72", goldL: "#fff0b4", goldD: "#a3683d", wood: "#a3714a", woodD: "#603f36",
  red: "#c75461", redL: "#f48b74", cyan: "#91dbe1", blue: "#568bb8", violet: "#8e71bb",
  jade: "#7fd3b0", jadeD: "#3f7f68", patina: "#7aa88a", patinaD: "#456b58",
  ivory: "#f7eed9", ivoryD: "#cbb796", bronze: "#b98b4a", bronzeD: "#6f5228", rose: "#e8b3b8",
}).map(([k, v]) => [k, hex(v) >>> 0]));

function shaft(T, from, to, r, light, dark) {
  for (let i = from; i <= to; i += 0.4) for (let k = -r; k <= r; k += 0.4)
    T(i, k, k < 0 ? light : dark);
}
function band(T, at, width, radius, light = C.gold, dark = C.goldD) {
  shaft(T, at, at + width, radius, light, dark);
}
function polygon(T, pts, color) {
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  for (let x = x0; x <= x1; x += 0.4) for (let y = y0; y <= y1; y += 0.4) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    if (inside) T(x, y, typeof color === "function" ? color(x, y) : color);
  }
}
function ring(T, cx, cy, r, c) {
  for (let a = 0; a < Math.PI * 2; a += 0.1) T(cx + Math.cos(a) * r, cy + Math.sin(a) * r, c);
}
function wraps(T, from, to, radius = 0.9) {
  shaft(T, from, to, radius, C.leather, C.ink);
  for (let i = from + 0.5; i < to; i += 1.8) for (let k = -radius; k <= radius; k += 0.4) T(i + k * 0.5, k, C.wrap);
}

export const MELEE_SHAPES = {
  dagger: { two: -3, draw(T) {
    wraps(T, -3.8, 2, 0.7); band(T, -4.3, 0.7, 1.15);
    polygon(T, [[2, -3.2], [3.3, -2], [3.3, 2], [2, 3.2]], C.gold);
    polygon(T, [[3, -1.7], [8, -2.2], [14, 0], [8, 1.9], [3, 1.7]], (_, y) => y < -0.7 ? C.white : y < 0.25 ? C.silver : C.edge);
    for (let i = 4; i < 11; i += 0.5) T(i, 0, C.steel);
    T(-4.3, 0, C.cyan);
  } },
  staff: { two: -9, draw(T) {
    shaft(T, -25, 34, 0.9, C.wood, C.woodD);
    wraps(T, -12, 5, 0.95);
    for (const at of [-25, -21, 28, 32]) band(T, at, 1.8, 1.35, C.goldL, C.goldD);
    for (const at of [-23, 29]) {
      T(at, -1.4, C.goldL); T(at + 1.2, 1.4, C.gold);
    }
  } },
  lance: { two: -11, draw(T) {
    shaft(T, -21, 43, 0.65, C.wood, C.woodD); wraps(T, -10, 3, 0.85);
    for (const at of [-21, 29, 35, 41]) band(T, at, 1.1, 1.2);
    polygon(T, [[42, -1.5], [49, -3.5], [62, 0], [49, 3.5], [42, 1.5]], (_, y) => y < -0.7 ? C.white : y < 0.4 ? C.silver : C.edge);
    shaft(T, 44, 59, 0.3, C.goldL, C.gold);
    // A short split pennon at the socket, tapering away from the shaft.
    polygon(T, [[40, 1], [37, 7.5], [32, 8], [34, 5], [30, 6], [36, 1]], C.red);
    polygon(T, [[39, 1.2], [36, 6], [33, 6.8], [36.8, 1.2]], C.redL);
  } },
  "holy-sword": { two: -5, draw(T) {
    wraps(T, -6.5, 2.6, 1); ring(T, -7.4, 0, 1.7, C.gold); T(-7.4, 0, C.cyan);
    polygon(T, [[2, -1.8], [0, -7.8], [4, -5.8], [5.5, -2], [5.5, 2], [4, 5.8], [0, 7.8], [2, 1.8]], C.gold);
    for (const s of [-1, 1]) for (let k = 2; k <= 6; k += 0.4) T(3 - k * 0.35, s * k, C.goldL);
    polygon(T, [[5, -3.1], [28, -3.1], [40, 0], [28, 3.1], [5, 3.1]], (_, y) => y < -1.4 ? C.white : y < 1 ? C.silver : C.blue);
    shaft(T, 8, 32, 0.4, C.goldL, C.gold);
    for (const at of [12, 19, 26]) for (const s of [-1, 1]) T(at, s * 1.5, C.gold);
    ring(T, 4, 0, 1.5, C.goldL); T(4, 0, C.cyan);
  } },
  katana: { two: -5, draw(T) {
    wraps(T, -7, 2.5, 0.85); band(T, -7.6, 0.6, 1.1);
    band(T, 2.6, 0.7, 3.2, C.goldL, C.goldD);
    for (let i = 3.4; i < 36; i += 0.35) {
      const u = (i - 3.4) / 32.6, curve = -2.8 * u * u, width = u > 0.86 ? (1 - u) / 0.14 * 1.7 : 1.7;
      for (let k = -width; k <= width; k += 0.4) T(i, curve + k, k < -0.6 ? C.white : k < 0.5 ? C.silver : C.edge);
    }
    T(-7, -1.1, C.redL);
  } },
  "war-mace": { two: -5, draw(T) {
    shaft(T, -8, 23, 0.9, C.steel, C.edge); wraps(T, -7, 5, 1); band(T, -8.5, 1.1, 1.5);
    polygon(T, [[20, -3], [23, -6.4], [28, -6.4], [32, -2], [32, 2], [28, 6.4], [23, 6.4], [20, 3]], (_, y) => y < -2 ? C.silver : y < 1.5 ? C.steel : C.edge);
    for (const s of [-1, 1]) {
      polygon(T, [[22, s * 4], [23.5, s * 10], [25, s * 5]], C.silver);
      polygon(T, [[27, s * 5], [29.5, s * 9], [29.5, s * 3]], C.edge);
    }
    polygon(T, [[30, -1.7], [35, 0], [30, 1.7]], C.silver);
    band(T, 24, 1, 6, C.gold, C.goldD); T(25, -3, C.goldL);
  } },
  kusanagi: { two: -7, draw(T) {
    // 云从剑 / 天丛云剑: a straight tsurugi, a cloud-lobed guard, a dark storm-steel blade with one pale edge.
    wraps(T, -7.6, 2, 0.85); band(T, -8.2, 0.6, 1.1);
    ring(T, -8.8, 0, 1.25, C.gold); T(-8.8, 0, C.jade); T(-8.8, -0.6, C.goldL);
    polygon(T, [[2.2, -3.6], [3.6, -2.4], [3.6, 2.4], [2.2, 3.6]], C.gold);
    for (const dy of [-2.8, 0, 2.8]) polygon(T, [[2.7, dy - 1.1], [4.7, dy - 0.35], [4.7, dy + 0.35], [2.7, dy + 1.1]], C.goldL);
    for (let i = 4; i < 37; i += 0.35) {
      const u = (i - 4) / 33, w = u > 0.9 ? (1 - u) / 0.1 * 1.9 : 1.9;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -1.2 ? C.white : k < -0.25 ? C.silver : k < 0.5 ? C.steel : C.edge);
    }
    for (let i = 5; i < 35; i += 0.7) T(i, 0, C.cyan);
    // a cloud notch cut into each shoulder near the guard
    for (const dy of [-1.6, 1.6]) for (let i = 4.4; i < 7; i += 0.3) T(i, dy, C.jade);
    T(-7.2, -1.2, C.cyan);
  } },
  totsuka: { two: -9, draw(T) {
    // 十拳剑: a broad, long straight blade, a red-wrapped grip, a dragon-head guard and a bronze pommel.
    wraps(T, -10, 2.4, 0.95); band(T, -10.6, 0.6, 1.3, C.bronze, C.bronzeD);
    polygon(T, [[-11.4, -1.5], [-9.4, 0], [-11.4, 1.5]], C.gold);
    polygon(T, [[2.4, -5], [4.2, -3.2], [4.2, 3.2], [2.4, 5]], C.gold);
    polygon(T, [[3, -4.2], [4, -2.4], [4, 2.4], [3, 4.2]], C.goldD);
    for (let i = 4.6; i < 46; i += 0.35) {
      const u = (i - 4.6) / 41, w = u > 0.9 ? (1 - u) / 0.1 * 2.4 : 2.4;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -1.5 ? C.white : k < -0.3 ? C.silver : k < 0.8 ? C.steel : C.edge);
    }
    for (let i = 6; i < 44; i += 0.5) T(i, 0, C.violet);
    for (const dy of [-1.4, 1.4]) for (let i = 5; i < 8.6; i += 0.3) T(i, dy, C.violet);
    T(-9.7, 0, C.redL);
  } },
  "yata-mirror": { draw(T) {
    // 八咫镜: a bronze mirror on a short wrapped handle, its bright face cut with an eight-point star.
    wraps(T, -4.8, 0.4, 0.8); band(T, -5, 0.6, 1.15, C.bronze, C.bronzeD);
    ring(T, 4, 0, 4.8, C.bronze); ring(T, 4, 0, 4.1, C.gold);
    for (let y = -3.6; y <= 3.6; y += 0.4) for (let x = 0.8; x <= 7.2; x += 0.4) {
      const d = (x - 4) ** 2 + y * y;
      if (d <= 3.7 * 3.7) T(x, y, y < -1 ? C.ivory : y < 0.9 ? C.goldL : C.gold);
    }
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) T(4 + Math.cos(a) * 2.4, Math.sin(a) * 2.4, C.bronzeD);
    T(4, 0, C.white); T(3, 0, C.white); T(5, 0, C.white);
    for (let i = 0; i < 3; i++) T(-5.6 - i * 0.4, -1.2 - i * 0.7, i & 1 ? C.red : C.redL);
  } },
  rapier: { two: -3.5, draw(T) {
    wraps(T, -4, 2, 0.65); band(T, -5, 0.7, 1.1);
    ring(T, 2.6, 0, 3.3, C.gold); ring(T, -0.2, 1.2, 3.2, C.goldD);
    for (let i = -2; i < 2; i += 0.4) T(i, -3.2, C.goldL);
    for (let i = 4; i <= 38; i += 0.35) {
      T(i, 0, C.silver); if (i < 32) T(i, -0.5, C.white);
    }
    T(-4.5, 0, C.violet);
  } },
};

/** Thrown equipment is kept separate from the melee catalogue so its grip geometry can leave the hand. */
export const THROWN_SHAPES = {
  kunai: { two: -2.5, draw(T) {
    wraps(T, -4, 2.4, 0.65); ring(T, -6, 0, 1.8, C.steel); T(-7.8, 0, C.silver);
    band(T, 2.3, 0.5, 1.4, C.edge, C.ink);
    polygon(T, [[3, -1], [7.2, -3.1], [17, 0], [7.2, 3.1], [3, 1]], (_, y) => y < -0.25 ? C.steel : C.ink);
    polygon(T, [[3.5, -0.2], [7.2, -2.8], [17, 0], [7.2, 0.4]], C.silver);
    for (let i = 7; i < 16.5; i += 0.5) T(i, (17 - i) * -0.04, C.white);
  } },
  "powder-bomb": { draw(T) {
    wraps(T, -4, 2, 0.7); band(T, -4.2, 0.7, 1.2, C.gold, C.goldD);
    for (let x = 3; x <= 13; x += 0.4) for (let y = -5; y <= 5; y += 0.4) {
      const d = (x - 8) ** 2 / 26 + y * y / 25;
      if (d <= 1) T(x, y, y < -1 ? C.ink : y < 2 ? C.dark : C.edge);
    }
    band(T, 6.5, 1, 5.2, C.gold, C.goldD);
    for (let i = 0; i < 4; i++) T(13 + i * 0.8, -5 - i * 0.6, i & 1 ? C.gold : C.goldL);
  } },
  boomerang: { draw(T) {
    wraps(T, -4, 2, 0.7); band(T, -4.2, 0.7, 1.2, C.gold, C.goldD);
    for (let u = 0; u <= 1; u += 0.02) {
      const a = -0.75 + u * 1.5, r = 6 + u * 11, x = 3 + Math.cos(a) * r, y = Math.sin(a) * r;
      T(x, y, C.wood); T(x + 0.6, y - 0.4, C.goldL);
    }
    for (let i = 0; i < 5; i++) T(10 + i * 1.1, -2.5 + i * 0.35, C.silver);
  } },
  talisman: { draw(T) {
    // a slip of parchment pinched at one corner: one polygon so the rig's depth pass keeps the
    // cream face, the cinnabar stamp and the brush strokes together
    wraps(T, -3.4, 1.2, 0.6); band(T, -3.6, 0.6, 1.05, C.gold, C.goldD);
    polygon(T, [[2.6, -6], [10.6, -5], [11.6, 6], [3.6, 7]], (x, y) => {
      if (x > 10.4 || y > 5.7 || x < 3.2 || y < -5.4) return C.goldD;
      if (x > 8.3) return C.red;
      if (x > 5 && x < 7.5 && ((y > -1.9 && y < -1.2) || (y > 0.3 && y < 1.0))) return C.ink;
      if (y > -2.6 && y < 1.4 && x > 6.05 && x < 6.55) return C.ink;
      return C.goldL;
    });
  } },
  "flying-sword": { two: -2.4, draw(T) {
    // 一把尺长的小剑：缠柄、玉剑首、小金镡、短脊剑身，剑穗垂在柄后
    wraps(T, -3, 1.6, 0.6);
    ring(T, -3.8, 0, 1.2, C.gold); T(-3.8, 0, C.jade);
    band(T, 1.6, 0.6, 2.2, C.gold, C.goldD);
    for (let i = 2.2; i <= 16.4; i += 0.4) {
      const u = (i - 2.2) / 14.2, width = u > 0.84 ? (1 - u) / 0.16 * 1.2 : 1.2;
      for (let k = -width; k <= width; k += 0.4) T(i, k, k < -0.45 ? C.white : k < 0.3 ? C.silver : C.edge);
    }
    for (let i = 3; i < 15.4; i += 0.6) T(i, 0, C.steel);
    for (let i = 0; i < 3; i++) T(-4.4 - i * 0.4, 1 + i * 1.1, i & 1 ? C.red : C.redL);
  } },
  "binding-silk": { draw(T) {
    // 掌中一握素绫：两端金箍，绫尾从掌后垂下来
    for (let x = -2.2; x <= 6.6; x += 0.4) for (let y = -2.2; y <= 2.2; y += 0.4) {
      const d = (x - 2.2) ** 2 / 20 + y * y / 4.6;
      if (d <= 1) T(x, y, y < -0.55 ? C.ivory : y < 0.7 ? C.ivoryD : C.woodD);
    }
    band(T, -2.4, 0.9, 2.5, C.gold, C.goldD);
    band(T, 5.5, 0.9, 2.5, C.gold, C.goldD);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 8; j++) {
        const x = -2.6 - j * 0.55 + Math.sin(j * 0.8 + i * 2) * 1.1, y = (i ? -1.4 : 1.6) + j * 0.9;
        T(x, y, j & 1 ? C.ivoryD : C.ivory);
        if (j % 3 === 0) T(x, y + 0.5, C.goldD);
      }
    }
  } },
  "soul-bell": { draw(T) {
    // 铜铃：环钮、钟身、金口沿、铃舌与红穗，铜绿斑落在钟腹
    ring(T, -2.2, 0, 1.3, C.bronze); T(-2.2, 0, C.goldL);
    shaft(T, -1.4, 0.4, 0.8, C.bronze, C.bronzeD);
    polygon(T, [[0.6, -3], [3.6, -2.6], [7.4, -4.6], [8.4, 0], [7.4, 4.6], [3.6, 2.6], [0.6, 3]], (x, y) => {
      if (y > 3.4 || y < -3.4) return C.bronzeD;
      if (x > 6.8) return C.patinaD;
      if (y < -1.6) return C.bronze;
      if (y > 1.8) return C.bronzeD;
      return x > 4 ? C.patina : C.bronze;
    });
    band(T, 7.5, 1.1, 4.9, C.gold, C.goldD);
    T(8.9, 0, C.goldL); T(7.2, 0, C.goldD);
    for (let i = 0; i < 4; i++) T(-1.4 - i * 0.4, -2.6 - i * 0.9, i & 1 ? C.red : C.redL);
  } },
  "pear-needles": { draw(T) {
    // 指间三根细针，针身藏在袖口的缠布里，针尖一点白
    band(T, -1.2, 2, 2.4, C.blue, C.edge);
    for (let k = -2; k <= 2; k += 0.4) T(0.4, k, C.wrap);
    for (const dy of [-2.2, 0, 2.2]) {
      for (let i = 1.4; i <= 13; i += 0.35) T(i, dy, i > 11.4 ? C.white : i > 5 ? C.silver : C.steel);
      T(13.2, dy, C.white);
      T(13.6, dy, C.white);
      T(2.4, dy, C.rose);
    }
  } },
};

/** The weapon classes the armory groups its actions by. */
export const WEAPON_CLASSES = Object.freeze([
  { id: "melee", label: "近战武器", name: "Melee" },
  { id: "thrown", label: "投掷武器", name: "Thrown" },
]);

/** Every selectable weapon: melee first, then thrown. `fx` is the dedicated action for each one. */
export const ARMORY = Object.freeze([
  { id: "sword", label: "长剑", name: "Sword", fx: "melee/sword-slash", tip: 28, family: "sweep", class: "melee" },
  { id: "dagger", label: "匕首", name: "Dagger", fx: "melee/dagger-flurry", tip: 14, family: "thrust", class: "melee" },
  { id: "staff", label: "金箍棍", name: "Banded staff", fx: "melee/staff-combo", tip: 34, family: "sweep", class: "melee" },
  { id: "spear", label: "长矛", name: "Spear", fx: "melee/spear-sweep", tip: 47, family: "sweep", class: "melee" },
  { id: "lance", label: "骑士长枪", name: "Knight lance", fx: "melee/lance-thrust", tip: 62, family: "thrust", class: "melee" },
  { id: "holy-sword", label: "圣剑", name: "Holy sword", fx: "melee/holy-sword-cleave", tip: 40, family: "sweep", class: "melee" },
  { id: "katana", label: "太刀", name: "Katana", fx: "melee/katana-draw", tip: 36, family: "sweep", class: "melee" },
  { id: "kusanagi", label: "云从剑", name: "Kusanagi", fx: "kami/ame-no-murakumo", tip: 36, family: "sweep", class: "melee" },
  { id: "totsuka", label: "十拳剑", name: "Totsuka", fx: "kami/susanoo-thunder", tip: 44, family: "sweep", class: "melee" },
  { id: "yata-mirror", label: "八咫镜", name: "Yata mirror", fx: "kami/amaterasu-sun", tip: 9, family: "slam", class: "melee" },
  { id: "war-mace", label: "重钉锤", name: "War mace", fx: "melee/mace-crush", tip: 35, family: "slam", class: "melee" },
  { id: "rapier", label: "刺剑", name: "Rapier", fx: "melee/rapier-lunge", tip: 38, family: "thrust", class: "melee" },
  { id: "kunai", label: "苦无", name: "Kunai", fx: "thrown/kunai-throw", tip: 18, family: "throw", class: "thrown" },
  { id: "powder-bomb", label: "火药弹", name: "Powder bomb", fx: "thrown/powder-bomb-throw", tip: 15, family: "throw", class: "thrown" },
  { id: "boomerang", label: "回旋镖", name: "Boomerang", fx: "thrown/boomerang-throw", tip: 19, family: "throw", class: "thrown" },
  { id: "talisman", label: "符箓", name: "Talisman", fx: "thrown/talisman-throw", tip: 17, family: "throw", class: "thrown" },
  { id: "flying-sword", label: "飞剑", name: "Flying sword", fx: "thrown/flying-sword-throw", tip: 17, family: "throw", class: "thrown" },
  { id: "binding-silk", label: "缚仙绫", name: "Binding silk", fx: "thrown/binding-silk-throw", tip: 9, family: "throw", class: "thrown" },
  { id: "soul-bell", label: "摄魂铃", name: "Soul bell", fx: "thrown/soul-bell-throw", tip: 10, family: "throw", class: "thrown" },
  { id: "pear-needles", label: "梨花针", name: "Pear-blossom needles", fx: "thrown/pear-needles-throw", tip: 13, family: "throw", class: "thrown" },
]);
export const MELEE_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "melee"));
export const THROWN_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "thrown"));
export const weaponOf = (id) => ARMORY.find((w) => w.id === id) ?? null;
export const meleeWeaponOf = (id) => MELEE_WEAPONS.find((w) => w.id === id) ?? null;
export const thrownWeaponOf = (id) => THROWN_WEAPONS.find((w) => w.id === id) ?? null;
