# Weapons

Twenty selectable weapons share the portable rig, the character costumes and its depth buffer. Twelve are
melee weapons; eight are thrown weapons with their own ranged actions. Every model is original
code-authored geometry under this repository's MIT license.

| ID | Weapon | Class | Action |
|---|---|---|---|
| `sword` | 长剑 / Sword | melee | `melee/sword-slash` |
| `dagger` | 匕首 / Dagger | melee | `melee/dagger-flurry` |
| `staff` | 金箍棍 / Banded staff | melee | `melee/staff-combo` — two sweeps in opposite directions |
| `spear` | 长矛 / Spear | melee | `melee/spear-sweep` |
| `lance` | 骑士长枪 / Knight lance | melee | `melee/lance-thrust` — two-handed thrust with a pierce ring |
| `holy-sword` | 圣剑 / Holy sword | melee | `melee/holy-sword-cleave` — gold crescent, cross and rising stars |
| `katana` | 太刀 / Katana | melee | `melee/katana-draw` — thin horizontal draw cut |
| `war-mace` | 重钉锤 / War mace | melee | `melee/mace-crush` — crushing blow, chips and ground shock |
| `rapier` | 刺剑 / Rapier | melee | `melee/rapier-lunge` — precise needle thrust |
| `kusanagi` | 云从剑 / 天丛云剑 / Kusanagi | melee | `kami/ame-no-murakumo` — one rising cut that carves a seam through a sea of murakumo |
| `totsuka` | 十拳剑 / Totsuka | melee | `kami/susanoo-thunder` — raised blade draws a forked thunder pillar onto the target |
| `kunai` | 苦无 / Kunai | **thrown** | `thrown/kunai-throw` — end-over-end throw that embeds in the target |
| `powder-bomb` | 火药弹 / Powder bomb | **thrown** | `thrown/powder-bomb-throw` — fuse, bounce and compact blast |
| `boomerang` | 回旋镖 / Boomerang | **thrown** | `thrown/boomerang-throw` — outbound and return passes before the catch |
| `talisman` | 符箓 / Talisman | **thrown** | `thrown/talisman-throw` — fluttering paper, vermilion seal and warding light |
| `flying-sword` | 飞剑 / Flying sword | **thrown** | `thrown/flying-sword-throw` — one jian splits into five that wheel in a ring and stab in turn |
| `binding-silk` | 缚仙绫 / Binding silk | **thrown** | `thrown/binding-silk-throw` — a hauling sash: one turn per pull, four turns, then a gold seal |
| `soul-bell` | 摄魂铃 / Soul bell | **thrown** | `thrown/soul-bell-throw` — tolled at the chest, underarm lob, three sound rings and soul-fire |
| `pear-needles` | 梨花针 / Pear-blossom needles | **thrown** | `thrown/pear-needles-throw` — a half-turn into a sleeve flick, five needles at five heights |

The native figure is about 38 px tall. Weapons are measured from the fist in the same pixel units;
models distinguish material faces, edge highlights, wraps and guards at one-pixel scale. The lance
has a split pennon; the holy sword has a wing guard and inset gold line; the kunai has a hollow ring
pommel; the thrown set adds a fuse bomb, a curved boomerang,
a red paper seal, a short jade-pommel jian, a rolled sash, a bronze bell and a pinch of needles. The
shinto set adds a straight cloud-guarded tsurugi, a broad Totsuka with a vermilion grip and dragon guard,
and a bronze Yata mirror cut with an eight-point star. Filtering is nearest neighbour and the grip is the pivot for standalone weapon icons.

## Classes

The armory is one catalogue split into `melee` and `thrown` classes (`WEAPON_CLASSES`, `ARMORY`,
`MELEE_WEAPONS`, `THROWN_WEAPONS`). A weapon's `fx` points at the action that belongs to its class:
melee weapons keep contact at the held tip, while thrown weapons leave the hand and schedule their own
flight and contact cues. The boomerang exposes outbound and return cues, the pear-blossom needles land in
three staggered ticks, and the others have one primary hit.
Select a weapon with `weaponOf(id)`; `meleeWeaponOf` and `thrownWeaponOf` narrow by class.

## Preview and use

The gallery's “武器” selector groups “近战武器” and “投掷武器”. It changes the dedicated action in the
character preview, independently of the effect source filter. Character, weapon and source are preserved
in the URL: `/gallery/index.html?source=new&character=ember-duelist&weapon=kunai`.

The effect grid also has a separate `thrown` category (`?source=new#thrown`), so thrown actions can be
browsed without going through the moves list.

The gallery has the same selector and previews the matching action.
Other effects keep their authored weapons and contact timing.

```js
import { posed, createAct, ARMORY, weaponOf } from "pixelfx";
import * as kunaiThrow from "pixelfx/fx/thrown/kunai-throw";

const action = createAct(kunaiThrow, { x: 100, y: 120, character: "moon-oracle" });
const pixels = posed({ weapon: "kunai", fx: 10, fy: -24, sa: -0.3 }, "laurel-ranger");
// Long equipment also declares its second grip; `two: true` uses it in the solver.
```

```sh
node tools/weapons.mjs --gif --sheet
node tools/act.mjs thrown/kunai-throw --character ember-duelist
node tools/render.mjs melee/holy-sword-cleave --sheet
node --test tests/weapons.test.mjs
```

`records/weapons/` contains `armory.png`, one transparent icon per weapon, `weapons.json` with dimensions
and grip coordinates, optional animated action previews, and optional acted PNG/JSON sheets. Acted
sheets contain the character, target and VFX; their metadata carries the actual pivot and weapon ID.
Raw VFX exports still contain only the effect. Source geometry and selection metadata live in
`src/core/weapons.js`; the melee attack choreography and VFX recipes live in `src/fx/melee/_weapons.js`,
and each thrown action lives in its matching `src/fx/thrown/*-throw.js` module.

Melee actions use distinct choreography rather than a shared pose track. Dagger keeps the elbows close
and alternates short wrist strikes. The staff opens the shoulders for a low sweep and reverse recovery.
Lance and rapier move the feet and hips into a forward lunge. The holy sword and mace raise the hands
above the head before the release, with different impact weight. Katana uses a compact sheath-like draw
and a flat horizontal cut. Each melee attack aligns its hit with the weapon tip and retains windup,
contact freeze and recovery. Thrown actions do not share a windup: the kunai draws past the ear, the powder
bomb lobs from a crouch, the boomerang cocks low and snaps the hand back for the catch, the talisman leaves an
open palm, and the xianxia set keeps a different body each. The flying sword is never thrown at all: the hands
form a seal and point while five swords leave in a ring. The silk is hauled two-handed like a rope, one turn per
pull. The bell is tolled at the chest and then tossed underarm out of a half-spin. The needles leave a half-turn
that unwinds into the sleeve flick. Their hit cues are timed to the projectile reaching the target, not to a
held tip; returning weapons and multi-hit volleys may expose more than one cue before recovery.
