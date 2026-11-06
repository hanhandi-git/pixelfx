---
name: naruto-vfx
description: "Draw Naruto-style ninjutsu and senjutsu pixel effects with pixelfx — chakra orbs, Chidori and Chidori rush, Kirin, phoenix flower, Amaterasu, fireballs, water dragons, water/earth walls, great breakthrough, shadow clones, sage orbs, wind shuriken and white flash. Use for new or refined 忍法/仙法 effects, hand-seal charge and release beats, acted characters, defensive walls, chakra palettes, lightning/water/fire/wind/earth/black-flame material, and for extending the ninjutsu/ and senjutsu/ categories."
license: MIT
metadata:
  runtime: "Node 18 or newer; use a pixelfx checkout with the ninjutsu/ and senjutsu/ sets."
---

# Naruto VFX

Original pixel-art chakra techniques for the `pixelfx` library. These are generic ninja/sage spells, not
recreations of a specific show's sprites, logos or characters: keep the pixel bodies, faces and effects your
own. The set lives in `src/fx/ninjutsu/` and `src/fx/senjutsu/` and shares one chakra language, so a new
technique should feel like another page of the same scroll.

Read this first, in order:

1. The checkout's `AGENTS.md` (worktree discipline, generated files, no `Math.random`).
2. `docs/AUTHORING.md` (the runtime contract and Painter API).
3. `skills/pixelfx/SKILL.md` (the general effect workflow and quality bar).
4. `docs/NINJUTSU.md` (the current eighteen techniques, beats and palette links).
5. `src/fx/ninjutsu/_lib.js` and `src/fx/lightning/_lib.js` (the shared shapes and current helpers).

## The set

| Effect | ID | Canvas | Beat | Ramp |
|---|---|---|---|---|
| Spiral orb 螺旋丸 | `ninjutsu/spiral-orb` | 116×84 | loop, palm sphere, 1.4 s | CHAKRA |
| Chidori 千鸟 | `ninjutsu/lightning-blade` | 190×146 | charge 0.78 s, thrust, hit 0.82 s, 2.8 s | VOLT |
| Chidori rush 千鸟突进 | `ninjutsu/chidori-rush` | 420×160 | dash 0.58→1.04 s, hit 1.04 s, 2.7 s | VOLT |
| Kirin 麒麟 | `ninjutsu/kirin` | 420×300 | storm, leader, bolt hit 1.0 s, 3.2 s | VOLT + PLASMA |
| Great fireball 豪火球 | `ninjutsu/great-fireball` | 348×206 | inhale, fly, burst, 4.3 s | `PAL.fire` |
| Phoenix flower 凤仙火 | `ninjutsu/phoenix-flower` | 380×180 | fan of six, hit 0.86 s, 2.6 s | `PAL.fire` |
| Amaterasu 天照 | `ninjutsu/amaterasu` | 230×170 | eye, ignition 0.56 s, burn, 3.4 s | AMATERASU |
| Water dragon 水龙弹 | `ninjutsu/water-dragon` | 320×200 | seal, rise, lunge, hit 1.56 s, 3.9 s | WATER |
| Water wall 水阵壁 | `ninjutsu/water-wall` | 260×170 | seal, rise, hold, fall, 2.6 s | WATER |
| Great breakthrough 大突破 | `ninjutsu/great-breakthrough` | 380×180 | inhale, wind cone, hit 0.82 s, 2.4 s | WIND + JADE |
| Earth wall 土流壁 | `ninjutsu/earth-wall` | 270×170 | seal, slam, rise, hold, fall, 2.8 s | stone + earth |
| Shadow clones 影分身 | `ninjutsu/shadow-clone` | 224×120 | smoke, two copies, dissolve, 2.7 s | CHAKRA |
| Sage orb 超大玉螺旋丸 | `senjutsu/sage-orb` | 382×238 | gather, giant orb, slam, 4.4 s | SAGE + JADE |
| Wind shuriken 螺旋手里剑 | `senjutsu/wind-shuriken` | 340×192 | form, throw, grind, side burst, 3.5 s | WIND + JADE |
| White flash 白激之术 | `senjutsu/white-flash` | 300×232 | gather, white dome, ground rings, 3.0 s | SAGE + JADE |
| Goemon 五右卫门 | `senjutsu/goemon` | 440×220 | oil/wind/fire braid, hit 1.42 s, 3.8 s | OIL + WIND + `PAL.fire` |
| Gate of the Great God 明神门 | `senjutsu/gate-of-the-great-god` | 440×300 | light pillar, three torii, main hit 1.54 s, 3.4 s | VERMILION + SAGE |
| Thousand wood dragons 千木龙 | `senjutsu/true-thousand-hands` | 480×300 | roots, three dragons, hits 2.12/2.27/2.4 s, 4.2 s | WOOD + JADE + SAGE |

## Palette law

Use `fit(o.palette, n)` for every ramp; never pass a hex string as a color. Keep value order dark → mid →
white-hot. A four-step override must still fill every index.

- **CHAKRA** `#0a1029 #14245e #1f449c #2a6ed0 #49a8f2 #8fddff #d6f6ff #ffffff` — ninjutsu blue.
- **VOLT** `#120a33 #2a1b78 #4630c0 #5a62f0 #58a6ff #9ed8ff #e4f6ff #ffffff` — lightning violet-blue.
- **WATER** `#05142c #0a2a52 #0f4478 #1a6aa0 #2f9acc #6cc8ea #b4ecff #ffffff` — water.
- **SAGE** `#1a0d05 #43200a #7d3c0e #c07014 #f0a824 #ffd45c #fff0a8 #ffffff` — sage amber.
- **JADE** `#06180f #0d3a22 #146038 #1f8a4a #3ab866 #7fe08c #c8ffc4 #ffffff` — natural energy.
- **WIND** `#041a1e #0a3440 #0f5466 #1a7e8e #3cb8bc #8ce8e0 #d8fff8 #ffffff` — wind blades.
- **STONE** `#0e0e12 #1c1c24 #2c2c38 #42424f #5c5c6b #7d7d8c #a4a4b2 #d0d0da` — rock (add `PAL.earth` for dirt).
- **AMATERASU** `#020106 #070208 #0d030c #160510 #260812 #4a0d18 #a82622 #ff9a52` — black flame: a void core, a crimson seam, an orange edge; white is only the ignition.
- **OIL** `#0b0703 #1a0f05 #2e1b08 #4a2c0c #6b4212 #8f5d1a #bc8428 #efc25a` — heavy amber oil; the top rail is the gloss, the belly is near-black.
- **WOOD** `#080604 #140d08 #24170d #3a2412 #54351a #714a24 #956a36 #bf9254` — old wood and bark; pair with JADE moss and SAGE sap.
- **VERMILION** `#100506 #25090a #48100e #6d1a13 #96281a #c23c22 #e86838 #ffb06a` — torii red.
- Fire uses `PAL.fire` from `src/core/color.js`, or a hotter custom ramp; reserve white for the core.

Ninjutsu is cool blue/cyan with a white heart; senjutsu is amber/gold with jade sparks. Do not mix the two
moods inside one technique unless the story is “sage energy enters a ninjutsu” (then use SAGE as the main
and JADE as the secondary, like `sage-orb` and `white-flash`).

## The five-beat grammar

Every one-shot is a small play, not a sticker:

1. **Seal / charge (0–0.5 s, sometimes 0.8 s).** A crouch, a hand sign, a seal ring on the floor, motes
   pulled in, a palm orb swelling, dust lifting. This is the readable anticipation and the effect's title.
2. **Release (1–2 frames).** A snap: white flash, a ring, a speed line, the body's `x` steps in, a `ghost`
   after-image. Keep it hard; no slow fade here.
3. **Travel / dash / beam (0.2–1.2 s).** A bolt, a growing fireball, a water serpent, a spinning blade, or
   a body crossing the floor. Add secondary motion: sparks, spray, dust, speed lines, trailing arcs.
4. **Impact (1–2 hero frames).** White core + radial forks/rays + ground ring + debris + a shake and a
   freeze. This is the loudest frame; do not crowd it with the charge.
5. **Aftermath (1–2 s).** Cooling scorch, smoke, embers, rain, puddles, arcs crawling out, the body's
   recovery. One-shots must draw nothing at `t = duration`; loops must match at the seam.

A **defensive wall** is the exception to the travel/impact shape: seal → the wall rises → hold → collapse.
There is no target and no hit; the wall itself is the subject. Put the pool/cracks/seal in `drawBack` and the
sheet/slabs in `draw`, and give the act `hits: []`.

`meta.duration` is the last visible beat plus a short tail; trim empty tails. `meta.fps` is usually 30; a
one-shot's `duration * fps + 1` frames must include the empty end.

## Act rules

A technique with a caster uses `meta.actor: 2`, a `draw`/`drawBack`, and an `act`:

```js
const DASH = 246, GO = 0.58, HIT = 1.04;
const CHARGE = { ...READY, x: 0, crouch: 8, lean: -3, turn: 1, fx: 10, fy: -14, bx: -6, by: -20, armsFront: true };
const DASH_POSE = { ...READY, x: 0, crouch: 3, lean: 12, turn: 1, fx: 10, fy: -21, bx: -7, by: -16, ffx: 8, fbx: -5, toeB: true };
const HIT_POSE = { ...DASH_POSE, x: DASH, crouch: 5, lean: 8, fx: 10, fy: -22, bx: -3, by: -16, ffx: 8, fbx: -2, toeB: true };
export const act = {
  ghost: "#9fefff",                         // additive after-image colour
  target: { x: 292 },                       // straw dummy the hit lands on
  poses: [
    [-0.5, READY],
    [0.08, CHARGE],
    [0.54, { ...CHARGE, crouch: 6, lean: 4, ghost: 1 }],
    [0.58, { ...DASH_POSE, x: 0, ghost: 1 }, "snap"],
    // ... dash keys, all on the same bodyX line ...
    [HIT, { ...HIT_POSE, ghost: 1 }, "snap"],
    [2.5, { ...HIT_POSE, crouch: 4, lean: 2 }],
  ],
  hits: [{ t: 1.04, stop: 0.14, shake: 0.5, amp: 3, target: true }],
  dust: [{ t: 0.58, x: 0, n: 10, dir: -1, c: "#9fdcff" }],
};
```

- **Hand reach.** A hand only reaches ~15 px; if the pose wants more, step the body in with `x` instead of
  stretching `fx`/`bx`. `node tools/check.mjs` warns when a hand falls more than 3.5 px short.
- **Exact path.** For a dash, make the act's `x` and the effect's hand share one `bodyX(t)` (linear is fine):
  `const bodyX = (t) => DASH * clamp((t - GO) / (HIT - GO), 0, 1)`. Then ghosts, palm and hit point align.
- **After-images.** `ghost: 1` on the moving poses makes `createAct` push the *posed* silhouette into the
  additive light buffer. Use it for speed. Cap the trail naturally (the core keeps the last seven).
- **Shadow clones are not speed ghosts.** When the request says “same body, semi-transparent”, use
  `drawActor(p, o.actor, 0.62)` at the clone position with a transform save/restore; do not tint them blue,
  add rims or white eyes.
- **Gallery / contact.** The gallery uses `createAct` and animates the body; `tools/render.mjs` contact
  sheets are made with `createFx` and a static stand-in, so an acted dash's contact can look detached. Judge
  those with `node tools/act.mjs <id> --mp4` or the gallery.
- **No target.** A wall or a self-buff has `hits: []` and no `target`; do not invent a dummy just because
  other effects have one. The seal and the wall carry the read.

## Technique recipes

### Orb (spiral-orb, sage-orb)
`chakraOrb(p, C, x, y, r, ph, { arms, turns, tilt, k, hot })` draws the ball, spiral arms, shell ring,
heart and glow. Add `inwardStreaks` for the pull, `orbitingMotes` for life, `floorLight`/`floorSeal` for the
ground. A one-shot orb uses a local charge/drop phase, not the loop phase. Sage orb adds JADE `natural`
streaks and a ground slam with a white dome and green rising light.

### Chidori (lightning-blade)
`palmOrb` = dark shell, hot body, white heart, five `zigzag`+`crackle` forks, `p.glow`. The move:
cocked palm (0–0.78 s) → one short, thick `stroke` of `zigzag` to the target (0.78–0.82 s) → white core,
seven radial `crackle` forks, two floor `band`s, sparks via `burst`+`fly`, debris and a cooling scorch.
Keep the lance short: this is a thrust, not a spear.

### Chidori rush (chidori-rush)
The dash is the whole point: hand at `bodyX(t) + 10`, y −21. At `GO = 0.58` step to `x = 0`; at `HIT = 1.04`
reach `x = 246`; target at `292`, y −30. Draw two `bowed` ribbons behind the palm (one `crackle`), 7 speed
lines, foot dust, a short leading lance, then a 36 px lance to the target at 0.98–1.04. The act carries seven
posed ghosts; the effect owns the current. Impact: white core, nine forks, three capped ground rings,
34 sparks, 18 debris, 12 dust puffs, a skid and a cooling floor line. Canvas 420×160; keep sparks ≤ x 344.

### Kirin (kirin)
Storm cloud stack at the top (20 dark `p.disc`, a lighter underside, a few short cloud arcs), a cold target
seal, then a stepped leader (thin, dim) and a main bolt. Build the trunk with `zigzag(..., forks: 0)` and add
the seven branches explicitly: `zigzag`'s random forks can reach far outside the canvas, and a controlled
branch reads better. `stroke` with `s 2.5` and `{ hero: true, light: 0.62, core: 2.0 }`; `crackle`; white
core, flat `band` rings, Lichtenberg cracks in `drawBack`, rain and a cooling channel. 420×300 is tall: keep
the cloud top inside the canvas and cut the glow radius rather than the cloud.

### Phoenix flower (phoenix-flower)
Six analytic orbs, not particles: each has a start at the mouth, a fanned target, an arrival time and a bow.
`q = smooth(RELEASE + i*0.01, arrive, t)`; x is linear, y gets `-sin(pi*q) * arc`; radius 4.8–6; draw a
`fbm` fire ball, two dim trail copies, then a small impact. Align the middle orb's `tx` and `arrive` with
the act's `target.x` and `hits[].t` exactly (220 / 0.86); the other five can hit the floor. Scorch each
landing in `drawBack`.

### Amaterasu (amaterasu)
A **smoke-first black flame**, not a recolored fireball. Build it from the `fire/_lib` vocabulary: reverse
the dark-to-bright `AMATERASU` ramp into a hot-first `H`, use `smokePuff` for the body (two thirds black
`C[1]`, one third plain grey, `big: true`), `flameTongue` for the licks, and `firePuff` only for a few hot
edge shards. The tongue layers must be black in the middle and red on the outside:
`[[1,1,1],[0.9,0.94,2],[0.72,0.82,7],[0.48,0.6,7],[0.22,0.34,7]]` — a thin red rim round a wide void heart.
A small black underlay, a red `p.glow`, and no white except the 0.56 s ignition keep the silhouette readable.
Smoke starts before the flame and lingers after it; if the middle fills with orange it is no longer Amaterasu.

### Water wall (water-wall)
A defensive sheet, built like `water/waterfall`, not a flat polygon. Walk every pixel of the face: a dark,
semi-transparent lane (`p.blend`) on the far side, a lit lane near the viewer, sliding white dashes in fall
time (`tileNoise`), a torn edge, and a broken white crest with `billow` foam and `bead` spray. Add the
pool's warped-sine caustics (`p.light`), a `lace` foam net, and flat `p.ellipse` ripples. Grow the height in,
hold, collapse; pool, seal and wet floor belong in `drawBack`. `p.ring` is a **screen circle**, not a ground
ellipse. No target; `hits: []`.

### Earth wall (earth-wall)
A rampart of **slab polygons**, not a single rect: 3×3 deterministic slabs with jittered vertices, a dark
outline fill, an inner face, a lit top facet and cracks. Each slab has a rise delay (bottom row first), a
hold, then a fall with a small drop and fade; clamp the drop so the polygon cannot fall below the canvas.
`PAL.stone` for rock, `PAL.earth` (fitted to 8) for dirt and dust; cracked ground, a flat seal and a dark
base in `drawBack`. No target.

### Great breakthrough (great-breakthrough)
Wind is invisible: draw 26 short bright streaks in a widening fan, three vertical pressure fronts, grit,
leaves (`p.poly` triangles in JADE), and low dust. Everything moves right; clamp the streak ends and the
sparks to the canvas. The target hit is a white core, a flat `band`, two `p.ellipse` rings and radial grit.
Inhale first; the mouth glow and the pulled motes sell the charge.

### Fireball (great-fireball)
Inhale embers and a mouth glow → a white flash and a tongue of fire → a ball that grows to radius 25 while
it flies → a burst with a ring, rocks, a scorch and leftover flames. Use `PAL.fire`; hot core white, outer
smoke dark. A long tail of embers sells the flight. For a **fan**, see Phoenix flower above.

### Water dragon (water-dragon)
Seal ring + spiral vortex + a rising column → a cubic spine sampled by arc length (`cubicBezier` +
`createPath`). Do not fill the tube with flat circles: after a dark rim and a mid-blue base, walk each
cross-section per pixel along the normal, shade the upper side with `noise2`, put sliding white `tileNoise`
dashes on the crown, and make the belly `p.blend` translucent. Add the foam crest, scale ticks, dorsal
spikes, tail fan, four fins, horns, mane, whiskers, teeth and jaw. Impact borrows `water/wave-crash`:
crown, spray, `billow` foam, `lace` on the broken surface, rain, puddle and ripples. True-translucent
`p.disc` for mist; dark blue mist turns into a blob.

### Shadow clones (shadow-clone)
Smoke burst → two copies slide out at −38 and +40 px → settle → dissolve at 2.15–2.6 s. The copies are the exact
`o.actor` sprite at alpha 0.62 (Bayer-dithered), with a 0.16-alpha smear, plus a soft foot glow. Chakra arcs
are the only blue addition; no recoloured silhouette.

### Sage orb (sage-orb) / white flash
SAGE amber + JADE green. Sage orb: natural energy converges from all sides, a giant amber orb forms overhead,
then slams: white dome, three gold ground rings + one jade ring, cracked ground and green flames. White
flash: hands gather, a white core and sixteen rays, a hemisphere of light, a flat ground ring, cracked ground
that turns gold, dust and gold embers. The white hero frame is two frames, not a slow glow.

### Wind shuriken (wind-shuriken)
Four compressed wind blades form in the palm, the throw drags a motion blur, then it opens into a grinding
sphere that whitens the ground, pulls debris and bursts into two side blades and a ring. WIND teal + JADE
sparks; keep the blade silhouette readable at 1×; the grind is a ring of fast dashes, not a solid disc.
### Goemon (goemon)
The three sage breaths are one braided stream, not three side-by-side effects. Sample a quadratic from the
mouth to the target; at each q draw a cross-section of heavy amber oil (dark belly, glossy top rail, a few
`N()` highlights), then four teal wind strokes just outside it, then `flameBlade`/`flameTongue` only along
the oil's upper edge after 0.82 s. The oil is the body; the wind is the drive; the fire is the edge. At
1.42 s break the wave into a burning pool: dark oil ellipses in `drawBack`, fire tongues on top, `smokePuff`
and a capped shock ellipse. Keep the wave's x reach inside the canvas; flame blades add width.

### Gate of the Great God (gate-of-the-great-god)
Open a narrow sage-light pillar (`p.rect`, not a huge polygon), then drop three vermilion torii gates. A gate
is two thick posts with black iron feet and caps, a curved kasagi with upturned ends, a straight nuki, a
small plaque with a jade gem, gold sage ticks and a rim of amber light. Put the two side gates in `drawBack`
and the main gate in `draw`; each lands with a flat `p.ellipse` shock, dust and cracks, and drives one act
hit. Let all three share `FALL` so their tops start at the canvas top rather than above it.

### Thousand wood dragons (true-thousand-hands)
A **three-dragon** sage wood technique, not a statue: three roots open at different x, and three cubic
spines grow out of the floor like currents. Give each dragon its own base, coil point, target point and
contact time (2.12 / 2.27 / 2.4 s); the far one goes in `drawBack`, the two front ones in `draw`. Sample
each spine by arc length, then walk the rounded cross-section per pixel: dark bark rim, mid wood, a lit
upper side, `noise2` bark, soft `JADE` moss patches, and one moving amber `tileNoise` sap channel. Keep the
body solid with a cheap `p.circle` base under the detail pass; without it the per-pixel dots read as
speckle, not a dragon. Heads are wood skulls with branch antlers, moss mane, amber eyes, bark teeth and
root-tendril whiskers. On the hit, the three heads bite together, bark shards and leaves fly, and six roots
close into a cage around the target; no water foam, no white spray.

## Code patterns

Pure one-shot skeleton:

```js
import { fit, clamp, smooth, ease, rng, WHITE, band, burst, fly, READY } from "../../core/index.js";
import { CHAKRA } from "./_lib.js";

const CHARGE = 0.5, HIT = 1.0, END = 2.4;
export const meta = {
  name: "Example art", desc: "One sentence, under 180 chars.",
  tags: ["chakra", "ninjutsu", "example", "one-shot"],
  size: [280, 150], origin: [64, 134], duration: END, loop: false, fps: 30,
  bg: "ground", actor: 2, options: { palette: CHAKRA, seed: 7 },
};
export function draw(p, t, o) {
  if (t >= END) return;
  const C = fit(o.palette, 8);
  // charge, release, travel, hit, aftermath
}
export function drawBack(p, t, o) {
  if (t >= END) return;
  // seal, scorch, ground line: things behind the body
}
```

Lightning:

```js
const b = zigzag(R, x0, y0, x1, y1, 0.2, 0.45, 1.2, 0); // jag, forks, width, depth
stroke(p, b, k, C, 1.5, { hero: t < HIT + 0.02, light: 0.45, core: 1.6 });
crackle(p, b, 0.75 * k, C, 0.15, 0.9);
```

Exact clone / after-image body:

```js
function cloneAt(p, actor, x, y, a) {
  const tx = p.tx, ty = p.ty, fx = p.fx, cs = p.cs, sn = p.sn;
  p.place(p.toX(x, y), p.toY(x, y), fx < 0, Math.atan2(sn, cs));
  drawActor(p, actor, a);
  p.tx = tx; p.ty = ty; p.fx = fx; p.cs = cs; p.sn = sn;
}
```

Rings and volumes: `band(p, x, y, r, sy, w, a, C, keep, hero)` for compressed ground rings;
`p.disc(x, y, r, C[3], a)` for true-translucent mist/water; `p.poly`/`p.tri` for fins, blades, shards.

## Quality checklist

- **1× read.** One focal event, a clear silhouette, a white-hot core only at the hit. No isolated noise.
- **Hard ramps.** Color is stepped in `color`; softness only in `light` and translucent `p.disc`.
- **Palette override.** A 4-step palette must still work: `fit(o.palette, n)`, no hex strings as colors.
- **Canvas.** Keep every pixel inside `meta.size`; ground rings are the usual spill; cap radii. Falling
  slabs, fly-away sparks and long random lightning forks are the other three. `p.ring` is a circle; use
  `p.ellipse` for anything lying on the floor.
- **One-shot ends empty.** `draw`/`drawBack` return nothing at `t = duration`; no lingering dot.
- **Loop seam.** `cycle`, `loopNoise`, `sin(phase*TAU*n)`; no state that jumps.
- **Act.** Hands reach, body `x` steps in, hits line up with the contact frame, freeze 0.12–0.14 s,
  shake 0.3–0.5; the target reacts when `target: true`.
- **Determinism.** Seeded `rng`/`new Rng`; never `Math.random`.
- **Performance.** Median under 4 ms/frame; the check warns above it.

## Verify and deliver

```bash
node tools/check.mjs ninjutsu/<name>
node tools/render.mjs ninjutsu/<name> --gif --mp4
node tools/act.mjs ninjutsu/<name> --mp4
node tools/index.mjs                 # registry + docs/CATALOG.md
npm run check
npm test
npm run build:web
```

Update `docs/NINJUTSU.md` (table row + beat) and, when adding to the set, the set montage. Open
`http://127.0.0.1:8080/gallery/index.html#<category>` and check the page actually loads and
the act reads. For a dash, use the act sheet, not the static contact.

Do not commit or deploy unrelated worktree changes (this repo often has another in-flight batch). Follow
the checkout's `AGENTS.md`; deployment is a separate, explicitly requested step.

## One-line brief

“<Technique> at <anchor>; <palette>; <charge beat> → <release> → <travel/dash> → <impact> → <aftermath>;
<act or no act>; <canvas>; deterministic seed.” For a wall: “seal → rise → hold → collapse; no target.”
