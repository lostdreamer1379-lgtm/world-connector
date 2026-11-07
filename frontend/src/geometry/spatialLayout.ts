import { Orientation } from "../hooks/useViewportOrientation";

/**
 * Pure, dependency-free math that turns "how far is this card from the
 * focused one" into a 3D transform. Nothing here knows about React,
 * specific websites, or how many cards exist — the spec requires the
 * frontend to calculate positions generically for any collection size.
 */

export interface LayoutConfig {
  orientation: Orientation;
  spacing: number; // px between adjacent card centers along the main axis
  depthStep: number; // px pushed back (z) per step away from focus
  angleStep: number; // degrees rotated per step away from focus
  scaleStep: number; // scale lost per step away from focus
  minScale: number;
  minOpacity: number;
  maxVisibleOffset: number; // how many neighbors each side get rendered
}

export const DESKTOP_LAYOUT: LayoutConfig = {
  orientation: "horizontal",
  spacing: 300,
  depthStep: 150,
  angleStep: 16,
  scaleStep: 0.14,
  minScale: 0.55,
  minOpacity: 0.12,
  maxVisibleOffset: 3,
};

export const MOBILE_LAYOUT: LayoutConfig = {
  orientation: "vertical",
  spacing: 190,
  depthStep: 130,
  angleStep: 18,
  scaleStep: 0.16,
  minScale: 0.5,
  minOpacity: 0.12,
  maxVisibleOffset: 2,
};

export function getLayoutConfig(orientation: Orientation): LayoutConfig {
  return orientation === "horizontal" ? DESKTOP_LAYOUT : MOBILE_LAYOUT;
}

export interface CardTransform {
  index: number;
  offset: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function computeCardTransform(index: number, offset: number, config: LayoutConfig): CardTransform {
  const abs = Math.abs(offset);
  const scale = Math.max(config.minScale, 1 - abs * config.scaleStep);
  const opacity = Math.max(config.minOpacity, 1 - abs * 0.3);
  const translateZ = -abs * config.depthStep;
  const zIndex = 1000 - Math.round(abs * 10);
  const maxAngle = config.angleStep * config.maxVisibleOffset;

  if (config.orientation === "horizontal") {
    return {
      index,
      offset,
      translateX: offset * config.spacing,
      translateY: 0,
      translateZ,
      rotateX: 0,
      rotateY: clamp(-offset * config.angleStep, -maxAngle, maxAngle),
      scale,
      opacity,
      zIndex,
    };
  }

  return {
    index,
    offset,
    translateX: 0,
    translateY: offset * config.spacing,
    translateZ,
    rotateX: clamp(offset * config.angleStep, -maxAngle, maxAngle),
    rotateY: 0,
    scale,
    opacity,
    zIndex,
  };
}

/**
 * Only the cards worth rendering: the ones within maxVisibleOffset of
 * the current (possibly fractional, mid-drag) focus position, clamped
 * to the collection's actual bounds. This is the "don't render distant
 * invisible cards" requirement from the performance section, done the
 * simple way. `focusedPosition` is a float — e.g. 1.42 mid-gesture, not
 * just a settled whole index — so offsets are fractional too, which is
 * exactly what lets dragging move cards smoothly instead of snapping.
 */
export function getVisibleCards(
  count: number,
  focusedPosition: number,
  maxVisibleOffset: number
): { index: number; offset: number }[] {
  const items: { index: number; offset: number }[] = [];
  for (let index = 0; index < count; index++) {
    const offset = index - focusedPosition;
    if (Math.abs(offset) <= maxVisibleOffset) {
      items.push({ index, offset });
    }
  }
  return items;
}
