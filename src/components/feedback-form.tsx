"use client";

import { useEffect, useState } from "react";
import { Bug, Lightbulb, Send } from "lucide-react";

import { getCurrentSupabaseSession } from "@/lib/supabase-client";
import { sendFeedback, type FeedbackKind } from "@/lib/feedback";

// Report a problem or request a feature from inside the app.
export function FeedbackForm() {
  const [kind, setKind] = useState<FeedbackKind>("issue");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // hidden field; only bots fill it in
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("type") === "feature") setKind("feature");
    getCurrentSupabaseSession().then((session) => { if (session?.user?.email) setContact(session.user.email); });
  }, []);

  async function submit() {
    if (title.trim().length < 3) return setStatus("Add a short title first.");
    if (details.trim().length < 5) return setStatus("Add a few details so we can act on it.");
    setBusy(true);
    setStatus("Sending...");
    try {
      await sendFeedback({ kind, title: title.trim(), details: details.trim(), contact: contact.trim(), page: document.referrer, website });
      setTitle("");
      setDetails("");
      setStatus("Thanks - we got it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That didn't send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <p className="section-label">Feedback</p>
      <h1>{kind === "issue" ? "Report a problem" : "Request a feature"}</h1>
      <div className="tier-card-grid" role="radiogroup" aria-label="Type of feedback">
        <button className={kind === "issue" ? "tier-card selected" : "tier-card"} onClick={() => setKind("issue")} role="radio" aria-checked={kind === "issue"} type="button"><strong><Bug size={15} /> Something isn&apos;t working</strong></button>
        <button className={kind === "feature" ? "tier-card selected" : "tier-card"} onClick={() => setKind("feature")} role="radio" aria-checked={kind === "feature"} type="button"><strong><Lightbulb size={15} /> I have an idea</strong></button>
      </div>
      <label className="wide-field"><span>Title</span><input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === "issue" ? "Scan VIN button does nothing" : "Text me when my car is ready"} /></label>
      <label className="wide-field"><span>{kind === "issue" ? "What happened, and what did you expect?" : "What would you like it to do?"}</span><textarea maxLength={4000} rows={6} value={details} onChange={(event) => setDetails(event.target.value)} /></label>
      <label className="wide-field"><span>Email or phone, if you&apos;d like a reply (optional)</span><input maxLength={160} value={contact} onChange={(event) => setContact(event.target.value)} /></label>
      <input aria-hidden="true" autoComplete="off" className="feedback-trap" tabIndex={-1} value={website} onChange={(event) => setWebsite(event.target.value)} />
      <button className="primary-button" disabled={busy} onClick={submit} type="button"><Send size={15} /> Send</button>
      {status ? <p className="legal-note" role="status">{status}</p> : null}
    </section>
  );
}
