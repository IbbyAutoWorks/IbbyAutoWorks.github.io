"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, Search } from "lucide-react";

import { lookupDtcCodes, parseDtcCodes, type DtcLookup } from "@/lib/dtc";
import type { PrototypeDiagnosticCode } from "@/lib/local-store";

const sourceLabel: Record<NonNullable<DtcLookup["primarySource"]>, string> = {
  make: "Manufacturer definition",
  "related-make": "Parent/sister-brand definition",
  generic: "Generic SAE definition (same on every vehicle)"
};

// Type one or more codes; meanings are matched to the selected vehicle's make.
export function DtcLookupPanel({
  make,
  vehicleLabel,
  savedCodes = [],
  onSave
}: {
  make: string;
  vehicleLabel: string;
  savedCodes?: PrototypeDiagnosticCode[];
  onSave?: (codes: PrototypeDiagnosticCode[]) => void;
}) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<DtcLookup[]>([]);
  const [status, setStatus] = useState("");

  async function lookup() {
    const codes = parseDtcCodes(input);
    if (!codes.length) return setStatus("Enter codes like P0300, P0420 or C0035.");
    try {
      setStatus("Looking up codes...");
      setResults(await lookupDtcCodes(codes, make));
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  function save() {
    if (!onSave) return;
    const recordedAt = new Date().toISOString();
    const next = results.map((result) => ({
      code: result.code,
      meaning: result.primary?.description ?? "No definition for this make - research before diagnosing",
      source: result.primary ? `${result.primary.manufacturer}${result.primarySource ? ` (${sourceLabel[result.primarySource]})` : ""}` : "Not found",
      recordedAt
    }));
    const merged = [...next, ...savedCodes.filter((saved) => !next.some((item) => item.code === saved.code))];
    onSave(merged);
    setStatus(`Saved ${next.length} code${next.length === 1 ? "" : "s"} to the work order.`);
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Diagnostics</p>
          <h2>Trouble codes{vehicleLabel ? ` - ${vehicleLabel}` : ""}</h2>
        </div>
        <AlertTriangle />
      </div>
      <div className="supply-custom-row">
        <label className="wide-field">
          <span>Codes from the scan tool</span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void lookup(); }}
            placeholder="P0300 P0171 P1101"
          />
        </label>
        <button className="primary-button" onClick={lookup}><Search size={16} /> Look up</button>
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
      <div className="part-request-list">
        {results.map((result) => (
          <div className="part-request-row dtc-result" key={result.code}>
            <div>
              <strong>{result.code}</strong> <small>{result.system}{result.manufacturerSpecific ? " - manufacturer-specific code" : " - generic code"}</small>
              {result.primary ? (
                <p>{result.primary.description} <small>({result.primarySource ? sourceLabel[result.primarySource] : ""}{result.primarySource !== "generic" ? `: ${result.primary.manufacturer}` : ""})</small></p>
              ) : (
                <p className="dtc-warning">No {make || "vehicle"} definition in the database. Manufacturer codes differ by brand, so don&apos;t rely on another brand&apos;s meaning; check the links below.</p>
              )}
              {result.generic && result.primarySource !== "generic" ? <p><small>Generic listing: {result.generic.description}</small></p> : null}
              {result.otherMakes.length ? (
                <details>
                  <summary><small>Other brands&apos; meanings ({result.otherMakes.length})</small></summary>
                  {result.otherMakes.map((other) => <p key={other.manufacturer}><small>{other.manufacturer}: {other.description}</small></p>)}
                </details>
              ) : null}
              <p>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(`${result.code} ${vehicleLabel}`)}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /> Search fixes for this vehicle</a>
                {" · "}
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${result.code} ${vehicleLabel}`)}`} target="_blank" rel="noopener noreferrer">Videos</a>
              </p>
            </div>
          </div>
        ))}
      </div>
      {results.length && onSave ? <button className="secondary-button" onClick={save}>Save codes to work order</button> : null}
      {savedCodes.length ? (
        <div className="part-request-list">
          <p className="section-label">On this work order</p>
          {savedCodes.map((saved) => (
            <div className="part-request-row" key={saved.code}><span><strong>{saved.code}</strong> - {saved.meaning} <small>({saved.source})</small></span></div>
          ))}
        </div>
      ) : null}
      <p className="legal-note">Code definitions: open-source DTC database (MIT). Always confirm with live data and pinpoint tests before replacing parts.</p>
    </div>
  );
}
