interface ArtworkPlaceholderProps {
  name: string;
  accentColor?: string | null;
  compact?: boolean;
}

// Deterministic hue from the name so placeholders are stable and
// distinguishable from each other without any real artwork yet.
function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Temporary, elegant stand-in for a world's artwork until the owner
 * uploads the real image via the admin panel (Phase 5). Never meant to
 * look like a final asset — restrained gradient + initial, nothing loud.
 */
export default function ArtworkPlaceholder({ name, accentColor, compact = false }: ArtworkPlaceholderProps) {
  const hue = hashHue(name);
  const tone = accentColor ?? `hsl(${hue} 25% 42%)`;
  const background = `radial-gradient(ellipse at 72% 22%, ${tone}66 0%, transparent 45%), radial-gradient(ellipse at 16% 84%, ${tone}36 0%, transparent 52%), linear-gradient(145deg, #292725 0%, #171718 52%, #0b0b0c 100%)`;

  return (
    <div className="world-placeholder absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background }}>
      <div className="placeholder-orbit placeholder-orbit-large" />
      <div className="placeholder-orbit placeholder-orbit-small" />
      <span className={`placeholder-letter select-none font-extralight tracking-wide text-white/45 ${compact ? "text-xl" : "text-7xl"}`}>
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="placeholder-point placeholder-point-one" />
      <span className="placeholder-point placeholder-point-two" />
    </div>
  );
}
