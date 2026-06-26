"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Settings, X } from "lucide-react";

import { BRANDING_EVENT, logoSrcForBranding, readSavedBranding } from "@/lib/branding";
import { nav } from "@/lib/data";
import { isAdminSession } from "@/lib/auth-roles";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";
import { BurnoutNavLink } from "@/components/route-burnout-loader";
import { SiteFooter } from "@/components/site-footer";

export function AppShell({ children, active }: { children: React.ReactNode; active: "home" | "request" | "account" | "customer-settings" | "admin" | "service" | "service-settings" | "settings" }) {
  // Shell state: controls the mobile sidebar and decides which settings route is active.
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandLogoSrc, setBrandLogoSrc] = useState("/images/ibby-auto-emblem.png");
  const [session, setSession] = useState<Session | null>(null);
  const customerSettingsActive = active === "account" || active === "customer-settings";
  const serviceSettingsActive = active === "service" || active === "service-settings";
  const isAdmin = isAdminSession(session);
  const isSignedInCustomer = Boolean(session) && !isAdmin;
  const visibleNav = isSignedInCustomer ? nav.filter((item) => item.href === "/account") : isAdmin ? nav : nav.filter((item) => !["/admin", "/service", "/admin/settings"].includes(item.href));
  const settingsHref = isSignedInCustomer ? "/account/settings" : serviceSettingsActive ? "/service/settings" : "/admin/settings";
  const settingsLabel = isSignedInCustomer ? "Customer settings" : serviceSettingsActive ? "Service settings" : "Admin settings";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      return () => listener.subscription.unsubscribe();
    }
  }, []);

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
          {visibleNav.map((item) => (
            <BurnoutNavLink key={item.href} href={item.href} active={active === item.label.toLowerCase() || (active === "customer-settings" && item.href === "/account")} onClick={() => setMenuOpen(false)}>
              {item.label}
            </BurnoutNavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span>Cloud operations</span>
          <strong>Next + Supabase + Vercel</strong>
          <p>Live requests now. Google archive/calendar and Cloudflare health are being wired in.</p>
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
        <SiteFooter context={active === "settings" ? "admin-settings" : active} />
      </main>
    </div>
  );
}

function IbbyEmblemMark({ src }: { src: string }) {
  return (
    <img src={src} alt="" aria-hidden="true" />
  );
}
