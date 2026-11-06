# 可组合的底层特效能力

路径、距离场与空间场都从 `src/core/index.js` 导出，不依赖浏览器或游戏引擎。坐标沿用
Painter：x 向右、y 向下，单位为原生像素；时间为秒，角度为弧度。形状和场都在特效的本地坐标中，
最后由 Painter 统一放置、镜像与旋转。

可运行示例是 `src/fx/arcane/flow-seal.js`：贝塞尔飘带围绕距离场符文运动，粒子受吸引、旋涡及扰动场作用。

```sh
npm test
node tools/check.mjs arcane/flow-seal
node tools/render.mjs arcane/flow-seal --gif
npm run gallery
# /gallery/index.html#arcane
```

## 路径：形状与运动共用几何

```js
import { createPath, cubicBezier } from "pixelfx";

// 在初始化阶段构建；控制点、路径与特效使用同一本地坐标。
const path = createPath(cubicBezier(
  [-50, 0], [-35, -80], [35, -80], [50, 0],
), { samples: 128 });

// u 是走过的距离比例，而非 Bezier 自身的参数；匀速增加 u 即近似匀速移动。
const q = path.sample(u); // {x, y, tx, ty, nx, ny}
// tx,ty 为单位切线；nx,ny 为法线 [-ty,tx]，在屏幕坐标中顺时针旋转 90°。
p.circle(q.x, q.y, 2, color);
p.strokePath(path, (u) => 1 + 5 * u, color, 1, 0, u);
```

| 接口 | 约定 |
|---|---|
| `quadraticBezier(a,b,c)` / `cubicBezier(a,b,c,d)` | 返回 `curve(u) -> [x,y]`；点为 `[x,y]` |
| `createPath(pointsOrCurve, {samples=128, closed=false})` | 编译折线或参数曲线，缓存长度表；重复点会合并 |
| `path.length` / `path.points` | 近似总长度；只读采样点 |
| `path.sample(u)` | 按距离采样，返回位置、切线和法线；开放路径钳制到 0..1，闭合路径循环 |
| `path.at(distance)` | 以像素距离采样，与 `sample(distance / length)` 等价 |
| `p.strokePath(path,width,c,a=1,from=0,to=1)` | 变宽描边；宽度可为 `width(u)`，颜色和透明度可为 `(u,v)`，v 为中心到边缘的比例 |

闭合路径补上首尾连接；`sample(1)` 与 `sample(0)` 一致。单点或零长度路径的切线固定为 `[1,0]`。
`strokePath` 的 from/to 钳制在 0..1，跨闭合接缝的拖尾应拆成 `[from,1]` 与 `[0,to]` 两次绘制。
颜色描边沿用 Bayer 抖动透明度，光照继续通过 `light/glow/glowLine` 写入独立缓冲。
曲线长度为采样近似，急弯可提高 samples；描边成本随路径长度和宽度增加。

## 距离场：组合轮廓、侵蚀与边缘

一个距离场是 `shape(x,y) -> distance`：内部为负、边界为零、外部为正。它描述几何，绘制时再赋予颜色。

```js
import { SDF } from "pixelfx";

const ring = SDF.subtract(SDF.circle(0, -30, 20), SDF.circle(0, -30, 15));
const broken = SDF.subtract(ring, SDF.box(0, -30, 2, 25));
// bounds 必须覆盖形状、扩张或描边后的范围。
p.sdf(broken, [-24, -54, 24, -6], color);
p.sdf(SDF.shell(broken, 1), [-25, -55, 25, -5], hotColor);
```

| 接口 | 约定 |
|---|---|
| `SDF.circle(cx,cy,r)` | 圆 |
| `SDF.box(cx,cy,rx,ry)` | 中心点与半宽、半高 |
| `SDF.capsule(x0,y0,x1,y1,r)` | 线段与半径；退化线段为圆 |
| `SDF.union(...shapes)` / `intersect(...shapes)` / `subtract(a,b)` | 并、交、差 |
| `SDF.expand(shape,amount)` | 正值扩张，负值侵蚀 |
| `SDF.shell(shape,width)` | 以零边界为中心、总厚度为 width 的轮廓带 |
| `SDF.translate(shape,dx,dy)` / `rotate(shape,angle)` / `scale(shape,k)` | 平移、围绕原点旋转、均匀缩放；k 必须大于零 |
| `SDF.fromMask({w,h,data},x=0,y=0)` | 将已有二值遮罩烘焙为距离场；x,y 为遮罩左上角 |
| `SDF.toMask(shape,w,h,x=0,y=0)` | 生成可用于 `p.mask` 和 `p.outline` 的二值遮罩 |
| `p.sdf(shape,[x0,y0,x1,y1],c,a=1)` | 填充距离 ≤ 0 的像素；c/a 可为 `(distance,x,y)` |

已有角色轮廓可直接复用：

```js
const silhouette = SDF.fromMask(actor.mask, actor.x, actor.y); // 初始化时烘焙一次
// amount 随时间变化即可让冰霜向外生长。
p.sdf(SDF.expand(silhouette, amount), bounds, frostColor);
```

解析圆、矩形、胶囊的距离为像素距离；布尔组合保持内外关系，但交界附近距离是近似值。
`fromMask` 使用 O(w×h) 欧氏距离变换，距离按“到相反状态像素中心的距离减去半像素”近似边界，
采样采用最近像素格，不提供连续插值。遮罩外有一圈透明边，完整实心遮罩也能得到有限的内部距离；
空遮罩返回正无穷。超出缓存网格时使用边缘距离延伸。掩码修改后需重新烘焙。
这些距离适合像素描边与生长效果，不应作为精确物理碰撞距离。

## 空间场：用同一种接口组合粒子受力

场为 `field(x,y,t) -> [ax,ay]`，返回本地坐标下的加速度，单位为像素/秒²。场函数没有内部时钟或可变随机数状态。

```js
import { Particles, combineFields, windField, attractionField, vortexField, turbulenceField } from "pixelfx";

const field = combineFields(
  windField(8, -5),
  attractionField(0, -30, 90, 100),
  vortexField(0, -30, 60, 100),
  turbulenceField({ strength: 12, scale: 24, speed: 0.4, seed: 7 }),
);
const particles = new Particles({ seed: 7, field });
// spawn / update / draw 沿用现有接口。field 在每个活跃粒子的材质运动规则前添加加速度。
```

| 接口 | 约定 |
|---|---|
| `windField(ax,ay)` | 恒定加速度 |
| `attractionField(cx,cy,strength,radius=Infinity)` | 正值吸引、负值排斥；有限半径内线性衰减，边界外为零，中心为零 |
| `vortexField(cx,cy,strength,radius=Infinity)` | 切向力，正值在 y 向下坐标中顺时针；衰减方式同吸引场 |
| `turbulenceField({strength=30,scale=24,speed=0.4,seed=1})` | 可复现的平滑扰动；scale 为噪声格像素尺寸，speed 为每秒移动的噪声格数 |
| `combineFields(...fields)` | 加速度相加 |
| `scaleField(field,weight)` | 乘常量或 `weight(x,y,t)`，可用于区域和时间权重 |
| `stepField(particle,field,dt,t=0)` | 原地更新 `{x,y,vx,vy}`，t 为步进起点的绝对时间 |
| `fieldTrajectory(initial,field,duration,{hz=120,startTime=0})` | 复制初始状态并烘焙轨迹，返回 `curve(u) -> [x,y]`，u 是时间比例 |

`src/core/sim.js` 的材质粒子和 `src/core/particles.js` 的简单粒子均接受可选的 `{field}` 构造参数。
未传入时沿用原先行为；碎片 `Bits` 暂无场参数，可自行用 `stepField` 驱动独立状态。
场在粒子系统的本地坐标采样，若力源来自世界坐标，调用方应先转换到本地坐标。

## 随机访问、循环与导出

受力轨迹需要积分。实时粒子应使用细步长更新，`createFx` 仍负责将每次 update 分成不大于 1/120 秒的小步。
积分采用半隐式 Euler，不同时间分步可能产生细微差异。需要任意跳帧、纯函数循环或离线导出时，先烘焙：

```js
import { fieldTrajectory, createPath } from "pixelfx";

const trajectory = fieldTrajectory({ x: -40, y: -30, vx: 0, vy: -10 }, field, 1.5);
const position = trajectory(age / 1.5); // 按时间采样，保留加速、减速
const path = createPath(trajectory);   // 按距离重新参数化，可用于匀速运动和描边
```

一次烘焙后可以倒序或跳跃采样，结果不依赖绘制顺序。对时变场使用 startTime 固定绝对起始时间。
循环时可用 `cycle` 重复相同的烘焙轨迹，并让每个粒子在出生与消亡处淡入淡出；
场本身不会自动把一段运动变成首尾相接的闭合轨迹。

上层可独立替换曲线、轮廓或力场：例如保持同一条路径，将符文替换为角色遮罩，
再将吸引场改为排斥场，就能把汇聚效果改为从角色表面向外释放的效果。
