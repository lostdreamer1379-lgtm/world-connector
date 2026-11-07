import { Orientation } from "../hooks/useViewportOrientation";

/**
 * Pure, dependency-free math that turns "how far is this card from the
 * focused one" into a 3D transform. Nothing here knows about React,
 * specific websites, or how many cards exist — the spec requires the
 * frontend to calculate positions generically for any collection size.
 */

export interface LayoutConfig {
  orientation: Orientation;
  spacing: number; // chord distance between adjacent card centers
  radius: number; // radius of the invisible spatial arc
  angleStep: number; // degrees rotated per step away from focus
  scaleStep: number; // scale lost per step away from focus
  minScale: number;
  minOpacity: number;
  maxVisibleOffset: number; // how many neighbors each side get rendered
}

export const DESKTOP_LAYOUT: LayoutConfig = {
  orientation: "horizontal",
  spacing: 420,
  radius: 1015,
  angleStep: 24,
  scaleStep: 0.14,
  minScale: 0.55,
  minOpacity: 0.12,
  maxVisibleOffset: 3,
};

export const MOBILE_LAYOUT: LayoutConfig = {
  orientation: "vertical",
  spacing: 230,
  radius: 557,
  angleStep: 24,
  scaleStep: 0.16,
  minScale: 0.5,
  minOpacity: 0.12,
  maxVisibleOffset: 2,
};

export function getLayoutConfig(orientation: Orientation, viewportWidth = window.innerWidth, viewportHeight = window.innerHeight): LayoutConfig {
  if (orientation === "horizontal") {
    const spacing = Math.min(700, Math.max(420, viewportWidth * 0.34));
    return { ...DESKTOP_LAYOUT, spacing, radius: spacing / Math.sin((DESKTOP_LAYOUT.angleStep * Math.PI) / 180) };
  }

  const spacing = Math.min(280, Math.max(210, viewportHeight * 0.28));
  return { ...MOBILE_LAYOUT, spacing, radius: spacing / Math.sin((MOBILE_LAYOUT.angleStep * Math.PI) / 180) };
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
  const angleRadians = (offset * config.angleStep * Math.PI) / 180;
  const translateZ = -(1 - Math.cos(angleRadians)) * config.radius;
  const zIndex = 1000 - Math.round(abs * 10);
  const angle = clamp(offset * config.angleStep, -72, 72);

  if (config.orientation === "horizontal") {
    return {
      index,
      offset,
      translateX: Math.sin(angleRadians) * config.radius,
      translateY: 0,
      translateZ,
      rotateX: 0,
      rotateY: -angle,
      scale,
      opacity,
      zIndex,
    };
  }

  return {
    index,
    offset,
    translateX: 0,
    translateY: Math.sin(angleRadians) * config.radius,
    translateZ,
    rotateX: angle,
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
  if (count === 0) return items;
  for (let index = 0; index < count; index++) {
    const rawOffset = index - focusedPosition;
    // With two worlds, a wrapped circular offset makes the cards trade
    // sides at the halfway point. Keep their paths linear so the focused
    // card travels directly into the centre without a visual twitch.
    let offset = rawOffset;
    if (count > 2) {
      offset = ((rawOffset % count) + count) % count;
      if (offset > count / 2 || (count % 2 === 0 && offset === count / 2 && rawOffset < 0)) {
        offset -= count;
      }
    }
    if (Math.abs(offset) <= maxVisibleOffset) {
      items.push({ index, offset });
    }
  }
  return items;
}
