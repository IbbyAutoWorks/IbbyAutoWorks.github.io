"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Inbox } from "lucide-react";

import { getSupabaseBrowserClient } from "@/lib/supabase-client";

type FeedbackItem = { id: string; kind: "issue" | "feature"; title: string; details: string; contact: string; page: string; github_url: string; created_at: string };

// Everything sent through Report a problem and Request a feature, with the private contact details.
export function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return setStatus("Feedback isn't available in this copy of the app.");
    supabase.from("feedback_items").select("*").order("created_at", { ascending: false }).limit(100).then(({ data, error }) => {
      if (error) return setStatus(error.message);
      setItems((data ?? []) as FeedbackItem[]);
      setStatus("");
    });
  }, []);

  return (
    <div className="panel">
      <div className="panel-title"><div><p className="section-label">From the app</p><h2>Problems and ideas ({items.length})</h2></div><Inbox /></div>
      {status ? <p className="legal-note">{status}</p> : null}
      {!status && !items.length ? <p className="legal-note">Nothing yet.</p> : null}
      <div className="table-scroll">
        {items.length ? (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Type</th><th>Message</th><th>Contact</th><th>GitHub</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>{item.kind === "feature" ? "Idea" : "Problem"}</td>
                  <td><strong>{item.title}</strong><br /><small>{item.details}</small>{item.page ? <><br /><small>From {item.page}</small></> : null}</td>
                  <td>{item.contact || "None"}</td>
                  <td>{item.github_url ? <a href={item.github_url} rel="noopener noreferrer" target="_blank"><ExternalLink size={14} /> Issue</a> : "Not filed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
