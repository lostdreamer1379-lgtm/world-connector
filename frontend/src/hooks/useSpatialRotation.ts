import { useCallback, useEffect, useRef, useState } from "react";
import { Orientation } from "./useViewportOrientation";
import { applyFriction, clampWithRubberBand } from "../physics/inertia";
import { springStep } from "../physics/settling";

export interface RotationPhysicsConfig {
  frictionPerMs: number; // higher = swipes decay faster
  maxVelocity: number; // index units per ms, caps a wild flick
  springStiffness: number;
  springDamping: number;
  velocityStopThreshold: number; // below this, momentum hands off to settling
  snapThreshold: number; // how close to target counts as "settled"
  rubberBandResistance: number; // 0 = rigid wall, 1 = no resistance
}

export const DESKTOP_ROTATION_PHYSICS: RotationPhysicsConfig = {
  frictionPerMs: 0.0028,
  maxVelocity: 0.028,
  springStiffness: 140,
  springDamping: 18,
  velocityStopThreshold: 0.00015,
  snapThreshold: 0.004,
  rubberBandResistance: 0.3,
};

export const MOBILE_ROTATION_PHYSICS: RotationPhysicsConfig = {
  ...DESKTOP_ROTATION_PHYSICS,
  frictionPerMs: 0.0032,
  maxVelocity: 0.03,
};

// Used when the person has "reduce motion" on: fast, direct, no momentum
// carry-through or spring overshoot, but still a real (very short) tween
// rather than an abrupt teleport.
export const REDUCED_MOTION_PHYSICS: RotationPhysicsConfig = {
  frictionPerMs: 0.02,
  maxVelocity: 0.02,
  springStiffness: 320,
  springDamping: 34,
  velocityStopThreshold: 0.0006,
  snapThreshold: 0.004,
  rubberBandResistance: 0.15,
};

export function getRotationPhysicsConfig(orientation: Orientation): RotationPhysicsConfig {
  return orientation === "horizontal" ? DESKTOP_ROTATION_PHYSICS : MOBILE_ROTATION_PHYSICS;
}

type Phase = "idle" | "dragging" | "momentum" | "settling";

export interface SpatialRotationApi {
  /** Continuous focus position — e.g. 1.42, not just a whole index. */
  position: number;
  isDragging: boolean;
  /** Call on pointer/touch down: cancels any in-flight motion. */
  beginDrag: () => void;
  /** Call on pointer/touch move with an index-space delta (1:1 tracking). */
  dragBy: (deltaIndex: number) => void;
  /** Call on release with the gesture's release velocity (index/ms). */
  endDrag: (velocityIndexPerMs: number) => void;
  /** Animate to an arbitrary index via the same settling spring. */
  goTo: (index: number) => void;
  /** Animate one step forward/back from wherever it's currently headed. */
  step: (direction: 1 | -1) => void;
}

/**
 * The continuous rotation model at the heart of the spatial interaction:
 * a float `position` that can be pushed, dragged, thrown, and allowed to
 * settle — rather than a simple "snap to the next index" carousel.
 *
 * Sequence on a strong swipe: dragBy (1:1 with the finger) → endDrag
 * hands off to momentum (velocity decaying under friction, potentially
 * crossing several worlds) → once velocity drops below threshold,
 * settling takes over with a damped spring onto the nearest whole index.
 */
export function useSpatialRotation(
  count: number,
  config: RotationPhysicsConfig,
  initialIndex = 0
): SpatialRotationApi {
  const [position, setPositionState] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);

  const positionRef = useRef(initialIndex);
  const velocityRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const settleTargetRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const maxIndex = Math.max(0, count - 1);

  const commit = useCallback((value: number) => {
    positionRef.current = value;
    setPositionState(value);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTimeRef.current = null;
  }, []);

  const tick = useCallback(
    (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const deltaMs = Math.min(48, time - lastTimeRef.current); // clamp big gaps (tab switch, jank)
      lastTimeRef.current = time;

      if (phaseRef.current === "momentum") {
        let next = positionRef.current + velocityRef.current * deltaMs;
        velocityRef.current = applyFriction(velocityRef.current, deltaMs, config.frictionPerMs);

        if (next < 0 || next > maxIndex) {
          next = Math.max(0, Math.min(maxIndex, next));
          velocityRef.current = 0; // soft stop at the ends rather than a bounce
        }

        commit(next);

        if (Math.abs(velocityRef.current) < config.velocityStopThreshold) {
          settleTargetRef.current = null;
          phaseRef.current = "settling";
        }
      } else if (phaseRef.current === "settling") {
        const target =
          settleTargetRef.current ?? Math.max(0, Math.min(maxIndex, Math.round(positionRef.current)));
        const { position: nextPos, velocity: nextVel } = springStep(
          positionRef.current,
          velocityRef.current,
          target,
          { stiffness: config.springStiffness, damping: config.springDamping },
          deltaMs / 1000
        );
        velocityRef.current = nextVel;
        commit(nextPos);

        const settled =
          Math.abs(nextPos - target) < config.snapThreshold &&
          Math.abs(nextVel) < config.velocityStopThreshold * 4;

        if (settled) {
          commit(target);
          velocityRef.current = 0;
          phaseRef.current = "idle";
          settleTargetRef.current = null;
          stopLoop();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [commit, config, maxIndex, stopLoop]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current === null) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const beginDrag = useCallback(() => {
    stopLoop();
    phaseRef.current = "dragging";
    velocityRef.current = 0;
    setIsDragging(true);
  }, [stopLoop]);

  const dragBy = useCallback(
    (deltaIndex: number) => {
      const raw = positionRef.current + deltaIndex;
      commit(clampWithRubberBand(raw, 0, maxIndex, config.rubberBandResistance));
    },
    [commit, config.rubberBandResistance, maxIndex]
  );

  const endDrag = useCallback(
    (velocityIndexPerMs: number) => {
      setIsDragging(false);
      const clamped = Math.max(-config.maxVelocity, Math.min(config.maxVelocity, velocityIndexPerMs));
      velocityRef.current = clamped;
      settleTargetRef.current = null;

      const outOfBounds = positionRef.current < 0 || positionRef.current > maxIndex;
      phaseRef.current =
        outOfBounds || Math.abs(clamped) < config.velocityStopThreshold ? "settling" : "momentum";
      startLoop();
    },
    [config.maxVelocity, config.velocityStopThreshold, maxIndex, startLoop]
  );

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(maxIndex, Math.round(index)));
      settleTargetRef.current = clamped;
      phaseRef.current = "settling";
      startLoop();
    },
    [maxIndex, startLoop]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const base = settleTargetRef.current ?? Math.round(positionRef.current);
      if (count < 2) return;
      const next = ((base + direction) % count + count) % count;
      goTo(next);
    },
    [count, goTo]
  );

  // If the collection shrinks (admin deactivates a world) under an
  // out-of-range position, pull it back in bounds.
  useEffect(() => {
    if (positionRef.current > maxIndex) commit(maxIndex);
  }, [commit, maxIndex]);

  useEffect(() => stopLoop, [stopLoop]);

  return { position, isDragging, beginDrag, dragBy, endDrag, goTo, step };
}
