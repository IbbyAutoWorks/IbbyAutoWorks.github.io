"use client";

import { useEffect } from "react";

import { applySavedBranding } from "@/lib/branding";
import { applySavedTheme } from "@/lib/theme";

export function ThemeBoot() {
  useEffect(() => {
    applySavedTheme();
    applySavedBranding();
  }, []);

  return null;
}
