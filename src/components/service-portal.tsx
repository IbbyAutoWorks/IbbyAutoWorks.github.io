"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Camera, CheckCircle2, ClipboardCheck, CreditCard, FileCheck2, Map, Navigation, PackagePlus, Phone, ShieldCheck, Wrench } from "lucide-react";

import {
  addPrototypePartRequest,
  PrototypeInspectionItem,
  PrototypeServiceMeasurements,
  PrototypeWorkOrder,
  readPrototypeWorkOrders,
  updatePrototypeInspectionItem,
  updatePrototypePartQuote,
  updatePrototypeWorkOrder,
  updatePrototypeWorkOrderStatus,
  WORK_ORDERS_EVENT
} from "@/lib/local-store";
import { InspectionReferencePanel } from "@/components/inspection-reference";

// Technician workflow configuration: statuses, step loaders, and fixed inspection checklists.
const serviceStatuses: PrototypeWorkOrder["status"][] = ["Accepted", "Estimate Sent", "Scheduled", "En Route", "On Site", "In Progress", "Waiting Parts", "Complete"];
const acceptedJobStatuses: PrototypeWorkOrder["status"][] = ["Accepted", "Estimate Sent", "Scheduled"];
const walkaroundStates: Array<NonNullable<PrototypeInspectionItem["state"]>> = ["green", "yellow", "red"];
const serviceStepLoaders = ["clipboard", "burnout", "review", "review", "parts", "calendar", "lift", "review", "signature"] as const;
type ServiceCheckItem = { section: string; label: string; photo?: boolean };
const measurementSections: Array<{
  title: string;
  unit: string;
  fields: Array<[keyof PrototypeServiceMeasurements, string, string]>;
}> = [
  { title: "Tread depth", unit: "32nds", fields: [["lfTread", "LF", "6/32"], ["rfTread", "RF", "6/32"], ["lrTread", "LR", "6/32"], ["rrTread", "RR", "6/32"]] },
  { title: "Tire pressure", unit: "PSI", fields: [["lfPsi", "LF", "35"], ["rfPsi", "RF", "35"], ["lrPsi", "LR", "35"], ["rrPsi", "RR", "35"]] },
  { title: "Pad thickness", unit: "mm", fields: [["frontBrakePad", "Front", "8 mm"], ["rearBrakePad", "Rear", "7 mm"]] },
  { title: "Rotor thickness", unit: "mm", fields: [["frontRotorThickness", "Front", "28 mm"], ["rearRotorThickness", "Rear", "18 mm"]] }
];
const walkaroundChecks: ServiceCheckItem[] = [
  { section: "Body", label: "Existing scratches, dings, dents, rust, or paint damage", photo: true },
  { section: "Glass", label: "Windshield cracks, chips, mirrors, and window condition", photo: true },
  { section: "Dash", label: "Mileage recorded, dash warning lamps, and oil sticker", photo: true },
  { section: "Controls", label: "Service brake pedal feel and parking brake operation" },
  { section: "Controls", label: "Horn operation" },
  { section: "Controls", label: "Front and rear wipers and washers" },
  { section: "Lighting", label: "Headlights low and high beam" },
  { section: "Lighting", label: "Tail, brake, running, reverse, emergency, and marker lights" },
  { section: "Lighting", label: "Fog lights and auxiliary exterior lights" },
  { section: "Tires", label: "Tire size verified on all four wheels" },
  { section: "Tires", label: "Tread depth recorded on all four tires" },
  { section: "Tires", label: "Tire pressures recorded on all four tires" },
  { section: "Wheels", label: "Outer brake pad and rotor visible condition on all four corners", photo: true },
  { section: "Wheels", label: "Inner and outer brake pads and rotors noted on all four wheels", photo: true },
  { section: "Lift", label: "Jack points verified before lifting", photo: true }
];
const underHoodChecks: ServiceCheckItem[] = [
  { section: "Filters", label: "Engine air filter condition", photo: true },
  { section: "Filters", label: "Cabin air filter condition", photo: true },
  { section: "Fluids", label: "Engine oil level and condition" },
  { section: "Fluids", label: "Coolant level and condition" },
  { section: "Fluids", label: "Brake fluid level and condition" },
  { section: "Fluids", label: "Power steering fluid level and condition" },
  { section: "Fluids", label: "Washer fluid level" },
  { section: "Engine bay", label: "Belts, pulleys, and visible wear" },
  { section: "Engine bay", label: "Hoses, clamps, swelling, cracks, and routing" },
  { section: "Engine bay", label: "Battery, terminals, hold down, and visible wiring" },
  { section: "Engine bay", label: "Visible engine bay leaks or seepage", photo: true }
];
const liftedInspectionChecks: ServiceCheckItem[] = [
  { section: "Suspension", label: "Control arms and bushings" },
  { section: "Suspension", label: "Upper and lower ball joints" },
  { section: "Suspension", label: "Sway bar, links, bushings, and mounts" },
  { section: "Steering", label: "Inner and outer tie rods and steering linkage" },
  { section: "Steering", label: "Rack, boots, and visible steering leaks" },
  { section: "Brakes", label: "Inner brake pads and rotor condition on all four wheels", photo: true },
  { section: "Exhaust", label: "Exhaust pipes, hangers, flex sections, converter, and leaks" },
  { section: "Leaks", label: "Engine, transmission, transfer case, differential, coolant, and brake leaks", photo: true },
  { section: "Undercar", label: "Frame, rockers, floor, mounts, fuel/brake lines, and corrosion", photo: true },
  { section: "Driveline", label: "Axles, boots, driveshaft, U-joints, and wheel bearing play" }
];
const serviceWorkflowSteps = [
  { title: "Accept job", detail: "Select an admin-accepted work order that is ready to start." },
  { title: "Drive", detail: "Use the service address, map, route, call, and customer en-route notification." },
  { title: "Walkaround", detail: "Document exterior condition, controls, lights, tires, visible brakes, jack points, and under-hood checks." },
  { title: "Pre inspect", detail: "Lift if needed and inspect suspension, steering, exhaust, undercar leaks, and lower vehicle condition." },
  { title: "Parts", detail: "Verify approved parts or request additional parts for admin/customer approval." },
  { title: "Logistics", detail: "Wait for ordered parts, pick them up, or reschedule the work if needed." },
  { title: "Start job", detail: "Show job-specific quick reference before beginning the approved work." },
  { title: "Finish job", detail: "Review full vehicle specs and final checks before wrapping the job completely." },
  { title: "Billing", detail: "Provide the bill and record payment, PayPal, invoice, or payment-plan status." }
];

function serviceStepIndexForStatus(status: PrototypeWorkOrder["status"]) {
  if (status === "Requested" || status === "Parts Search") return 0;
  if (status === "Accepted" || status === "Estimate Sent" || status === "Scheduled") return 1;
  if (status === "En Route") return 2;
  if (status === "On Site") return 3;
  if (status === "Waiting Parts") return 5;
  if (status === "In Progress") return 6;
  if (status === "Complete") return 8;
  return 0;
}

export function ServicePortal() {
  // Job state: mirrors prototype work orders and tracks the selected technician workflow step.
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [partName, setPartName] = useState("");
  const [partReason, setPartReason] = useState("");
  const [techNote, setTechNote] = useState("");
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  useEffect(() => {
    function syncOrders() {
      const nextOrders = readPrototypeWorkOrders();
      setOrders(nextOrders);
      setSelectedOrderId((current) => current || nextOrders.find((order) => serviceStatuses.includes(order.status))?.id || nextOrders[0]?.id || "");
    }

    syncOrders();
    window.addEventListener(WORK_ORDERS_EVENT, syncOrders);
    window.addEventListener("storage", syncOrders);

    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, syncOrders);
      window.removeEventListener("storage", syncOrders);
    };
  }, []);

  const serviceOrders = useMemo(
    () => orders.filter((order) => serviceStatuses.includes(order.status) || order.status === "Requested" || order.status === "Parts Search"),
    [orders]
  );
  const acceptedJobs = useMemo(
    () => orders.filter((order) => acceptedJobStatuses.includes(order.status)),
    [orders]
  );
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? serviceOrders[0];
  const currentServiceStep = selectedOrder ? serviceStepIndexForStatus(selectedOrder.status) : 0;
  const walkaroundLabels = [...walkaroundChecks, ...underHoodChecks].map((item) => item.label);
  const walkaroundComplete = selectedOrder ? completionForLabels(selectedOrder, walkaroundLabels) : 0;
  const preInspectComplete = selectedOrder ? completionForLabels(selectedOrder, liftedInspectionChecks.map((item) => item.label)) : 0;

  useEffect(() => {
    setActiveWorkflowStep(currentServiceStep);
  }, [currentServiceStep, selectedOrder?.id]);

  function refresh(selectedId?: string) {
    const nextOrders = readPrototypeWorkOrders();
    setOrders(nextOrders);
    setSelectedOrderId(selectedId || selectedOrderId || nextOrders[0]?.id || "");
  }

  function triggerServiceLoader(stepIndex: number) {
    window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout", { detail: { variant: serviceStepLoaders[stepIndex] ?? "burnout" } }));
  }

  function goToStep(stepIndex: number) {
    const boundedStep = Math.max(0, Math.min(stepIndex, serviceWorkflowSteps.length - 1));
    triggerServiceLoader(boundedStep);
    setActiveWorkflowStep(boundedStep);
  }

  function setStatus(status: PrototypeWorkOrder["status"], nextStep?: number) {
    if (!selectedOrder) return;
    updatePrototypeWorkOrderStatus(selectedOrder.id, status);
    refresh(selectedOrder.id);
    if (typeof nextStep === "number") goToStep(nextStep);
  }

  function selectJob(orderId: string, nextStep = 1) {
    setSelectedOrderId(orderId);
    goToStep(nextStep);
  }

  function notifyEnRoute() {
    if (!selectedOrder) return;
    updatePrototypeWorkOrder(selectedOrder.id, {
      status: "En Route",
      risk: "Technician en route",
      customerContactLog: [
        ...(selectedOrder.customerContactLog ?? []),
        `${new Date().toLocaleString()}: Customer notified technician is on the way`
      ],
      techNotes: [
        `${new Date().toLocaleString()}: En-route notification queued for customer`,
        ...(selectedOrder.techNotes ?? [])
      ]
    });
    refresh(selectedOrder.id);
    goToStep(2);
  }

  function updateWalkaround(label: string, patch: Partial<PrototypeInspectionItem>) {
    if (!selectedOrder) return;
    updatePrototypeInspectionItem(selectedOrder.id, label, patch);
    refresh(selectedOrder.id);
  }

  function submitPartRequest() {
    if (!selectedOrder || !partName.trim()) return;
    addPrototypePartRequest(selectedOrder.id, partName.trim(), partReason.trim());
    setPartName("");
    setPartReason("");
    refresh(selectedOrder.id);
  }

  function choosePartSupplier(part: string, supplier: string) {
    if (!selectedOrder) return;
    updatePrototypePartQuote(selectedOrder.id, part, {
      selectedSupplier: supplier,
      supplier,
      pickupStatus: "Order required",
      status: "Confirmed"
    });
    refresh(selectedOrder.id);
  }

  function removePartSupplier(part: string) {
    if (!selectedOrder) return;
    updatePrototypePartQuote(selectedOrder.id, part, {
      selectedSupplier: "",
      pickupStatus: "Verify price",
      status: "Needs supplier check"
    });
    refresh(selectedOrder.id);
  }

  function addTechNote(prefix = "Tech note") {
    if (!selectedOrder || !techNote.trim()) return;
    updatePrototypeWorkOrder(selectedOrder.id, {
      techNotes: [`${new Date().toLocaleString()}: ${prefix}: ${techNote.trim()}`, ...(selectedOrder.techNotes ?? [])]
    });
    setTechNote("");
    refresh(selectedOrder.id);
  }

  function updateMeasurement(field: keyof PrototypeServiceMeasurements, value: string) {
    if (!selectedOrder) return;
    updatePrototypeWorkOrder(selectedOrder.id, {
      measurements: { ...selectedOrder.measurements, [field]: value }
    });
    refresh(selectedOrder.id);
  }

  function getInspectionItem(order: PrototypeWorkOrder, label: string, section: string): PrototypeInspectionItem {
    return order.inspection.find((item) => item.label === label) ?? { label, section, state: null, photoCaptured: false };
  }

  function completionForLabels(order: PrototypeWorkOrder, labels: string[]) {
    if (!labels.length) return 0;
    const completed = labels.filter((label) => {
      const item = order.inspection.find((inspectionItem) => inspectionItem.label === label);
      return Boolean(item?.state || item?.photoCaptured);
    }).length;
    return Math.round((completed / labels.length) * 100);
  }

  function renderJobSnapshot(order: PrototypeWorkOrder) {
    return (
      <div className="profile-grid compact-profile">
        <div><span>Customer</span><strong>{order.customer}</strong></div>
        <div><span>Phone</span><strong>{order.phone}</strong></div>
        <div><span>Services</span><strong>{(order.services?.length ? order.services : [order.service]).join(", ")}</strong></div>
        <div><span>Location</span><strong>{order.location}</strong></div>
      </div>
    );
  }

  function renderSpecSheet(order: PrototypeWorkOrder) {
    return (
      <div className="spec-sheet service-step-spec">
        <img src={order.vehicleSpec.image} alt={order.vehicle} />
        <div>
          <strong>{order.vehicleSpec.year} {order.vehicleSpec.make} {order.vehicleSpec.model}</strong>
          <span>{order.vehicleSpec.trim} - {order.vehicleSpec.bodyStyle}</span>
        </div>
        <div className="spec-grid">
          <div><span>Wheel torque</span><strong>{order.vehicleSpec.wheelTorque}</strong></div>
          <div><span>Tire pressure</span><strong>{order.vehicleSpec.tirePressure}</strong></div>
          <div><span>Engine oil</span><strong>{order.vehicleSpec.engineOil}</strong></div>
          <div><span>Coolant</span><strong>{order.vehicleSpec.coolant}</strong></div>
          <div><span>Brake fluid</span><strong>{order.vehicleSpec.brakeFluid}</strong></div>
          <div><span>Trans fluid</span><strong>{order.vehicleSpec.transmissionFluid}</strong></div>
          <div><span>Power steering</span><strong>{order.vehicleSpec.powerSteering}</strong></div>
          <div><span>Source</span><strong>{order.vehicleSpec.source}</strong></div>
        </div>
        <div className="spec-notes">
          {order.vehicleSpec.notes.map((note) => <span key={note}>{note}</span>)}
        </div>
      </div>
    );
  }

  function renderMeasurements(order: PrototypeWorkOrder) {
    return (
      <div className="measurement-grid">
        {measurementSections.map((section) => (
          <div className="measurement-section" key={section.title}>
            <div className="measurement-section-title">
              <strong>{section.title}</strong>
              <span>{section.unit}</span>
            </div>
            <div className="measurement-field-row">
              {section.fields.map(([field, label, placeholder]) => (
                <label key={field}>
                  <span>{label}</span>
                  <input value={order.measurements[field]} onChange={(event) => updateMeasurement(field, event.target.value)} placeholder={placeholder} />
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="measurement-section measurement-notes">
          <div className="measurement-section-title">
            <strong>Electrical and condition notes</strong>
            <span>Manual</span>
          </div>
          <div className="measurement-field-row notes-row">
            {([
              ["batteryVoltage", "Battery", "12.6 V"],
              ["leakNotes", "Leaks", "Enter finding"],
              ["rustNotes", "Rust/body", "Enter finding"]
            ] as Array<[keyof PrototypeServiceMeasurements, string, string]>).map(([field, label, placeholder]) => (
              <label key={field}>
                <span>{label}</span>
                <input value={order.measurements[field]} onChange={(event) => updateMeasurement(field, event.target.value)} placeholder={placeholder} />
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderChecklist(order: PrototypeWorkOrder, title: string, checks: ServiceCheckItem[], progressLabel?: string) {
    const progress = completionForLabels(order, checks.map((item) => item.label));
    return (
      <div className="service-checklist-card">
        <div className="panel-title">
          <div>
            <p className="section-label">{progressLabel ?? "Inspection checklist"}</p>
            <h2>{title}</h2>
          </div>
          <Camera />
        </div>
        <div className="inspection-progress">{title} documented: {progress}%</div>
        <div className="inspection-list service-checklist-list">
          {checks.map((check) => {
            const item = getInspectionItem(order, check.label, check.section);
            return (
            <div className="inspection-row" key={check.label}>
              <span>{item.section}</span>
              <strong>{item.label}</strong>
              <div className="condition-cells">
                {walkaroundStates.map((state) => (
                  <button
                    aria-label={`service ${item.label} ${state}`}
                    className={item.state === state ? `selected ${state}` : state}
                    key={state}
                    onClick={() => updateWalkaround(item.label, { state })}
                  />
                ))}
              </div>
              <button className={item.photoCaptured ? "camera-button captured" : "camera-button"} onClick={() => updateWalkaround(item.label, { photoCaptured: !item.photoCaptured })}>
                <Camera size={15} />
              </button>
            </div>
          )})}
        </div>
      </div>
    );
  }

  function renderParts(order: PrototypeWorkOrder) {
    return (
      <>
        <div className="service-parts-list">
          {order.parts.map((part) => (
            <div className="part-source-card tech" key={part.part}>
              <div className="part-image-placeholder">
                <span>Part image</span>
                <small>Match live</small>
              </div>
              <div>
                <strong>{part.part}</strong>
                <span>{part.selectedSupplier || "No distributor chosen"} - {part.pickupStatus}</span>
                <small>{part.status} - {part.price}</small>
                <div className="supplier-choice-strip compact">
                  {part.supplierCandidates.slice(0, 4).map((source) => {
                    const chosen = part.selectedSupplier === source.name;
                    return (
                      <div className={chosen ? "supplier-choice chosen" : "supplier-choice"} key={source.name}>
                        <a href={source.url} target="_blank" rel="noreferrer" title={source.fulfillment}>
                          {source.name}
                        </a>
                        <button onClick={() => choosePartSupplier(part.part, source.name)}>
                          {chosen ? "Chosen" : "Use"}
                        </button>
                        {chosen ? (
                          <button className="remove-choice" onClick={() => removePartSupplier(part.part)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <em className="parts-split-note">Use different distributors per part when stock is split.</em>
              </div>
            </div>
          ))}
        </div>
        <div className="part-request-box">
          <strong>Request additional part</strong>
          <input value={partName} onChange={(event) => setPartName(event.target.value)} placeholder="Part needed after inspection" />
          <textarea value={partReason} onChange={(event) => setPartReason(event.target.value)} placeholder="Why it is needed, what changed, or what failed visual inspection" />
          <button className="secondary-button" onClick={submitPartRequest}><PackagePlus size={15} /> Send request to admin</button>
        </div>
      </>
    );
  }

  function renderPartRequests(order: PrototypeWorkOrder) {
    return order.partRequests.length ? (
      <div className="part-request-list">
        {order.partRequests.map((request) => (
          <div className="part-request-row" key={request.id}>
            <AlertTriangle size={15} />
            <div>
              <strong>{request.part}</strong>
              <span>{request.reason}</span>
              <small>{request.status} - {request.waitTime} - {request.adminNote}</small>
            </div>
          </div>
        ))}
      </div>
    ) : <div className="empty-inline"><strong>No added parts requested</strong><span>Added parts requested from the technician will appear here after admin/customer approval.</span></div>;
  }

  function renderTechNotes(order: PrototypeWorkOrder, label: string) {
    return (
      <>
        <label className="wide-field">
          <span>{label}</span>
          <textarea value={techNote} onChange={(event) => setTechNote(event.target.value)} placeholder="Document what happened on site" />
        </label>
        <button className="secondary-button" onClick={() => addTechNote(label)}>Add note</button>
        <div className="part-request-list">
          {(order.techNotes ?? []).map((note) => <div className="part-request-row" key={note}><CheckCircle2 size={15} /><span>{note}</span></div>)}
        </div>
      </>
    );
  }

  function renderActiveStep(order: PrototypeWorkOrder) {
    if (activeWorkflowStep === 0) {
      return (
        <div className="service-step-page">
          <div className="service-accepted-list">
            {acceptedJobs.length ? acceptedJobs.map((acceptedOrder) => (
              <button
                className={acceptedOrder.id === selectedOrderId ? "service-accepted-card selected" : "service-accepted-card"}
                key={acceptedOrder.id}
                onClick={() => selectJob(acceptedOrder.id)}
              >
                <div className="order-id">#{acceptedOrder.id}</div>
                <div>
                  <strong>{acceptedOrder.customer}</strong>
                  <span>{acceptedOrder.vehicle}</span>
                  <small>{(acceptedOrder.services?.length ? acceptedOrder.services : [acceptedOrder.service]).join(", ")}</small>
                </div>
                <em>{acceptedOrder.due}</em>
              </button>
            )) : (
              <div className="empty-inline">
                <strong>No accepted jobs ready</strong>
                <span>When admin accepts a customer request, it will appear here for the technician to select.</span>
              </div>
            )}
          </div>
          <div className="estimate-note-card">
            <strong>Selected job estimate note</strong>
            <span>{order.estimateNotes}</span>
          </div>
        </div>
      );
    }

    if (activeWorkflowStep === 1) {
      return (
        <div className="service-step-page">
          {renderJobSnapshot(order)}
          <div className="route-card">
            <Navigation size={28} />
            <div><strong>{order.location}</strong><span>Use the customer-confirmed service location. Admin can adjust this if the customer changes the address.</span></div>
          </div>
          <iframe
            className="service-map-frame"
            title={`Map to ${order.location}`}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(order.location)}&output=embed`}
          />
          <div className="service-decision-grid">
            <a href={`tel:${order.phone}`}><Phone size={16} /> Call customer</a>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.location)}`} target="_blank" rel="noreferrer"><Map size={16} /> Open route</a>
            <button onClick={notifyEnRoute}>Notify customer on my way</button>
          </div>
        </div>
      );
    }

    if (activeWorkflowStep === 2) {
      return (
        <div className="service-step-page">
          {renderChecklist(order, "Exterior, controls, lighting, tires, and jack points", walkaroundChecks, "Vehicle walkaround")}
          {renderChecklist(order, "Under-hood checks before work starts", underHoodChecks, "Under hood")}
          {renderMeasurements(order)}
          <div className="request-step-actions service-step-nav">
            <button className="secondary-button" onClick={() => goToStep(1)}>Back</button>
            <button className="primary-button" onClick={() => setStatus("On Site", 3)}>Walkaround complete</button>
          </div>
        </div>
      );
    }

    if (activeWorkflowStep === 3) {
      return (
        <div className="service-step-page">
          <div className="inspection-progress">Lifted pre-inspection documented: {preInspectComplete}%</div>
          {renderChecklist(order, "Lifted under-vehicle inspection", liftedInspectionChecks, "Pre inspect")}
          <div className="inspection-reference-panel"><InspectionReferencePanel compact /></div>
        </div>
      );
    }

    if (activeWorkflowStep === 4) {
      return <div className="service-step-page">{renderParts(order)}</div>;
    }

    if (activeWorkflowStep === 5) {
      return (
        <div className="service-step-page">
          {renderPartRequests(order)}
          <div className="service-decision-grid">
            <button onClick={() => setStatus("Waiting Parts", 5)}><PackagePlus size={16} /> Waiting on parts</button>
            <button onClick={() => setStatus("Scheduled", 5)}><CalendarClock size={16} /> Reschedule job</button>
            <button onClick={() => setStatus("On Site", 6)}><CheckCircle2 size={16} /> Parts picked up</button>
          </div>
        </div>
      );
    }

    if (activeWorkflowStep === 6) {
      return (
        <div className="service-step-page">
          <div className="service-readiness-grid">
            <div><ShieldCheck size={18} /><strong>Scope accepted</strong><span>{order.status}</span></div>
            <div><Camera size={18} /><strong>Walkaround</strong><span>{walkaroundComplete}% documented</span></div>
            <div><PackagePlus size={18} /><strong>Parts</strong><span>{order.parts.length} listed / {order.partRequests.length} requested</span></div>
          </div>
          {renderSpecSheet(order)}
          {renderTechNotes(order, "Start-job note")}
          <button className="primary-button" onClick={() => setStatus("In Progress", 7)}><Wrench size={16} /> Start job</button>
        </div>
      );
    }

    if (activeWorkflowStep === 7) {
      return (
        <div className="service-step-page">
          <div className="service-readiness-grid">
            <div><CheckCircle2 size={18} /><strong>Final safety check</strong><span>Torque, fluids, lights, leaks, road-ready condition.</span></div>
            <div><CalendarClock size={18} /><strong>Reminders</strong><span>30 mile wheel re-torque when tires/wheels removed. 5,000 mile oil/rotate baseline.</span></div>
            <div><FileCheck2 size={18} /><strong>Report</strong><span>Photos, notes, parts, and measurements tied to work order.</span></div>
          </div>
          {renderSpecSheet(order)}
          {renderMeasurements(order)}
          {renderTechNotes(order, "Finish-job note")}
          <button className="primary-button" onClick={() => setStatus("Complete", 8)}><CheckCircle2 size={16} /> Finish job</button>
        </div>
      );
    }

    return (
      <div className="service-step-page">
        <div className="service-readiness-grid">
          <div><CreditCard size={18} /><strong>Payment</strong><span>PayPal, card, cash, invoice, or payment plan.</span></div>
          <div><FileCheck2 size={18} /><strong>Bill</strong><span>Provide final bill and work report to customer account.</span></div>
          <div><CalendarClock size={18} /><strong>Next appointment</strong><span>Set follow-up reminder or appointment window if needed.</span></div>
        </div>
        {renderTechNotes(order, "Billing/payment note")}
        <button className="primary-button" onClick={() => setStatus("Complete", 8)}><CreditCard size={16} /> Payment handled</button>
      </div>
    );
  }

  return (
    <div className="service-portal">
      {/* Technician header: page purpose and quick route action for the selected job. */}
      <section className="admin-header">
        <div>
          <p className="section-label">Technician workspace</p>
          <h1>Work one job step at a time, document the vehicle, and send parts issues back to admin.</h1>
        </div>
        <div className="admin-actions">
          {selectedOrder ? <a className="primary-button" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedOrder.location)}`} target="_blank" rel="noreferrer"><Map size={16} /> Route</a> : null}
        </div>
      </section>

      {/* Service wizard grid: assigned job list on the left, step-by-step work area on the right. */}
      <section className="service-grid service-wizard-grid">
        <div className="panel service-order-list">
          <div className="panel-title">
            <div>
              <p className="section-label">Assigned jobs</p>
              <h2>Service queue</h2>
            </div>
            <ClipboardCheck />
          </div>
          {serviceOrders.length === 0 ? (
            <div className="empty-inline">
              <strong>No service jobs yet</strong>
              <span>Admin accepted jobs will appear here for the technician.</span>
            </div>
          ) : serviceOrders.map((order) => (
            <button className={order.id === selectedOrder?.id ? "work-row selected" : "work-row"} key={order.id} onClick={() => setSelectedOrderId(order.id)}>
              <div className="order-id">#{order.id}</div>
              <div>
                <strong>{order.customer}</strong>
                <span>{order.vehicle}</span>
              </div>
              <span className="status progress">{order.status}</span>
              <span>{order.due}</span>
              <small>{order.risk}</small>
            </button>
          ))}
        </div>

        <div className="panel service-wizard-panel">
          {selectedOrder ? (
            <>
              {/* Current job header: selected vehicle and workflow progress tabs. */}
              <div className="service-wizard-header">
                <div>
                  <p className="section-label">Current job</p>
                  <h2>{selectedOrder.vehicle}</h2>
                </div>
                <Wrench />
              </div>
              <div className="request-step-tabs service-wizard-tabs">
                {serviceWorkflowSteps.map((step, index) => (
                  <button
                    className={index === activeWorkflowStep ? "selected" : index <= currentServiceStep ? "complete" : ""}
                    disabled={index > Math.max(currentServiceStep + 1, activeWorkflowStep + 1)}
                    key={step.title}
                    onClick={() => goToStep(index)}
                  >
                    <span>{index + 1}</span>
                    {step.title}
                  </button>
                ))}
              </div>
              <div className="service-wizard-step-head">
                <p className="section-label">Step {activeWorkflowStep + 1} of {serviceWorkflowSteps.length}</p>
                <h2>{serviceWorkflowSteps[activeWorkflowStep].title}</h2>
                <span>{serviceWorkflowSteps[activeWorkflowStep].detail}</span>
              </div>
              {/* Active service step: renders the task-specific controls for the chosen workflow stage. */}
              {renderActiveStep(selectedOrder)}
              <div className="request-step-actions service-step-nav">
                <button className="secondary-button" onClick={() => goToStep(activeWorkflowStep - 1)} disabled={activeWorkflowStep === 0}>Back</button>
                <button className="primary-button" onClick={() => goToStep(activeWorkflowStep + 1)} disabled={activeWorkflowStep === serviceWorkflowSteps.length - 1}>Next step</button>
              </div>
            </>
          ) : (
            <div className="empty-inline">
              <strong>No job selected</strong>
              <span>Select a service job to begin.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
