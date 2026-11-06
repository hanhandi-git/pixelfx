// Compile curves once, then sample by approximate arc length in local art pixels.
import { clamp, lerp, wrap } from "./math.js";

/** A quadratic Bezier curve, ready for createPath(curve). Points are [x, y]. */
export function quadraticBezier(a, b, c) {
  return (u) => {
    const v = 1 - u;
    return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0],
      v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]];
  };
}

/** A cubic Bezier curve, ready for createPath(curve). */
export function cubicBezier(a, b, c, d) {
  return (u) => {
    const v = 1 - u;
    return [v ** 3 * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u ** 3 * d[0],
      v ** 3 * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u ** 3 * d[1]];
  };
}

/**
 * Compile a point list or curve(u: 0..1) to an arc-length lookup. `samples` controls curve accuracy.
 * sample(u) returns { x, y, tx, ty, nx, ny }; u is distance / length, clamped on open paths and wrapped
 * on closed ones. at(distance) uses pixels. Zero-length paths stay put with tangent [1, 0].
 */
export function createPath(source, { samples = 128, closed = false } = {}) {
  if (!Number.isInteger(samples) || samples < 1) throw new RangeError("samples must be a positive integer");
  const input = typeof source === "function"
    ? Array.from({ length: samples + 1 }, (_, i) => source(i / samples)) : source;
  if (!Array.isArray(input) || !input.length) throw new TypeError("a path needs at least one point");
  const points = [];
  for (const point of input) {
    if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1]))
      throw new TypeError("path points must contain finite x and y");
    const prev = points.at(-1);
    if (!prev || point[0] !== prev[0] || point[1] !== prev[1]) points.push([point[0], point[1]]);
  }
  if (closed && points.length > 1) {
    const first = points[0], last = points.at(-1);
    if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  }
  const distances = [0];
  for (let i = 1; i < points.length; i++)
    distances.push(distances[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const length = distances.at(-1);
  const sample = (u) => {
    if (!Number.isFinite(u)) throw new RangeError("path progress must be finite");
    if (!length) return { x: points[0][0], y: points[0][1], tx: 1, ty: 0, nx: 0, ny: 1 };
    const d = (closed ? wrap(u, 1) : clamp(u)) * length;
    let lo = 1, hi = points.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (distances[mid] < d) lo = mid + 1;
      else hi = mid;
    }
    const a = points[lo - 1], b = points[lo], span = distances[lo] - distances[lo - 1];
    const t = (d - distances[lo - 1]) / span, tx = (b[0] - a[0]) / span, ty = (b[1] - a[1]) / span;
    return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), tx, ty, nx: -ty, ny: tx };
  };
  points.forEach(Object.freeze);
  return Object.freeze({ points: Object.freeze(points), length, closed, sample, at: (d) => sample(length ? d / length : 0) });
}
