"use client";

import { useEffect, useState } from "react";
import { Menu, Settings, X } from "lucide-react";

import { WorkOrderSearch } from "@/components/work-order-search";

import { BRANDING_EVENT, logoSrcForBranding, readSavedBranding } from "@/lib/branding";
import { nav } from "@/lib/data";
import { useAuthRole } from "@/components/auth-gate";
import { BurnoutNavLink } from "@/components/route-burnout-loader";
import { SiteFooter } from "@/components/site-footer";

export function AppShell({ children, active }: { children: React.ReactNode; active: "home" | "request" | "account" | "customer-settings" | "admin" | "service" | "service-settings" | "settings" }) {
  // Shell state: controls the mobile sidebar and decides which settings route is active.
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandLogoSrc, setBrandLogoSrc] = useState("/images/ibby-auto-emblem-256.png");
  const { session, role } = useAuthRole();
  const serviceSettingsActive = active === "service" || active === "service-settings";
  // Owner sees everything (including the Service portal for solo jobs); technicians
  // see the Service portal; signed-in customers see their account.
  const isOwner = role === "admin";
  const isTech = role === "staff";
  const isSignedInCustomer = Boolean(session) && !isOwner && !isTech;
  // Settings lives on the gear icon, and Home is only for visitors who aren't signed in.
  const visibleHrefs = isOwner
    ? ["/admin", "/service", "/account"]
    : isTech
      ? ["/service", "/account"]
      : isSignedInCustomer
        ? ["/request", "/account"]
        : ["/", "/request", "/account"];
  const visibleNav = visibleHrefs.flatMap((href) => nav.filter((item) => item.href === href));
  const settingsHref = isSignedInCustomer ? "/account/settings" : isTech || serviceSettingsActive ? "/service/settings" : "/admin/settings";
  const settingsLabel = isSignedInCustomer ? "Customer settings" : isTech || serviceSettingsActive ? "Service settings" : "Admin settings";
  const signedIn = isOwner || isTech || isSignedInCustomer;

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
      </aside>
      {/* Main pane: mobile menu button, global search placeholder, settings shortcut, and page content. */}
      <main className="main-pane">
        <header className="topbar">
          <button className="icon-button" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((current) => !current)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {isOwner || isTech ? <WorkOrderSearch basePath={isOwner ? "/admin" : "/service"} /> : <strong className="topbar-brand">Ibby Auto Works™</strong>}
          {signedIn ? (
            <BurnoutNavLink href={settingsHref} active={active === "settings"} className="icon-button" aria-label={settingsLabel}>
              <Settings size={18} />
            </BurnoutNavLink>
          ) : null}
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
