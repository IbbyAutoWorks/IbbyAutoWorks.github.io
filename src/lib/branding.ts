export const BRANDING_STORAGE_KEY = "ibbys-auto.branding";
export const BRANDING_EVENT = "ibbys-auto.branding.changed";

export type FaviconCrownColor = "white" | "black";
export type BrandLogoSource = "emblem" | "crown" | "custom";

export type SavedBrandLogo = {
  id: string;
  name: string;
  src: string;
  savedAt: string;
};

export type BrandingSettings = {
  faviconCrownColor: FaviconCrownColor;
  logoSource: BrandLogoSource;
  customLogoId: string;
  savedLogos: SavedBrandLogo[];
};

export const EMBLEM_LOGO_SRC = "/images/ibby-auto-emblem.png";

export const CROWN_LOGO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#b7192a"/>
  <path d="M15 43h34l4-27-13 10-8-16-8 16-13-10 4 27Z" fill="#fff"/>
  <path d="M17 49h30v6H17z" fill="#fff"/>
  <path d="M24 37h16" stroke="#b7192a" stroke-width="4" stroke-linecap="round"/>
</svg>
`)}`;

const defaultBranding: BrandingSettings = {
  faviconCrownColor: "white",
  logoSource: "emblem",
  customLogoId: "",
  savedLogos: []
};

export function defaultBrandingSettings(): BrandingSettings {
  return { ...defaultBranding, savedLogos: [] };
}

export function readSavedBranding(): BrandingSettings {
  if (typeof localStorage === "undefined") return defaultBrandingSettings();

  try {
    const saved = localStorage.getItem(BRANDING_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as Partial<BrandingSettings>) : {};
    return {
      ...defaultBrandingSettings(),
      ...parsed,
      savedLogos: Array.isArray(parsed.savedLogos) ? parsed.savedLogos : []
    };
  } catch {
    return defaultBrandingSettings();
  }
}

export function logoSrcForBranding(settings: BrandingSettings) {
  if (settings.logoSource === "crown") return CROWN_LOGO_SRC;
  if (settings.logoSource === "custom") {
    return settings.savedLogos.find((logo) => logo.id === settings.customLogoId)?.src ?? EMBLEM_LOGO_SRC;
  }
  return EMBLEM_LOGO_SRC;
}

export function saveBranding(settings: BrandingSettings) {
  applyBranding(settings);
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(BRANDING_EVENT, { detail: settings }));
}

export function applySavedBranding() {
  applyBranding(readSavedBranding());
}

export function applyBranding(settings: BrandingSettings) {
  if (typeof document === "undefined") return;

  const crownFill = settings.faviconCrownColor === "black" ? "#111418" : "#ffffff";
  const notchFill = settings.faviconCrownColor === "black" ? "#ffffff" : "#b7192a";
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="#b7192a"/>
      <path d="M15 43h34l4-27-13 10-8-16-8 16-13-10 4 27Z" fill="${crownFill}"/>
      <path d="M17 49h30v6H17z" fill="${crownFill}"/>
      <path d="M24 37h16" stroke="${notchFill}" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
  const href = `data:image/svg+xml;utf8,${encodeURIComponent(iconSvg)}`;
  const existingIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const iconLink = existingIcon ?? document.createElement("link");
  iconLink.rel = "icon";
  iconLink.type = "image/svg+xml";
  iconLink.href = href;
  if (!existingIcon) document.head.appendChild(iconLink);
}
