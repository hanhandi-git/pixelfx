// Bone-local costume meshes, rasterized by rig.js into the same depth buffer as the body.
// A small interface keeps the geometry independent of the rig solver and painter.
export function costume(S, look, api) {
  const { ball, bone, panel } = api, { B } = S;
  const head = (v, r, m = 5) => ball("head", v, r, m);
  const line = (f, a, b, ra, rb, m) => bone(f, a, b, ra, rb, m);
  const face = (f, pts, m) => panel(f, pts, m);
  const cape = (length, spread, mat = 4) => {
    face("chest", [[-2.5, 3, -4], [-2.5, 3, 4], [-7, -length + 2, spread], [-8.5, -length, 1], [-9, -length + 3, -spread]], mat);
    face("chest", [[-2.7, 3, 1.8], [-7.1, -length + 2, spread - 0.5], [-8.6, -length, 1]], 10);
    line("chest", [-3, 3, 3.8], [-7.2, -length + 2, spread], 0.38, 0.28, 6);
  };
  const skirt = (length, spread) => {
    // Three pleats, a split hem and a gold belt; the pelvis drives the garment.
    face("pelvis", [[3.1, 1, -3.9], [3.1, 1, 4], [3.8, -length, spread], [4.2, -length - 1, 1.2], [3.4, -length + 1.5, -spread]], 4);
    face("pelvis", [[3.4, 0, -1], [3.5, 0, 1.4], [4.5, -length - 0.8, 1.1], [4.1, -length + 1, -1.2]], 10);
    line("pelvis", [3.4, 0.7, -4.2], [3.4, 0.7, 4.2], 0.55, 0.55, 6);
    line("pelvis", [3.5, -length + 0.4, -spread], [3.9, -length, -1], 0.35, 0.35, 6);
    line("pelvis", [4.4, -length - 1, 1.2], [3.9, -length, spread], 0.35, 0.35, 6);
  };

  // Face planes, nose, brow and a single warm eye highlight. The far side is occluded naturally.
  ball("head", [2.4, -0.4, 0], [0.65, 0.8, 1.1], 3);
  for (const side of [-1, 1]) {
    head([2.35, 0.35, side * 1.55], [0.5, 0.52, 0.6], 7);
    head([2.72, 0.35, side * 1.55], [0.23, 0.23, 0.35], 8);
    line("head", [2.4, 1, side * 1.2], [2, 1.3, side * 2.2], 0.32, 0.22, 5);
  }
  head([-0.9, 1.7, 0], [2.7, 2.3, 3.0]);
  // The mythic cast shares a gold clasp, a diagonal chest sash and wrist cuffs. The newer looks
  // draw their own closures (zippers, ribbons, wraps), so those accents stay off them.
  if (["duelist", "oracle", "ranger", "warden"].includes(look.style)) {
    line("chest", [3.3, 3.4, 3.4], [3.9, -2.6, -3], 0.6, 0.6, 6);
    ball("chest", [3.7, 2.3, 2.5], [0.6, 0.8, 0.8], 8);
    for (const f of ["foreN", "foreF"]) line(f, [5.2, 0, 0], [6.3, 0, 0], 1.45, 1.4, 6);
  }

  if (look.style === "duelist") {
    cape(16, 6.5);
    skirt(6.8, 5.3);
    for (const [x, y, z] of [[-2.5, 4.1, -1.8], [-0.2, 4.7, 0], [1.5, 4.1, 1.4]])
      line("head", [x - 1, 1.7, z], [x, y, z], 1.35, 0.15, 5);
    ball("upperN", [0.8, 0, 0], [2.1, 2.5, 2.8], 6);
    line("head", [1.1, 1.8, 2.7], [2.3, 1.5, 1.7], 0.4, 0.3, 6);
    face("chest", [[2.7, 4, 2], [4, 2, 4], [3.3, -3, 2.5], [2.5, -1, 1.2]], 4);
    // A wind-swept forelock and a long, forked scarf make the swordsman's profile distinct.
    line("head", [1.2, 2.3, 1.9], [3.3, 3.5, 1.3], 1, 0.15, 5);
    line("head", [1, 1.7, 2.6], [2.5, 1.6, 2.2], 0.4, 0.4, 4);
    face("chest", [[-2.8, 2.9, 5], [-9.5, 0.6, 6.2], [-14, -2.6, 5.7], [-10, -0.4, 5.5], [-13, 1.7, 5.8]], 4);
    line("chest", [-3, 2.8, 5.2], [-10, 0.8, 6.4], 0.35, 0.25, 10);
  } else if (look.style === "oracle") {
    cape(23, 7.8, 10);
    skirt(17, 7.2);
    // A crescent crown opens above the face; silver locks frame both cheeks.
    for (const s of [-1, 1]) {
      line("head", [0, 2, s * 2.8], [-0.2, 4.3, s * 4], 0.75, 0.65, 6);
      line("head", [-0.2, 4.3, s * 4], [0.3, 6.8, s * 3.5], 0.65, 0.1, 6);
      line("head", [-1.8, 1.4, s * 2.5], [-2.2, -7, s * 3.4], 1.1, 0.45, 5);
    }
    head([2.4, 1.9, 0], [0.5, 0.9, 0.5], 8);
    line("pelvis", [4.1, -4, 0], [4.5, -13, 0], 0.35, 0.25, 6);
    for (const f of ["upperN", "upperF"]) {
      face(f, [[0, -1.5, -1.8], [0, 1.8, 1.8], [7, 4.2, 2.7], [7.4, -3.5, -2]], 4);
      line(f, [7, -3.3, -2], [7, 4.1, 2.7], 0.4, 0.4, 6);
    }
  } else if (look.style === "ranger") {
    cape(10, 9);
    skirt(6, 5.2);
    // A segmented braid trails the head, rather than being painted on the torso.
    for (let i = 0; i < 6; i++) head([-3.2 - i * 0.6, -0.8 - i * 1.7, 1.2 + (i % 2) * 0.5], [1.15 - i * 0.09, 1.2, 1], 5);
    head([-6.4, -10.5, 1.5], [0.8, 1.2, 1.1], 6);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
      head([0.3 + i * 0.85, 2.9 - i * 0.3, s * (2.5 - i * 0.35)], [0.85, 0.4, 0.6], 6);
    for (const f of ["shinN", "shinF"]) for (let i = 3; i <= 6; i += 1.5)
      line(f, [i, -1.5, -0.6], [i + 0.5, -1.4, 0.8], 0.26, 0.26, 6);
    face("chest", [[1.5, 3.8, -5], [0, 4.5, 5.5], [-3, -2, 7], [-2, -5, 3]], 4);
  } else if (look.style === "warden") {
    cape(22, 9, 10);
    skirt(10, 6.5);
    ball("upperN", [0.4, 0, 0], [3.2, 3.4, 3.4], 6);
    ball("upperF", [0.4, 0, 0], [2.6, 2.6, 2.8], 6);
    for (const s of [-1, 1]) {
      line("upperN", [-0.5, 1.4, s * 2], [-2.2, 4.2, s * 2.5], 1.1, 0.15, 9);
      line("head", [-1, 2.4, s * 2.5], [-2.8, 5.6, s * 3.5], 0.85, 0.1, 9);
    }
    ball("head", [1.2, -0.2, 0], [2.4, 2.9, 2.7], 9);
    for (const s of [-1, 1]) {
      head([3.1, 0.6, s * 1.6], [0.5, 0.65, 0.85], 7);
      head([3.5, 0.65, s * 1.6], [0.24, 0.28, 0.5], 8);
    }
    line("head", [3.3, -1.4, -0.7], [3.3, -2.2, 0.7], 0.3, 0.3, 7);
    ball("chest", [3.9, 0, 0], [0.65, 1.4, 1.3], 8);
    for (let i = 0; i < 3; i++) {
      line("chest", [3.7, -0.5 - i * 1.4, -3.1], [4.2, -1.3 - i * 1.4, 3.3], 0.4, 0.4, 6);
    }
  } else if (look.style === "shinobi") {
    // Sun-blond spikes fan up and back from a bigger hair cap; the forehead plate sits on the skull.
    head([-1, 1.6, 0], [2.9, 2.4, 3.1]);
    for (const [a, b, r] of [
      [[0.3, 2.4, 0], [1.3, 5.6, 0.3], 1.35],
      [[-1.1, 2.7, 0.2], [-1.9, 5.3, -0.4], 1.2],
      [[-2.2, 2, 0], [-3.8, 4.2, 0.5], 1.15],
      [[0, 2.1, -2.2], [0.4, 4.2, -3.7], 0.95],
      [[0, 2.1, 2.1], [0.6, 4.1, 3.4], 0.95],
    ]) line("head", a, b, r, 0.12, 5);
    for (const s of [-1, 1]) {
      line("head", [1.3, 2.4, s * 1.2], [2.5, 3.9, s * 1.7], 0.8, 0.12, 5);
      line("head", [2.6, 0.95, 0], [1.45, 0.95, s * 2.3], 0.5, 0.38, 10);
    }
    ball("head", [2.55, 0.95, 0], [0.42, 0.62, 1.35], 6);
    ball("head", [2.83, 0.95, 0], [0.18, 0.26, 0.5], 7);
    // High orange collar, black shoulder yoke, white zipper and a hip pouch.
    ball("neck", [-0.35, 0.15, 0], [1.6, 1.05, 1.95], 4);
    for (const f of ["upperN", "upperF"]) ball(f, [0.9, 0, 0], [2.2, 2.6, 2.9], 7);
    line("chest", [2.5, 3.8, 0], [3.32, 0.4, 0], 0.22, 0.2, 9);
    line("chest", [3.32, 0.4, 0], [3.15, -2.8, 0], 0.2, 0.18, 9);
    for (const f of ["thighN", "thighF"]) line(f, [1, 0, 0], [8, 0, 0], 2.75, 2.25, 7);
    for (const f of ["foreN", "foreF"]) {
      line(f, [0.6, 0, 0], [7, 0, 0], 1.55, 1.3, 9);
      for (const x of [2.2, 4.2, 6]) line(f, [x, 1.05, 0], [x + 0.35, 1.05, 0.9], 0.2, 0.2, 7);
    }
    ball("pelvis", [-2.2, -0.6, 2.2], [1.4, 1.7, 1.2], 7);
    ball("pelvis", [-2.2, 0.6, 3.1], [0.5, 0.4, 0.25], 6);
    line("pelvis", [2.6, 0.9, -3.6], [3.4, 0.9, 2.2], 0.42, 0.42, 7);
  } else if (look.style === "avenger") {
    // A blue-black curtain of hair to the chest, two long face-framing locks and a high collar.
    line("head", [-2.2, 1.2, 0], [-2.8, -5.6, 0], 1.9, 0.9, 5);
    for (const s of [-1, 1]) {
      line("head", [-2.4, 1.6, s * 1.6], [-3, -4.8, s * 2.6], 1.3, 0.5, 5);
      line("head", [1.4, 2, s * 2.2], [1.7, -4, s * 2.6], 0.9, 0.3, 5);
    }
    line("head", [1, 2.9, -1], [2.4, 0.9, -1.8], 1.1, 0.3, 5);
    for (const [a, b, r] of [
      [[-0.6, 2.6, -0.6], [-0.9, 4.6, -1], 1.15],
      [[-2, 2, -0.8], [-3.2, 3.8, -1.2], 0.95],
      [[-2.6, 1.2, 1.2], [-3.8, 2.6, 1.8], 0.8],
    ]) line("head", a, b, r, 0.12, 5);
    ball("neck", [-0.3, 0.15, 0], [1.55, 1.15, 2], 4);
    line("chest", [2.45, 4, 0], [3.25, 0.4, 0], 0.18, 0.17, 6);
    line("chest", [3.25, 0.4, 0], [3.05, -2.8, 0], 0.17, 0.15, 6);
    // A thick violet rope belt with a knot and two hanging ends.
    line("pelvis", [3.35, 0.7, -3.8], [3.4, 0.7, 3.8], 0.5, 0.5, 10);
    ball("pelvis", [3.5, 0.6, 1.1], [0.7, 0.6, 0.6], 10);
    line("pelvis", [3.4, 0.3, 0.9], [2.8, -4.6, 1.9], 0.28, 0.22, 10);
    line("pelvis", [3.3, 0.2, -0.4], [2.5, -3.4, -1.9], 0.26, 0.2, 10);
    for (const f of ["thighN", "thighF"]) line(f, [1, 0, 0], [8, 0, 0], 2.7, 2.2, 7);
    for (const f of ["foreN", "foreF"]) {
      line(f, [0.5, 0, 0], [7, 0, 0], 1.5, 1.3, 9);
      for (const x of [2, 4.4]) line(f, [x, 1.0, 0], [x + 0.3, 1.0, 0.85], 0.18, 0.18, 7);
    }
  } else if (look.style === "idol") {
    // A straight teal fringe and two tails that fall from high ties to the hips.
    head([-1, 1.6, 0], [2.85, 2.4, 3.05]);
    for (const [z, x] of [[-1.9, 1.4], [0, 1.8], [1.9, 1.4]])
      line("head", [x, 2.7, z], [x + 0.7, 1.0, z * 1.05], 0.8, 0.35, 5);
    for (const s of [-1, 1]) {
      line("head", [1.5, 1.5, s * 2.3], [1.1, -3.2, s * 2.7], 0.8, 0.3, 5);
      head([-0.4, 2.4, s * 2.6], [1.15, 1, 1.1], 5);
      line("head", [-0.4, 2.6, s * 2.8], [-0.9, 4.2, s * 5.2], 0.95, 0.9, 5);
      for (let i = 0; i < 9; i++)
        head([-1 - i * 0.1, 3.4 - i * 1.8, s * (9 + i * 0.05)], [1.1 - i * 0.03, 1.25, 1.05], 5);
      head([-0.4, 2.5, s * 2.8], [0.55, 0.45, 0.55], 7);
      head([0.2, 0.5, s * 2.65], [0.65, 0.9, 0.55], 6);
      head([0.55, 0.5, s * 2.85], [0.25, 0.3, 0.2], 8);
    }
    line("head", [0.75, 0.1, 2.5], [2.3, -1.1, 2.0], 0.14, 0.12, 6);
    ball("head", [2.35, -1.15, 1.95], [0.18, 0.18, 0.18], 8);
    // Dark sleeveless top, teal tie, pleated skirt and detached sleeves.
    ball("neck", [-0.3, 0.1, 0], [1.5, 1.0, 1.9], 7);
    line("neck", [1.0, 0.6, -1.5], [1.0, 0.6, 1.5], 0.3, 0.3, 4);
    line("chest", [2.7, 3.5, 0], [3.45, 0.2, 0], 0.5, 0.45, 4);
    line("chest", [3.45, 0.2, 0], [3.25, -2.4, 0], 0.42, 0.4, 4);
    for (const f of ["upperN", "upperF"]) {
      line(f, [2.2, 0, 0], [7.8, 0, 0], 1.9, 1.7, 7);
      line(f, [2.2, 0, 0], [2.9, 0, 0], 1.95, 1.9, 4);
    }
    for (const f of ["foreN", "foreF"]) {
      line(f, [0.3, 0, 0], [7.1, 0, 0], 1.6, 1.35, 7);
      line(f, [6.6, 0, 0], [7.2, 0, 0], 1.5, 1.4, 4);
    }
    face("pelvis", [[3.0, 1.2, -4], [3.0, 1.2, 4], [4.4, -6.6, 6.4], [4.7, -7.2, 0], [4.3, -6.6, -6.4]], 4);
    for (const z of [-5.2, -2.6, 0, 2.6, 5.2]) line("pelvis", [3.2, 0.9, z], [4.5, -6.7, z * 1.18], 0.2, 0.16, 10);
    line("pelvis", [3.9, -6.1, -6], [4.6, -6.9, 0], 0.28, 0.24, 10);
    line("pelvis", [4.6, -6.9, 0], [4.0, -6.1, 6], 0.24, 0.28, 10);
    for (const f of ["thighN", "thighF"]) {
      line(f, [1.2, 0, 0], [8.2, 0, 0], 2.75, 2.2, 7);
      line(f, [1.2, 0, 0], [2, 0, 0], 2.8, 2.7, 4);
    }
    for (const f of ["footN", "footF"]) line(f, [-1.2, -1.35, 0], [3.6, -1.6, 0], 0.55, 0.45, 4);
  } else if (look.style === "daoist") {
    // A pinned topknot, long side locks and a thin white beard frame the face.
    head([-1.5, 3.5, 0], [1.15, 1.4, 1.15], 5);
    line("head", [-1, 3.4, -1.8], [-2.4, 4.8, 1.4], 0.2, 0.16, 6);
    line("head", [-2.4, 4.8, 1.4], [-2.9, 2.2, 2.2], 0.22, 0.14, 6);
    for (const s of [-1, 1]) line("head", [-1.2, 1.6, s * 2.4], [-2.2, -4.6, s * 2.8], 0.9, 0.35, 5);
    line("head", [2.5, -1.6, 0], [3.5, -3.8, 0], 0.7, 0.5, 5);
    line("head", [3.5, -3.8, 0], [2.9, -7.2, 0], 0.5, 0.2, 5);
    // Crossed white collar over indigo, a pale sash and a long pleated robe with a white hem.
    line("chest", [1, 4.2, -2.1], [3.25, 1.2, 0], 0.3, 0.28, 9);
    line("chest", [1, 4.2, 2.1], [3.25, 1.2, 0], 0.3, 0.28, 9);
    line("chest", [3.25, 1.2, 0], [3.2, -2.2, 0], 0.26, 0.22, 9);
    // A small two-tone taiji medallion hangs on the chest.
    ball("chest", [3.6, 0.8, 0.2], [0.45, 0.55, 0.55], 9);
    ball("chest", [3.76, 0.55, 0.5], [0.32, 0.34, 0.34], 7);
    line("chest", [2.7, 3.4, 0], [3.55, 1.3, 0.2], 0.18, 0.16, 10);
    face("pelvis", [[3.1, 1.2, -4.2], [3.1, 1.2, 4.2], [4.6, -16, 7], [4.9, -16.8, 0], [4.5, -16, -7]], 4);
    face("pelvis", [[3.2, 1.1, -2.2], [3.2, 1.1, 2.2], [4.7, -16.2, 2.4], [4.8, -16.4, 0], [4.6, -16.2, -2.4]], 10);
    line("pelvis", [3.3, 1, -4.3], [3.4, 1, 4.3], 0.55, 0.55, 10);
    ball("pelvis", [3.5, 1, 1], [0.55, 0.6, 0.55], 6);
    line("pelvis", [3.4, 0.7, 0.8], [3.1, -5.6, 1.8], 0.26, 0.2, 10);
    line("pelvis", [4.05, -15.8, -6.8], [4.9, -16.5, 0], 0.42, 0.38, 9);
    line("pelvis", [4.9, -16.5, 0], [4.25, -15.8, 6.8], 0.38, 0.42, 9);
    // Wide sleeves: cloth wrapped round the arm, a deep drape under it and a white cuff.
    for (const f of ["upperN", "upperF"]) {
      line(f, [1.2, 0, 0], [7.6, 0, 0], 2.05, 1.75, 4);
      face(f, [[1.2, -2, -2.2], [1.2, 2.4, 2.2], [6.8, 2.8, 2.6], [7, -5, -2.6]], 4);
      line(f, [6.8, -4.6, -2.4], [6.8, 2.6, 2.5], 0.32, 0.32, 9);
    }
    for (const f of ["foreN", "foreF"]) line(f, [6.5, 0, 0], [7.4, 0, 0], 1.55, 1.4, 9);
  } else if (look.style === "student") {
    // Messy short hair, a navy uniform jacket over a white shirt, and a school satchel.
    head([-1, 1.6, 0], [2.8, 2.35, 3]);
    for (const [a, b, r] of [
      [[0.4, 2.4, 0.2], [1.8, 4.8, 0.6], 1.2],
      [[-1.2, 2.7, -0.6], [-2.4, 5.2, -1.2], 1.15],
      [[-2.4, 2.2, 0.8], [-4.2, 3.8, 1.4], 0.95],
      [[-0.2, 2.5, -2.3], [-0.6, 4.6, -3.4], 0.95],
      [[0.6, 2.3, 2.2], [1.4, 3.9, 3.2], 0.85],
    ]) line("head", a, b, r, 0.12, 5);
    for (const [z, x] of [[-1.8, 1.6], [0, 2], [1.8, 1.6]])
      line("head", [x, 2.6, z], [x + 0.5, 1.2, z * 1.05], 0.75, 0.4, 5);
    line("chest", [1.2, 4.2, -1.6], [3.35, 1.4, 0], 0.4, 0.35, 9);
    line("chest", [1.2, 4.2, 1.6], [3.35, 1.4, 0], 0.4, 0.35, 9);
    line("chest", [3.35, 1.4, 0], [3.4, -1.6, 0], 0.42, 0.36, 9);
    line("chest", [3.4, 2.0, 0], [3.4, 0.4, 0], 0.34, 0.3, 7);
    ball("chest", [3.45, 1.7, 1.5], [0.35, 0.4, 0.25], 6);
    face("pelvis", [[3, 1.4, -4], [3, 1.4, 4], [3.6, -2.2, 4.6], [3.8, -2.8, 0], [3.6, -2.2, -4.6]], 4);
    // A school satchel hangs at the near hip, clear of the jacket hem.
    ball("pelvis", [4.2, -2.2, 3.6], [1.5, 1.9, 1.2], 7);
    face("pelvis", [[3.9, -0.6, 2.6], [3.9, -0.6, 4.9], [4.9, -1.6, 4.6], [4.9, -1.6, 2.8]], 7);
    ball("pelvis", [4.5, -2.2, 4.5], [0.32, 0.4, 0.25], 6);
    for (const f of ["thighN", "thighF"]) line(f, [1, 0, 0], [8, 0, 0], 2.7, 2.2, 7);
    for (const f of ["footN", "footF"]) {
      line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.65, 1.35, 9);
      line(f, [-1.2, -1.5, 0], [3.8, -1.7, 0], 0.5, 0.4, 7);
    }
  } else if (look.style === "priestess") {
    // Straight crimson hair to the thighs, a red ribbon and a white dress with a red sash.
    head([-1.1, 1.6, 0], [2.85, 2.45, 3.05]);
    for (const [z, x] of [[-1.9, 1.4], [-0.5, 1.9], [0.7, 1.9], [1.9, 1.4]])
      line("head", [x, 2.9, z], [x + 0.3, 1.05, z * 1.05], 0.8, 0.42, 5);
    // A straight crimson curtain falls behind the shoulders to the thighs.
    for (const s of [-1, 1]) {
      head([-3.3, 1.4, s * 1.6], [1.8, 1.5, 1.6], 5);
      for (let i = 0; i < 15; i++)
        head([-3.6 - i * 0.2, 0.2 - i * 1.75, s * (1.35 + i * 0.05)], [1.8 - i * 0.02, 1.2, 1.5], 5);
      line("head", [1, 2, s * 3.2], [0.2, -7, s * 5.6], 1.15, 0.85, 5);
    }
    // A red bow sits on the crown between the long tails.
    for (const s of [-1, 1]) head([-0.2, 3.9, s * 1.5], [0.95, 0.6, 0.55], 10);
    ball("head", [-0.2, 3.8, 0], [0.5, 0.45, 0.45], 10);
    line("head", [-1.1, 3.6, 0.4], [-2.4, 1.6, 1.2], 0.35, 0.16, 10);
    ball("neck", [-0.3, 0.1, 0], [1.45, 0.95, 1.85], 4);
    line("neck", [1.1, 0.3, -1.2], [1.1, 0.3, 1.2], 0.3, 0.3, 10);
    ball("neck", [1.4, -0.1, 1.1], [0.45, 0.4, 0.4], 10);
    line("chest", [1, 4, -1.4], [3.3, 2.1, 0.5], 0.2, 0.18, 10);
    ball("chest", [3.62, 2, 0.8], [0.38, 0.42, 0.38], 6);
    face("pelvis", [[3, 1.2, -4], [3, 1.2, 4], [4.4, -9, 6.4], [4.7, -9.6, 0], [4.3, -9, -6.4]], 4);
    line("pelvis", [3.3, 1.2, -4.1], [3.5, 1.2, 4.1], 0.5, 0.5, 10);
    ball("pelvis", [3.6, 1.2, 1], [0.6, 0.55, 0.5], 10);
    line("pelvis", [3.5, 0.8, 0.8], [3.1, -5, 1.6], 0.25, 0.2, 10);
    line("pelvis", [3.45, 0.8, -0.4], [3, -4.2, -1.4], 0.22, 0.18, 10);
    line("pelvis", [4, -8.7, -6.2], [4.7, -9.4, 0], 0.3, 0.3, 9);
    line("pelvis", [4.7, -9.4, 0], [4.2, -8.7, 6.2], 0.3, 0.3, 9);
    for (const f of ["shinN", "shinF"]) line(f, [0.8, 0, 0], [7.8, 0, 0], 2.05, 1.55, 9);
    for (const f of ["footN", "footF"]) {
      line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.6, 1.3, 9);
      line(f, [1.4, -0.25, -1.5], [1.4, -0.25, 1.5], 0.24, 0.24, 10);
    }
  } else if (look.style === "sentinel") {
    // Sealed red-and-gold armor: a gold faceplate, cyan eye slits, arc reactor and palm repulsors.
    head([-0.7, 1.75, 0], [3, 2.45, 3.3], 4);
    head([2, -0.25, 0], [1.5, 1.9, 3], 6);
    head([1.5, 0.2, 2.5], [1.1, 1.7, 0.75], 4);
    for (const s of [-1, 1]) line("head", [3.5, 0.6, s * 0.4], [3.5, 0.6, s * 1.3], 0.28, 0.2, 8);
    line("head", [3.45, -1.15, -0.45], [3.45, -1.15, 0.45], 0.2, 0.2, 7);
    ball("neck", [-0.2, 0.1, 0], [1.55, 1, 1.9], 4);
    ball("chest", [3.3, 1.2, 0], [0.4, 0.9, 0.9], 9);
    ball("chest", [3.55, 1.2, 0], [0.3, 0.72, 0.72], 10);
    ball("chest", [3.75, 1.2, 0], [0.22, 0.45, 0.45], 8);
    line("chest", [3.3, -1, -2.2], [3.3, -1, 2.2], 0.28, 0.28, 6);
    line("chest", [3.3, -2.4, -2], [3.3, -2.4, 2], 0.26, 0.26, 6);
    for (const f of ["upperN", "upperF"]) {
      ball(f, [0.6, 0, 0], [2.6, 3, 3.1], 4);
      line(f, [1.2, 0, 0], [7.5, 0, 0], 2, 1.7, 4);
    }
    for (const f of ["foreN", "foreF"]) {
      line(f, [0.6, 0, 0], [7.2, 0, 0], 1.65, 1.45, 6);
      ball(f, [7.3, 0, 0], [1.35, 1.35, 1.35], 4);
      ball(f, [8.3, 0.2, 0], [0.35, 0.4, 0.4], 8);
      line(f, [0.5, 0, 0], [0.9, 0, 0], 1.7, 1.65, 7);
    }
    for (const f of ["thighN", "thighF"]) line(f, [1, 0, 0], [8, 0, 0], 2.75, 2.3, 4);
    for (const f of ["shinN", "shinF"]) {
      line(f, [0.4, 0, 0], [7.8, 0, 0], 2.05, 1.6, 4);
      ball(f, [0.7, 0, 0], [1.9, 2, 2], 6);
    }
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.65, 1.35, 6);
  } else if (look.style === "gamma") {
    // Gamma bulk: chest, shoulders and fists swell over the skeleton; the purple pants end at the knee.
    ball("chest", [0.4, 0.6, 0], [4.3, 4.7, 6.4], 3);
    ball("neck", [0, 0.2, 0], [2.2, 1.6, 2.8], 3);
    for (const f of ["upperN", "upperF"]) {
      ball(f, [0.4, 0, 0], [3.5, 3.9, 4.4], 3);
      line(f, [1, 0, 0], [7.4, 0, 0], 3.1, 2.7, 3);
    }
    for (const f of ["foreN", "foreF"]) {
      line(f, [0, 0, 0], [7.2, 0, 0], 2.8, 2.4, 3);
      ball(f, [7.3, 0, 0], [3, 3, 3], 3);
    }
    line("pelvis", [3.9, -2.4, -4.6], [3.9, -2.4, 4.6], 0.8, 0.8, 4);
    for (const f of ["thighN", "thighF"]) line(f, [0.6, 0, 0], [7.5, 0, 0], 3.6, 3.2, 4);
    for (const f of ["shinN", "shinF"]) line(f, [0, 0, 0], [7.6, 0, 0], 2.8, 2.3, 3);
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 2, 1.7, 3);
    // A heavy brow and jaw under short, dark hair.
    head([-1, 1.9, 0], [2.8, 2.3, 3.05], 5);
    for (const [a, b, r] of [
      [[0.4, 2.3, 0], [1.6, 4.2, 0.4], 1],
      [[-1.2, 2.5, -0.4], [-2.4, 4, -0.8], 0.9],
      [[-0.2, 2.4, -2.2], [-0.6, 3.8, -3.2], 0.8],
    ]) line("head", a, b, r, 0.1, 5);
    ball("head", [2.55, 0.9, 0], [0.5, 0.45, 1.6], 3);
    ball("head", [2.5, -1.35, 0], [0.65, 0.6, 1.15], 3);
    for (const s of [-1, 1]) ball("head", [2.4, -0.5, s * 1.1], [0.4, 0.6, 0.5], 3);
  } else if (look.style === "asgardian") {
    // Blond locks under a silver winged helm, a red cape and silver discs on the dark tunic.
    cape(18, 7.5, 10);
    head([-1, 1.9, 0], [2.85, 2.3, 3.1], 9);
    head([-2.2, 0.8, 0], [1.6, 2.6, 2.9], 5);
    for (const s of [-1, 1]) {
      line("head", [-1.2, 1.4, s * 2.4], [-1.6, -4.8, s * 2.9], 1.15, 0.65, 5);
      line("head", [0.3, 2.1, s * 2.6], [0, 3.9, s * 3.7], 0.55, 0.08, 6);
      line("head", [0.35, 2, s * 2.7], [0.9, 3.5, s * 4.1], 0.5, 0.1, 6);
      line("head", [0.3, 1.9, s * 2.7], [-0.5, 3.5, s * 4.2], 0.45, 0.08, 6);
    }
    for (const z of [-2.2, 0, 2.2]) ball("chest", [3.1, 1.6, z], [0.55, 0.7, 0.7], 9);
    for (const s of [-1, 1]) ball("chest", [2.9, 3.7, s * 2.6], [0.6, 0.5, 0.5], 6);
    for (const f of ["foreN", "foreF"]) {
      line(f, [4.6, 0, 0], [7.2, 0, 0], 1.55, 1.45, 9);
      line(f, [4.6, 0, 0], [5, 0, 0], 1.6, 1.55, 6);
    }
    for (const f of ["shinN", "shinF"]) line(f, [6.6, 0, 0], [7.4, 0, 0], 2.05, 1.9, 9);
    line("pelvis", [3.3, 1, -4.1], [3.3, 1, 4.1], 0.5, 0.5, 6);
    ball("pelvis", [3.6, 1, 0.6], [0.5, 0.55, 0.5], 6);
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.65, 1.4, 7);
  } else if (look.style === "patriot") {
    // Blue cowl with white temple wings, a white chest star, red-white waist stripes and red boots.
    head([-0.9, 1.8, 0], [2.85, 2.35, 3.05], 4);
    for (const s of [-1, 1]) {
      line("head", [0.4, 2.3, s * 2.7], [0.4, 3.5, s * 3.4], 0.35, 0.1, 9);
      line("head", [0.5, 2.2, s * 2.8], [1.1, 3.1, s * 3.5], 0.3, 0.1, 9);
    }
    // A white five-point star built from tapered spikes.
    // A five-point star assembled from five points and a central pentagon, tilted to the chest.
    const star = (i) => {
      const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.3 : 2.4;
      const y = 1.7 + Math.sin(a) * r;
      return [3.3 - (y - 1.7) * 0.22, y, Math.cos(a) * r];
    };
    for (let i = 0; i < 5; i++) face("chest", [star(i * 2), star(i * 2 + 1), star((i * 2 + 9) % 10)], 9);
    face("chest", [star(1), star(3), star(5), star(7), star(9)], 9);
    for (let i = 0; i < 5; i++) {
      const z = -2.2 + i * 1.1;
      line("pelvis", [3.2, 0.9, z], [3.1, -3.2, z * 0.95], 0.55, 0.55, i % 2 ? 9 : 10);
    }
    line("pelvis", [3.25, 1.3, -3.8], [3.25, 1.3, 3.8], 0.45, 0.45, 7);
    ball("pelvis", [3.55, 1.3, 0.8], [0.45, 0.45, 0.4], 6);
    for (const f of ["thighN", "thighF"]) line(f, [1, 0, 0], [8, 0, 0], 2.75, 2.25, 4);
    for (const f of ["shinN", "shinF"]) {
      line(f, [0.4, 0, 0], [7.8, 0, 0], 2.05, 1.65, 4);
      line(f, [6.6, 0, 0], [7.6, 0, 0], 2, 1.9, 9);
    }
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.7, 1.4, 10);
    for (const f of ["foreN", "foreF"]) {
      ball(f, [7.2, 0, 0], [1.35, 1.35, 1.35], 4);
      line(f, [5.8, 0, 0], [6.4, 0, 0], 1.4, 1.35, 10);
    }
  } else if (look.style === "sun-goddess") {
    // 天照命: a gold sun disc stands behind the head, black hair falls past the waist, a white haori over a
    // vermilion hakama, the Yata mirror at the chest.
    face("head", [[-5, -6.4, -5.6], [-5, -6.4, 5.6], [-5, 0.4, 8], [-5, 8.6, 0], [-5, 0.4, -8]], 6);
    face("head", [[-4.8, -5, -4.2], [-4.8, -5, 4.2], [-4.8, 0.2, 6], [-4.8, 6.6, 0], [-4.8, 0.2, -6]], 4);
    for (const a of [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4]) {
      const cy = 1.6 + Math.sin(a) * 7.2, cz = Math.cos(a) * 9.2;
      line("head", [-5, 1.6 + Math.sin(a) * 8.6, Math.cos(a) * 10.4], [-5, cy, cz], 0.22, 0.12, 6);
    }
    head([-1, 1.7, 0], [2.9, 2.4, 3.05]);
    for (const s of [-1, 1]) {
      for (let i = 0; i < 9; i++)
        head([-3.5 - i * 0.12, -1.2 - i * 2.1, s * (1.4 + i * 0.14)], [1.5, 1.15, 1.3], 5);
      line("head", [0.6, 2.3, s * 2.6], [-1.6, -1.2, s * 3.2], 0.9, 0.4, 5);
      line("head", [2.1, 2.2, s * 2.2], [2.7, -0.6, s * 2.4], 0.7, 0.25, 5);
    }
    // crossed gold hairpins and a vermilion sun mark on the brow
    line("head", [-0.6, 3.6, -2.2], [2.2, 4.8, 0.4], 0.24, 0.16, 6);
    line("head", [-0.6, 3.6, 2.2], [2.2, 4.8, -0.4], 0.24, 0.16, 6);
    head([2.08, 1.62, 0], [0.26, 0.42, 0.42], 10);
    // Yata mirror: a gold disc with a bright face, hung from a cord
    ball("chest", [3.7, 1.2, 0.4], [0.55, 1, 1], 6);
    ball("chest", [3.95, 1.2, 0.4], [0.3, 0.72, 0.72], 8);
    line("chest", [4.1, 0.4, 0.4], [4.1, 2, 0.4], 0.14, 0.14, 6);
    line("neck", [0.6, 0.2, -1.4], [3.6, 2.1, 0.4], 0.14, 0.14, 6);
    // white haori: wide sleeves with a gold edge
    for (const f of ["upperN", "upperF"]) {
      line(f, [0.8, 0, 0], [7.4, 0, 0], 1.9, 1.7, 4);
      face(f, [[0.8, -1.8, -2], [0.8, 2, 2], [6.4, 2.4, 2.6], [6.6, -4.6, -2.4]], 4);
      line(f, [6.5, -4.4, -2.2], [6.5, 2.3, 2.4], 0.3, 0.3, 6);
    }
    line("chest", [3.2, 3.4, 0], [2.4, -2.2, 0.8], 0.28, 0.24, 9);
    // vermilion hakama with gold seams and the gold sash
    face("pelvis", [[3.1, 1.2, -4.2], [3.1, 1.2, 4.2], [4.5, -11, 6.6], [4.8, -11.6, 0], [4.4, -11, -6.6]], 10);
    for (const z of [-4.6, -1.6, 1.6, 4.6]) line("pelvis", [3.3, 0.9, z], [4.6, -10.8, z * 1.35], 0.2, 0.16, 6);
    line("pelvis", [3.25, 1.2, -4.2], [3.35, 1.2, 4.2], 0.55, 0.55, 6);
    for (const f of ["shinN", "shinF"]) line(f, [0.8, 0, 0], [7.8, 0, 0], 2.05, 1.55, 9);
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.6, 1.3, 7);
  } else if (look.style === "moon-god") {
    // 月读命: a tall black kanmuri with a silver crescent, a long straight mane, an indigo sokutai and a white obi.
    face("head", [[-0.6, 2.4, -1.9], [-0.6, 2.4, 1.9], [0.8, 7.6, 2.1], [0.8, 7.6, -2.1]], 5);
    line("head", [0.9, 7.5, -2.2], [0.9, 7.5, 2.2], 0.32, 0.32, 6);
    line("head", [-0.2, 2.3, -2], [-0.2, 2.3, 2], 0.3, 0.3, 6);
    line("head", [1.2, 4.4, -1.7], [1.9, 6.1, 0], 0.34, 0.24, 8);
    line("head", [1.9, 6.1, 0], [1.2, 7.8, 1.7], 0.3, 0.2, 8);
    // a silver crescent opens around the back of the head, in the same plane as Amaterasu's sun disc
    for (let i = 0; i <= 9; i++) {
      const a = -1.35 + (i / 9) * 2.7;
      head([-4.4, 2.6 + Math.sin(a) * 5.2, Math.cos(a) * 5.2], [0.5, 0.95, 0.95], 8);
      if (i % 3 === 0) head([-4.5, 2.6 + Math.sin(a) * 6.4, Math.cos(a) * 6.4], [0.3, 0.5, 0.5], 5);
    }
    face("head", [[-3.4, 1.2, -3.4], [-3.4, 1.2, 3.4], [-4, -8, 3.2], [-4.2, -11, 0], [-4, -8, -3.2]], 5);
    for (const s of [-1, 1]) line("head", [1, 2, s * 2.7], [0.2, -5.2, s * 3.2], 0.8, 0.3, 5);
    line("chest", [1, 4.2, -2], [3.3, 1.2, 0], 0.3, 0.28, 10);
    line("chest", [1, 4.2, 2], [3.3, 1.2, 0], 0.3, 0.28, 10);
    line("chest", [3.3, 1.2, 0], [3.2, -2.4, 0], 0.26, 0.22, 10);
    for (const f of ["upperN", "upperF"]) {
      line(f, [1.2, 0, 0], [7.6, 0, 0], 2.05, 1.75, 4);
      face(f, [[1.2, -2, -2.2], [1.2, 2.4, 2.2], [6.8, 2.8, 2.6], [7, -5, -2.6]], 4);
      line(f, [6.8, -4.6, -2.4], [6.8, 2.6, 2.5], 0.32, 0.32, 10);
    }
    face("pelvis", [[3.1, 1.2, -4.2], [3.1, 1.2, 4.2], [4.6, -16, 7], [4.9, -16.8, 0], [4.5, -16, -7]], 4);
    line("pelvis", [3.25, 1.2, -4.2], [3.35, 1.2, 4.2], 0.6, 0.6, 10);
    ball("pelvis", [4.4, 0.2, 1.2], [0.4, 0.55, 0.55], 8);
    ball("chest", [3.55, 1.6, -0.8], [0.32, 0.4, 0.4], 8);
    for (const f of ["shinN", "shinF"]) line(f, [0.8, 0, 0], [7.8, 0, 0], 2, 1.5, 9);
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.6, 1.3, 7);
  } else if (look.style === "storm-god") {
    // 须佐之男: a wild mane, bare shoulders, a torn storm cloak and the shimenawa rope across his chest.
    head([-1, 1.7, 0], [2.9, 2.3, 3.1]);
    for (const [a, b, r] of [
      [[0.4, 2.4, 0], [1.8, 5.8, 0.4], 1.3],
      [[-1.2, 2.8, -0.4], [-2.8, 6, -1], 1.25],
      [[-2.4, 2.2, 0.6], [-4.8, 4.4, 1.4], 1.1],
      [[-0.2, 2.5, -2.4], [-0.8, 5, -3.6], 1],
      [[0.4, 2.4, 2.3], [0.8, 4.6, 3.6], 0.95],
    ]) line("head", a, b, r, 0.12, 5);
    for (const s of [-1, 1]) {
      line("head", [-2.6, 0.6, s * 2.2], [-4.2, -4.4, s * 2.8], 1.2, 0.5, 5);
      line("head", [1.2, 1.6, s * 2.6], [0.4, -2.6, s * 3.1], 0.8, 0.3, 5);
    }
    line("chest", [2.6, 2.8, -2.6], [3.2, 1.2, 0], 0.35, 0.3, 3);
    line("chest", [2.6, 2.8, 2.6], [3.2, 1.2, 0], 0.35, 0.3, 3);
    line("chest", [1.8, 0.6, -2.2], [2.6, -1.4, 0], 0.25, 0.22, 3);
    // the torn cloak hangs off the far shoulder only
    face("chest", [[-2.6, 3, 1.6], [-2.6, 3, 4.6], [-7.4, -8.6, 6], [-8.4, -10, 2.4], [-7.6, -8.2, 1.2]], 4);
    ball("upperF", [0.4, 0, 0], [2.6, 2.8, 3], 4);
    // shimenawa: a thick vermilion rope, twisted bands, a knot and two hanging tassels
    line("chest", [3.4, 2.6, -3.4], [3.8, -1.6, 3.2], 0.7, 0.7, 10);
    for (let i = 0; i < 4; i++) line("chest", [3.45, 2.2 - i * 1.1, -3.3], [3.85, 2 - i * 1.1, 3.1], 0.22, 0.22, 4);
    line("chest", [3.9, -1, 2.8], [3.2, -6.4, 3.2], 0.45, 0.2, 10);
    line("chest", [3.6, -0.6, 2.2], [2.6, -5.4, 2.6], 0.4, 0.18, 10);
    for (const f of ["foreN", "foreF"]) line(f, [1, 0, 0], [7, 0, 0], 1.65, 1.4, 7);
    face("pelvis", [[3.1, 1.2, -4.4], [3.1, 1.2, 4.4], [4.4, -7.4, 6.2], [4.8, -8, 0], [4.3, -7.4, -6.2]], 4);
    line("pelvis", [3.25, 1.2, -4.4], [3.35, 1.2, 4.4], 0.65, 0.65, 10);
    line("pelvis", [3.4, 0.8, 1.4], [3.0, -4.6, 2], 0.3, 0.22, 10);
    for (const f of ["shinN", "shinF"]) line(f, [0.8, 0, 0], [7.8, 0, 0], 2.05, 1.6, 7);
    for (const f of ["footN", "footF"]) line(f, [-1, -0.7, 0], [3.6, -1.1, 0], 1.6, 1.3, 7);
    // a fork of lightning still crawling on the far shoulder
    line("upperF", [2, 1.4, 0], [4, 2.2, 0], 0.2, 0.18, 8);
    line("upperF", [4, 2.2, 0], [5, 1.2, 0], 0.18, 0.16, 8);
    line("upperF", [4, 2.2, 0], [4.6, 3.2, 0.4], 0.14, 0.12, 8);
  }
}
