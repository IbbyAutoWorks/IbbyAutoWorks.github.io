"use client";

import { useEffect } from "react";

import { applySavedBranding } from "@/lib/branding";
import { SHARED_SETTINGS_PULLED_EVENT } from "@/lib/shared-settings";
import { applySavedTheme } from "@/lib/theme";

export function ThemeBoot() {
  useEffect(() => {
    const apply = () => {
      applySavedTheme();
      applySavedBranding();
    };
    apply();
    window.addEventListener(SHARED_SETTINGS_PULLED_EVENT, apply);
    return () => window.removeEventListener(SHARED_SETTINGS_PULLED_EVENT, apply);
  }, []);

  return null;
}
