"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, FileText, Gauge, Mail, Map, MapPin, Phone, Plus, RotateCcw, Settings2, Wrench } from "lucide-react";

import { agreementSummaries, partsReturnOptions } from "@/lib/agreements";
import { activity } from "@/lib/data";
import { partsIntegrationNotes } from "@/lib/parts";
import { InspectionReferencePanel } from "@/components/inspection-reference";
import { OpsStatusPanel } from "@/components/ops-status-panel";
import { AdminPrayerReminder } from "@/components/marketing-widgets";
import {
  CUSTOMER_RECORDS_EVENT,
  clearPrototypeWorkOrders,
  getCustomerOrders,
  getServiceReminders,
  PrototypePartQuote,
  PrototypeCustomerRecord,
  PrototypeWorkOrder,
  readPrototypeCustomerRecords,
  readPrototypeWorkOrders,
  savePrototypeCustomerRecord,
  updatePrototypePartQuote,
  updatePrototypePartRequest,
  updatePrototypeWorkOrderStatus,
  WORK_ORDERS_EVENT
} from "@/lib/local-store";

const statusClass: Record<string, string> = {
  Requested: "status requested",
  Scheduled: "status scheduled",
  Accepted: "status scheduled",
  "Parts Search": "status waiting",
  "Estimate Sent": "status waiting",
  "En Route": "status progress",
  "On Site": "status progress",
  "In Progress": "status progress",
  "Waiting Parts": "status waiting",
  Complete: "status complete"
};

const statusFilters = ["All", "Requested", "Parts Search", "Accepted", "Estimate Sent", "Scheduled", "En Route", "On Site", "In Progress", "Waiting Parts", "Complete"];
export function AdminDashboard() {
  // Admin state: filters, selected records, mirrored customer requests, and editable customer drafts.
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [customerOrders, setCustomerOrders] = useState<PrototypeWorkOrder[]>([]);
  const [customers, setCustomers] = useState<PrototypeCustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDraft, setCustomerDraft] = useState<PrototypeCustomerRecord | null>(null);

  useEffect(() => {
    function syncCustomerOrders() {
      const nextOrders = readPrototypeWorkOrders();
      setCustomerOrders(nextOrders);
      setSelectedOrderId((current) => current || nextOrders[0]?.id || "");
    }

    syncCustomerOrders();
    window.addEventListener(WORK_ORDERS_EVENT, syncCustomerOrders);
    window.addEventListener("storage", syncCustomerOrders);

    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, syncCustomerOrders);
      window.removeEventListener("storage", syncCustomerOrders);
    };
  }, []);

  useEffect(() => {
    function syncCustomers() {
      const nextCustomers = readPrototypeCustomerRecords();
      setCustomers(nextCustomers);
      setSelectedCustomerId((current) => current || nextCustomers[0]?.id || "");
    }

    syncCustomers();
    window.addEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
    window.addEventListener(WORK_ORDERS_EVENT, syncCustomers);
    window.addEventListener("storage", syncCustomers);
    return () => {
      window.removeEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
      window.removeEventListener(WORK_ORDERS_EVENT, syncCustomers);
      window.removeEventListener("storage", syncCustomers);
    };
  }, []);

  const allWorkOrders = customerOrders;

  const dashboardMetrics = useMemo(() => {
    const openOrders = allWorkOrders.filter((order) => order.status !== "Complete");
    const scheduled = allWorkOrders.filter((order) => order.status === "Scheduled");
    const revenue = allWorkOrders.reduce((sum, order) => sum + Number.parseInt(order.estimate.replace(/[$+]/g, ""), 10), 0);
    const completed = allWorkOrders.filter((order) => order.status === "Complete").length;
    const progress = allWorkOrders.length > 0 ? Math.round((completed / allWorkOrders.length) * 100) : 0;

    return [
      { label: "Open work orders", value: String(openOrders.length), trend: allWorkOrders.length ? `${allWorkOrders.length} total` : "submit a test request" },
      { label: "Scheduled revenue", value: `$${revenue.toLocaleString()}`, trend: scheduled.length ? `${scheduled.length} scheduled` : "no estimates yet" },
      { label: "Parts pending", value: String(allWorkOrders.filter((order) => order.status === "Waiting Parts").length), trend: "from active jobs" },
      { label: "Inspection progress", value: `${progress}%`, trend: completed ? `${completed} complete` : "no reports complete" }
    ];
  }, [allWorkOrders]);

  const visibleOrders = useMemo(
    () => allWorkOrders.filter((order) => statusFilter === "All" || order.status === statusFilter),
    [allWorkOrders, statusFilter]
  );

  const selectedOrder = allWorkOrders.find((order) => order.id === selectedOrderId) ?? allWorkOrders[0];
  const selectedParts = selectedOrder?.parts ?? [];
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const selectedCustomerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer, allWorkOrders) : [];
  const nextAppointments = selectedCustomerOrders.filter((order) => ["Requested", "Parts Search", "Accepted", "Estimate Sent", "Scheduled", "En Route"].includes(order.status));

  useEffect(() => {
    setCustomerDraft(selectedCustomer ? { ...selectedCustomer } : null);
  }, [selectedCustomer?.id]);

  function changeSelectedStatus(status: PrototypeWorkOrder["status"]) {
    if (!selectedOrder) {
      return;
    }

    updatePrototypeWorkOrderStatus(selectedOrder.id, status);
    setCustomerOrders(readPrototypeWorkOrders());
  }

  function refreshOrders(selectedId?: string) {
    const nextOrders = readPrototypeWorkOrders();
    setCustomerOrders(nextOrders);
    setSelectedOrderId(selectedId || selectedOrderId || nextOrders[0]?.id || "");
  }

  function updatePart(part: string, patch: Partial<PrototypePartQuote>) {
    if (!selectedOrder) {
      return;
    }
    updatePrototypePartQuote(selectedOrder.id, part, patch);
    refreshOrders(selectedOrder.id);
  }

  function updatePartRequest(requestId: string, status: "Denied" | "Approved" | "Ordered" | "Ready for pickup" | "Delivered", waitTime: string) {
    if (!selectedOrder) {
      return;
    }

    updatePrototypePartRequest(selectedOrder.id, requestId, {
      status,
      waitTime,
      adminNote: status === "Denied" ? "Denied after customer/admin review" : "Approved by admin/customer call"
    });
    refreshOrders(selectedOrder.id);
  }

  function saveCustomerDraft() {
    if (!customerDraft) return;
    savePrototypeCustomerRecord(customerDraft);
    setCustomers(readPrototypeCustomerRecords());
    setCustomerOrders(readPrototypeWorkOrders());
  }

  return (
    <div className="admin-dashboard">
      <AdminPrayerReminder />
      {/* Admin header: dashboard purpose plus shortcuts for settings and new work orders. */}
      <section className="admin-header">
        <div>
          <p className="section-label">Operations command center</p>
          <h1>Admin dashboard for jobs, inspections, parts, messages, routing, and editable shop settings.</h1>
        </div>
        <div className="admin-actions">
          <Link className="secondary-button" href="/admin/settings"><Settings2 size={16} /> Edit app settings</Link>
          <Link className="primary-button" href="/admin/new"><Plus size={16} /> New work order</Link>
        </div>
      </section>

      {/* Metrics: high-level operational counters shown across the top of the dashboard. */}
      <section className="metric-grid">
        {dashboardMetrics.map((metric, index) => {
          const Icon = [Gauge, CalendarDays, Wrench, FileText][index];
          return (
            <article className="metric-card" key={metric.label}>
              <Icon size={21} />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.trend}</small>
            </article>
          );
        })}
      </section>

      <OpsStatusPanel />

      {/* Dashboard grid: live work orders, selected job details, parts, messages, and customer records. */}
      <section className="dashboard-grid">
        <div className="panel work-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Live board</p>
              <h2>Work orders</h2>
            </div>
            <Gauge />
          </div>
          {customerOrders.length > 0 ? (
            <div className="mirror-banner">
              <div>
                <strong>{customerOrders.length} customer-submitted request{customerOrders.length === 1 ? "" : "s"}</strong>
                <span>Loaded from the customer portal prototype store.</span>
              </div>
              <button onClick={() => { clearPrototypeWorkOrders(); setCustomerOrders([]); setSelectedOrderId(""); }}><RotateCcw size={14} /> Clear demo requests</button>
            </div>
          ) : null}
          <div className="filter-strip">
            {statusFilters.map((filter) => (
              <button className={filter === statusFilter ? "selected" : ""} key={filter} onClick={() => setStatusFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>
          <div className="work-list">
            {visibleOrders.length === 0 ? (
              <div className="empty-inline">
                <strong>No work orders yet</strong>
                <span>Submit a customer request to populate this admin board.</span>
              </div>
            ) : visibleOrders.map((order) => (
              <button className={order.id === selectedOrderId ? "work-row selected" : "work-row"} key={order.id} onClick={() => setSelectedOrderId(order.id)}>
                <div className="order-id">#{order.id}</div>
                <div>
                  <strong>{order.customer}</strong>
                  <span>{order.vehicle}</span>
                </div>
                <span className={statusClass[order.status]}>{order.status}</span>
                <span>{order.due}</span>
                <small>{order.risk}</small>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </div>

        <div className="panel selected-order-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Selected job</p>
              <h2>{selectedOrder ? `#${selectedOrder.id}` : "No job selected"}</h2>
            </div>
            <FileText />
          </div>
          {selectedOrder ? (
            <div className="selected-order-card">
              <strong>{selectedOrder.customer}</strong>
              <span>{selectedOrder.vehicle}</span>
              <div className="profile-grid compact-profile">
                <div><span>Services</span><strong>{(selectedOrder.services?.length ? selectedOrder.services : [selectedOrder.service]).join(", ")}</strong></div>
                <div><span>Estimate</span><strong>{selectedOrder.estimate}</strong></div>
                <div><span>Due</span><strong>{selectedOrder.due}</strong></div>
                <div><span>Status</span><strong>{selectedOrder.status}</strong></div>
                <div><span>Inspection expires</span><strong>{selectedOrder.inspectionExpires || "Not entered"}</strong></div>
                <div><span>Registration expires</span><strong>{selectedOrder.registrationExpires || "Not entered"}</strong></div>
                <div><span>Notify</span><strong>{selectedOrder.customerPreferences.notifications ? "Allowed" : "Not allowed"}</strong></div>
                <div><span>Location</span><strong>{selectedOrder.customerPreferences.location ? "Allowed" : "Manual address"}</strong></div>
                <div><span>Login</span><strong>{selectedOrder.customerPreferences.rememberLogin ? "Remember requested" : "Standard"}</strong></div>
                <div><span>Request type</span><strong>{selectedOrder.customerPreferences.oneTimeRequest ? "One-time" : "Account follow-up"}</strong></div>
              </div>
              <div className="status-action-grid">
                {(["Parts Search", "Accepted", "Estimate Sent", "Scheduled", "En Route", "On Site", "In Progress", "Waiting Parts", "Complete"] as const).map((status) => (
                  <button className={selectedOrder.status === status ? "selected" : ""} key={status} onClick={() => changeSelectedStatus(status)}>
                    {status}
                  </button>
                ))}
              </div>
              <div className="job-action-strip">
                <a href={`tel:${selectedOrder.phone}`}><Phone size={15} /> Call customer</a>
                <a href={`mailto:${selectedOrder.email}?subject=${encodeURIComponent(`Ibby Auto Works™ update for work order ${selectedOrder.id}`)}&body=${encodeURIComponent(`Hi ${selectedOrder.customer}, I am updating your work request for ${selectedOrder.vehicle}.`)}`}><Mail size={15} /> Email update</a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.location)}`} target="_blank" rel="noreferrer"><Map size={15} /> Map location</a>
              </div>
              <div className="next-service-card">
                <MapPin size={18} />
                <span>{selectedOrder.location}</span>
              </div>
              <div className="estimate-note-card">
                <strong>Estimate note</strong>
                <span>{selectedOrder.estimateNotes || "Initial request estimate only. Confirm price changes before starting work."}</span>
              </div>
              <div className="authorization-summary">
                <div>
                  <strong>Authorization status</strong>
                  <span>
                    {agreementSummaries.filter((agreement) => selectedOrder.agreementAcceptance.accepted[agreement.id]).length}
                    /{agreementSummaries.length} required accepted
                  </span>
                </div>
                <small>
                  Parts return: {partsReturnOptions.find((option) => option.value === selectedOrder.agreementAcceptance.partsReturnPreference)?.label}
                </small>
                <small>
                  Accepted by: {selectedOrder.agreementAcceptance.acceptedBy || "Pending"} {selectedOrder.agreementAcceptance.acceptedAt ? `on ${new Date(selectedOrder.agreementAcceptance.acceptedAt).toLocaleString()}` : ""}
                </small>
              </div>
            </div>
          ) : (
            <div className="empty-inline">
              <strong>No active customer request</strong>
              <span>The selected-job panel fills in after the customer portal creates a work order.</span>
            </div>
          )}
        </div>

        <div className="panel schedule-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Route day</p>
              <h2>Schedule strip</h2>
            </div>
            <CalendarDays />
          </div>
          {allWorkOrders.length === 0 ? (
            <div className="empty-inline">
              <strong>No appointments yet</strong>
              <span>Scheduled customer requests will populate this route strip.</span>
            </div>
          ) : allWorkOrders.map((order) => (
            <div className="schedule-row" key={`${order.id}-${order.due}`}>
              <strong>{order.due}</strong>
              <span>{order.customer} - {order.service}</span>
              <em>{order.status}</em>
            </div>
          ))}
        </div>

        <div className="panel admin-customer-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Customer lookup</p>
              <h2>History, profile, reminders</h2>
            </div>
            <Phone />
          </div>
          {customers.length === 0 ? (
            <div className="empty-inline">
              <strong>No saved customers yet</strong>
              <span>Submitted requests and admin intake work orders create customer records automatically.</span>
            </div>
          ) : (
            <>
              <label className="wide-field">
                <span>Customer</span>
                <select value={selectedCustomer?.id ?? ""} onChange={(event) => setSelectedCustomerId(event.target.value)}>
                  {customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name} - {customer.phone || customer.email}</option>)}
                </select>
              </label>
              {customerDraft ? (
                <div className="customer-edit-grid">
                  <label><span>Name</span><input value={customerDraft.name} onChange={(event) => setCustomerDraft({ ...customerDraft, name: event.target.value })} /></label>
                  <label><span>Phone</span><input value={customerDraft.phone} onChange={(event) => setCustomerDraft({ ...customerDraft, phone: event.target.value })} /></label>
                  <label><span>Email</span><input value={customerDraft.email} onChange={(event) => setCustomerDraft({ ...customerDraft, email: event.target.value })} /></label>
                  <label><span>Address</span><input value={customerDraft.address} onChange={(event) => setCustomerDraft({ ...customerDraft, address: event.target.value })} /></label>
                  <label><span>Profile image URL</span><input value={customerDraft.profileImage} onChange={(event) => setCustomerDraft({ ...customerDraft, profileImage: event.target.value })} /></label>
                  <label><span>Review</span><input value={customerDraft.review} onChange={(event) => setCustomerDraft({ ...customerDraft, review: event.target.value })} /></label>
                  <button className="secondary-button" onClick={saveCustomerDraft}>Save customer updates</button>
                </div>
              ) : null}
              <div className="customer-history-list">
                <strong>Full history</strong>
                {selectedCustomerOrders.map((order) => (
                  <div className="history-row" key={order.id}>
                    <div>
                      <strong>{new Date(order.createdAt).toLocaleString()} - #{order.id}</strong>
                      <span>{order.vehicle} - {order.service} - {order.status}</span>
                      {getServiceReminders(order).map((reminder) => <small key={reminder}>{reminder}</small>)}
                    </div>
                    <button onClick={() => setSelectedOrderId(order.id)}>Open</button>
                  </div>
                ))}
              </div>
              <div className="customer-history-list">
                <strong>Future appointments</strong>
                {nextAppointments.length ? nextAppointments.map((order) => (
                  <div className="history-row" key={`${order.id}-next`}>
                    <span>{order.due} - {order.vehicle} - {order.status}</span>
                  </div>
                )) : <span>No future appointments on record.</span>}
              </div>
            </>
          )}
        </div>

        <div className="panel parts-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Supplier queue</p>
              <h2>Parts and price checks</h2>
            </div>
            <CalendarDays />
          </div>
          {!selectedOrder ? (
            <div className="empty-inline">
              <strong>No parts checks yet</strong>
              <span>Select or create a work order to generate service-based parts.</span>
            </div>
          ) : (
            <>
              <div className="parts-source-notes">
                {partsIntegrationNotes.map((note) => (
                  <div key={note.title}>
                    <strong>{note.title}</strong>
                    <span>{note.detail}</span>
                  </div>
                ))}
              </div>
              {selectedParts.map((part) => (
                <div className="part-source-card" key={part.part}>
                  <div className="part-image-placeholder">
                    <span>Supplier image</span>
                    <small>Verify live</small>
                  </div>
                  <div>
                    <strong>{part.part}</strong>
                    <span>{part.selectedSupplier || "No distributor chosen"} - {part.band} cost - {part.pickupStatus}</span>
                    <small>Listed estimate: {part.price}. Confirm current image, fitment, price, and availability before ordering.</small>
                    <div className="supplier-choice-strip">
                      {part.supplierCandidates.map((source) => {
                        const chosen = part.selectedSupplier === source.name;
                        return (
                          <div className={chosen ? "supplier-choice chosen" : "supplier-choice"} key={source.name}>
                            <a href={source.url} target="_blank" rel="noreferrer" title={source.imageNote}>
                              {source.name}
                            </a>
                            <button onClick={() => updatePart(part.part, { selectedSupplier: source.name, supplier: source.name, pickupStatus: "Order required", status: "Confirmed" })}>
                              {chosen ? "Chosen" : "Use"}
                            </button>
                            {chosen ? (
                              <button className="remove-choice" onClick={() => updatePart(part.part, { selectedSupplier: "", pickupStatus: "Verify price", status: "Needs supplier check" })}>
                                Remove
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <em className="parts-split-note">Each part can use a different distributor; choose or remove suppliers independently.</em>
                  </div>
                  <button className="part-status-button" onClick={() => updatePart(part.part, { status: part.status === "Confirmed" ? "Needs supplier check" : "Confirmed", pickupStatus: part.pickupStatus === "Ready for pickup" ? "Picked up" : "Ready for pickup" })}>
                    {part.status}
                  </button>
                </div>
              ))}
            </>
          )}
          {selectedOrder?.partRequests.length ? (
            <div className="admin-part-requests">
              <strong>Tech-requested additional parts</strong>
              {selectedOrder.partRequests.map((request) => (
                <div className="part-request-row" key={request.id}>
                  <div>
                    <strong>{request.part}</strong>
                    <span>{request.reason}</span>
                    <small>{request.status} - {request.waitTime} - {request.adminNote}</small>
                  </div>
                  <div className="part-request-actions">
                    <button onClick={() => updatePartRequest(request.id, "Denied", "No order")}>Deny</button>
                    <button onClick={() => updatePartRequest(request.id, "Approved", "Call complete")}>Approve</button>
                    <button onClick={() => updatePartRequest(request.id, "Ordered", "30-60 min")}>Ordered</button>
                    <button onClick={() => updatePartRequest(request.id, "Ready for pickup", "Ready now")}>Pickup</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="panel inspection-reference-panel">
          <InspectionReferencePanel compact />
        </div>

        <div className="panel activity-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Automation</p>
              <h2>Email, PDFs, reminders</h2>
            </div>
            <Mail />
          </div>
          {activity.length === 0 ? (
            <div className="empty-inline">
              <strong>No automation events yet</strong>
              <span>Appointment emails, status changes, and PDF activity will appear here.</span>
            </div>
          ) : activity.map((item) => {
            const Icon = item.icon;
            return (
              <div className="activity-row" key={item.text}>
                <Icon size={17} />
                <span>{item.text}</span>
                <small>{item.time}</small>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
