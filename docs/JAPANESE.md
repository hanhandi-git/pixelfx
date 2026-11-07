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
| 天照命·八咫镜 | Amaterasu, sun mirror · `kami/amaterasu-sun` | once | 340×230 | 3.35s | 举起八咫镜，镜面收光，目标脚下神纹写开，天顶的日轮睁开：硬边光芒、金色光柱落下、地面持续发亮。 |
| 月读命·月弓 | Tsukuyomi, moon bow · `kami/tsukuyomi-arrow` | once | 320×190 | 3.0s | 月光在身前绷成一张月弓，拉满、放弦，银箭拖着月尘穿过场地；命中是一道白色月牙斩，冷光地环与落月花瓣。 |
| 须佐之男·十拳剑 | Susanoo, storm sword · `kami/susanoo-thunder` | once | 340×240 | 3.5s | 云海压顶，六面三巴太鼓随雷声跳动；十拳剑引雷，向下一斩拉出白紫雷柱，地面裂开、雨与紫电残留。 |
| 云从剑 | Ame-no-Murakumo · `kami/ame-no-murakumo` | once | 360×220 | 3.2s | 风先起，丛云海漫过场地；一记上挑斩，白线在云里剖出一道暗缝，撕开的云层翻卷落风，剑尖点在目标身上。 |
| 六勾玉 | Six magatama · `kami/magatama-six` | loop | 140×112 | 3.6s | 六枚翡翠勾玉穿在金线上绕中心转动，后半圈压在雾后变暗，金屑在勾玉之间明灭。 |
| 天岩户 | Ama-no-Iwato · `kami/ameno-iwato` | once | 320×200 | 3.8s | 注连绳绷在封住太阳的巨石上，石缝由内裂开，石门向两侧错开，白金光从缝里涌出，纸垂被掀飞、碎石坠落。 |
| 八岐大蛇 | Yamata no Orochi · `kami/yamata-no-orochi` | once | 420×300 | 4.5s | 血红雾里八颗蛇首分两排升起，眼睛依次点亮，张口吐火；一记白金剑线横切整排，鳞片与余烬齐飞。 |

## 节拍

**天照命·八咫镜**：举镜（0–0.6s，镜面白点收光、金色压力环内收、脚下神纹起笔）→ 开日
（0.88s，白闪、日轮成形）→ 光柱落点（1.02s，命中白心、日轮硬边十六芒、地环与金色余烬）→
第二次脉动（1.45–1.8s，光芒伸长）→ 收光（到 3.35s 清空）。日轮的芒是线而不是实心三角，
所以大画面也不糊。

**月读命·月弓**：搭箭（0–0.16s）→ 拉满（0.16–0.56s，月弓绷紧、弦向手背弯）→ 放弦
（0.56s，箭离弦，弓弦回弹）→ 飞行（0.56–0.78s，银箭 + 月尘尾迹）→ 命中（0.78s，白色月牙斩、
冷光环、竖直光痕）→ 落月花瓣与冷余辉（到 3.0s 清空）。弓本身画在特效里，动作只负责拉弓的
身体与弦位。

**须佐之男·十拳剑**：聚雷（0–0.9s，云海翻涌、云内紫光、六面太鼓、剑尖电弧）→ 斩（0.9s，
云层被横切开一道光）→ 雷柱（1.06s 起，白核紫电、分叉、地裂、碎石、雨）→ 余雷与雨
（到 3.5s 清空）。雷柱、分叉和落点都从同一组常量出发，`act` 的命中帧与电柱落点对齐。

**云从剑**：风起（0–0.42s，贴地风线、剑尖收光）→ 上挑（0.48–0.52s）→ 剖云（白线在云中
切出一道暗缝，云缘被烤亮）→ 云层翻卷落风（0.6s 起）→ 命中（0.64s，白心、风环、地尘）→
云絮与青色余尘（到 3.2s 清空）。云的整块绘制靠 `cloudBank`，切口用暗色线挖出来再点白线。

**六勾玉**：循环。六枚勾玉按相位绕椭圆轨道转，后半圈先画、压暗，前半圈后画、提起；中心的
玉核随两拍呼吸，金色刻度环反向转；金屑用 `loopNoise` 明灭。所有相位都是整圈，所以首尾无接缝。

**天岩户**：注连绳绷紧、纸垂抖动（0–0.75s）→ 石缝由内发亮、裂纹分叉（0.75s 起）→ 石门错开
（1.32s 起），光扇、光柱和地面光同时涌出 → 碎石与纸垂翻飞 → 光收回最后一道暖缝
（到 3.8s 清空）。石门用逐行石块填充，一帧只要几千个像素，不用整块多边形。

**八岐大蛇**：血雾与云（0–0.55s）→ 八颗蛇首分两排升起、眼睛依次点亮（0.55–1.5s）→ 前排四口
吐火（1.5–2.25s）→ 白金剑线横切（2.35s，白闪、鳞片与余烬）→ 蛇首后仰、红雨与残眼
（到 4.5s 清空）。后排蛇首更小更暗、无角，形成纵深。

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
