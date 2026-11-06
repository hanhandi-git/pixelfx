# Painter 底层绘制参考

在需要新增绘制原语、组合复杂几何、修复变换/透明度问题，或评估某个 helper 是否应该进入
`src/core` 时读取本页。普通特效只需要 `SKILL.md` 的 Painter 表；不要为了画一个只用一次的形状
就修改核心 API。

## 核心契约

`Painter` 写入一个 frame 的两个缓冲：`color` 是像素颜色，`light` 是独立的加法光。所有公开绘制
方法接收特效本地坐标；运行时通过 `place(x, y, flip, angle)` 设置原点、镜像和旋转。坐标的 x 向右、
y 向下，单位是原生像素，浮点坐标会在落格时量化。方法会裁剪到 frame，调用方不需要先判断边界。

颜色使用 `hex()`、`rgb()` 或调色板得到的 Uint32 值，`0` 表示透明。`color` 的普通写入不做 alpha
混合：`dot`/`put` 用 4x4 Bayer 阈值做有序抖动，适合硬边缘、淡出和像素碎片；`blend`/`blendPx`
才是真正的半透明混合，适合烟、雾、尘和蒸汽。`light`/`glow*` 只写入加法缓冲，不会改变颜色。

不要直接写 `p.C`、`p.L` 或 frame 数组来实现通用原语。若必须为缓存图像做快路径，保持与
`put`、`add`、`blendPx` 完全相同的裁剪、淡出和缓冲语义，并为镜像/旋转路径保留正确实现。

## 变换与像素访问

| API | 用途和约定 |
|---|---|
| `p.reset()` | 重新读取 frame，清除放置、淡出、光强和 layer 状态；复用 Painter 前调用。 |
| `p.place(x, y, flip, angle)` | 设置本地原点、水平镜像和弧度旋转；返回 `p` 可链式调用。 |
| `p.toX/toY(x,y)`、`p.fromX/fromY(sx,sy)` | 本地与屏幕坐标互转；几何算法需要在本地空间工作时使用。 |
| `p.cellX/cellY(x,y)` | 将本地像素单元中心映射到屏幕整数像素；像素原语通过它保持镜像和旋转一致。 |
| `p.put(sx,sy,c,a)`、`p.add(sx,sy,c,k)` | 已经是屏幕坐标的底层写入；只在实现核心快路径时使用。 |
| `p.get(x,y)` | 读取本地像素颜色；越界或空像素返回 `0`。 |
| `p.each(x0,y0,x1,y1,fn)` | 遍历本地矩形覆盖到的屏幕像素，回调 `(x,y,sx,sy)`，其中 x/y 是像素中心。 |
| `p.shade(x0,y0,x1,y1,fn)` | 逐像素着色；回调可返回颜色，或设置复用的 `out.c/out.a/out.l/out.k`。 |

`shade` 的 `out` 对象每次调用前都会重置为 `{ c: 0, a: 1, l: 0, k: 0 }`，不要把它保存到外部。
`out.l` 默认可用 `out.c`，`out.k` 是光强；返回 `undefined` 且不设置 `out.c` 表示跳过该像素。

## 选择已有原语

### 像素、线和路径

| API | 回调参数 |
|---|---|
| `px(x,y,c)` / `dot(x,y,c,a)` | 一个实心或 Bayer 抖动像素。 |
| `blend(x,y,c,a)` | 一个真正半透明的本地像素。 |
| `line(x0,y0,x1,y1,c,a)` | 1 px Bresenham 线；颜色和 alpha 可为 `(u)`，u 从 0 到 1。 |
| `polyline(pts,c,a)` | 顺序连接点列表；每段沿用 `line` 语义。 |
| `beam(x0,y0,x1,y1,width,c,a)` | 带圆头的粗线；颜色和 alpha 可为 `(u,v)`，u 沿线，v 从中心到边缘。 |
| `strokePath(path,width,c,a,from,to)` | 描边 `createPath()`；宽度可为 `width(u)`，颜色和 alpha 可为 `(u,v)`，from/to 是 0..1 的距离区间。 |

`strokePath` 会保留折线顶点，并对每个像素只采用最近横截面，适合不会在拐角处出现暗接缝的闪电、
飘带和能量束。闭合路径跨接缝的拖尾拆成 `[from,1]` 与 `[0,to]` 两次调用。

### 实心和半透明形状

| API | 回调参数 |
|---|---|
| `circle(cx,cy,r,c,a)` | 实心圆；`c/a(d,angle)`，d 为中心 0 到边缘 1。 |
| `ellipse(cx,cy,rx,ry,c,a)` | 椭圆；回调同圆。 |
| `ring(cx,cy,r,w,c,a)` | 半径 `r-w` 到 `r` 的环；`c/a(v,angle)`，v 从内圈到外圈。 |
| `arc(cx,cy,r,w,a0,a1,c,a)` | 环的角带；`w` 可为 `w(u)`，回调 `(u,v)`，u 从 a0 到 a1。 |
| `rect(x,y,w,h,c,a)` | 填充矩形；旋转时自动走逐像素路径，宽高按左上角和尺寸解释。 |
| `poly(pts,c,a)` / `tri(...)` | 偶奇规则填充多边形；颜色和 alpha 可为 `(x,y)`。 |
| `disc(cx,cy,r,c,a)` | 真正半透明圆盘；不要用它代替硬边 `circle`。回调同圆。 |
| `sdf(shape,bounds,c,a)` | 在明确 bounds 内填充距离小于等于 0 的区域；回调 `(distance,x,y)`。 |

距离场的布尔组合和遮罩烘焙见项目的 `docs/CORE-EXTENSIONS.md`。bounds 必须覆盖形状、扩张和描边，
否则边缘会被合法地裁掉。

### 图像、遮罩和文字

| API | 用途 |
|---|---|
| `image(buf,bw,bh,x,y)` / `lightImage(...)` | 将缓存的颜色或光缓冲贴到本地左上角；无变换时走快路径。 |
| `sprite(rows,pal,x,y,opts)` | 用字符串绘制小精灵；支持 `scale/a/flip/flipY/tint`。`.` 和空格透明。 |
| `text(str,x,y,c,opts)` / `measure(str,opts)` | `mini` 3x5 与 `big` 5x7 像素字体；支持对齐、描边、阴影和缩放。 |
| `mask(m,x,y,c,a)` / `outline(m,x,y,c,a)` | 绘制二值遮罩及其 1 px 四邻域轮廓。 |

`image` 的输入是颜色 Uint32 数组，0 透明；它不会把颜色当作 alpha 层混合。需要淡出或旋转时让
Painter 走普通像素路径，或在源缓冲生成时完成所需处理。

### 光照

| API | 用途 |
|---|---|
| `light(x,y,c,k)` | 一个局部加法光像素。 |
| `glow(x,y,r,c,k)` | 径向光，中心最强，边缘二次衰减。 |
| `glowLine(x0,y0,x1,y1,r,c,k)` | 沿线的软光束。 |
| `glowRing(x,y,R,r,c,k)` | 围绕半径 R 的环形光，r 是光带宽度。 |

通常先用 `color` 画轮廓、核心和材质，再用低强度大半径 `glow`、高强度小半径 `glow` 和沿路径的
`glowLine` 补光。不要把柔光直接抖到 color 缓冲，否则烟雾和光晕会出现棋盘格。

## 组合模式

```js
// 硬边材质 + 柔和体积 + 独立光
p.ring(0, -18, radius, 2, (v) => v < 0.35 ? C[6] : C[4], alpha);
p.disc(0, -18, radius * 0.8, SMOKE, (d) => 0.18 * (1 - d));
p.glow(0, -18, radius * 1.8, C[4], 0.22);

// 同一条路径上的颜色与光保持一致
const path = createPath(points);
p.strokePath(path, (u) => 1 + 3 * u, (u, v) => v < 0.45 ? C[6] : C[3]);
p.glowLine(points[0][0], points[0][1], points.at(-1)[0], points.at(-1)[1], 5, C[4], 0.3);

// 用 shade 做单一材质的逐像素分层
p.shade(-20, -12, 20, 12, (x, y, out) => {
  const d = Math.hypot(x / 20, y / 12);
  if (d > 1) return;
  out.c = d < 0.25 ? C[6] : d < 0.65 ? C[4] : C[2];
  out.a = 1 - Math.max(0, d - 0.8) * 5;
  out.l = C[5]; out.k = d < 0.4 ? 0.2 : 0;
});
```

这些示例仍然遵守“颜色硬、光照软”的像素语言；材质层要有清晰轮廓，shader 不应变成连续的矢量
渐变。需要分层遮挡时把远半部放到 `drawBack`，而不是给 primitive 增加隐含的深度状态。

## 扩展 Painter 的规则

只有当一个操作在多个效果中都能复用、需要统一变换/裁剪语义，或能显著减少重复逐像素代码时，才
把它加入 `src/core/painter.js`。只在单个效果使用的形状放进该效果的 `_lib.js`。

新增方法时：

1. 保持参数在本地坐标中；用 `cellX/cellY`、`each` 或 `shade`，确保 `place()` 的镜像、旋转、frame 偏移和边界裁剪都生效。
2. 颜色写入走 `put`/`dot`，半透明体积走 `blendPx`/`blend`，光走 `add`/`light`；不要把三种语义合成一个“聪明”的 blend 参数。
3. 回调参数说明清楚归一化范围和坐标空间；对半径、宽度、bounds 和空点集定义稳定行为。保持确定性，禁止隐式时间和 `Math.random()`。
4. 让无变换的常用路径可以快，但先保留通用变换路径；快路径必须与通用路径在颜色、alpha、裁剪和缓冲结果上一致。
5. 在 `tests/core-extension.test.mjs` 增加行为测试：至少覆盖一个镜像或旋转、越界裁剪、alpha/Bayer 或真正混合、以及 color/light 分离。测试像素语义，不要只测函数是否存在。
6. 如果新增的是路径、SDF、力场等独立模块，按需从 `src/core/index.js` 导出，并更新 `docs/CORE-EXTENSIONS.md`；不要在效果文件里复制一套第二 API。
7. 修改后运行 `npm test`，再对代表性效果运行 `node tools/check.mjs <id>` 和 `node tools/render.mjs <id> --gif`，打开渲染结果检查 1x 可读性与边界。Painter 改动影响全库时再运行完整 `npm run check`。

常见错误：用 `blend` 画所有淡出（变成脏灰）、把 glow 写进 color（洗白轮廓）、在屏幕坐标直接
实现 primitive（flip/angle 失效）、bounds 少留一圈（shell/blur 被裁），以及用一个只服务单个效果
的 helper 污染核心 API。
