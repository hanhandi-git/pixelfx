# 素材生成、入库与预览

以下命令在用户的 pixelfx 项目根目录执行。用实际素材 ID 替换示例
`lightning/storm-sigil`；ID 始终为 `<category>/<kebab-case-name>`，不依赖展示序号。

## 1. 明确设计并编写源码

先读 `docs/AUTHORING.md`，查看 `docs/CATALOG.md`，再读取、渲染两三个最接近的已有效果。
用一句话确定主体、锚点、配色、蓄力/爆发/余波节奏和结束方式。采用主 skill 的风格约束；已有合适素材
可复用技术，但用户要求新增素材时应有独立的视觉设计和 ID。

源码放 `src/fx/<category>/<name>.js`，导出 `meta` 与 `create(o)` 或 `draw(p, t, o)`。
通过 `src/core/index.js` 的 Painter、Particles、Lights、Rng 等实现；随机形状和粒子受 `o.seed` 控制。
主配色使用 `fit(o.palette, n)`；固体像素与加法光分离。涉及角色时添加 `act`，命中时刻与效果阶段常量对齐。

## 2. 定向验证并目视迭代

```bash
node tools/check.mjs lightning/storm-sigil
node tools/render.mjs lightning/storm-sigil --zoom 3
node tools/act.mjs lightning/storm-sigil
```

仅当导出 `act` 时运行 act 命令。打开实际生成的 contact sheet 和动作帧，修正轮廓、层次、曝光、
时间节奏及裁切；命令成功不能代替看图。GIF/MP4 是可选输出，依赖 ffmpeg。
修正新素材自身的警告，包括多种随机种子的越界、循环接缝和结尾残留。

## 3. 注册到所有预览入口

```bash
node tools/index.mjs
npm run check
```

`tools/index.mjs` 自动更新 `src/fx/index.js`、`docs/CATALOG.md` 和 README 的数量与分类表，
不要手写这些生成内容。完成后检查实际数量增加，并通过注册表按 ID 加载新模块。

H5 数据链是 `gallery/workbench.js` → `gallery/app.js` → `src/fx/index.js`。
新增正常的效果模块并重新生成注册表后，工作台会自动发现它，通常不需要修改 HTML 或硬编码素材列表。

## 4. 同步本地资源目录

当前项目包含 Cocos Creator 3.8.8 预览集成。用户要求放到其他素材同一位置时，增量导出到：

```bash
npm run cocos -- lightning/storm-sigil --out assets/resources/pixelfx
```

得到 `assets/resources/pixelfx/lightning/storm-sigil.json`、主 PNG 和需要时的 `-1.png` 等分页。
当前导出工具按 ID 合并已有 `index.json`；确认其他条目仍在、新条目仅出现一次、页文件存在、帧矩形未越界。
不指定 ID 的导出会重建全库索引；仅在需要全量重建时使用。

保持 atlas 的 top-left 坐标、pivot、30 FPS 等素材自身元数据和最近邻过滤。
Cocos PNG 通过 `resources.load('<id>/texture', Texture2D)` 加载；JSON 通过
`resources.load('<id>', JsonAsset)` 加载。效果逻辑仍保存在 `src/fx/`。
若修改了 Cocos 运行时组件，镜像到 `cocos/runtime/` 并按 AGENTS.md 编译；普通新增素材无需修改运行时。

## 5. 打开并实测浏览器工作台

先检查是否已有服务在运行，确认其返回当前 checkout 的文件。没有服务时启动：

```bash
npm run workbench
```

默认地址是 `http://localhost:8080/gallery/workbench.html?fx=lightning/storm-sigil`。
端口占用且服务不属于当前项目时，使用 `npm run workbench -- 8081` 等空闲端口，并同步交付链接。
通过 HTTP 打开页面，浏览器 ES 模块需要服务器。

用可用的浏览器工具实际验证：素材名和 ID 正确、总数更新、分类与搜索能找到素材、播放时画布发生变化、
暂停与重播可用、切换速度正常、控制台无相关错误。刷新 URL 后仍应选中指定效果。
若具备 Codex 打开面板的工具，显示这条新素材直达链接，方便用户直接查看。

工作台按分类排列，新增第 N 种素材不代表其列表排序是 N；以 ID 和名称核实。
纯 H5 直接执行源码，不需要依赖 Cocos 导出的 PNG。

本地若也使用静态构建页，更新它：

```bash
npm run build:web
```

静态预览地址为同一服务器的 `/dist/gallery/workbench.html?fx=lightning/storm-sigil`。
验证构建页也能发现新素材，避免旧 bundle 的列表仍停在先前数量。

## 6. 交付

交付源码路径、资源路径、浏览器直达链接，以及真实运行的检查结果。
遵循项目约定保留 `records/`、`assets/resources/pixelfx/`、`dist/` 为生成产物，
不要把它们或 Cocos `.meta`、缓存添加到源码提交。
注明实际无法验证的环节，例如仅验证了导出而未在 Creator 内播放。
