"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, Camera, Car, CheckCircle2, KeyRound, LocateFixed, MapPin, PackageCheck, Scale, Send, UserRound, X } from "lucide-react";

import { agreementSummaries, defaultAgreementAcceptance, hasRequiredAgreementAcceptance, partsReturnOptions, type AgreementId, type PartsReturnPreference } from "@/lib/agreements";
import { serviceOptions, timeline } from "@/lib/data";
import { estimateServices, formatPriceRange } from "@/lib/parts";
import { readPricingSettings, type PricingSettings } from "@/lib/pricing-settings";
import { buildPrototypeInspection, buildPrototypeParts, CUSTOMER_RECORDS_EVENT, defaultCustomerPreferences, defaultServiceMeasurements, PrototypeCustomerRecord, PrototypeWorkOrder, readPrototypeCustomerRecords, savePrototypeWorkOrder } from "@/lib/local-store";
import { appointmentWindows, businessSchedule, findAppointmentWindow } from "@/lib/schedule";
import { decodeVinWithNhtsa, fallbackVehicleSpec, findVehicleSpec, formatVehicle, vehicleCatalog, type VehicleSpec } from "@/lib/vehicles";
import { readPrayerScheduleSettings, prayerBlockLabel, timeToMinutes, effectivePrayerTime, type PrayerScheduleSettings } from "@/lib/prayer-times";
import { ServiceSelector } from "@/components/service-selector";
import { CustomerPaymentOptions } from "@/components/customer-payment-options";
import { CustomerPromoOffers } from "@/components/customer-promo-offers";

const tirePositions = ["Left front", "Right front", "Left rear", "Right rear", "Not sure"] as const;
const includedServiceTowns = ["auburn", "lewiston", "minot", "poland", "turner", "mechanic falls", "sabattus", "lisbon", "new gloucester"];
const serviceTownSuggestions = ["Auburn", "Lewiston", "Minot", "Poland", "Turner", "Mechanic Falls", "Sabattus", "Lisbon", "New Gloucester"];
const addressSuggestions = [
  "Main Street, Auburn, ME 04210",
  "Center Street, Auburn, ME 04210",
  "Court Street, Auburn, ME 04210",
  "Lisbon Street, Lewiston, ME 04240",
  "Sabattus Street, Lewiston, ME 04240"
];
const stateOptions = ["ME", "NH", "MA", "VT", "NY", "CT", "RI"];
const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const yearOptions = Array.from({ length: 37 }, (_, index) => String(new Date().getFullYear() + 6 - index));
const today = new Date();
const todayIsoDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const appointmentDays = [
  { day: 8, label: "Mon", date: "2026-06-08", booked: false },
  { day: 9, label: "Tue", date: "2026-06-09", booked: false },
  { day: 10, label: "Wed", date: "2026-06-10", booked: true },
  { day: 11, label: "Thu", date: "2026-06-11", booked: false },
  { day: 12, label: "Fri", date: "2026-06-12", booked: true },
  { day: 13, label: "Sat", date: "2026-06-13", booked: false },
  { day: 14, label: "Sun", date: "2026-06-14", booked: true }
];
const appointmentTimes = ["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30"];
function appointmentTimeToMinutes(time: string, period: string) {
  const [hourText, minuteText] = time.split(":");
  let hour = Number(hourText) || 0;
  const minute = Number(minuteText) || 0;
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}
const appointmentMonths = Array.from({ length: 4 }, (_, index) => {
  const date = new Date(today.getFullYear(), today.getMonth() + index, 1);
  return { label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }), year: date.getFullYear(), month: date.getMonth() };
});
const requestSteps = [
  "Contact",
  "Vehicle",
  "Services",
  "Appointment",
  "Preferences",
  "Agreements",
  "Review"
];
const requestStepLoaders = ["clipboard", "burnout", "parts", "calendar", "preferences", "signature", "review"] as const;

export function RequestWorkflow({ mode = "customer" }: { mode?: "customer" | "admin" }) {
  // Request mode: customer-facing intake keeps authorization prompts; admin intake skips them.
  const isAdminMode = mode === "admin";
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSupplierChoices, setSelectedSupplierChoices] = useState<Record<string, string>>({});
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() => readPricingSettings());
  const [prayerSettings, setPrayerSettings] = useState<PrayerScheduleSettings>(() => readPrayerScheduleSettings());
  const [submittedOrder, setSubmittedOrder] = useState<PrototypeWorkOrder | null>(null);
  const [savedCustomers, setSavedCustomers] = useState<PrototypeCustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicleSpec, setSelectedVehicleSpec] = useState<VehicleSpec | null>(null);
  const [vinStatus, setVinStatus] = useState("");
  const [vinDecoded, setVinDecoded] = useState(false);
  const [agreementError, setAgreementError] = useState("");
  const [agreementAcceptance, setAgreementAcceptance] = useState(defaultAgreementAcceptance);
  const [customerPreferences, setCustomerPreferences] = useState(defaultCustomerPreferences);
  const [tireConcern, setTireConcern] = useState<(typeof tirePositions)[number]>("Not sure");
  const [form, setForm] = useState({
    name: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    town: "",
    zip: "",
    serviceState: "ME",
    email: "",
    vin: "",
    plate: "",
    plateState: "ME",
    mileage: "",
    vehicle: "",
    vehicleYear: "",
    vehicleMake: "",
    vehicleModel: "",
    inspectionMonth: "",
    inspectionYear: "",
    registrationMonth: "",
    registrationYear: "",
    appointmentMonth: appointmentMonths[0].label,
    appointmentDay: String(today.getDate()),
    appointmentDate: todayIsoDate,
    appointmentTime: "8:00",
    appointmentPeriod: "AM",
    preferredWindow: appointmentWindows.find((window) => !window.booked)?.label ?? appointmentWindows[0]?.label ?? "",
    symptoms: ""
  });
  const agreementsReady = isAdminMode || hasRequiredAgreementAcceptance(agreementAcceptance);
  const selectedWindow = findAppointmentWindow(form.preferredWindow);
  const needsTirePosition = selectedServices.includes("Single tire repair");
  const vehicleQuery = vehicleSearch.trim().toLowerCase();
  const visibleVehicles = vehicleCatalog.filter((vehicle) => {
    return vehicleQuery && `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`.toLowerCase().includes(vehicleQuery);
  }).slice(0, 6);
  const vehicleCards = vehicleQuery ? visibleVehicles : selectedVehicleSpec ? [selectedVehicleSpec] : [];
  const selectedAppointmentMonth = appointmentMonths.find((month) => month.label === form.appointmentMonth) ?? appointmentMonths[0];
  const calendarDayCount = new Date(selectedAppointmentMonth.year, selectedAppointmentMonth.month + 1, 0).getDate();
  const appointmentCalendarDays = Array.from({ length: calendarDayCount }, (_, index) => {
    const day = index + 1;
    const date = new Date(selectedAppointmentMonth.year, selectedAppointmentMonth.month, day);
    const isoDate = `${selectedAppointmentMonth.year}-${String(selectedAppointmentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const booked = appointmentDays.some((item) => item.date === isoDate && item.booked);
    return { day, date: isoDate, label: date.toLocaleDateString("en-US", { weekday: "short" }), booked };
  });
  const selectedAppointmentDay = appointmentCalendarDays.find((day) => day.date === form.appointmentDate) ?? appointmentCalendarDays[0];
  const preferredWindow = `${selectedAppointmentDay?.label ?? "Day"}, ${form.appointmentMonth} ${selectedAppointmentDay?.day ?? ""} - ${form.appointmentTime} ${form.appointmentPeriod}`.trim();
  const cleanVin = form.vin.trim().toUpperCase();
  const vinLengthReady = cleanVin.length === 17;
  const vinStateClass = !cleanVin ? "" : vinDecoded ? "valid" : vinLengthReady ? "ready" : "invalid";
  const vehicleYears = Array.from(new Set(vehicleCatalog.map((vehicle) => vehicle.year))).sort((a, b) => Number(b) - Number(a));
  const vehicleMakes = Array.from(new Set(vehicleCatalog
    .filter((vehicle) => !form.vehicleYear || vehicle.year === form.vehicleYear)
    .map((vehicle) => vehicle.make))).sort();
  const vehicleModels = Array.from(new Set(vehicleCatalog
    .filter((vehicle) => (!form.vehicleYear || vehicle.year === form.vehicleYear) && (!form.vehicleMake || vehicle.make === form.vehicleMake))
    .map((vehicle) => vehicle.model))).sort();
  const serviceAreaStatus = useMemo(() => {
    const normalizedAddress = `${form.address} ${form.town} ${form.serviceState}`.toLowerCase();
    if (!normalizedAddress.trim()) {
      return {
        className: "service-area-card",
        label: "Enter service address",
        detail: `Included mobile radius starts from ${businessSchedule.baseLocation}.`
      };
    }
    const townMatch = includedServiceTowns.find((town) => normalizedAddress.includes(town));
    return townMatch
      ? {
          className: "service-area-card in-range",
          label: "Inside mobile service radius",
          detail: `${townMatch.replace(/\b\w/g, (letter) => letter.toUpperCase())} is treated as inside the ${businessSchedule.includedRadiusMiles}-mile included radius.`
        }
      : {
          className: "service-area-card out-range",
          label: "May be outside included radius",
          detail: `${businessSchedule.outsideRadiusFee}. Final mileage should be confirmed by map routing before acceptance.`
        };
  }, [form.address, form.town, form.serviceState]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout", { detail: { variant: "clipboard" } }));
    }, 80);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    function syncPricingSettings() {
      setPricingSettings(readPricingSettings());
    }
    function syncPrayerSettings() {
      setPrayerSettings(readPrayerScheduleSettings());
    }
    syncPricingSettings();
    syncPrayerSettings();
    window.addEventListener("storage", syncPricingSettings);
    window.addEventListener("storage", syncPrayerSettings);
    window.addEventListener("ibbys-auto.pricing-settings.changed", syncPricingSettings);
    window.addEventListener("ibbys-auto.prayer-settings.changed", syncPrayerSettings);
    return () => {
      window.removeEventListener("storage", syncPricingSettings);
      window.removeEventListener("storage", syncPrayerSettings);
      window.removeEventListener("ibbys-auto.pricing-settings.changed", syncPricingSettings);
      window.removeEventListener("ibbys-auto.prayer-settings.changed", syncPrayerSettings);
    };
  }, []);

  useEffect(() => {
    if (!isAdminMode) return;

    function syncCustomers() {
      setSavedCustomers(readPrototypeCustomerRecords());
    }

    syncCustomers();
    window.addEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
    window.addEventListener("storage", syncCustomers);
    return () => {
      window.removeEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
      window.removeEventListener("storage", syncCustomers);
    };
  }, [isAdminMode]);

  const estimateDetails = useMemo(() => estimateServices(selectedServices, pricingSettings), [selectedServices, pricingSettings]);
  const selectedDistributorSummary = Object.entries(selectedSupplierChoices).map(([key, supplier]) => `${key}: ${supplier}`).join("; ");
  const customerDisplayName = `${form.firstName} ${form.lastName}`.replace(/\s+/g, " ").trim() || form.name;
  const serviceLocation = `${form.address}${form.town ? `, ${form.town}` : ""}${form.serviceState ? `, ${form.serviceState}` : ""}${form.zip ? ` ${form.zip}` : ""}`.trim();
  const activeVehicleContext = form.vehicle || `${form.vehicleYear} ${form.vehicleMake} ${form.vehicleModel}`.replace(/\s+/g, " ").trim();
  const activeAreaContext = `${form.town} ${form.serviceState}`.replace(/\s+/g, " ").trim();
  const selectedAppointmentMinutes = appointmentTimeToMinutes(form.appointmentTime, form.appointmentPeriod);
  const activePrayerBlocks = prayerSettings.enabled ? prayerSettings.blocks.filter((block) => block.enabled) : [];
  const selectedPrayerConflict = activePrayerBlocks.find((block) => {
    const start = timeToMinutes(effectivePrayerTime(block));
    const end = start + block.durationMinutes;
    return selectedAppointmentMinutes >= start && selectedAppointmentMinutes < end;
  });
  const reviewGroups = [
    {
      title: "Customer",
      rows: [
        ["Name", customerDisplayName || (isAdminMode ? "Admin-entered customer" : "Guest customer")],
        ["Phone", form.phone || "Not entered"],
        ["Email", form.email || "Not entered"],
        ["Service address", serviceLocation || "Not entered"],
        ["Service radius", serviceAreaStatus.label]
      ]
    },
    {
      title: "Vehicle",
      rows: [
        ["Vehicle", form.vehicle || "Vehicle pending"],
        ["VIN", form.vin || "Not entered"],
        ["Plate", `${form.plate || "Not entered"} ${form.plate ? form.plateState : ""}`.trim()],
        ["Mileage", form.mileage || "Not entered"],
        ["Inspection expires", `${form.inspectionMonth} ${form.inspectionYear}`.trim() || "Not entered"],
        ["Registration expires", `${form.registrationMonth} ${form.registrationYear}`.trim() || "Not entered"]
      ]
    },
    {
      title: "Requested Work",
      rows: [
        ["Services", selectedServices.length ? selectedServices.join(", ") : "None selected"],
        ["Tire position", needsTirePosition ? tireConcern : "Not needed"],
        ["Draft estimate", selectedServices.length ? formatPriceRange(estimateDetails.total) : "Pending service selection"],
        ["Distributor choices", selectedDistributorSummary || "Customer can compare/select during parts review"],
        ["Symptoms / notes", form.symptoms || "No symptoms entered"]
      ]
    },
    {
      title: "Appointment",
      rows: [
        ["Preferred window", preferredWindow],
        ["Availability", selectedPrayerConflict ? `Prayer block: ${selectedPrayerConflict.name}` : selectedAppointmentDay?.booked ? "Booked" : "Open"],
        ["Business hours", businessSchedule.hours],
        ["Google Calendar", businessSchedule.googleCalendarStatus]
      ]
    },
    {
      title: "Preferences and Agreements",
      rows: [
        ["Notifications", customerPreferences.notifications ? "Allowed" : "Not allowed"],
        ["Location", customerPreferences.location ? "Allowed" : "Manual address only"],
        ["Remember login", customerPreferences.rememberLogin ? "Requested" : "Not requested"],
        ["Request type", customerPreferences.oneTimeRequest ? "One-time request" : "Account follow-up"],
        ["Required agreements", isAdminMode ? "Admin intake accepted" : `${agreementSummaries.filter((agreement) => agreementAcceptance.accepted[agreement.id]).length}/${agreementSummaries.length} accepted`],
        ["Parts return", partsReturnOptions.find((option) => option.value === agreementAcceptance.partsReturnPreference)?.label ?? "Not selected"]
      ]
    }
  ];

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeStep(nextStep: number) {
    const boundedStep = Math.max(0, Math.min(requestSteps.length - 1, nextStep));
    if (boundedStep === activeStep) return;

    window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout", { detail: { variant: requestStepLoaders[boundedStep] } }));
    window.setTimeout(() => {
      setActiveStep(boundedStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 520);
  }

  function stepClass(index: number) {
    return activeStep === index ? "workorder-step active" : "workorder-step";
  }

  function updateVin(value: string) {
    const nextVin = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
    setVinDecoded(false);
    setVinStatus(nextVin ? `${nextVin.length}/17 characters entered.` : "");
    updateForm("vin", nextVin);
  }

  function chooseVehicle(spec: VehicleSpec) {
    setSelectedVehicleSpec(spec);
    setForm((current) => ({
      ...current,
      vehicle: formatVehicle(spec),
      vehicleYear: spec.year,
      vehicleMake: spec.make,
      vehicleModel: spec.model
    }));
  }

  function chooseVehicleField(field: "vehicleYear" | "vehicleMake" | "vehicleModel", value: string) {
    const next = {
      ...form,
      [field]: value,
      ...(field === "vehicleYear" ? { vehicleMake: "", vehicleModel: "" } : {}),
      ...(field === "vehicleMake" ? { vehicleModel: "" } : {})
    };
    const vehicle = `${next.vehicleYear} ${next.vehicleMake} ${next.vehicleModel}`.trim();
    setSelectedVehicleSpec(findVehicleSpec(vehicle) ?? null);
    setForm({ ...next, vehicle });
  }

  function chooseSavedCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    const customer = savedCustomers.find((item) => item.id === customerId);
    if (!customer) return;
    setForm((current) => ({
      ...current,
      name: customer.name,
      firstName: customer.name.split(" ")[0] ?? "",
      lastName: customer.name.split(" ").slice(1).join(" "),
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    }));
  }

  function toggleAgreement(id: AgreementId, checked: boolean) {
    setAgreementAcceptance((current) => ({
      ...current,
      accepted: { ...current.accepted, [id]: checked }
    }));
    setAgreementError("");
  }

  function choosePartsReturnPreference(value: PartsReturnPreference) {
    setAgreementAcceptance((current) => ({ ...current, partsReturnPreference: value }));
  }

  function toggleCustomerPreference(field: keyof typeof customerPreferences, checked: boolean) {
    setCustomerPreferences((current) => ({ ...current, [field]: checked }));
  }

  function toggleService(serviceName: string, checked: boolean) {
    setSelectedServices((current) => {
      const next = checked ? [...current, serviceName] : current.filter((item) => item !== serviceName);
      if (!checked) {
        setSelectedSupplierChoices((choices) => Object.fromEntries(Object.entries(choices).filter(([key]) => key !== serviceName && !key.startsWith(`${serviceName}::`))));
      }
      return next;
    });
  }

  function chooseSupplier(choiceKey: string, supplierName: string) {
    setSelectedSupplierChoices((current) => ({ ...current, [choiceKey]: supplierName }));
  }


  async function decodeVin() {
    if (!vinLengthReady) {
      setVinDecoded(false);
      setVinStatus("Enter all 17 VIN characters before decoding.");
      return;
    }

    setVinStatus("Decoding VIN with NHTSA...");
    try {
      const decoded = await decodeVinWithNhtsa(form.vin);
      const matchedSpec = findVehicleSpec(decoded.vehicle);
      setVinDecoded(true);
      setSelectedVehicleSpec(matchedSpec ?? {
        ...fallbackVehicleSpec,
        id: `vin-${form.vin.trim().toUpperCase()}`,
        year: decoded.year || "Decoded",
        make: decoded.make || "Vehicle",
        model: decoded.model || "Pending",
        trim: decoded.trim || "VIN decoded",
        bodyStyle: decoded.bodyStyle || "Decoded from VIN",
        notes: ["VIN decoded by NHTSA vPIC.", "Add OEM-verified torque and fluid specs before relying on this quick reference."],
        source: "NHTSA vPIC VIN decode plus manual spec fallback"
      });
      setForm((current) => ({
        ...current,
        vehicle: decoded.vehicle || current.vehicle,
        vehicleYear: decoded.year || current.vehicleYear,
        vehicleMake: decoded.make || current.vehicleMake,
        vehicleModel: decoded.model || current.vehicleModel
      }));
      setVinStatus(`Decoded ${decoded.vehicle || "vehicle"}. Specs still need catalog/OEM verification if not matched.`);
    } catch (error) {
      setVinDecoded(false);
      setVinStatus(`${error instanceof Error ? error.message : "VIN decode failed."} Please check the VIN and try again.`);
    }
  }

  function submitRequest() {
    if (!isAdminMode && !agreementsReady) {
      setAgreementError("Please accept each required authorization before submitting the work request.");
      return;
    }
    const acceptedAt = new Date().toISOString();
    const adminAgreementAcceptance = {
      ...agreementAcceptance,
      accepted: Object.fromEntries(agreementSummaries.map((agreement) => [agreement.id, true])) as typeof agreementAcceptance.accepted,
      acceptedAt,
      acceptedBy: "Admin-created phone/in-person intake"
    };

    const order: PrototypeWorkOrder = {
      id: `${isAdminMode ? "A" : "C"}${Date.now().toString().slice(-6)}`,
      customer: customerDisplayName || (isAdminMode ? "Admin-entered customer" : "Guest customer"),
      phone: form.phone || "No phone entered",
      email: form.email || "No email entered",
      vehicle: form.vehicle || "Vehicle pending",
      vehicleImage: (selectedVehicleSpec ?? findVehicleSpec(form.vehicle))?.image ?? "",
      vin: form.vin || "VIN pending",
      plate: `${form.plate || "Plate pending"} ${form.plateState}`.trim(),
      mileage: form.mileage || "Mileage pending",
      location: serviceLocation || "Address pending",
      service: selectedServices.length ? (needsTirePosition ? `${selectedServices.join(", ")} (${tireConcern} tire)` : selectedServices.join(", ")) : "Service pending",
      services: selectedServices,
      tier: "mid",
      estimate: selectedServices.length ? formatPriceRange(estimateDetails.total) : "Pending",
      preferredWindow,
      symptoms: `${form.symptoms || "No symptoms entered"}${needsTirePosition ? ` Tire needing attention: ${tireConcern}.` : ""}`,
      status: isAdminMode ? "Scheduled" : "Requested",
      due: preferredWindow || "Needs scheduling",
      risk: isAdminMode ? "Admin intake" : "Customer submitted",
      createdAt: new Date().toISOString(),
      inspectionExpires: `${form.inspectionMonth} ${form.inspectionYear}`.trim(),
      registrationExpires: `${form.registrationMonth} ${form.registrationYear}`.trim(),
      serviceLocationConfirmed: Boolean(form.address && form.town && form.serviceState),
      estimateNotes: `IAW draft estimate includes ${estimateDetails.parts.length} part line(s), ${estimateDetails.laborHours.toFixed(1)} labor hour(s) at $${pricingSettings.shopLaborRate}/hr, and estimated labor savings of $${estimateDetails.savings.amount} vs market rate. Distributor choices: ${selectedDistributorSummary || "none selected yet"}. Final estimate requires technician acceptance and live supplier verification.`,
      customerContactLog: [
        `${new Date().toLocaleString()}: ${isAdminMode ? "Admin created work order from intake page" : "Customer submitted service request"}`,
        `${new Date().toLocaleString()}: Preferences - notifications ${customerPreferences.notifications ? "allowed" : "not allowed"}, location ${customerPreferences.location ? "allowed" : "not allowed"}, remember login ${customerPreferences.rememberLogin ? "requested" : "not requested"}`
      ],
      techNotes: [],
      partRequests: [],
      supplyRequests: [],
      mileageLogs: [],
      measurements: defaultServiceMeasurements(),
      parts: buildPrototypeParts(selectedServices, "mid", selectedSupplierChoices, activeVehicleContext, activeAreaContext),
      inspection: buildPrototypeInspection(),
      vehicleSpec: selectedVehicleSpec ?? findVehicleSpec(form.vehicle) ?? fallbackVehicleSpec,
      agreementAcceptance: isAdminMode ? adminAgreementAcceptance : {
        ...agreementAcceptance,
        acceptedAt,
        acceptedBy: customerDisplayName || "Guest customer"
      },
      customerPreferences: isAdminMode ? { ...customerPreferences, oneTimeRequest: false } : customerPreferences
    };

    savePrototypeWorkOrder(order);
    setSubmittedOrder(order);
  }

  return (
    <div className="request-workflow">
      {/* Request overview: explains the intake flow and shows the live draft estimate. */}
      <section className="request-overview">
        <div>
          <p className="section-label">Customer work request</p>
          <h1>{isAdminMode ? "Admin intake for a customer work order." : "Build a work order with vehicle, service, appointment, photos, and contact details."}</h1>
          <p>
            {isAdminMode
              ? "Use the same intake flow for phone, in-person, or admin-entered requests. Customer-only authorization prompts are skipped here."
              : "This request saves to the work-order board and syncs to Supabase when you are signed in; local storage remains the offline fallback."}
          </p>
        </div>
        <div className="estimate-summary">
          <span>Draft estimate range</span>
          <strong>{selectedServices.length ? formatPriceRange(estimateDetails.total) : "Pending"}</strong>
          <small>{selectedServices.length ? `${estimateDetails.parts.length} part lines - ${estimateDetails.laborHours.toFixed(1)} labor hr at $${pricingSettings.shopLaborRate}/hr - saves about $${estimateDetails.savings.amount} labor vs market` : "Select requested services to calculate parts, labor, and draft price range."}</small>
        </div>
      </section>

      {/* Request wizard: step tabs plus the form panels that build a work order. */}
      <section className="request-wizard">
        <div className="panel request-stepper-panel">
          <div>
            <p className="section-label">Work order step {activeStep + 1} of {requestSteps.length}</p>
            <h2>{requestSteps[activeStep]}</h2>
          </div>
          <div className="request-step-tabs">
            {requestSteps.map((step, index) => (
              <button className={activeStep === index ? "selected" : ""} key={step} onClick={() => changeStep(index)}>
                <span>{index + 1}</span>
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* Step 1 - Customer: contact information and saved-customer picker for admin mode. */}
        <div className={stepClass(0)}>
          <div className="panel request-form-panel">
          <div className="panel-title">
            <h2>Customer contact</h2>
            <UserRound />
          </div>
          {isAdminMode ? (
            <label className="wide-field saved-customer-picker">
              <span>Use saved customer</span>
              <select value={selectedCustomerId} onChange={(event) => chooseSavedCustomer(event.target.value)}>
                <option value="">New or unsaved customer</option>
                {savedCustomers.map((customer) => (
                  <option value={customer.id} key={customer.id}>{customer.name} - {customer.phone || customer.email}</option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="form-grid">
            <label><span>First name</span><input autoComplete="given-name" value={form.firstName} onChange={(event) => updateForm("firstName", event.target.value)} placeholder="First name" /></label>
            <label><span>Last name</span><input autoComplete="family-name" value={form.lastName} onChange={(event) => updateForm("lastName", event.target.value)} placeholder="Last name" /></label>
            <label><span>Phone</span><input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder="Best phone number" /></label>
            <label><span>Address</span><input autoComplete="street-address" list="service-address-suggestions" value={form.address} onChange={(event) => updateForm("address", event.target.value)} placeholder="Street address" /></label>
            <label><span>Town</span><input autoComplete="address-level2" list="service-town-suggestions" value={form.town} onChange={(event) => updateForm("town", event.target.value)} placeholder="Town / city" /></label>
            <label><span>State</span><select value={form.serviceState} onChange={(event) => updateForm("serviceState", event.target.value)}>{stateOptions.map((state) => <option key={state}>{state}</option>)}</select></label>
            <label><span>ZIP code</span><input autoComplete="postal-code" inputMode="numeric" value={form.zip} onChange={(event) => updateForm("zip", event.target.value.replace(/[^0-9-]/g, "").slice(0, 10))} placeholder="04210" /></label>
            <label><span>Email</span><input value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="Email for updates and PDFs" /></label>
          </div>
          <datalist id="service-address-suggestions">{addressSuggestions.map((address) => <option key={address} value={address} />)}</datalist>
          <datalist id="service-town-suggestions">{serviceTownSuggestions.map((town) => <option key={town} value={town} />)}</datalist>
          <div className={serviceAreaStatus.className}>
            <MapPin size={17} />
            <div>
              <strong>{serviceAreaStatus.label}</strong>
              <span>{serviceAreaStatus.detail}</span>
            </div>
          </div>
          </div>
        </div>

        {/* Vehicle and symptom details: vehicle lookup, mileage, location checks, and issue notes. */}
        <div className={stepClass(1)}>
          <div className="panel request-form-panel">
          <div className="panel-title">
            <h2>Vehicle details</h2>
            <Car />
          </div>
          <div className="form-grid">
            <label className={`vin-field ${vinStateClass}`}><span>VIN</span><input value={form.vin} onChange={(event) => updateVin(event.target.value)} placeholder="17-character VIN" /></label>
            <label><span>Plate number</span><input value={form.plate} onChange={(event) => updateForm("plate", event.target.value.toUpperCase())} placeholder="Plate number" /></label>
            <label><span>Plate state</span><select value={form.plateState} onChange={(event) => updateForm("plateState", event.target.value)}>{stateOptions.map((state) => <option key={state}>{state}</option>)}</select></label>
            <label><span>Mileage</span><input value={form.mileage} onChange={(event) => updateForm("mileage", event.target.value)} placeholder="Current mileage" /></label>
            <label><span>Vehicle year</span><select value={form.vehicleYear} onChange={(event) => chooseVehicleField("vehicleYear", event.target.value)}><option value="">Select year</option>{vehicleYears.map((year) => <option key={year}>{year}</option>)}</select></label>
            <label><span>Vehicle make</span><select value={form.vehicleMake} onChange={(event) => chooseVehicleField("vehicleMake", event.target.value)}><option value="">Select make</option>{vehicleMakes.map((make) => <option key={make}>{make}</option>)}</select></label>
            <label><span>Vehicle model</span><select value={form.vehicleModel} onChange={(event) => chooseVehicleField("vehicleModel", event.target.value)}><option value="">Select model</option>{vehicleModels.map((model) => <option key={model}>{model}</option>)}</select></label>
            <label><span>Inspection month</span><select value={form.inspectionMonth} onChange={(event) => updateForm("inspectionMonth", event.target.value)}><option value="">Month</option>{monthOptions.map((month) => <option key={month}>{month}</option>)}</select></label>
            <label><span>Inspection year</span><select value={form.inspectionYear} onChange={(event) => updateForm("inspectionYear", event.target.value)}><option value="">Year</option>{yearOptions.slice(0, 12).map((year) => <option key={year}>{year}</option>)}</select></label>
            <label><span>Registration month</span><select value={form.registrationMonth} onChange={(event) => updateForm("registrationMonth", event.target.value)}><option value="">Month</option>{monthOptions.map((month) => <option key={month}>{month}</option>)}</select></label>
            <label><span>Registration year</span><select value={form.registrationYear} onChange={(event) => updateForm("registrationYear", event.target.value)}><option value="">Year</option>{yearOptions.slice(0, 12).map((year) => <option key={year}>{year}</option>)}</select></label>
          </div>
          <div className="vin-decode-row">
            <button className={vinDecoded ? "vin-decode-button valid" : vinLengthReady ? "vin-decode-button ready" : "vin-decode-button invalid"} disabled={!vinLengthReady} onClick={decodeVin}><Car size={15} /> Decode VIN</button>
            <span>{vinStatus || "VIN decode uses the free NHTSA vPIC API when online."}</span>
          </div>
          <div className="vehicle-catalog">
            <div className="catalog-head">
              <div>
                <p className="section-label">Vehicle picker</p>
                <h3>Search or decode to show matching vehicle images</h3>
              </div>
              <input value={vehicleSearch} onChange={(event) => setVehicleSearch(event.target.value)} placeholder="Search year, make, model" />
            </div>
            {vehicleCards.length ? (
              <div className="vehicle-card-grid">
                {vehicleCards.map((vehicle) => (
                  <button className={selectedVehicleSpec?.id === vehicle.id ? "vehicle-card selected" : "vehicle-card"} key={vehicle.id} onClick={() => chooseVehicle(vehicle)}>
                    <img src={vehicle.image} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
                    <strong>{formatVehicle(vehicle)}</strong>
                    <span>{vehicle.trim}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="vehicle-picker-empty">
                <Car size={18} />
                <span>Enter a VIN, type a vehicle search, or manually enter the year/make/model. Matching images appear only after that.</span>
              </div>
            )}
          </div>
          <label className="wide-field"><span>Symptoms / request notes</span><textarea value={form.symptoms} onChange={(event) => updateForm("symptoms", event.target.value)} placeholder="What is happening? Any sounds, lights, leaks, or service notes?" /></label>
          </div>
        </div>

        {/* Customer account preferences: one-time request versus saved customer account setup. */}
        <div className={stepClass(4)}>
          <div className="panel">
          {!isAdminMode ? <div className="permission-panel">
            <div className="panel-title">
              <div>
                <p className="section-label">Web app preferences</p>
                <h2>Notifications, location, and account convenience</h2>
              </div>
              <Bell />
            </div>
            <div className="preference-grid">
              <label className={customerPreferences.notifications ? "selected" : ""}>
                <input checked={customerPreferences.notifications} onChange={(event) => toggleCustomerPreference("notifications", event.target.checked)} type="checkbox" />
                <Bell size={16} />
                <div><strong>Notify me</strong><span>Appointment confirmation, en route, completion, and next-service reminders.</span></div>
              </label>
              <label className={customerPreferences.location ? "selected" : ""}>
                <input checked={customerPreferences.location} onChange={(event) => toggleCustomerPreference("location", event.target.checked)} type="checkbox" />
                <LocateFixed size={16} />
                <div><strong>Use my service location</strong><span>Allow saved web-app location context for routing and arrival updates.</span></div>
              </label>
              <label className={customerPreferences.rememberLogin ? "selected" : ""}>
                <input checked={customerPreferences.rememberLogin} onChange={(event) => toggleCustomerPreference("rememberLogin", event.target.checked)} type="checkbox" />
                <KeyRound size={16} />
                <div><strong>Remember my login</strong><span>Preference for easier account access after signing in on this device.</span></div>
              </label>
              <label className={customerPreferences.oneTimeRequest ? "selected" : ""}>
                <input checked={customerPreferences.oneTimeRequest} onChange={(event) => toggleCustomerPreference("oneTimeRequest", event.target.checked)} type="checkbox" />
                <UserRound size={16} />
                <div><strong>One-time request</strong><span>Submit without an account. Sign up later to keep work history and vehicles.</span></div>
              </label>
            </div>
          </div> : null}
          </div>
        </div>

        {/* Requested services: maintenance category, tire position, and service selections. */}
        <div className={stepClass(2)}>
        <div className="panel">
          <div className="panel-title">
            <h2>Requested services</h2>
            <Car />
          </div>
          <ServiceSelector selectedServices={selectedServices} onToggleService={toggleService} selectedSupplierChoices={selectedSupplierChoices} onSupplierChoiceChange={chooseSupplier} vehicleContext={activeVehicleContext} areaContext={activeAreaContext} />
          {selectedServices.length ? (
            <div className="selected-service-removal-row">
              {selectedServices.map((service) => (
                <button className="removable-service-chip" key={service} onClick={() => toggleService(service, false)} type="button">
                  <X size={13} /> Remove {service}
                </button>
              ))}
            </div>
          ) : null}
          {needsTirePosition ? (
            <label className="inline-input tire-position-picker"><Car /><span>Tire needing attention</span>
              <select value={tireConcern} onChange={(event) => setTireConcern(event.target.value as (typeof tirePositions)[number])}>
                {tirePositions.map((position) => <option key={position}>{position}</option>)}
              </select>
            </label>
          ) : null}
        </div>
        </div>



        {/* Appointment details: date/time window, service location, and optional photos. */}
        <div className={stepClass(3)}>
        <div className="panel">
          <div className="panel-title">
            <h2>Appointment and photos</h2>
            <CalendarClock />
          </div>
          <div className="appointment-picker">
            <button className="secondary-button"><MapPin size={15} /> Confirm service location</button>
            <div className="time-select-grid">
              <label><span>Month</span><select value={form.appointmentMonth} onChange={(event) => {
                const nextMonth = appointmentMonths.find((month) => month.label === event.target.value) ?? appointmentMonths[0];
                const nextDate = `${nextMonth.year}-${String(nextMonth.month + 1).padStart(2, "0")}-01`;
                setForm((current) => ({ ...current, appointmentMonth: nextMonth.label, appointmentDay: "1", appointmentDate: nextDate }));
              }}>{appointmentMonths.map((month) => <option key={month.label}>{month.label}</option>)}</select></label>
              <label><span>Day</span><select value={form.appointmentDay} onChange={(event) => {
                const day = event.target.value;
                updateForm("appointmentDay", day);
                updateForm("appointmentDate", `${selectedAppointmentMonth.year}-${String(selectedAppointmentMonth.month + 1).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`);
              }}>{appointmentCalendarDays.map((day) => <option disabled={day.booked} key={day.date} value={String(day.day)}>{day.day} - {day.booked ? "Booked" : "Open"}</option>)}</select></label>
            </div>
            <div className="request-calendar-grid full-calendar-grid">
              {appointmentCalendarDays.map((day) => (
                <button className={form.appointmentDate === day.date ? "selected" : day.booked ? "booked" : ""} disabled={day.booked} key={day.date} onClick={() => setForm((current) => ({ ...current, appointmentDate: day.date, appointmentDay: String(day.day) }))}>
                  <span>{day.label}</span>
                  <strong>{day.day}</strong>
                  <small>{day.booked ? "Booked" : "Open"}</small>
                </button>
              ))}
            </div>
            <div className="time-select-grid">
              <label><span>Time</span><select value={form.appointmentTime} onChange={(event) => updateForm("appointmentTime", event.target.value)}>{appointmentTimes.map((time) => {
                const minutes = appointmentTimeToMinutes(time, form.appointmentPeriod);
                const blockedByPrayer = activePrayerBlocks.find((block) => minutes >= timeToMinutes(effectivePrayerTime(block)) && minutes < timeToMinutes(effectivePrayerTime(block)) + block.durationMinutes);
                return <option disabled={Boolean(blockedByPrayer)} key={time}>{time}{blockedByPrayer ? ` - Prayer block (${blockedByPrayer.name})` : ""}</option>;
              })}</select></label>
              <label><span>AM / PM</span><select value={form.appointmentPeriod} onChange={(event) => updateForm("appointmentPeriod", event.target.value)}><option>AM</option><option>PM</option></select></label>
            </div>
            <div className={selectedPrayerConflict || selectedAppointmentDay?.booked ? "availability-card booked" : "availability-card"}>
              <strong>{selectedPrayerConflict ? `Blocked for ${selectedPrayerConflict.name}` : selectedAppointmentDay?.booked ? "Booked" : "Available"}</strong>
              <span>{preferredWindow} - Hours: {businessSchedule.hours}</span>
              <small>{selectedPrayerConflict ? prayerBlockLabel(selectedPrayerConflict) : `Google Calendar: ${businessSchedule.googleCalendarStatus}`}</small>
            </div>
            {activePrayerBlocks.length ? (
              <div className="prayer-window-strip">
                {activePrayerBlocks.map((block) => <span key={block.name}>{prayerBlockLabel(block)} · reminder {block.reminderMinutes} min before</span>)}
              </div>
            ) : null}
            <button className="secondary-button"><Camera size={15} /> Add photos of issue or vehicle</button>
          </div>
        </div>
        </div>

        {/* Authorization and estimate review: customer agreement before final submit. */}
        <div className={stepClass(5)}>
        {!isAdminMode ? <div className="panel request-final-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Final step</p>
              <h2>Customer agreement check-off</h2>
            </div>
            <Scale />
          </div>
          <p className="legal-note">
            These check-offs summarize the business documents in this repo. Final production wording should be reviewed by the business owner and legal counsel before public use.
          </p>
          <div className="agreement-list compact-agreement-list">
            {agreementSummaries.map((agreement) => (
              <label className="agreement-row" key={agreement.id}>
                <input
                  checked={agreementAcceptance.accepted[agreement.id]}
                  data-agreement="required"
                  onChange={(event) => toggleAgreement(agreement.id, event.target.checked)}
                  type="checkbox"
                />
                <div>
                  <strong>{agreement.title}</strong>
                  <span>{agreement.summary}</span>
                  <small><a href={agreement.url} target="_blank" rel="noreferrer">View agreement file</a></small>
                </div>
              </label>
            ))}
          </div>
          <div className="parts-choice-grid">
            {partsReturnOptions.map((option) => (
              <label className={agreementAcceptance.partsReturnPreference === option.value ? "selected" : ""} key={option.value}>
                <input
                  checked={agreementAcceptance.partsReturnPreference === option.value}
                  name="parts-return"
                  onChange={() => choosePartsReturnPreference(option.value)}
                  type="radio"
                />
                <strong>{option.label}</strong>
                <span>{option.detail}</span>
              </label>
            ))}
          </div>
          {agreementError ? <div className="agreement-error">{agreementError}</div> : null}
        </div> : (
          <div className="panel request-final-panel">
            <div className="panel-title">
              <div>
                <p className="section-label">Admin intake</p>
                <h2>Customer authorizations skipped</h2>
              </div>
              <Scale />
            </div>
            <p className="legal-note">Admin-created work orders assume phone or in-person authorization. The final review step creates the work order.</p>
          </div>
        )}
        </div>

        {/* Confirmation: submitted order summary and next-step actions. */}
        <div className={stepClass(6)}>
          {submittedOrder ? (
            <div className="success-card">
              <CheckCircle2 size={18} />
              <div>
                <strong>Request #{submittedOrder.id} created</strong>
                <span>{isAdminMode ? "The work order is on the admin board and ready for scheduling or parts review." : "Open the admin dashboard to see this new requested work order."}</span>
              </div>
              <Link href="/admin">View admin</Link>
            </div>
          ) : null}

        <div className="panel request-review-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Final review</p>
              <h2>Confirm the work order request</h2>
            </div>
            <FileReviewIcon />
          </div>
          <p className="legal-note">Review each section before submitting. The admin dashboard will receive this as a new work order and link it to matching customer history when the contact and vehicle details match.</p>
          {!isAdminMode ? <CustomerPromoOffers /> : null}
          <div className="request-review-grid">
            {reviewGroups.map((group) => (
              <div className="request-review-card" key={group.title}>
                <strong>{group.title}</strong>
                {group.rows.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <em>{value}</em>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {!isAdminMode ? <CustomerPaymentOptions estimate={selectedServices.length ? formatPriceRange(estimateDetails.total) : "pending service selection"} /> : null}
          {agreementError ? <div className="agreement-error">{agreementError}</div> : null}
        </div>

        <div className="panel">
          <div className="panel-title">
            <h2>What happens next</h2>
            <CheckCircle2 />
          </div>
          <div className="timeline compact">
            {timeline.map((item, index) => (
              <div className={index < 2 ? "done" : ""} key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="panel request-step-actions">
          <button className="secondary-button" disabled={activeStep === 0} onClick={() => changeStep(activeStep - 1)}>Back</button>
          <button className="primary-button" disabled={false} onClick={() => activeStep === requestSteps.length - 1 ? submitRequest() : changeStep(activeStep + 1)}>
            {activeStep === requestSteps.length - 1 ? (isAdminMode ? "Create Work Order" : "Submit Request") : `Next: ${requestSteps[Math.min(activeStep + 1, requestSteps.length - 1)]}`}
          </button>
        </div>
      </section>
    </div>
  );
}

function FileReviewIcon() {
  return <PackageCheck />;
}
