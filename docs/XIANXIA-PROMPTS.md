# 东方仙侠特效 Prompt 集

三套可直接投喂图像 / 视频模型的仙侠特效描述，也可当作 pixelfx 效果的设计简报。
每套统一给出：一句话方向（可写进 `meta.desc`）、中文主 prompt、节拍表、配色、英文 prompt、专属负面词。

- **A 剑修 · 万剑归宗** — 冷青云海，万剑环身，一剑白虹。结构最干净，适合第一个实现。
- **B 丹修 · 丹火化形** — 青铜丹炉，火鹤成形，撞炉炸裂。暖暗对比，适合 boss 技能。
- **C 符修 · 万符镇魂** — 荒庙符阵，朱砂点符，太极下压。最贴合全场 AOE / encounter 开场。

> 用法：中文 prompt 给视频模型（可灵、即梦、Sora、Veo）整段投喂；英文给 Midjourney / SDXL 类图像模型。
> 共同负面词在三套之后，落码映射见文末附录。

---

## A. 剑修 · 万剑归宗

**一句话方向**：云海石台上，剑修背身掐诀引千剑环身，一剑白虹劈开云海，剑气散作万点灵光。

### 主 prompt

> **东方仙侠，青绿山水意境，暗调电影感。** 云海之上的一方悬空青玉台，台面刻满星斗与太极阵纹，边缘残破、苔痕斑驳；远处群峰只露墨色剪影，被云气吞掉大半，天光从云隙斜插下来。
>
> 台心立着一位剑修背影，广袖垂落，发带与剑穗被高空的风吹得极缓。**全程不露正脸。**
>
> **起**：指尖一掐诀，足下阵纹自内向外一圈圈亮起，青白色，像玉里透了灯；四面灵气被抽成千百条细线，从云海、从山影、从他袖口汇向掌心，线条细而不断，带轻微抖动。
>
> **聚**：云层里升起无数飞剑虚影，半透明，剑尖朝外绕身成环，越聚越密；剑鸣清越，空气被剑锋划出一道道极细的白线。环转得越来越快，最内一圈剑影开始实体化、泛出冷冽反光。
>
> **发**：所有剑影骤然收束成一线，一柄实剑自天而降——**两帧全白**，云海被劈开一道笔直裂缝，缝里透出刺目天光，裂缝边缘的云被灼成青金色。
>
> **散**：剑气炸成万千细丝向两侧铺开，石台从劈痕处崩裂，青玉碎屑、鹤羽、符纸被气浪卷起，缓慢飘落；灵光不熄灭，只被拉长、吹细。
>
> **寂**：残剑斜插裂台，剑身还有一线游走的光，金色灵点缓缓上升，云海慢慢合拢，把裂缝与光一起吞掉。
>
> **风格**：留白与气韵，冷青主调压全场，鎏金与朱砂只做极小面积点睛；光是内敛、通透、有方向的，不是爆炸火球；粒子细腻、体积光、轻微胶片颗粒，2.39:1，无字幕。

### 节拍表

| 时间 | 画面 | 光色 |
|---|---|---|
| 0–0.6s | 云海缓涌，背影不动，剑穗轻摆 | 冷青，极暗 |
| 0.6–1.4s | 掐诀，星斗阵纹逐圈点亮，灵气细线汇入 | 青白自下而上 |
| 1.4–2.0s | 千剑虚影升起，绕身成环，空气切出白线 | 冷银 + 青 |
| 2.0–2.1s | 剑影收束，一剑落下，两帧全白 | 纯白 → 天光裂缝 |
| 2.1–3.4s | 云海被劈开，剑气化作万点细丝，台崩羽落 | 青金，边缘灼白 |
| 3.4–5.0s | 残剑插地，一线残光，金点上升，云合 | 收敛为冷金一点 |

### 配色

`#0B1220` 夜底 · `#17324A` 远山 · `#2E6E8E` 玉青 · `#5AA8BD` 灵气 · `#CFEDF5` 剑锋 · `#FFFFFF` 白虹 · `#C9A227` 鎏金（点睛）

### English

> Eastern xianxia, ink-wash landscape, dark cinematic tone. A broken jade platform floats above a sea of clouds, carved with star maps and taiji arrays, moss in the cracks, distant peaks reduced to ink silhouettes. A sword cultivator stands with his back to us, sleeves and sword tassel moving in the high wind — face never shown. He forms a seal; the array under his feet lights ring by ring in pale jade-white, threads of qi drawn in from clouds and peaks into his palm. Half-transparent flying swords rise from the cloud sea and orbit him, tips outward, faster and denser, the air cut into thin white lines. They collapse into a single blade that falls from the sky — two frames of pure white — and the cloud sea splits along a straight seam of blinding daylight. Sword qi bursts into thousands of fine threads; the platform cracks, jade shards, crane feathers and talismans drift up and fall. The blade stands embedded with one thread of light still crawling on it, golden motes rise, the clouds close over the seam. Chinese negative space, cold jade palette with tiny gold accents, restrained translucent light, volumetric rays, film grain, anamorphic 2.39:1, no text.

### 专属负面

火球爆炸、岩浆浓烟、西式魔法阵、赛博霓虹、人脸特写。

---

## B. 丹修 · 丹火化形

**一句话方向**：青铜丹炉悬于八卦石台，炉盖震开，一炉丹火腾起凝成火鹤绕炉三匝，撞回炉中炸出裂纹与金砂。

### 主 prompt

> **东方仙侠，洞天丹房，暖暗对比。** 半山地火洞府，穹顶垂下锈色铁链，四壁凿出药龛，摆满玉瓶、木匣与晾着的药材；正中一座巨大的三足青铜丹炉悬在八卦石台之上，炉身刻云雷纹与饕餮纹，铜绿从纹路里渗出来，炉底透着一层闷红的地火。
>
> **静**：炉内一声闷响，火光从炉盖缝隙里一丝丝渗出，炉口吐出的白气在冷空气里卷成小涡；挂在炉上的铜铃被震得轻颤。
>
> **震**：炉盖开始跳动，八卦纹自炉心向外逐格亮起朱红烧色，石台被烤出细密裂纹，铜锈片片剥落、浮起，地面尘埃向上浮。
>
> **开**：一声轰鸣，炉盖掀飞，一柱丹火冲天，火光中先出现一只鹤的头颈，再展开双翼——**火鹤由火焰凝成，羽片是一层层红到金的火舌**，每扇一下翅膀，空气就被热浪扭出波纹。
>
> **绕**：火鹤离炉，绕炉三匝，尾羽拖出金砂般的火星，所过之处留下一圈圈缓慢消散的热浪与焦痕；第三匝时它越飞越大，几乎撑满画面。
>
> **归**：火鹤骤然收翅，俯冲撞回炉中——**一帧纯白**，炉身从内部亮成半透明的橘红。
>
> **裂**：炉身炸出蛛网裂纹，金砂、铜片、药渣四射，余火在地面烧成一个旋转的八卦火环，火环边缘的火舌向内倒卷。
>
> **寂**：火收成炉底一颗丹丸大小的光点，青烟与金砂缓缓上升，裂纹里的红光一明一暗，像炉子还在喘气。
>
> **风格**：炉火是“闷、厚、有重量”的火，不是爆炸；主色朱砂与鎏金，铜绿与墨压暗；所有火星走真实抛物线，落地弹跳后熄灭；体积光从炉口向上打，2.39:1，无字幕。

### 节拍表

| 时间 | 画面 | 光色 |
|---|---|---|
| 0–0.6s | 炉内闷响，火光从缝里渗出，白气成涡 | 暗红 + 冷白气 |
| 0.6–1.4s | 炉盖跳动，八卦纹逐格烧红，铜锈浮起 | 朱砂自炉心外扩 |
| 1.4–2.0s | 炉盖掀飞，火柱冲天，火鹤头颈先出 | 橙红 → 金 |
| 2.0–2.8s | 火鹤绕炉三匝，尾拖金砂，热浪扭空气 | 金红为主，铜绿压边 |
| 2.8–2.9s | 收翅俯冲撞回炉中，一帧纯白 | 白 → 橘红透炉 |
| 2.9–4.2s | 炉身蛛网爆裂，金砂铜片四射，地面八卦火环 | 朱砂 + 鎏金 |
| 4.2–5.2s | 火收成一点丹光，青烟与金砂上升 | 收敛为暗红呼吸 |

### 配色

`#14121A` 墨 · `#4A7C6F` 铜绿 · `#7A3A18` 暗铜 · `#C0392B` 朱砂 · `#E0561E` 丹火 · `#C9A227` 鎏金 · `#F2EDE4` 白气 · `#FFF3C4` 丹光

### English

> Eastern xianxia, a mountain alchemy vault, warm dark key. Rusted chains hang from the ceiling; herb niches line the walls with jade bottles and drying roots. At the centre a huge three-legged bronze cauldron hangs above an octagonal stone dais, its body carved with cloud-thunder and taotie patterns, verdigris seeping from the grooves, a dull red earth-fire glowing beneath it. A muffled thud; firelight leaks from the lid's seams, white vapour curls into small vortices, brass bells tremble. The lid begins to jump; the bagua pattern ignites ring by ring from the core, hairline cracks spread across the dais, flakes of verdigris peel off and float up. With a boom the lid is flung off and a column of elixir fire erupts — a crane's head and neck form first, then the wings unfold: the crane is made of fire, its feathers layers of flame from red to gold, each wingbeat warping the air with heat. It circles the cauldron three times trailing gold sand, leaving a ring of fading heat ripples and scorch marks, growing until it nearly fills the frame, then folds its wings and dives back into the cauldron — one frame of pure white, the bronze glowing translucent orange. The cauldron cracks into a spiderweb, gold sand, bronze shards and herb residue spray out, leftover fire burns into a rotating bagua ring on the floor. The fire collapses to a pill-sized point of light at the cauldron's base; blue smoke and gold sand rise slowly, the glow in the cracks pulsing like breathing. Furnace fire with weight, not an explosion; cinnabar and gilt palette, verdigris and ink holding it down; physical sparks that bounce and die; volumetric light from the cauldron mouth, anamorphic 2.39:1, no text.

### 专属负面

西式炼金术与坩埚、爆炸火球与浓黑油烟、现代实验室器皿、赛博霓虹、糖果色。

---

## C. 符修 · 万符镇魂

**一句话方向**：荒庙夜里万千黄符自地升起、朱砂字逐张点亮，符阵压下，地面浮出太极虚影，符纸燃尽成灰逆重力上飘。

### 主 prompt

> **东方仙侠，荒野古庙，冷月与暖符。** 夜里的废弃山神庙，断碑横地，青石坪裂成八块，半空悬着褪色的残破经幡；月很低，青白色的冷光从破檐漏下来，把地面切成几道光栅。
>
> **静**：地上的黄符一张张立起来，纸角被无形的手按住又松开，微微发颤；符上的朱砂字还是暗的，看不清写了什么。
>
> **燃**：笔锋一样的金色从每一道符文的起笔处亮起，一笔一笔描过去，像有人在半空写字；点亮的符纸自内透出暖光，把周围的空气映成暖黄，冷月光被压到边缘。
>
> **阵**：符纸齐齐离地升空，在头顶排成一圈巨大的符阵，缓慢旋转；相邻的符之间拉出细细的金色光线，光线连成一张网，网上浮动着不断变化的符文投影。
>
> **镇**：符阵猛地向下一压——**一帧纯白**，落点砸出巨大的太极虚影，虚影边缘的火星贴着地面向外炸开，石坪被压出放射状裂纹。
>
> **散**：所有符纸同时自燃，从边缘卷起金红的火线，燃尽成灰；灰烬不落地，逆着重力向上飘，像被什么东西吸回天上。
>
> **寂**：太极虚影缓缓转动，一点点淡下去；最后一张符打着旋飘落，触地的一瞬化成灰，月光重新铺满石坪。
>
> **风格**：符纸要“薄、脆、有纸感”，边缘毛糙；朱砂是唯一的暖色源，冷月光负责塑形；不要发光宝石，不要能量球；火星与灰烬两套粒子，一个向外炸、一个向上飘；2.39:1，无字幕。

### 节拍表

| 时间 | 画面 | 光色 |
|---|---|---|
| 0–0.6s | 黄符自地立起，纸角颤动，朱砂仍暗 | 冷月青白 |
| 0.6–1.4s | 符文逐笔点亮，暖光从纸里透出 | 暖黄压住冷青 |
| 1.4–2.2s | 符纸升空成环，符阵旋转，金线连成网 | 金 + 暖黄 |
| 2.2–2.3s | 符阵下压，一帧纯白，砸出太极虚影 | 白 → 朱砂金 |
| 2.3–3.6s | 符纸自燃成灰，灰烬逆重力上升 | 金红渐暗 |
| 3.6–4.6s | 太极淡去，最后一张符落地成灰，月光复位 | 收敛为冷青 |

### 配色

`#0A0C14` 夜色 · `#2A3448` 石坪 · `#CFEDF5` 月光 · `#D9B65A` 符纸 · `#C0392B` 朱砂 · `#C9A227` 金线 · `#F2EDE4` 符光 · `#FFF3C4` 太极辉光

### English

> Eastern xianxia, abandoned mountain shrine at night, cold moon against warm talismans. A broken stele lies across a cracked stone yard, faded prayer banners hang in mid-air, low moonlight rakes through the ruined eaves. Yellow paper talismans begin to stand up from the ground one by one, their corners trembling; the cinnabar script is still dark. Then a brushstroke-like gold light ignites at the first stroke of each glyph and traces it stroke by stroke, as if someone were writing in the air; the lit papers glow from within, warming the air while the moonlight is pushed to the edges. The talismans lift off in unison and form a huge rotating ring overhead, thin gold threads linking neighbours into a net that carries shifting glyph projections. The ring slams down — one frame of pure white — and a colossal taiji shadow is stamped into the stone, sparks blasting outward along the ground, radial cracks spreading. Every talisman self-ignites at once, curling gold-red firelines eating inward to ash; the ash does not fall but rises against gravity. The taiji turns, slowly fading; the last talisman spirals down and turns to ash on contact, moonlight flooding back. Paper that feels thin and brittle with frayed edges, cinnabar as the only warm source, moonlight for form, no glowing gems or energy orbs, two particle systems — sparks bursting outward, ash drifting up — anamorphic 2.39:1, no text.

### 专属负面

日式御守与神社、西方羊皮卷与拉丁符文、发光魔法球、赛博霓虹、现代印刷字体。

---

## 共同负面

> 无文字水印、无 logo；不要西式魔法阵与拉丁/北欧符文；不要日式和风元素（鸟居、樱花、武士）；不要赛博霓虹与全息 UI；不要爆炸火球与滚滚黑烟；不要糖果色、过饱和；不要写实照片质感与人脸大特写；不要 Q 版；不要画面里出现可辨认的现代物件。

---

## 三者差异速查

| | 主体 | 主光源 | 主色 | 节奏重音 | 收尾 |
|---|---|---|---|---|---|
| A 万剑归宗 | 剑与云海 | 自上而下的天光 | 玉青 + 冷银 | 一剑落下，两帧全白 | 残剑一线光 |
| B 丹火化形 | 丹炉与火鹤 | 炉口自下而上 | 朱砂 + 鎏金 | 火鹤撞炉，一帧纯白 | 炉底一点丹光 |
| C 万符镇魂 | 符阵与太极 | 符纸自内发光 | 符黄 + 朱砂 | 符阵下压，一帧纯白 | 最后一张符化灰 |

---

## 附录：落成 pixelfx 效果时的映射

| 项 | A 万剑归宗 | B 丹火化形 | C 万符镇魂 |
|---|---|---|---|
| `category/name` | `melee/wanjian-return` | `fire/cinnabar-crane` | `spawn/talisman-suppression` |
| `size` / `origin` | `[240,160]` / `[120,124]` | `[224,176]` / `[112,140]` | `[256,160]` / `[128,124]` |
| `duration` / `bg` | 5.0 / `sky` | 5.2 / `ground` | 4.6 / `ground` |
| 阶段常量 | `SEAL 0.6` `GATHER 1.4` `STRIKE 2.05` `SPREAD 2.2` `FADE 3.4` | `RUMBLE 0.6` `LID 1.4` `CRANE 2.0` `SLAM 2.85` `CRACK 3.1` `FADE 4.2` | `RISE 0.6` `INK 1.4` `RING 2.2` `PRESS 2.25` `BURN 2.4` `FADE 3.6` |
| 主调色板 | 玉青 8 阶 + 鎏金点睛 | 朱砂 8 阶 + 铜绿压边 | 符黄 8 阶 + 冷月青白 |
| 云 / 气体积 | `tileFbm` 横向滚动 + `VAPOUR` | 炉口白气 `VAPOUR` + 地火 `FIRE` | 夜间薄雾 `DUST` + 符光 `glow` |
| 爆发粒子 | `P.STREAK` 短寿命收束 + `p.line` 冷光 | `P.SPARK` 抛物线 + `Bits` 铜片/金砂 | `P.EMBER` 外炸 + 灰烬 `P.MOTE`（`vy` 反向） |
| 层级 | `drawBack` 远景云与剑影 | `drawBack` 炉底地火与台面焦痕 | `drawBack` 远景庙檐与地面裂纹 |
| 结束方式 | 残剑 + 合拢的云 | 一点丹光 + 青烟 | 最后一张符化灰 + 月光复位 |

> 备注：本文件是设计素材，不属于库的生成产物；`docs/CATALOG.md`、`src/fx/index.js` 仍由 `node tools/index.mjs` 生成。
