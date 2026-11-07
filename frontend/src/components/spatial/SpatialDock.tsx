import { useState } from "react";
import { World } from "../../types/world";
import { Orientation } from "../../hooks/useViewportOrientation";
import ArtworkPlaceholder from "./ArtworkPlaceholder";

interface SpatialDockProps {
  worlds: World[];
  focusedIndex: number;
  onSelect: (index: number) => void;
  orientation: Orientation;
  onPrev: () => void;
  onNext: () => void;
  canNavigate: boolean;
}

const MAX_MOBILE_DOCK_ITEMS = 5;

export default function SpatialDock({ worlds, focusedIndex, onSelect, orientation, onPrev, onNext, canNavigate }: SpatialDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = orientation === "vertical";
  const hiddenCount = Math.max(0, worlds.length - MAX_MOBILE_DOCK_ITEMS);
  const hasOverflow = isMobile && hiddenCount > 0;
  const start = Math.max(0, Math.min(focusedIndex - 1, worlds.length - MAX_MOBILE_DOCK_ITEMS));
  const visibleWorlds = isMobile && hiddenCount > 0 ? worlds.slice(start, start + MAX_MOBILE_DOCK_ITEMS) : worlds;
  const arrowClass = "dock-navigation-button flex shrink-0 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25";

  function selectWorld(index: number) {
    onSelect(index);
    setIsExpanded(false);
  }

  return (
    <>
      <div className={`spatial-dock-wrap pointer-events-none absolute ${isMobile ? "inset-y-0 right-3 flex items-center" : "inset-x-0 bottom-7 flex justify-center px-4"}`}>
        <div className={`spatial-dock pointer-events-auto flex ${isMobile ? `${hasOverflow ? "max-h-[min(72dvh,38rem)]" : "h-auto"} w-[4.25rem] flex-col py-2.5` : "max-w-full flex-row px-3 py-2"} items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.055] shadow-[0_22px_54px_-20px_rgba(0,0,0,0.72),inset_0_1px_rgba(255,255,255,.09)] backdrop-blur-2xl`}>
          {isMobile && <button type="button" className={`${arrowClass} h-10 w-10 text-lg`} onClick={onPrev} disabled={!canNavigate} aria-label="Previous world">↑</button>}
          <div className={`dock-world-list flex ${isMobile ? `${hasOverflow ? "min-h-0 flex-1 overflow-hidden" : "flex-none"} w-full flex-col items-center py-1` : "max-w-full flex-row overflow-x-auto"} items-center gap-2`}>
            {visibleWorlds.map((world) => {
              const index = worlds.findIndex((candidate) => candidate.id === world.id);
              const isFocused = index === focusedIndex;
              return <button key={world.id} type="button" onClick={() => selectWorld(index)} aria-label={`Go to ${world.name}`} aria-current={isFocused} className={`dock-item relative flex-shrink-0 overflow-hidden rounded-full border transition-all duration-300 ${isFocused ? "h-11 w-11 border-white/50 opacity-100" : "h-8 w-8 border-white/10 opacity-55 hover:opacity-85"}`}>
                {world.artworkUrl ? <img src={world.artworkUrl} alt="" className="h-full w-full object-cover" /> : <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} compact />}
              </button>;
            })}
            {isMobile && hiddenCount > 0 && <button type="button" className="dock-overflow-button shrink-0" onClick={() => setIsExpanded(true)} aria-label={`Show ${hiddenCount} more worlds`}>+{hiddenCount}</button>}
          </div>
          {isMobile && <button type="button" className={`${arrowClass} h-10 w-10 text-lg`} onClick={onNext} disabled={!canNavigate} aria-label="Next world">↓</button>}
        </div>
      </div>

      {isExpanded && <div className="world-picker-overlay" role="presentation" onClick={() => setIsExpanded(false)}>
        <section className="world-picker-panel" role="dialog" aria-modal="true" aria-labelledby="world-picker-title" onClick={(event) => event.stopPropagation()}>
          <div className="world-picker-header"><div><p className="eyebrow">ALL WORLDS</p><h2 id="world-picker-title">Choose a world</h2></div><button type="button" className="world-picker-close" onClick={() => setIsExpanded(false)} aria-label="Close world picker">×</button></div>
          <div className="world-picker-grid">{worlds.map((world, index) => <button type="button" key={world.id} className={`world-picker-item ${index === focusedIndex ? "is-selected" : ""}`} onClick={() => selectWorld(index)}><div className="world-picker-art">{world.artworkUrl ? <img src={world.artworkUrl} alt="" /> : <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} compact />}</div><span>{world.name}</span>{world.description && <small>{world.description}</small>}</button>)}</div>
        </section>
      </div>}
    </>
  );
}
