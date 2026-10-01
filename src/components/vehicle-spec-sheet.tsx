"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Pencil, Save, ShieldAlert } from "lucide-react";

import { engineLabel, vehicleConfigLabel, type VehicleConfig } from "@/lib/vehicle-data";
import { fetchRecalls, loadSpecSheet, researchLinks, saveSpecValue, specFields, specQuery, type Recall, type SpecSheet } from "@/lib/vehicle-specs";

const groups = [...new Set(specFields.map((field) => field.group))];

// Spec sheet for one exact vehicle: shared library values with their sources,
// one-tap research for anything missing, and open NHTSA recalls.
export function VehicleSpecSheet({ config }: { config: VehicleConfig }) {
  const [sheet, setSheet] = useState<SpecSheet>({});
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState({ value: "", source: "", sourceUrl: "" });
  const [status, setStatus] = useState("");
  const ready = Boolean(config.year && config.make && config.model);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    loadSpecSheet(config).then((loaded) => { if (!cancelled) setSheet(loaded); }).catch((error) => setStatus(error.message));
    fetchRecalls(config).then((list) => { if (!cancelled) setRecalls(list); }).catch(() => setRecalls([]));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.year, config.make, config.model, config.displacement, config.cylinders, config.engine]);

  if (!ready) {
    return <div className="panel"><p className="legal-note">Pick the vehicle (or decode the VIN) to load its spec sheet.</p></div>;
  }

  function startEdit(fieldId: string) {
    const existing = sheet[fieldId];
    setEditing(fieldId);
    setDraft({ value: existing?.value ?? "", source: existing?.source ?? "", sourceUrl: existing?.sourceUrl ?? "" });
  }

  async function save() {
    try {
      setStatus("Saving...");
      setSheet(await saveSpecValue(config, editing, draft));
      setEditing("");
      setStatus("Saved to the shop spec library for this vehicle.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  const filled = specFields.filter((field) => sheet[field.id]?.value).length;

  return (
    <div className="panel vehicle-spec-sheet">
      <div className="panel-title">
        <div>
          <p className="section-label">Spec sheet - {filled}/{specFields.length} filled</p>
          <h2>{vehicleConfigLabel(config)}{engineLabel(config) ? ` - ${engineLabel(config)}` : ""}</h2>
        </div>
        <BookOpen />
      </div>

      <div className="research-link-row">
        {researchLinks(config).map((link) => (
          <a className="secondary-button" href={link.url} key={link.label} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> {link.label}</a>
        ))}
      </div>

      {recalls.length ? (
        <details className="recall-box" open>
          <summary><ShieldAlert size={15} /> {recalls.length} NHTSA recall{recalls.length === 1 ? "" : "s"} for this year/make/model - check whether this VIN is affected</summary>
          {recalls.map((recall) => (
            <div className="part-request-row" key={recall.campaign}>
              <span><strong>{recall.campaign}</strong> {recall.component} ({recall.date})<br /><small>{recall.summary}</small><br /><small><em>Remedy:</em> {recall.remedy}</small></span>
            </div>
          ))}
        </details>
      ) : null}

      {groups.map((group) => (
        <div className="spec-group" key={group}>
          <p className="section-label">{group}</p>
          {specFields.filter((field) => field.group === group).map((field) => {
            const entry = sheet[field.id];
            return (
              <div className={entry?.value ? "spec-row filled" : "spec-row"} key={field.id}>
                <div className="spec-row-main">
                  <strong>{field.label}</strong>
                  {entry?.value ? (
                    <span>
                      {entry.value}
                      <small> - {entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">{entry.source || "source"}</a> : entry.source || "no source"}{entry.by ? `, ${entry.by}` : ""}{entry.at ? `, ${new Date(entry.at).toLocaleDateString()}` : ""}</small>
                    </span>
                  ) : <span className="spec-missing">Not in library yet</span>}
                </div>
                <div className="spec-row-actions">
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(specQuery(config, field))}`} target="_blank" rel="noopener noreferrer" aria-label={`Research ${field.label}`}><ExternalLink size={14} /></a>
                  <button className="icon-button" aria-label={`Edit ${field.label}`} onClick={() => startEdit(field.id)}><Pencil size={14} /></button>
                </div>
                {editing === field.id ? (
                  <div className="spec-edit">
                    <input autoFocus value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} placeholder="Value, e.g. 4.8 qt 0W-16" />
                    <input value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} placeholder="Source, e.g. Owner's manual p. 412, Toyota dealer" />
                    <input value={draft.sourceUrl} onChange={(event) => setDraft({ ...draft, sourceUrl: event.target.value })} placeholder="Source link (optional)" />
                    <div>
                      <button className="primary-button" onClick={save}><Save size={14} /> Save</button>
                      <button className="secondary-button" onClick={() => setEditing("")}>Cancel</button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
      {status ? <p className="legal-note">{status}</p> : null}
      <p className="legal-note">Values are entered by the shop with their source. Torque and capacity figures vary by engine and drivetrain, so confirm the source matches this exact vehicle before relying on it.</p>
    </div>
  );
}
