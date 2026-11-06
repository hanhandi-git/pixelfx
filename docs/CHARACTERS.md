# Action characters

The cast shares the original 38 px skeleton, weapon grips, hit-stop and effect timing. Each costume
uses a readable silhouette, warm metal accents, cool ink shadows and strong material ramps. They are
authored as code; no Hades sprites or other external character assets are included. The named
characters below are original procedural likenesses: hair, silhouette and clothing cues only, never
copied sprite art, logos or other published assets.

| Character ID | Character | Silhouette and materials | Source |
|---|---|---|---|
| `dummy` | Armored stand-in / 盔甲人 | Original neutral armor | Existing pixelfx design |
| `ember-duelist` | Ember duelist / 余烬剑士 | Swept hair, forked scarf, crimson half cape, bare arms, bronze shoulder plate | Original procedural geometry, MIT |
| `moon-oracle` | Moon oracle / 月相祭司 | Crescent crown, silver locks, indigo sleeves, floor-length pleated robe | Original procedural geometry, MIT |
| `laurel-ranger` | Laurel ranger / 月桂游侠 | Copper braid, laurel circlet, leaf-cut mantle, short tunic, laced boots | Original procedural geometry, MIT |
| `styx-warden` | Styx warden / 冥河守卫 | Ivory mask, asymmetric spiked pauldrons, amethyst armor, torn river cloak | Original procedural geometry, MIT |
| `naruto` | Naruto / 鸣人 | Sun-blond spikes, steel headband plate, black shoulder yoke, bandaged forearms | Original procedural geometry, MIT |
| `sasuke` | Sasuke / 佐助 | Blue-black hair curtain and long fringe, high collar, violet rope belt, wrapped forearms | Original procedural geometry, MIT |
| `hatsune-miku` | Hatsune Miku / 初音未来 | Teal twin tails past the hips, headset, teal tie, pleated skirt, detached sleeves, thigh boots | Original procedural geometry, MIT |
| `daoist` | Daoist / 道士 | Pinned topknot, thin beard, crossed white collar, wide sleeves, floor-length indigo robe | Original procedural geometry, MIT |
| `lu-mingfei` | Lu Mingfei / 路明非 | Messy hair, navy uniform over a white shirt, hip satchel, trousers, white sneakers | Original procedural geometry, MIT |
| `uesugi-eriyi` | Uesugi Eriyi / 上杉绘梨衣 | Crimson hair to the thighs, red crown ribbon, white dress with a red sash and gold bell | Original procedural geometry, MIT |
| `iron-man` | Iron Man / 钢铁侠 | Sealed red-gold armor, gold faceplate, cyan eye slits, glowing arc reactor, repulsor palms | Original procedural likeness, MIT |
| `hulk` | Hulk / 绿巨人 | Gamma-green bulk, heavy brow and jaw, huge fists, torn purple trousers, bare green shins | Original procedural likeness, MIT |
| `thor` | Thor / 雷神 | Silver winged helm, long blond locks, red cape, silver chest discs, bracers and boots | Original procedural likeness, MIT |
| `captain-america` | Captain America / 美国队长 | Blue cowl with white temple wings, white chest star, red-white waist stripes, red boots | Original procedural likeness, MIT |

The bone height and hand positions stay fixed. Costumes extend the rest silhouette to roughly
40–42 px; each actor exposes its actual `x`, `y`, `w`, `h`, mask and pixels. Feet stay at `(0, 0)`.
Pixel clusters, four-step material shading, a one-pixel outline and upper-left lighting are shared.
Weapons belong to the action: changing character preserves contact frames and grip alignment.
Cloth, ornaments and hair use bone-local geometry and the body's depth buffer, including turns.

## Use and preview

```js
import { createAct, posed, stockActor, CHARACTERS } from "pixelfx";
import * as slash from "pixelfx/fx/melee/sword-slash";

const action = createAct(slash, { x: 100, y: 120, character: "ember-duelist" });
const restingActor = stockActor(2, "moon-oracle");
const pixels = posed({ weapon: "bow", fx: 10, fy: -24 }, "laurel-ranger");
```

`createFx` accepts the same `character` option for effects that declare `meta.actor`.
Body-bound effects use the selected rest mask, so recoloring, freezing and dissolving follow the costume.
The default and unknown IDs select the existing stand-in; the original small actor still works at scale 1.

The gallery offers keyboard-accessible character cards and remembers the choice in the URL:
`/gallery/index.html?character=ember-duelist`.
Effects without a body keep their normal preview; use “查看角色动作” to try the selected character.
The main gallery shows character cards and a live sword-action preview above its effect grid, including
when `source=new` is active. The selected character also applies to effect tiles and the detail dialog,
and is preserved in the `character` URL parameter. Character selection and the effect source filter
are independent. The effect dialog also exposes the same selection under “character”.

```sh
node tools/characters.mjs --gif
node tools/act.mjs melee/sword-slash --character ember-duelist
node tools/act.mjs melee/sword-slash --character moon-oracle --sheet
node --test tests/characters.test.mjs
npm run build:web
```

The roster and animated previews are generated under `records/characters/`; acted sheets go under
`records/act/` with the character ID in the filename. The sheets contain the full performance, including
the character, target and effect; use nearest-neighbour filtering. Source lives in
`src/core/characters.js`, `src/core/costume.js` and the shared `rig.js`.

This character selection runs in the portable JavaScript runtime and H5 previews. Existing Cocos VFX
atlases contain the effect alone; use an acted sheet when a Cocos game needs the baked character performance.
