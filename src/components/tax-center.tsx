"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Paperclip, Plus, Receipt } from "lucide-react";

import { annualCostCents, listBusinessServices, type BusinessService } from "@/lib/business-services";
import { collectedCents, dollars, downloadCsv, paidAt } from "@/lib/business-stats";
import { businessLedgerFromWorkOrders, readPrototypeWorkOrders, WORK_ORDERS_EVENT, type PrototypeWorkOrder } from "@/lib/local-store";
import { listExpenses, listPromotionOffers, saveExpense, type BusinessExpenseRecord, type MaineTaxSettings } from "@/lib/payment-backend";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

const expenseCategories = ["parts", "supplies", "tools", "fuel", "vehicle", "insurance", "software", "phone", "advertising", "licenses-fees", "training", "office", "other"];

type ExpenseLine = { date: string; source: string; category: string; vendor: string; description: string; cents: number; receipt?: string };

function quarterOf(iso: string) {
  return Math.floor(new Date(iso).getMonth() / 3) + 1;
}

function readMileageRate(year: number) {
  try { return Number(window.localStorage.getItem(`ibby-mileage-rate-${year}`)) || 0.7; } catch { return 0.7; }
}

// Owner page: the year's books in one place, with CSV exports for the accountant.
export function TaxCenter() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [expenses, setExpenses] = useState<BusinessExpenseRecord[]>([]);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [taxSettings, setTaxSettings] = useState<MaineTaxSettings | null>(null);
  const [mileageRate, setMileageRate] = useState(0.7);
  const [draft, setDraft] = useState<BusinessExpenseRecord>({ expense_date: new Date().toISOString().slice(0, 10), vendor: "", category: "supplies", description: "", amount_cents: 0, payment_method: "", notes: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const sync = () => setOrders(readPrototypeWorkOrders());
    sync();
    window.addEventListener(WORK_ORDERS_EVENT, sync);
    return () => window.removeEventListener(WORK_ORDERS_EVENT, sync);
  }, []);

  useEffect(() => {
    setMileageRate(readMileageRate(year));
    listExpenses(year, "").then(setExpenses).catch((error) => setStatus(`Expenses: ${error.message}`));
    listBusinessServices().then(setServices).catch(() => setServices([]));
    listPromotionOffers().then((data) => setTaxSettings(data.tax_settings)).catch(() => setTaxSettings(null));
  }, [year]);

  const books = useMemo(() => {
    const inYear = (iso: string) => Boolean(iso) && new Date(iso).getFullYear() === year;
    const paid = orders.filter((order) => order.payment && inYear(paidAt(order)));
    const income = paid.map((order) => ({ date: paidAt(order).slice(0, 10), order: order.id, customer: order.customer, vehicle: order.vehicle, service: order.service, method: order.payment?.method ?? "", reference: order.payment?.reference ?? "", cents: collectedCents(order) }));
    const ledger = businessLedgerFromWorkOrders(orders);
    const lines: ExpenseLine[] = [
      ...expenses.map((expense) => ({ date: expense.expense_date, source: "Logged expense", category: expense.category, vendor: expense.vendor, description: expense.description, cents: expense.amount_cents, receipt: expense.receipt_url ?? undefined })),
      ...ledger.supplyExpenses.filter((item) => inYear(item.date) && ["Approved", "Ordered", "Ready for pickup", "Picked up", "Expensed"].includes(item.status)).map((item) => ({ date: item.date, source: `Supply request (job ${item.workOrderId})`, category: item.category, vendor: item.vendor, description: item.description, cents: Math.round(item.amount * 100) })),
      ...ledger.mileageExpenses.filter((item) => inYear(item.date)).map((item) => ({ date: item.date, source: `Mileage (job ${item.workOrderId})`, category: "mileage", vendor: "Business mileage", description: `${item.miles} mi - ${item.description}`, cents: Math.round(item.miles * mileageRate * 100) })),
      ...services.filter((service) => annualCostCents(service) > 0).map((service) => ({ date: `${year}-12-31`, source: "Services & accounts (yearly)", category: service.tax_category || "software", vendor: service.name, description: `${service.plan || "Plan"} - ${service.billing_cycle}`, cents: annualCostCents(service) }))
    ];
    const incomeCents = income.reduce((sum, line) => sum + line.cents, 0);
    const expenseCents = lines.reduce((sum, line) => sum + line.cents, 0);
    const byCategory = [...lines.reduce((map, line) => map.set(line.category, (map.get(line.category) ?? 0) + line.cents), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
    const quarters = [1, 2, 3, 4].map((quarter) => {
      const qIncome = income.filter((line) => quarterOf(line.date) === quarter).reduce((sum, line) => sum + line.cents, 0);
      const qExpense = lines.filter((line) => line.source !== "Services & accounts (yearly)" && quarterOf(line.date) === quarter).reduce((sum, line) => sum + line.cents, 0);
      return { quarter, incomeCents: qIncome, expenseCents: qExpense };
    });
    const miles = ledger.mileageExpenses.filter((item) => inYear(item.date)).reduce((sum, item) => sum + item.miles, 0);
    const stripeCents = income.filter((line) => line.method === "Stripe").reduce((sum, line) => sum + line.cents, 0);
    return { income, lines, incomeCents, expenseCents, byCategory, quarters, miles, stripeCents };
  }, [orders, expenses, services, year, mileageRate]);

  const salesTaxRate = (taxSettings?.sales_tax_rate ?? 0.055) + (taxSettings?.local_tax_rate ?? 0);

  function updateMileageRate(value: string) {
    const rate = Number.parseFloat(value) || 0;
    setMileageRate(rate);
    try { window.localStorage.setItem(`ibby-mileage-rate-${year}`, String(rate)); } catch { /* storage unavailable */ }
  }

  async function attachReceipt(file: File | null) {
    if (!file) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const path = `${year}/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
    const { error } = await supabase.storage.from("receipts").upload(path, file, { contentType: file.type });
    if (error) return setStatus(`Receipt upload failed: ${error.message}`);
    setDraft((current) => ({ ...current, receipt_url: `receipts:${path}` }));
    setStatus("Receipt attached - save the expense to keep it.");
  }

  async function openReceipt(receipt: string) {
    if (!receipt.startsWith("receipts:")) return window.open(receipt, "_blank", "noopener");
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase!.storage.from("receipts").createSignedUrl(receipt.slice("receipts:".length), 300);
    if (error || !data) return setStatus(error?.message ?? "Could not open receipt");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function addExpense() {
    if (!draft.amount_cents || !draft.vendor.trim()) return setStatus("Enter at least a vendor and an amount.");
    try {
      await saveExpense(draft, "");
      setExpenses(await listExpenses(year, ""));
      setDraft({ ...draft, vendor: "", description: "", amount_cents: 0, notes: "", receipt_url: null });
      setStatus("Expense saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  }

  function exportAll() {
    downloadCsv(`ibby-income-${year}.csv`, books.income.map((line) => ({ Date: line.date, "Work order": line.order, Customer: line.customer, Vehicle: line.vehicle, Service: line.service, Method: line.method, Reference: line.reference, Amount: (line.cents / 100).toFixed(2) })));
    downloadCsv(`ibby-expenses-${year}.csv`, books.lines.map((line) => ({ Date: line.date, Source: line.source, Category: line.category, Vendor: line.vendor, Description: line.description, Amount: (line.cents / 100).toFixed(2), Receipt: line.receipt ? "yes" : "" })));
  }

  return (
    <div className="business-dashboard">
      <div className="panel">
        <div className="panel-title">
          <div><p className="section-label">Taxes &amp; books</p><h2>{year} at a glance</h2></div>
          <label className="inline-input"><span>Year</span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {[0, 1, 2, 3].map((back) => new Date().getFullYear() - back).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <div className="stat-strip">
          <div><span>Income collected</span><strong>{dollars(books.incomeCents)}</strong></div>
          <div><span>Expenses</span><strong>{dollars(books.expenseCents)}</strong></div>
          <div><span>Net (before tax)</span><strong>{dollars(books.incomeCents - books.expenseCents)}</strong></div>
          <div><span>Business miles</span><strong>{books.miles.toLocaleString()}</strong></div>
          <div><span>Card payments via Stripe</span><strong>{dollars(books.stripeCents)}</strong></div>
          <div><span>Sales tax if all receipts taxable ({(salesTaxRate * 100).toFixed(2)}%)</span><strong>{dollars(Math.round(books.incomeCents * salesTaxRate / (1 + salesTaxRate)))}</strong></div>
        </div>
        <p className="legal-note">
          Sales tax figure assumes collected amounts included tax on everything; Maine treats parts and labor differently,
          so confirm the taxable split with Maine Revenue Services or your accountant. Compare the Stripe total with the
          1099-K Stripe sends in January.
        </p>
        <button className="primary-button" onClick={exportAll}><Download size={15} /> Export income + expenses (CSV)</button>
      </div>

      <div className="business-grid">
        <div className="panel">
          <div className="panel-title"><h2>Quarterly (estimated tax)</h2><FileText /></div>
          <table className="data-table">
            <thead><tr><th>Quarter</th><th>Income</th><th>Expenses</th><th>Net</th><th>Payment due</th></tr></thead>
            <tbody>
              {books.quarters.map((quarter) => (
                <tr key={quarter.quarter}>
                  <td>Q{quarter.quarter}</td>
                  <td>{dollars(quarter.incomeCents)}</td>
                  <td>{dollars(quarter.expenseCents)}</td>
                  <td>{dollars(quarter.incomeCents - quarter.expenseCents)}</td>
                  <td>{["Apr 15", "Jun 15", "Sep 15", `Jan 15, ${year + 1}`][quarter.quarter - 1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="legal-note">Yearly subscription costs are counted in the annual total, not per quarter.</p>
        </div>
        <div className="panel">
          <div className="panel-title"><h2>Expenses by category</h2><Receipt /></div>
          <table className="data-table">
            <tbody>{books.byCategory.map(([category, cents]) => <tr key={category}><td>{category}</td><td>{dollars(cents)}</td></tr>)}</tbody>
          </table>
          <label className="inline-input"><span>Mileage rate ($/mile for {year})</span><input value={String(mileageRate)} onChange={(event) => updateMileageRate(event.target.value)} /></label>
          <p className="legal-note">Use the IRS standard mileage rate for {year} (check irs.gov - it changes yearly).</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><div><p className="section-label">Log an expense</p><h2>Receipts and purchases</h2></div><Plus /></div>
        <div className="form-grid">
          <label><span>Date</span><input type="date" value={draft.expense_date} onChange={(event) => setDraft({ ...draft, expense_date: event.target.value })} /></label>
          <label><span>Vendor</span><input value={draft.vendor} onChange={(event) => setDraft({ ...draft, vendor: event.target.value })} placeholder="NAPA Auburn" /></label>
          <label><span>Category</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label><span>Amount ($)</span><input inputMode="decimal" value={draft.amount_cents ? String(draft.amount_cents / 100) : ""} onChange={(event) => setDraft({ ...draft, amount_cents: Math.round((Number.parseFloat(event.target.value) || 0) * 100) })} /></label>
          <label><span>Paid with</span><input value={draft.payment_method} onChange={(event) => setDraft({ ...draft, payment_method: event.target.value })} placeholder="Business card" /></label>
          <label className="wide-field"><span>Description</span><input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Brake cleaner, shop towels" /></label>
          <label className="secondary-button vehicle-photo-upload"><Paperclip size={15} /> {draft.receipt_url ? "Receipt attached" : "Attach receipt photo / PDF"}<input type="file" accept="image/*,application/pdf" capture="environment" onChange={(event) => attachReceipt(event.target.files?.[0] ?? null)} /></label>
        </div>
        <button className="primary-button" onClick={addExpense}><Plus size={15} /> Save expense</button>
        {status ? <p className="legal-note">{status}</p> : null}
      </div>

      <div className="panel">
        <div className="panel-title"><h2>All expenses ({books.lines.length})</h2><Receipt /></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Vendor</th><th>Category</th><th>Description</th><th>Source</th><th>Amount</th><th>Receipt</th></tr></thead>
            <tbody>
              {[...books.lines].sort((a, b) => b.date.localeCompare(a.date)).map((line, index) => (
                <tr key={`${line.date}-${line.vendor}-${index}`}>
                  <td>{line.date}</td><td>{line.vendor}</td><td>{line.category}</td><td>{line.description}</td><td><small>{line.source}</small></td><td>{dollars(line.cents)}</td>
                  <td>{line.receipt ? <button className="mini-button" onClick={() => openReceipt(line.receipt!)}>View</button> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title"><h2>Year-end checklist</h2><FileText /></div>
        <ul className="checklist">
          <li>Export income + expenses CSV above and send to your accountant.</li>
          <li>Download Stripe&apos;s 1099-K (Stripe dashboard - Settings - Documents) and compare to the Stripe total.</li>
          <li>Attach a receipt to every logged expense - the IRS expects records for business deductions.</li>
          <li>Mileage log: confirm each job trip is logged and the IRS rate for {year} is set.</li>
          <li>Services &amp; accounts: costs and billing cycles up to date (they feed the expense total).</li>
          <li>Sales tax: confirm your Maine filings match taxable sales for the year.</li>
          <li>Contractor payments: a helper paid as a contractor above the IRS reporting threshold for {year} (check irs.gov) needs a 1099-NEC by January 31.</li>
        </ul>
      </div>
    </div>
  );
}
