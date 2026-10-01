import { getCurrentSupabaseSession, getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { VehicleConfig } from "@/lib/vehicle-data";

// Vehicle pictures, best first:
//   1. the photo taken of this customer's car (stored on the work order)
//   2. the owner's default picture for this year/make/model, then make/model
//   3. a Wikipedia/Wikimedia Commons photo of the model (credited)

export type VehicleImage = {
  url: string;
  source: "customer" | "shop-year" | "shop-model" | "wikipedia" | "none";
  credit?: { label: string; url: string };
};

type Ids = Pick<VehicleConfig, "year" | "make" | "model">;

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function vehicleImageKeys(vehicle: Ids) {
  const model = `${slug(vehicle.make)}|${slug(vehicle.model)}`;
  return { year: vehicle.year ? `${vehicle.year}|${model}` : "", model };
}

// Phone photos are 3-5 MB; resize to a sensible JPEG before storing anywhere.
export async function compressImage(file: Blob, maxDimension = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process the photo"))), "image/jpeg", quality));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Signed-in users upload to Storage and get a URL; guests keep a small local copy.
export async function uploadVehiclePhoto(file: File): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (supabase && session?.user) {
    const blob = await compressImage(file);
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from("vehicle-photos").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return supabase.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl;
  }
  return blobToDataUrl(await compressImage(file, 640, 0.7));
}

export async function setShopDefaultImage(vehicle: Ids, imageUrl: string, scope: "year" | "model") {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) throw new Error("Sign in as the owner to set default pictures.");
  const keys = vehicleImageKeys(vehicle);
  const { error } = await supabase.from("vehicle_images").upsert({
    key: scope === "year" ? keys.year : keys.model,
    year: scope === "year" ? vehicle.year : "",
    make: vehicle.make,
    model: vehicle.model,
    image_url: imageUrl,
    set_by: session.user.id,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message.includes("row-level security") ? "Only the owner account can set default pictures." : error.message);
  shopCache.clear();
}

export type ShopDefaultImage = { key: string; year: string; make: string; model: string; image_url: string; updated_at: string };

export async function listShopDefaultImages(): Promise<ShopDefaultImage[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("vehicle_images").select("key,year,make,model,image_url,updated_at").order("make").order("model").order("year");
  if (error) throw new Error(error.message);
  return (data ?? []) as ShopDefaultImage[];
}

export async function removeShopDefaultImage(key: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from("vehicle_images").delete().eq("key", key);
  if (error) throw new Error(error.message);
  shopCache.clear();
}

const shopCache = new Map<string, Promise<VehicleImage | null>>();

async function shopDefault(vehicle: Ids): Promise<VehicleImage | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !vehicle.make || !vehicle.model) return null;
  const keys = vehicleImageKeys(vehicle);
  const cacheKey = `${keys.year}#${keys.model}`;
  if (!shopCache.has(cacheKey)) {
    shopCache.set(cacheKey, (async () => {
      const { data } = await supabase.from("vehicle_images").select("key,image_url").in("key", [keys.year, keys.model].filter(Boolean));
      const rows = (data ?? []) as Array<{ key: string; image_url: string }>;
      const yearRow = rows.find((row) => row.key === keys.year);
      const modelRow = rows.find((row) => row.key === keys.model);
      if (yearRow) return { url: yearRow.image_url, source: "shop-year" as const };
      if (modelRow) return { url: modelRow.image_url, source: "shop-model" as const };
      return null;
    })());
  }
  return shopCache.get(cacheKey)!;
}

const wikiCache = new Map<string, Promise<VehicleImage | null>>();

async function wikipediaImage(vehicle: Ids): Promise<VehicleImage | null> {
  if (!vehicle.make || !vehicle.model) return null;
  const query = `${vehicle.make} ${vehicle.model}`;
  if (!wikiCache.has(query)) {
    wikiCache.set(query, (async () => {
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(`${query} automobile`)}&prop=pageimages|info&piprop=thumbnail&pithumbsize=800&inprop=url`;
      try {
        const response = await fetch(url);
        const data = await response.json() as { query?: { pages?: Record<string, { title: string; fullurl: string; thumbnail?: { source: string } }> } };
        const page = Object.values(data.query?.pages ?? {})[0];
        if (!page?.thumbnail?.source) return null;
        return { url: page.thumbnail.source, source: "wikipedia" as const, credit: { label: `Wikipedia: ${page.title}`, url: page.fullurl } };
      } catch {
        return null;
      }
    })());
  }
  return wikiCache.get(query)!;
}

export async function resolveVehicleImage(vehicle: Ids, customerPhoto?: string): Promise<VehicleImage> {
  if (customerPhoto) return { url: customerPhoto, source: "customer" };
  return (await shopDefault(vehicle)) ?? (await wikipediaImage(vehicle)) ?? { url: "", source: "none" };
}
