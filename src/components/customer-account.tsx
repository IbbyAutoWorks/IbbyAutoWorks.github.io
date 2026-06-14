"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Car, Download, FileText, Plus, ShieldCheck } from "lucide-react";

import { agreementSummaries, partsReturnOptions } from "@/lib/agreements";
import { timeline } from "@/lib/data";
import { AuthPanel } from "@/components/auth-panel";
import { CUSTOMER_RECORDS_EVENT, customerRecordIdFromContact, getServiceReminders, PrototypeCustomerRecord, PrototypeWorkOrder, readPrototypeCustomerRecords, readPrototypeWorkOrders, WORK_ORDERS_EVENT } from "@/lib/local-store";

export function CustomerAccount() {
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [customers, setCustomers] = useState<PrototypeCustomerRecord[]>([]);

  useEffect(() => {
    function syncOrders() {
      const nextOrders = readPrototypeWorkOrders();
      setOrders(nextOrders);
      setSelectedOrderId((current) => current || nextOrders[0]?.id || "");
    }

    syncOrders();
    window.addEventListener(WORK_ORDERS_EVENT, syncOrders);
    window.addEventListener(CUSTOMER_RECORDS_EVENT, syncOrders);
    window.addEventListener("storage", syncOrders);

    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, syncOrders);
      window.removeEventListener(CUSTOMER_RECORDS_EVENT, syncOrders);
      window.removeEventListener("storage", syncOrders);
    };
  }, []);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0];
  const selectedCustomer = selectedOrder
    ? customers.find((customer) => customer.id === customerRecordIdFromContact(selectedOrder.email, selectedOrder.phone, selectedOrder.customer))
    : customers[0];

  useEffect(() => {
    setCustomers(readPrototypeCustomerRecords());
  }, [orders]);

  const uniqueVehicles = useMemo(() => {
    const byVehicle = new Map<string, PrototypeWorkOrder>();
    orders.forEach((order) => {
      if (!byVehicle.has(order.vehicle)) {
        byVehicle.set(order.vehicle, order);
      }
    });
    return Array.from(byVehicle.values());
  }, [orders]);

  function downloadWorkOrderReport(order: PrototypeWorkOrder) {
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const safeId = order.id.replace(/[^a-z0-9-]/gi, "");
    const reportHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ibby Auto Works™ work order ${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111418; margin: 32px; }
    h1 { margin-bottom: 4px; }
    h2 { margin-top: 28px; border-bottom: 2px solid #b7192a; padding-bottom: 6px; }
    .muted { color: #66717d; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { border: 1px solid #d9dde2; padding: 12px; border-radius: 6px; }
    strong { display: block; margin-bottom: 3px; }
    @media print { body { margin: 18mm; } }
  </style>
</head>
<body>
  <h1>Ibby Auto Works™ Work Order #${escapeHtml(order.id)}</h1>
  <p class="muted">Generated ${new Date().toLocaleString()}</p>
  <h2>Customer</h2>
  <div class="grid">
    <div class="box"><strong>Name</strong>${escapeHtml(order.customer)}</div>
    <div class="box"><strong>Phone</strong>${escapeHtml(order.phone)}</div>
    <div class="box"><strong>Email</strong>${escapeHtml(order.email)}</div>
    <div class="box"><strong>Service address</strong>${escapeHtml(order.location)}</div>
  </div>
  <h2>Vehicle</h2>
  <div class="grid">
    <div class="box"><strong>Vehicle</strong>${escapeHtml(order.vehicle)}</div>
    <div class="box"><strong>VIN</strong>${escapeHtml(order.vin)}</div>
    <div class="box"><strong>Plate</strong>${escapeHtml(order.plate)}</div>
    <div class="box"><strong>Mileage</strong>${escapeHtml(order.mileage)}</div>
  </div>
  <h2>Work</h2>
  <div class="grid">
    <div class="box"><strong>Service</strong>${escapeHtml(order.service)}</div>
    <div class="box"><strong>Estimate</strong>${escapeHtml(order.estimate)}</div>
    <div class="box"><strong>Status</strong>${escapeHtml(order.status)}</div>
    <div class="box"><strong>Preferred window</strong>${escapeHtml(order.preferredWindow)}</div>
  </div>
  <h2>Customer Notes</h2>
  <p>${escapeHtml(order.symptoms)}</p>
  <h2>Authorizations</h2>
  <div class="grid">
    ${agreementSummaries.map((agreement) => `<div class="box"><strong>${escapeHtml(agreement.title)}</strong>${order.agreementAcceptance.accepted[agreement.id] ? "Accepted" : "Pending"}<br><span class="muted">Source: ${escapeHtml(agreement.source)}</span></div>`).join("")}
    <div class="box"><strong>Parts return choice</strong>${escapeHtml(partsReturnOptions.find((option) => option.value === order.agreementAcceptance.partsReturnPreference)?.label ?? "Not selected")}</div>
    <div class="box"><strong>Accepted by</strong>${escapeHtml(order.agreementAcceptance.acceptedBy || "Pending")}<br><span class="muted">${escapeHtml(order.agreementAcceptance.acceptedAt || "No timestamp")}</span></div>
  </div>
</body>
</html>`;
    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ibby-auto-works-work-order-${safeId}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="account-page">
      <AuthPanel />

      <section className="account-header">
        {selectedCustomer?.profileImage ? <img className="profile-image-preview account-profile-image" src={selectedCustomer.profileImage} alt={`${selectedCustomer.name} profile`} /> : null}
        <div>
          <p className="section-label">Customer account</p>
          <h1>Vehicles, work orders, reports, reminders, and payment links in one customer record.</h1>
        </div>
        <Link href="/request" className="primary-button"><Car size={16} /> Add request</Link>
      </section>

      {orders.length === 0 ? (
        <section className="panel empty-state-panel">
          <Car size={28} />
          <h2>No customer records yet</h2>
          <p>Submit a one-time service request or save account details in customer settings. Vehicles, work orders, notification choices, and reports will appear from the same prototype store the admin dashboard reads.</p>
          <div className="hero-actions">
            <Link href="/request" className="primary-button">Create first request</Link>
            <Link href="/account/settings" className="secondary-button"><Plus size={15} /> Customer settings</Link>
          </div>
        </section>
      ) : (
        <section className="account-grid">
          <div className="panel vehicle-selector">
            <div className="panel-title">
              <h2>Saved vehicles</h2>
              <Car />
            </div>
            {uniqueVehicles.map((order) => (
              <button className={order.id === selectedOrder?.id ? "selected" : ""} key={order.id} onClick={() => setSelectedOrderId(order.id)}>
                <strong>{order.vehicle}</strong>
                <span>{order.plate} - {order.mileage} miles</span>
              </button>
            ))}
          </div>

          <div className="panel vehicle-profile">
            <div className="panel-title">
              <h2>{selectedOrder.vehicle}</h2>
              <ShieldCheck />
            </div>
            {selectedCustomer?.profileImage ? <img className="profile-image-preview" src={selectedCustomer.profileImage} alt={`${selectedCustomer.name} profile`} /> : null}
            {selectedOrder.vehicleImage ? <img className="vehicle-account-image" src={selectedOrder.vehicleImage} alt={`${selectedOrder.vehicle} vehicle`} /> : null}
            <div className="profile-grid">
              <div><span>VIN</span><strong>{selectedOrder.vin}</strong></div>
              <div><span>Plate</span><strong>{selectedOrder.plate}</strong></div>
              <div><span>Mileage</span><strong>{selectedOrder.mileage}</strong></div>
              <div><span>Status</span><strong>{selectedOrder.status}</strong></div>
            </div>
            <div className="next-service-card">
              <CalendarClock size={18} />
              <span>{selectedOrder.preferredWindow} - {selectedOrder.service} - {selectedOrder.estimate}</span>
            </div>
          </div>

          <div className="panel reports-panel">
            <div className="panel-title">
              <h2>Reports and PDFs</h2>
              <FileText />
            </div>
            {orders.map((order) => (
              <div className="report-row" key={order.id}>
                <div>
                  <strong>Work order #{order.id}</strong>
                  <span>{order.vehicle} - {order.service}</span>
                  {getServiceReminders(order).map((reminder) => <small key={reminder}>{reminder}</small>)}
                </div>
                <em>{order.status === "Complete" ? "PDF ready" : order.status}</em>
                <button className="camera-button" aria-label={`Download report ${order.id}`} onClick={() => downloadWorkOrderReport(order)}>
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-title">
              <h2>Current work-order path</h2>
              <CalendarClock />
            </div>
            <div className="timeline compact">
              {timeline.map((item, index) => {
                const doneIndex = selectedOrder.status === "Requested" ? 1 : selectedOrder.status === "Scheduled" ? 3 : selectedOrder.status === "Complete" ? 6 : 4;
                return (
                  <div className={index < doneIndex ? "done" : ""} key={item}>
                    <ShieldCheck size={16} />
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
