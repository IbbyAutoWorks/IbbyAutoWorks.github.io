import { getCurrentSupabaseSession, getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { VehicleConfig } from "@/lib/vehicle-data";
import { findStockPhoto } from "@/lib/vehicle-stock-photo";

// Vehicle pictures, best first:
//   1. the photo taken of this customer's car (private; the work order keeps a reference to it)
//   2. the owner's default picture for this year/make/model, then make/model (public)
//   3. a Wikimedia Commons photo, linked and credited, never copied

export type VehicleImage = {
  url: string;
  source: "customer" | "shop-year" | "shop-model" | "stock" | "none";
  exactYear?: boolean;
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

const PRIVATE_PREFIX = "private:";
const PRIVATE_BUCKET = "customer-photos";
const PUBLIC_BUCKET = "vehicle-photos";

async function storePublicly(blob: Blob) {
  const supabase = getSupabaseBrowserClient()!;
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(PUBLIC_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw new Error(error.message.includes("row-level security") ? "Only the owner can add public pictures, and photo storage must have room." : error.message);
  return supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl;
}

// A photo of a customer's car stays private. Only the owner's default pictures are public.
// Guests aren't signed in, so they keep a small copy on their own device.
export async function uploadVehiclePhoto(file: File, place: "customer" | "public" = "customer"): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (supabase && session?.user) {
    const blob = await compressImage(file);
    if (place === "public") return storePublicly(blob);
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from(PRIVATE_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "3600" });
    if (error) throw new Error(error.message.includes("row-level security") ? "Photo storage is nearly full, so this photo wasn't saved. The owner can see this under Connections." : error.message);
    return PRIVATE_PREFIX + path;
  }
  return blobToDataUrl(await compressImage(file, 640, 0.7));
}

const signedLinks = new Map<string, Promise<string>>();

// Turns a saved photo reference into something an <img> can show. Private links expire after an hour.
async function photoUrl(reference: string) {
  if (!reference.startsWith(PRIVATE_PREFIX)) return reference;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return "";
  if (!signedLinks.has(reference)) {
    signedLinks.set(reference, supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(reference.slice(PRIVATE_PREFIX.length), 3600).then(({ data }) => data?.signedUrl ?? ""));
    window.setTimeout(() => signedLinks.delete(reference), 50 * 60 * 1000);
  }
  return signedLinks.get(reference)!;
}

// Older orders can hold a stock catalog address. Only a real photo of this car counts as the customer's.
export function ownPhotoOf(order: { vehicleImage?: string }) {
  const saved = order.vehicleImage ?? "";
  return saved.startsWith(PRIVATE_PREFIX) || saved.startsWith("data:") || saved.includes("/storage/v1/object/") ? saved : "";
}

export async function setShopDefaultImage(vehicle: Ids, imageUrl: string, scope: "year" | "model") {
  const supabase = getSupabaseBrowserClient();
  const session = await getCurrentSupabaseSession();
  if (!supabase || !session?.user) throw new Error("Sign in as the owner to set default pictures.");
  const keys = vehicleImageKeys(vehicle);
  // Default pictures are public, so a private job photo gets a separate public copy.
  let publicUrl = imageUrl;
  if (imageUrl.startsWith(PRIVATE_PREFIX)) {
    const { data, error: readError } = await supabase.storage.from(PRIVATE_BUCKET).download(imageUrl.slice(PRIVATE_PREFIX.length));
    if (readError || !data) throw new Error("Couldn't read that photo. Please try again.");
    publicUrl = await storePublicly(data);
  }
  const { error } = await supabase.from("vehicle_images").upsert({
    key: scope === "year" ? keys.year : keys.model,
    year: scope === "year" ? vehicle.year : "",
    make: vehicle.make,
    model: vehicle.model,
    image_url: publicUrl,
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

const stockCache = new Map<string, Promise<VehicleImage | null>>();
const STOCK_KEY = "ibbys-auto.stock-photo.";
const STOCK_DAYS = 30;

// Wikimedia limits how often a device can ask, so a found picture is remembered on this device for a while.
async function stockImage(vehicle: Ids): Promise<VehicleImage | null> {
  if (!vehicle.year || !vehicle.make || !vehicle.model) return null;
  const query = [vehicle.year, slug(vehicle.make), slug(vehicle.model)].join("|");
  if (!stockCache.has(query)) {
    stockCache.set(query, (async () => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STOCK_KEY + query) ?? "null") as { at: number; image: VehicleImage } | null;
        if (saved && Date.now() - saved.at < STOCK_DAYS * 864e5) return saved.image;
      } catch { /* storage unavailable: search instead */ }
      try {
        const found = await findStockPhoto(vehicle.year, vehicle.make, vehicle.model);
        if (!found) return null;
        const image: VehicleImage = { url: found.url, source: "stock", exactYear: found.exactYear, credit: found.credit };
        try { window.localStorage.setItem(STOCK_KEY + query, JSON.stringify({ at: Date.now(), image })); } catch { /* storage unavailable */ }
        return image;
      } catch {
        return null;
      }
    })());
  }
  return stockCache.get(query)!;
}

export async function resolveVehicleImage(vehicle: Ids, customerPhoto?: string): Promise<VehicleImage> {
  if (customerPhoto) {
    const url = await photoUrl(customerPhoto);
    if (url) return { url, source: "customer" };
  }
  return (await shopDefault(vehicle)) ?? (await stockImage(vehicle)) ?? { url: "", source: "none" };
}
