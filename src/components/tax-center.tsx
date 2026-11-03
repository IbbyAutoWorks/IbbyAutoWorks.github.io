"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, Paperclip, Plus, Receipt } from "lucide-react";

import { annualCostCents, listBusinessServices, type BusinessService } from "@/lib/business-services";
import { collectedCents, dollars, downloadCsv, paidAt, parseMoneyCents } from "@/lib/business-stats";
import { businessLedgerFromWorkOrders, readPrototypeWorkOrders, updatePrototypeWorkOrder, WORK_ORDERS_EVENT, type PrototypeWorkOrder } from "@/lib/local-store";
import { listExpenses, listPromotionOffers, saveExpense, type BusinessExpenseRecord, type MaineTaxSettings } from "@/lib/payment-backend";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { billFromTotal, estimatedTaxPeriods, irsMileageCents, mileageRateNote, mileageRatePublished, readTaxBooksSettings, saveTaxBooksSettings, scheduleCLineFor, scheduleCLines, selfEmploymentTaxCents, TAX_BOOKS_EVENT, taxableCents, taxRulesFrom, type TaxBooksSettings } from "@/lib/tax-rules";

const expenseCategories = ["parts", "supplies", "tools", "fuel", "vehicle", "tolls-parking", "insurance", "software", "phone", "advertising", "licenses-fees", "training", "office", "other"];

// Bought-and-paid supply requests only: "Approved" hasn't been purchased yet.
const purchasedSupplyStatuses = ["Ordered", "Ready for pickup", "Picked up", "Expensed"];
const YEARLY_SOURCE = "Services & accounts (yearly)";

type ExpenseLine = { date: string; source: string; category: string; vendor: string; description: string; cents: number; receipt?: string; counted: boolean };

function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Owner page: read the year at a glance, fix what's flagged, hand the exports to the accountant.
export function TaxCenter() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [expenses, setExpenses] = useState<BusinessExpenseRecord[]>([]);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [taxSettings, setTaxSettings] = useState<MaineTaxSettings | null>(null);
  const [booksSettings, setBooksSettings] = useState<TaxBooksSettings>(() => readTaxBooksSettings());
  const [splitDrafts, setSplitDrafts] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<BusinessExpenseRecord>({ expense_date: new Date().toISOString().slice(0, 10), vendor: "", category: "supplies", description: "", amount_cents: 0, payment_method: "", notes: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const sync = () => setOrders(readPrototypeWorkOrders());
    const syncBooks = () => setBooksSettings(readTaxBooksSettings());
    sync();
    window.addEventListener(WORK_ORDERS_EVENT, sync);
    window.addEventListener(TAX_BOOKS_EVENT, syncBooks);
    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, sync);
      window.removeEventListener(TAX_BOOKS_EVENT, syncBooks);
    };
  }, []);

  useEffect(() => {
    listExpenses(year, "").then(setExpenses).catch((error) => setStatus(`Expenses: ${error.message}`));
    listBusinessServices().then(setServices).catch(() => setServices([]));
    listPromotionOffers().then((data) => setTaxSettings(data.tax_settings)).catch(() => setTaxSettings(null));
  }, [year]);

  const rules = useMemo(() => taxRulesFrom(taxSettings), [taxSettings]);
  const usesActualVehicle = booksSettings.actualVehicleYears.includes(year);
  const enteredMileageCents = booksSettings.mileageCentsByYear[year] ?? 0;
  const mileageNeedsRate = !mileageRatePublished(year) && !enteredMileageCents;

  const books = useMemo(() => {
    const inYear = (iso: string) => Boolean(iso) && new Date(iso).getFullYear() === year;
    const paid = orders.filter((order) => order.payment && inYear(paidAt(order)));
    const income = paid.map((order) => ({
      date: paidAt(order).slice(0, 10), order: order.id, customer: order.customer, vehicle: order.vehicle, service: order.service,
      method: order.payment?.method ?? "", reference: order.payment?.reference ?? "", cents: collectedCents(order), bill: order.bill,
      amountMissing: !parseMoneyCents(order.payment?.amount)
    }));
    const ledger = businessLedgerFromWorkOrders(orders);
    const mileageCents = (date: string) => mileageRatePublished(year) ? irsMileageCents(date) : enteredMileageCents;
    const lines: ExpenseLine[] = [
      ...expenses.map((expense) => ({ date: expense.expense_date, source: "Logged expense", category: expense.category, vendor: expense.vendor, description: expense.description, cents: expense.amount_cents, receipt: expense.receipt_url ?? undefined, counted: usesActualVehicle || !["fuel", "vehicle"].includes(expense.category) })),
      ...ledger.supplyExpenses.filter((item) => inYear(item.date) && purchasedSupplyStatuses.includes(item.status)).map((item) => ({ date: item.date, source: `Supply request (job ${item.workOrderId})`, category: item.category, vendor: item.vendor, description: item.description, cents: Math.round(item.amount * 100), counted: true })),
      ...ledger.mileageExpenses.filter((item) => inYear(item.date)).map((item) => ({ date: item.date, source: `Mileage (job ${item.workOrderId})`, category: "mileage", vendor: "Business mileage", description: `${item.miles} mi at ${mileageCents(item.date)}¢ - ${item.description}`, cents: Math.round(item.miles * mileageCents(item.date)), counted: !usesActualVehicle })),
      ...services.filter((service) => annualCostCents(service) > 0).map((service) => ({ date: `${year}-12-31`, source: YEARLY_SOURCE, category: service.tax_category || "software", vendor: service.name, description: `${service.plan || "Plan"} - ${service.billing_cycle}`, cents: annualCostCents(service), counted: true }))
    ];
    const counted = lines.filter((line) => line.counted);

    const incomeCents = income.reduce((sum, line) => sum + line.cents, 0);
    const split = income.filter((line) => line.bill);
    const partsBilledCents = split.reduce((sum, line) => sum + (line.bill?.partsCents ?? 0), 0);
    const laborBilledCents = split.reduce((sum, line) => sum + (line.bill?.laborCents ?? 0), 0);
    const salesTaxCents = split.reduce((sum, line) => sum + (line.bill?.taxCents ?? 0), 0);
    const taxableSalesCents = split.reduce((sum, line) => sum + (line.bill ? taxableCents(line.bill, rules) : 0), 0);
    const unsplit = income.filter((line) => !line.bill);

    const scheduleC = Object.keys(scheduleCLines).map((key) => ({
      ...scheduleCLines[key],
      cents: counted.filter((line) => scheduleCLineFor(line.category) === key).reduce((sum, line) => sum + line.cents, 0) + (key === "taxes" ? salesTaxCents : 0)
    }));
    const expenseCents = scheduleC.reduce((sum, row) => sum + row.cents, 0);
    const netCents = incomeCents - expenseCents;

    const periods = estimatedTaxPeriods(year).map((period) => {
      const within = (date: string) => date >= period.start && date <= period.end;
      const periodIncome = income.filter((line) => within(line.date));
      const periodExpenses = counted.filter((line) => line.source !== YEARLY_SOURCE && within(line.date.slice(0, 10))).reduce((sum, line) => sum + line.cents, 0)
        + periodIncome.reduce((sum, line) => sum + (line.bill?.taxCents ?? 0), 0);
      const periodIncomeCents = periodIncome.reduce((sum, line) => sum + line.cents, 0);
      return { ...period, incomeCents: periodIncomeCents, expenseCents: periodExpenses };
    });

    const salesTaxQuarters = [0, 1, 2, 3].map((quarter) => {
      const rows = split.filter((line) => Math.floor((Number(line.date.slice(5, 7)) - 1) / 3) === quarter);
      return {
        quarter: quarter + 1,
        taxableCents: rows.reduce((sum, line) => sum + (line.bill ? taxableCents(line.bill, rules) : 0), 0),
        exemptCents: rows.reduce((sum, line) => sum + (line.bill ? line.bill.partsCents + line.bill.laborCents - taxableCents(line.bill, rules) : 0), 0),
        taxCents: rows.reduce((sum, line) => sum + (line.bill?.taxCents ?? 0), 0)
      };
    });

    const logged = lines.filter((line) => line.source === "Logged expense");
    const supplies = lines.filter((line) => line.source.startsWith("Supply request"));
    const daysApart = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 864e5;
    const possibleDuplicates = logged.filter((line) => supplies.some((supply) => supply.cents === line.cents && daysApart(supply.date, line.date) <= 7));
    const serviceAlsoLogged = services.filter((service) => annualCostCents(service) > 0 && logged.some((line) => line.vendor.trim().toLowerCase() === service.name.trim().toLowerCase()));
    const usageBilled = services.filter((service) => service.active && annualCostCents(service) === 0 && service.billing_cycle !== "free");
    const uncountedVehicleCents = lines.filter((line) => !line.counted).reduce((sum, line) => sum + line.cents, 0);
    const miles = ledger.mileageExpenses.filter((item) => inYear(item.date)).reduce((sum, item) => sum + item.miles, 0);
    const stripeCents = income.filter((line) => line.method === "Stripe").reduce((sum, line) => sum + line.cents, 0);
    const selfEmploymentCents = selfEmploymentTaxCents(netCents, year);

    return { income, lines, incomeCents, expenseCents, netCents, scheduleC, periods, salesTaxQuarters, partsBilledCents, laborBilledCents, salesTaxCents, taxableSalesCents, unsplit, possibleDuplicates, serviceAlsoLogged, usageBilled, uncountedVehicleCents, miles, stripeCents, selfEmploymentCents };
  }, [orders, expenses, services, year, rules, usesActualVehicle, enteredMileageCents]);

  const today = new Date().toISOString().slice(0, 10);
  const nextPayment = books.periods.find((period) => period.due >= today);

  const flags: string[] = [];
  if (books.unsplit.length) flags.push(`${books.unsplit.length} paid job${books.unsplit.length === 1 ? "" : "s"} (${dollars(books.unsplit.reduce((sum, line) => sum + line.cents, 0))}) ${books.unsplit.length === 1 ? "needs" : "need"} the parts and labor split below. Until then, the sales tax figure leaves them out.`);
  const noAmount = books.income.filter((line) => line.amountMissing);
  if (noAmount.length) flags.push(`${noAmount.length} payment${noAmount.length === 1 ? " was" : "s were"} recorded with no amount, so the estimate was used: ${noAmount.map((line) => line.order).join(", ")}. Check these against what you actually collected.`);
  if (!usesActualVehicle && books.uncountedVehicleCents) flags.push(`${dollars(books.uncountedVehicleCents)} of fuel and vehicle costs isn't deducted because you're using the standard mileage rate, which already covers them. They stay listed for your records.`);
  if (usesActualVehicle && books.uncountedVehicleCents) flags.push(`${dollars(books.uncountedVehicleCents)} of mileage isn't deducted because you're using actual vehicle costs for ${year}.`);
  if (mileageNeedsRate && books.miles) flags.push(`${books.miles.toLocaleString()} business miles have no rate yet. Enter the ${year} IRS rate below.`);
  if (books.possibleDuplicates.length) flags.push(`${books.possibleDuplicates.length} logged expense${books.possibleDuplicates.length === 1 ? " matches" : "s match"} a supply request by amount and date and may be counted twice: ${books.possibleDuplicates.map((line) => `${line.vendor} ${dollars(line.cents)}`).join(", ")}.`);
  if (books.serviceAlsoLogged.length) flags.push(`Logged as a receipt and also counted from Services & accounts, so possibly twice: ${books.serviceAlsoLogged.map((service) => service.name).join(", ")}.`);
  if (books.usageBilled.length) flags.push(`Billed by usage, so not counted until you log what you paid: ${books.usageBilled.map((service) => service.name).join(", ")}.`);

  function updateBooks(next: TaxBooksSettings) {
    setBooksSettings(next);
    saveTaxBooksSettings(next);
  }

  function setVehicleMethod(actual: boolean) {
    const others = booksSettings.actualVehicleYears.filter((item) => item !== year);
    updateBooks({ ...booksSettings, actualVehicleYears: actual ? [...others, year] : others });
  }

  function saveSplit(orderId: string, totalCents: number) {
    const partsCents = Math.round((Number.parseFloat(splitDrafts[orderId] ?? "") || 0) * 100);
    updatePrototypeWorkOrder(orderId, { bill: billFromTotal(totalCents, partsCents, rules) });
    setSplitDrafts((current) => { const next = { ...current }; delete next[orderId]; return next; });
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
    downloadCsv(`ibby-schedule-c-summary-${year}.csv`, [
      { Line: "1", Item: "Gross receipts (includes sales tax collected)", Amount: (books.incomeCents / 100).toFixed(2) },
      ...books.scheduleC.map((row) => ({ Line: row.line, Item: row.label, Amount: (row.cents / 100).toFixed(2) })),
      { Line: "", Item: "Net profit estimate", Amount: (books.netCents / 100).toFixed(2) }
    ]);
    downloadCsv(`ibby-income-${year}.csv`, books.income.map((line) => ({ Date: line.date, "Work order": line.order, Customer: line.customer, Vehicle: line.vehicle, Service: line.service, Method: line.method, Reference: line.reference, Parts: line.bill ? (line.bill.partsCents / 100).toFixed(2) : "not split", Labor: line.bill ? (line.bill.laborCents / 100).toFixed(2) : "not split", "Sales tax": line.bill ? (line.bill.taxCents / 100).toFixed(2) : "not split", Amount: (line.cents / 100).toFixed(2) })));
    downloadCsv(`ibby-expenses-${year}.csv`, books.lines.map((line) => ({ Date: line.date, Source: line.source, Category: line.category, "Schedule C line": scheduleCLines[scheduleCLineFor(line.category)].line, Vendor: line.vendor, Description: line.description, Amount: (line.cents / 100).toFixed(2), Counted: line.counted ? "yes" : "no", Receipt: line.receipt ? "yes" : "" })));
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
          <div><span>Gross receipts</span><strong>{dollars(books.incomeCents)}</strong></div>
          <div><span>Expenses</span><strong>{dollars(books.expenseCents)}</strong></div>
          <div><span>Net profit</span><strong>{dollars(books.netCents)}</strong></div>
          <div><span>Self-employment tax estimate</span><strong>{dollars(books.selfEmploymentCents)}</strong></div>
          <div><span>Maine sales tax on these sales</span><strong>{dollars(books.salesTaxCents)}</strong></div>
          <div><span>Next estimated payment</span><strong>{nextPayment ? shortDate(nextPayment.due) : "None left"}</strong></div>
        </div>
        <p className="legal-note">
          These are estimates from what&apos;s recorded in the app, to help you and your accountant. The self-employment figure doesn&apos;t include
          income tax, which depends on your whole household. Wages from another job can also lower it.
        </p>
        <button className="primary-button" onClick={exportAll}><Download size={15} /> Export for your accountant (CSV)</button>
      </div>

      <div className="panel">
        <div className="panel-title"><h2>{flags.length ? `Check before filing (${flags.length})` : "Nothing flagged"}</h2>{flags.length ? <AlertTriangle /> : <CheckCircle2 />}</div>
        {flags.length ? <ul className="checklist">{flags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : <p className="legal-note">No missing splits, possible duplicates, or vehicle conflicts found for {year}.</p>}
        {books.unsplit.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Paid</th><th>Job</th><th>Total</th><th>Parts &amp; supplies billed ($)</th><th /></tr></thead>
              <tbody>
                {books.unsplit.map((line) => (
                  <tr key={line.order}>
                    <td>{line.date}</td>
                    <td>{line.customer}<br /><small>{line.service}</small></td>
                    <td>{dollars(line.cents)}</td>
                    <td><input aria-label={`Parts billed on job ${line.order}`} inputMode="decimal" placeholder="0.00" value={splitDrafts[line.order] ?? ""} onChange={(event) => setSplitDrafts({ ...splitDrafts, [line.order]: event.target.value })} /></td>
                    <td><button className="mini-button" disabled={splitDrafts[line.order] === undefined} onClick={() => saveSplit(line.order, line.cents)}>Save</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="legal-note">Enter the parts amount before tax. The app works out the tax and treats the rest of the total as labor.</p>
          </div>
        ) : null}
      </div>

      <div className="business-grid">
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">Sole proprietor</p><h2>Schedule C summary</h2></div><FileText /></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Line</th><th>Item</th><th>Amount</th></tr></thead>
              <tbody>
                <tr><td>1</td><td>Gross receipts (includes sales tax collected)</td><td>{dollars(books.incomeCents)}</td></tr>
                {books.scheduleC.map((row) => <tr key={row.line}><td>{row.line}</td><td>{row.label}</td><td>{dollars(row.cents)}</td></tr>)}
                <tr><td /><td><strong>Net profit estimate</strong></td><td><strong>{dollars(books.netCents)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p className="legal-note">Line numbers follow the 2025 form; check them against the form for the year you file. Line 23 includes sales tax on these sales, which is why line 1 includes it too. Bigger tools may need depreciation (line 13) instead of line 22, so ask your accountant.</p>
        </div>
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">Maine Revenue Services</p><h2>Sales tax by quarter</h2></div><Receipt /></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Quarter</th><th>Taxable</th><th>Not taxed</th><th>Tax ({(rules.rate * 100).toFixed(2)}%)</th></tr></thead>
              <tbody>
                {books.salesTaxQuarters.map((quarter) => <tr key={quarter.quarter}><td>Q{quarter.quarter}</td><td>{dollars(quarter.taxableCents)}</td><td>{dollars(quarter.exemptCents)}</td><td>{dollars(quarter.taxCents)}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p className="legal-note">In Maine, parts and shop supplies are taxed. Labor isn&apos;t, as long as the bill lists it separately; a single bundled price is taxed in full. File on the schedule Maine Revenue Services assigned you.</p>
        </div>
      </div>

      <div className="business-grid">
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">IRS and Maine</p><h2>Estimated tax periods</h2></div><FileText /></div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Period</th><th>Income</th><th>Expenses</th><th>Net</th><th>Due</th></tr></thead>
              <tbody>
                {books.periods.map((period) => (
                  <tr key={period.start}>
                    <td>{period.label}</td>
                    <td>{dollars(period.incomeCents)}</td>
                    <td>{dollars(period.expenseCents)}</td>
                    <td>{dollars(period.incomeCents - period.expenseCents)}</td>
                    <td>{shortDate(period.due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="legal-note">Federal payments use Form 1040-ES and Maine payments use Form 1040ES-ME, with the same due dates. Yearly subscription costs count in the annual total, not in these periods.</p>
        </div>
        <div className="panel">
          <div className="panel-title"><div><p className="section-label">{books.miles.toLocaleString()} business miles</p><h2>Vehicle deduction</h2></div><Receipt /></div>
          <label className="inline-input"><span>Method for {year}</span>
            <select value={usesActualVehicle ? "actual" : "standard"} onChange={(event) => setVehicleMethod(event.target.value === "actual")}>
              <option value="standard">Standard mileage rate</option>
              <option value="actual">Actual vehicle costs</option>
            </select>
          </label>
          {!mileageRatePublished(year) ? (
            <label className="inline-input"><span>IRS rate for {year} (cents per mile)</span>
              <input inputMode="decimal" value={enteredMileageCents ? String(enteredMileageCents) : ""} onChange={(event) => updateBooks({ ...booksSettings, mileageCentsByYear: { ...booksSettings.mileageCentsByYear, [year]: Number.parseFloat(event.target.value) || 0 } })} />
            </label>
          ) : null}
          <p className="legal-note">{mileageRateNote(year)} You can claim the mileage rate or actual costs for a vehicle, not both. Parking and tolls for business count either way: log them as tolls-parking.</p>
          <p className="legal-note">Card payments through Stripe: {dollars(books.stripeCents)}. Stripe only sends a 1099-K above the IRS reporting threshold, but the income counts either way.</p>
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
                  <td>{line.date}</td><td>{line.vendor}</td><td>{line.category}</td><td>{line.description}</td><td><small>{line.source}{line.counted ? "" : " (not deducted)"}</small></td><td>{dollars(line.cents)}</td>
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
          <li>Clear everything under &quot;Check before filing&quot; above.</li>
          <li>Export the CSVs and send them to your accountant.</li>
          <li>Log Stripe&apos;s processing fees as an expense (Stripe dashboard - Reports). Gross receipts count the full amount charged.</li>
          <li>Compare the Stripe total with Stripe&apos;s annual summary and any 1099-K.</li>
          <li>Attach a receipt to every logged expense. The IRS expects records for business deductions.</li>
          <li>Mileage log: confirm each job trip is logged.</li>
          <li>Services &amp; accounts: costs and billing cycles up to date. Monthly plans are counted as 12 months, so adjust any that started mid-year.</li>
          <li>Sales tax: confirm your Maine filings match the quarter table above.</li>
          <li>Contractor payments: a helper paid as a contractor above the IRS reporting threshold for {year} (check irs.gov) needs a 1099-NEC by January 31.</li>
        </ul>
      </div>
    </div>
  );
}
