/**
 * Exponential velocity decay — the "friction" that slows a swipe down
 * after release. frictionPerMs is a decay rate, not a fixed subtraction,
 * so it behaves consistently regardless of frame rate.
 */
export function applyFriction(velocity: number, deltaMs: number, frictionPerMs: number): number {
  const decay = Math.exp(-frictionPerMs * deltaMs);
  return velocity * decay;
}

/**
 * Soft resistance past [min, max] so dragging beyond the first or last
 * world feels like pushing against something elastic, not hitting a
 * wall — the arrangement still "gives" a little before springing back.
 */
export function clampWithRubberBand(value: number, min: number, max: number, resistance: number): number {
  if (value < min) return min - (min - value) * resistance;
  if (value > max) return max + (value - max) * resistance;
  return value;
}
