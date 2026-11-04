# Cocos Creator integration

The Cocos integration uses baked sprite sheets. The source effects are simulated once during an asset build, so a mobile game only advances a SpriteFrame index at runtime. Every effect in the library can use the same component.

## Export resources

From this repository, write directly into a Cocos Creator project's `assets/resources` directory:

```bash
node tools/cocos.mjs --out ../my-cocos/assets/resources/pixelfx
# or export only selected categories/effects
node tools/cocos.mjs fire ice moves/sword-combo --out ../my-cocos/assets/resources/pixelfx
# use a larger limit on platforms that support it
node tools/cocos.mjs weather --max-size 4096 --out ../my-cocos/assets/resources/pixelfx
```

The command writes transparent PNG/JSON assets for every effect plus `index.json`. The default 2048px page limit keeps the output safe for mobile targets; long animations are split into `effect.png`, `effect-1.png`, and so on, with a `pages` list in the JSON. The JSON uses the same frame metadata as the existing sprite-sheet exporter and adds `meta.pixelfx.cocos.coordinateSystem = "top-left"` so the runtime can convert atlas rectangles correctly.

In the Cocos project, copy [`runtime/PixelfxSprite.ts`](runtime/PixelfxSprite.ts) into `assets/scripts/pixelfx/`. The component targets the public Cocos Creator 3.x runtime APIs (including 3.8.x).

This repository now includes a ready-to-preview scene at `assets/scenes/Main.scene` and a showcase component at `assets/scripts/pixelfx/PixelfxShowcase.ts`. Open `Main.scene` in Creator 3.8.8, press **Preview**, and the page will play the effects from `resources/pixelfx/index.json` in order. If the preview page was already open before the scene was added, refresh it after opening `Main.scene`.

## Use the component

Add a `Sprite` and `PixelfxSprite` to a node. Set `assetRoot` to `pixelfx` and `effectId` to an id such as `fire/campfire`. The component loads `resources/pixelfx/fire/campfire.json` and its one or more PNG pages, keeps nearest-neighbour filtering, applies the exported pivot, and starts playback in `start()`.

```ts
const fx = node.addComponent(PixelfxSprite);
fx.effectId = 'explosions/small-explosion';
fx.pixelScale = 2;
fx.destroyOnComplete = true;
await fx.play();

// Reuse the same node for another effect.
await fx.play('impacts/hit-spark');
```

The component also exposes `pause()`, `resume()`, `stop()`, `isPlaying`, and `currentFrame`. A non-looping animation emits `pixelfx-complete` on its node. `useMetadataLoop` follows each effect's `meta.loop`; set it to false and `loop` to true/false to override that flag.

## Coordinate and filtering notes

Pixelfx coordinates are pixel based with the origin at the effect's top-left frame corner. Cocos nodes use a bottom-left anchor, so the component flips the pivot's y coordinate; Cocos `SpriteFrame.rect` already uses top-left texture coordinates, so the exported atlas rectangles are passed through unchanged. Keep texture filtering at `POINT` for the intended pixel-art edges. On the imported PNG assets, disable mipmaps and platform compression when the target offers those importer options; the component also enforces point filtering and clamped wrapping at runtime. Scale the node with `pixelScale` instead of enabling linear filtering.

The baked route is the recommended production path. It preserves the exact deterministic frames, avoids a per-frame CPU pixel upload, and works on Web, native, and mini-game targets supported by Cocos Creator.
