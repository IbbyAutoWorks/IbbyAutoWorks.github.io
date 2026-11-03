"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, MessageSquareWarning } from "lucide-react";

import { fetchBulletins, fetchComplaintGroups, nhtsaVehicleUrl, type Bulletin, type ComplaintGroup } from "@/lib/nhtsa-issues";
import type { VehicleConfig } from "@/lib/vehicle-data";

const shortDate = (value: string) => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? value : new Date(time).toLocaleDateString();
};

// Manufacturer bulletins and owner complaints from NHTSA. These are large, so they load when opened.
export function VehicleKnownIssues({ config }: { config: VehicleConfig }) {
  const [bulletins, setBulletins] = useState<Bulletin[] | null>(null);
  const [complaints, setComplaints] = useState<{ total: number; groups: ComplaintGroup[] } | null>(null);
  const [filter, setFilter] = useState("");
  const [problem, setProblem] = useState("");
  const vehicleKey = [config.year, config.make, config.model].join("|");

  useEffect(() => {
    setBulletins(null);
    setComplaints(null);
    setFilter("");
    setProblem("");
  }, [vehicleKey]);

  function openBulletins(open: boolean) {
    if (!open || bulletins) return;
    fetchBulletins(config).then(setBulletins).catch(() => { setBulletins([]); setProblem("NHTSA didn't answer. Try again in a bit."); });
  }

  function openComplaints(open: boolean) {
    if (!open || complaints) return;
    fetchComplaintGroups(config).then(setComplaints).catch(() => { setComplaints({ total: 0, groups: [] }); setProblem("NHTSA didn't answer. Try again in a bit."); });
  }

  const words = filter.trim().toLowerCase();
  const shown = (bulletins ?? []).filter((item) => !words || `${item.number} ${item.summary} ${item.component}`.toLowerCase().includes(words));

  return (
    <div className="known-issues">
      {problem ? <p className="legal-note" role="alert">{problem}</p> : null}
      <details className="recall-box" onToggle={(event) => openBulletins(event.currentTarget.open)}>
        <summary><FileText size={15} /> Manufacturer bulletins{bulletins ? ` (${bulletins.length})` : ""}</summary>
        {!bulletins ? <p className="legal-note">Loading from NHTSA...</p> : null}
        {bulletins?.length ? (
          <label className="wide-field"><span>Search bulletins</span>
            <input onChange={(event) => setFilter(event.target.value)} placeholder="e.g. coolant, transmission, software" value={filter} />
          </label>
        ) : null}
        {shown.slice(0, 40).map((item) => (
          <div className="part-request-row" key={item.id}>
            <span><strong>{item.number}</strong> {item.component} ({shortDate(item.date)})<br /><small>{item.summary}</small></span>
          </div>
        ))}
        {shown.length > 40 ? <p className="legal-note">Showing the newest 40 of {shown.length}. Search to narrow it down.</p> : null}
        {bulletins && !bulletins.length && !problem ? <p className="legal-note">NHTSA&apos;s live list has none for this vehicle. It doesn&apos;t cover every model, so check NHTSA&apos;s site too.</p> : null}
        {bulletins ? <p className="legal-note">These are short summaries. Get the full bulletin from the manufacturer. <a href={nhtsaVehicleUrl(config)} rel="noopener noreferrer" target="_blank"><ExternalLink size={12} /> Look this vehicle up at NHTSA</a></p> : null}
      </details>

      <details className="recall-box" onToggle={(event) => openComplaints(event.currentTarget.open)}>
        <summary><MessageSquareWarning size={15} /> Owner complaints{complaints ? ` (${complaints.total})` : ""}</summary>
        {!complaints ? <p className="legal-note">Loading from NHTSA...</p> : null}
        {complaints?.groups.slice(0, 10).map((group) => (
          <details key={group.component}>
            <summary><strong>{group.count}</strong> {group.component}</summary>
            {group.latest.map((item) => (
              <div className="part-request-row" key={item.id}>
                <span><small>{shortDate(item.date)}{item.crash ? " - crash reported" : ""}{item.fire ? " - fire reported" : ""}</small><br /><small>{item.summary}</small></span>
              </div>
            ))}
          </details>
        ))}
        {complaints && !complaints.total && !problem ? <p className="legal-note">NHTSA has none listed under this model name.</p> : null}
        {complaints?.total ? <p className="legal-note">These are owners&apos; own reports to NHTSA. NHTSA doesn&apos;t confirm them, so use them as a hint of where to look.</p> : null}
      </details>
    </div>
  );
}
