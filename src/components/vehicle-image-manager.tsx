"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Images, Trash2 } from "lucide-react";

import { listShopDefaultImages, removeShopDefaultImage, setShopDefaultImage, uploadVehiclePhoto, type ShopDefaultImage } from "@/lib/vehicle-images";

// Owner setting: the default picture shown for a make/model (or one model year)
// whenever a job has no photo of the actual vehicle.
export function VehicleImageManager() {
  const [images, setImages] = useState<ShopDefaultImage[]>([]);
  const [draft, setDraft] = useState({ year: "", make: "", model: "" });
  const [status, setStatus] = useState("");

  async function refresh() {
    try { setImages(await listShopDefaultImages()); } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  }

  useEffect(() => { void refresh(); }, []);

  async function add(file: File | null) {
    if (!file) return;
    if (!draft.make.trim() || !draft.model.trim()) return setStatus("Enter the make and model first.");
    try {
      setStatus("Uploading...");
      const url = await uploadVehiclePhoto(file);
      if (url.startsWith("data:")) return setStatus("Sign in as the owner to upload default pictures.");
      await setShopDefaultImage({ year: draft.year.trim(), make: draft.make.trim(), model: draft.model.trim() }, url, draft.year.trim() ? "year" : "model");
      setStatus(`Default picture saved for ${[draft.year, draft.make, draft.model].filter(Boolean).join(" ")}.`);
      setDraft({ year: "", make: "", model: "" });
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  async function remove(key: string) {
    try { await removeShopDefaultImage(key); await refresh(); } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Vehicle pictures</p>
          <h2>Default pictures by make and model</h2>
        </div>
        <Images />
      </div>
      <p className="legal-note">
        Shown when a job has no photo of the customer&apos;s own car. Set them here, or from any job photo with
        &quot;Default for ...&quot; in the Service portal. Leave the year blank to cover every year of that model.
        Without a default, a reference photo from Wikipedia is used.
      </p>
      <div className="supply-custom-row">
        <label><span>Year (optional)</span><input value={draft.year} onChange={(event) => setDraft({ ...draft, year: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="All years" /></label>
        <label><span>Make</span><input value={draft.make} onChange={(event) => setDraft({ ...draft, make: event.target.value })} placeholder="Toyota" /></label>
        <label><span>Model</span><input value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} placeholder="RAV4" /></label>
        <label className="secondary-button vehicle-photo-upload"><ImagePlus size={15} /> Upload picture<input type="file" accept="image/*" onChange={(event) => add(event.target.files?.[0] ?? null)} /></label>
      </div>
      <div className="vehicle-default-grid">
        {images.map((image) => (
          <div className="vehicle-default-card" key={image.key}>
            <img src={image.image_url} alt={`${image.year} ${image.make} ${image.model}`} />
            <span>{image.year || "All years"} {image.make} {image.model}</span>
            <button className="icon-button" aria-label={`Remove default for ${image.make} ${image.model}`} onClick={() => remove(image.key)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      {status ? <p className="legal-note">{status}</p> : null}
    </div>
  );
}
