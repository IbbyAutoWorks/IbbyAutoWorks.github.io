import { defaultAgreementAcceptance, type AgreementAcceptance } from "@/lib/agreements";
import { buildPartSupplierCandidates, type PartSupplierCandidate } from "@/lib/parts";
import { fallbackVehicleSpec, findVehicleSpec, type VehicleSpec } from "@/lib/vehicles";
import { syncCustomerRecordToCloud, syncWorkOrderToCloud } from "@/lib/cloud-sync";

export type PrototypePartQuote = {
  part: string;
  supplier: string;
  band: "low" | "mid" | "high";
  status: string;
  price: string;
  supplierCandidates: PartSupplierCandidate[];
  selectedSupplier: string;
  pickupStatus: "Not needed" | "Verify price" | "Order required" | "Ready for pickup" | "Picked up" | "Delivered";
};

export type PrototypeInspectionItem = {
  label: string;
  section: string;
  state: "green" | "yellow" | "red" | null;
  photoCaptured: boolean;
};

export type PrototypePartRequest = {
  id: string;
  part: string;
  reason: string;
  status: "Requested" | "Denied" | "Approved" | "Ordered" | "Ready for pickup" | "Delivered";
  requestedAt: string;
  adminNote: string;
  waitTime: string;
};

export type PrototypeServiceMeasurements = {
  lfTread: string;
  rfTread: string;
  lrTread: string;
  rrTread: string;
  lfPsi: string;
  rfPsi: string;
  lrPsi: string;
  rrPsi: string;
  frontBrakePad: string;
  rearBrakePad: string;
  frontRotorThickness: string;
  rearRotorThickness: string;
  batteryVoltage: string;
  leakNotes: string;
  rustNotes: string;
};

export type PrototypeCustomerPreferences = {
  notifications: boolean;
  location: boolean;
  rememberLogin: boolean;
  oneTimeRequest: boolean;
};

export type PrototypeCustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  profileImage: string;
  review: string;
  reviewRating: number;
  updatedAt: string;
};

export type PrototypeWorkOrder = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  vehicle: string;
  vehicleImage: string;
  vin: string;
  plate: string;
  mileage: string;
  location: string;
  service: string;
  services: string[];
  tier: "low" | "mid" | "high";
  estimate: string;
  preferredWindow: string;
  symptoms: string;
  status: "Requested" | "Parts Search" | "Accepted" | "Estimate Sent" | "Scheduled" | "En Route" | "On Site" | "In Progress" | "Waiting Parts" | "Complete";
  due: string;
  risk: string;
  createdAt: string;
  inspectionExpires: string;
  registrationExpires: string;
  serviceLocationConfirmed: boolean;
  estimateNotes: string;
  customerContactLog: string[];
  techNotes: string[];
  partRequests: PrototypePartRequest[];
  measurements: PrototypeServiceMeasurements;
  parts: PrototypePartQuote[];
  inspection: PrototypeInspectionItem[];
  vehicleSpec: VehicleSpec;
  agreementAcceptance: AgreementAcceptance;
  customerPreferences: PrototypeCustomerPreferences;
};

export const WORK_ORDERS_KEY = "ibbys-auto.work-orders";
export const WORK_ORDERS_EVENT = "ibbys-auto.work-orders.changed";
export const CUSTOMER_RECORDS_KEY = "ibbys-auto.customer-records";
export const CUSTOMER_RECORDS_EVENT = "ibbys-auto.customer-records.changed";

export function readPrototypeWorkOrders(): PrototypeWorkOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(WORK_ORDERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as PrototypeWorkOrder[]) : [];
    return parsed.map((order) => ({
      ...order,
      services: Array.isArray(order.services) ? order.services : [order.service].filter(Boolean),
      inspectionExpires: order.inspectionExpires ?? "",
      registrationExpires: order.registrationExpires ?? "",
      serviceLocationConfirmed: Boolean(order.serviceLocationConfirmed),
      estimateNotes: order.estimateNotes ?? "",
      customerContactLog: Array.isArray(order.customerContactLog) ? order.customerContactLog : [],
      techNotes: Array.isArray(order.techNotes) ? order.techNotes : [],
      partRequests: Array.isArray(order.partRequests) ? order.partRequests : [],
      measurements: { ...defaultServiceMeasurements(), ...(order.measurements ?? {}) },
      parts: Array.isArray(order.parts)
        ? order.parts.map((part) => ({
            ...part,
            supplierCandidates: Array.isArray(part.supplierCandidates) ? part.supplierCandidates : buildPartSupplierCandidates(part.part, order.tier),
            selectedSupplier: part.selectedSupplier ?? part.supplier,
            pickupStatus: part.pickupStatus ?? "Verify price"
          }))
        : buildPrototypeParts(order.services ?? order.service, order.tier),
      inspection: Array.isArray(order.inspection) ? order.inspection : buildPrototypeInspection(),
      vehicleSpec: order.vehicleSpec ?? findVehicleSpec(order.vehicle) ?? fallbackVehicleSpec,
      vehicleImage: order.vehicleImage ?? order.vehicleSpec?.image ?? findVehicleSpec(order.vehicle)?.image ?? "",
      agreementAcceptance: order.agreementAcceptance ?? defaultAgreementAcceptance(),
      customerPreferences: order.customerPreferences ?? defaultCustomerPreferences()
    }));
  } catch {
    return [];
  }
}

export function defaultCustomerPreferences(): PrototypeCustomerPreferences {
  return {
    notifications: false,
    location: false,
    rememberLogin: false,
    oneTimeRequest: true
  };
}

export function savePrototypeWorkOrder(order: PrototypeWorkOrder) {
  const current = readPrototypeWorkOrders();
  const next = [order, ...current.filter((item) => item.id !== order.id)];
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  upsertCustomerFromWorkOrder(order);
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT, { detail: order }));
  void syncWorkOrderToCloud(order).then((result) => {
    if (!result.ok && !result.skipped) console.warn("Ibby cloud work-order sync failed", result.reason);
  });
}

export function customerRecordIdFromContact(email: string, phone: string, name: string) {
  const stable = (email || phone || name || "guest").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return stable || "guest";
}

function normalizeMatchValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isUsableMatchValue(value: string) {
  return Boolean(value && !/^(not entered|no email entered|no phone entered|guest customer|admin entered customer|vehicle pending|vin pending|plate pending)$/i.test(value));
}

function isSameCustomerWorkOrder(order: PrototypeWorkOrder, customer: PrototypeCustomerRecord) {
  const orderEmail = normalizeMatchValue(order.email);
  const customerEmail = normalizeMatchValue(customer.email);
  const orderPhone = normalizeMatchValue(order.phone);
  const customerPhone = normalizeMatchValue(customer.phone);
  const orderName = normalizeMatchValue(order.customer);
  const customerName = normalizeMatchValue(customer.name);

  return (
    Boolean(isUsableMatchValue(orderEmail) && isUsableMatchValue(customerEmail) && orderEmail === customerEmail) ||
    Boolean(isUsableMatchValue(orderPhone) && isUsableMatchValue(customerPhone) && orderPhone === customerPhone) ||
    Boolean(isUsableMatchValue(orderName) && isUsableMatchValue(customerName) && orderName === customerName)
  );
}

function findMatchingCustomerForWorkOrder(customers: PrototypeCustomerRecord[], orders: PrototypeWorkOrder[], order: PrototypeWorkOrder) {
  const candidateId = customerRecordIdFromContact(order.email, order.phone, order.customer);
  const normalizedOrderVehicle = normalizeMatchValue(order.vehicle);
  return customers.find((customer) => customer.id === candidateId)
    ?? customers.find((customer) => {
      const customerOrders = orders.filter((existingOrder) => isSameCustomerWorkOrder(existingOrder, customer));
      const sameContact = isSameCustomerWorkOrder(order, customer);
      const sameVehicle = customerOrders.some((existingOrder) => normalizeMatchValue(existingOrder.vehicle) === normalizedOrderVehicle);
      return sameContact && (!normalizedOrderVehicle || sameVehicle || customerOrders.length === 0);
    });
}

export function readPrototypeCustomerRecords(): PrototypeCustomerRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOMER_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as PrototypeCustomerRecord[]) : [];
  } catch {
    return [];
  }
}

export function savePrototypeCustomerRecord(record: PrototypeCustomerRecord) {
  const current = readPrototypeCustomerRecords();
  const next = [
    { ...record, updatedAt: new Date().toISOString() },
    ...current.filter((item) => item.id !== record.id)
  ];
  window.localStorage.setItem(CUSTOMER_RECORDS_KEY, JSON.stringify(next));

  const orders = readPrototypeWorkOrders();
  const patchedOrders = orders.map((order) => (
    isSameCustomerWorkOrder(order, record) || customerRecordIdFromContact(order.email, order.phone, order.customer) === record.id
      ? {
          ...order,
          customer: record.name || order.customer,
          phone: record.phone || order.phone,
          email: record.email || order.email,
          location: record.address || order.location
        }
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(patchedOrders));
  window.dispatchEvent(new CustomEvent(CUSTOMER_RECORDS_EVENT, { detail: record }));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function upsertCustomerFromWorkOrder(order: PrototypeWorkOrder) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readPrototypeCustomerRecords();
  const orders = readPrototypeWorkOrders();
  const matchedCustomer = findMatchingCustomerForWorkOrder(current, orders, order);
  const id = matchedCustomer?.id ?? customerRecordIdFromContact(order.email, order.phone, order.customer);
  const existing = matchedCustomer;
  savePrototypeCustomerRecord({
    id,
    name: order.customer,
    phone: order.phone,
    email: order.email,
    address: order.location,
    profileImage: existing?.profileImage ?? "",
    review: existing?.review ?? "",
    reviewRating: existing?.reviewRating ?? 5,
    updatedAt: existing?.updatedAt ?? new Date().toISOString()
  });
}

export function getCustomerOrders(customer: PrototypeCustomerRecord, orders = readPrototypeWorkOrders()) {
  return orders
    .filter((order) => isSameCustomerWorkOrder(order, customer) || customerRecordIdFromContact(order.email, order.phone, order.customer) === customer.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getServiceReminders(order: PrototypeWorkOrder) {
  const services = `${order.service} ${(order.services ?? []).join(" ")}`.toLowerCase();
  const reminders: string[] = [];
  if (/tire|wheel|rotation|brake|rotor/.test(services)) {
    reminders.push("Wheel retorque due within 30 miles after wheel removal service.");
  }
  if (/oil|rotation/.test(services)) {
    reminders.push("Baseline next service due in 5,000 miles for oil/rotation maintenance.");
  }
  return reminders;
}

export function buildPrototypeParts(serviceInput: string | string[], tier: PrototypeWorkOrder["tier"]): PrototypePartQuote[] {
  const services = Array.isArray(serviceInput) ? serviceInput : [serviceInput];
  const supplierByTier: Record<PrototypeWorkOrder["tier"], string> = {
    low: "RockAuto / local value line",
    mid: "NAPA / O'Reilly availability",
    high: "OEM / premium supplier check"
  };

  const priceBands: Record<PrototypeWorkOrder["tier"], Record<string, string>> = {
    low: {
      "Oil service": "$42+",
      "Engine oil and filter change": "$42+",
      "Front brake pads and rotors": "$165+",
      "Rear brake pads and rotors": "$165+",
      "Tire replacement": "$360+",
      "Tire rotation": "$25+"
    },
    mid: {
      "Oil service": "$68+",
      "Engine oil and filter change": "$68+",
      "Front brake pads and rotors": "$285+",
      "Rear brake pads and rotors": "$285+",
      "Tire replacement": "$590+",
      "Tire rotation": "$45+"
    },
    high: {
      "Oil service": "$96+",
      "Engine oil and filter change": "$96+",
      "Front brake pads and rotors": "$430+",
      "Rear brake pads and rotors": "$430+",
      "Tire replacement": "$840+",
      "Tire rotation": "$65+"
    }
  };

  const partsByService: Record<string, string[]> = {
    "Oil service": ["Engine oil", "Oil filter", "Drain plug washer"],
    "Engine oil and filter change": ["Engine oil", "Oil filter", "Drain plug washer"],
    "Front brake pads and rotors": ["Front brake pads", "Front brake rotors", "Front brake hardware kit"],
    "Rear brake pads and rotors": ["Rear brake pads", "Rear brake rotors", "Rear brake hardware kit"],
    "Tire replacement": ["Tires", "Valve stems", "Balance and disposal"],
    "Tire rotation": ["Lug torque check", "Tire pressure set"],
    "Single tire repair": ["Tire puncture inspection", "Patch/plug eligibility", "Tire pressure set"],
    "Battery test and replacement": ["Battery", "Terminal protectant"],
    "Engine air filter": ["Engine air filter"],
    "Cabin air filter": ["Cabin air filter"],
    "Check engine light diagnostic": ["Diagnostic scan", "Manual parts lookup if repair approved"],
    "Coolant flush": ["Coolant", "Flush chemical"],
    "Transmission service": ["Transmission fluid", "Filter/pan gasket if applicable"],
    "Maine inspection pre-check": ["Inspection checklist"],
    "Suspension noise inspection": ["Manual suspension parts lookup"]
  };

  return services.flatMap((service) => (
    (partsByService[service] ?? ["Manual parts lookup"]).map((part, index) => ({
      part: services.length > 1 ? `${service}: ${part}` : part,
      supplier: supplierByTier[tier],
      band: tier,
      status: index === 0 ? "Ready to confirm" : "Needs supplier check",
      price: index === 0 ? priceBands[tier][service] ?? "Manual" : "Manual",
      supplierCandidates: buildPartSupplierCandidates(part, tier),
      selectedSupplier: supplierByTier[tier],
      pickupStatus: index === 0 ? "Verify price" : "Not needed"
    }))
  ));
}

export function buildPrototypeInspection() {
  return [
    { label: "Warning lamp operation", section: "Initial", state: null, photoCaptured: false },
    { label: "Horn and wipers", section: "Initial", state: null, photoCaptured: false },
    { label: "Air filter condition", section: "Under hood", state: null, photoCaptured: false },
    { label: "Engine oil level/condition", section: "Under hood", state: null, photoCaptured: false },
    { label: "Tread depth captured", section: "Tires", state: null, photoCaptured: false },
    { label: "Steering linkage/play", section: "Under car", state: null, photoCaptured: false }
  ] satisfies PrototypeInspectionItem[];
}

export function defaultServiceMeasurements(): PrototypeServiceMeasurements {
  return {
    lfTread: "",
    rfTread: "",
    lrTread: "",
    rrTread: "",
    lfPsi: "",
    rfPsi: "",
    lrPsi: "",
    rrPsi: "",
    frontBrakePad: "",
    rearBrakePad: "",
    frontRotorThickness: "",
    rearRotorThickness: "",
    batteryVoltage: "",
    leakNotes: "",
    rustNotes: ""
  };
}

export function updatePrototypeInspectionItem(orderId: string, label: string, patch: Partial<PrototypeInspectionItem>) {
  const current = readPrototypeWorkOrders();
  const next = current.map((order) => (
    order.id === orderId
      ? (() => {
          const inspection = order.inspection.length ? order.inspection : buildPrototypeInspection();
          const hasItem = inspection.some((item) => item.label === label);
          const nextInspection = hasItem
            ? inspection.map((item) => item.label === label ? { ...item, ...patch } : item)
            : [...inspection, { label, section: patch.section ?? "Custom", state: null, photoCaptured: false, ...patch }];
          return { ...order, inspection: nextInspection };
        })()
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function updatePrototypePartQuote(orderId: string, part: string, patch: Partial<PrototypePartQuote>) {
  const current = readPrototypeWorkOrders();
  const next = current.map((order) => (
    order.id === orderId
      ? {
          ...order,
          parts: (order.parts.length ? order.parts : buildPrototypeParts(order.service, order.tier)).map((item) => (
            item.part === part ? { ...item, ...patch } : item
          ))
        }
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function updatePrototypeWorkOrderStatus(orderId: string, status: PrototypeWorkOrder["status"]) {
  const current = readPrototypeWorkOrders();
  const next = current.map((order) => (
    order.id === orderId
      ? {
          ...order,
          status,
          risk: status === "Complete" ? "PDF ready" : status === "Scheduled" ? "Appointment set" : status === "Accepted" ? "Work accepted" : status === "En Route" ? "Technician en route" : order.risk,
          customerContactLog: [
            ...(order.customerContactLog ?? []),
            `${new Date().toLocaleString()}: Status changed to ${status}`
          ]
        }
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function updatePrototypeWorkOrder(orderId: string, patch: Partial<PrototypeWorkOrder>) {
  const current = readPrototypeWorkOrders();
  const next = current.map((order) => (
    order.id === orderId ? { ...order, ...patch } : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function addPrototypePartRequest(orderId: string, part: string, reason: string) {
  const current = readPrototypeWorkOrders();
  const request: PrototypePartRequest = {
    id: `P${Date.now().toString().slice(-6)}`,
    part: part || "Part pending",
    reason: reason || "Requested after walkaround",
    status: "Requested",
    requestedAt: new Date().toISOString(),
    adminNote: "Awaiting admin/customer approval",
    waitTime: "Pending"
  };

  const next = current.map((order) => (
    order.id === orderId
      ? {
          ...order,
          status: "Waiting Parts" as PrototypeWorkOrder["status"],
          risk: "Tech requested additional parts",
          partRequests: [request, ...(order.partRequests ?? [])],
          techNotes: [`${new Date().toLocaleString()}: Requested ${request.part}`, ...(order.techNotes ?? [])]
        }
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function updatePrototypePartRequest(orderId: string, requestId: string, patch: Partial<PrototypePartRequest>) {
  const current = readPrototypeWorkOrders();
  const next = current.map((order) => (
    order.id === orderId
      ? {
          ...order,
          partRequests: (order.partRequests ?? []).map((request) => (
            request.id === requestId ? { ...request, ...patch } : request
          )),
          customerContactLog: patch.status
            ? [`${new Date().toLocaleString()}: Part request ${requestId} marked ${patch.status}`, ...(order.customerContactLog ?? [])]
            : order.customerContactLog
        }
      : order
  ));
  window.localStorage.setItem(WORK_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}

export function clearPrototypeWorkOrders() {
  window.localStorage.removeItem(WORK_ORDERS_KEY);
  window.dispatchEvent(new CustomEvent(WORK_ORDERS_EVENT));
}
