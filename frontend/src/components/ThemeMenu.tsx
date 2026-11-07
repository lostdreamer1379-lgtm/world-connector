import { useEffect, useState } from "react";
import { AppTheme, DEFAULT_THEME, THEMES } from "./themes";

const SELECTED_KEY = "world-connector-theme";
const CUSTOM_KEY = "world-connector-custom-themes";
function readCustomThemes(): AppTheme[] { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]") as AppTheme[]; } catch { return []; } }
export function readSavedTheme(): AppTheme {
  try { return [...THEMES, ...readCustomThemes()].find((theme) => theme.id === localStorage.getItem(SELECTED_KEY)) ?? DEFAULT_THEME; }
  catch { return DEFAULT_THEME; }
}

export default function ThemeMenu({ onThemeChange }: { onThemeChange: (theme: AppTheme) => void }) {
  const [open, setOpen] = useState(false);
  const [customThemes, setCustomThemes] = useState<AppTheme[]>(readCustomThemes);
  const [selected, setSelected] = useState<AppTheme>(readSavedTheme);
  const [name, setName] = useState("");
  const [background, setBackground] = useState("#070707");
  const [accent, setAccent] = useState("#887f72");
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);
  function choose(theme: AppTheme) {
    setSelected(theme);
  }
  function applyTheme() {
    try { localStorage.setItem(SELECTED_KEY, selected.id); } catch { /* storage may be unavailable */ }
    // Apply at document level as well as through React so fixed layers and
    // portal-like overlays always receive the theme immediately.
    document.documentElement.style.setProperty("--scene-bg", selected.background);
    document.documentElement.style.setProperty("--scene-surface", selected.surface);
    document.documentElement.style.setProperty("--scene-accent", selected.accent);
    document.body.style.backgroundColor = selected.background;
    onThemeChange(selected);
    setOpen(false);
  }
  function saveCustom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = name.trim();
    if (!label) return;
    const theme: AppTheme = { id: `custom-${Date.now()}`, name: label, background, surface: background, accent };
    const next = [...customThemes, theme];
    setCustomThemes(next);
    try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); } catch { /* storage may be unavailable */ }
    choose(theme);
    setName("");
  }
  return <>
    <button className="top-control-button" onClick={() => { setSelected(readSavedTheme()); setOpen(true); }} aria-label="Choose theme" title="Themes">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.1a1.9 1.9 0 0 0 1.2-3.35 1.7 1.7 0 0 1 1.1-3h1.1A4.5 4.5 0 0 0 21 10.2C21 6.2 17 3 12 3Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="15.5" cy="8" r="1"/></svg>
    </button>
    {open && <div className="theme-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="theme-panel" role="dialog" aria-modal="true" aria-labelledby="theme-title">
        <header className="theme-panel-header"><div><p className="theme-eyebrow">MAKE IT YOURS</p><h2 id="theme-title">Choose a theme</h2></div><button className="world-picker-close" onClick={() => setOpen(false)} aria-label="Close themes">×</button></header>
        <p className="theme-description">Quiet, deep-dark palettes designed for comfortable viewing.</p>
        <div className="theme-grid">{[...THEMES, ...customThemes].map((theme) => <button key={theme.id} className={`theme-option${selected.id === theme.id ? " is-selected" : ""}`} onClick={() => choose(theme)} aria-pressed={selected.id === theme.id}>
          <span className="theme-swatch" style={{ background: `radial-gradient(circle at 70% 25%, ${theme.accent}, transparent 52%), ${theme.background}` }}><i style={{ background: theme.surface }} /></span><span>{theme.name}</span>
        </button>)}</div>
        <div className="theme-apply-row"><span>{selected.name} selected</span><button className="theme-apply-button" onClick={applyTheme}>Apply theme</button></div>
        <form className="theme-builder" onSubmit={saveCustom}><h3>Create your own</h3><label className="theme-name-label">Theme name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Midnight garden" maxLength={24} required /></label><div className="theme-color-fields"><label>Background<input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label><label>Accent<input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /></label><button className="theme-save-button" type="submit">Save theme</button></div></form>
      </section>
    </div>}
  </>;
}
