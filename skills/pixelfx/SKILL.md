---
name: pixelfx
description: Generate and edit pixel VFX, maps, minions, bosses and encounters with pixelfx JavaScript/Painter, and extend reusable low-level drawing primitives when a task needs them; match the library's pixel, palette, lighting and motion language, register effects, run render/check, export PNG/JSON, and verify in gallery/index.html or gallery/fantasy.html. Use for new pixel assets, magic/hit/particle effects, fantasy maps and enemies, boss phases and fight choreography, sprite sheets, palette recolors, Painter/core extensions and Cocos Creator export—not for generic illustration or photos.
license: MIT
metadata:
  runtime: Node 18 or newer; npm for the static build; ffmpeg optional for GIF/MP4 previews.
---

# pixelfx

Pixel art effects as code. Each effect is one file, `src/fx/<category>/<name>.js`, that draws into two buffers:
**color** (pixels: opaque, dithered or truly translucent) and **light** (additive glow). No images, so an effect
can be played live, recolored, mirrored, reseeded and rendered to a sprite sheet for any engine.

The method is Hugo Duprez's ([How to make (good) pixel art effects with
Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude)): code is clay, trust
your eyes, feed your references. One-shot prompts make mediocre effects. Drafts you render, look at and refine
make good ones.

## Style profile distilled from the library

Use this as the default art direction when inventing a new effect. It is a compact summary of the existing
corpus, not a replacement for the runtime contract in `docs/AUTHORING.md`.

- **Pixel language:** draw at native resolution with intentional 1 px steps, hard ramps and stair-stepped
  diagonals. Use a readable silhouette and a single focal point; remove isolated noise inside forms.
- **Palette:** start with a dark cool base, move through 4–6 saturated mid steps, and reserve the final step for
  a small white-hot core. Effects may recolor through `fit(o.palette, n)`, but preserve value order. Keep color in
  `color` and soft additive energy in `light`.
- **Lighting:** every important event has a tight hot source, a colored halo and a wider low-strength pool. Put
  glints and light along paths, then let the source fall off quickly so the frame does not wash out.
- **Motion:** choreograph anticipation/charge, a one- or two-frame hero release, spread or recoil, then a slower
  decay. Vary particle speed, size, delay and lifetime; use gravity, drag, bounce and stretched sparks to make
  motion feel physical.
- **Depth:** split rings, beams and crowds into far and near halves with `drawBack`/`draw`. Ground motifs use
  compressed ellipses, dimmer rear rows and a brighter foreground rim. Keep the anchor meaningful (feet, impact,
  muzzle or spell target).
- **Material cues:** use translucent `SMOKE`, `VAPOUR` and `DUST` for volumes; stepped ramps for solid pixels;
  crackles, forks and cooling traces for electricity; scorch, debris and small aftersparks for impacts.
- **Natural scenery:** establish rock masses, branch thickness and irregular silhouettes before adding ambience.
  For maps, read the natural-form guidance in [references/fantasy-game.md](references/fantasy-game.md#natural-forms).
  Judge rocks and trees with glow and particles disabled; technical checks do not establish material readability.
- **Timing and finish:** one-shots must be empty at `t = duration`; loops must match at the seam. Fast attacks and
  white flashes sell force, while follow-through, embers, motes or smoke sell persistence. Keep frames within the
  declared canvas and use seeded randomness only.

For a reusable generation brief, state: **subject + anchor, phase choreography, focal light, palette ramp, depth
split, secondary motion, and fade/loop behavior**. Example: “A violet-blue storm sigil at a target's feet; the
ring writes in, a white core gathers overhead, a forked bolt lands for two hero frames, arcs crawl outward, then
scorch and sparks cool away; ground ellipse behind/in front, deterministic seed.”

## Before anything

1. Work in the user's pixelfx checkout and read its `AGENTS.md`. Use the workspace path or any path the user
   provides. All project-relative paths below refer to that checkout, not the installed skill directory. Keep effect
   definitions in `src/fx/`; Cocos is an export/playback adapter. Core tools use Node; run `npm ci` if build
   dependencies are missing. Create a new checkout only when the user needs a separate one.
2. Check it runs: `node tools/render.mjs fire/torch` writes `records/fire/torch/contact.png`. Open that PNG with
   your image-reading tool. That contact sheet is how you see every effect from now on.

## Generate assets and preview in the gallery

When the task adds assets to the library, needs browser preview, or Cocos export, read
[references/generate-and-preview.md](references/generate-and-preview.md). After source, registry, export and browser
verification, deliver a gallery link to the new asset—not only ad-hoc preview files.

Example request: “Use $pixelfx to make an ice-fire explosion, add it to the library, and open it in the gallery.”

New assets are tagged `new` automatically: `src/fx/provenance.js` lists the original 244; any other ID is `new`. The gallery
exposes `original` / `new` source filters through `gallery/?source=new`. Do not edit every effect's `meta.tags` for provenance.

## Fantasy game kit: maps, minions, bosses and encounters

The library also carries the pieces a fantasy game needs around its effects. They are ordinary effect modules with a
`meta.kind` and one extra exported object, so render, check, sprite sheets, the gallery and Cocos export all keep
working. Use the smallest piece that answers the request:

| the request | the piece | starter command |
|---|---|---|
| a place to fight in | **map** (`world/`) | `node tools/new.mjs world/<name> --map` |
| a small enemy that idles | **mob** (`mobs/`) | `node tools/new.mjs mobs/<name> --mob` |
| a small enemy's attack | **mob attack** (`mobs/`) | `node tools/new.mjs mobs/<name> --mob-attack` |
| a big enemy with phases | **boss** (`boss/`) | `node tools/new.mjs boss/<name> --boss` |
| a telegraphed boss move | **boss attack** (`boss/`) | `node tools/new.mjs boss/<name> --boss-attack` |
| a whole fight on a timeline | **encounter** (`src/encounters/`) | `node tools/new.mjs <name> --encounter` |

Read [references/fantasy-game.md](references/fantasy-game.md) for the full workflow, data shapes and command
sequences. The short version:

1. **Map.** A 320 x 180 loop at `origin: [0, 0]` with `kind: "map"` and a `map` export:
   `{ groundY, bounds, walk, platforms, spawns: { hero, mobs, boss }, arena }`. Bake the static sky, distance,
   masonry, floor and foreground once with `bake()`/`blit()` from `src/fx/world/_lib.js`; animate only mist, motes,
   fireflies, leaves and embers. Leave a low-contrast combat strip at `groundY`; keep detail at the edges.
   Validate with `node tools/check.mjs world/<name>` and `node tools/map.mjs world/<name>`; look at
   `records/world/<name>/layout.png` and `gameplay.png`.
2. **Mob.** A loop at `origin` near the feet, `kind: "mob"` and a `mob` export with `hp`, `radius`, `height`, `speed`,
   `xp`, `loot` and `attacks: [{ fx, range, windup, cooldown, damage }]`. Draw with `Grid` (from
   `src/fx/mobs/_lib.js`), outline once, shadow with `drawBack`. The idle must read at 1x; the tell belongs in the
   attack effect, not the idle.
3. **Mob attack.** A one-shot `kind: "mob-attack"` file exporting `attack = { telegraph, hits: [{ t, amp, shake,
   damage, range, target }] }`. Put the hit on the same frame as the contact flash and the hit star. Keep it small
   and grounded to the mob's hand or mouth.
4. **Boss.** A 96-140 px wide loop, `kind: "boss"`, with `boss = { hp, radius, height, phases, attacks, loot }`.
   Silhouette first: antlers, crown, staff, cloak, a glowing core. `phases` lose health in order; a
   a phase-transition attack changes light, ground and mood. Boss attacks are full-screen one-shots
   (`320 x 180`, `origin: [160, 150]`, `kind: "boss-attack"`) with a **0.8-1.6 s telegraph**, a 1-2 frame white
   hero frame, then 2-5 s of debris and dust. The telegraph must be visible in a contact-sheet sample.
5. **Encounter.** `src/encounters/<name>.js` exports `meta` and `encounter = { map, hero, boss, mobs, phases,
   timeline }`. Every timeline cue is data: `attack`, `phase`, `text`, `shake`, `hit`, `defeat`, `summon`. Attack
   cues automatically trigger the shake and hero flash from `attack.hits`, and defeat hides a unit. Render and check
   with `node tools/encounter.mjs <name> --mp4`, then open
   `http://localhost:8080/gallery/fantasy.html?enc=<name>`.

Rules that keep the kit coherent:

- **Maps stay engine-independent.** The map draws only through `Painter`; units and the hero are placed by the
  encounter runtime (`createEncounter` in `src/core/encounter.js`). Never put game logic in a map's draw.
- **Mobs and bosses know their own numbers.** Attacks are separate modules; the unit exports module references so a
  real game can read `mob.attacks` / `boss.phases` directly.
- **One screen, one read.** A map is 320 x 180; a boss attack is 320 x 180; a minion attack is around 112 x 72. A
  mob does not get a screen-sized effect, and a boss attack does not get a tiny one.
- **Telegraph before damage.** Boss attacks show the floor mark first; monster attacks show a glint or swell first.
  A hit that lands before the tell has played is a bug, not difficulty.
- **Phases change the picture.** A phase banner alone is not a phase change: combine a transition attack, a palette or light
  shift, screen shake and a change in the attack pattern.
- **Kill cleanly.** Give each mob an `until` time and play a death effect (`spawn/poof`, `spawn/soul-rise`,
  `spawn/shatter-death`) on the same beat; do not let a dead unit keep idling.
- **End the encounter.** Hide the boss, play its death or a victory burst, and hold the empty arena for a beat.
  Trim `meta.duration` to the last cue; an empty tail reads as a broken demo.

The templates are intentionally working, not finished art: they pass `check`, render, and have the right exports.
Replace their shapes, palettes and timeline with the specific design; then run `node tools/index.mjs` and
`npm run check`.

## 1. Look for an existing effect first

`node tools/list.mjs <words>` searches ids, names, tags and descriptions (`node tools/list.mjs frost`,
`node tools/list.mjs slash loop`). `docs/CATALOG.md` lists everything by category. Render the candidates and
look at them before choosing. Most requests are an existing effect with different options:

- `palette`: the main ramp, dark to bright, as hex strings. Any `PAL` ramp in `src/core/color.js` (fire ember
  lava smoke dust ice water electric volt poison holy heal arcane shadow blood earth stone gold leaf wood metal
  bone neon cyber matrix candy night) or your own. A blue fire is `{"palette": PAL.ice}`.
- `seed` for a different but equivalent take; `flip` to face left; `angle` to rotate; `light` (0..1+) for glow
  strength; plus each effect's own knobs in its `meta.options` (size, count, radius, text, height...).
- Try options without editing code: `node tools/render.mjs fire/torch --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}'`.

## 2. Put it in the game

**Canvas or WebGL games in JS or TS** (plain canvas, Phaser, PixiJS, Kaplay, three.js): use the code directly. It
has no dependencies; copy `src/core` and the effect files you need, or depend on the repo.

```js
import { createFrame, clearFrame, createFx, composite } from "pixelfx";   // src/core/index.js
import * as frostNova from "pixelfx/fx/ice/frost-nova";                   // src/fx/ice/frost-nova.js

const frame = createFrame(320, 180);            // the game's pixel resolution; ox, oy scroll it with the camera
const img = new ImageData(320, 180);
const fx = createFx(frostNova, { x: hero.x, y: hero.y, flip: hero.facing < 0 });

// every tick
fx.update(dt);
clearFrame(frame);
fx.draw(frame, "back");    // what goes behind characters
drawCharacters();          // your own sprites, or draw them into frame.color yourself
fx.draw(frame, "front");
composite(frame, img.data, background);   // color over the background plus light; or null for transparent
ctx.putImageData(img, 0, 0);              // then scale the canvas up with image-rendering: pixelated
if (fx.done()) removeIt();               // one-shots end on their own; fx.stop() fades a loop out
```

Several effects can share one frame. In a WebGL engine, upload the composited RGBA to a texture each frame, or
render the effect to a sprite sheet once (below) and play it like any other animation.

**Any engine** (Godot, Unity, GameMaker, Defold, LÖVE, Bevy, Construct): export sprite sheets.
`node tools/render.mjs ice/frost-nova --sheet` writes `records/ice/frost-nova/frost-nova.png` (transparent
frames in a grid) and `frost-nova.json` (Aseprite-style frames, so Phaser's atlas loader, Godot and Unity Aseprite
importers and most tools read it; `meta.pixelfx` has fps, loop, frame size, columns and the pivot). Set the
pivot to `meta.pixelfx.pivot` (the effect's origin, e.g. the feet), import with nearest-neighbour filtering and no
compression, and play at `meta.pixelfx.fps`. Glow is baked into the sheet as color with alpha, which reads as
additive over dark scenes; for bright scenes, render a recolored version or keep the effect on a dark layer.

For the full library: `node tools/render.mjs <category> --sheet` does a whole category.

**A hit needs a body behind it.** An effect alone looks like a sticker. Effects with a character carry an `act`: when the body winds
up, when to freeze, how the target reacts. Use it whichever way the game is built:

- With the stock character: `createAct(slash, { x, y })` instead of `createFx`. `act.update(dt)`, `act.draw(frame)`, and throw the
  picture by `act.shake`. It holds still by itself during a freeze. `node tools/act.mjs <id> --sheet` bakes the lot into a sprite sheet.
- With the game's own character: read the timing, `slash.act` or `meta.pixelfx.act` in a sheet's JSON (`windup`, `recovery`, `hits`
  with `t` and `freeze`). Play the character's attack animation `windup` seconds before the effect, and at each hit stop updating
  everything, effect and characters both, for `freeze` seconds. Host-side hit-stop works on any effect, with or without an act.

`src/fx/moves/` has whole attacks chained from the effects, wind-up to recovery: start there when someone asks for a move, not an effect.

## 3. Make a new one

Read `docs/AUTHORING.md` first: it is the contract (meta, `draw(p, t, o)` for pure effects or `create(o)` for
simulated ones, local coordinates, seamless loops, ending empty), the toolkit, the painter API and the quality bar.
Then:

1. **Say it in one line** with art direction: what it is, how it moves, its palette, its timing. "A frost nova:
   crystals erupt in a ring from the feet outward, a white flash at the center, shards spin off, the floor stays
   frosted and fades."
2. **Find references** in the library: `node tools/list.mjs <words>`, then read the two or three closest effect
   files and borrow their techniques (`Particles` and `Bits` in `src/core/sim.js` for sparks, smoke and debris,
   `p.disc` for translucent volumes, `cycle` for seamless particles, `tileFbm` scrolls for flames and water). Look at
   the closest of [Hugo Duprez's effects](https://www.spritefusion.com/pixel-art-vfx) too: they are the quality bar.
   If his has more detail, light or life at the same size on screen, yours isn't done.
3. **Draft.** `node tools/new.mjs <category>/<name>` (add `--loop` for a loop) gives a working file. When the
   direction is open, write 3 to 5 genuinely different drafts (`<name>-a.js` .. `-e.js`), render them all
   (`node tools/render.mjs "<category>/<name>-*"`) and look at every contact sheet before choosing. Show the user
   the strongest two or three if they're around (`--gif` makes animations to share).
4. **Look, judge, fix.** Render, open `records/<id>/contact.png`, and judge like a picky pixel artist. Fix the
   worst thing, render again. Three rounds minimum; a showpiece takes more. `--all` shows every frame,
   `--mp4` shows motion at full speed.
5. **Act it out** if a character is involved: add `export const act` (see "Acts" in `docs/AUTHORING.md`), with a wind-up before t = 0,
   a pose change on the release frame, a freeze on contact and a recovery. `node tools/act.mjs <id>` shows consecutive 12 fps steps:
   judge motion from those and from `--mp4`, not from a contact sheet's samples.
6. **Check.** `node tools/check.mjs <id>` catches drawing outside the canvas, one-shots that don't end empty,
   loop seams, unseeded randomness and slow frames, and in an act: keys out of order, unknown pose fields and hands
   that teleport. Fix until it passes clean. Delete the drafts you didn't keep.

What to look for, and the usual fix:

| you see | fix |
|---|---|
| it reads as mush at 1x | fewer colors, a clear silhouette, one focal point, bigger shapes |
| speckle: lone noise pixels inside shapes | threshold noise less, quantize with `at()`, no noise on small shapes |
| floaty, no punch | fast in, slow out (`ease.outQuart`/`outExpo`), a 1 to 2 frame white hero frame, shorter total time |
| stiff or mechanical | vary every particle (size, speed, delay, life), add secondary motion (sparks, smoke, debris) |
| washed out | less glow (k 0.2 to 0.5), darker edge steps, keep white for the hottest core only |
| flat | light from one side: brighter top-left, darker bottom-right step; a darker ramp step at the base |
| smooth gradients, vector look | hard ramp steps in color; softness only in light and in translucent smoke |
| a checkerboard where smoke should be | `SMOKE`, `VAPOUR` or `DUST` particles, or `p.disc`: truly translucent, lit on top |
| seam when a loop wraps | `cycle`, `loopNoise(phase)`, whole-cell `tileNoise` scrolls, `sin(phase * TAU * n)` |
| a one-shot that pops off | let it shrink, dither out or fall away before t = duration |
| a great effect on a dead character | give it an act: wind-up, release pose, freeze on contact, a target that reacts, recovery |
| a map with a character floating above the floor | `map.groundY` and the spawns disagree; fix both and look at `layout.png` |
| a boss that reads as a big blob | fewer features, bigger antlers/crown/weapon, one hot core, a stronger silhouette |
| a boss attack nobody dodges | the telegraph is invisible or under 0.8 s; draw a thick floor seal and hold it |
| a minion attack that lands off the body | the effect's local hand/mouth offset does not match the unit; align the cue and the effect |
| the act feels weightless | a wind-up the opposite way to the blow, a longer freeze (up to 0.2 s), a bigger silhouette change, shake |
| the hit lands out of sync | move the hit key to the effect's own constant, not to a time you eyeballed |
| he holds the weapon badly | keep a bend in the elbow, shafts in front of the chest; on a swing the blade lags the hand; arms reach about 15 px and don't stretch, so step the body in |
| his arms cross or the pose looks flat | he faces three-quarters towards us: for open arms the near hand goes left (`fx < 0`), far hand right, with `turn: 1`; `yaw` really turns him |

Directional effects face right, ground effects stand on y = 0, actor effects wrap `o.actor` (a 24 x 38 stock
character's mask and pixels), and nothing uses `Math.random`. Generic motifs are fine; never recreate a specific game's
sprites, characters or logos.

## 4. Native code instead of JS

If the game can't run JS and a sprite sheet isn't enough (an effect that follows a moving target, or needs
per-instance colors at runtime), port the effect. Pure effects are a function of time; simulated ones step the particles in
`src/core/sim.js`. Keep the two-buffer idea, the 4x4 Bayer threshold for dithered alpha and the palette ramp lookups.
Render the JS original and your port side by side to check they match.

## Extend the bottom drawing layer

When a request mentions a new primitive, reusable geometry, clipping, gradients, masks, compositing, or a
Painter bug, read [references/painter-api.md](references/painter-api.md) before editing. Choose an existing
primitive first; put one-off shapes in the effect's `_lib.js`. Add a method to `src/core/painter.js` only when
it is reusable and needs the shared local transform, clipping, ordered alpha, color/light separation or a
tested fast path. Keep the method engine-independent and deterministic, add a behavior test in
`tests/core-extension.test.mjs`, and update `docs/CORE-EXTENSIONS.md` when the extension introduces a new
path, SDF or force-field capability. Preserve the two-buffer contract: hard pixel color uses Bayer dither,
soft volumes use true blending, and additive light never writes the color buffer. Run `npm test`, a targeted
`node tools/check.mjs <id>`, and a rendered sample before the full `npm run check` when a core change affects
multiple effects.
