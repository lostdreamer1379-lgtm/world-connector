export interface AppTheme { id: string; name: string; background: string; surface: string; accent: string }
export const THEMES: AppTheme[] = [
  { id: "obsidian", name: "Obsidian", background: "#050506", surface: "#111113", accent: "#77747c" },
  { id: "eclipse", name: "Eclipse", background: "#07090d", surface: "#12151b", accent: "#7889a8" },
  { id: "forest", name: "Still Forest", background: "#050907", surface: "#101713", accent: "#738978" },
  { id: "ember", name: "Ember", background: "#0a0706", surface: "#17110e", accent: "#a08069" },
  { id: "plum", name: "After Hours", background: "#090609", surface: "#171018", accent: "#987b9c" },
  { id: "ocean", name: "Deep Ocean", background: "#05080a", surface: "#11171a", accent: "#708c94" },
  { id: "mono", name: "Graphite", background: "#080808", surface: "#171717", accent: "#999999" },
];
export const DEFAULT_THEME = THEMES[0];
