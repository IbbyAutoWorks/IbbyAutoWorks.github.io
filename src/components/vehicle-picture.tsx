"use client";

import { useEffect, useState, type ReactNode } from "react";

import { configFromVehicleText, type VehicleConfig } from "@/lib/vehicle-data";
import { ownPhotoOf, resolveVehicleImage, type VehicleImage } from "@/lib/vehicle-images";

type OrderLike = { vehicle: string; vin?: string; vehicleImage?: string; vehicleConfig?: VehicleConfig };

// The best picture for a work order's vehicle: the customer's own photo first, then the shop's default, then a stock photo.
export function VehiclePicture({ order, className, fallback = null }: { order: OrderLike; className?: string; fallback?: ReactNode }) {
  const config = order.vehicleConfig ?? configFromVehicleText(order.vehicle, order.vin ?? "");
  const photo = ownPhotoOf(order);
  const [image, setImage] = useState<VehicleImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImage(null);
    resolveVehicleImage({ year: config.year, make: config.make, model: config.model }, photo).then((next) => { if (!cancelled) setImage(next); });
    return () => { cancelled = true; };
  }, [config.year, config.make, config.model, photo]);

  if (!image?.url) return <>{fallback}</>;
  return (
    <figure className="vehicle-picture">
      <img alt={`${order.vehicle} vehicle`} className={className} src={image.url} />
      {image.source === "stock" ? (
        <figcaption>
          <small>Stock photo, may not match this exact vehicle{image.credit ? <>. <a href={image.credit.url} rel="noopener noreferrer" target="_blank">{image.credit.label}</a></> : null}</small>
        </figcaption>
      ) : null}
    </figure>
  );
}
