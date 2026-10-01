"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, Phone, Users, Wrench } from "lucide-react";

import { businessStats, dollars, downloadCsv } from "@/lib/business-stats";
import { readPrototypeWorkOrders, WORK_ORDERS_EVENT, type PrototypeWorkOrder } from "@/lib/local-store";
import { telLink } from "@/lib/local-directory";

// Owner page: how the business is doing, from the shared work-order board.
export function BusinessDashboard() {
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [customerQuery, setCustomerQuery] = useState("");

  useEffect(() => {
    const sync = () => setOrders(readPrototypeWorkOrders());
    sync();
    window.addEventListener(WORK_ORDERS_EVENT, sync);
    return () => window.removeEventListener(WORK_ORDERS_EVENT, sync);
  }, []);

  const stats = useMemo(() => businessStats(orders, year), [orders, year]);
  const years = useMemo(() => {
    const found = new Set([new Date().getFullYear(), ...orders.map((order) => new Date(order.createdAt).getFullYear()).filter(Boolean)]);
    return [...found].sort((a, b) => b - a);
  }, [orders]);
  const maxMonth = Math.max(1, ...stats.monthly.map((month) => month.revenueCents));
  const filteredCustomers = stats.customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email} ${customer.vehicles.join(" ")}`.toLowerCase().includes(customerQuery.toLowerCase()));

  function exportCustomers() {
    downloadCsv(`ibby-customers-${year}.csv`, stats.customers.map((customer) => ({
      Name: customer.name, Phone: customer.phone, Email: customer.email, "Completed visits": customer.visits,
      "Lifetime paid": (customer.lifetimeCents / 100).toFixed(2), "Last visit": customer.lastVisit.slice(0, 10),
      Vehicles: customer.vehicles.join("; "), "Open jobs": customer.openJobs
    })));
  }

  return (
    <div className="business-dashboard">
      <div className="panel">
        <div className="panel-title">
          <div>
            <p className="section-label">Business</p>
            <h2>How the shop is doing</h2>
          </div>
          <label className="inline-input"><span>Year</span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>{years.map((option) => <option key={option}>{option}</option>)}</select>
          </label>
        </div>
        <div className="stat-strip">
          <div><span>Revenue collected</span><strong>{dollars(stats.revenueCents)}</strong></div>
          <div><span>Jobs completed</span><strong>{stats.jobsCompleted}</strong></div>
          <div><span>Average ticket</span><strong>{dollars(stats.averageTicketCents)}</strong></div>
          <div><span>Requests received</span><strong>{stats.requests}</strong></div>
          <div><span>Open jobs</span><strong>{stats.openJobs}</strong></div>
          <div><span>Awaiting payment</span><strong>{stats.awaitingPayment} ({dollars(stats.outstandingCents)} est.)</strong></div>
          <div><span>Customers served</span><strong>{stats.customersServed}</strong></div>
          <div><span>Repeat customers</span><strong>{Math.round(stats.repeatRate * 100)}%</strong></div>
          <div><span>Avg request to paid</span><strong>{stats.averageTurnaroundDays.toFixed(1)} days</strong></div>
          <div><span>Busiest day</span><strong>{stats.busiestDay}</strong></div>
          <div><span>Recorded labor</span><strong>{stats.laborHours.toFixed(1)} hrs</strong></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><h2>Revenue by month</h2><BarChart3 /></div>
        <div className="month-bars" role="img" aria-label={`Revenue by month for ${year}`}>
          {stats.monthly.map((month) => (
            <div className="month-bar" key={month.month} title={`${month.label}: ${dollars(month.revenueCents)}, ${month.jobs} jobs, ${month.requests} requests`}>
              <div className="month-bar-fill" style={{ height: `${Math.round((month.revenueCents / maxMonth) * 100)}%` }} />
              <span>{month.label}</span>
              <small>{month.jobs}</small>
            </div>
          ))}
        </div>
        <p className="legal-note">Bar height is revenue collected; the number under each month is jobs paid.</p>
      </div>

      <div className="business-grid">
        <div className="panel">
          <div className="panel-title"><h2>Technicians</h2><Wrench /></div>
          <table className="data-table">
            <thead><tr><th>Tech</th><th>Jobs</th><th>Revenue</th><th>Labor hrs</th></tr></thead>
            <tbody>{stats.techs.map((tech) => <tr key={tech.tech}><td>{tech.tech}</td><td>{tech.jobs}</td><td>{dollars(tech.revenueCents)}</td><td>{tech.laborHours.toFixed(1)}</td></tr>)}</tbody>
          </table>
          {!stats.techs.length ? <p className="legal-note">No paid jobs this year yet.</p> : null}
        </div>
        <div className="panel">
          <div className="panel-title"><h2>Services</h2><BarChart3 /></div>
          <table className="data-table">
            <thead><tr><th>Service</th><th>Jobs</th><th>Revenue</th></tr></thead>
            <tbody>{stats.services.slice(0, 15).map((service) => <tr key={service.service}><td>{service.service}</td><td>{service.jobs}</td><td>{dollars(service.revenueCents)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-title"><h2>Payment methods</h2><BarChart3 /></div>
          <table className="data-table">
            <thead><tr><th>Method</th><th>Jobs</th><th>Collected</th></tr></thead>
            <tbody>{stats.paymentMethods.map((method) => <tr key={method.method}><td>{method.method}</td><td>{method.jobs}</td><td>{dollars(method.cents)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div><p className="section-label">Follow-up</p><h2>Due for service ({stats.dueForService.length})</h2></div>
          <Phone />
        </div>
        <p className="legal-note">Customers with a completed job, nothing open, and no visit in the last 6 months.</p>
        <div className="directory-grid">
          {stats.dueForService.slice(0, 24).map((customer) => (
            <div className="directory-card" key={customer.key}>
              <strong>{customer.name}</strong>
              <small>Last visit {customer.lastVisit.slice(0, 10)} - {customer.vehicles.join(", ")}</small>
              {customer.phone && !/no phone/i.test(customer.phone) ? <a href={telLink(customer.phone)}><Phone size={13} /> {customer.phone}</a> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <div><p className="section-label">All customers ({stats.customers.length})</p><h2>Customer history</h2></div>
          <Users />
        </div>
        <div className="supply-custom-row">
          <label className="wide-field"><span>Search</span><input value={customerQuery} onChange={(event) => setCustomerQuery(event.target.value)} placeholder="Name, phone, email, vehicle" /></label>
          <button className="secondary-button" onClick={exportCustomers}><Download size={15} /> Export CSV</button>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Visits</th><th>Lifetime paid</th><th>Last visit</th><th>Vehicles</th><th>Open</th></tr></thead>
            <tbody>
              {filteredCustomers.slice(0, 200).map((customer) => (
                <tr key={customer.key}>
                  <td>{customer.name}<br /><small>{customer.phone} {customer.email}</small></td>
                  <td>{customer.visits}</td>
                  <td>{dollars(customer.lifetimeCents)}</td>
                  <td>{customer.lastVisit.slice(0, 10)}</td>
                  <td>{customer.vehicles.join(", ")}</td>
                  <td>{customer.openJobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
