<p align="center">
  <img src="docs/readme/montage.gif" width="800" alt="A grid of pixel art effects playing at once: a campfire, a burning skull, a waterfall, a plasma ball, a portal, a tornado and more.">
</p>

**Languages / 语言:** [English](README.md) · [简体中文](README.zh-CN.md)

# pixelfx-extended.

An extended [**pixelfx**](https://github.com/patch-gg/pixelfx) fork with **<!-- new-count -->95<!-- /new-count -->** additional maps, minions and effects beyond the original 244-effect baseline.

**<!-- count -->339<!-- /count --> pixel art effects and animations, every one a small piece of code.** Fire,
explosions, magic, weather, UI, pickups, critters and more. Play them live, recolor and mirror them, drop them into
a browser game, or export sprite sheets for any engine. Plus a **fantasy game kit** — battle maps, minion and boss
units, telegraphed attacks, and encounter timelines you author under `src/encounters/` — and a Claude Code skill that
makes new ones the way a picky pixel artist would: draft, render, look, refine.

The library is **<!-- original-count -->244<!-- /original-count --> original effects and **<!-- new-count -->95<!-- /new-count --> new ones**. The [gallery](gallery/index.html) marks every item `original` or `new` and filters by it.

**<!-- act-count -->119<!-- /act-count -->** effects export an **`act`** timeline: wind-up, release, freeze on contact, target reaction, recovery. **<!-- moves-count -->12<!-- /moves-count -->**
**moves** in `src/fx/moves/` chain those beats into full attacks from wind-up to recovery.

**[open the gallery](https://patch-gg.github.io/pixelfx/)** ·
[live gallery (this fork)](http://42.192.38.33/pixelfx_extend/index.html?source=new&character=moon-oracle#thrown) ·
[fantasy encounters](https://patch-gg.github.io/pixelfx/fantasy.html) ·
[catalog](docs/CATALOG.md) · [Japanese legend](docs/JAPANESE.md) · [fantasy kit](docs/FANTASY.md) · [acting](#acting) · [the skill](#the-skill) ·
[make your own](#make-your-own) · [how it works](#how-it-works)

The method is [Hugo Duprez](https://x.com/HugoDuprez)'s, from [How to make (good) pixel art effects with
Claude](https://www.spritefusion.com/blog/how-to-make-good-pixel-art-effects-with-claude): code is clay, trust your
eyes, feed your references. His [open-source effects](https://www.spritefusion.com/pixel-art-vfx) at Sprite Fusion
set the bar, and `src/core/sim.js` and the effects that say so at the top adapt his code. This repo is our take on
the idea at library scale, with a skill to keep going.

## new additions.

These **<!-- new-count -->95<!-- /new-count -->** pieces are not in the original 244-effect baseline: fantasy maps, minions, bosses and more. Browse them in the [gallery (`?source=new`)](gallery/index.html?source=new) or the deployed [live gallery](http://42.192.38.33/pixelfx_extend/index.html?source=new&character=moon-oracle#thrown) (new effects, Moon Oracle, thrown category).

<p align="center">
  <img src="docs/readme/montage-new.gif" width="800" alt="Six looping fantasy battle maps at full 320×180 resolution: aurora pass, crystal hollow, ember depths, mossy ruins, sunscar temple and wisp marsh.">
</p>

<!-- new-catalog -->
| category | effect | id |
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
| **fanren** | Azure bamboo swords | `fanren/azure-bamboo-swords` |
| **fanren** | Evil-warding thunder | `fanren/evil-warding-thunder` |
| **fanren** | Gold-devouring beetles | `fanren/gold-devouring-beetles` |
| **fanren** | Immortal-slaying bead | `fanren/immortal-slaying-bead` |
| **fanren** | Heaven-palm bottle | `fanren/palm-heaven-bottle` |
| **fanren** | Xuantian spirit-slaying sword | `fanren/xuantian-sword` |
| **kami** | Amaterasu, sun mirror | `kami/amaterasu-sun` |
| **kami** | Ame-no-Murakumo | `kami/ame-no-murakumo` |
| **kami** | Ama-no-Iwato | `kami/ameno-iwato` |
| **kami** | Six magatama | `kami/magatama-six` |
| **kami** | Susanoo, storm sword | `kami/susanoo-thunder` |
| **kami** | Tsukuyomi, moon bow | `kami/tsukuyomi-arrow` |
| **kami** | Yamata no Orochi | `kami/yamata-no-orochi` |
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
| **ui** | Skill ready | `ui/skill-ready` |
| **ui** | XP bar fill | `ui/xp-bar-fill` |
<!-- /new-catalog -->

## what's in it.

Categories with new content appear first; samples list **new** effects before original ones.

<!-- catalog -->
| category | effects | some of them |
|---|---|---|
| **pickups** | 24 | cash coin, dragon pearl, elixir gourd, flying sword, gold ingot, immortal fan… |
| **ninjutsu** | 12 | amaterasu, chidori rush, earth wall, great breakthrough, great fireball, kirin… |
| **thrown** | 8 | binding silk, boomerang throw, flying sword, kunai throw, pear-blossom needles, powder bomb throw… |
| **dragonball** | 8 | destructo disc, drill beam, golden aura, ki charge, ki volley, ki wave… |
| **lightning** | 18 | forked burst, ground surge, static cage, storm sigil, storm vortex, thunder rain… |
| **japanese legend** | 7 | amaterasu, sun mirror, ame-no-murakumo, ama-no-iwato, six magatama, susanoo, storm sword, tsukuyomi, moon bow… |
| **world** | 7 | aurora pass, crystal hollow, ember depths, inkbound shrine, mossy ruins, sunscar temple… |
| **melee** | 18 | holy sword cleave, katana draw cut, knight lance thrust, war mace crush, rapier lunge, banded staff combo… |
| **senjutsu** | 6 | gate of the great god, sage art: goemon, sage orb, thousand wood dragons, white flash, wind shuriken |
| **a mortal's journey** | 6 | azure bamboo swords, evil-warding thunder, gold-devouring beetles, immortal-slaying bead, heaven-palm bottle, xuantian spirit-slaying sword |
| **miku** | 5 | encore, leek smash, song aura, sound wave, vocal burst |
| **konosuba** | 4 | explosion chant, explosion crater, explosion, explosion |
| **spawn & death** | 13 | ink unravel, shanhaijing summon, talisman suppression, coin drop, disintegrate, dissolve burn… |
| **ui** | 14 | skill ready, xp bar fill, achievement, coin collect, combo counter, confetti… |
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
| **transitions** | 10 | blinds, burn away, crt off, diamond wipe, glitch wipe, iris… |
| **critters** | 12 | bat, bird, butterfly, eyeball, fish school, flying skull… |
<!-- /catalog -->

Every effect is a file in `src/fx/<category>/<name>.js`. The [catalog](docs/CATALOG.md) lists them all.

## fantasy game kit.

The library also carries the things a fantasy game needs around its effects. They use the same files, buffers,
palette options and tooling, and add one export each:

| piece | folder | what it carries |
|---|---|---|
| **maps** | `src/fx/world/` | 320×180 looping arenas with a `map` export: `groundY`, walkable spans, platforms, hero/mob/boss spawns |
| **minions** | `src/fx/mobs/` | looping units with `hp`, radius, speed and a list of attacks; their attack effects are separate modules |
| **bosses** | `src/fx/boss/` | large loops with health, phases and telegraphed attacks; start one with `node tools/new.mjs boss/<name> --boss` |
| **boss attacks** | `src/fx/boss/` | screen-wide telegraphs, quakes, volleys and phase transitions, with hit timings |
| **encounters** | `src/encounters/` | a map, a hero, minions and their attacks on one timeline; add `encounter.boss` for a boss fight |

The browser page and the render tools share the same `createEncounter` runtime.

```bash
node tools/new.mjs world/mossy-crypt --map       # a battle map with a layout
node tools/new.mjs mobs/rat-scout --mob          # a looping minion
node tools/new.mjs mobs/rat-bite --mob-attack    # its attack effect
node tools/new.mjs boss/bog-witch --boss         # a boss unit
node tools/new.mjs boss/bog-nova --boss-attack   # a telegraphed move
node tools/new.mjs my-encounter --encounter      # timeline stub (add encounter.boss for a boss fight)

node tools/map.mjs world/mossy-ruins             # contact + layout + gameplay images
node tools/encounter.mjs <name> --mp4           # contact sheet, timeline JSON and video
```

This checkout does not ship sample encounters yet; [`docs/ENCOUNTERS.md`](docs/ENCOUNTERS.md) lists **<!-- encounter-count -->0<!-- /encounter-count -->** until you add
modules under `src/encounters/`. After you do, [gallery/fantasy.html](gallery/fantasy.html) loads the same timeline the tools use.

Every new piece is checked like an effect: `npm run check` verifies the map's floor and spawns, boss phases when a
boss is present, hit timings inside their effects, timeline order and that the encounter can actually finish. `node tools/index.mjs`
regenerates the registries and [catalog](docs/CATALOG.md)/[encounter catalog](docs/ENCOUNTERS.md). The full data contract,
design checklists and integration snippet are in [docs/FANTASY.md](docs/FANTASY.md).

## use one.

**In a browser game** (canvas, Phaser, PixiJS, Kaplay, three.js), use the code. No dependencies.

```js
import { createFrame, clearFrame, createFx, composite } from "pixelfx";
import * as frostNova from "pixelfx/fx/ice/frost-nova";

const frame = createFrame(320, 180);                   // your game's pixel resolution
const img = new ImageData(320, 180);
const fx = createFx(frostNova, { x: 160, y: 140 });   // also: flip, angle, seed, palette, light...

function tick(dt) {
  fx.update(dt);
  clearFrame(frame);
  fx.draw(frame, "back");                              // behind characters
  drawCharacters();
  fx.draw(frame, "front");
  composite(frame, img.data, backgroundColor);         // color, then light added on top
  ctx.putImageData(img, 0, 0);                         // scale up with image-rendering: pixelated
}
```

Install from GitHub with `npm i github:patch-gg/pixelfx`, or copy `src/core` and the effects you want.

**In any engine** (Godot, Unity, GameMaker, Defold, LÖVE, Bevy), use sprite sheets:

```bash
node tools/render.mjs ice/frost-nova --sheet
```

That writes a transparent PNG of every frame in a grid and an Aseprite-style JSON (frame rects, durations, and
`meta.pixelfx` with fps, loop, columns and the pivot). Phaser's atlas loader and the Aseprite importers for Godot
and Unity read it. `node tools/sheets.mjs` exports the whole library to `sheets/`.

### Cocos Creator

Export the effects directly into a Cocos Creator project's resources folder. This creates transparent PNG/JSON assets for every effect plus an index, splitting long animations into 2048px-safe pages when needed, so all effects use the same runtime component:

```bash
npm run cocos:export -- fire/torch
node tools/cocos.mjs fire ice moves/sword-combo --out ../pixelfx-cocos/assets/resources/pixelfx
node tools/cocos.mjs --out ../my-game/assets/resources/pixelfx
```

Copy [`cocos/runtime/PixelfxSprite.ts`](cocos/runtime/PixelfxSprite.ts) into your Cocos project's `assets/scripts/pixelfx/`, attach it next to a Cocos `Sprite`, and set `effectId` to an id such as `fire/campfire`. It handles loading, nearest-neighbour filtering, the exported pivot, playback speed, looping and auto-destroy. See [`cocos/README.md`](cocos/README.md) for the full setup and API.

The companion repo [**pixelfx-cocos**](https://github.com/hanhandi-git/pixelfx-cocos) holds the Creator 3.8.8 preview workbench (`assets/scenes/Main.scene`). Clone it as a sibling of this checkout so `npm run cocos:export` writes to `../pixelfx-cocos/assets/resources/pixelfx/`:

```bash
git clone https://github.com/hanhandi-git/pixelfx-cocos.git ../pixelfx-cocos
```

Open that project in Creator and press **Preview** to filter by category, select an effect, and control playback. Generated PNG/JSON live only under `pixelfx-cocos/assets/resources/pixelfx/`, not in this library checkout.

### Browser gallery

For a browser-only preview with no Cocos Creator dependency, run:

```bash
npm run gallery
```

Open [http://localhost:8080/gallery/](http://localhost:8080/gallery/). The gallery imports the effect modules directly,
supports category filtering, search and playback, and marks every effect `original` or `new`; `?source=new` opens
the new additions directly. For authored encounters under `src/encounters/`, the same server plays the timeline at
[http://localhost:8080/gallery/fantasy.html](http://localhost:8080/gallery/fantasy.html): choose an encounter, jump to a
phase, replay it and change speed (empty until you add encounter modules). `npm run build:web` writes the static site to `dist/gallery/`.

After adding an effect in `src/fx/`, run `node tools/index.mjs` and refresh the gallery (that pass also refreshes the
`act` / `moves` / encounter counts in this README); rebuild with `npm run build:web` when using the static version.

Any effect takes a `palette` (a dark-to-bright ramp of hex colors), so a fire can burn blue and a heal can glow
pink without touching its code:

```bash
node tools/render.mjs fire/torch --gif --opts '{"palette": ["#102","#215","#43a","#8cf","#cff","#fff"]}'
```

## acting.

<p align="center">
  <img src="docs/readme/acts.gif" width="800" alt="A grey dummy fighting a straw target: a three-stroke sword combo, a hammer smash, a ground pound, a holy smite, a frost nova and a run with after-images, each with a wind-up, a freeze on contact and a recovery.">
</p>

An effect on its own looks like a sticker. What sells a hit is the body around it: the wind-up that says something is
coming, the freeze on contact, the target rocking back, the recovery. **<!-- act-count -->119<!-- /act-count -->** effects export `act` data for that; the
**<!-- moves-count -->12<!-- /moves-count -->** **moves** are the standalone attack choreographies:

```js
export const act = {
  target: { x: 58 },
  poses: [
    [-0.55, GUARD],            // he starts before the effect does (t = 0 is the effect's first frame)
    [-0.3, WIND_UP],
    [0, CUT, "snap"],          // "snap" holds the last pose and jumps on the key
    [0.06, FOLLOW_THROUGH, "snap"],
    [0.86, GUARD],
  ],
  hits: [{ t: 0.06, stop: 0.14, shake: 0.18, amp: 2, push: 2.8, straw: 18 }],   // freeze for 0.14 s on contact
};
```

**Play the whole thing**, character and target included, by swapping `createFx` for `createAct`:

```js
import { createFrame, clearFrame, createAct, composite } from "pixelfx";
import * as slash from "pixelfx/fx/melee/sword-slash";

const act = createAct(slash, { x: 80, y: 140 });

function tick(dt) {
  act.update(dt);                                  // holds still by itself during a freeze
  clearFrame(frame);
  act.draw(frame);                                 // { body: false } and { target: false } leave them out
  composite(frame, img.data, backgroundColor);
  const [sx, sy] = act.shake;                      // throw the picture this far
  ctx.putImageData(img, sx, sy);
}
```

**Got your own character?** Effect ids haven't changed and a sprite sheet is still the effect alone, so existing games
keep working. (Effects drawn on the body paint the stock dummy, so regenerate those if you ship them.) The timing is plain data: read `slash.act`, or `meta.pixelfx.act` in a sprite sheet's
JSON (`windup`, `recovery`, `hits` with `t` and `freeze`, `poses`). Start your own wind-up animation that long before the effect, and
stop updating everything for `freeze` seconds at each hit.

Effects drawn on the body (frost, poison, a scan line) are written against the standing character and follow him
wherever he goes: each pixel of a pose knows which pixel of the standing body it came from. `node tools/act.mjs
<id> --sheet` bakes a whole act, character included, into a sprite sheet.

The body is yours to use too: `skeleton(pose)` gives you every joint of a pose in 3D, to hang your own things on, and
`posedParts(pose)` gives you each part drawn on its own.

## the skill.

For Codex, this checkout includes a project skill at `.agents/skills/pixelfx`, a relative symlink to
`skills/pixelfx/`. Maintain the skill in `skills/pixelfx/` so both tools share the same instructions and references.

The `pixelfx` skill teaches Claude Code to find, use, export and make effects — and to build the fantasy kit around them. Install it as a plugin:

```
/plugin marketplace add patch-gg/pixelfx
/plugin install pixelfx@pixelfx
```

or copy `skills/pixelfx` into `~/.claude/skills/`. Then ask for what you want:

- "Add a frost nova to my mage's ultimate."
- "Make five takes on a coin pickup sparkle and show me the best two."
- "Export the fire and explosions categories as sprite sheets for Godot."
- "This hit effect feels floaty. Make it punchier."
- "Give this spell a wind-up and make the enemy react to it."
- "Lay out a moonlit ruins arena for a two-phase boss fight."
- "Make a goblin minion, its dagger attack and a wave encounter."
- "Design a bog boss with a ground slam, a spore volley and a phase roar."

## make your own.

```bash
node tools/new.mjs arcane/my-spell       # a working starting point (add --loop for a loop)
node tools/render.mjs arcane/my-spell    # records/arcane/my-spell/contact.png: look at it
node tools/check.mjs arcane/my-spell     # spills, seams, unseeded randomness, slow frames
```

For a fantasy scene, start from a role template and preview the piece that matters:

```bash
node tools/new.mjs world/my-arena --map        # then: node tools/map.mjs world/my-arena
node tools/new.mjs mobs/my-slime --mob         # then: node tools/new.mjs mobs/my-slime-bite --mob-attack
node tools/new.mjs boss/my-warden --boss       # then: node tools/new.mjs boss/my-warden-quake --boss-attack
node tools/new.mjs my-fight --encounter        # then: node tools/encounter.mjs my-fight --mp4
```

Then go round: look at the contact sheet, fix the worst thing, render again. `--gif` and `--mp4` show the motion,
`--all` shows every frame. `node tools/act.mjs arcane/my-spell` shows an act as consecutive 12 fps steps, because motion
bugs don't show in samples. [docs/AUTHORING.md](docs/AUTHORING.md) has the contract, the drawing API and the quality
bar. `node tools/serve.mjs` runs the gallery locally with your effects in it.

## how it works.

- **Two kinds of effect, no images.** Pure effects export `draw(p, t, o)`, the frame at `t` seconds from `t` alone, so
  loops tile with no seam. Simulated effects export `create(o)` and step real particles, debris and lights at 120 Hz,
  so sparks bounce and smoke rolls the same at any frame rate.
- **Two buffers.** `color` takes pixels: opaque, dithered or truly translucent. `light` takes additive glow, added on
  top. Hot things look hot because of the light buffer.
- **Seeded everything.** Every random number comes from the effect's seed, so frame 40 is the same every time.
- **Local space.** Effects draw around their own origin; the painter places, mirrors and rotates them. Directional
  effects face right. A 24×38 stock character stands in for status effects, auras and hits.
- **A real skeleton, drawn down to pixels.** The grey dummy is neutral on purpose, so the eye goes to the move and any effect's
  colors read on it. He's a 3D skeleton with fixed-length bones, pelvis to spine to shoulders, rendered in a few flat tones with one clean
  ink line, the way Dead Cells makes its sprites. So he can twist, bend and really turn round, and depth decides what's in front. Poses hold on 12 fps
  steps, the way hand-drawn sprites do, while particles run at full rate.
- **Same frame shape as Sprite Fusion's VFX** (`{ w, h, ox, oy, color, light }`), so both libraries can draw into
  one frame.
- **Fantasy roles are data, not a second runtime.** A map is a 320×180 loop with a layout export; a mob/boss is a unit
  loop with stats; an attack is a one-shot with hit timings; an encounter places them on a timeline. `createEncounter`
  draws the fight and the boss bar, and the same timeline powers the tools and the browser page.

## license.

MIT, code and effects. Use them in anything, commercial included. Parts are adapted from Hugo Duprez's MIT effects
and from Hollow Crown's MIT source, and the Patch Pixel font in `gallery/fonts` is Patch's own and not covered: see
[NOTICE.md](NOTICE.md).

Made by [Patch](https://patch.gg).
