# 奇幻游戏：地图、小怪、Boss 与遭遇战

以下命令在 pixelfx 项目根目录执行。四种新内容都建立在同一个像素特效运行时上：

- **地图** `src/fx/world/<name>.js`：320×180 的循环战场，导出 `map` 布局。
- **小怪** `src/fx/mobs/<name>.js`：循环单位，导出 `mob` 数值和攻击列表。
- **Boss** `src/fx/boss/<name>.js`：大单位，导出 `boss` 血量和阶段。
- **战斗特效** `mobs/*-attack.js`、`boss/*-attack.js`：一次性攻击/预警，导出 `attack` 命中数据。
- **遭遇战** `src/encounters/<name>.js`：把地图、主角、小怪、Boss 和特效排成时间轴，导出 `encounter`。

先读 `docs/FANTASY.md` 了解完整契约，再用 `node tools/list.mjs fantasy` 找现有素材。

## 1. 选择正确的内容类型

| 需求 | 类型 | 命令 |
|---|---|---|
| 一个可战斗的场景/背景 | 地图 | `node tools/new.mjs world/<name> --map` |
| 会呼吸、会走位的小敌人 | 小怪单位 | `node tools/new.mjs mobs/<name> --mob` |
| 小怪的一次攻击 | 小怪攻击 | `node tools/new.mjs mobs/<name> --mob-attack` |
| 巨大敌人和分阶段战斗 | Boss 单位 | `node tools/new.mjs boss/<name> --boss` |
| 全屏预警、地裂、弹幕、转阶段 | Boss 攻击 | `node tools/new.mjs boss/<name> --boss-attack` |
| 把以上内容排成一场戏 | 遭遇战 | `node tools/new.mjs <name> --encounter` |

先做主单位，再做攻击，最后做遭遇战。不要先写 20 秒时间轴，再回头补素材：每个命中时刻都要和特效自身的常量对齐。

## 2. 地图

一句话设计：**这是什么地方、主角和 Boss 站在哪、什么在动、玩家第一眼看到什么。**

地图必须是 320×180、`origin: [0, 0]`、`loop: true`。把静态层烘焙一次，动态只留环境粒子：

```js
import { fit, hex } from "../../core/index.js";
import { bake, blit, sky, stars, ground, tufts, mist, fireflies, leaves, motes } from "./_lib.js";

export const meta = {
  name: "Mossy Ruins",
  desc: "一句话画面描述。",
  tags: ["map", "forest", "fantasy", "arena", "loop"],
  kind: "map",
  size: [320, 180], origin: [0, 0],
  duration: 10, loop: true, fps: 30, bg: "dark",
  options: { palette: [/* 暗到亮 8 阶 */], seed: 1 },
};

export const map = {
  groundY: 150,                       // 脚踩的线，必须与画面一致
  bounds: [8, 312],
  walk: [[8, 312]],
  platforms: [],                      // [x, y, width]
  spawns: { hero: [54, 150], mobs: [[152, 150], [198, 150]], boss: [262, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
```

实现建议：

1. `bake(W, H, fn)` 只调用一次，画天空、远景、废墟、地面、前景五层；`blit(p, layer)` 每帧贴回去。不要每帧重画 5 万像素。
2. 地面线要清楚：顶边 1 px 亮边，下面 2–3 px 暗带；角色脚下和彼此之间留一条低对比的“战斗带”。
3. 深度：后景暗、低饱和，近景亮、有细节；用藤蔓、雾、萤火、落叶让边缘活起来。
4. 所有随机用 `o.seed`；所有循环用 `t % D` 或 `cycle`、`sin(phase * TAU * n)`、`tileNoise`。
5. 出生点必须落在 `walk` 上、贴 `groundY`；平台 `platforms` 在 `groundY` 之上。
6. 不写 `meta.actor`。单位由遭遇战放置，地图只负责场景。

验收：

```bash
node tools/check.mjs world/<name>
node tools/map.mjs world/<name>
```

打开 `records/world/<name>/layout.png`，确认黄色可行走线覆盖地面、出生点标记落在线内且贴地。再打开 `gameplay.png` 看主角 1× 时是否立在地面上、是否被前景挡住。

## 3. 小怪

小怪的第一读是**轮廓**，第二读才是细节。16–40 px 高，一个夸张特征（大耳朵、大帽子、大匕首），两三个主色加一个发光强调色。

```js
export const meta = {
  name: "Goblin Raider",
  desc: "一句话：它长什么样、怎么待机、攻击前给什么提示。",
  tags: ["mob", "goblin", "fantasy", "minion", "melee", "loop"],
  kind: "mob",
  size: [64, 72], origin: [32, 58],     // origin 在脚底附近
  duration: 2.6, loop: true, fps: 30, bg: "ground",
  options: { palette: [/* 7–8 阶 */], seed: 1 },
};

export const mob = {
  tier: "minion", hp: 42, radius: 9, height: 33, speed: 31, xp: 12,
  attacks: [{ id: "jab", name: "Rusty jab", fx: goblinJab, range: 22, windup: 0.18, cooldown: 2.2, damage: 7 }],
  loot: "pickups/coin-spin",
};
```

- 用 `Grid` 在局部坐标画身体，`g.outline` 收 1 px 硬边，最后 `g.draw(p)`。
- 循环里做呼吸、眨眼、重心移动、武器反光；不要在小怪循环里塞攻击——攻击是单独的一次性特效。
- `drawBack` 画地面阴影和一点点脚边光。
- 攻击必须和单位分开：`mobs/<name>-attack.js` 里 `kind: "mob-attack"`，`attack.hits[0].t` 是命中帧。
- 攻击特效的局部原点应放在小怪的手/嘴附近，`range` 与手臂长度一致；遭遇战会把它放在小怪脚下并选择朝向。
- 小怪死亡用 `spawn/poof`、`spawn/soul-rise` 等现有素材，在遭遇战里定时播放，然后 `until` 隐藏单位。

验收：

```bash
node tools/check.mjs mobs/<name> mobs/<name>-attack
node tools/render.mjs mobs/<name> --zoom 5
node tools/render.mjs mobs/<name>-attack --zoom 5 --all
```

看 `records/mobs/<name>/contact.png`，确认 1× 轮廓可读；看攻击特效的每一帧，确认命中帧与 `attack.hits` 对齐，`t = duration` 时为空。

## 4. Boss

Boss 是**尺度、阶段和预警**三件事。

```js
export const meta = {
  name: "Thorn King",
  desc: "一句话：它是什么、为什么可怕。",
  tags: ["boss", "fantasy", "forest", "loop"],
  kind: "boss",
  size: [128, 168], origin: [64, 152],
  duration: 3.4, loop: true, fps: 30, bg: "ground",
  options: { palette: [/* 8 阶 */], seed: 1 },
};

export const boss = {
  tier: "boss", hp: 1200, radius: 28, height: 96,
  phases: [{ hp: 1, name: "The Waking Wood" }, { hp: 0.55, name: "Thorns Unleashed" }],
  attacks: [rootQuake, thornVolley, phaseRoar],
  loot: "pickups/loot-beam",
};
```

- 画布 96–140 px 宽、120–170 px 高；脚踩 `y = 0`，`meta.origin` 在脚底。
- 轮廓优先：角、冠、武器、披风、发光的核心，至少有三样在 1× 时能认出来。
- 循环只做待机：呼吸、核心脉动、眼睛发亮、叶片落下、藤蔓蠕动。
- 攻击是独立文件，全屏 320×180、`origin: [160, 150]`、`kind: "boss-attack"`，导出：
  ```js
  export const attack = {
    telegraph: 0.9, // 预警时长，玩家在这段时间里躲
    hits: [{ t: 1.0, amp: 4, shake: 0.45, damage: 120, radius: 136, target: "hero" }],
  };
  ```
- 一个 Boss 至少两种攻击 + 一个转阶段：近身范围、远程标记/弹幕、全屏怒吼。攻击节奏 0.8–1.6 s 预警、1–2 帧白闪、2–5 s 余波。
- 阶段按血量或时间切换：`boss.phases` 给出阈值，遭遇战用 `phases` 时间轴在同一秒打横幅、播 `phase-roar`、把血条压到下一段。
- 转阶段必须改变画面：颜色、光、地面裂纹、叶片风暴或屏幕震动，否则玩家不知道战斗变了。

验收：

```bash
node tools/check.mjs boss/<name> boss/<name>-attack
node tools/render.mjs boss/<name> --zoom 4
node tools/render.mjs boss/<name>-attack --zoom 3 --all
```

Boss 攻击的预警必须能在 `contact.png` 的采样帧里看到；看不见的预警不算预警。

## 5. 遭遇战

遭遇战是一份数据，不是另一个渲染器。`src/encounters/<name>.js`：

```js
import * as map from "../fx/world/mossy-ruins.js";
import * as boss from "../fx/boss/thorn-king.js";
import * as goblin from "../fx/mobs/goblin-raider.js";
import * as goblinJab from "../fx/mobs/goblin-jab.js";
import * as rootQuake from "../fx/boss/root-quake.js";

export const meta = {
  name: "The Verdant Throne",
  desc: "一句话：这场战斗的起承转合。",
  tags: ["encounter", "boss", "fantasy"],
  duration: 27.5, fps: 30, size: [320, 180],
  map: "world/mossy-ruins", boss: "boss/thorn-king", mobs: ["mobs/goblin-raider"],
};

const GROUND = map.map.groundY;

export const encounter = {
  w: 320, h: 180, duration: 27.5, map,
  hero: { x: 52, y: GROUND },
  boss: { mod: boss, x: 252, y: GROUND, name: "The Thorn King" },
  mobs: [{ id: "add-a", mod: goblin, x: 118, y: GROUND, hp: 42, until: 10.5 }],
  phases: [
    { at: 0.35, hp: 1, name: "The Waking Wood", sub: "THE THORN KING", dur: 2.8 },
    { at: 13.2, hp: 0.55, name: "Thorns Unleashed", sub: "PHASE II", dur: 2.8 },
  ],
  timeline: [
    { at: 2.4, type: "attack", fx: rootQuake, x: 160, y: GROUND },
    { at: 5.6, type: "attack", fx: goblinJab, x: 118, y: GROUND, flip: true },
    { at: 10.4, type: "attack", fx: poof, x: 118, y: GROUND },
  ],
};
```

时间轴 cue 类型：

| type | 字段 | 用途 |
|---|---|---|
| `attack` | `at, fx, x, y, flip?, options?, until?` | 播一个一次性/循环特效；`attack.hits` 自动带出震屏和主角白闪 |
| `phase` | `at, name, sub, hp, dur, shake?` | 压血条、显示阶段横幅；也可写在 `phases` 数组里 |
| `text` | `at, text, sub, dur` | 只出字，不压血条 |
| `shake` | `at, amp, dur` | 独立震屏 |
| `hit` | `at, target, amp, shake, dur` | 主角受击白闪 |
| `defeat` | `at, target: "boss" 或 mob id` | 隐藏单位；Boss 同时清空血条 |
| `summon` | `at, mod, id, x, y, ...` | 中途召唤一个小怪 |

设计节奏：

1. **开场 0–3 s**：镜头能看清 Boss 和主角；第一阶段横幅；第一个攻击用来教机制。
2. **教学 3–8 s**：小怪插入，给玩家“先清小怪还是打 Boss”的选择；每次攻击之间留 2–4 s 的走位窗口。
3. **升级 8–12 s**：第二种攻击；小怪死亡/换位；Boss 血量进入下一段。
4. **转阶段 12–15 s**：`phase-roar` + 横幅 + 震屏 + 颜色变化；不要在这 2 s 里致命。
5. **第二阶段 15–23 s**：攻击叠加、地面持续危险、小怪再入场；最后 2–3 s 收束。
6. **胜利 23 s 之后**：隐藏 Boss、播死亡/掉落/羽毛、`defeat`、胜利横幅；镜头停在空场地 1–2 s。

验收：

```bash
node tools/encounter.mjs <name> --mp4
node tools/index.mjs
npm run check
```

打开 `records/encounters/<name>/contact.png` 看采样帧，`timeline.json` 看每个命中时刻。再看浏览器里的实时播放：

```bash
npm run workbench
open http://localhost:8080/gallery/fantasy.html?enc=<name>
```

检查：Boss 血条、阶段横幅、震屏、主角白闪、召唤物出现/消失、特效不遮挡血条、GIF/MP4 中没有空白尾帧。

## 6. 接入游戏

浏览器/JS 游戏直接使用运行时：

```js
import { createFrame, clearFrame, createEncounter, composite } from "pixelfx";
import * as fight from "./src/encounters/verdant-throne.js";

const frame = createFrame(320, 180);
const img = new ImageData(320, 180);
const encounter = createEncounter(fight, { seed: 1 });

function tick(dt) {
  encounter.update(dt);
  clearFrame(frame);
  encounter.draw(frame);
  composite(frame, img.data, null);      // 地图不透明，不需要背景
  ctx.putImageData(img, 0, 0);
  const [sx, sy] = encounter.shake;      // 用整数像素震屏，保持像素对齐
  if (sx || sy) ctx.translate(sx, sy);
}
```

敌人/攻击的数值在 `mob.attacks`、`boss.attacks`、`attack.hits` 里；游戏自己的战斗系统可以直接读，不必依赖运行时的演示 UI。

其他引擎按普通特效导出 sprite sheet：

```bash
node tools/render.mjs world/mossy-ruins --sheet
node tools/render.mjs mobs/goblin-raider --sheet
node tools/render.mjs boss/root-quake --sheet
```

遭遇战不是单个 sprite：用 `timeline.json` 里的时间和 `--mp4`/contact sheet 做美术验收，然后把每个特效按自己的 ID 导出，由游戏引擎重新编排。

## 7. 常见错误

| 现象 | 原因 | 修法 |
|---|---|---|
| 主角像浮在地面上 | 地图 `groundY` 与画面地面不一致，或出生点 `y` 不在 `groundY` | 改 `map.groundY` / `spawns`，重新看 `layout.png` |
| 角色被前景挡住 | 前景画到了战斗带 | 把前景压到 `groundY + 2` 以下，或移除中央前景 |
| 地图太花，角色看不清 | 战斗带对比过高、细节太多 | 降低地面中间 40–80 px 的对比，把细节移到边缘 |
| 小怪像贴纸 | 没有阴影/脚边光、待机只有上下浮动 | 加 `shadow`、呼吸、眨眼、武器反光；加一点点环境光 |
| Boss 不像 Boss | 轮廓不够大、特征分散 | 放大 1.5–2 倍，合并成 2–3 个剪影特征；加角和发光核心 |
| 预警看不见 | 预警太暗/太细，或只画了一帧 | 用地面亮线、粗环、中心 sigil；持续 0.8–1.6 s；在 contact sheet 里检查 |
| 命中不同步 | `attack.hits[].t` 与画面白闪帧不一致 | 把白闪/命中星移到 `hits[0].t`，震屏用同一个常量 |
| 阶段切换很突然 | 只有血条变化 | 加 `phase-roar`、横幅、震屏、颜色/地面变化 |
| 遭遇战结尾空太久 | `meta.duration` 大于最后一个 cue 的结束 | 缩短 duration，或在结尾加胜利/掉落/镜头停留 |
| 特效盖住 Boss 血条 | 特效画到屏幕顶部 | 攻击特效的顶点留在 y ≥ 0；血条区域保持干净 |

## 8. 交付清单

- 源码：`src/fx/world|mobs|boss/<name>.js`、`src/encounters/<name>.js`。
- 注册：`node tools/index.mjs` 生成的 `src/fx/index.js`、`src/encounters/index.js`、`docs/CATALOG.md`、`docs/ENCOUNTERS.md`。
- 验证：`node tools/check.mjs <ids>` 和 `npm run check` 通过；地图 `map.mjs` layout/gameplay 正常；遭遇战 contact sheet/时间轴/浏览器实时播放正常。
- 资源：需要 Cocos 时 `npm run cocos -- <id> --out assets/resources/pixelfx`；只导出实际要用的单位/攻击，不要默认全量重导。
- 浏览器直达链接：`http://localhost:8080/gallery/fantasy.html?enc=<name>`。
- 未验证的环节写清楚，例如未在 Cocos Creator 里播放、未导出 MP4（缺 ffmpeg）。
