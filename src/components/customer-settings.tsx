"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Car, ImagePlus, KeyRound, LocateFixed, Save, Star, UserRound } from "lucide-react";

import {
  CUSTOMER_RECORDS_EVENT,
  customerRecordIdFromContact,
  defaultCustomerPreferences,
  PrototypeCustomerPreferences,
  PrototypeCustomerRecord,
  PrototypeWorkOrder,
  readPrototypeCustomerRecords,
  readPrototypeWorkOrders,
  savePrototypeCustomerRecord,
  updatePrototypeWorkOrder,
  WORK_ORDERS_EVENT
} from "@/lib/local-store";

function blankCustomerRecord(): PrototypeCustomerRecord {
  return {
    id: "customer-profile",
    name: "",
    phone: "",
    email: "",
    address: "",
    profileImage: "",
    review: "",
    reviewRating: 5,
    updatedAt: new Date().toISOString()
  };
}

export function CustomerSettings() {
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [customers, setCustomers] = useState<PrototypeCustomerRecord[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDraft, setCustomerDraft] = useState<PrototypeCustomerRecord>(blankCustomerRecord);
  const [preferences, setPreferences] = useState<PrototypeCustomerPreferences>(defaultCustomerPreferences);

  useEffect(() => {
    function syncRecords() {
      const nextOrders = readPrototypeWorkOrders();
      const nextCustomers = readPrototypeCustomerRecords();
      setOrders(nextOrders);
      setCustomers(nextCustomers);
      setSelectedCustomerId((current) => current || nextCustomers[0]?.id || "");
    }

    syncRecords();
    window.addEventListener(WORK_ORDERS_EVENT, syncRecords);
    window.addEventListener(CUSTOMER_RECORDS_EVENT, syncRecords);
    window.addEventListener("storage", syncRecords);

    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, syncRecords);
      window.removeEventListener(CUSTOMER_RECORDS_EVENT, syncRecords);
      window.removeEventListener("storage", syncRecords);
    };
  }, []);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((order) => (
      order.email === selectedCustomer.email ||
      order.phone === selectedCustomer.phone ||
      customerRecordIdFromContact(order.email, order.phone, order.customer) === selectedCustomer.id
    ));
  }, [orders, selectedCustomer]);

  useEffect(() => {
    setCustomerDraft(selectedCustomer ? { ...selectedCustomer } : blankCustomerRecord());
    setPreferences(customerOrders[0]?.customerPreferences ?? defaultCustomerPreferences());
  }, [selectedCustomer?.id, customerOrders[0]?.id]);

  function chooseCustomer(customerId: string) {
    setSelectedCustomerId(customerId);
    const customer = customers.find((item) => item.id === customerId);
    if (customer) {
      setCustomerDraft({ ...customer });
    }
  }

  function handleProfileImageUpload(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomerDraft((current) => ({ ...current, profileImage: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  function handleVehicleImageUpload(orderId: string, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updatePrototypeWorkOrder(orderId, { vehicleImage: String(reader.result || "") });
      setOrders(readPrototypeWorkOrders());
    };
    reader.readAsDataURL(file);
  }

  function updatePreference(field: keyof PrototypeCustomerPreferences, checked: boolean) {
    setPreferences((current) => ({ ...current, [field]: checked }));
  }

  function saveCustomerSettings() {
    const normalizedRecord = {
      ...customerDraft,
      id: customerRecordIdFromContact(customerDraft.email, customerDraft.phone, customerDraft.name)
    };

    savePrototypeCustomerRecord(normalizedRecord);
    customerOrders.forEach((order) => {
      updatePrototypeWorkOrder(order.id, {
        customerPreferences: preferences,
        customer: normalizedRecord.name || order.customer,
        phone: normalizedRecord.phone || order.phone,
        email: normalizedRecord.email || order.email,
        location: normalizedRecord.address || order.location
      });
    });
    setSelectedCustomerId(normalizedRecord.id);
    setCustomers(readPrototypeCustomerRecords());
    setOrders(readPrototypeWorkOrders());
  }

  return (
    <div className="settings-workspace customer-settings-page">
      <section className="admin-header">
        <div>
          <p className="section-label">Customer settings</p>
          <h1>Profile, review, web app preferences, and saved contact details.</h1>
        </div>
        <button className="primary-button" onClick={saveCustomerSettings}><Save size={16} /> Save customer settings</button>
      </section>

      <section className="settings-grid">
        <div className="panel settings-nav">
          <div className="panel-title">
            <h2>Saved profiles</h2>
            <UserRound />
          </div>
          <button className={!selectedCustomerId ? "selected" : ""} onClick={() => chooseCustomer("")}>
            <UserRound size={16} /> New profile
          </button>
          {customers.map((customer) => (
            <button className={customer.id === selectedCustomerId ? "selected" : ""} key={customer.id} onClick={() => chooseCustomer(customer.id)}>
              <UserRound size={16} /> {customer.name || customer.phone || customer.email || "Customer"}
            </button>
          ))}
          <Link href="/account" className="secondary-button"><Car size={15} /> Back to account</Link>
        </div>

        <div className="panel settings-editor">
          <details className="settings-accordion" open>
            <summary><span>Profile and contact</span><UserRound size={16} /></summary>
            <div className="customer-settings-layout">
              <div className="profile-picture-editor">
                {customerDraft.profileImage ? (
                  <img className="profile-image-preview" src={customerDraft.profileImage} alt={`${customerDraft.name || "Customer"} profile`} />
                ) : (
                  <div className="profile-image-empty"><ImagePlus size={22} /><span>No profile image</span></div>
                )}
                <label className="file-upload-button">
                  <ImagePlus size={15} />
                  <span>Upload image</span>
                  <input type="file" accept="image/*" onChange={(event) => handleProfileImageUpload(event.target.files?.[0] ?? null)} />
                </label>
                <label className="image-url-inline">
                  <span>or image URL</span>
                  <input value={customerDraft.profileImage.startsWith("data:") ? "" : customerDraft.profileImage} onChange={(event) => setCustomerDraft({ ...customerDraft, profileImage: event.target.value })} placeholder="https://..." />
                </label>
              </div>
              <div className="customer-edit-grid">
                <label><span>Name</span><input value={customerDraft.name} onChange={(event) => setCustomerDraft({ ...customerDraft, name: event.target.value })} /></label>
                <label><span>Phone</span><input value={customerDraft.phone} onChange={(event) => setCustomerDraft({ ...customerDraft, phone: event.target.value })} /></label>
                <label><span>Email</span><input value={customerDraft.email} onChange={(event) => setCustomerDraft({ ...customerDraft, email: event.target.value })} /></label>
                <label><span>Address</span><input value={customerDraft.address} onChange={(event) => setCustomerDraft({ ...customerDraft, address: event.target.value })} /></label>
              </div>
            </div>
          </details>

          <details className="settings-accordion" open>
            <summary><span>Saved vehicle photos</span><Car size={16} /></summary>
            <div className="vehicle-photo-list">
              {customerOrders.length ? customerOrders.map((order) => (
                <div className="vehicle-photo-row" key={order.id}>
                  {order.vehicleImage ? <img src={order.vehicleImage} alt={`${order.vehicle} saved vehicle`} /> : <div className="profile-image-empty"><Car size={20} /><span>No vehicle image</span></div>}
                  <div>
                    <strong>{order.vehicle}</strong>
                    <span>{order.plate} - {order.mileage}</span>
                    <div className="vehicle-photo-actions">
                      <button className="secondary-button" onClick={() => { updatePrototypeWorkOrder(order.id, { vehicleImage: order.vehicleSpec.image }); setOrders(readPrototypeWorkOrders()); }}>Use stock photo</button>
                      <label className="file-upload-button">
                        <ImagePlus size={15} />
                        <span>Upload vehicle</span>
                        <input type="file" accept="image/*" onChange={(event) => handleVehicleImageUpload(order.id, event.target.files?.[0] ?? null)} />
                      </label>
                    </div>
                  </div>
                </div>
              )) : <div className="empty-inline"><strong>No saved vehicles yet</strong><span>Submit a request to attach a vehicle to this profile.</span></div>}
            </div>
          </details>

          <details className="settings-accordion" open>
            <summary><span>Review</span><Star size={16} /></summary>
            <div className="customer-edit-grid">
              <label><span>Review rating</span><select value={customerDraft.reviewRating} onChange={(event) => setCustomerDraft({ ...customerDraft, reviewRating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
              </select></label>
              <label className="wide-field"><span>Public review</span><textarea value={customerDraft.review} onChange={(event) => setCustomerDraft({ ...customerDraft, review: event.target.value })} placeholder="Leave a review for the home page" /></label>
            </div>
          </details>

          <details className="settings-accordion" open>
            <summary><span>Web app preferences</span><Bell size={16} /></summary>
            <div className="preference-grid">
              <label className={preferences.notifications ? "selected" : ""}>
                <input checked={preferences.notifications} onChange={(event) => updatePreference("notifications", event.target.checked)} type="checkbox" />
                <Bell size={16} />
                <div><strong>Notify me</strong><span>Appointment confirmation, en route, completion, and reminders.</span></div>
              </label>
              <label className={preferences.location ? "selected" : ""}>
                <input checked={preferences.location} onChange={(event) => updatePreference("location", event.target.checked)} type="checkbox" />
                <LocateFixed size={16} />
                <div><strong>Use my service location</strong><span>Use saved web-app location context for routing and arrival updates.</span></div>
              </label>
              <label className={preferences.rememberLogin ? "selected" : ""}>
                <input checked={preferences.rememberLogin} onChange={(event) => updatePreference("rememberLogin", event.target.checked)} type="checkbox" />
                <KeyRound size={16} />
                <div><strong>Remember my login</strong><span>Prototype preference for easier account access after Supabase auth is connected.</span></div>
              </label>
              <label className={preferences.oneTimeRequest ? "selected" : ""}>
                <input checked={preferences.oneTimeRequest} onChange={(event) => updatePreference("oneTimeRequest", event.target.checked)} type="checkbox" />
                <UserRound size={16} />
                <div><strong>One-time request</strong><span>Submit without an account and attach history later.</span></div>
              </label>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
