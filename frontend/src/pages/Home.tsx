import { useEffect, useMemo, useState } from "react";
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
import ThemeMenu, { readSavedTheme } from "../components/ThemeMenu";
import { AppTheme } from "../components/themes";

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

  const roundedIndex = worlds.length
    ? ((Math.round(rotation.position) % worlds.length) + worlds.length) % worlds.length
    : 0;
  const focusedWorld = worlds[roundedIndex];
  const [isEntering, setIsEntering] = useState(false);
  const [enteringIndex, setEnteringIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<AppTheme>(readSavedTheme);

  useEffect(() => {
    document.documentElement.style.setProperty("--scene-bg", theme.background);
    document.documentElement.style.setProperty("--scene-surface", theme.surface);
    document.documentElement.style.setProperty("--scene-accent", theme.accent);
    document.body.style.backgroundColor = theme.background;
  }, [theme]);

  function enterWorld(worldIndex: number) {
    const world = worlds[worldIndex];
    if (!world || isEntering) return;
    rotation.goTo(worldIndex);
    setEnteringIndex(worldIndex);
    setIsEntering(true);
    window.setTimeout(() => {
      setIsEntering(false);
      setEnteringIndex(null);
    }, 900);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ backgroundColor: theme.background, "--scene-bg": theme.background, "--scene-surface": theme.surface } as React.CSSProperties}>
      <AmbientBackground focusedWorld={focusedWorld} theme={theme} />
      <div className="top-controls"><button className="top-control-button" onClick={() => window.location.reload()} aria-label="Reload worlds" title="Reload"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4.9 9a7.5 7.5 0 0 1 12.6-2L20 12M4 17v-5h5m10.1 3a7.5 7.5 0 0 1-12.6 2L4 12"/></svg></button><ThemeMenu onThemeChange={setTheme} /><InstallAppButton compact /></div>

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
          <SpatialStage worlds={worlds} orientation={orientation} rotation={rotation} onEnter={enterWorld} enteringIndex={enteringIndex} />
          <SpatialDock worlds={worlds} focusedIndex={roundedIndex} onSelect={rotation.goTo} orientation={orientation} onPrev={() => rotation.step(-1)} onNext={() => rotation.step(1)} canNavigate={worlds.length > 1} />
        </>
      )}
      {isEntering && <div className="world-entry-overlay pointer-events-none fixed inset-0 z-50" aria-label="Entering world" />}
    </div>
  );
}
