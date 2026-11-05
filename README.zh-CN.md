<p align="center">
  <img src="docs/readme/montage.gif" width="800" alt="多种像素特效同时播放：营火、燃烧骷髅、瀑布、等离子球、传送门、龙卷风等。">
</p>

**语言 / Languages:** [English](README.md) · [简体中文](README.zh-CN.md)

# pixelfx.

**<!-- count -->260<!-- /count --> 个像素特效与动画，每一个都是一小段代码。** 火焰、爆炸、魔法、天气、UI、拾取物、小动物等。可实时播放、换色与镜像，嵌入浏览器游戏，或导出精灵图给任意引擎。另有 **奇幻游戏套件** —— 战斗地图、小怪单位、带预警的 Boss 技能与编排好的遭遇战 —— 以及 Claude Code skill，用像素画师那套「起草 → 渲染 → 眼看 → 精修」流程做新内容。

库内 **<!-- original-count -->244<!-- /original-count -->** 个原始特效与 **<!-- new-count -->16<!-- /new-count -->** 个新增。Workbench 会把每条资源标为 `original` 或 `new`，并支持按来源筛选。

凡涉及角色的特效都会 **演出来**：蓄力、出手、命中定格、收招，目标会受击反馈。12 套完整 **moves** 把特效串成从 wind-up 到 recovery 的攻击。

**[打开 Gallery](https://patch-gg.github.io/pixelfx/)** · [奇幻遭遇战](https://patch-gg.github.io/pixelfx/fantasy.html) ·
[目录](docs/CATALOG.md) · [奇幻套件](docs/FANTASY.md) · [演出系统](#acting) · [Skill](#the-skill) ·
[自己做](#make-your-own) · [原理](#how-it-works)

方法来自 [Hugo Duprez](https://x.com/HugoDuprez) 的 [How to make (good) pixel art effects with Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude)：代码是粘土，相信眼睛，喂好参考。Sprite Fusion 的 [开源特效](https://www.spritefusion.com/pixel-art-vfx) 是标杆；`src/core/sim.js` 及文件头注明处适配了相关代码。本仓库是在库规模上延续这一思路，并用 skill 持续产出。

## 里面有什么

<!-- catalog -->
| 分类 | 数量 | 举例 |
|---|---|---|
| **moves** | 12 | arrow shot, dash strike, earth stomp, fireball throw… |
| **fire** | 12 | brazier, campfire, candle, fire breath… |
| **explosions** | 12 | barrel explosion, big explosion, cartoon pow… |
| **water** | 12 | bubbles, drip, fountain, geyser… |
| **ice** | 10 | blizzard vortex, freeze, frost breath, frost nova… |
| **lightning** | 12 | ball lightning, chain lightning, plasma ball… |
| **sci-fi** | 12 | emp blast, energy core, force field, hologram… |
| **melee** | 12 | claw swipe, dagger flurry, double slash… |
| **impacts** | 11 | blunt hit, bullet impact, critical hit… |
| **projectiles** | 13 | arrow, bullet tracer, cannon shot… |
| **spawn & death** | 11 | coin drop, disintegrate, respawn beam… |
| **arcane** | 12 | arcane beam, arcane missiles, magic circle cast… |
| **holy** | 10 | blessing, divine shield, heal, healing ring… |
| **shadow** | 12 | black hole, dark explosion, eclipse… |
| **status** | 13 | bleeding, burning, frozen… |
| **nature** | 13 | acid splash, leaf storm, poison cloud… |
| **weather** | 12 | aurora, blizzard, rain, snow… |
| **ui** | 12 | achievement, confetti, level-up… |
| **pickups** | 11 | chest open, coin spin, heart pickup… |
| **transitions** | 10 | blinds, burn away, diamond wipe, iris… |
| **critters** | 12 | bat, bird, butterfly, flying skull… |
| **world** | 6 | aurora pass, crystal hollow, mossy ruins… |
| **mobs** | 4 | goblin jab, goblin raider, sporeling… |
| **boss** | 4 | phase roar, root quake, thorn king… |
<!-- /catalog -->

每个特效是 `src/fx/<category>/<name>.js` 中的一个文件。[目录](docs/CATALOG.md) 有完整列表。

## 奇幻游戏套件

在特效之外，库还提供奇幻游戏常用拼装块，共用同一套文件、缓冲、调色与工具，各多一种导出：

| 类型 | 目录 | 内容 |
|---|---|---|
| **地图** | `src/fx/world/` | 320×180 循环竞技场，`map` 导出：`groundY`、可走区域、平台、出生点 |
| **小怪** | `src/fx/mobs/` | 循环单位：`hp`、半径、速度与攻击列表；攻击特效为独立模块 |
| **Boss** | `src/fx/boss/` | 大体型循环、血量、阶段与一套带预警的攻击 |
| **Boss 攻击** | `src/fx/boss/` | 全屏预警、地震、齐射、转阶段等，含命中时间点 |
| **遭遇战** | `src/encounters/` | 地图、英雄、小怪、Boss 与攻击在同一时间轴上，约 14 s 遭遇至 30 s 两阶段 Boss |

试玩示例：**[Ashfall Skirmish](https://patch-gg.github.io/pixelfx/fantasy.html?enc=ember-skirmish)**、**[The Verdant Throne](https://patch-gg.github.io/pixelfx/fantasy.html?enc=verdant-throne)**。浏览器页与渲染工具共用 `createEncounter` 运行时。

```bash
node tools/new.mjs world/mossy-crypt --map
node tools/new.mjs mobs/rat-scout --mob
node tools/new.mjs mobs/rat-bite --mob-attack
node tools/new.mjs boss/bog-witch --boss
node tools/new.mjs boss/bog-nova --boss-attack
node tools/new.mjs bog-witch --encounter

node tools/map.mjs world/mossy-ruins
node tools/encounter.mjs verdant-throne --mp4
```

新内容会像普通特效一样过 `npm run check`（地面与出生点、Boss 阶段、攻击 hit 时间、时间轴顺序等）。`node tools/index.mjs` 会 regenerate 注册表与 [目录](docs/CATALOG.md)/[遭遇目录](docs/ENCOUNTERS.md)。数据约定与设计清单见 [docs/FANTASY.md](docs/FANTASY.md)。

## 怎么用

**浏览器游戏**（canvas、Phaser、PixiJS 等）：直接用代码，无运行时依赖。

```js
import { createFrame, clearFrame, createFx, composite } from "pixelfx";
import * as frostNova from "pixelfx/fx/ice/frost-nova";

const frame = createFrame(320, 180);
const img = new ImageData(320, 180);
const fx = createFx(frostNova, { x: 160, y: 140 });   // 另有 flip, angle, seed, palette, light…

function tick(dt) {
  fx.update(dt);
  clearFrame(frame);
  fx.draw(frame, "back");
  drawCharacters();
  fx.draw(frame, "front");
  composite(frame, img.data, backgroundColor);
  ctx.putImageData(img, 0, 0);
}
```

可用 `npm i github:patch-gg/pixelfx` 安装，或只拷贝 `src/core` 与需要的特效。

**任意引擎**（Godot、Unity、GameMaker 等）：导出精灵图：

```bash
node tools/render.mjs ice/frost-nova --sheet
```

会生成透明 PNG 网格与 Aseprite 风格 JSON（帧矩形、时长、`meta.pixelfx` 中的 fps、loop、pivot）。`node tools/sheets.mjs` 可导出整库到 `sheets/`。

### Cocos Creator

导出到 Cocos 工程的 `assets/resources`：

```bash
npm run cocos:export -- fire/torch
node tools/cocos.mjs fire ice moves/sword-combo --out ../pixelfx-cocos/assets/resources/pixelfx
node tools/cocos.mjs --out ../my-game/assets/resources/pixelfx
```

将 [`cocos/runtime/PixelfxSprite.ts`](cocos/runtime/PixelfxSprite.ts) 拷到工程的 `assets/scripts/pixelfx/`，与 `Sprite` 同节点挂载，设置 `effectId`（如 `fire/campfire`）。详见 [`cocos/README.md`](cocos/README.md)。

官方预览工程 [**pixelfx-cocos**](https://github.com/hanhandi-git/pixelfx-cocos)（Creator 3.8.8，`assets/scenes/Main.scene`）。建议与本仓库并列克隆，以便 `npm run cocos:export` 写入 `../pixelfx-cocos/assets/resources/pixelfx/`：

```bash
git clone https://github.com/hanhandi-git/pixelfx-cocos.git ../pixelfx-cocos
```

PNG/JSON 只应出现在 **pixelfx-cocos** 中，不要提交进本库。

### 独立 H5 Workbench

无需 Cocos，本地预览：

```bash
npm run workbench
```

打开 [http://localhost:8080/gallery/workbench.html](http://localhost:8080/gallery/workbench.html)。直接 import 特效模块，支持分类、搜索、播放控制。`npm run build:web` 输出静态页到 `dist/gallery/`。

Gallery 与 Workbench 支持 `original` / `new` 筛选；奇幻时间轴见 [fantasy.html](http://localhost:8080/gallery/fantasy.html)。深链示例：`?fx=lightning/storm-sigil`。

换色示例：

```bash
node tools/render.mjs fire/torch --gif --opts '{"palette": ["#102","#215","#43a","#8cf","#cff","#fff"]}'
```

## 演出系统 {#acting}

<p align="center">
  <img src="docs/readme/acts.gif" width="800" alt="假人与草靶对练：连击、重锤、地击等，含蓄力、命中定格与收招。">
</p>

单独播放特效像贴纸；命中感来自身体演出：蓄力、定格、目标后仰、收招。61 个带角色特效与 12 个 moves 用 `act` 描述动作与时间：

```js
export const act = {
  target: { x: 58 },
  poses: [[-0.55, GUARD], [-0.3, WIND_UP], [0, CUT, "snap"], …],
  hits: [{ t: 0.06, stop: 0.14, shake: 0.18, amp: 2, push: 2.8, straw: 18 }],
};
```

用 `createAct` 替代 `createFx` 可连角色与目标一起播。自有角色可读 `slash.act` 或导出 JSON 里的 `meta.pixelfx.act` 对齐 wind-up 与 freeze。详见英文 [README — acting](README.md#acting) 与 [docs/AUTHORING.md](docs/AUTHORING.md)。

## Skill {#the-skill}

`pixelfx` skill 教 Claude Code 查找、使用、导出与制作特效，以及奇幻套件。安装：

```
/plugin marketplace add patch-gg/pixelfx
/plugin install pixelfx@pixelfx
```

或复制 `skills/pixelfx` 到 `~/.claude/skills/`。

## 自己做 {#make-your-own}

```bash
node tools/new.mjs arcane/my-spell
node tools/render.mjs arcane/my-spell    # records/.../contact.png
node tools/check.mjs arcane/my-spell
```

奇幻内容可用 `--map` / `--mob` / `--boss` / `--encounter` 等模板。循环：看 contact sheet → 改最糟的一处 → 再 render。[docs/AUTHORING.md](docs/AUTHORING.md) 有合约与绘制 API。`node tools/serve.mjs` 或 `npm run gallery` 本地打开 Gallery。

## 原理 {#how-it-works}

- **两类特效、无位图：** 纯 `draw(p,t,o)` 与模拟 `create(o)`（120 Hz 粒子等）。
- **双缓冲：** `color` 像素 + `light` _additive 光。
- **确定性：**  seeded 随机，同一帧永远相同。
- **局部坐标：** Painter 负责放置、镜像、旋转；方向性特效默认朝右。
- **骨骼假人：** 12 fps pose + 全速粒子；与 Sprite Fusion VFX 帧形状兼容。
- **奇幻角色是数据：** map / mob / boss / encounter 共用同一运行时与工具链。

## 许可

MIT。商用可用。部分改编自 Hugo Duprez 与 Hollow Crown 的 MIT 素材；`gallery/fonts` 中 Patch 字体见 [NOTICE.md](NOTICE.md)。

Made by [Patch](https://patch.gg).
