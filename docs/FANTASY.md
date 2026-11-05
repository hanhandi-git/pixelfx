# Maps, minions, bosses and encounters

The fantasy kit is the effect library plus four content roles. Every role is still an ordinary module under
`src/fx/`: it renders with `Painter`, obeys the effect contract, appears in the catalog, exports to sprite sheets and
can be loaded by the workbench. The difference is a `meta.kind` and one extra export that a game — or the encounter
runtime — can read.

| role | folder | `meta.kind` | export | render command |
|---|---|---|---|---|
| map | `src/fx/world/` | `map` | `map` | `node tools/map.mjs <id>` |
| mob | `src/fx/mobs/` | `mob` | `mob` | `node tools/render.mjs <id>` |
| mob attack | `src/fx/mobs/` | `mob-attack` | `attack` | `node tools/render.mjs <id> --all` |
| boss | `src/fx/boss/` | `boss` | `boss` | `node tools/render.mjs <id>` |
| boss attack | `src/fx/boss/` | `boss-attack` | `attack` | `node tools/render.mjs <id> --all` |
| encounter | `src/encounters/` | — | `encounter` | `node tools/encounter.mjs <id>` |

Start any of them with a working template:

```bash
node tools/new.mjs world/mossy-crypt --map
node tools/new.mjs mobs/rat-scout --mob
node tools/new.mjs mobs/rat-bite --mob-attack
node tools/new.mjs boss/bog-witch --boss
node tools/new.mjs boss/bog-nova --boss-attack
node tools/new.mjs bog-witch --encounter
```

## Maps

A map is a 320 x 180 loop at `origin: [0, 0]`. It draws the whole scene — sky, distance, architecture, floor,
foreground, ambient — and exports the floor and spawn points that gameplay uses.

```js
export const meta = {
  name: "Mossy Ruins",
  desc: "A moonlit clearing inside broken elven ruins…",
  tags: ["map", "forest", "ruins", "fantasy", "arena", "loop"],
  kind: "map",
  size: [320, 180],
  origin: [0, 0],
  duration: 10,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#05080d", /* … 8 steps */], seed: 1 },
};

export const map = {
  groundY: 150,
  bounds: [8, 312],
  walk: [[8, 312]],
  platforms: [[52, 121, 54]],
  spawns: { hero: [54, 150], mobs: [[152, 150], [198, 150]], boss: [262, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};
```

`src/fx/world/_lib.js` has the layer kit:

- `bake(w, h, fn)` draws a static layer once with the full painter and keeps its color and light buffers;
  `blit(p, layer)` puts them back. Use this for the five static layers; draw only mist, motes, fireflies, leaves and
  embers per frame.
- `sky`, `stars`, `moon`, `ridge`, `foliage`, `arch`, `pillar`, `ground`, `tufts`, `fern`, `mushroom`, `pool` for the
  scenery.
- `mist`, `fireflies`, `leaves`, `embers`, `motes`, `shaft` for loop-safe ambience.

`src/fx/world/_nature.js` adds static natural forms for maps that need more than geometric primitives:

- `contour(points)` samples a curved path through control points without antialiasing.
- `limb(p, points, width, tip, colors, { seed, bark })` sweeps a solid, tapered branch along that path; widths are diameters.
- `rock(p, x, y, rx, ry, colors, { seed, moss })` builds an irregular mass with broad lit planes and connected fractures.
- `marshTree(p, x, base, h, width, colors, { seed, lean, crown, detail })` joins tapered branches, trunk and roots.

Use these inside `bake()`, with dark-to-light palettes. Keep straight facets for crystals and masonry; give eroded
stone and organic growth varied outlines. Inspect the static layer with glow and ambience disabled: particles
cannot make a thin branch into a trunk or a flat polygon into a readable rock.

**The floor is the contract.** `groundY` is a screen row, not a suggestion: feet, spawns, platforms, the floor rim and
the boss's local origin all agree with it. Keep a quiet 40–80 px combat strip there; put noise and contrast at the
edges. The map must not use `meta.actor`.

```bash
node tools/check.mjs world/mossy-ruins
node tools/map.mjs world/mossy-ruins
```

`map.mjs` writes `records/world/<id>/contact.png`, `layout.png` (walk span, ground line, spawns, platforms) and
`gameplay.png` (the map at 1x with the stock hero standing at the hero spawn). If the layout and the picture disagree,
`check` or the layout image will show it.

The `world` category contains six arenas. Each is 320 × 180 at 30 fps, with a continuous floor at y = 150,
hero/mob/boss spawns and a quiet combat strip. The four new environments use seeded ambience and periodic motion;
their main material palette can be replaced through `options.palette`.

| map | environment and motion | loop |
|---|---|---|
| `world/mossy-ruins` | Moonlit ruins, mist, fireflies and falling leaves | 10 s |
| `world/ember-depths` | Basalt cavern, lava falls, glowing fissures and embers | 9 s |
| `world/aurora-pass` | Layered snow massifs, aurora curtains, snow-laden conifers and drifting snow | 12 s |
| `world/crystal-hollow` | Faceted crystals, pulsing light, waterfall, drops and reservoir ripples | 10 s |
| `world/sunscar-temple` | Sunset dunes, broken sandstone columns, blowing sand and torn banners | 12 s |
| `world/wisp-marsh` | Flooded roots, ghost lights, mushroom spores, bubbles and water rings | 12 s |

Open `/gallery/workbench.html?fx=world/aurora-pass&source=new` and choose **world** to browse all six.
H5 previews run the source modules directly. Full-screen maps only need Cocos sprite-sheet export when a game
needs baked images; their full-resolution loops produce large atlases.

## Mob units

A mob is a looping effect at the feet, plus the numbers an enemy needs.

```js
export const meta = {
  name: "Goblin Raider",
  desc: "A hunched green raider with a rusty dagger…",
  tags: ["mob", "goblin", "fantasy", "minion", "melee", "loop"],
  kind: "mob",
  size: [64, 72],
  origin: [32, 58],
  duration: 2.6,
  loop: true,
  fps: 30,
  bg: "ground",
  options: { palette: [/* 7–8 steps */], seed: 1 },
};

export const mob = {
  tier: "minion",
  hp: 42,
  radius: 9,
  height: 33,
  speed: 31,
  xp: 12,
  attacks: [{ id: "jab", name: "Rusty jab", fx: goblinJab, range: 22, windup: 0.18, cooldown: 2.2, damage: 7 }],
  loot: "pickups/coin-spin",
};
```

`src/fx/mobs/_lib.js` re-exports the critters' `Grid`, `shift`, `spring`, `toss`, `lnoise`, `shadow`. Draw the body
into the grid, outline it, blit it, then add the shadow and foot light in `drawBack`. The idle loop should breathe,
blink, shift weight, and maybe turn a blade to catch the light. **Attacks are separate modules**: `fx` in
`mob.attacks` points at a `kind: "mob-attack"` file.

## Attacks: the tell and the hit

A mob attack is small and grounded to the hand or mouth; a boss attack is a screen.

```js
export const attack = {
  telegraph: 0.18,
  hits: [{ t: 0.26, amp: 1.2, shake: 0.12, damage: 5, range: 22, target: "hero" }],
};
```

A boss attack is `320 x 180`, `origin: [160, 150]`, `meta.kind: "boss-attack"`, and normally has:

```js
export const attack = {
  telegraph: 0.9,
  hits: [{ t: 1.0, amp: 4, shake: 0.45, damage: 120, radius: 136, target: "hero" }],
};
```

- The telegraph is drawn from `t = 0` to `hits[0].t`; it must be obvious in a sampled contact sheet.
- The hit gets a 1–2 frame white hero frame, a ring/flash at the same `t`, and screen shake from `amp`/`shake`.
- The effect ends empty at `meta.duration`.
- A boss attack is a screen-wide statement: 320 x 180. A minion attack stays near 112 x 72.

## Boss units

A boss is a large loop plus health and phases.

```js
export const boss = {
  tier: "boss",
  hp: 1200,
  radius: 28,
  height: 96,
  phases: [
    { hp: 1, name: "The Waking Wood" },
    { hp: 0.55, name: "Thorns Unleashed" },
  ],
  attacks: [rootQuake, thornVolley, phaseRoar],
  loot: "pickups/loot-beam",
};
```

- 96–140 px wide, 120–170 px tall, feet at local `y = 0`, `meta.origin` near the bottom.
- Read at 1x: antlers, crown, staff, cloak, glowing core — pick two or three and make them big.
- The idle loop is breathing, not attacking: chest, core, eyes, vines, falling leaves.
- The phase list loses health. A phase change should combine `phase-roar` (or an equivalent), a banner, shake and a
  visible change in the arena's light/palette.

## Encounters

`src/encounters/<id>.js` is choreography, not a new renderer. It exports `meta` and an `encounter` object.

```js
export const encounter = {
  w: 320,
  h: 180,
  duration: 27.5,
  map,
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
    { at: 23.0, type: "defeat", target: "boss" },
  ],
};
```

| type | fields | what it does |
|---|---|---|
| `attack` | `at, fx, x, y, flip?, options?, until?` | plays an effect; if it has `attack.hits`, schedules shake and the hero's hit flash |
| `phase` | `at, name, sub, hp, dur, shake?` | sets the boss bar target, shows a banner, optionally shakes |
| `text` | `at, text, sub, dur` | a banner with no health change |
| `shake` | `at, amp, dur` | a standalone shake |
| `hit` | `at, target, amp, shake, dur` | the hero's white hit flash |
| `defeat` | `at, target` | hides a mob or the boss; the boss bar drains to zero |
| `summon` | `at, mod, id, x, y, …` | adds a mob mid-fight |

`createEncounter(mod, { seed })` returns `{ update(dt), draw(frame), t, duration, phase, hp, shake, events, done() }`.
It draws the map, units, effects, the boss bar and the phase banner, and takes whole-pixel screen shake from
`encounter.shake`.

```bash
node tools/encounter.mjs verdant-throne --mp4
node tools/index.mjs
npm run check
npm run build:web
```

Open `http://localhost:8080/gallery/fantasy.html?enc=verdant-throne` for the live page. The browser runtime and the
tools use the same `createEncounter`.

## Design checklists

**Map.** Floor line readable; combat strip quiet; three depth layers; no character; spawns on the walk; ambient loops
seamless; 320 x 180; palette can be swapped without holes.

**Mob.** Silhouette readable at 1x; one signature feature; idle life; shadow and foot light; attack module separate;
hit frame matches the star; death cue in the encounter.

**Boss.** Scale obvious; two or three big features; idle not attack; phase list loses health; at least two attacks
plus a phase change; telegraph visible; final defeat beat.

**Encounter.** First 3 seconds legible; teaching attack in phase one; a twist in phase two; deaths clean; victory and
end hold; no empty tail; `meta.duration` covers the last cue.

## What is generated

`node tools/index.mjs` regenerates:

- `src/fx/index.js` — every effect and fantasy role, by id.
- `src/encounters/index.js` — every encounter, by id.
- `docs/CATALOG.md` — the effect catalog, now with a `kind` column.
- `docs/ENCOUNTERS.md` — the encounter catalog.
- the README counts and category table.

Do not edit those files by hand.
