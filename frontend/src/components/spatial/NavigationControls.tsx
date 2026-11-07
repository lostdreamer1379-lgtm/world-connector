import { Orientation } from "../../hooks/useViewportOrientation";

interface NavigationControlsProps {
  orientation: Orientation;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

const buttonClass =
  "pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/60 backdrop-blur-xl transition hover:bg-white/10 hover:text-white disabled:opacity-0 disabled:pointer-events-none";

/**
 * Quiet side controls — not prominent buttons. A press applies a small
 * step toward the neighboring world; the settling animation lives on
 * the cards themselves (SpatialWorldCard), not here.
 */
export default function NavigationControls({
  orientation,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: NavigationControlsProps) {
  const isHorizontal = orientation === "horizontal";

  const containerClass = isHorizontal
    ? "pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-5 md:px-10"
    : "pointer-events-none absolute inset-x-0 top-6 bottom-28 flex flex-col items-center justify-between";

  const prevLabel = isHorizontal ? "‹" : "↑";
  const nextLabel = isHorizontal ? "›" : "↓";

  return (
    <div className={containerClass}>
      <button
        type="button"
        className={buttonClass}
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous world"
      >
        {prevLabel}
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next world"
      >
        {nextLabel}
      </button>
    </div>
  );
}
