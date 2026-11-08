import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { World } from "../../types/world";
import { CardTransform } from "../../geometry/spatialLayout";
import ArtworkPlaceholder from "./ArtworkPlaceholder";

interface SpatialWorldCardProps {
  world: World;
  transform: CardTransform;
  isFocused: boolean;
  isEntering: boolean;
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
export default function SpatialWorldCard({ world, transform, isFocused, isEntering, onSelect }: SpatialWorldCardProps) {
  const { translateX, translateY, translateZ, rotateX, rotateY, scale, opacity, zIndex, index } = transform;
  const [artworkFailed, setArtworkFailed] = useState(false);

  useEffect(() => setArtworkFailed(false), [world.artworkUrl]);

  return (
    <motion.a
      href={isFocused ? world.destinationUrl : undefined}
      target={isFocused && world.openMode === "NEW_TAB" ? "_blank" : undefined}
      rel={isFocused && world.openMode === "NEW_TAB" ? "noopener noreferrer" : undefined}
      onClick={(event) => {
        // Only the focused card is an active destination. Keeping the other
        // cards as focus controls prevents accidental navigation while still
        // making the actual world entry a real HTTPS link. That lets an
        // installed PWA claim the link on mobile; otherwise the browser opens
        // the same URL normally.
        if (!isFocused) {
          event.preventDefault();
          onSelect(index);
        }
      }}
      className={`world-card absolute left-1/2 top-1/2 overflow-hidden rounded-[32px] border border-white/10 shadow-[0_38px_100px_-34px_rgba(0,0,0,0.78)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${isFocused ? "world-card-focused" : "world-card-near"}`}
      style={{ zIndex, touchAction: "none", transformStyle: "preserve-3d", transformOrigin: "50% 50%", willChange: "transform, opacity" }}
      animate={{
        x: `calc(-50% + ${translateX}px)`,
        y: `calc(-50% + ${translateY}px)`,
        z: isEntering ? 260 : translateZ,
        rotateX,
        rotateY,
        scale: isEntering ? 1.16 : scale,
        opacity: isEntering ? 1 : opacity,
      }}
      transition={isEntering ? { duration: 0.82, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      aria-current={isFocused}
      aria-label={world.description ? `${world.name} — ${world.description}` : world.name}
    >
      <div className="relative h-full w-full">
        {world.artworkUrl && !artworkFailed ? (
          <img
            src={world.artworkUrl}
            alt={world.artworkAlt ?? world.name}
            className="world-artwork absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            draggable={false}
            onError={() => setArtworkFailed(true)}
          />
        ) : (
          <ArtworkPlaceholder name={world.name} accentColor={world.accentColor} />
        )}

        <div className="world-card-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-7 pb-7 pt-28 text-left">
          {world.category && <p className="mb-2 text-[10px] uppercase tracking-[.24em] text-white/55">{world.category}</p>}
          <p className="text-xl font-medium tracking-[.035em] text-white md:text-2xl">{world.name}</p>
          {isFocused && world.description && (
            <p className="mt-2 line-clamp-2 max-w-[30rem] text-sm leading-relaxed text-white/70">{world.description}</p>
          )}
        </div>
      </div>
    </motion.a>
  );
}
