import {
  CalendarClock,
  Car,
  ClipboardCheck,
  Clock3,
  DollarSign,
  FileText,
  Gauge,
  MailCheck,
  PackageSearch,
  ShieldCheck,
  Wrench
} from "lucide-react";

export const metrics = [
  { label: "Open work orders", value: "0", trend: "submit a test request", icon: ClipboardCheck },
  { label: "Scheduled revenue", value: "$0", trend: "no estimates yet", icon: DollarSign },
  { label: "Parts pending", value: "0", trend: "waiting on jobs", icon: PackageSearch },
  { label: "Inspection progress", value: "0%", trend: "no reports due", icon: ShieldCheck }
];

export const customerCards = [
  { title: "Request mobile service", value: "Oil, brakes, tires, diagnostics", icon: Wrench },
  { title: "Saved vehicles", value: "VIN, plate, mileage, reports", icon: Car },
  { title: "Appointment window", value: "Pick times and get email updates", icon: CalendarClock },
  { title: "Reports and PDFs", value: "Inspection records saved per vehicle", icon: FileText }
];

export const serviceOptions = [
  {
    name: "Engine oil and filter change",
    category: "Maintenance",
    subcategory: "Engine oil",
    detail: "Oil type and filter confirmed by VIN/engine before final estimate",
    low: "$64+",
    mid: "$92+",
    high: "$128+"
  },
  {
    name: "Front brake pads and rotors",
    category: "Brakes",
    subcategory: "Front axle",
    detail: "Front axle brake service with hardware and inspection photos",
    low: "$240+",
    mid: "$390+",
    high: "$560+"
  },
  {
    name: "Rear brake pads and rotors",
    category: "Brakes",
    subcategory: "Rear axle",
    detail: "Rear axle brake service with hardware and parking brake review",
    low: "$240+",
    mid: "$390+",
    high: "$560+"
  },
  {
    name: "Brake inspection only",
    category: "Brakes",
    subcategory: "Inspection",
    detail: "Measure pads/rotors, check lines/calipers, quote only if repair is needed",
    low: "$45+",
    mid: "$75+",
    high: "$110+"
  },
  {
    name: "Tire replacement",
    category: "Tires",
    subcategory: "Replacement",
    detail: "Tire fitment, mount/balance planning, valve stems, disposal",
    low: "$420+",
    mid: "$680+",
    high: "$980+"
  },
  {
    name: "Tire rotation",
    category: "Tires",
    subcategory: "Rotation",
    detail: "Rotate tires, set pressures, inspect tread wear pattern",
    low: "$35+",
    mid: "$55+",
    high: "$75+"
  },
  {
    name: "Single tire repair",
    category: "Tires",
    subcategory: "Repair",
    detail: "Inspect puncture location, plug/patch eligibility, pressure check",
    low: "$35+",
    mid: "$55+",
    high: "$75+"
  },
  {
    name: "Battery test and replacement",
    category: "Electrical",
    subcategory: "Battery",
    detail: "Battery/charging test, terminal inspection, replacement quote",
    low: "$120+",
    mid: "$185+",
    high: "$260+"
  },
  {
    name: "Engine air filter",
    category: "Maintenance",
    subcategory: "Filters",
    detail: "Inspect and replace engine air filter if approved",
    low: "$28+",
    mid: "$42+",
    high: "$58+"
  },
  {
    name: "Cabin air filter",
    category: "Maintenance",
    subcategory: "Filters",
    detail: "Inspect and replace cabin/HVAC filter if approved",
    low: "$32+",
    mid: "$48+",
    high: "$68+"
  },
  {
    name: "Check engine light diagnostic",
    category: "Diagnostics",
    subcategory: "Engine/electrical",
    detail: "Scan codes, document symptoms, recommend next test path",
    low: "$65+",
    mid: "$95+",
    high: "$140+"
  },
  {
    name: "Coolant flush",
    category: "Fluids",
    subcategory: "Cooling system",
    detail: "Coolant condition review and flush estimate by vehicle spec",
    low: "$115+",
    mid: "$165+",
    high: "$230+"
  },
  {
    name: "Transmission service",
    category: "Fluids",
    subcategory: "Transmission",
    detail: "Fluid service estimate based on transmission type and fluid spec",
    low: "$150+",
    mid: "$260+",
    high: "$380+"
  },
  {
    name: "Maine inspection pre-check",
    category: "Inspection",
    subcategory: "Safety pre-check",
    detail: "Safety inspection-style walkaround and required defect notes",
    low: "$45+",
    mid: "$75+",
    high: "$110+"
  },
  {
    name: "Suspension noise inspection",
    category: "Suspension",
    subcategory: "Diagnosis",
    detail: "Road feel notes, visible suspension/steering check, estimate path",
    low: "$55+",
    mid: "$95+",
    high: "$145+"
  },
  {
    name: "Front strut or shock inspection",
    category: "Suspension",
    subcategory: "Front suspension",
    detail: "Inspect struts/shocks, springs, mounts, control arms, ball joints",
    low: "$55+",
    mid: "$110+",
    high: "$165+"
  },
  {
    name: "Rear shock or spring inspection",
    category: "Suspension",
    subcategory: "Rear suspension",
    detail: "Inspect rear shocks, springs, links, bushings, and ride height",
    low: "$55+",
    mid: "$110+",
    high: "$165+"
  },
  {
    name: "Exhaust leak inspection",
    category: "Exhaust",
    subcategory: "Leak/noise",
    detail: "Inspect exhaust leak, hangers, flex pipe, flange, muffler, and converter area",
    low: "$55+",
    mid: "$95+",
    high: "$145+"
  },
  {
    name: "Muffler or pipe repair estimate",
    category: "Exhaust",
    subcategory: "Repair estimate",
    detail: "Document exhaust damage and quote repair or replacement path",
    low: "$90+",
    mid: "$180+",
    high: "$340+"
  }
  ,
  { name: "Wiper blade replacement", category: "Maintenance", subcategory: "Visibility", detail: "Front/rear blade lookup with driver, passenger, and rear options", low: "$28+", mid: "$48+", high: "$78+" },
  { name: "Automotive light bulb replacement", category: "Electrical", subcategory: "Lighting", detail: "Headlight, fog, marker, turn, brake/tail, reverse, and license bulbs", low: "$32+", mid: "$72+", high: "$140+" },
  { name: "TPMS service", category: "Tires", subcategory: "Sensors", detail: "TPMS service kits and sensor-related tire work planning", low: "$48+", mid: "$110+", high: "$220+" },
  { name: "Steering estimate", category: "Steering", subcategory: "Tie rods / rack / pump", detail: "Outer/inner tie rods, rack and pinion, pump, hoses, and fluid", low: "$95+", mid: "$260+", high: "$760+" },
  { name: "Drivetrain estimate", category: "Drivetrain", subcategory: "Axles / shafts / seals", detail: "CV axles, driveshaft, U-joints, center support bearing, seals, differential fluid", low: "$120+", mid: "$360+", high: "$860+" },
  { name: "Fuel/EVAP estimate", category: "Fuel / EVAP", subcategory: "Fuel pump / injector / evap", detail: "Fuel pump, injectors, regulator, gas cap, purge valve, vent valve", low: "$95+", mid: "$280+", high: "$780+" },
  { name: "HVAC estimate", category: "HVAC", subcategory: "Blower / A/C", detail: "Blower motor, resistor, A/C compressor, condenser, and actuator path", low: "$95+", mid: "$320+", high: "$900+" },
  { name: "ABS light diagnostic", category: "Diagnostics", subcategory: "ABS / wheel speed", detail: "Free code/light check, diagnostic trace, and wheel speed sensor path", low: "$0+", mid: "$100+", high: "$240+" },
  { name: "SRS airbag diagnostic", category: "Diagnostics", subcategory: "Airbag / clock spring", detail: "SRS scan path with clock spring and seat-belt buckle possibilities", low: "$0+", mid: "$100+", high: "$360+" },
  { name: "Hardware and fastener lookup", category: "Hardware", subcategory: "Clips / bolts / retainers", detail: "Brake hardware, lug nuts/studs, body clips, retainers, hose clamps, thread locker", low: "$12+", mid: "$48+", high: "$120+" }

];

export type ServiceOption = (typeof serviceOptions)[number];

export const serviceCategories = Array.from(new Set(serviceOptions.map((service) => service.category)));

export const inspectionRows = [
  { label: "Warning lamp operation", section: "Initial", state: "green", photo: true },
  { label: "Horn and wipers", section: "Initial", state: "yellow", photo: false },
  { label: "Air filter condition", section: "Under hood", state: "red", photo: true },
  { label: "Engine oil level/condition", section: "Under hood", state: "green", photo: true },
  { label: "Tread depth captured", section: "Tires", state: "yellow", photo: true },
  { label: "Steering linkage/play", section: "Under car", state: "green", photo: false }
];

export const partsQueue: Array<{ part: string; supplier: string; band: string; status: string; price: string }> = [];

export const activity: Array<{ icon: typeof MailCheck; text: string; time: string }> = [];

export const timeline = [
  "Request received",
  "VIN decoded",
  "Parts estimate",
  "Appointment confirmed",
  "Inspection report",
  "Payment and PDF"
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/request", label: "Request" },
  { href: "/account", label: "Account" },
  { href: "/admin", label: "Admin" },
  { href: "/service", label: "Service" },
  { href: "/admin/settings", label: "Settings" }
];

export const adminSettings = [
  { label: "Business name", value: "Ibby Auto Works™", group: "Brand" },
  { label: "Primary color", value: "Neutral red", group: "Brand" },
  { label: "Slogan", value: "Clear work. Road-ready records. Honest mobile service.", group: "Brand" },
  { label: "Work-order columns", value: "Requested, Scheduled, In Progress, Waiting Parts, Complete", group: "Workflow" },
  { label: "Default labor rate", value: "$95/hr", group: "Pricing" },
  { label: "Service area", value: "Auburn/Lewiston and surrounding Maine towns", group: "Scheduling" },
  { label: "Working days", value: "Monday, Tuesday, Wednesday, Thursday, Friday", group: "Scheduling" },
  { label: "Work hours", value: "8:00 AM - 5:00 PM", group: "Scheduling" },
  { label: "Blocked dates", value: "2026-06-12, 2026-06-18", group: "Scheduling" },
  { label: "Appointment reply", value: "Auto-send confirmation after request submission", group: "Email" },
  { label: "Completion reply", value: "Send PDF/report link when vehicle is complete", group: "Email" }
];

export const inspectionTemplates = [
  { name: "Maine inspection", items: 42, requiredPhotos: 9, status: "Needs official rulebook review" },
  { name: "Quick safety check", items: 18, requiredPhotos: 4, status: "Ready for prototype" },
  { name: "Oil service report", items: 15, requiredPhotos: 3, status: "Ready for prototype" },
  { name: "Brake service report", items: 24, requiredPhotos: 6, status: "Draft" }
];

export const quickStats = [
  { label: "Avg response", value: "18m", icon: Clock3 },
  { label: "Customer saves", value: "31 PDFs", icon: FileText },
  { label: "VIN lookups", value: "42", icon: Gauge }
];

export const customerVehicles: Array<{ name: string; vin: string; plate: string; mileage: string; nextService: string; health: string }> = [];

export const customerReports: Array<{ id: string; title: string; vehicle: string; status: string; date: string }> = [];

export const scheduleBlocks: Array<{ time: string; label: string; type: string }> = [];
