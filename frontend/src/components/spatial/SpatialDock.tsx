import { World } from "../../types/world";
import ArtworkPlaceholder from "./ArtworkPlaceholder";

interface SpatialDockProps {
  worlds: World[];
  focusedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * The translucent floating dock. Always stays in sync with whatever is
 * focused in the spatial arrangement — same focusedIndex, same
 * onSelect callback, so there is exactly one source of truth for
 * "which world is selected" (see spec section 6: "no competing
 * navigation states").
 */
export default function SpatialDock({ worlds, focusedIndex, onSelect }: SpatialDockProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 px-3 py-2 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        {worlds.map((world, index) => {
          const isFocused = index === focusedIndex;
          return (
            <button
              key={world.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Go to ${world.name}`}
              aria-current={isFocused}
              className={`relative flex-shrink-0 overflow-hidden rounded-full border transition-all duration-300 ${
                isFocused
                  ? "h-11 w-11 border-white/50 opacity-100"
                  : "h-8 w-8 border-white/10 opacity-55 hover:opacity-85"
              }`}
            >
              {world.artworkUrl ? (
                <img src={world.artworkUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
