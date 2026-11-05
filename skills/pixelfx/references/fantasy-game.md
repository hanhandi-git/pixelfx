# Fantasy game kit: maps, minions, bosses and encounters

Run the commands below from the pixelfx project root. All four content types share the same pixel VFX runtime:

- **Map** `src/fx/world/<name>.js`: a 320×180 looping arena that exports a `map` layout.
- **Minion** `src/fx/mobs/<name>.js`: a looping unit that exports `mob` stats and an attack list.
- **Boss** `src/fx/boss/<name>.js`: a large unit that exports `boss` HP and phases.
- **Combat VFX** `mobs/*-attack.js`, `boss/*-attack.js`: one-shot attacks and telegraphs that export `attack` hit data.
- **Encounter** `src/encounters/<name>.js`: timeline choreography of map, hero, minions, boss and effects; exports `encounter`.

Read `docs/FANTASY.md` for the full contract, then `node tools/list.mjs fantasy` to find existing assets.

## 1. Pick the right content type

| need | type | command |
|---|---|---|
| a fightable scene / backdrop | map | `node tools/new.mjs world/<name> --map` |
| a small enemy that breathes and moves | minion unit | `node tools/new.mjs mobs/<name> --mob` |
| one minion attack | minion attack | `node tools/new.mjs mobs/<name> --mob-attack` |
| a huge enemy with phased combat | boss unit | `node tools/new.mjs boss/<name> --boss` |
| full-screen telegraph, ground break, volley, phase change | boss attack | `node tools/new.mjs boss/<name> --boss-attack` |
| choreograph the above into one fight | encounter | `node tools/new.mjs <name> --encounter` |

Build the main unit first, then attacks, then the encounter. Do not write a 20 s timeline first and backfill assets later: every hit time must align with constants inside the effect module.

## 2. Maps

One-line design: **where is this, where do the hero and boss stand, what moves, and what does the player read first.**

Maps must be 320×180, `origin: [0, 0]`, `loop: true`. Bake static layers once; animate only ambient particles:

```js
import { fit, hex } from "../../core/index.js";
import { bake, blit, sky, stars, ground, tufts, mist, fireflies, leaves, motes } from "./_lib.js";

export const meta = {
  name: "Mossy Ruins",
  desc: "One-line visual description.",
  tags: ["map", "forest", "fantasy", "arena", "loop"],
  kind: "map",
  size: [320, 180], origin: [0, 0],
  duration: 10, loop: true, fps: 30, bg: "dark",
  options: { palette: [/* 8 steps dark to bright */], seed: 1 },
};

export const map = {
  groundY: 150,                       // foot line; must match the art
  bounds: [8, 312],
  walk: [[8, 312]],
  platforms: [],                      // [x, y, width]
  spawns: { hero: [54, 150], mobs: [[152, 150], [198, 150]], boss: [262, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
```

Implementation notes:

1. Call `bake(W, H, fn)` once for sky, distance, ruins, floor and foreground; `blit(p, layer)` each frame. Do not redraw 50k pixels every frame.
2. Make the ground line readable: 1 px bright top edge, 2–3 px darker band below; leave a low-contrast **combat strip** under the characters.
3. Depth: rear layers darker and less saturated; foreground brighter and detailed; vines, mist, fireflies and leaves at the edges.
4. Seed all randomness with `o.seed`; loop with `t % D`, `cycle`, `sin(phase * TAU * n)`, or `tileNoise`.
5. Spawn points must sit on `walk` at `groundY`; `platforms` are above `groundY`.
6. Do not set `meta.actor`. The encounter places units; the map only draws the scene.

<a id="natural-forms"></a>

### Natural silhouettes and materials

For natural scenery, establish volume and growth structure before fog, particles and glow. Long straight rock facets and 1 px branch polylines still read as placeholders even with extra cracks and particles. Hard edges suit crystals, built structures and deliberate rock cuts; eroded edges, trunks and roots need richer contour rhythm. Do not smooth every material into the same curve language.

- **Contour at multiple scales.** Large scale sets cave mouths, trunk direction and rock masses; medium scale handles block faces, root swell, forks and canopy gaps; only then 1–3 px notches. Avoid per-pixel jitter and rows of identical stalactites or copy-pasted Y trees.
- **Rocks read as volume.** Build walls from overlapping irregular blocks; lit face, shadow side and ground contact shadows stay continuous. Cracks follow structural breaks; fine texture clusters on masses. Keep crystal facets straight so crystals differ from host rock.
- **Trees read as growth.** Trunks bend and taper; thick limbs join the trunk, thin limbs branch off; roots spread on the ground. Vary fork angle, length and height; bark follows bend; foliage clusters with gaps. Near trees need thickness; far trees can simplify and lower contrast.
- **Pick the right abstraction.** `Painter.line/poly` rasterize control points literally; when shapes feel stiff, change control points and scene construction first. Shared builders live in `src/fx/world/_nature.js`, called inside `bake()`: `contour(points)` samples curves; `limb(p, points, width, tip, colors, { seed, bark })` tapered branches; `rock(p, x, y, rx, ry, colors, { seed, moss })` volumetric rocks; `marshTree(p, x, base, h, width, colors, { seed, lean, crown, detail })` marsh trees; `conifer(p, x, base, h, width, colors, { seed, lean, detail })` snow-laden pines; `massif(p, peaks, baseY, colors, { seed, snowline, detail })` snow-capped ranges with one shared skyline (it returns `at(x)` so trees can sit on the crest). `colors` is a dark-to-bright ramp; optional two-step `moss`; curves stay hard-pixel with no antialiasing. Enable only on maps that need it.
- **Visual acceptance.** Review native 320×180, nearest-neighbour zoom, and frames with characters; then disable glow and motion particles and judge the static layer. You should distinguish rock, crystal, bark and leaves without relying on asset names; check multiple seeds. Keep before/after comparisons at the same time. Keep feet area calm without blanking the whole backdrop.

Verification:

```bash
node tools/check.mjs world/<name>
node tools/map.mjs world/<name>
```

Open `records/world/<name>/layout.png`: yellow walk lines cover the floor; spawn markers sit on walk at ground level. Open `gameplay.png` and confirm the hero stands on the ground at 1× and is not hidden by foreground.

## 3. Minions

First read is **silhouette**, then detail. 16–40 px tall, one exaggerated feature (big ears, hat, dagger), two or three main colors plus one glow accent.

```js
export const meta = {
  name: "Goblin Raider",
  desc: "One line: look, idle motion, telegraph before the attack.",
  tags: ["mob", "goblin", "fantasy", "minion", "melee", "loop"],
  kind: "mob",
  size: [64, 72], origin: [32, 58],     // origin near the feet
  duration: 2.6, loop: true, fps: 30, bg: "ground",
  options: { palette: [/* 7–8 steps */], seed: 1 },
};

export const mob = {
  tier: "minion", hp: 42, radius: 9, height: 33, speed: 31, xp: 12,
  attacks: [{ id: "jab", name: "Rusty jab", fx: goblinJab, range: 22, windup: 0.18, cooldown: 2.2, damage: 7 }],
  loot: "pickups/coin-spin",
};
```

- Draw the body in local space with `Grid`, `g.outline` for a 1 px hard edge, then `g.draw(p)`.
- Idle loop: breathing, blinks, weight shift, weapon glint; do not embed the attack in the minion loop—that is a separate one-shot.
- `drawBack` for ground shadow and a little foot rim light.
- Attacks are separate files: `mobs/<name>-attack.js` with `kind: "mob-attack"`; `attack.hits[0].t` is the hit frame.
- Place the attack effect origin near hand or mouth; `range` matches arm reach; the encounter positions at the minion's feet and sets facing.
- On death, play `spawn/poof`, `spawn/soul-rise`, etc. from the encounter timeline, then hide with `until`.

Verification:

```bash
node tools/check.mjs mobs/<name> mobs/<name>-attack
node tools/render.mjs mobs/<name> --zoom 5
node tools/render.mjs mobs/<name>-attack --zoom 5 --all
```

Check `records/mobs/<name>/contact.png` for a readable 1× silhouette; step through the attack frames and align hits with `attack.hits`; frame empty at `t = duration`.

## 4. Boss

A boss is **scale, phases and telegraphs**.

```js
export const meta = {
  name: "Thorn King",
  desc: "One line: what it is and why it is frightening.",
  tags: ["boss", "fantasy", "forest", "loop"],
  kind: "boss",
  size: [128, 168], origin: [64, 152],
  duration: 3.4, loop: true, fps: 30, bg: "ground",
  options: { palette: [/* 8 steps */], seed: 1 },
};

export const boss = {
  tier: "boss", hp: 1200, radius: 28, height: 96,
  phases: [{ hp: 1, name: "The Waking Wood" }, { hp: 0.55, name: "Thorns Unleashed" }],
  attacks: [rootQuake, thornVolley, phaseRoar],
  loot: "pickups/loot-beam",
};
```

- Canvas 96–140 px wide, 120–170 px tall; feet on `y = 0`; `meta.origin` at the feet.
- Silhouette first: horns, crown, weapon, cloak, glowing core—at least three readable at 1×.
- Idle loop only: breathing, core pulse, bright eyes, falling leaves, creeping vines.
- Attacks are separate full-screen 320×180 files, `origin: [160, 150]`, `kind: "boss-attack"`, exporting:
  ```js
  export const attack = {
    telegraph: 0.9, // seconds the player can react
    hits: [{ t: 1.0, amp: 4, shake: 0.45, damage: 120, radius: 136, target: "hero" }],
  };
  ```
- At least two attacks plus one phase change: melee zone, ranged marks/volley, full-screen roar. Rhythm: 0.8–1.6 s telegraph, 1–2 frame white flash, 2–5 s aftermath.
- Phases by HP or time: `boss.phases` thresholds; encounter `phases` timeline shows banner, plays `phase-roar`, snaps the bar to the next segment.
- Phase changes must change the picture: color, light, ground cracks, leaf storm or shake—or players will not feel the shift.

Verification:

```bash
node tools/check.mjs boss/<name> boss/<name>-attack
node tools/render.mjs boss/<name> --zoom 4
node tools/render.mjs boss/<name>-attack --zoom 3 --all
```

The telegraph must appear in contact-sheet samples; an invisible telegraph is not a telegraph.

## 5. Encounters

An encounter is data, not a second renderer. `src/encounters/<name>.js`:

```js
import * as map from "../fx/world/mossy-ruins.js";
import * as boss from "../fx/boss/thorn-king.js";
import * as goblin from "../fx/mobs/goblin-raider.js";
import * as goblinJab from "../fx/mobs/goblin-jab.js";
import * as rootQuake from "../fx/boss/root-quake.js";

export const meta = {
  name: "The Verdant Throne",
  desc: "One line: setup, escalation and payoff of this fight.",
  tags: ["encounter", "boss", "fantasy"],
  duration: 27.5, fps: 30, size: [320, 180],
  map: "world/mossy-ruins", boss: "boss/thorn-king", mobs: ["mobs/goblin-raider"],
};

const GROUND = map.map.groundY;

export const encounter = {
  w: 320, h: 180, duration: 27.5, map,
  hero: { x: 52, y: GROUND },
  boss: { mod: boss, x: 252, y: GROUND, name: "The Thorn King" },
  mobs: [{ id: "add-a", mod: goblin, x: 118, y: GROUND, hp: 42, until: 10.5 }],
  phases: [
    { at: 0.35, hp: 1, name: "The Waking Wood", sub: "THE THORN KING", dur: 2.8 },
    { at: 13.2, hp: 0.55, name: "Thorns Unleashed", sub: "PHASE II", dur: 2.8 },
  ],
  timeline: [
    { at: 2.4, type: "attack", fx: rootQuake, x: 160, y: GROUND },
    { at: 5.6, type: "attack", fx: goblinJab, x: 118, y: GROUND, flip: true },
    { at: 10.4, type: "attack", fx: poof, x: 118, y: GROUND },
  ],
};
```

Timeline cue types:

| type | fields | purpose |
|---|---|---|
| `attack` | `at, fx, x, y, flip?, options?, until?` | Play a one-shot or loop; `attack.hits` drives shake and hero flash |
| `phase` | `at, name, sub, hp, dur, shake?` | Snap HP bar and show phase banner; can also live in `phases` |
| `text` | `at, text, sub, dur` | Text only, no HP bar change |
| `shake` | `at, amp, dur` | Standalone screen shake |
| `hit` | `at, target, amp, shake, dur` | Hero hit flash |
| `defeat` | `at, target: "boss" or mob id` | Hide unit; boss also clears the bar |
| `summon` | `at, mod, id, x, y, ...` | Spawn a minion mid-fight |

Pacing template:

1. **Opening 0–3 s**: frame reads boss and hero; phase I banner; first attack teaches a mechanic.
2. **Tutorial 3–8 s**: minions enter; player chooses adds vs boss; 2–4 s between attacks to reposition.
3. **Escalation 8–12 s**: second attack pattern; minion deaths or swaps; boss HP enters next segment.
4. **Phase change 12–15 s**: `phase-roar`, banner, shake, color shift; avoid lethal damage in this window.
5. **Phase II 15–23 s**: overlapping attacks, persistent floor hazards, minions return; tighten last 2–3 s.
6. **Victory after ~23 s**: hide boss, death/loot/feathers, `defeat`, victory banner; hold empty arena 1–2 s.

Verification:

```bash
node tools/encounter.mjs <name> --mp4
node tools/index.mjs
npm run check
```

Review `records/encounters/<name>/contact.png` and `timeline.json` for hit times. Play back in the browser:

```bash
npm run workbench
open http://localhost:8080/gallery/fantasy.html?enc=<name>
```

Check: boss HP bar, phase banners, shake, hero flash, summons appear/disappear, VFX do not cover the bar, no empty tail in GIF/MP4.

## 6. Integrating in a game

Browser/JS games use the runtime directly:

```js
import { createFrame, clearFrame, createEncounter, composite } from "pixelfx";
import * as fight from "./src/encounters/verdant-throne.js";

const frame = createFrame(320, 180);
const img = new ImageData(320, 180);
const encounter = createEncounter(fight, { seed: 1 });

function tick(dt) {
  encounter.update(dt);
  clearFrame(frame);
  encounter.draw(frame);
  composite(frame, img.data, null);      // map is opaque; no backdrop needed
  ctx.putImageData(img, 0, 0);
  const [sx, sy] = encounter.shake;      // integer-pixel shake keeps pixels crisp
  if (sx || sy) ctx.translate(sx, sy);
}
```

Combat numbers live in `mob.attacks`, `boss.attacks`, and `attack.hits`; your game can read them without the demo UI.

Other engines export sprite sheets like any effect:

```bash
node tools/render.mjs world/mossy-ruins --sheet
node tools/render.mjs mobs/goblin-raider --sheet
node tools/render.mjs boss/root-quake --sheet
```

Encounters are not one sprite: use `timeline.json` and `--mp4`/contact sheets for art review, export each effect by ID, and re-choreograph in your engine.

## 7. Common mistakes

| symptom | cause | fix |
|---|---|---|
| hero floats above ground | `groundY` disagrees with art or spawn `y` ≠ `groundY` | fix `map.groundY` / `spawns`, re-check `layout.png` |
| character hidden by foreground | foreground crosses the combat strip | push foreground below `groundY + 2` or remove center foreground |
| map too busy | high contrast or detail in the combat strip | lower contrast in the center 40–80 px; detail at edges |
| minion feels like a sticker | no shadow/rim light; only bobbing idle | add `shadow`, breathing, blinks, weapon glint, ambient rim |
| boss does not read as boss | small silhouette, scattered features | scale up 1.5–2×, merge to 2–3 silhouette features; horns and hot core |
| telegraph invisible | too dark/thin or one frame only | bright floor ring, thick seal, center sigil; hold 0.8–1.6 s; check contact sheet |
| hit out of sync | `attack.hits[].t` ≠ white flash frame | move flash/hit star to `hits[0].t`; reuse same constant for shake |
| phase change feels abrupt | HP bar only | add `phase-roar`, banner, shake, color/ground change |
| long empty tail | `meta.duration` past last cue | shorten duration or add victory/loot/hold at end |
| VFX covers boss bar | effect draws into top of screen | keep attack apex at y ≥ 0; keep bar region clean |

## 8. Delivery checklist

- Source: `src/fx/world|mobs|boss/<name>.js`, `src/encounters/<name>.js`.
- Registry: `node tools/index.mjs` updates `src/fx/index.js`, `src/encounters/index.js`, `docs/CATALOG.md`, `docs/ENCOUNTERS.md`.
- Verification: `node tools/check.mjs <ids>` and `npm run check` pass; map `map.mjs` layout/gameplay OK; encounter contact/timeline/browser playback OK.
- Assets: when Cocos is needed, `npm run cocos:export -- <id>` into **pixelfx-cocos**; export only used units/attacks, not a full library by default.
- Browser link: `http://localhost:8080/gallery/fantasy.html?enc=<name>`.
- State unverified steps explicitly (e.g. not played in Cocos Creator, no MP4 without ffmpeg).
