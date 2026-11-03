"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, KeyRound, Mail, MessageSquare, Save, Search } from "lucide-react";

import { IntegrationHub } from "@/components/integration-hub";
import { OpsStatusPanel } from "@/components/ops-status-panel";
import { connectionStatus, saveConnection, sendTestEmail, type ConnectionStatus } from "@/lib/integrations";

type KeyField = { name: string; label: string; secret?: boolean };

const groups: { title: string; icon: React.ReactNode; intro: string; steps?: string[]; links?: { label: string; href: string }[]; fields: KeyField[] }[] = [
  {
    title: "Customer emails (free)",
    icon: <Mail />,
    intro: "Sends request, appointment, on-the-way, completion and next-service emails from your Gmail to customers who chose to be notified.",
    steps: [
      "In Google Cloud, create a project and turn on the Gmail API.",
      "Set up the OAuth consent screen as External, add the gmail.send scope, and publish it In production. In Testing mode, the connection stops after 7 days.",
      "Create an OAuth client of type Web application, with https://developers.google.com/oauthplayground as a redirect address.",
      "In the OAuth Playground, turn on \"Use your own OAuth credentials\", authorize gmail.send with your shop Gmail, and exchange the code for a refresh token. Google will warn the app isn't verified; that's expected for your own account.",
      "Paste the three values below, then tap Send me a test email."
    ],
    links: [
      { label: "Google Cloud credentials", href: "https://console.cloud.google.com/apis/credentials" },
      { label: "OAuth Playground", href: "https://developers.google.com/oauthplayground" }
    ],
    fields: [
      { name: "google_oauth_client_id", label: "Google client ID", secret: true },
      { name: "google_oauth_client_secret", label: "Google client secret", secret: true },
      { name: "google_oauth_refresh_token", label: "Google refresh token", secret: true },
      { name: "business_mailing_address", label: "Mailing address (required before coupons can go in emails)" }
    ]
  },
  {
    title: "Spec lookup (free tiers)",
    icon: <Search />,
    intro: "Lets the spec sheet search trusted sites for torques, fluids and capacities, and shows the exact sentence and page each answer came from. Answers not found word for word on the page are thrown out. Only the vehicle and the question are sent, never customer details.",
    steps: [
      "Get a Tavily key: 1,000 free search credits a month, no card.",
      "Get a Gemini key from Google AI Studio. On the free tier, Google may use and review what's sent, which is why customer details are never included.",
      "Paste both below. For brakes, steering, suspension and wheels, still confirm against a factory source."
    ],
    links: [
      { label: "Tavily", href: "https://www.tavily.com/pricing" },
      { label: "Google AI Studio", href: "https://aistudio.google.com/" }
    ],
    fields: [
      { name: "tavily_api_key", label: "Tavily API key", secret: true },
      { name: "gemini_api_key", label: "Gemini API key", secret: true }
    ]
  },
  {
    title: "Problem reports to GitHub",
    icon: <KeyRound />,
    intro: "Files Report a problem and Request a feature messages as GitHub issues. Without it, they're still saved in the app under Feedback.",
    steps: ["Create a fine-grained GitHub token for the IbbyAutoWorks/IbbyAutoWorks repository, with Issues set to read and write.", "Paste it below."],
    links: [{ label: "GitHub tokens", href: "https://github.com/settings/personal-access-tokens/new" }],
    fields: [{ name: "github_issues_token", label: "GitHub token", secret: true }]
  },
  {
    title: "Paid data services (for later)",
    icon: <KeyRound />,
    intro: "You don't need these to run the shop. A key saved here is kept safe, but the app won't show that service's data until the connection is built for it, so ask for that once you've picked one.",
    fields: [
      { name: "vehicledatabases_api_key", label: "Vehicle Databases API key", secret: true },
      { name: "motor_api_key", label: "MOTOR API key", secret: true },
      { name: "partstech_api_key", label: "PartsTech API key", secret: true },
      { name: "ebay_api_key", label: "eBay API key", secret: true }
    ]
  }
];

const options = [
  { name: "PartsTech web app", cost: "Free plan; Plus $45/mo, Complete $85/mo", gives: "Live local price and stock across O'Reilly, NAPA, AutoZone, Advance and more. You log in on their site. This is the best free way to find the exact part.", href: "https://partstech.com/pricing/" },
  { name: "NHTSA vPIC and recalls", cost: "Free, already in the app", gives: "VIN decoding and recalls. No torque or fluid data.", href: "https://vpic.nhtsa.dot.gov/api/" },
  { name: "Vehicle Databases", cost: "Free trial credits; plans from about $50 to $2,500/mo, confirm with them", gives: "Maintenance schedules, repair estimates, engine oil capacity and drain plug torque only.", href: "https://vehicledatabases.com/api" },
  { name: "MOTOR", cost: "Quote only", gives: "Labor times, fluid types and capacities, and specifications. Ask them to confirm fastener torques.", href: "https://www.motor.com/products/" },
  { name: "PartsTech API", cost: "Quote only", gives: "Parts search built into the app. The free web app covers most of this.", href: "https://partstech.com/api-agreement-terms/" },
  { name: "eBay Browse API", cost: "No listed fee; approval isn't guaranteed", gives: "Marketplace listings with fitment hints. A POSSIBLE match isn't confirmed fitment.", href: "https://developer.ebay.com/api-docs/buy/static/api-browse.html" },
  { name: "Texting: Telnyx or Twilio", cost: "About $4-$12/mo at 100 texts, plus about $20 to register", gives: "Automatic texts to customers. This is the first paid service worth adding.", href: "https://www.twilio.com/en-us/sms/pricing/us" }
];

// Where the owner connects outside services. Values go to the server and are never shown again.
export function ConnectionsPanel() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    connectionStatus().then(setStatus).catch((error) => setMessage(error.message));
  }, []);

  useEffect(refresh, [refresh]);

  const savedAt = (name: string) => status?.saved.find((item) => item.name === name)?.updatedAt;

  async function save(field: KeyField, value: string) {
    setBusy(true);
    try {
      await saveConnection(field.name, value);
      setDrafts((current) => ({ ...current, [field.name]: "" }));
      setMessage(value ? `${field.label} saved.` : `${field.label} removed.`);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    try {
      const result = await sendTestEmail();
      setMessage(`Test email sent to ${result.sentTo}. Check that inbox.`);
      refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="business-dashboard connections-page">
      <div className="panel">
        <div className="panel-title"><div><p className="section-label">Connections</p><h2>Outside services</h2></div><KeyRound /></div>
        <p className="legal-note">Keys you paste here are stored on the server and can&apos;t be read back, even by you. To change one, paste the new value over it.</p>
        {message ? <p className="legal-note" role="status">{message}</p> : null}
      </div>

      {groups.map((group) => (
        <div className="panel" key={group.title}>
          <div className="panel-title"><h2>{group.title}</h2>{group.icon}</div>
          <p className="legal-note">{group.intro}</p>
          {group.steps ? <ol className="connection-steps">{group.steps.map((step) => <li key={step}>{step}</li>)}</ol> : null}
          {group.links ? <div className="research-link-row">{group.links.map((link) => <a className="secondary-button" href={link.href} key={link.href} rel="noopener noreferrer" target="_blank"><ExternalLink size={13} /> {link.label}</a>)}</div> : null}
          <div className="connection-fields">
            {group.fields.map((field) => (
              <div className="connection-field" key={field.name}>
                <label>
                  <span>{field.label} {savedAt(field.name) ? <em><CheckCircle2 size={13} /> Saved</em> : null}</span>
                  <input autoComplete="off" type={field.secret ? "password" : "text"} placeholder={savedAt(field.name) ? "Saved. Paste a new value to replace it" : "Paste here"} value={drafts[field.name] ?? ""} onChange={(event) => setDrafts({ ...drafts, [field.name]: event.target.value })} />
                </label>
                <div className="help-actions">
                  <button className="secondary-button" disabled={busy || !drafts[field.name]?.trim()} onClick={() => save(field, drafts[field.name])} type="button"><Save size={14} /> Save</button>
                  {savedAt(field.name) ? <button className="link-button" disabled={busy} onClick={() => save(field, "")} type="button">Remove</button> : null}
                </div>
              </div>
            ))}
          </div>
          {group.title.startsWith("Customer emails") ? (
            <>
              <button className="primary-button" disabled={busy} onClick={test} type="button"><Mail size={15} /> Send me a test email</button>
              {status ? <p className="legal-note">Emails waiting: {status.email.queued}. Sent: {status.email.sent}. Failed: {status.email.failed}.</p> : null}
              {status?.email.connectionError ? <p className="legal-note" role="alert">Gmail connection problem: {status.email.connectionError}. Changing your Google password or 6 months without use can end the connection, so make a new refresh token.</p> : null}
              {status?.email.lastFailure ? <p className="legal-note" role="alert">Last failed email: {status.email.lastFailure}</p> : null}
            </>
          ) : null}
        </div>
      ))}

      <OpsStatusPanel />
      <IntegrationHub />

      <div className="panel">
        <div className="panel-title"><h2>Text messages</h2><MessageSquare /></div>
        <p className="legal-note">Google Voice has no public API and its policy bars automated messages, so the app can&apos;t send through it. AT&amp;T has shut down its free email-to-text gateway and Verizon is ending its own. What works for free: on a job, Text customer opens your phone&apos;s messages with the words filled in, and Copy text lets you paste them into Google Voice. Automatic texts need a paid service, listed below.</p>
      </div>

      <div className="panel">
        <div className="panel-title"><div><p className="section-label">Checked November 2026; confirm prices with each company</p><h2>Parts and data services</h2></div><Search /></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Service</th><th>Cost</th><th>What you get</th></tr></thead>
            <tbody>
              {options.map((option) => <tr key={option.name}><td><a href={option.href} rel="noopener noreferrer" target="_blank">{option.name}</a></td><td>{option.cost}</td><td>{option.gives}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p className="legal-note">No API we checked has confirmed full fastener torque tables. For those, a subscription like ALLDATA or Mitchell or the factory service manual is still the sure source.</p>
      </div>
    </div>
  );
}
