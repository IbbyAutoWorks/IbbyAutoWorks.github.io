"use client";

import { useEffect, useState } from "react";
import { Camera, ImagePlus, Star } from "lucide-react";

import { resolveVehicleImage, setShopDefaultImage, uploadVehiclePhoto, type VehicleImage } from "@/lib/vehicle-images";

const sourceLabel: Record<VehicleImage["source"], string> = {
  customer: "Photo of this vehicle",
  "shop-year": "Shop default picture (this year)",
  "shop-model": "Shop default picture (this model)",
  wikipedia: "Reference photo",
  none: "No picture yet"
};

// Shows the best picture for a vehicle; photographing the car saves it to the job,
// and the owner can promote that photo to the default for the year or model.
export function VehiclePhotoCard({
  year,
  make,
  model,
  photo,
  onPhoto,
  isOwner
}: {
  year: string;
  make: string;
  model: string;
  photo?: string;
  onPhoto?: (url: string) => void;
  isOwner?: boolean;
}) {
  const [image, setImage] = useState<VehicleImage>({ url: "", source: "none" });
  const [status, setStatus] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    resolveVehicleImage({ year, make, model }, photo).then((next) => { if (!cancelled) setImage(next); });
    return () => { cancelled = true; };
  }, [year, make, model, photo, version]);

  async function upload(file: File | null) {
    if (!file || !onPhoto) return;
    try {
      setStatus("Saving photo...");
      onPhoto(await uploadVehiclePhoto(file));
      setStatus("Photo saved to this job.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  async function makeDefault(scope: "year" | "model") {
    if (!photo) return;
    try {
      await setShopDefaultImage({ year, make, model }, photo, scope);
      setStatus(scope === "year" ? `Default picture set for every ${year} ${make} ${model}.` : `Default picture set for every ${make} ${model}.`);
      setVersion((current) => current + 1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="vehicle-photo-card">
      {image.url ? <img src={image.url} alt={`${year} ${make} ${model}`} /> : <div className="profile-image-empty"><Camera size={22} /><span>No picture yet</span></div>}
      <small>
        {sourceLabel[image.source]}
        {image.credit ? <> - <a href={image.credit.url} target="_blank" rel="noopener noreferrer">{image.credit.label}</a></> : null}
      </small>
      {onPhoto ? (
        <label className="secondary-button vehicle-photo-upload">
          <ImagePlus size={15} /> {photo ? "Retake photo of this vehicle" : "Photograph this vehicle"}
          <input type="file" accept="image/*" capture="environment" onChange={(event) => upload(event.target.files?.[0] ?? null)} />
        </label>
      ) : null}
      {isOwner && photo && make && model && !photo.startsWith("data:") ? (
        <div className="service-decision-grid">
          {year ? <button className="secondary-button" onClick={() => makeDefault("year")}><Star size={14} /> Default for {year} {make} {model}</button> : null}
          <button className="secondary-button" onClick={() => makeDefault("model")}><Star size={14} /> Default for all {make} {model}</button>
        </div>
      ) : null}
      {status ? <small>{status}</small> : null}
    </div>
  );
}
