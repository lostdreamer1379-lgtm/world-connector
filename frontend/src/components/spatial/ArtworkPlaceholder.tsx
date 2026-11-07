interface ArtworkPlaceholderProps {
  name: string;
  accentColor?: string | null;
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
export default function ArtworkPlaceholder({ name, accentColor }: ArtworkPlaceholderProps) {
  const hue = hashHue(name);
  const background = accentColor
    ? `linear-gradient(150deg, ${accentColor}2e, #141416 72%)`
    : `linear-gradient(150deg, hsl(${hue} 16% 20%), #141416 72%)`;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background }}>
      <span className="select-none text-6xl font-extralight tracking-wide text-white/20">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
