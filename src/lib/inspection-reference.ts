export const maineInspectionManual = {
  title: "Maine Motor Vehicle Inspection Manual",
  officialPage: "https://www.maine.gov/dps/msp/investigation-traffic/crash-investigations/mv-inspections",
  pdf: "https://www1.maine.gov/sos/sites/maine.gov.sos/files/content/assets/222c001.pdf",
  complaintPhone: "207-624-8935",
  note: "Use the official Maine State Police source. Page links open the PDF at the relevant section and still allow scrolling."
};

export const maineInspectionQuickLinks = [
  { label: "Table of contents", page: 7, category: "Reference", summary: "Manual map and section numbers" },
  { label: "Station responsibilities", page: 13, category: "Licensing", summary: "Posting, hours, materials, and station obligations" },
  { label: "Technician responsibilities", page: 23, category: "Licensing", summary: "Inspection technician duties and compliance" },
  { label: "Certificates / stickers", page: 27, category: "Stickers", summary: "Sticker issuance and replacement rules" },
  { label: "Class A standards", page: 40, category: "Passenger vehicles", summary: "Primary passenger vehicle inspection standards" },
  { label: "Brakes", page: 40, category: "Safety items", summary: "Service brake, parking brake, lines, pedal, and rejection criteria" },
  { label: "Body, frame, fuel", page: 45, category: "Safety items", summary: "Rust, structure, fuel lines, leaks, and body defects" },
  { label: "Glazing / windshield / tint", page: 51, category: "Visibility", summary: "Windshield, glass, wipers, washers, and tint references" },
  { label: "Lights and electrical", page: 53, category: "Visibility", summary: "Lamp operation, auxiliary lights, horn, and electrical items" },
  { label: "Steering / suspension", page: 55, category: "Safety items", summary: "Steering linkage, ball joints, wheel bearings, springs, shocks" },
  { label: "Tires / wheels / fenders", page: 60, category: "Safety items", summary: "Tread, DOT condition, fenders, wheel/tire rejection items" },
  { label: "Exhaust / emissions", page: 65, category: "Safety items", summary: "Leaks, routing, catalytic converter, fumes, and emissions controls" },
  { label: "Class E enhanced inspection", page: 69, category: "OBD/emissions", summary: "Enhanced inspection and reporting requirements" },
  { label: "Maine laws / statutes supplement", page: 182, category: "Legal", summary: "Supplemental statutes and legal references" }
];

export function maineInspectionPdfPage(page: number) {
  return `${maineInspectionManual.pdf}#page=${page}`;
}
