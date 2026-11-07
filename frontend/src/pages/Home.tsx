import { useMemo, useState } from "react";
import { useWorlds } from "../hooks/useWorlds";
import { useViewportOrientation } from "../hooks/useViewportOrientation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import {
  getRotationPhysicsConfig,
  REDUCED_MOTION_PHYSICS,
  useSpatialRotation,
} from "../hooks/useSpatialRotation";
import AmbientBackground from "../components/atmosphere/AmbientBackground";
import SpatialStage from "../components/spatial/SpatialStage";
import SpatialDock from "../components/spatial/SpatialDock";
import InstallAppButton from "../components/InstallAppButton";

/**
 * PHASE 3: interaction physics.
 *
 * Home owns the single `useSpatialRotation` instance — the continuous
 * position that the spatial stage, the dock, and (later) any other
 * control all read from and drive, so there's one source of truth for
 * "where focus is" no matter how it got there (drag, side arrows,
 * dock click, or arrow keys).
 *
 * Focus, spatial arrangement, dock navigation, and world entry are all
 * driven from this single rotation instance.
 */
export default function Home() {
  const { worlds, isLoading, error } = useWorlds();
  const orientation = useViewportOrientation();
  const reducedMotion = usePrefersReducedMotion();

  const physicsConfig = useMemo(
    () => (reducedMotion ? REDUCED_MOTION_PHYSICS : getRotationPhysicsConfig(orientation)),
    [orientation, reducedMotion]
  );

  const rotation = useSpatialRotation(worlds.length, physicsConfig);

  const roundedIndex = Math.max(0, Math.min(worlds.length - 1, Math.round(rotation.position)));
  const focusedWorld = worlds[roundedIndex];
  const [isEntering, setIsEntering] = useState(false);

  function enterWorld(worldIndex: number) {
    const world = worlds[worldIndex];
    if (!world || isEntering) return;
    rotation.goTo(worldIndex);
    setIsEntering(true);
    window.setTimeout(() => {
      if (world.openMode === "NEW_TAB") window.open(world.destinationUrl, "_blank", "noopener,noreferrer");
      else window.location.assign(world.destinationUrl);
      setIsEntering(false);
    }, 420);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <AmbientBackground focusedWorld={focusedWorld} />
      <InstallAppButton />

      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-white/40">Loading worlds…</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm text-red-400/90">
            Couldn't reach the API ({error}). Is the backend running on the URL in{" "}
            <code>VITE_API_BASE_URL</code>?
          </p>
        </div>
      )}

      {!isLoading && !error && worlds.length === 0 && (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm text-white/40">
            No worlds registered yet. Run <code>npm run seed</code> in the backend.
          </p>
        </div>
      )}

      {!isLoading && !error && worlds.length > 0 && (
        <>
          <SpatialStage worlds={worlds} orientation={orientation} rotation={rotation} onEnter={enterWorld} />
          <SpatialDock worlds={worlds} focusedIndex={roundedIndex} onSelect={rotation.goTo} />
        </>
      )}
      {isEntering && <div className="pointer-events-none fixed inset-0 z-50 bg-[#0b0b0c]/75 opacity-100 backdrop-blur-md transition-opacity" aria-label="Entering world" />}
    </div>
  );
}
