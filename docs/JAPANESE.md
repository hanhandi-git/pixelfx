# 日本传说 · Japanese legend

一套七式的神道像素特效，外加三位可操作之神与三件神器。全部由代码绘制：固定种子、
双缓冲（颜色 + 加算光）、带施术者动作（`act`）的技能可导出 Cocos 的 PNG / JSON，
也直接在 Gallery 里实时播放。

- 天照：朱红阴影、日轮金与白热核心（`SUN`）
- 月读：夜空靛蓝到月银（`MOON`）
- 须佐之男 / 云从剑：风暴海绿与苍白的风缘（`STORM`），紫电作为神罚（`VOLT`）
- 六勾玉：翡翠玉体与金线（`JEWEL`）
- 八岐大蛇：陈血红、青铜鳞缘与骨白獠牙（`BLOOD`）
- 天岩户：冷花岗岩与裂缝里的光（`CAVE`）

七式共用 `src/fx/kami/_lib.js`：勾玉、三巴纹、日轮、贴地神纹、云海（丛云）、
纸垂、鸟居与蛇首。所以它们读起来是同一个神话的不同场面，而不是七张无关的图。

## 一览

| 中文 | 名称 / ID | 类型 | 画布 | 时长 | 说明 |
|---|---|---|---|---|---|
| 天照命·八咫镜 | Amaterasu, Yata mirror · `kami/amaterasu-sun` | once | 340×230 | 3.35s | 八咫镜展开八片青铜镜面，吸收场地光线后折成一道日印，镜片碎光在余辉里落下。 |
| 月读命·月弓 | Tsukuyomi, moon bow · `kami/tsukuyomi-arrow` | once | 320×190 | 3.0s | 月光在身前绷成一张月弓，拉满、放弦，银箭拖着月尘穿过场地；命中是一道白色月牙斩，冷光地环与落月花瓣。 |
| 须佐之男·十拳剑 | Susanoo, storm-drum sword · `kami/susanoo-thunder` | once | 340×240 | 3.5s | 三面三巴太鼓绕着举起的十拳剑旋转，风压收紧，落斩召下一棵分叉雷树，地面留着紫电裂纹。 |
| 云从剑 | Ame-no-Murakumo · `kami/ame-no-murakumo` | once | 360×220 | 3.2s | 低云围着剑身盘成一条带，拔剑时形成钩状上挑弧，云层被掀开，命中后只剩一圈冷风。 |
| 六勾玉 | Six magatama · `kami/magatama-six` | loop | 140×112 | 3.6s | 六枚翡翠勾玉穿在金线上绕中心转动，后半圈压在雾后变暗，金屑在勾玉之间明灭。 |
| 天岩户 | Ama-no-Iwato · `kami/ameno-iwato` | once | 320×200 | 3.8s | 一整块洞门巨石沿活的中缝裂成两半，注连绳绷断，暖日从空腔喷出，纸垂与碎石落到门槛。 |
| 八岐大蛇 | Yamata no Orochi, eightfold coil · `kami/yamata-no-orochi` | once | 420×300 | 4.5s | 八颗蛇首从同一颗血红心脏周围盘起，依次睁眼并向内吐息，最后被一道斜切金线收拢。 |

## 节拍

**天照命·八咫镜**：举镜（0–0.55s，手中小镜吸光）→ 八片镜面展开（0.78s，八向反射线与铜框成形）→
折光命中（1.04s，八束光收成胸口日印、地环与碎光）→ 镜片碎屑慢落，地面暖光退去（到 3.35s 清空）。

**月读命·月弓**：搭箭（0–0.16s）→ 拉满（0.16–0.56s，月弓绷紧、弦向手背弯）→ 放弦
（0.56s，箭离弦，弓弦回弹）→ 飞行（0.56–0.78s，银箭 + 月尘尾迹）→ 命中（0.78s，白色月牙斩、
冷光环、竖直光痕）→ 落月花瓣与冷余辉（到 3.0s 清空）。弓本身画在特效里，动作只负责拉弓的
身体与弦位。

**须佐之男·十拳剑**：鼓阵聚压（0–0.88s，三面三巴鼓与风粒绕剑）→ 断云（0.88s，白线一闪）→
雷树落点（1.08s，主干、七条枝叉、白心与地裂）→ 雨丝与紫电冷却（到 3.5s 清空）。

**云从剑**：风带收拢（0–0.5s，低云和贴地风线）→ 钩状上挑（0.5s，弧刃从左下扫到右上）→
命中（0.68s，白心、风环、地尘）→ 云带沿弧线回卷，冷风旋涡消散（到 3.2s 清空）。

**六勾玉**：循环。六枚勾玉按相位绕椭圆轨道转，后半圈先画、压暗，前半圈后画、提起；中心的
玉核随两拍呼吸，金色刻度环反向转；金屑用 `loopNoise` 明灭。所有相位都是整圈，所以首尾无接缝。

**天岩户**：注连绳绷紧（0–0.74s，单块洞门、纸垂和裂纹）→ 石门错开（1.28s 起）→
缝中日光扇出、光柱落到门槛 → 碎石坠下，暖缝收窄（到 3.8s 清空）。

**八岐大蛇**：血雾与共享心脏（0–0.58s）→ 八首沿圆环升起、眼睛逐一亮（0.58–1.25s）→
前排向心吐息（1.48s 起）→ 斜切金线贯穿（2.42s，鳞片和红烬飞散）→ 盘阵塌回血雾（到 4.5s 清空）。

## 人物

| ID | 人物 | 外形与材质 |
|---|---|---|
| `amaterasu` | 天照命 / Amaterasu | 头后金色日轮（辐条 + 内盘），及腰黑发、金簪、额前朱红日印；白色羽织宽袖、朱红袴、金腰带；胸前八咫镜。 |
| `tsukuyomi` | 月读命 / Tsukuyomi | 高黑冠（冠顶金线、正面银月牙），直发及腰；蓝染束带、白领与白腰带、宽袖；头后银月牙，腰侧小月镜。 |
| `susanoo` | 须佐之男 / Susanoo | 狂乱鬃发、赤裸上身，单肩破风披风；胸前注连绳（朱红绳、缠带、结与垂穗）；皮护腕、风灰袴、赤足草鞋；一肩残留电光。 |

三人都是原创程序化几何，只取神话形象的轮廓与材质线索，不复制任何已出版的像素画。
角色选择在 Gallery 的动作人物区，URL 参数 `?character=amaterasu`。

## 神器

| ID | 神器 | 类别 | 动作 |
|---|---|---|---|
| `kusanagi` | 云从剑 / 天丛云剑 / Kusanagi | 近战 | `kami/ame-no-murakumo` — 直刃双锋、云头护手、雷纹剑身 |
| `totsuka` | 十拳剑 / Totsuka | 近战 | `kami/susanoo-thunder` — 宽长直刃、赤缠柄、龙首护手 |
| `yata-mirror` | 八咫镜 / Yata mirror | 近战 | `kami/amaterasu-sun` — 铜镜短柄、亮面八芒星 |

武器在骨架的手部坐标系里绘制，随姿势与深度缓冲正确遮挡；`?weapon=kusanagi` 可直接预览。

## 使用

```js
import { createAct, createFrame } from "pixelfx";
import * as sunMirror from "pixelfx/fx/kami/amaterasu-sun";

const frame = createFrame(340, 230);
const fx = createAct(sunMirror, { x: 104, y: 202, character: "amaterasu" });
fx.update(1 / 60);
fx.draw(frame);
// 自己的角色：读 sunMirror.act 的 poses / hits，替身只需要在同一时刻抬手与定格
```

```sh
node tools/render.mjs kami/amaterasu-sun --sheet
node tools/render.mjs kami/magatama-six --gif
node tools/act.mjs kami/susanoo-thunder --character susanoo
node --test tests/characters.test.mjs tests/weapons.test.mjs
```

Gallery：`gallery/index.html?theme=japan` 只看本主题；`?source=new` 只看新增；
`?character=tsukuyomi&weapon=kusanagi` 直接看人物与神器动作。
