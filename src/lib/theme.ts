export const THEME_STORAGE_KEY = "ibbys-auto.theme";

export type ThemeRoleColors = {
  "Primary buttons": string;
  Sidebar: string;
  "Page background": string;
  "Accent icons": string;
};

export function applyTheme(roleColors: ThemeRoleColors) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.style.setProperty("--red", roleColors["Primary buttons"]);
  root.style.setProperty("--red-dark", roleColors["Primary buttons"]);
  root.style.setProperty("--sidebar-bg", roleColors.Sidebar);
  root.style.setProperty("--canvas", roleColors["Page background"]);
  root.style.setProperty("--gold", roleColors["Accent icons"]);
  root.style.setProperty("--theme-accent", roleColors["Accent icons"]);
}

export function saveTheme(roleColors: ThemeRoleColors) {
  applyTheme(roleColors);
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(roleColors));
}

export function readSavedTheme(): ThemeRoleColors | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) as ThemeRoleColors : null;
  } catch {
    return null;
  }
}

export function applySavedTheme() {
  const savedTheme = readSavedTheme();
  if (savedTheme) applyTheme(savedTheme);
}
