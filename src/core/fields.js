// A field(x, y, time) returns acceleration [ax, ay] in local pixels/s². No hidden clocks or RNG state.
import { noise2 } from "./math.js";

/** Constant wind. */
export const windField = (ax, ay) => () => [ax, ay];

/**
 * Radial attraction; negative strength repels. Within radius, force falls linearly to zero at the edge.
 * strength is peak acceleration (not inverse-square gravity); the exact center has no preferred direction.
 */
export function attractionField(cx, cy, strength, radius = Infinity) {
  if (!(radius > 0)) throw new RangeError("field radius must be positive");
  return (x, y) => {
    const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy);
    if (!d || d >= radius) return [0, 0];
    const k = strength * (1 - d / radius) / d;
    return [dx * k, dy * k];
  };
}

/** Tangential acceleration; positive strength turns clockwise in y-down coordinates. */
export function vortexField(cx, cy, strength, radius = Infinity) {
  const radial = attractionField(cx, cy, strength, radius);
  return (x, y) => { const [ax, ay] = radial(x, y); return [ay, -ax]; };
}

/** Seeded smooth turbulence; scale is pixels per noise cell, speed is noise-cell travel per second. */
export function turbulenceField({ strength = 30, scale = 24, speed = 0.4, seed = 1 } = {}) {
  if (!(scale > 0)) throw new RangeError("field scale must be positive");
  return (x, y, t = 0) => [
    noise2(x / scale + t * speed, y / scale, seed) * strength,
    noise2(x / scale, y / scale + t * speed, seed + 101) * strength,
  ];
}

/** Superpose fields; an empty composition is a zero field. */
export function combineFields(...fields) {
  return (x, y, t = 0) => {
    let ax = 0, ay = 0;
    for (const field of fields) { const a = field(x, y, t); ax += a[0]; ay += a[1]; }
    return [ax, ay];
  };
}

/** Multiply by a constant or a spatial/time-dependent weight. */
export function scaleField(field, weight) {
  return (x, y, t = 0) => {
    const a = field(x, y, t), k = typeof weight === "function" ? weight(x, y, t) : weight;
    return [a[0] * k, a[1] * k];
  };
}

/**
 * One semi-implicit Euler step. Mutates {x, y, vx, vy}; call at <= 1/120 s for trajectories.
 * t is the start of the step. A field adds acceleration to the caller's existing velocity.
 */
export function stepField(particle, field, dt, t = 0) {
  if (!(dt >= 0) || !Number.isFinite(dt)) throw new RangeError("field dt must be finite and non-negative");
  if (!dt) return particle;
  const [ax, ay] = field(particle.x, particle.y, t);
  particle.vx += ax * dt;
  particle.vy += ay * dt;
  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;
  return particle;
}

/**
 * Bake deterministic field motion to a path-compatible curve(age / duration). Built once, sampled freely
 * in any order: suitable for cycle(), seeking and sheet export. Initial state is copied, not mutated.
 */
export function fieldTrajectory(initial, field, duration, { hz = 120, startTime = 0 } = {}) {
  if (!(duration > 0) || !Number.isFinite(duration) || !(hz > 0) || !Number.isFinite(hz))
    throw new RangeError("trajectory duration and hz must be finite and positive");
  if (![initial.x, initial.y, initial.vx, initial.vy, startTime].every(Number.isFinite))
    throw new TypeError("trajectory position, velocity and startTime must be finite");
  const n = Math.ceil(duration * hz), dt = duration / n, p = { ...initial };
  const points = [[p.x, p.y]];
  for (let i = 0; i < n; i++) {
    stepField(p, field, dt, startTime + i * dt);
    points.push([p.x, p.y]);
  }
  return (u) => {
    if (!Number.isFinite(u)) throw new RangeError("trajectory progress must be finite");
    const f = Math.max(0, Math.min(1, u)) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
    return [points[i][0] + (points[i + 1][0] - points[i][0]) * k,
      points[i][1] + (points[i + 1][1] - points[i][1]) * k];
  };
}
