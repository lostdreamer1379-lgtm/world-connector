import { motion } from "motion/react";
import { World } from "../../types/world";
import { CardTransform } from "../../geometry/spatialLayout";
import ArtworkPlaceholder from "./ArtworkPlaceholder";

interface SpatialWorldCardProps {
  world: World;
  transform: CardTransform;
  isFocused: boolean;
  onSelect: (index: number) => void;
}

/**
 * One floating, translucent card. Positioning is entirely driven by the
 * transform computed in geometry/spatialLayout.ts — this component has
 * no idea whether it's card 1 of 2 or card 14 of 50.
 *
 * Transition is intentionally instant (duration 0): the smoothing —
 * drag tracking, momentum, friction, spring settling — all happens
 * upstream in useSpatialRotation's own per-frame physics loop. Letting
 * Motion additionally spring toward each new frame's target would
 * smooth already-smoothed motion and make it feel laggy.
 */
export default function SpatialWorldCard({ world, transform, isFocused, onSelect }: SpatialWorldCardProps) {
  const { translateX, translateY, translateZ, rotateX, rotateY, scale, opacity, zIndex, index } = transform;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(index)}
      className="absolute left-1/2 top-1/2 overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900/50 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)] backdrop-blur-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{ width: isFocused ? 320 : 250, height: isFocused ? 420 : 330, zIndex, touchAction: "none" }}
      animate={{
        x: `calc(-50% + ${translateX}px)`,
        y: `calc(-50% + ${translateY}px)`,
        z: translateZ,
        rotateX,
        rotateY,
        scale,
        opacity,
      }}
      transition={{ duration: 0 }}
      aria-current={isFocused}
      aria-label={world.description ? `${world.name} — ${world.description}` : world.name}
    >
      <div className="relative h-full w-full">
        {world.artworkUrl ? (
          <img
            src={world.artworkUrl}
            alt={world.artworkAlt ?? world.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-5 pb-5 pt-16">
          <p className="text-lg font-medium tracking-wide text-white">{world.name}</p>
          {isFocused && world.description && (
            <p className="mt-1 line-clamp-2 text-sm text-white/70">{world.description}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
