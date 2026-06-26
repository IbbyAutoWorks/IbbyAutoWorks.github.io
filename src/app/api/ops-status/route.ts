import { NextResponse } from "next/server";

import { appBuild, appVersion } from "@/lib/app-meta";

export const dynamic = "force-static";
export const revalidate = 60;

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

const TIMEOUT_MS = 9000;

function env(name: string) {
  return process.env[name]?.trim().replace(/^['"]+|['"]+$/g, "") || "";
}

function colorFromResponse(status: number, okGreen = true): HealthColor {
  if (status >= 200 && status < 300) return okGreen ? "green" : "yellow";
  if (status >= 400 && status < 500) return "yellow";
  return "red";
}

async function readJson(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "application/json",
        ...(init.headers || {})
      }
    });
    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { ok: response.ok, status: response.status, data, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function head(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store", signal: controller.signal });
    return { ok: response.ok, status: response.status };
  } finally {
    clearTimeout(timeout);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function dateFromMs(value: unknown) {
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "string" && /^\d+$/.test(value)) return new Date(Number(value)).toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function configuredMissing(id: string, label: string, missing: string[], href?: string): ProviderHealth {
  return {
    id,
    label,
    color: "yellow",
    summary: "Credentials not configured",
    detail: `Missing server env: ${missing.join(", ")}`,
    checkedAt: new Date().toISOString(),
    href
  };
}

async function githubStatus(now: string): Promise<ProviderHealth> {
  const token = env("GITHUB_APP_REPO_TOKEN") || env("GITHUB_TOKEN");
  const headers: HeadersInit = token ? { authorization: "Bearer " + token } : {};
  const result = await readJson("https://api.github.com/repos/IbbyAutoWorks/IbbyAutoWorks.github.io/actions/runs?per_page=1", { headers });
  if (!result.ok) {
    return { id: "github", label: "GitHub", color: colorFromResponse(result.status), summary: `GitHub API ${result.status}`, detail: String(result.text).slice(0, 180), checkedAt: now, href: "https://github.com/IbbyAutoWorks/IbbyAutoWorks.github.io" };
  }
  const run = (asRecord(result.data).workflow_runs as Array<Record<string, unknown>> | undefined)?.[0] ?? {};
  const conclusion = String(run.conclusion || "pending");
  const status = String(run.status || "unknown");
  const sha = String(run.head_sha || env("VERCEL_GIT_COMMIT_SHA") || "").slice(0, 7);
  return {
    id: "github",
    label: "GitHub",
    color: conclusion === "success" ? "green" : status === "completed" ? "red" : "yellow",
    summary: `${status}${conclusion !== "pending" ? ` / ${conclusion}` : ""}`,
    detail: sha ? `Latest repo build checked at commit ${sha}.` : "Latest repository workflow checked.",
    checkedAt: now,
    lastEventAt: dateFromMs(run.updated_at),
    href: String(run.html_url || "https://github.com/IbbyAutoWorks/IbbyAutoWorks.github.io/actions")
  };
}

async function vercelStatus(now: string): Promise<ProviderHealth> {
  const token = env("VERCEL_TOKEN");
  const projectId = env("IBBY_VERCEL_PROJECT_ID");
  if (!token || !projectId) return configuredMissing("vercel", "Vercel", [!token && "VERCEL_TOKEN", !projectId && "IBBY_VERCEL_PROJECT_ID"].filter(Boolean) as string[], "https://vercel.com/dashboard");
  const result = await readJson(`https://api.vercel.com/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=1`, { headers: { authorization: "Bearer " + token } });
  if (!result.ok) {
    return { id: "vercel", label: "Vercel", color: colorFromResponse(result.status), summary: `Vercel API ${result.status}`, detail: String(result.text).slice(0, 180), checkedAt: now, href: "https://vercel.com/dashboard" };
  }
  const deployment = (asRecord(result.data).deployments as Array<Record<string, unknown>> | undefined)?.[0] ?? {};
  const state = String(deployment.state || "unknown");
  const url = String(deployment.url || "");
  return {
    id: "vercel",
    label: "Vercel",
    color: state === "READY" ? "green" : state === "ERROR" || state === "CANCELED" ? "red" : "yellow",
    summary: state,
    detail: url ? `Latest deployment: ${url}` : "No deployment returned by Vercel.",
    checkedAt: now,
    lastEventAt: dateFromMs(deployment.createdAt),
    href: url ? `https://${url}` : env("IBBY_VERCEL_PROJECT_URL") || "https://vercel.com/dashboard"
  };
}

async function supabaseStatus(now: string): Promise<ProviderHealth> {
  const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_URL");
  const publicKey = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") || env("NEXT_PUBLIC_SUPABASE_ANON_KEY") || env("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !publicKey) return configuredMissing("supabase", "Supabase", [!supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL", !publicKey && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"].filter(Boolean) as string[], "https://supabase.com/dashboard");
  const settings = await readJson(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: publicKey, authorization: "Bearer " + publicKey } });
  const color = settings.ok ? "green" : colorFromResponse(settings.status);
  return {
    id: "supabase",
    label: "Supabase",
    color,
    summary: settings.ok ? "Auth API reachable" : `Auth API ${settings.status}`,
    detail: settings.ok ? "Browser-safe Supabase env is configured and Auth settings respond." : String(settings.text).slice(0, 180),
    checkedAt: now,
    href: "https://supabase.com/dashboard/project/cqdlqdzmnylywctlsklp"
  };
}

async function cloudflareStatus(now: string): Promise<ProviderHealth> {
  const token = env("CLOUDFLARE_API_TOKEN") || env("CLOUDFLARE_TOKEN");
  if (!token) return configuredMissing("cloudflare", "Cloudflare", ["CLOUDFLARE_API_TOKEN"], "https://dash.cloudflare.com/");
  const result = await readJson("https://api.cloudflare.com/client/v4/user/tokens/verify", { headers: { authorization: "Bearer " + token } });
  const data = asRecord(result.data);
  const cfSuccess = data.success === true;
  return {
    id: "cloudflare",
    label: "Cloudflare",
    color: cfSuccess ? "green" : result.status === 401 ? "red" : colorFromResponse(result.status),
    summary: cfSuccess ? "Token verified" : `Token check ${result.status}`,
    detail: cfSuccess ? "Cloudflare API token is valid for status checks." : String(result.text).slice(0, 180),
    checkedAt: now,
    href: "https://dash.cloudflare.com/"
  };
}

async function stripeStatus(now: string): Promise<ProviderHealth> {
  const key = env("STRIPE_SECRET_KEY_TEST") || env("STRIPE_RESTRICTED_KEY_TEST");
  if (!key) return configuredMissing("stripe", "Stripe", ["STRIPE_SECRET_KEY_TEST or STRIPE_RESTRICTED_KEY_TEST"], "https://dashboard.stripe.com/dashboard");
  const auth = Buffer.from(`${key}:`).toString("base64");
  const result = await readJson("https://api.stripe.com/v1/products?limit=1", { headers: { authorization: "Basic " + auth } });
  return {
    id: "stripe",
    label: "Stripe",
    color: result.ok ? "green" : colorFromResponse(result.status),
    summary: result.ok ? "API reachable" : `Stripe API ${result.status}`,
    detail: result.ok ? "Stripe test API responded to a read-only product check." : String(result.text).slice(0, 180),
    checkedAt: now,
    href: "https://dashboard.stripe.com/dashboard"
  };
}

async function publicSiteStatus(now: string): Promise<ProviderHealth> {
  const url = env("IBBY_VERCEL_PROJECT_URL") || "https://ibbyautoworks.vercel.app/";
  const result = await head(url);
  return {
    id: "public-site",
    label: "Public app",
    color: result.ok ? "green" : colorFromResponse(result.status),
    summary: result.ok ? "HTTP 200" : `HTTP ${result.status}`,
    detail: `${url} responded to a no-cache HEAD check.`,
    checkedAt: now,
    href: url
  };
}

export async function GET() {
  const now = new Date().toISOString();
  if (env("VERCEL") !== "1") {
    return NextResponse.json({
      ok: false,
      overall: "yellow",
      app: { version: appVersion, build: appBuild, commit: env("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA") || "static-export" },
      services: [{
        id: "static-export",
        label: "Static export",
        color: "yellow",
        summary: "Server checks disabled",
        detail: "GitHub Pages/static exports cannot safely run provider-token health checks. Use the Vercel deployment for live GitHub, Vercel, Supabase, Cloudflare, and Stripe status.",
        checkedAt: now,
        href: "https://ibbyautoworks.vercel.app/"
      }]
    }, { headers: { "cache-control": "no-store" } });
  }
  const checks = await Promise.allSettled([
    githubStatus(now),
    vercelStatus(now),
    supabaseStatus(now),
    cloudflareStatus(now),
    stripeStatus(now),
    publicSiteStatus(now)
  ]);
  const services = checks.map((check, index) => check.status === "fulfilled" ? check.value : {
    id: `service-${index}`,
    label: "Service check",
    color: "red" as const,
    summary: "Check failed",
    detail: check.reason instanceof Error ? check.reason.message : String(check.reason),
    checkedAt: now
  });
  const overall: HealthColor = services.some((service) => service.color === "red") ? "red" : services.some((service) => service.color === "yellow") ? "yellow" : "green";
  return NextResponse.json({
    ok: overall !== "red",
    overall,
    app: {
      version: env("NEXT_PUBLIC_APP_VERSION") || appVersion,
      build: env("NEXT_PUBLIC_APP_BUILD") || appBuild,
      commit: env("VERCEL_GIT_COMMIT_SHA") || env("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA") || "local"
    },
    services
  }, { headers: { "cache-control": "no-store" } });
}
