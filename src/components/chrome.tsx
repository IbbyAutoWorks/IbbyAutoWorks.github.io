"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Settings, X } from "lucide-react";

import { BRANDING_EVENT, logoSrcForBranding, readSavedBranding } from "@/lib/branding";
import { nav } from "@/lib/data";
import { BurnoutNavLink } from "@/components/route-burnout-loader";

export function AppShell({ children, active }: { children: React.ReactNode; active: "home" | "request" | "account" | "customer-settings" | "admin" | "service" | "settings" }) {
  // Shell state: controls the mobile sidebar and decides which settings route is active.
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandLogoSrc, setBrandLogoSrc] = useState("/images/ibby-auto-emblem.png");
  const customerSettingsActive = active === "account" || active === "customer-settings";
  const settingsHref = customerSettingsActive ? "/account/settings" : "/admin/settings";
  const settingsLabel = customerSettingsActive ? "Customer settings" : "Admin settings";

  useEffect(() => {
    function syncBranding() {
      setBrandLogoSrc(logoSrcForBranding(readSavedBranding()));
    }

    syncBranding();
    window.addEventListener(BRANDING_EVENT, syncBranding);
    window.addEventListener("storage", syncBranding);
    return () => {
      window.removeEventListener(BRANDING_EVENT, syncBranding);
      window.removeEventListener("storage", syncBranding);
    };
  }, []);

  return (
    <div className={menuOpen ? "app-shell menu-open" : "app-shell"}>
      {/* Sidebar: brand mark, primary navigation, and prototype stack note. */}
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <IbbyEmblemMark src={brandLogoSrc} />
          </div>
          <div>
            <strong>Ibby Auto Works™</strong>
            <span>Mobile repair ops</span>
          </div>
        </div>
        <nav>
          {nav.map((item) => (
            <BurnoutNavLink key={item.href} href={item.href} active={active === item.label.toLowerCase() || (active === "customer-settings" && item.href === "/account")} onClick={() => setMenuOpen(false)}>
              {item.label}
            </BurnoutNavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span>Free-stack mode</span>
          <strong>Expo + Next + Supabase-ready</strong>
          <p>Local preview now. Cloudflare/Supabase later.</p>
        </div>
      </aside>
      {/* Main pane: mobile menu button, global search placeholder, settings shortcut, and page content. */}
      <main className="main-pane">
        <header className="topbar">
          <button className="icon-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((current) => !current)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="search-box"><Search size={16} /><span>Search work orders, VINs, customers, parts</span></div>
          <BurnoutNavLink href={settingsHref} active={active === "settings"} className="icon-button" aria-label={settingsLabel}>
            <Settings size={18} />
          </BurnoutNavLink>
        </header>
        {children}
        <footer className="site-footer" aria-label="Ibby Auto Works legal and support links">
          <div>
            <strong>Ibby Auto Works™</strong>
            <span>© 2026 Ibby Auto Works™. All rights reserved.</span>
          </div>
          <nav aria-label="Footer links">
            <a href="https://github.com/IbbyAutoWorks/IbbyAutoWorks/blob/main/docs/privacy-policy.md" target="_blank" rel="noreferrer">Privacy Policy</a>
            <a href="https://github.com/IbbyAutoWorks/IbbyAutoWorks/blob/main/docs/terms-of-service.md" target="_blank" rel="noreferrer">Terms of Service</a>
            <a href="https://github.com/IbbyAutoWorks/IbbyAutoWorks/issues" target="_blank" rel="noreferrer">Issues</a>
            <a href="https://github.com/IbbyAutoWorks/IbbyAutoWorks/issues" target="_blank" rel="noreferrer">Request Feature</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}

function IbbyEmblemMark({ src }: { src: string }) {
  return (
    <img src={src} alt="" aria-hidden="true" />
  );
}
