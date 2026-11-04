# AGENTS.md

## Project overview

`pixelfx` is a code driven pixel art VFX library. The canonical effect definitions live in
`src/fx/`; the renderer and simulation runtime live in `src/core/`. The repository also contains
a Cocos Creator 3.8.8 preview integration that plays exported sprite sheets.

Keep the source effect library engine independent. Cocos support is an export and runtime adapter;
do not move the effect implementations into Cocos scripts unless the task explicitly asks for a
new native implementation.

## Repository map

- `src/core/`: frame buffers, painter, particles, actors, acts, encounters, color and math helpers.
- `src/fx/<category>/<effect>.js`: effect modules. Each exports `meta` and either `draw()` or `create()`.
- `src/fx/world/`: battle maps (`meta.kind: "map"`, `map` layout export, helpers in `_lib.js`).
- `src/fx/mobs/`: minion loops (`kind: "mob"`, `mob` stats) and their one-shot attacks (`kind: "mob-attack"`).
- `src/fx/boss/`: boss loops (`kind: "boss"`, phases) and screen-wide attacks (`kind: "boss-attack"`).
- `src/encounters/<id>.js`: encounter choreography (map, hero, units, attacks, phases, timeline).
- `src/fx/index.js`: generated effect registry. Regenerate it with `node tools/index.mjs`.
- `src/fx/provenance.js`: the 244-effect original baseline; anything not listed is `new` in the workbench/gallery source filter.
- `src/encounters/index.js`: generated encounter registry.
- `tools/`: rendering, checking, sprite-sheet export, map/encounter previews and gallery tooling.
- `gallery/fantasy.html`: live encounter player (the same timeline the tools render).
- `cocos/runtime/PixelfxSprite.ts`: reusable Cocos Creator 3.x playback component.
- `assets/scripts/pixelfx/PixelfxSprite.ts`: the copy used by the local Cocos project.
- `assets/scenes/Main.scene`: Cocos preview scene; it plays the exported effects in sequence.
- `assets/scripts/pixelfx/PixelfxWorkbench.ts`: Cocos preview workbench with category filters,
  effect list, playback controls and metadata.
- `assets/resources/pixelfx/`: generated Cocos PNG/JSON resources.
- `gallery/workbench.html`: standalone browser-only H5 workbench; it does not use Cocos Creator.
- `docs/`: catalog and authoring documentation.

## Runtime and engine contract

- Use Node.js 18 or newer and npm.
- Use Cocos Creator **3.8.8** for the local project and preview server.
- The Cocos project root is this repository root. Open it with:

  ```bash
  /Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/MacOS/CocosCreator \
    --project /Users/michiyang/Desktop/code/develop/game_dev/pixelfx
  ```

- The Cocos preview is normally available at `http://localhost:7456/` after pressing Preview in
  Creator. Open `assets/scenes/Main.scene` before previewing if the page is empty.
- Cocos PNGs are loaded as Texture2D sub-assets using `resources.load('<effect>/texture', Texture2D)`;
  JSON metadata is loaded from `resources.load('<effect>', JsonAsset)`. Preserve this distinction.
- Cocos uses the generated atlas metadata and pivot. Keep nearest-neighbour filtering and the
  top-left atlas coordinate convention intact.

## Common commands

```bash
npm ci                         # install dependencies
npm run check                  # validate all effects
npm run render -- fire/torch   # render a contact sheet
npm run gallery                # start the browser gallery
npm run workbench              # serve the same repo; open /gallery/workbench.html
npm run build:web              # build static gallery + workbench into dist/gallery
npm run cocos -- fire/torch \
  --out assets/resources/pixelfx
npm run cocos -- --out assets/resources/pixelfx  # export all effects

npm run map -- world/mossy-ruins                 # map contact, layout and gameplay images
npm run encounter -- verdant-throne --mp4        # encounter contact sheet, timeline JSON and video
```

Fantasy content starters:

```bash
node tools/new.mjs world/<name> --map
node tools/new.mjs mobs/<name> --mob
node tools/new.mjs mobs/<name> --mob-attack
node tools/new.mjs boss/<name> --boss
node tools/new.mjs boss/<name> --boss-attack
node tools/new.mjs <encounter-name> --encounter
```

For Cocos changes, also compile the runtime component when possible:

```bash
node_modules/.bin/esbuild assets/scripts/pixelfx/PixelfxSprite.ts \
  --loader:.ts=ts --format=esm --bundle --external:cc \
  --outfile=/tmp/PixelfxSprite.js
```

After changing source effects, run `npm run check` and regenerate Cocos assets when the preview
needs the changed effect. A full export writes hundreds of generated files and can take time.
The H5 workbench and fantasy encounter page import source modules directly, so they need no Cocos export step.

## Effect authoring rules

- Preserve deterministic output. Never use `Math.random`; use the seeded helpers in `src/core/`.
- Respect each effect's `meta` contract: `name`, `desc`, `tags`, `size`, `origin`, `duration`, `bg`,
  and `options` where applicable. Fantasy roles add `meta.kind` and exactly one of `map`, `mob`, `boss` or
  `attack`; keep the shape documented in `docs/FANTASY.md` because tools and `createEncounter` read it.
- Keep maps engine-independent: they draw with `Painter` and export layout data, not game logic. Units, attacks and
  encounters compose effects; they do not move effect implementations into the runtime.
- Keep attacks separate from units. A mob's `mob.attacks[].fx` and a boss's `boss.attacks` reference effect modules;
  an `attack.hits[].t` must line up with the on-screen contact frame.
- Keep the source tag automatic: new effects are tagged `new` because they are absent from `ORIGINAL_EFFECTS` in
  `src/fx/provenance.js`. Only edit that list when deliberately reclassifying an old effect; do not add a `new` tag to
  individual effect files.
- Use `createFx()` for standalone playback and `createAct()` for acted effects with poses, hits and
  freeze timing.
- Draw through `Painter` and keep color and additive light in their separate frame buffers.
- Keep one-shot effects empty at `t = duration`, and make loop seams continuous.
- Run the targeted check first while iterating, then run the full check before finishing.
- Update generated registry/catalog files through their tools instead of hand editing them.

## Generated and ignored files

Do not hand edit or commit Cocos editor state, caches or build output:

- `library/`, `temp/`, `profiles/`, `settings/`
- `assets/**/*.meta`
- `assets/resources/pixelfx/` and other generated resource pages
- `records/`, `sheets/`, `dist/`, `node_modules/`

The Cocos editor may recreate these files. If a fresh checkout needs a preview, open the project in
Creator 3.8.8, let AssetDB import the project, export resources with `npm run cocos`, then open
`assets/scenes/Main.scene`.

## Change discipline

- Make the smallest change that satisfies the task and preserve unrelated worktree changes.
- Keep reusable Cocos code in `assets/scripts/pixelfx/` and mirror intentional runtime changes in
  `cocos/runtime/` so the documented integration remains copyable.
- Do not add large generated PNGs to a source change unless the task explicitly requests checked-in
  assets; the normal workflow regenerates them into `assets/resources/pixelfx/`.
- Report the exact commands run and any limitation that could not be verified in Creator.
