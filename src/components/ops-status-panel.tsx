"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ExternalLink, RefreshCcw } from "lucide-react";

import { appBuild, appVersion } from "@/lib/app-meta";

type HealthColor = "green" | "yellow" | "red";

type ProviderHealth = {
  id: string;
  label: string;
  color: HealthColor;
  summary: string;
  detail: string;
  checkedAt: string;
  href?: string;
  lastEventAt?: string;
};

type OpsStatusResponse = {
  ok: boolean;
  overall: HealthColor;
  app: {
    version: string;
    build: string;
    commit: string;
  };
  services: ProviderHealth[];
};

const staticServices: ProviderHealth[] = [
  {
    id: "static-build",
    label: "Static build",
    color: "yellow",
    summary: "Live checks need Vercel API",
    detail: "This host is serving the static export. Open the Vercel deployment for server-side provider checks.",
    checkedAt: new Date().toISOString()
  }
];

function formatWhen(value?: string) {
  if (!value) return "not reported";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function OpsStatusPanel() {
  const [status, setStatus] = useState<OpsStatusResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/ops-status", { cache: "no-store" });
      if (!response.ok) throw new Error(`Status API returned ${response.status}`);
      const data = await response.json() as OpsStatusResponse;
      setStatus(data);
    } catch (caught) {
      setStatus(null);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const services = status?.services?.length ? status.services : staticServices;
  const overall = status?.overall ?? "yellow";
  const versionLabel = useMemo(() => {
    const version = status?.app.version || appVersion;
    const build = status?.app.build || appBuild;
    const commit = status?.app.commit && status.app.commit !== "local" ? status.app.commit.slice(0, 7) : "static";
    return `v${version} / build ${build} / ${commit}`;
  }, [status]);

  return (
    <section className="panel ops-status-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Cloud systems health</p>
          <h2>GitHub, Vercel, Supabase, Cloudflare, Stripe, and public app status.</h2>
        </div>
        <Activity />
      </div>
      <div className={`ops-overall ${overall}`}>
        <span className={`health-dot ${overall}`} />
        <div>
          <strong>{overall === "green" ? "All monitored systems green" : overall === "yellow" ? "Some systems need attention" : "One or more systems are unhealthy"}</strong>
          <small>{versionLabel}</small>
        </div>
        <button className="secondary-button" disabled={loading} onClick={refresh}><RefreshCcw size={15} /> Refresh</button>
      </div>
      {error ? <p className="legal-note">Status API note: {error}</p> : null}
      <div className="ops-status-grid">
        {services.map((service) => (
          <article className={`ops-status-card ${service.color}`} key={service.id}>
            <div>
              <span className={`health-dot ${service.color}`} />
              <strong>{service.label}</strong>
            </div>
            <em>{service.summary}</em>
            <p>{service.detail}</p>
            <small>Checked: {formatWhen(service.checkedAt)}</small>
            <small>Last event: {formatWhen(service.lastEventAt)}</small>
            {service.href ? <a href={service.href} target="_blank" rel="noreferrer">Open <ExternalLink size={13} /></a> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
