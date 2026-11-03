// In-app "Report a problem" / "Request a feature". Stores every submission, then files
// it as a GitHub issue when GITHUB_ISSUES_TOKEN is set (fine-grained token with Issues
// read/write on the repo below). Public endpoint, so input is bounded and rate limited.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const repo = Deno.env.get("GITHUB_ISSUES_REPO") || "IbbyAutoWorks/IbbyAutoWorks";
const token = Deno.env.get("GITHUB_ISSUES_TOKEN") || "";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("IB_SUPABASE_SECRET_KEY") || Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);
const headers = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS"
};
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers });
const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return reply(405, { ok: false, error: "POST only" });
  const body = await req.json().catch(() => ({}));

  // Bots fill the hidden field; answer as if it worked and keep nothing.
  if (text(body.website, 100)) return reply(200, { ok: true });

  const kind = body.kind === "feature" ? "feature" : "issue";
  const title = text(body.title, 120);
  const details = text(body.details, 4000);
  const contact = text(body.contact, 160);
  const page = text(body.page, 300);
  if (title.length < 3 || details.length < 5) return reply(400, { ok: false, error: "Add a title and a few details." });

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase.from("feedback_items").select("id", { count: "exact", head: true }).gte("created_at", since);
  if ((count ?? 0) >= 20) return reply(429, { ok: false, error: "Lots of messages right now. Please try again in a few minutes." });

  const { data: row, error } = await supabase.from("feedback_items").insert({ kind, title, details, contact, page }).select("id").single();
  if (error) return reply(500, { ok: false, error: "That didn't save. Please try again." });

  let issueUrl = "";
  if (token) {
    // The repo is public, so contact details stay in the app and never go on the issue.
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "ibby-feedback" },
      body: JSON.stringify({
        title,
        body: `${details}\n\n---\nSent from the Ibby Auto Works app${page ? ` (from ${page})` : ""}. Reference: ${row.id}`,
        labels: [kind === "feature" ? "enhancement" : "bug"]
      })
    });
    if (response.ok) {
      issueUrl = (await response.json()).html_url ?? "";
      await supabase.from("feedback_items").update({ github_url: issueUrl }).eq("id", row.id);
    }
  }
  return reply(200, { ok: true, filed: Boolean(issueUrl) });
});
