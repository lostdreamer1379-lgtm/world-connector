import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from "react";
import { Orientation } from "./useViewportOrientation";

interface DragInteractionConfig {
  orientation: Orientation;
  /** Pixels of drag that correspond to moving one full index step. */
  pixelsPerIndex: number;
  onDragStart: () => void;
  onDragMove: (deltaIndex: number) => void;
  onDragEnd: (velocityIndexPerMs: number) => void;
}

interface PointerSample {
  position: number;
  time: number;
}

// Only recent samples count toward release velocity, so a gesture that
// pauses before lifting doesn't carry stale speed into the throw.
const VELOCITY_WINDOW_MS = 120;

/**
 * Generic pointer/touch drag recognizer — mouse, touch, and trackpad-as-
 * pointer all go through the same Pointer Events path. This hook knows
 * nothing about cards or worlds: it just turns movement along the
 * stage's main axis into index-space deltas and a release velocity, for
 * useSpatialRotation to turn into motion.
 */
export function useDragInteraction({
  orientation,
  pixelsPerIndex,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DragInteractionConfig) {
  const isDraggingRef = useRef(false);
  const lastAxisPositionRef = useRef(0);
  const samplesRef = useRef<PointerSample[]>([]);
  const pendingDeltaRef = useRef(0);
  const moveFrameRef = useRef<number | null>(null);

  const axisValue = useCallback(
    (event: ReactPointerEvent) => (orientation === "horizontal" ? event.clientX : event.clientY),
    [orientation]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      (event.target as Element).setPointerCapture?.(event.pointerId);
      isDraggingRef.current = true;
      pendingDeltaRef.current = 0;
      if (moveFrameRef.current !== null) {
        cancelAnimationFrame(moveFrameRef.current);
        moveFrameRef.current = null;
      }
      const axis = axisValue(event);
      lastAxisPositionRef.current = axis;
      samplesRef.current = [{ position: axis, time: event.timeStamp }];
      onDragStart();
    },
    [axisValue, onDragStart]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      const axis = axisValue(event);
      const deltaPixels = axis - lastAxisPositionRef.current;
      lastAxisPositionRef.current = axis;

      // Dragging "backward" along the axis (left on desktop, up on
      // mobile) advances focus forward — the arrangement follows the
      // gesture the way a physical object would under your hand.
      pendingDeltaRef.current -= deltaPixels / pixelsPerIndex;
      if (moveFrameRef.current === null) {
        moveFrameRef.current = requestAnimationFrame(() => {
          moveFrameRef.current = null;
          if (!isDraggingRef.current || pendingDeltaRef.current === 0) return;
          const delta = pendingDeltaRef.current;
          pendingDeltaRef.current = 0;
          onDragMove(delta);
        });
      }

      samplesRef.current.push({ position: axis, time: event.timeStamp });
      const cutoff = event.timeStamp - VELOCITY_WINDOW_MS;
      samplesRef.current = samplesRef.current.filter((sample) => sample.time >= cutoff);
    },
    [axisValue, onDragMove, pixelsPerIndex]
  );

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;

    if (moveFrameRef.current !== null) {
      cancelAnimationFrame(moveFrameRef.current);
      moveFrameRef.current = null;
    }
    if (pendingDeltaRef.current !== 0) {
      onDragMove(pendingDeltaRef.current);
      pendingDeltaRef.current = 0;
    }

    isDraggingRef.current = false;

    const samples = samplesRef.current;
    let velocityIndexPerMs = 0;
    if (samples.length >= 2) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = last.time - first.time;
      if (dt > 0) {
        velocityIndexPerMs = -(last.position - first.position) / dt / pixelsPerIndex;
      }
    }

    onDragEnd(velocityIndexPerMs);
  }, [onDragEnd, onDragMove, pixelsPerIndex]);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
      endDrag();
    },
    [endDrag]
  );

  useEffect(() => {
    return () => {
      if (moveFrameRef.current !== null) cancelAnimationFrame(moveFrameRef.current);
    };
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: endDrag,
  };
}
