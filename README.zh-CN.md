<p align="center">
  <img src="docs/readme/montage.gif" width="800" alt="多种像素特效同时播放：营火、燃烧骷髅、瀑布、等离子球、传送门、龙卷风等。">
</p>

**语言 / Languages:** [English](README.md) · [简体中文](README.zh-CN.md)

# pixelfx-extended.

在 [**pixelfx**](https://github.com/patch-gg/pixelfx) 原版 244 特效基线之上，额外增加 **<!-- new-count -->83<!-- /new-count -->** 条地图、小怪等素材的扩展仓库。

**<!-- count -->327<!-- /count --> 个像素特效与动画，每一个都是一小段代码。** 火焰、爆炸、魔法、天气、UI、拾取物、小动物等。可实时播放、换色与镜像，嵌入浏览器游戏，或导出精灵图给任意引擎。另有 **奇幻游戏套件** —— 战斗地图、小怪与 Boss 单位、带预警的技能，以及在 `src/encounters/` 中编写的遭遇战时间轴 —— 以及 Claude Code skill，用像素画师那套「起草 → 渲染 → 眼看 → 精修」流程做新内容。

库内 **<!-- original-count -->244<!-- /original-count -->** 个原始特效与 **<!-- new-count -->83<!-- /new-count -->** 个新增。[Gallery](gallery/index.html) 会把每条资源标为 `original` 或 `new`，并支持按来源筛选。

有 **<!-- act-count -->113<!-- /act-count -->** 个特效导出 **`act`** 时间轴（蓄力、出手、命中定格、受击与收招）。另有 **<!-- moves-count -->12<!-- /moves-count -->** 个 **`moves`**（`src/fx/moves/`）把这一套打成从 wind-up 到 recovery 的完整攻击。

**[打开 Gallery](https://patch-gg.github.io/pixelfx/)** ·
[在线 Gallery（本扩展部署版）](http://42.192.38.33/pixelfx_extend/index.html?source=new&character=moon-oracle#thrown) ·
[奇幻遭遇战](https://patch-gg.github.io/pixelfx/fantasy.html) ·
[目录](docs/CATALOG.md) · [奇幻套件](docs/FANTASY.md) · [演出系统](#acting) · [Skill](#the-skill) ·
[自己做](#make-your-own) · [原理](#how-it-works)

方法来自 [Hugo Duprez](https://x.com/HugoDuprez) 的 [How to make (good) pixel art effects with Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude)：代码是粘土，相信眼睛，喂好参考。Sprite Fusion 的 [开源特效](https://www.spritefusion.com/pixel-art-vfx) 是标杆；`src/core/sim.js` 及文件头注明处适配了相关代码。本仓库是在库规模上延续这一思路，并用 skill 持续产出。

## 新增内容

以下 **<!-- new-count -->83<!-- /new-count -->** 条不在原始 244 特效基线内：奇幻地图、小怪、Boss 等。在 [Gallery（`?source=new`）](gallery/index.html?source=new) 或部署版 [在线 Gallery](http://42.192.38.33/pixelfx_extend/index.html?source=new&character=moon-oracle#thrown)（仅新增、Moon Oracle、投掷分类）浏览。

<p align="center">
  <img src="docs/readme/montage-new.gif" width="800" alt="六张 320×180 奇幻战斗地图循环预览：极光隘口、水晶洞窟、余烬深渊、苔痕遗迹、日痕神殿与磷火沼泽。">
</p>

<!-- new-catalog -->
| 分类 | 特效 | id |
|---|---|---|
| **world** | Aurora Pass | `world/aurora-pass` |
| **world** | Crystal Hollow | `world/crystal-hollow` |
| **world** | Ember Depths | `world/ember-depths` |
| **world** | Inkbound Shrine | `world/inkbound-shrine` |
| **world** | Mossy Ruins | `world/mossy-ruins` |
| **world** | Sunscar Temple | `world/sunscar-temple` |
| **world** | Wisp Marsh | `world/wisp-marsh` |
| **spawn** | Ink Unravel | `spawn/ink-unravel` |
| **spawn** | Shanhaijing summon | `spawn/shanhaijing-summon` |
| **spawn** | Talisman suppression | `spawn/talisman-suppression` |
| **lightning** | Forked burst | `lightning/forked-burst` |
| **lightning** | Ground surge | `lightning/ground-surge` |
| **lightning** | Static cage | `lightning/static-cage` |
| **lightning** | Storm sigil | `lightning/storm-sigil` |
| **lightning** | Storm vortex | `lightning/storm-vortex` |
| **lightning** | Thunder rain | `lightning/thunder-rain` |
| **lightning** | Thunder spear | `lightning/thunder-spear` |
| **arcane** | Flow seal | `arcane/flow-seal` |
| **dragonball** | Destructo disc | `dragonball/destructo-disc` |
| **dragonball** | Drill beam | `dragonball/drill-beam` |
| **dragonball** | Golden aura | `dragonball/golden-aura` |
| **dragonball** | Ki charge | `dragonball/ki-charge` |
| **dragonball** | Ki volley | `dragonball/ki-volley` |
| **dragonball** | Ki wave | `dragonball/ki-wave` |
| **dragonball** | Solar flare | `dragonball/solar-flash` |
| **dragonball** | Spirit bomb | `dragonball/spirit-bomb` |
| **konosuba** | Explosion chant | `konosuba/explosion-chant` |
| **konosuba** | Explosion crater | `konosuba/explosion-crater` |
| **konosuba** | Explosion | `konosuba/explosion-ritual` |
| **konosuba** | Explosion | `konosuba/explosion-strike` |
| **melee** | Holy sword cleave | `melee/holy-sword-cleave` |
| **melee** | Katana draw cut | `melee/katana-draw` |
| **melee** | Knight lance thrust | `melee/lance-thrust` |
| **melee** | War mace crush | `melee/mace-crush` |
| **melee** | Rapier lunge | `melee/rapier-lunge` |
| **melee** | Banded staff combo | `melee/staff-combo` |
| **miku** | Encore | `miku/encore` |
| **miku** | Leek smash | `miku/leek-smash` |
| **miku** | Song aura | `miku/song-aura` |
| **miku** | Sound wave | `miku/sound-wave` |
| **miku** | Vocal burst | `miku/vocal-burst` |
| **ninjutsu** | Amaterasu | `ninjutsu/amaterasu` |
| **ninjutsu** | Chidori rush | `ninjutsu/chidori-rush` |
| **ninjutsu** | Earth wall | `ninjutsu/earth-wall` |
| **ninjutsu** | Great breakthrough | `ninjutsu/great-breakthrough` |
| **ninjutsu** | Great fireball | `ninjutsu/great-fireball` |
| **ninjutsu** | Kirin | `ninjutsu/kirin` |
| **ninjutsu** | Chidori | `ninjutsu/lightning-blade` |
| **ninjutsu** | Phoenix flower | `ninjutsu/phoenix-flower` |
| **ninjutsu** | Shadow clones | `ninjutsu/shadow-clone` |
| **ninjutsu** | Spiral orb | `ninjutsu/spiral-orb` |
| **ninjutsu** | Water dragon | `ninjutsu/water-dragon` |
| **ninjutsu** | Water wall | `ninjutsu/water-wall` |
| **onepunch** | Consecutive normal punches | `onepunch/consecutive-normal-punches` |
| **onepunch** | Hero landing | `onepunch/hero-landing` |
| **onepunch** | Serious punch | `onepunch/serious-punch` |
| **pickups** | Cash coin | `pickups/cash-coin` |
| **pickups** | Dragon pearl | `pickups/dragon-pearl` |
| **pickups** | Elixir gourd | `pickups/elixir-gourd` |
| **pickups** | Flying sword | `pickups/flying-sword` |
| **pickups** | Gold ingot | `pickups/gold-ingot` |
| **pickups** | Immortal fan | `pickups/immortal-fan` |
| **pickups** | Jade pendant | `pickups/jade-pendant` |
| **pickups** | Jade slip | `pickups/jade-slip` |
| **pickups** | Lotus lamp | `pickups/lotus-lamp` |
| **pickups** | Paper lantern | `pickups/paper-lantern` |
| **pickups** | Paper talisman | `pickups/paper-talisman` |
| **pickups** | Spirit butterfly | `pickups/spirit-butterfly` |
| **pickups** | Spirit stone | `pickups/spirit-stone` |
| **senjutsu** | Gate of the Great God | `senjutsu/gate-of-the-great-god` |
| **senjutsu** | Sage art: Goemon | `senjutsu/goemon` |
| **senjutsu** | Sage orb | `senjutsu/sage-orb` |
| **senjutsu** | Thousand wood dragons | `senjutsu/true-thousand-hands` |
| **senjutsu** | White flash | `senjutsu/white-flash` |
| **senjutsu** | Wind shuriken | `senjutsu/wind-shuriken` |
| **thrown** | Binding silk | `thrown/binding-silk-throw` |
| **thrown** | Boomerang throw | `thrown/boomerang-throw` |
| **thrown** | Flying sword | `thrown/flying-sword-throw` |
| **thrown** | Kunai throw | `thrown/kunai-throw` |
| **thrown** | Pear-blossom needles | `thrown/pear-needles-throw` |
| **thrown** | Powder bomb throw | `thrown/powder-bomb-throw` |
| **thrown** | Soul bell | `thrown/soul-bell-throw` |
| **thrown** | Talisman throw | `thrown/talisman-throw` |
<!-- /new-catalog -->

## 全部目录

含新增内容的分类排在前面；示例名称会**优先列出 new 素材**。

<!-- catalog -->
| category | effects | some of them |
|---|---|---|
| **pickups** | 24 | cash coin, dragon pearl, elixir gourd, flying sword, gold ingot, immortal fan… |
| **ninjutsu** | 12 | amaterasu, chidori rush, earth wall, great breakthrough, great fireball, kirin… |
| **thrown** | 8 | binding silk, boomerang throw, flying sword, kunai throw, pear-blossom needles, powder bomb throw… |
| **dragonball** | 8 | destructo disc, drill beam, golden aura, ki charge, ki volley, ki wave… |
| **lightning** | 18 | forked burst, ground surge, static cage, storm sigil, storm vortex, thunder rain… |
| **world** | 7 | aurora pass, crystal hollow, ember depths, inkbound shrine, mossy ruins, sunscar temple… |
| **melee** | 18 | holy sword cleave, katana draw cut, knight lance thrust, war mace crush, rapier lunge, banded staff combo… |
| **senjutsu** | 6 | gate of the great god, sage art: goemon, sage orb, thousand wood dragons, white flash, wind shuriken |
| **miku** | 5 | encore, leek smash, song aura, sound wave, vocal burst |
| **konosuba** | 4 | explosion chant, explosion crater, explosion, explosion |
| **spawn & death** | 13 | ink unravel, shanhaijing summon, talisman suppression, coin drop, disintegrate, dissolve burn… |
| **one punch** | 3 | consecutive normal punches, hero landing, serious punch |
| **arcane** | 13 | flow seal, arcane beam, arcane missiles, arcane orb, blink in, blink out… |
| **moves** | 12 | arrow shot, dash strike, earth stomp, fireball throw, ground pound, holy smite… |
| **fire** | 12 | brazier, campfire, candle, fire breath, fire ring, fire tornado… |
| **explosions** | 12 | barrel explosion, big explosion, cartoon pow, dirt explosion, firework burst, firework rocket… |
| **water** | 12 | bubbles, drip, fountain, geyser, rain splash, ripples… |
| **ice** | 10 | blizzard vortex, freeze, frost breath, frost nova, ice crystal, ice lance… |
| **sci-fi** | 12 | emp blast, energy core, force field, glitch, hologram, jetpack… |
| **impacts** | 11 | blunt hit, bullet impact, critical hit, ground slam, heavy landing, hit flash… |
| **projectiles** | 13 | arrow, bullet tracer, cannon shot, energy disc, signal flare, homing missile… |
| **holy** | 10 | blessing, divine shield, feather burst, halo, heal, healing ring… |
| **shadow** | 12 | black hole, curse, dark explosion, eclipse, grasping hands, hex sigil… |
| **status** | 13 | bleeding, burning, charmed, confused, cursed, frozen… |
| **nature** | 13 | acid splash, boulder, earth spike, healing bloom, leaf storm, poison cloud… |
| **weather** | 12 | aurora, blizzard, cherry blossoms, clouds, falling leaves, fireflies… |
| **ui** | 12 | achievement, coin collect, combo counter, confetti, countdown, crit number… |
| **transitions** | 10 | blinds, burn away, crt off, diamond wipe, glitch wipe, iris… |
| **critters** | 12 | bat, bird, butterfly, eyeball, fish school, flying skull… |
<!-- /catalog -->

每个特效是 `src/fx/<category>/<name>.js` 中的一个文件。[目录](docs/CATALOG.md) 有完整列表。

## 奇幻游戏套件

在特效之外，库还提供奇幻游戏常用拼装块，共用同一套文件、缓冲、调色与工具，各多一种导出：

| 类型 | 目录 | 内容 |
|---|---|---|
| **地图** | `src/fx/world/` | 320×180 循环竞技场，`map` 导出：`groundY`、可走区域、平台、出生点 |
| **小怪** | `src/fx/mobs/` | 循环单位：`hp`、半径、速度与攻击列表；攻击特效为独立模块 |
| **Boss** | `src/fx/boss/` | 大体型循环、血量、阶段与一套带预警的攻击；用 `node tools/new.mjs boss/<name> --boss` 起步 |
| **Boss 攻击** | `src/fx/boss/` | 全屏预警、地震、齐射、转阶段等，含命中时间点 |
| **遭遇战** | `src/encounters/` | 地图、英雄、小怪与攻击在同一时间轴上；写 `encounter.boss` 即为 Boss 战 |

浏览器页与渲染工具共用 `createEncounter` 运行时。

```bash
node tools/new.mjs world/mossy-crypt --map
node tools/new.mjs mobs/rat-scout --mob
node tools/new.mjs mobs/rat-bite --mob-attack
node tools/new.mjs boss/bog-witch --boss
node tools/new.mjs boss/bog-nova --boss-attack
node tools/new.mjs my-encounter --encounter      # 时间轴模板（Boss 战需自行写 encounter.boss）

node tools/map.mjs world/mossy-ruins
node tools/encounter.mjs <name> --mp4
```

本仓库当前未附带示例遭遇战；在 `src/encounters/` 添加模块之前，[`docs/ENCOUNTERS.md`](docs/ENCOUNTERS.md) 中为 **<!-- encounter-count -->0<!-- /encounter-count -->** 条。添加后 [gallery/fantasy.html](gallery/fantasy.html) 会与工具共用同一套时间轴。

新内容会像普通特效一样过 `npm run check`（地面与出生点、有 Boss 时的阶段、攻击 hit 时间、时间轴顺序等）。`node tools/index.mjs` 会 regenerate 注册表与 [目录](docs/CATALOG.md)/[遭遇目录](docs/ENCOUNTERS.md)。数据约定与设计清单见 [docs/FANTASY.md](docs/FANTASY.md)。

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

### 浏览器 Gallery

无需 Cocos，本地预览：

```bash
npm run gallery
```

打开 [http://localhost:8080/gallery/](http://localhost:8080/gallery/)。直接 import 特效模块，支持分类、搜索与播放控制，并把每条特效标为 `original` 或 `new`；`?source=new` 直接打开新增内容。若在 `src/encounters/` 编写了遭遇战，可在 [fantasy.html](http://localhost:8080/gallery/fantasy.html) 播放同一时间轴（当前无示例模块时列表为空）。`npm run build:web` 输出静态站到 `dist/gallery/`。

新增特效后运行 `node tools/index.mjs`，刷新 gallery 即可（同一命令会更新本 README 中的 `act` / `moves` / 遭遇战条数）；静态版本需重新执行 `npm run build:web`。

换色示例：

```bash
node tools/render.mjs fire/torch --gif --opts '{"palette": ["#102","#215","#43a","#8cf","#cff","#fff"]}'
```

## 演出系统 {#acting}

<p align="center">
  <img src="docs/readme/acts.gif" width="800" alt="假人与草靶对练：连击、重锤、地击等，含蓄力、命中定格与收招。">
</p>

单独播放特效像贴纸；命中感来自身体演出：蓄力、定格、目标后仰、收招。**<!-- act-count -->113<!-- /act-count -->** 个特效导出 `act`；**<!-- moves-count -->12<!-- /moves-count -->** 个 **moves** 是独立的成套攻击编排：

```js
export const act = {
  target: { x: 58 },
  poses: [[-0.55, GUARD], [-0.3, WIND_UP], [0, CUT, "snap"], …],
  hits: [{ t: 0.06, stop: 0.14, shake: 0.18, amp: 2, push: 2.8, straw: 18 }],
};
```

用 `createAct` 替代 `createFx` 可连角色与目标一起播。自有角色可读 `slash.act` 或导出 JSON 里的 `meta.pixelfx.act` 对齐 wind-up 与 freeze。详见英文 [README — acting](README.md#acting) 与 [docs/AUTHORING.md](docs/AUTHORING.md)。

## Skill {#the-skill}

Codex 的项目级入口位于 `.agents/skills/pixelfx`，通过相对符号链接复用 `skills/pixelfx/`。
统一在 `skills/pixelfx/` 中维护指令与参考资料，供 Codex 和 Claude Code 共用。

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
