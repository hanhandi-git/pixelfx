// Signed distance: negative inside, zero on the boundary, positive outside. Units are local art pixels.
// Boolean compositions preserve the silhouette/sign; their distances near joins are approximate.

function nonNegative(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and non-negative`);
}

function circle(cx, cy, r) {
  nonNegative(r, "radius");
  return (x, y) => Math.hypot(x - cx, y - cy) - r;
}

/** Axis-aligned box, centered at (cx, cy), with half-extents rx, ry. */
function box(cx, cy, rx, ry) {
  nonNegative(rx, "box half-width"); nonNegative(ry, "box half-height");
  return (x, y) => {
    const dx = Math.abs(x - cx) - rx, dy = Math.abs(y - cy) - ry;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
  };
}

function capsule(x0, y0, x1, y1, r) {
  nonNegative(r, "radius");
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
  return (x, y) => {
    const u = l2 ? Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l2)) : 0;
    return Math.hypot(x - x0 - dx * u, y - y0 - dy * u) - r;
  };
}

const union = (...shapes) => (x, y) => {
  let d = Infinity;
  for (const shape of shapes) d = Math.min(d, shape(x, y));
  return d;
};
const intersect = (...shapes) => (x, y) => {
  let d = -Infinity;
  for (const shape of shapes) d = Math.max(d, shape(x, y));
  return d;
};
const subtract = (a, b) => (x, y) => Math.max(a(x, y), -b(x, y));
const expand = (shape, amount) => (x, y) => shape(x, y) - amount;
const shell = (shape, width) => {
  nonNegative(width, "shell width");
  return (x, y) => Math.abs(shape(x, y)) - width / 2;
};
const translate = (shape, dx, dy) => (x, y) => shape(x - dx, y - dy);
function rotate(shape, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return (x, y) => shape(x * c + y * s, -x * s + y * c);
}
function scale(shape, k) {
  if (!(k > 0) || !Number.isFinite(k)) throw new RangeError("SDF scale must be finite and positive");
  return (x, y) => shape(x / k, y / k) * k;
}

// Exact squared Euclidean distance transform of feature pixel centers, O(w*h).
// Each 1D pass builds the lower envelope of parabolas, skipping infinite sites (including empty rows).
function distanceTransform(features, w, h) {
  const data = Float64Array.from(features, (v) => v ? 0 : Infinity);
  const n = Math.max(w, h), f = new Float64Array(n), out = new Float64Array(n);
  const sites = new Int32Array(n), cuts = new Float64Array(n + 1);
  const pass = (size) => {
    let last = -1;
    for (let q = 0; q < size; q++) {
      if (!Number.isFinite(f[q])) continue;
      let cut = -Infinity;
      while (last >= 0) {
        const v = sites[last];
        cut = ((f[q] + q * q) - (f[v] + v * v)) / (2 * (q - v));
        if (cut > cuts[last]) break;
        last--;
      }
      sites[++last] = q;
      cuts[last] = last === 0 ? -Infinity : cut;
      cuts[last + 1] = Infinity;
    }
    let k = 0;
    for (let q = 0; q < size; q++) {
      if (last < 0) { out[q] = Infinity; continue; }
      while (k < last && cuts[k + 1] < q) k++;
      out[q] = (q - sites[k]) ** 2 + f[sites[k]];
    }
  };
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = data[y * w + x];
    pass(h);
    for (let y = 0; y < h; y++) data[y * w + x] = out[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = data[y * w + x];
    pass(w);
    for (let x = 0; x < w; x++) data[y * w + x] = out[x];
  }
  return data;
}

/**
 * Bake a Painter-compatible binary mask {w,h,data}. Pixel centers are x+0.5,y+0.5.
 * Values are distance to opposite pixel centers minus 0.5, an approximation to the cell boundary.
 * Sampling is nearest-cell; outside the padded grid, extend the positive edge distance. An empty mask
 * returns +Infinity. Bake once per silhouette, not once per frame; later mask edits do not change it.
 */
function fromMask(mask, x = 0, y = 0) {
  const { w, h, data } = mask;
  if (!Number.isInteger(w) || w < 1 || !Number.isInteger(h) || h < 1 || !data || data.length !== w * h)
    throw new TypeError("mask needs positive integer w,h and w*h data cells");
  const W = w + 2, H = h + 2, inside = new Uint8Array(W * H);
  let count = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
    if (data[j * w + i]) { inside[(j + 1) * W + i + 1] = 1; count++; }
  if (!count) return () => Infinity;
  const toInside = distanceTransform(inside, W, H);
  const toOutside = distanceTransform(inside.map((v) => 1 - v), W, H);
  const distances = Float32Array.from(inside, (v, i) => v ? 0.5 - Math.sqrt(toOutside[i]) : Math.sqrt(toInside[i]) - 0.5);
  return (px, py) => {
    const ix = Math.floor(px - x) + 1, iy = Math.floor(py - y) + 1;
    const sx = Math.max(0, Math.min(W - 1, ix)), sy = Math.max(0, Math.min(H - 1, iy));
    return distances[sy * W + sx] + Math.hypot(ix - sx, iy - sy);
  };
}

/** Rasterize a shape to a binary mask for p.mask()/p.outline(); x,y are its local top-left. */
function toMask(shape, w, h, x = 0, y = 0) {
  if (!Number.isInteger(w) || w < 1 || !Number.isInteger(h) || h < 1)
    throw new RangeError("mask dimensions must be positive integers");
  const data = new Uint8Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
    data[j * w + i] = shape(x + i + 0.5, y + j + 0.5) <= 0 ? 1 : 0;
  return { w, h, data };
}

export const SDF = Object.freeze({ circle, box, capsule, union, intersect, subtract, expand, shell,
  translate, rotate, scale, fromMask, toMask });
