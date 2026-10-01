"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Car, Loader2, ScanLine } from "lucide-react";

import { VinScanner } from "@/components/vin-scanner";
import { isValidVin } from "@/lib/vin";
import {
  applyEngineOption,
  bestEngineMatch,
  decodeVinToConfig,
  engineLabel,
  listEngineOptions,
  listMakes,
  listModels,
  vehicleYears,
  type EngineOption,
  type VehicleConfig
} from "@/lib/vehicle-data";

const OTHER = "__other__";
const driveOptions = ["", "FWD", "RWD", "AWD", "4WD"];

// Year -> make -> model -> engine/version, any of which can be typed instead,
// or filled from a VIN decode and then corrected by hand.
export function VehiclePicker({ value, onChange }: { value: VehicleConfig; onChange: (next: VehicleConfig) => void }) {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<EngineOption[]>([]);
  const [typedMake, setTypedMake] = useState(false);
  const [typedModel, setTypedModel] = useState(false);
  const [loading, setLoading] = useState("");
  const [vinStatus, setVinStatus] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!value.year) { setMakes([]); return; }
    let cancelled = false;
    setLoading("makes");
    listMakes(value.year).then((list) => { if (!cancelled) { setMakes(list); setLoading(""); } });
    return () => { cancelled = true; };
  }, [value.year]);

  useEffect(() => {
    if (!value.year || !value.make) { setModels([]); return; }
    let cancelled = false;
    setLoading("models");
    listModels(value.year, value.make).then((list) => { if (!cancelled) { setModels(list); setLoading(""); } });
    return () => { cancelled = true; };
  }, [value.year, value.make]);

  useEffect(() => {
    if (!value.year || !value.make || !value.model) { setEngines([]); return; }
    let cancelled = false;
    setLoading("engines");
    listEngineOptions(value.year, value.make, value.model).then((list) => {
      if (cancelled) return;
      setEngines(list);
      setLoading("");
      // After a VIN decode, select the EPA version that matches the decoded engine.
      if (!value.epaOptionId && value.source === "vin") {
        const match = bestEngineMatch(list, value);
        if (match) onChange(applyEngineOption(value, match));
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.year, value.make, value.model]);

  const makeInList = !value.make || makes.some((make) => make.toLowerCase() === value.make.toLowerCase());
  const modelInList = !value.model || models.some((model) => model.toLowerCase() === value.model.toLowerCase());
  const showTypedMake = typedMake || (value.make !== "" && makes.length > 0 && !makeInList);
  const showTypedModel = typedModel || (value.model !== "" && models.length > 0 && !modelInList);

  function set(patch: Partial<VehicleConfig>) {
    onChange({ ...value, ...patch, source: patch.source ?? (value.source === "vin" ? "vin" : "catalog") });
  }

  // The scanner keeps one stable callback while its camera runs; route it to the
  // latest decode so it sees current field values.
  const decodeRef = useRef<(vin?: string) => Promise<void>>(async () => undefined);
  const handleScannedVin = useCallback((vin: string) => {
    setScanning(false);
    void decodeRef.current(vin);
  }, []);

  async function decode(scannedVin?: string) {
    const vin = (scannedVin ?? value.vin).trim().toUpperCase();
    if (vin.length !== 17) { setVinStatus("Enter all 17 VIN characters."); return; }
    try {
      setVinStatus("Decoding VIN with NHTSA...");
      const decoded = await decodeVinToConfig(vin);
      setTypedMake(false);
      setTypedModel(false);
      onChange(decoded);
      setVinStatus(`Decoded: ${[decoded.year, decoded.make, decoded.model, decoded.trim].filter(Boolean).join(" ")}${decoded.displacement ? `, ${decoded.displacement}L` : ""}${decoded.drive ? `, ${decoded.drive}` : ""}. Edit anything below if needed.`);
    } catch (error) {
      if (scannedVin) onChange({ ...value, vin });
      setVinStatus(`${error instanceof Error ? error.message : "VIN decode failed."} Check the VIN or pick the vehicle below.`);
    }
  }

  decodeRef.current = decode;

  return (
    <div className="vehicle-picker">
      {scanning ? <VinScanner onVin={handleScannedVin} onClose={() => setScanning(false)} /> : null}
      <div className="vin-decode-row">
        <label className={`vin-field ${value.vin.length === 17 ? "ready" : value.vin ? "invalid" : ""}`}>
          <span>VIN</span>
          <input value={value.vin} onChange={(event) => set({ vin: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17) })} placeholder="17-character VIN" />
        </label>
        <button className="vin-decode-button ready" onClick={() => setScanning(true)}>
          <ScanLine size={15} /> Scan VIN
        </button>
        <button className={value.vin.length === 17 ? "vin-decode-button ready" : "vin-decode-button invalid"} disabled={value.vin.length !== 17} onClick={() => decode()}>
          <Car size={15} /> Decode VIN
        </button>
        {value.vin.length === 17 && !isValidVin(value.vin) ? <small className="dtc-warning">Check digit doesn&apos;t match - one character may be mistyped.</small> : null}
        <span>{vinStatus || "Decoding fills year, make, model, trim, engine, and drive. You can still change any of it."}</span>
      </div>

      <div className="form-grid">
        <label>
          <span>Year</span>
          <select value={value.year} onChange={(event) => set({ year: event.target.value, epaOptionId: undefined })}>
            <option value="">Select year</option>
            {vehicleYears().map((year) => <option key={year}>{year}</option>)}
          </select>
        </label>

        <label>
          <span>Make {loading === "makes" ? <Loader2 size={12} className="spin" /> : null}</span>
          {showTypedMake ? (
            <input value={value.make} onChange={(event) => set({ make: event.target.value })} placeholder="Type the make" />
          ) : (
            <select value={value.make} disabled={!value.year} onChange={(event) => {
              if (event.target.value === OTHER) { setTypedMake(true); set({ make: "", model: "", epaOptionId: undefined }); return; }
              set({ make: event.target.value, model: "", epaOptionId: undefined });
            }}>
              <option value="">{value.year ? "Select make" : "Pick a year first"}</option>
              {makes.map((make) => <option key={make}>{make}</option>)}
              <option value={OTHER}>Other (type it)</option>
            </select>
          )}
        </label>

        <label>
          <span>Model {loading === "models" ? <Loader2 size={12} className="spin" /> : null}</span>
          {showTypedModel || (value.make && !models.length && loading !== "models") ? (
            <input value={value.model} onChange={(event) => set({ model: event.target.value })} placeholder="Type the model" />
          ) : (
            <select value={value.model} disabled={!value.make} onChange={(event) => {
              if (event.target.value === OTHER) { setTypedModel(true); set({ model: "", epaOptionId: undefined }); return; }
              set({ model: event.target.value, epaOptionId: undefined });
            }}>
              <option value="">{value.make ? "Select model" : "Pick a make first"}</option>
              {models.map((model) => <option key={model}>{model}</option>)}
              <option value={OTHER}>Other (type it)</option>
            </select>
          )}
        </label>

        <label className="wide-field">
          <span>Engine / version {loading === "engines" ? <Loader2 size={12} className="spin" /> : null}</span>
          {engines.length ? (
            <select value={value.epaOptionId ?? ""} onChange={(event) => onChange(applyEngineOption(value, engines.find((option) => option.id === event.target.value) ?? null))}>
              <option value="">Select engine / drivetrain version</option>
              {engines.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          ) : (
            <input value={value.engine} onChange={(event) => set({ engine: event.target.value })} placeholder="e.g. 6.7L V8 Power Stroke diesel" />
          )}
        </label>

        <label>
          <span>Trim / submodel</span>
          <input value={value.trim} onChange={(event) => set({ trim: event.target.value })} placeholder="e.g. XLT, LE, Limited" />
        </label>
        <label>
          <span>Drive</span>
          <select value={value.drive} onChange={(event) => set({ drive: event.target.value })}>
            {[...new Set([...driveOptions, value.drive])].map((drive) => <option key={drive} value={drive}>{drive || "Select drive"}</option>)}
          </select>
        </label>
        <label>
          <span>Engine size (L)</span>
          <input value={value.displacement} onChange={(event) => set({ displacement: event.target.value.replace(/[^0-9.]/g, "") })} placeholder="2.5" />
        </label>
        <label>
          <span>Cylinders</span>
          <input value={value.cylinders} onChange={(event) => set({ cylinders: event.target.value.replace(/[^0-9]/g, "") })} placeholder="4" />
        </label>
        <label>
          <span>Transmission</span>
          <input value={value.transmission} onChange={(event) => set({ transmission: event.target.value })} placeholder="Automatic 8-speed" />
        </label>
        <label>
          <span>Fuel</span>
          <input value={value.fuel} onChange={(event) => set({ fuel: event.target.value })} placeholder="Gasoline" />
        </label>
      </div>
      {value.year && value.make && value.model ? (
        <p className="legal-note">
          Selected: <strong>{[value.year, value.make, value.model, value.trim].filter(Boolean).join(" ")}</strong>
          {engineLabel(value) ? ` - ${engineLabel(value)}` : ""}{value.drive ? ` - ${value.drive}` : ""}{value.transmission ? ` - ${value.transmission}` : ""}
        </p>
      ) : null}
    </div>
  );
}
