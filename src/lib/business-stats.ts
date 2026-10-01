import type { PrototypeWorkOrder } from "@/lib/local-store";

// Business numbers computed from the shared work-order board. "Revenue" means money
// actually recorded as collected (order.payment); estimates are reported separately.

export function parseMoneyCents(value: string | undefined | null): number {
  if (!value) return 0;
  const numbers = String(value).replace(/,/g, "").match(/\d+(?:\.\d{1,2})?/g);
  if (!numbers?.length) return 0;
  // "$89 - $129" estimate ranges use the midpoint.
  const amounts = numbers.map(Number);
  const value_ = amounts.length > 1 ? (amounts[0] + amounts[amounts.length - 1]) / 2 : amounts[0];
  return Math.round(value_ * 100);
}

export function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function paidAt(order: PrototypeWorkOrder) {
  return order.payment?.recordedAt ?? "";
}

export function collectedCents(order: PrototypeWorkOrder) {
  if (!order.payment) return 0;
  return parseMoneyCents(order.payment.amount) || parseMoneyCents(order.estimate);
}

function hoursBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const hours = (Date.parse(end) - Date.parse(start)) / 36e5;
  return hours > 0 && hours < 24 * 14 ? hours : 0;
}

function customerKey(order: PrototypeWorkOrder) {
  return (order.email && !/no email/i.test(order.email) ? order.email : order.phone && !/no phone/i.test(order.phone) ? order.phone : order.customer).toLowerCase().trim();
}

export type CustomerStat = {
  key: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  lifetimeCents: number;
  lastVisit: string;
  vehicles: string[];
  openJobs: number;
};

export type TechStat = { tech: string; jobs: number; revenueCents: number; laborHours: number };
export type ServiceStat = { service: string; jobs: number; revenueCents: number };

export function businessStats(orders: PrototypeWorkOrder[], year: number) {
  const inYear = (iso: string) => Boolean(iso) && new Date(iso).getFullYear() === year;
  const paid = orders.filter((order) => order.payment && inYear(paidAt(order)));
  const created = orders.filter((order) => inYear(order.createdAt));
  const revenueCents = paid.reduce((sum, order) => sum + collectedCents(order), 0);
  const open = orders.filter((order) => order.status !== "Complete");
  const awaitingPayment = orders.filter((order) => order.status === "Awaiting Payment");

  const monthly = Array.from({ length: 12 }, (_, month) => {
    const monthPaid = paid.filter((order) => new Date(paidAt(order)).getMonth() === month);
    return {
      month,
      label: new Date(year, month, 1).toLocaleString(undefined, { month: "short" }),
      revenueCents: monthPaid.reduce((sum, order) => sum + collectedCents(order), 0),
      jobs: monthPaid.length,
      requests: created.filter((order) => new Date(order.createdAt).getMonth() === month).length
    };
  });

  const customers = new Map<string, CustomerStat>();
  for (const order of orders) {
    const key = customerKey(order);
    if (!key) continue;
    const current = customers.get(key) ?? { key, name: order.customer, phone: order.phone, email: order.email, visits: 0, lifetimeCents: 0, lastVisit: "", vehicles: [], openJobs: 0 };
    current.visits += order.status === "Complete" ? 1 : 0;
    current.openJobs += order.status === "Complete" ? 0 : 1;
    current.lifetimeCents += collectedCents(order);
    const visitDate = paidAt(order) || order.createdAt;
    if (visitDate > current.lastVisit) current.lastVisit = visitDate;
    if (order.vehicle && !current.vehicles.includes(order.vehicle)) current.vehicles.push(order.vehicle);
    customers.set(key, current);
  }
  const customerList = [...customers.values()].sort((a, b) => b.lifetimeCents - a.lifetimeCents);
  const yearCustomers = new Set(paid.map(customerKey));
  const repeatCustomers = customerList.filter((customer) => customer.visits > 1).length;
  const sixMonthsAgo = new Date(Date.now() - 182 * 864e5).toISOString();
  const dueForService = customerList.filter((customer) => customer.visits > 0 && customer.lastVisit && customer.lastVisit < sixMonthsAgo && customer.openJobs === 0);

  const techs = new Map<string, TechStat>();
  for (const order of paid) {
    const tech = order.technician || "Not recorded";
    const current = techs.get(tech) ?? { tech, jobs: 0, revenueCents: 0, laborHours: 0 };
    current.jobs += 1;
    current.revenueCents += collectedCents(order);
    current.laborHours += hoursBetween(order.workStartedAt, order.workFinishedAt);
    techs.set(tech, current);
  }

  const services = new Map<string, ServiceStat>();
  for (const order of paid) {
    const names = order.services?.length ? order.services : [order.service];
    const share = collectedCents(order) / Math.max(1, names.length);
    for (const name of names) {
      const current = services.get(name) ?? { service: name, jobs: 0, revenueCents: 0 };
      current.jobs += 1;
      current.revenueCents += share;
      services.set(name, current);
    }
  }

  const paymentMethods = new Map<string, { method: string; jobs: number; cents: number }>();
  for (const order of paid) {
    const method = order.payment?.method ?? "Unknown";
    const current = paymentMethods.get(method) ?? { method, jobs: 0, cents: 0 };
    current.jobs += 1;
    current.cents += collectedCents(order);
    paymentMethods.set(method, current);
  }

  const turnaroundDays = paid
    .map((order) => (Date.parse(paidAt(order)) - Date.parse(order.createdAt)) / 864e5)
    .filter((days) => days >= 0 && days < 365);
  const weekdayCounts = Array.from({ length: 7 }, (_, day) => paid.filter((order) => new Date(paidAt(order)).getDay() === day).length);
  const busiestDay = weekdayCounts.indexOf(Math.max(...weekdayCounts));

  return {
    year,
    revenueCents,
    jobsCompleted: paid.length,
    averageTicketCents: paid.length ? Math.round(revenueCents / paid.length) : 0,
    requests: created.length,
    openJobs: open.length,
    awaitingPayment: awaitingPayment.length,
    outstandingCents: awaitingPayment.reduce((sum, order) => sum + parseMoneyCents(order.estimate), 0),
    customersServed: yearCustomers.size,
    totalCustomers: customerList.length,
    repeatRate: customerList.length ? repeatCustomers / customerList.length : 0,
    averageTurnaroundDays: turnaroundDays.length ? turnaroundDays.reduce((a, b) => a + b, 0) / turnaroundDays.length : 0,
    busiestDay: paid.length ? new Date(2024, 0, 7 + busiestDay).toLocaleString(undefined, { weekday: "long" }) : "-",
    laborHours: [...techs.values()].reduce((sum, tech) => sum + tech.laborHours, 0),
    monthly,
    customers: customerList,
    dueForService,
    techs: [...techs.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    services: [...services.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    paymentMethods: [...paymentMethods.values()].sort((a, b) => b.cents - a.cents)
  };
}

// Plain CSV for the accountant; quotes every cell.
export function toCsv(rows: Array<Record<string, string | number>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\r\n");
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
