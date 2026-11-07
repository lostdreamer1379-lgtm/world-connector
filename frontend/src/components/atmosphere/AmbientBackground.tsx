import { World } from "../../types/world";

interface AmbientBackgroundProps {
  focusedWorld?: World;
}

const FALLBACK_ACCENT = "#3a3a3d";

/**
 * A quiet, layered gradient backdrop. Understated by design: it may
 * take on a hint of the focused world's accentColor, but it must never
 * compete with the card artwork or flash between colors.
 */
export default function AmbientBackground({ focusedWorld }: AmbientBackgroundProps) {
  const accent = focusedWorld?.accentColor ?? FALLBACK_ACCENT;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0b0c]">
      <div
        className="absolute left-1/2 top-[-30%] h-[140vmax] w-[140vmax] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl transition-colors duration-1000 ease-out"
        style={{ background: `radial-gradient(closest-side, ${accent}, transparent 70%)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.05),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.65),transparent_60%)]" />
    </div>
  );
}
