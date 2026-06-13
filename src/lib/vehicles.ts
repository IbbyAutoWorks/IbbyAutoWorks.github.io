export type VehicleSpec = {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  image: string;
  wheelTorque: string;
  tirePressure: string;
  engineOil: string;
  coolant: string;
  brakeFluid: string;
  transmissionFluid: string;
  powerSteering: string;
  notes: string[];
  source: string;
};

export type VinDecodeResult = {
  vehicle: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
};

export const vehicleCatalog: VehicleSpec[] = [
  {
    id: "toyota-tacoma-2002",
    year: "2002",
    make: "Toyota",
    model: "Tacoma",
    trim: "2WD/4WD pickup",
    bodyStyle: "Pickup",
    image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "83 ft-lb",
    tirePressure: "29-32 PSI cold, confirm door placard",
    engineOil: "Approx. 5.5 qt with filter, engine-dependent",
    coolant: "Toyota long-life coolant, verify engine",
    brakeFluid: "DOT 3",
    transmissionFluid: "ATF/manual fluid varies by drivetrain",
    powerSteering: "ATF Dexron type, verify cap/manual",
    notes: ["Verify 2.4L/2.7L/3.4L before fluid quote.", "Door placard overrides generic tire pressure."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "ford-f150-2021",
    year: "2021",
    make: "Ford",
    model: "F-150",
    trim: "XL/XLT/Lariat",
    bodyStyle: "Pickup",
    image: "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "150 ft-lb",
    tirePressure: "35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 6-8 qt with filter, engine-dependent",
    coolant: "Motorcraft orange/yellow spec varies by engine",
    brakeFluid: "DOT 4 LV",
    transmissionFluid: "MERCON ULV for 10-speed, verify drivetrain",
    powerSteering: "Electric assist on most trims",
    notes: ["Confirm 2.7L/3.3L/3.5L/5.0L before fluids.", "Hybrid and heavy payload packages can differ."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "subaru-outback-2021",
    year: "2021",
    make: "Subaru",
    model: "Outback",
    trim: "Base/Premium/Limited",
    bodyStyle: "Wagon/SUV",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "89 ft-lb",
    tirePressure: "35 PSI front / 33 PSI rear typical, confirm door placard",
    engineOil: "Approx. 4.4-4.8 qt with filter, engine-dependent",
    coolant: "Subaru Super Coolant",
    brakeFluid: "DOT 3 or DOT 4",
    transmissionFluid: "Subaru CVTF, verify transmission",
    powerSteering: "Electric assist",
    notes: ["Confirm 2.5L vs 2.4L turbo.", "AWD tire sizing and wear matching matters."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "subaru-impreza-2019",
    year: "2019",
    make: "Subaru",
    model: "Impreza",
    trim: "Base/Premium/Sport",
    bodyStyle: "Sedan/Hatchback",
    image: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "89 ft-lb",
    tirePressure: "33 PSI front / 32 PSI rear typical, confirm door placard",
    engineOil: "Approx. 4.4 qt with filter",
    coolant: "Subaru Super Coolant",
    brakeFluid: "DOT 3 or DOT 4",
    transmissionFluid: "Subaru CVTF/manual fluid varies",
    powerSteering: "Electric assist",
    notes: ["Confirm sedan vs hatch and transmission.", "AWD tire matching matters."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "subaru-forester-2020",
    year: "2020",
    make: "Subaru",
    model: "Forester",
    trim: "Base/Premium/Sport/Limited",
    bodyStyle: "SUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "89 ft-lb",
    tirePressure: "33-35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 4.4 qt with filter",
    coolant: "Subaru Super Coolant",
    brakeFluid: "DOT 3 or DOT 4",
    transmissionFluid: "Subaru CVTF",
    powerSteering: "Electric assist",
    notes: ["Confirm tire size and trim.", "Verify CVT service interval before quote."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "subaru-crosstrek-2021",
    year: "2021",
    make: "Subaru",
    model: "Crosstrek",
    trim: "Base/Premium/Sport/Limited",
    bodyStyle: "Crossover",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "89 ft-lb",
    tirePressure: "33 PSI front / 32 PSI rear typical, confirm door placard",
    engineOil: "Approx. 4.4-4.7 qt with filter, engine-dependent",
    coolant: "Subaru Super Coolant",
    brakeFluid: "DOT 3 or DOT 4",
    transmissionFluid: "Subaru CVTF/manual fluid varies",
    powerSteering: "Electric assist",
    notes: ["Confirm 2.0L vs 2.5L.", "Hybrid trims require separate service data."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "chevrolet-silverado-2023",
    year: "2023",
    make: "Chevrolet",
    model: "Silverado 1500",
    trim: "WT/LT/RST",
    bodyStyle: "Pickup",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "140 ft-lb",
    tirePressure: "35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 6-8 qt with filter, engine-dependent",
    coolant: "Dex-Cool compatible coolant",
    brakeFluid: "DOT 4",
    transmissionFluid: "Dexron ULV/HP varies by transmission",
    powerSteering: "Electric assist on most trims",
    notes: ["Confirm 2.7L/5.3L/6.2L/3.0L diesel.", "Diesel service capacities differ significantly."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "honda-civic-2020",
    year: "2020",
    make: "Honda",
    model: "Civic",
    trim: "LX/EX/Sport",
    bodyStyle: "Sedan/Hatchback",
    image: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "80 ft-lb",
    tirePressure: "32 PSI cold typical, confirm door placard",
    engineOil: "Approx. 3.7-4.4 qt with filter, engine-dependent",
    coolant: "Honda Type 2 coolant",
    brakeFluid: "Honda DOT 3",
    transmissionFluid: "Honda HCF-2 CVT fluid if CVT",
    powerSteering: "Electric assist",
    notes: ["Confirm 2.0L vs 1.5L turbo.", "CVT fluid spec differs from manual transmission."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "honda-crv-2021",
    year: "2021",
    make: "Honda",
    model: "CR-V",
    trim: "LX/EX/EX-L/Touring",
    bodyStyle: "SUV",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "80 ft-lb",
    tirePressure: "32-35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 3.7 qt with filter, engine-dependent",
    coolant: "Honda Type 2 coolant",
    brakeFluid: "Honda DOT 3",
    transmissionFluid: "Honda HCF-2 CVT fluid if CVT",
    powerSteering: "Electric assist",
    notes: ["Confirm gas vs hybrid.", "CVT and hybrid systems require correct fluid data."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "toyota-camry-2020",
    year: "2020",
    make: "Toyota",
    model: "Camry",
    trim: "LE/SE/XLE/XSE",
    bodyStyle: "Sedan",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "76 ft-lb",
    tirePressure: "35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 4.8-5.7 qt with filter, engine-dependent",
    coolant: "Toyota Super Long Life Coolant",
    brakeFluid: "DOT 3",
    transmissionFluid: "Toyota ATF/CVT fluid varies",
    powerSteering: "Electric assist",
    notes: ["Confirm 2.5L vs 3.5L vs hybrid.", "Hybrid service data differs."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "toyota-rav4-2021",
    year: "2021",
    make: "Toyota",
    model: "RAV4",
    trim: "LE/XLE/Adventure/Limited",
    bodyStyle: "SUV",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "76 ft-lb",
    tirePressure: "33-35 PSI cold typical, confirm door placard",
    engineOil: "Approx. 4.8 qt with filter, engine-dependent",
    coolant: "Toyota Super Long Life Coolant",
    brakeFluid: "DOT 3",
    transmissionFluid: "Toyota ATF/CVT fluid varies",
    powerSteering: "Electric assist",
    notes: ["Confirm gas vs hybrid/Prime.", "AWD and tire sizing can vary."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "jeep-wrangler-2020",
    year: "2020",
    make: "Jeep",
    model: "Wrangler",
    trim: "Sport/Sahara/Rubicon",
    bodyStyle: "SUV",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "130 ft-lb",
    tirePressure: "36-37 PSI cold typical, confirm door placard",
    engineOil: "Approx. 5-6 qt with filter, engine-dependent",
    coolant: "Mopar OAT coolant",
    brakeFluid: "DOT 3 or DOT 4, verify cap",
    transmissionFluid: "ATF/manual fluid varies by drivetrain",
    powerSteering: "Electric/hydraulic varies by configuration",
    notes: ["Confirm 2.0L/3.6L/diesel and axle/tire package.", "Aftermarket wheels may require different torque guidance."],
    source: "Prototype quick reference; verify against OEM/service data"
  },
  {
    id: "nissan-sentra-2020",
    year: "2020",
    make: "Nissan",
    model: "Sentra",
    trim: "S/SV/SR",
    bodyStyle: "Sedan",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    wheelTorque: "83 ft-lb",
    tirePressure: "33 PSI cold typical, confirm door placard",
    engineOil: "Approx. 4.2 qt with filter",
    coolant: "Nissan long-life coolant",
    brakeFluid: "DOT 3",
    transmissionFluid: "Nissan NS-3 CVT fluid",
    powerSteering: "Electric assist",
    notes: ["Confirm trim and tire size.", "CVT service should use correct Nissan fluid spec."],
    source: "Prototype quick reference; verify against OEM/service data"
  }
];

export const fallbackVehicleSpec: VehicleSpec = {
  id: "manual-vehicle",
  year: "Manual",
  make: "Vehicle",
  model: "Pending",
  trim: "Needs VIN/catalog match",
  bodyStyle: "Unknown",
  image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
  wheelTorque: "Verify OEM/service data",
  tirePressure: "Use door placard",
  engineOil: "Verify engine and service data",
  coolant: "Verify OEM coolant spec",
  brakeFluid: "Verify cap/manual",
  transmissionFluid: "Verify transmission and service data",
  powerSteering: "Verify system type",
  notes: ["VIN or catalog selection needed before relying on specs."],
  source: "Manual fallback; not a verified vehicle-specific spec"
};

export function formatVehicle(spec: Pick<VehicleSpec, "year" | "make" | "model">) {
  return `${spec.year} ${spec.make} ${spec.model}`.trim();
}

export function findVehicleSpec(vehicle: string) {
  const normalized = vehicle.toLowerCase();
  return vehicleCatalog.find((spec) => (
    normalized.includes(spec.year.toLowerCase()) &&
    normalized.includes(spec.make.toLowerCase()) &&
    normalized.includes(spec.model.toLowerCase())
  ));
}

export async function decodeVinWithNhtsa(vin: string): Promise<VinDecodeResult> {
  const cleanVin = vin.trim().toUpperCase();
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(cleanVin)}?format=json`);
  if (!response.ok) {
    throw new Error("VIN decode request failed.");
  }

  const payload = await response.json() as { Results?: Array<Record<string, string>> };
  const result = payload.Results?.[0];
  if (!result || result.ErrorCode !== "0") {
    throw new Error(result?.ErrorText || "VIN could not be decoded.");
  }

  const decoded = {
    year: result.ModelYear || "",
    make: result.Make || "",
    model: result.Model || "",
    trim: result.Trim || result.Series || "",
    bodyStyle: result.BodyClass || result.VehicleType || ""
  };

  return {
    ...decoded,
    vehicle: `${decoded.year} ${decoded.make} ${decoded.model}`.trim()
  };
}
