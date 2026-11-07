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
  const displacement = position - target;
  const acceleration = -config.stiffness * displacement - config.damping * velocity;
  const nextVelocity = velocity + acceleration * deltaSeconds;
  const nextPosition = position + nextVelocity * deltaSeconds;
  return { position: nextPosition, velocity: nextVelocity };
}
