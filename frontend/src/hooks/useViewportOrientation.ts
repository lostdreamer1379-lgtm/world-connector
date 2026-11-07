import { useEffect, useState } from "react";

export type Orientation = "horizontal" | "vertical";

const MOBILE_BREAKPOINT = 768;

/**
 * Horizontal on wide viewports (desktop/laptop/tablet landscape),
 * vertical on narrow ones (phones). Re-evaluates on resize so rotating
 * a device or resizing a window updates the spatial arrangement live.
 */
export function useViewportOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(() =>
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT ? "vertical" : "horizontal"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setOrientation(mediaQuery.matches ? "vertical" : "horizontal");
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return orientation;
}
