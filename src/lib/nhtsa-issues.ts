import type { VehicleConfig } from "@/lib/vehicle-data";

// Live NHTSA data for one vehicle. Nothing here is stored, so it stays current on its own.
const NHTSA = "https://api.nhtsa.gov";

export type Recall = { campaign: string; component: string; summary: string; remedy: string; date: string; model: string };
export type Complaint = { id: number; date: string; summary: string; crash: boolean; fire: boolean; model: string };
export type ComplaintGroup = { component: string; count: number; latest: Complaint[] };
export type Bulletin = { id: number; number: string; date: string; summary: string; component: string };

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

const modelLists = new Map<string, Promise<string[]>>();

// NHTSA's names don't always match the picker's: the picker's Silverado is NHTSA's SILVERADO 1500, 2500 and so on.
// An exact name wins, plus its numbered and HD versions. Otherwise every model starting with that name is checked.
export async function nhtsaModels(config: Pick<VehicleConfig, "year" | "make" | "model">): Promise<string[]> {
  if (!config.year || !config.make || !config.model) return [];
  const listKey = `${config.year}|${squash(config.make)}`;
  if (!modelLists.has(listKey)) {
    const request = fetch(`${NHTSA}/products/vehicle/models?modelYear=${encodeURIComponent(config.year)}&make=${encodeURIComponent(config.make)}&issueType=c&max=1000`)
      .then((response) => (response.ok ? response.json() : { results: [] }))
      .then((data: { results?: { model: string }[] }) => [...new Set((data.results ?? []).map((item) => item.model))]);
    modelLists.set(listKey, request);
  }
  const names = await modelLists.get(listKey)!.catch(() => [] as string[]);
  const target = squash(config.model);
  const exact = names.filter((name) => squash(name) === target);
  const longer = names.filter((name) => squash(name).startsWith(target) && squash(name) !== target);
  if (exact.length) return [...exact, ...longer.filter((name) => isVersionOf(name, target))];
  return longer.length ? longer : [config.model];
}

const isVersionOf = (name: string, target: string) => /^([0-9]|hd)/.test(squash(name).slice(target.length));
const withoutCab = (name: string) => name.replace(/\s+(regular|extended|crew|super|double|quad|access)(\s+(cab|crew))?$/i, "");

// The versions a tech can pick between when the picker's name covers several, like Silverado 1500 and 2500.
// NHTSA lists some by cab, so SILVERADO 1500 CREW CAB and REGULAR CAB are both offered as SILVERADO 1500.
export async function nhtsaModelChoices(config: Pick<VehicleConfig, "year" | "make" | "model">): Promise<string[]> {
  const target = squash(config.model);
  const unique = [...new Set((await nhtsaModels(config)).map(withoutCab))];
  const choices = unique.some((name) => squash(name) === target) ? unique.filter((name) => squash(name) !== target && isVersionOf(name, target)) : unique;
  return choices.length > 1 ? choices.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
}

// A VIN decode can already say which version it is, such as a series of "1500 LT".
export function modelChoiceFromTrim(choices: string[], model: string, trim: string) {
  const target = squash(model);
  const words = trim.toLowerCase().split(/[^a-z0-9]+/);
  const found = choices.filter((name) => words.includes(squash(name).slice(target.length)));
  return found.length === 1 ? found[0] : "";
}

async function perModel<T>(config: VehicleConfig, load: (model: string) => Promise<T[]>) {
  const lists = await Promise.all((await nhtsaModels(config)).map(load));
  return lists.flat();
}

const query = (config: VehicleConfig, model: string) => `make=${encodeURIComponent(config.make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(config.year)}`;

// Recalls are filed under the plain name: F-150 has them and F-150 REGULAR CAB comes back empty, though NHTSA's
// model list only offers the second. So the plain names are checked too, and a recall is listed once.
export async function fetchRecalls(config: VehicleConfig): Promise<Recall[]> {
  const listed = await nhtsaModels(config);
  const models = [...new Map([config.model, ...listed.map(withoutCab), ...listed].map((name) => [squash(name), name])).values()];
  const lists = await Promise.all(models.map(async (model) => {
    const response = await fetch(`${NHTSA}/recalls/recallsByVehicle?${query(config, model)}`);
    if (!response.ok) return [];
    const data = await response.json() as { results?: Array<Record<string, string>> };
    return (data.results ?? []).map((row) => ({
      campaign: row.NHTSACampaignNumber,
      component: row.Component,
      summary: row.Summary,
      remedy: row.Remedy,
      date: row.ReportReceivedDate,
      model
    }));
  }));
  return [...new Map(lists.flat().map((row) => [row.campaign, row])).values()];
}

export async function fetchComplaintGroups(config: VehicleConfig): Promise<{ total: number; groups: ComplaintGroup[] }> {
  const rows = await perModel(config, async (model) => {
    const response = await fetch(`${NHTSA}/complaints/complaintsByVehicle?${query(config, model)}`);
    if (!response.ok) return [];
    const data = await response.json() as { results?: Array<{ odiNumber: number; dateComplaintFiled: string; summary: string; crash: boolean; fire: boolean; components: string }> };
    return (data.results ?? []).map((row) => ({ id: row.odiNumber, date: row.dateComplaintFiled, summary: row.summary, crash: row.crash, fire: row.fire, model, component: row.components || "Not stated" }));
  });
  const unique = [...new Map(rows.map((row) => [row.id, row])).values()];
  const byComponent = new Map<string, typeof unique>();
  for (const row of unique) byComponent.set(row.component, [...(byComponent.get(row.component) ?? []), row]);
  const groups = [...byComponent.entries()]
    .map(([component, items]) => ({
      component,
      count: items.length,
      latest: [...items].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3)
    }))
    .sort((a, b) => b.count - a.count);
  return { total: unique.length, groups };
}

// NHTSA's own vehicle pages load bulletins this way. It covers some vehicles and not others.
export async function fetchBulletins(config: VehicleConfig): Promise<Bulletin[]> {
  const rows = await perModel(config, async (model) => {
    const found = await fetch(`${NHTSA}/vehicles/byYmmt?modelYear=${encodeURIComponent(config.year)}&make=${encodeURIComponent(config.make)}&model=${encodeURIComponent(model)}`);
    if (!found.ok) return [];
    const list = await found.json() as { results?: { vehicleId: number; manufacturerCommunicationsCount?: number }[] };
    const vehicles = (list.results ?? []).filter((item) => item.manufacturerCommunicationsCount).slice(0, 4);
    const details = await Promise.all(vehicles.map(async (vehicle) => {
      const response = await fetch(`${NHTSA}/vehicles/${vehicle.vehicleId}/details?data=manufacturercommunications&productDetail=minimal`);
      if (!response.ok) return [];
      const data = await response.json() as { results?: { safetyIssues?: { manufacturerCommunications?: { nhtsaIdNumber: number; manufacturerCommunicationNumber: string; communicationDate: string; summary: string; components?: { name: string }[] }[] } }[] };
      return data.results?.[0]?.safetyIssues?.manufacturerCommunications ?? [];
    }));
    return details.flat().map((row) => ({
      id: row.nhtsaIdNumber,
      number: row.manufacturerCommunicationNumber,
      date: row.communicationDate,
      summary: row.summary,
      component: row.components?.map((part) => part.name).join(", ") ?? ""
    }));
  });
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export const nhtsaVehicleUrl = (config: VehicleConfig) =>
  `https://www.nhtsa.gov/recalls?year=${encodeURIComponent(config.year)}&make=${encodeURIComponent(config.make)}&model=${encodeURIComponent(config.model)}`;
