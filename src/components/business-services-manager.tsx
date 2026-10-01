"use client";

import { useEffect, useState } from "react";
import { ExternalLink, KeyRound, Plus, Save, Trash2 } from "lucide-react";

import { annualCostCents, billingCycles, deleteBusinessService, emptyService, listBusinessServices, loginMethods, saveBusinessService, type BusinessService } from "@/lib/business-services";

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Owner page: every outside service the business runs on, how to log in, where the
// password lives, and what it costs (feeds the yearly tax summary).
export function BusinessServicesManager() {
  const [services, setServices] = useState<BusinessService[]>([]);
  const [editing, setEditing] = useState<(Partial<BusinessService> & { name: string }) | null>(null);
  const [status, setStatus] = useState("");

  async function refresh() {
    try { setServices(await listBusinessServices()); } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  }

  useEffect(() => { void refresh(); }, []);

  async function save() {
    if (!editing?.name.trim()) return setStatus("Give the service a name.");
    try {
      await saveBusinessService(editing);
      setEditing(null);
      setStatus("Saved.");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  async function remove(service: BusinessService) {
    if (!window.confirm(`Remove ${service.name} from the list?`)) return;
    try { await deleteBusinessService(service.id); await refresh(); } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  }

  const yearly = services.reduce((sum, service) => sum + annualCostCents(service), 0);
  const upcoming = services.filter((service) => service.renewal_date && Date.parse(service.renewal_date) - Date.now() < 30 * 864e5 && Date.parse(service.renewal_date) >= Date.now() - 864e5);
  const field = (key: keyof BusinessService) => (editing?.[key] ?? "") as string;
  const set = (patch: Partial<BusinessService>) => setEditing((current) => (current ? { ...current, ...patch } : current));

  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Owner only</p>
          <h2>Services &amp; accounts</h2>
        </div>
        <KeyRound />
      </div>
      <p className="legal-note">
        Every outside service the business runs on. Record how you log in and <strong>where the password is kept</strong>
        (for example &quot;Bitwarden - Ibby vault&quot;); passwords themselves are intentionally not stored here, so a leaked
        login to this app can&apos;t expose every account. Costs here feed the yearly tax summary.
      </p>
      <div className="stat-strip">
        <div><span>Services</span><strong>{services.filter((service) => service.active).length}</strong></div>
        <div><span>Fixed yearly cost</span><strong>{dollars(yearly)}</strong></div>
        <div><span>Renewing in 30 days</span><strong>{upcoming.length}</strong></div>
      </div>
      <button className="primary-button" onClick={() => setEditing({ ...emptyService(), name: "" })}><Plus size={15} /> Add service</button>

      {editing ? (
        <div className="panel service-edit-panel">
          <div className="form-grid">
            <label><span>Service name</span><input value={field("name")} onChange={(event) => set({ name: event.target.value })} placeholder="Stripe" /></label>
            <label><span>Category</span><input value={field("category")} onChange={(event) => set({ category: event.target.value })} placeholder="Payments" /></label>
            <label className="wide-field"><span>Website / dashboard link</span><input value={field("website")} onChange={(event) => set({ website: event.target.value })} placeholder="https://" /></label>
            <label><span>Login email / username</span><input value={field("login_email")} onChange={(event) => set({ login_email: event.target.value })} /></label>
            <label><span>Login method</span>
              <select value={field("login_method")} onChange={(event) => set({ login_method: event.target.value })}>
                <option value="">Not recorded</option>
                {loginMethods.map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
            <label className="wide-field"><span>Where the password is kept</span><input value={field("password_location")} onChange={(event) => set({ password_location: event.target.value })} placeholder="Bitwarden - Ibby vault / uses Google login" /></label>
            <label><span>Plan</span><input value={field("plan")} onChange={(event) => set({ plan: event.target.value })} placeholder="Free / Pro" /></label>
            <label><span>Cost ($)</span><input inputMode="decimal" value={editing.cost_cents ? String(editing.cost_cents / 100) : ""} onChange={(event) => set({ cost_cents: Math.round((Number.parseFloat(event.target.value) || 0) * 100) })} placeholder="0.00" /></label>
            <label><span>Billing</span>
              <select value={field("billing_cycle")} onChange={(event) => set({ billing_cycle: event.target.value as BusinessService["billing_cycle"] })}>
                {billingCycles.map((cycle) => <option key={cycle}>{cycle}</option>)}
              </select>
            </label>
            <label><span>Next renewal</span><input type="date" value={field("renewal_date")} onChange={(event) => set({ renewal_date: event.target.value })} /></label>
            <label><span>Paid with</span><input value={field("paid_with")} onChange={(event) => set({ paid_with: event.target.value })} placeholder="Business card ending 1234" /></label>
            <label><span>Tax category</span><input value={field("tax_category")} onChange={(event) => set({ tax_category: event.target.value })} /></label>
            <label className="wide-field"><span>Notes</span><textarea value={field("notes")} onChange={(event) => set({ notes: event.target.value })} /></label>
          </div>
          <div className="service-decision-grid">
            <button className="primary-button" onClick={save}><Save size={15} /> Save</button>
            <button className="secondary-button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      ) : null}

      <div className="directory-grid">
        {services.map((service) => (
          <div className={service.active ? "directory-card" : "directory-card inactive"} key={service.id}>
            <strong>{service.name} <small>{service.category}</small></strong>
            {service.website ? <a href={service.website} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> Open dashboard</a> : null}
            <span>Login: {service.login_email || <em>not recorded</em>}{service.login_method ? ` (${service.login_method})` : ""}</span>
            <span>Password: {service.password_location || <em>location not recorded</em>}</span>
            <span>{service.billing_cycle === "free" ? "Free" : service.cost_cents ? `${dollars(service.cost_cents)} ${service.billing_cycle}` : `${service.billing_cycle} - cost not recorded`}{service.renewal_date ? ` - renews ${service.renewal_date}` : ""}</span>
            {service.notes ? <small>{service.notes}</small> : null}
            <div className="service-decision-grid">
              <button className="secondary-button" onClick={() => setEditing({ ...service })}>Edit</button>
              <button className="icon-button" aria-label={`Remove ${service.name}`} onClick={() => remove(service)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
    </div>
  );
}
