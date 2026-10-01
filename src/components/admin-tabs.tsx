"use client";

import { usePathname } from "next/navigation";

import { BurnoutNavLink } from "@/components/route-burnout-loader";

// Owner area sections, each its own page so no single screen gets overloaded.
export const adminSections = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/new", label: "New work order" },
  { href: "/admin/business", label: "Business" },
  { href: "/admin/taxes", label: "Taxes & books" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/services", label: "Services & accounts" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/manual", label: "Owner manual" }
];

export function AdminTabs() {
  const pathname = (usePathname() || "/admin").replace(/\/$/, "") || "/admin";
  return (
    <nav className="admin-tabs" aria-label="Owner sections">
      {adminSections.map((section) => (
        <BurnoutNavLink key={section.href} href={section.href} active={pathname === section.href} className="admin-tab">
          {section.label}
        </BurnoutNavLink>
      ))}
    </nav>
  );
}
