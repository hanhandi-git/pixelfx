# Generate assets, register and preview

Run commands from the user's pixelfx project root. Replace the example ID `lightning/storm-sigil` with the real effect ID. IDs are always `<category>/<kebab-case-name>`, not display order numbers.

## 1. Lock the design and write source

Read `docs/AUTHORING.md`, skim `docs/CATALOG.md`, then read and render two or three closest existing effects.
Summarize subject, anchor, palette, charge/release/decay timing and end state in one line. Follow the main skill's style rules; reuse techniques from neighbors when appropriate, but a requested **new** asset needs its own look and ID.

Source lives at `src/fx/<category>/<name>.js`, exporting `meta` plus `create(o)` or `draw(p, t, o)`.
Use Painter, Particles, Lights, Rng from `src/core/index.js`; shape and particle variation use `o.seed`.
Main colors via `fit(o.palette, n)`; keep solid pixels and additive light separate. Add `act` when a character is involved; hit times must match effect phase constants.

## 2. Targeted checks and visual iteration

```bash
node tools/check.mjs lightning/storm-sigil
node tools/render.mjs lightning/storm-sigil --zoom 3
node tools/act.mjs lightning/storm-sigil
```

Run the act command only when the module exports `act`. Open the generated contact sheet and act frames; fix silhouette, layering, exposure, timing and cropping—passing commands is not a substitute for looking. GIF/MP4 are optional and need ffmpeg.
Fix warnings on the new asset itself, including out-of-bounds across seeds, loop seams and tail residue.

## 3. Register for every preview entry point

```bash
node tools/index.mjs
npm run check
```

`tools/index.mjs` updates `src/fx/index.js`, `docs/CATALOG.md`, and README counts/tables—do not hand-edit generated files. Confirm the count increased and the registry loads the new module by ID.

The H5 chain is `gallery/app.js` → `src/fx/index.js`.
A normal effect module plus a regenerated registry is enough for the gallery to discover it; you usually do not edit HTML or hard-coded asset lists.

## 4. Sync the local resource folder

Cocos Creator preview lives in the sibling [**pixelfx-cocos**](https://github.com/hanhandi-git/pixelfx-cocos) repo (`../pixelfx-cocos`). When the user wants assets beside existing ones, export incrementally:

```bash
npm run cocos:export -- lightning/storm-sigil
```

That writes `../pixelfx-cocos/assets/resources/pixelfx/lightning/storm-sigil.json`, the main PNG, and paginated `-1.png` when needed.
The exporter merges into the existing `index.json` per ID; confirm other entries remain, the new entry appears once, page files exist, and frame rects stay in bounds.
Export without IDs rebuilds the full index—use only when you need a full rebuild.

Keep atlas top-left coordinates, pivot, 30 FPS metadata and nearest-neighbour filtering.
Cocos loads PNGs with `resources.load('<id>/texture', Texture2D)` and JSON with `resources.load('<id>', JsonAsset)`. Effect logic stays in `src/fx/`.
If you change Cocos runtime components, edit `cocos/runtime/` and copy into `pixelfx-cocos/assets/scripts/pixelfx/`; compile per AGENTS.md. A plain new asset does not require runtime edits.

## 5. Open and exercise the browser gallery

Check whether a server is already running and serving this checkout. If not:

```bash
npm run gallery
```

Default URL: `http://localhost:8080/gallery/`.
If the port is taken by another project, use `npm run gallery -- 8081` (or another free port) and deliver the matching link.
Open over HTTP; browser ES modules need a server.

Verify with browser tools when available: correct name and ID, updated total count, category/search finds the asset, the preview canvas animates, pause/replay and speed work, no relevant console errors.
Assets are tagged `original` / `new`; the gallery source filter supports `gallery/?source=new`. New assets are `new` automatically—do not edit every `meta.tags` for provenance.
When you have a tool to open panels for the user, surface the gallery link, adding `?source=new` and the category hash (`#<category>`) when useful.

The gallery lists by category; being the Nth new asset does not mean list position N—confirm by ID and name.
Pure H5 runs source modules directly; it does not require Cocos PNG export.

When you also use the static build:

```bash
npm run build:web
```

Static preview: `/dist/gallery/index.html?source=new#<category>` on the same server.
Confirm the build page sees the new asset so an old bundle does not stick at the previous count.

## 6. Delivery

Deliver source paths, resource paths, the browser deep link, and checks you actually ran.
Keep `records/`, `dist/`, and `pixelfx-cocos/assets/resources/pixelfx/` as generated output; do not commit them or Cocos caches with pixelfx source.
Call out anything you could not verify (e.g. export only, not played in Creator).

## 7. Fantasy content (maps, minions, bosses, encounters)

Full workflow for maps, minions, bosses and encounters is in [fantasy-game.md](fantasy-game.md). Registration, checks and preview differ:

```bash
node tools/check.mjs world/<name> mobs/<name> boss/<name>
node tools/map.mjs world/<name>            # contact + layout + gameplay
node tools/encounter.mjs <name> --mp4     # contact + timeline.json (+ mp4)
node tools/index.mjs && npm run check
npm run build:web
```

Browser entry: `http://localhost:8080/gallery/fantasy.html?enc=<name>`; after static build, `/dist/gallery/fantasy.html?enc=<name>`. Map and unit source remain in `src/fx/`—do not move implementations into Cocos scripts.
Cocos export applies to units and attacks like any effect; full-screen looping maps produce huge sheets—export only when the game truly needs bitmaps.
