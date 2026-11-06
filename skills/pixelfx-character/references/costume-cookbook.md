# Costume cookbook

Concrete numbers and recipes for `src/core/costume.js`. Everything is bone-local:
**x forward** (the face looks toward +x), **y up**, **z sideways** (+z is the viewer's left in the
default 3/4 pose). The rig projects at roughly 36°:

```
screen x ≈ 0.809·x − 0.588·z          (+z → sprite left, −z → sprite right)
screen y ≈ world y = boneWorldY − local y
```

Bone world y (feet at 0, negative is up): head ≈ −34.2, chest ≈ −27.1, pelvis ≈ −19.7. A head-local
`y = 3` is around world −37; a chest-local `y = 1.6` is around world −28.7.

## Base body under the costume

| Part | Geometry (bone-local) | Colour |
|---|---|---|
| pelvis | ball `[0,−0.2]` r `[2.8,2.4,3.8]` | cloth 4 |
| waist | sweep pelvis→chest r 2.6→2.9 | cloth 4 |
| chest | ball `[0.2,0.8]` r `[3.1,3.9,4.9]` (`warden` 3.8/4.3/5.7, `oracle` 2.9/3.8/4.7) | cloth 4 |
| neck | tube r 1.15→1.05 | skin 3 |
| head | ball `[0,0]` r `[2.7,3,2.6]` + jaw `[0.65,−0.5]` r `[2.2,2.4,2.2]` | skin 3 |
| hair | cap `[−0.9,1.7]` r `[2.7,2.3,3.0]` + brow locks | hair 5 |
| eyes | whites `[2.35,0.35,±1.55]` r 0.5 (mat 7), iris `[2.72,0.35,±1.55]` r 0.23 (mat 8) | — |
| upper arm | shoulder ball r 2.0 at the upper frame + sweep r 1.65→1.25 | skin 3 |
| forearm | sweep r 1.45→1.05, hand ball r 1.5 at the far end | skin 3 |
| thigh | sweep r 2.5→1.7 + knee r 1.5 | cloth 4 |
| shin | sweep r 1.7→1.15 | leather 7 |
| foot | tube `[−1.2,−0.6]`→`[4,−1.1]`, r 1.4→1.0 | leather 7 |

Covering a base part means drawing a **larger** primitive over it, e.g. a sleeve tube r 2.0+ over the
1.65 upper arm, or a boot tube r 2.0 over the 1.7 shin. A same-size tube flickers with z-fighting.

## Frames

`head`, `neck`, `chest`, `pelvis`, `upperN`, `upperF`, `foreN`, `foreF`, `thighN`, `thighF`, `shinN`,
`shinF`, `footN`, `footF`. `handN/handF` are not costume frames (they are body parts), so draw a fist
or glove at the far end of the forearm, `x ≈ 7.2–7.6`. `fore`/`shin` run along **+x from the elbow/knee**
toward the wrist/ankle; `foot` runs along +x from the heel. The near side is `N` (z positive), the far
side `F` (z negative) at the default turn.

## Materials

| Index | Ramp | Used for |
|---|---|---|
| 3 | `skin` | skin, bare arms/shins/feet |
| 4 | `cloth` | main garment, trousers, sleeves, capes |
| 5 | `hair` | hair, fur, beards, dark cloth accents |
| 6 | `gold` | brass/gold trim, buckles, wings, medals |
| 7 | `leather` | boots, belts, straps, eye whites, dark joints |
| 8 | `glow` | irises, reactor cores, lamp dots, magic eyes |
| 9 | `bone` | white cloth, silver, teeth, stars, plates |
| 10 | `lining` | coloured insets, sashes, petticoats, red/cyan cloth |

Material choice is read through the ramp's four steps: light values read as highlights, dark values
as folds. Do not use `glow` for large surfaces; it blooms.

## Chest surface x (for emblems, abs, stripes)

The bare chest is an ellipsoid at `(0.2, 0.8)` r `(3.1, 3.9, 4.9)`. Its front at mid-line:

```
xFront(y) = 0.2 + 3.1·sqrt(1 − ((y − 0.8)/3.9)²)
```

| Chest-local y | 3.3 | 2.5 | 1.6 | 0.8 | 0 | −1.0 | −2.4 |
|---|---|---|---|---|---|---|---|
| front x | 2.58 | 2.83 | 3.23 | 3.30 | 3.10 | 2.95 | 1.97 |

An emblem at x 3.3 floats 0.7 at the collarbone and 0.2 at the sternum. Either keep the emblem low
(waist/sternum) or tilt the panel: `x = 3.3 − (y − 1.6)·0.22`, which follows the upper chest closely.
The pelvis front is ≈3.2–3.4 at the belt line; waist stripes at x 3.2 are safe between y 0.9 and −3.

## Recipes

### Sealed helmet + faceplate (armour, Iron Man)

```js
// Red cap covers the hair, but not the face.
head([-0.7, 1.75, 0], [3.0, 2.45, 3.3], 4);
// Gold faceplate is a forward ellipsoid over the face; it must sit in front of the nose (x ≈3.05).
head([2.0, -0.25, 0], [1.5, 1.9, 3.0], 6);
// Eye slits: a thick line in front of the faceplate, radius ≥0.2, or they vanish.
for (const s of [-1, 1]) line("head", [3.5, 0.6, s * 0.4], [3.5, 0.6, s * 1.3], 0.28, 0.2, 8);
line("head", [3.45, -1.15, -0.45], [3.45, -1.15, 0.45], 0.2, 0.2, 7); // mouth slit
// A red cheek plate fills the seam between cap and faceplate; without it a skin strip shows.
head([1.5, 0.2, 2.5], [1.1, 1.7, 0.75], 4);
```

Rule of thumb: the faceplate must reach x ≈3.4; the base nose reaches 3.05, the jaw 2.85. Eyes at
x 3.5 are unambiguously in front. If a skin line remains at the temple, add the cheek plate in the
cap colour rather than enlarging the gold (a gold band around the whole head looks like a helmet
liner).

### Reactor / glowing core

Layer outward with increasing x **and decreasing radius**, or the outer ring disappears:

```js
ball("chest", [3.3, 1.2, 0], [0.4, 0.9, 0.9], 9);   // silver rim
ball("chest", [3.55, 1.2, 0], [0.3, 0.72, 0.72], 10); // cyan disc
ball("chest", [3.75, 1.2, 0], [0.22, 0.45, 0.45], 8);  // white-hot centre
```

The base chest front at y 1.2 is ≈3.2, so the rim only shows where it protrudes; keep the radii
ordered as above. If the centre disappears, it is behind the cyan disc — move it forward.

### Massive body (Hulk)

Do not try to gain height. Add width and depth:

```js
ball("chest", [0.4, 0.6, 0], [4.3, 4.7, 6.4], 3);       // barrel chest, +1.5 z over base
for (const f of ["upperN", "upperF"]) {
  ball(f, [0.4, 0, 0], [3.5, 3.9, 4.4], 3);              // deltoid
  line(f, [1, 0, 0], [7.4, 0, 0], 3.1, 2.7, 3);          // upper arm
}
for (const f of ["foreN", "foreF"]) {
  line(f, [0, 0, 0], [7.2, 0, 0], 2.8, 2.4, 3);
  ball(f, [7.3, 0, 0], [3.0, 3.0, 3.0], 3);               // fist
}
line("pelvis", [3.9, -2.4, -4.6], [3.9, -2.4, 4.6], 0.8, 0.8, 4); // purple waistband
```

The visible width is usually set by the **fists and forearms**, not the chest. Check the ASCII bounds:
the base is ~17–18 wide; the bulk reads at ~18–20 at rest, and the cast pose reaches ~28.

### Winged helm + cape (Thor)

```js
cape(18, 7.5, 10);                                  // red cape, lining inner face
head([-1, 1.9, 0], [2.85, 2.3, 3.1], 9);            // silver cap
head([-2.2, 0.8, 0], [1.6, 2.6, 2.9], 5);           // back hair mass
for (const s of [-1, 1]) {
  line("head", [-1.2, 1.4, s * 2.4], [-1.6, -4.8, s * 2.9], 1.15, 0.65, 5); // side locks
  line("head", [0.3, 2.1, s * 2.6], [0, 3.9, s * 3.7], 0.55, 0.08, 6);       // wing feather
  line("head", [0.35, 2.0, s * 2.7], [0.9, 3.5, s * 4.1], 0.5, 0.1, 6);
}
```

Wings are three tapered gold lines per side, rooted at the cap rim (y ≈2, z ≈2.6) and fanning up/out.
The near wing reads at screen −1…−2; the far wing +1…+2, so the silhouette reads as a crown from the
front. Side locks must reach z ≈±2.4 and y ≈−5 to clear the jaw and show against the cape.

### Five-point star / emblem

Thin tapered lines vanish at 3/4. Build the star from five triangles and a central pentagon, all in
the chest frame's `(y,z)` plane at a tilted x:

```js
const star = (i) => {
  const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.3 : 2.4;
  const y = 1.7 + Math.sin(a) * r;
  return [3.3 - (y - 1.7) * 0.22, y, Math.cos(a) * r];
};
for (let i = 0; i < 5; i++) face("chest", [star(i * 2), star(i * 2 + 1), star((i * 2 + 9) % 10)], 9);
face("chest", [star(1), star(3), star(5), star(7), star(9)], 9);
```

At 24 px a 2×3 px white star still reads if the colour contrast is high. If it is still not enough,
use a simpler 5-spike burst of thick lines (radius 0.9→0.3) instead of a mathematically exact star.

### Long hair, twin tails, skirts

- **Tails/hair curtain**: chain 12–15 balls/lines with decreasing radius; start at the crown/side
  (y ≈3), end at the hip (head-local y ≈−14) or the thighs (≈−22…−24). Push z to ±(4–9) so the mass clears the torso and the
  near arm. A tail inside the torso is invisible in the depth buffer.
- **Skirt/robe**: one or two `face` panels from the belt (y ≈1) to the hem (y ≈−9…−11, pelvis-local),
  plus a lining inner panel 0.5 forward and a belt line. A skirt is seen from the front, so make the
  outer panel 6–8 z wide; add 1 px hem lines.
- **Cape**: `cape(length, spread, mat)` already places the back panel and clasp; length 16–18 reaches
  the knees. The inner face is lining (10), so a red cape needs `lining` red.
- **Topknot/beard**: a bun at `[-1.2, 3.4]` and a beard chain from the chin `[2.5,-1.6]` forward/down.
  Use hair 5 for a grey beard; a bone-white beard merges with a white collar.

### Trim, wraps, stripes, pleats

- A belt is a line across the pelvis at y ≈1: `line("pelvis",[3.2,1,-4],[3.2,1,4],0.5,0.5,6)`.
- Waist stripes are alternating red/white vertical lines from y 0.9 to −3.2 at z −2.2…2.2; 5 stripes
  at 1.1 spacing read at 1×. The belt sits above them.
- Forearm bandages: a bone tube over the forearm (r 1.55/1.5) plus two thin darker wrap lines.
- Pleats: 3–4 short lines from the belt to the hem in the lining colour; keep them 0.2–0.3 wide.
- Abs/chest lines: gold lines at x ≈3.3, y −1 and −2.4, z ±2.2; they sit just in front of the chest.

## Debugging with the ASCII map

`references/ascii-preview.mjs <id> [rest|sword|cast|turn]` prints one letter per pixel with material
letters (`s c h g l b n * #`). Use it to answer:

- Is the signature element present as `*` / `b` / `g`? If not, it is occluded or sub-pixel.
- Does a skin letter appear where a sleeve/boot should be? Coverage tube too small.
- Does the silhouette differ from the base? Compare the outer `#` contour at rest.
- Is the back mass present? Run `turn` (yaw 2.4) and look for hair/cape on the far side.

Only then render the roster/lineup and look at the PNGs.

## Cost of getting it wrong

| Mistake | What the viewer sees |
|---|---|
| same-size covering tube | base skin bleeding through, flickering pixels |
| glow radius <0.4 | a plain face / missing reactor |
| emblem at x 3.3 near the collar | a white blob floating off the chest |
| twin tails at z 0 | no tails; the character loses its silhouette |
| thin star tips | a 2×2 white dot, not a star |
| skirt panel only at the front | a flat apron with no side mass |
| new style without closure | a shirt instead of a costume |
