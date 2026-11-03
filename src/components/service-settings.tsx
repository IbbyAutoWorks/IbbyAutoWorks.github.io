"use client";

import { BookOpen, LifeBuoy, ShieldCheck, Wrench } from "lucide-react";

import { BurnoutNavLink } from "@/components/route-burnout-loader";

// The technician's reference shelf. Shop-wide settings belong to the owner.
export function ServiceSettings() {
  return (
    <div className="settings-workspace service-settings-page">
      <section className="admin-header">
        <div>
          <p className="section-label">Service settings</p>
          <h1>Service settings</h1>
        </div>
      </section>
      <section className="settings-stack">
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">References</p><h2>Manuals</h2></div><BookOpen /></div>
          <div className="research-link-row">
            <BurnoutNavLink className="secondary-button" href="/service/manual"><Wrench size={15} /> Technician manual</BurnoutNavLink>
            <BurnoutNavLink className="secondary-button" href="/service/manual#safety"><ShieldCheck size={15} /> Safety and PPE</BurnoutNavLink>
            <BurnoutNavLink className="secondary-button" href="/service/manual#basics"><BookOpen size={15} /> Jacking and shop basics</BurnoutNavLink>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">Support</p><h2>Something wrong or missing?</h2></div><LifeBuoy /></div>
          <p className="legal-note">Your name, phone and photo are under Account. Hours, prices and the rest of the shop&apos;s settings are managed by the owner.</p>
          <div className="research-link-row">
            <BurnoutNavLink className="secondary-button" href="/feedback">Report a problem</BurnoutNavLink>
            <BurnoutNavLink className="secondary-button" href="/feedback?type=feature">Request a feature</BurnoutNavLink>
          </div>
        </div>
      </section>
    </div>
  );
}
