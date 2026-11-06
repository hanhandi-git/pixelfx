---
name: pixelfx-character
description: Design and add original action characters to a pixelfx checkout — CHARACTERS entries, eight-step material ramps, bone-local costume geometry, named-character likeness cues without copied sprite art, pose and hit compatibility, i18n labels, roster/lineup previews and gallery verification. Use when asked to add, redesign or debug a playable character, actor, costume or cast member (e.g. Naruto, Miku, a knight, an idol, Iron Man) in a pixelfx checkout.
license: MIT
metadata:
  runtime: Node 18 or newer; npm; a terminal large enough for the ASCII material map; an image viewer for the roster/lineup PNGs.
---

# pixelfx action characters

A pixelfx character is **data plus a procedural costume**, never an imported sprite:

1. An entry in `CHARACTERS` (`src/core/characters.js`) supplies `id`, `name`, `label`, `role`,
   `accent`, `style`, `desc` and eight four-step colour ramps.
2. A branch in `costume(S, look, api)` (`src/core/costume.js`) draws bone-local 3D primitives in the
   character's `style`, rasterized into the shared skeleton's z-buffer.
3. The skeleton, hit timing, weapon grips, masks and action states stay shared. Never change bone
   lengths or hand positions for one character.

Read `docs/CHARACTERS.md` in the checkout for the public contract. Keep the library image-free:
no downloaded sprites, logos, faces or traced artwork. Named characters get **likeness cues only** —
hair silhouette, palette, clothing construction, a signature accessory — drawn from primitives.

This skill assumes the `pixelfx` skill's art direction: readable silhouette, hard ramps, one-pixel
outline, upper-left light, 3/4 view.

## Before drawing

1. Work in the user's pixelfx checkout; read its `AGENTS.md`. Keep `src/core/` engine-independent.
2. Look at the current cast and costs: `node tools/characters.mjs` writes
   `records/characters/roster.png` and `lineup.png`. Open them. The rig is ~38 px tall and drawn at
   3–4× in the roster; design for that size, not for a 128 px illustration.
3. Count `CHARACTERS.length`; it decides the roster grid (`cols`, `lineCols`) and the test expectation.
4. Run `node --test tests/characters.test.mjs` once before changing anything. Five tests must pass;
   the second one rejects two characters with the same rest silhouette.

## The design brief (write this before code)

For each character, fix these seven lines. If a line is empty, the silhouette will be generic.

- **Read at 2×**: three to five cues a viewer can name without colour. *Spiky blond crown + forehead
  plate + orange collar*; *wide shoulder mass + huge fists + torn knee-length pants*.
- **Focal point**: the one place the eye lands (arc reactor, chest star, winged helm, mask).
- **Palette**: which of the eight ramps carries the costume (cloth vs gold vs leather), the accent
  colour, and the two extremes (lightest highlight, darkest shadow).
- **Coverage**: what the base body wears underneath. The base torso is cloth, upper arms/forearms and
  shins are skin, feet are leather, hands are skin. Bare arms and legs are a design choice; cover
  them explicitly if the character wears sleeves, trousers or boots.
- **Side/back**: what shows at z = ±3: a cape, a hair curtain, twin tails, a satchel, a skirt panel.
- **Signature detail**: one mechanical or symbolic piece (reactor, star, bell, headband plate, winged
  helm) that survives at 1×.
- **Closure rule**: the shared gold clasp/sash/cuffs are gated to the original mythic styles. A new
  style must draw its own belt, collar, sash or zipper; never rely on the shared accents.

## Workflow

### 1. Add the CHARACTERS entry

Append after the last character, before `]);`:

```js
{ id: "iron-man", name: "Iron Man", label: "钢铁侠", role: "红金动力甲 · 方舟反应炉", accent: "#e8402f", style: "sentinel",
  desc: "One sentence: the silhouette and the focal prop.",
  skin: ["#...", "#...", "#...", "#..."],
  cloth: [...], hair: [...], gold: [...], leather: [...], bone: [...], lining: [...], glow: [...] },
```

- `id` is kebab-case, stable and used in URLs/effects.
- `label` is the user-facing Chinese name for named characters; `role` is a short `A · B` line.
- All eight ramps are required, light → dark. `bone` also colours white cloth; `lining` carries
  coloured cloth/insets; `glow` carries irises and emissive dots. Keep hue families consistent.
- `desc` is one sentence, English, no marketing.

### 2. Add the costume branch

Find the end of the `else if` chain in `costume(S, look, api)` and add a branch keyed by the new
`style`. The available helpers are:

| Helper | Signature | Use |
|---|---|---|
| `head/ball(f, v, radii, mat)` | ellipsoid centred at `v` in frame `f`, radii `[x,y,z]` | volumes: helmets, sleeves, hair masses |
| `line/bone(f, a, b, ra, rb, mat)` | tapered tube between two points | arms, legs, straps, hair locks, spikes |
| `face/panel(f, points, mat)` | flat polygon in frame-local coordinates | skirts, capes, emblems, plates |
| `cape(length, width, mat)` | predefined back cape with gold clasp | full-length capes |

Work in this order; each step is visible before the next:

1. **Silhouette**: hair/helmet mass, shoulder line, skirt/cape/tails, footwear. Check it against the
   existing cast's rest mask; if it matches another character, exaggerate the outer mass, not the
   inner detail.
2. **Coverage**: tubes that replace skin with cloth/metals. Make covering tubes one step *larger*
   than the base geometry (base upper arm ≈1.65, forearm ≈1.45, shin ≈1.7, thigh ≈2.5); radius 2.0+
   reliably wins.
3. **Closure**: collar, belt, sash, zipper, buckle — the thing that makes the costume one garment.
4. **Focal detail**: place it last, in front, with enough radius to survive (see rules below).
5. **Trim**: hems, cuffs, stripes, pleats, seams. Trim is 1 px; keep it sparse.

### 3. Preview with the ASCII material map

The roster is too small to debug; the ASCII map prints one letter per pixel and labels every
material, so you can see hidden hair, skin leaks and invisible glow without an image reader.

```bash
node skills/pixelfx-character/references/ascii-preview.mjs iron-man rest
node skills/pixelfx-character/references/ascii-preview.mjs hulk cast
```

Letters: `s` skin, `c` cloth, `h` hair, `g` gold, `l` leather, `b` bone, `n` lining, `*` glow,
`#` ink; lowercase = light ramp steps, uppercase = darkest step, `?` = a colour outside the ramps.
A character's signature element must appear as its letter. If the eye/emblem/reactor is absent, it
is occluded or sub-pixel — fix it before rendering the roster.

Iterate in the poses that matter: `rest` (portrait), `cast` (arms up, hands in front), `sword`
(grip), `turn` (side/back). A costume that reads at rest can lose its back half at `cast`.

### 4. Tests and cast art

```bash
node --test tests/characters.test.mjs
npm test
node tools/characters.mjs
```

The silhouette test uses `CHARACTERS.length - 1`, so adding a character needs no test edit — but it
does require a genuinely distinct rest silhouette. Then check the roster grid: the tool uses
`cols = 5` for 15 characters, `cols = 6` for 12/11. Set `cols`/`lineCols` and widen `lineW` when the
4× sprite no longer fits (sprite width = frame width × scale + margins).

### 5. Labels and docs

- `gallery/i18n.js`: add `CHARACTER.en[id] = [display name, "cue · cue"]` and the `ja` pair.
- `docs/CHARACTERS.md`: one table row with the silhouette/materials and the source line
  (`Original procedural likeness, MIT` for named characters).
- `tools/characters.mjs`: add a signature stance to `stances` so the lineup shows the character's
  action (weapon, cast, smash, guard), not only the rest pose.

### 6. Verify in the gallery

Start the local server (`node tools/serve.mjs 8099`), open
`http://localhost:8099/gallery/?character=<id>`, and check:

- the cast row has `CHARACTERS.length` cards;
- the new card selects, the role line shows the right label and weapon;
- switching language updates the label (zh/en/ja);
- no console errors and the canvas is non-blank.

`gallery/index.html` is the current cast UI; older checkouts may have a workbench page. Use whichever
the checkout ships.

### 7. Commit and deploy

Stage only the character files (`src/core/characters.js`, `src/core/costume.js`, `gallery/i18n.js`,
`docs/CHARACTERS.md`, `tools/characters.mjs`). Do not stage `records/`, `dist/` or unrelated
worktree changes. Follow the checkout's `AGENTS.md` for the deploy workflow.

## Geometry rules that decide whether it reads

The full table lives in [references/costume-cookbook.md](references/costume-cookbook.md). The rules
that cause most failures:

- **Coordinates**: x forward (face direction), y up, z sideways; at the default 3/4 turn (~36°),
  `screen x ≈ 0.809x − 0.588z`. Positive z shifts the sprite left; negative z right. World y is
  `bone Y − local y`; the head centre is near world y −34.2, chest −27.1, pelvis −19.7, feet 0.
- **Material indices**: 3 skin, 4 cloth, 5 hair, 6 gold, 7 leather (and eye whites), 8 glow (irises,
  emissive dots), 9 bone (white cloth, silver, teeth), 10 lining (insets, sashes, red/cyan cloth).
- **Depth**: every primitive is rasterized into the body's z-buffer. "Draw it later" does not mean
  "on top"; the forward coordinate does. A ring at x 3.15 is hidden by a larger disc whose front
  reaches x 3.4. Layer emissive details front-to-back with increasing x and decreasing radii.
- **Sub-pixel**: a radius below ~0.5 can miss every pixel centre. Critical 1 px features (glow eyes,
  chest star points, headband plate) need radii ≈0.6–0.9 or thick tapered lines; thin 0.15 tips
  disappear.
- **Skin leaks**: base arms/legs/feet are skin/leather. Covering tubes must be larger than the base.
  Helmet/face seams expose a cheek strip; add a red/gold cheek plate or enlarge the cap rather than
  accepting a skin line around a sealed helmet.
- **Surface-following trim**: the chest front is x ≈3.0 at the sternum, ≈2.2 at the collarbone,
  ≈3.3 at the belly. A constant-x panel floats at the top; tilt panels (`x = 3.3 − (y−1.7)·0.22`) or
  keep emblems small and forward.
- **Frames**: `head`, `neck`, `chest`, `pelvis`, `upperN/F`, `foreN/F`, `thighN/F`, `shinN/F`,
  `footN/F`. `handN/F` are not costume frames; draw fists at the far end of the forearm (x ≈7–8).
  Shins/feet are along +x from the knee; feet are not a separate vertical frame.
- **Height is fixed**: do not make a character "taller". Mass comes from z radii, bigger fists and
  shoulder balls; a hulk reads as 18–20 px wide, not 45 px tall.

## Likeness without copying

Build from construction, not from a picture: the shape of the hair mass, the part line, the collar
height, the belt hardware, one prop. A blond spiky crown + forehead plate reads as Naruto; a red
helmet + gold faceplate + cyan chest dot reads as Iron Man. Do not reproduce logos, printed
graphics, exact costume patterns or traced faces. Keep the note in `docs/CHARACTERS.md` and the
skill's MIT framing.

## Failure → cause → fix

| Symptom | Cause | Fix |
|---|---|---|
| Long hair/twin tails invisible | z inside torso/arm, or chain stops at the shoulder | push z to ±(4–9), chain 12–15 segments with shrinking radii, draw past the hips |
| Glow eyes/reactor missing | eye radius <1 px, or behind a mask/disc | move forward (x +0.3), increase radius to 0.4+, layer ring → colour → white core |
| Helmet shows a skin line | base cheek outside the mask's z radius | enlarge the cap/faceplate, or add a cheek plate in the helmet colour |
| Character looks like the base | only flat trim was added | add outer mass: hair cap, shoulder balls, skirt/cape, boots; compare the ASCII outline |
| Chest star is a 2×2 blob | thin tapered lines at 3/4 | assemble the star from five thick triangles + a pentagon, or use a 3×3 designed badge |
| Two characters fail the silhouette test | same outer contour | change the outermost 1–2 px (cape, tails, skirt, shoulder), not the palette |
| New style misses belt/collar | shared accents are gated to old styles | draw the closure in the new branch |
| Costume loses arms in `cast` | sleeves/balls are inside the torso at z 0 | place shoulder volumes at the upper-arm frame, not the chest |

## Finish checklist

- [ ] All eight ramps, four steps, ordered light → dark.
- [ ] Rest silhouette differs from every existing character (test passes).
- [ ] Coverage: no unintended skin on arms, shins or feet; no skin seam around a sealed head.
- [ ] Signature element visible as its material letter at rest and in `cast`.
- [ ] No sub-pixel critical detail; no geometry outside the character bounds.
- [ ] `node --test tests/characters.test.mjs`, `npm test`, `npm run check`, `npm run build:web` pass.
- [ ] `node tools/characters.mjs` regenerated; roster grid fits; lineup stance shows the character.
- [ ] i18n en/ja + docs row added.
- [ ] Gallery: card present, selectable, 0 console errors; labels in zh/en/ja.
- [ ] Only task files staged; report the commit and any server/deploy limitation.
