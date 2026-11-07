export interface SpringConfig {
  stiffness: number;
  damping: number;
}

/**
 * One physics step of a damped spring pulling `position` toward
 * `target`. This is what makes the collection "settle elegantly" onto
 * a world rather than snapping — used identically whether the spring
 * was triggered by a decayed swipe, a dock click, a side-arrow press,
 * or a keyboard step, so every way of navigating feels like the same
 * physical object.
 */
export function springStep(
  position: number,
  velocity: number,
  target: number,
  config: SpringConfig,
  deltaSeconds: number
): { position: number; velocity: number } {
  // Integrate in small slices so a dropped frame cannot make the card
  // overshoot and visibly reverse before settling.
  const slices = Math.max(1, Math.ceil(deltaSeconds / 0.008));
  const step = deltaSeconds / slices;
  let nextPosition = position;
  let nextVelocity = velocity;

  for (let index = 0; index < slices; index += 1) {
    const displacement = nextPosition - target;
    const acceleration = -config.stiffness * displacement - config.damping * nextVelocity;
    nextVelocity += acceleration * step;
    nextPosition += nextVelocity * step;
  }

  return { position: nextPosition, velocity: nextVelocity };
}
