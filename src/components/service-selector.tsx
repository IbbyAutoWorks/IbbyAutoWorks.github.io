"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Calculator, ChevronDown, ExternalLink, PackagePlus, Phone, Search, X } from "lucide-react";

import { buildRetailerEstimateResults, dealerCandidates, estimateServiceTiers, estimateTieredTotal, partTiers, vehicleHintFromContext, type PartTier, type TierEstimate, type VehicleHint, estimatePartCategories, estimateServiceParts, estimateServices, formatPriceRange, popularEstimateQueries, quantityForCategoryPart } from "@/lib/parts";
import { readPricingSettings, type PricingSettings } from "@/lib/pricing-settings";


type ServiceSelectorProps = {
  selectedServices: string[];
  onToggleService: (serviceName: string, checked: boolean) => void;
  compact?: boolean;
  selectedSupplierChoices?: Record<string, string>;
  onSupplierChoiceChange?: (choiceKey: string, supplierName: string) => void;
  vehicleContext?: string;
  areaContext?: string;
  // "customer" sees tier choices only; "staff" also sees part detail, suppliers and dealers.
  audience?: "customer" | "staff";
  serviceTiers?: Record<string, PartTier>;
  onTierChange?: (service: string, tier: PartTier) => void;
};

function partsForCategory(category: (typeof estimatePartCategories)[number]) {
  return [
    ...(category.parts ?? []),
    ...(category.groups ?? []).flatMap((group) => group.parts)
  ];
}

export function ServiceSelector({ selectedServices, onToggleService, compact = false, selectedSupplierChoices = {}, onSupplierChoiceChange, vehicleContext = "", areaContext = "", audience = "staff", serviceTiers = {}, onTierChange }: ServiceSelectorProps) {
  const isStaff = audience === "staff";
  const vehicleHint = useMemo(() => vehicleHintFromContext(vehicleContext), [vehicleContext]);
  const [partSearch, setPartSearch] = useState("");
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() => readPricingSettings());
  useEffect(() => {
    function syncPricingSettings() {
      setPricingSettings(readPricingSettings());
    }
    syncPricingSettings();
    window.addEventListener("storage", syncPricingSettings);
    window.addEventListener("ibbys-auto.pricing-settings.changed", syncPricingSettings);
    return () => {
      window.removeEventListener("storage", syncPricingSettings);
      window.removeEventListener("ibbys-auto.pricing-settings.changed", syncPricingSettings);
    };
  }, []);
  const estimate = useMemo(() => estimateServices(selectedServices, pricingSettings), [selectedServices, pricingSettings]);
  const tieredTotal = useMemo(() => estimateTieredTotal(selectedServices, serviceTiers, pricingSettings, vehicleHint), [selectedServices, serviceTiers, pricingSettings, vehicleHint]);
  const selectedSet = useMemo(() => new Set(selectedServices.map((service) => service.toLowerCase())), [selectedServices]);
  const normalizedPartSearch = partSearch.trim();
  const visibleCategories = compact ? estimatePartCategories.slice(0, 8) : estimatePartCategories;
  const retailerResultsByService = useMemo(() => Object.fromEntries(selectedServices.map((service) => [service, buildRetailerEstimateResults(service, { vehicleContext, areaContext, pricingSettings })])), [selectedServices, vehicleContext, areaContext, pricingSettings]);
  const bestDistributorTotal = selectedServices.length
    ? selectedServices.reduce((total, service) => {
        const best = retailerResultsByService[service]?.[0];
        return best ? { min: total.min + best.selectedTotal.min, max: total.max + best.selectedTotal.max } : total;
      }, { min: 0, max: 0 })
    : null;

  function addEstimateItem(item: string) {
    const clean = item.trim();
    if (!clean || selectedSet.has(clean.toLowerCase())) return;
    onToggleService(clean, true);
    setPartSearch("");
  }

  function removeEstimateItem(item: string) {
    onToggleService(item, false);
  }

  return (
    <div className={compact ? "multi-service-picker compact-service-picker" : "multi-service-picker"}>
      <details className="requested-services-shell">
        <summary>
          <span>{selectedServices.length} job estimate{selectedServices.length === 1 ? "" : "s"} selected</span>
          <small>Click to expand IAW job estimate categories</small>
          <ChevronDown size={16} />
        </summary>
        <div className="service-category-list">
          {visibleCategories.map((category) => {
            const categoryParts = partsForCategory(category);
            const selectedCount = categoryParts.filter((part) => selectedSet.has(part.toLowerCase())).length;
            return (
              <details className="service-category" key={category.label} open={selectedCount > 0}>
                <summary>
                  <strong>{category.label}</strong>
                  <span>{selectedCount}/{categoryParts.length} selected</span>
                </summary>
                {category.groups ? category.groups.map((group) => (
                  <details className="estimate-part-group requested-service-subgroup" key={group.label} open={group.parts.some((part) => selectedSet.has(part.toLowerCase()))}>
                    <summary>{group.label}</summary>
                    <div className="service-option-list">
                      {group.parts.map((service) => <RequestedServiceOption key={service} serviceName={service} selected={selectedSet.has(service.toLowerCase())} onToggleService={onToggleService} pricingSettings={pricingSettings} vehicleHint={vehicleHint} />)}
                    </div>
                  </details>
                )) : (
                  <div className="service-option-list">
                    {(category.parts ?? []).map((service) => <RequestedServiceOption key={service} serviceName={service} selected={selectedSet.has(service.toLowerCase())} onToggleService={onToggleService} pricingSettings={pricingSettings} vehicleHint={vehicleHint} />)}
                  </div>
                )}
              </details>
            );
          })}
        </div>
      </details>

      <section className="estimate-builder-panel">
        <div className="panel-title estimate-builder-title">
          <div>
            <p className="section-label">{isStaff ? "IAW job estimate builder" : "Price estimate"}</p>
            <h2>{isStaff ? "Choose full job estimates or add individual parts, then compare distributors." : "Pick the work you need, then choose a price tier for each job."}</h2>
          </div>
          <Calculator />
        </div>
        <p className="legal-note">
          {isStaff
            ? "Job estimate buttons are quick “inspect plus parts if needed” planning bundles. Individual parts can still be added one by one. Open each distributor for live fitment, images, stock, and exact local price before ordering."
            : "Prices include parts and labor for your vehicle. Value uses economy parts, Recommended uses quality name-brand parts, Premium uses top-brand or dealer (OEM) parts."}
        </p>

        <div className="part-search-row">
          <Search size={16} />
          <input value={partSearch} onChange={(event) => setPartSearch(event.target.value)} placeholder="Add an individual part or job estimate: rear struts, wipers, alternator, exhaust leak..." />
          <button className="secondary-button" disabled={!normalizedPartSearch || selectedSet.has(normalizedPartSearch.toLowerCase())} onClick={() => addEstimateItem(normalizedPartSearch)} type="button">
            <PackagePlus size={15} /> Add
          </button>
        </div>

        <div className="quick-part-chips">
          {popularEstimateQueries.map((query) => (
            <button disabled={selectedSet.has(query.toLowerCase())} key={query} onClick={() => addEstimateItem(query)} type="button">
              {query}
            </button>
          ))}
        </div>

        <div className="estimate-category-browser">
          {visibleCategories.map((category) => {
            const categoryParts = partsForCategory(category);
            const selectedCount = categoryParts.filter((part) => selectedSet.has(part.toLowerCase())).length;
            return (
              <details className="service-category estimate-parts-category" key={category.label} open={selectedCount > 0}>
                <summary>
                  <strong>{category.label}</strong>
                  <span>{selectedCount}/{categoryParts.length} picked</span>
                </summary>
                {category.groups ? category.groups.map((group) => {
                  const groupPicked = group.parts.filter((part) => selectedSet.has(part.toLowerCase())).length;
                  return (
                    <details className="estimate-part-group requested-service-subgroup" key={group.label} open={groupPicked > 0}>
                      <summary>
                        <strong>{group.label}</strong>
                        <span>{groupPicked ? `${groupPicked} picked of ` : ""}{group.parts.length} options</span>
                      </summary>
                      <div className="estimate-part-button-grid">
                        {group.parts.map((part) => <EstimatePartButton key={part} label={part} selected={selectedSet.has(part.toLowerCase())} onAdd={addEstimateItem} onRemove={removeEstimateItem} pricingSettings={pricingSettings} vehicleHint={vehicleHint} />)}
                      </div>
                    </details>
                  );
                }) : (
                  <div className="estimate-part-button-grid">
                    {(category.parts ?? []).map((part) => <EstimatePartButton key={part} label={part} selected={selectedSet.has(part.toLowerCase())} onAdd={addEstimateItem} onRemove={removeEstimateItem} pricingSettings={pricingSettings} vehicleHint={vehicleHint} />)}
                  </div>
                )}
              </details>
            );
          })}
        </div>

        <div className="estimate-live-summary">
          <div className="estimate-total-card">
            <span>{isStaff ? "Estimate at the chosen tiers" : "Your estimate"}</span>
            <strong>{selectedServices.length ? formatPriceRange(tieredTotal) : "Pick a service"}</strong>
            <small>
              {selectedServices.length
                ? isStaff
                  ? `${selectedServices.length} job(s), ${estimate.laborHours.toFixed(1)} labor hr at $${pricingSettings.shopLaborRate}/hr. Prices cover required parts and labor (plus the oil drain washer). Extras marked "add if needed" are not in the price - add them to the order before confirming with the customer.`
                  : "Pick Value, Recommended or Premium for each job below. Your final price is confirmed with you before the appointment, and anything extra we find is only added with your OK."
                : "Use the job list, quick chips, or the search box above."}
            </small>
          </div>
          {isStaff ? (
            <div className="estimate-total-breakdown">
              <div><span>Ibby labor</span><strong>{formatPriceRange(estimate.labor)}</strong></div>
              <div><span>Market comparison</span><strong>{formatPriceRange(estimate.marketTotal)}</strong></div>
              <div><span>Best distributor selected total</span><strong>{bestDistributorTotal ? formatPriceRange(bestDistributorTotal) : "Pending"}</strong></div>
            </div>
          ) : null}
        </div>

        {selectedServices.length ? (
          <div className="estimate-job-stack">
            {estimate.jobs.map((job) => (
              <article className="estimate-job-card" key={job.service}>
                <div className="estimate-job-head">
                  <div>
                    <strong>{job.label}</strong>
                    <span>{job.service}</span>
                  </div>
                  <button className="icon-button" aria-label={`Remove ${job.service}`} onClick={() => removeEstimateItem(job.service)} type="button"><X size={15} /></button>
                </div>
                <TierChoice
                  tiers={estimateServiceTiers(job.service, pricingSettings, vehicleHint)}
                  chosen={serviceTiers[job.service] ?? "mid"}
                  onChoose={(tier) => onTierChange?.(job.service, tier)}
                  showDetail={isStaff}
                />
                {isStaff ? <>
                <div className="retailer-result-stack">
                  {(retailerResultsByService[job.service] ?? []).map((retailer, retailerIndex) => {
                    const serviceChoiceKey = job.service;
                    const serviceChosen = selectedSupplierChoices[serviceChoiceKey] === retailer.name;
                    return (
                      <details className="retailer-result-row" key={`${job.service}-${retailer.name}`} style={{ "--retailer": retailer.color } as CSSProperties} open={serviceChosen || retailerIndex === 0}>
                        <summary>
                          <div className="retailer-main">
                            <span className="retailer-dot" />
                            <div>
                              <strong>{retailer.name}</strong>
                              <small>{retailer.type} - {retailer.parts.length} part lookup(s)</small>
                            </div>
                          </div>
                          <div className="retailer-total"><strong>{formatPriceRange(retailer.selectedTotal)}</strong><small>selected total</small></div>
                        </summary>
                        <div className="retailer-detail-grid">
                          <div className="retailer-part-links">
                            {retailer.parts.map((part) => {
                              const partChoiceKey = `${job.service}::${part.name}`;
                              const partChosen = selectedSupplierChoices[partChoiceKey] === retailer.name;
                              return (
                                <a className={part.status} href={part.url} key={`${retailer.name}-${part.name}`} rel="noreferrer" target="_blank">
                                  <span>{part.qty > 1 ? `${part.qty}x ` : ""}{part.name}<em>{part.status === "possible" ? "not sure" : "selected"}</em></span>
                                  <strong>{formatPriceRange(part.retailerPrice)}</strong>
                                  <button className={partChosen ? "mini-button primary-mini" : "mini-button"} onClick={(event) => { event.preventDefault(); onSupplierChoiceChange?.(partChoiceKey, retailer.name); }} type="button">{partChosen ? "Chosen" : "Use"}</button>
                                </a>
                              );
                            })}
                          </div>
                          <div className="retailer-price-cell">
                            <span>Shipping / pickup</span><strong>{formatPriceRange(retailer.shipping)}</strong>
                            <span>Not sure parts</span><strong>{formatPriceRange(retailer.possibleParts)}</strong>
                            <span>Market compare</span><strong>{formatPriceRange(retailer.marketTotal)}</strong>
                            <a className="open-button" href={retailer.url} rel="noreferrer" target="_blank">Open job search <ExternalLink size={13} /></a>
                            <button className={serviceChosen ? "primary-button" : "secondary-button"} onClick={() => onSupplierChoiceChange?.(serviceChoiceKey, retailer.name)} type="button">{serviceChosen ? "Distributor selected" : "Use this distributor for service"}</button>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                </div>
                {vehicleContext ? (
                  <div className="dealer-parts-row">
                    <span>Dealer-only or OEM part?</span>
                    {dealerCandidates(job.service, vehicleContext).map((dealer) => (
                      <a className="secondary-button" href={dealer.url} key={dealer.name} rel="noreferrer" target={dealer.url.startsWith("tel:") ? undefined : "_blank"} title={dealer.priceNote}>
                        {dealer.url.startsWith("tel:") ? <Phone size={13} /> : <ExternalLink size={13} />} {dealer.name}{dealer.url.startsWith("tel:") ? ` ${dealer.url.replace("tel:+1", "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}` : ""}
                      </a>
                    ))}
                  </div>
                ) : null}
                </> : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

// Three price choices for one job. Staff also see what the chosen tier is made of.
function TierChoice({ tiers, chosen, onChoose, showDetail }: { tiers: Record<PartTier, TierEstimate>; chosen: PartTier; onChoose: (tier: PartTier) => void; showDetail: boolean }) {
  const flat = partTiers.every((tier) => tiers[tier].total.min === tiers.low.total.min && tiers[tier].total.max === tiers.low.total.max);
  const detail = tiers[flat ? "low" : chosen];
  return (
    <div className="tier-choice">
      {flat ? (
        <div className="tier-card selected"><strong>Price</strong><b>{formatPriceRange(tiers.low.total)}</b><small>Same price whichever parts tier you choose.</small></div>
      ) : (
        <div className="tier-card-grid" role="radiogroup" aria-label="Choose a price tier">
          {partTiers.map((tier) => (
            <button className={tier === chosen ? "tier-card selected" : "tier-card"} key={tier} onClick={() => onChoose(tier)} role="radio" aria-checked={tier === chosen} type="button">
              <strong>{tiers[tier].label}</strong>
              <b>{formatPriceRange(tiers[tier].total)}</b>
              <small>{tiers[tier].description}</small>
            </button>
          ))}
        </div>
      )}
      {showDetail ? (
        <div className="estimate-part-lines">
          {detail.lines.map((line) => (
            <div className={line.optional || line.separate ? "possible" : "selected"} key={line.name}>
              <span>
                {line.qtyMin > 1 && line.qtyMin === line.qtyMax ? `${line.qtyMin}x ` : ""}{line.name}
                <em>{line.separate ? "add if needed - not in price" : line.optional ? "removable if not used" : "required"}</em>
                {line.note ? <small> {line.note}</small> : null}
              </span>
              <strong>{formatPriceRange(line.price)}</strong>
            </div>
          ))}
          <div className="selected"><span>Labor ({detail.laborHours} hr)<em>required</em></span><strong>{formatPriceRange(detail.labor)}</strong></div>
        </div>
      ) : null}
    </div>
  );
}

// Value-low to Premium-high, the same tier math the job cards use.
function tierSpan(service: string, pricingSettings: PricingSettings, vehicleHint?: VehicleHint) {
  const tiers = estimateServiceTiers(service, pricingSettings, vehicleHint);
  return formatPriceRange({ min: tiers.low.total.min, max: tiers.high.total.max });
}

function RequestedServiceOption({ serviceName, selected, onToggleService, pricingSettings, vehicleHint }: { serviceName: string; selected: boolean; onToggleService: (serviceName: string, checked: boolean) => void; pricingSettings: PricingSettings; vehicleHint?: VehicleHint }) {
  const serviceEstimate = estimateServiceParts(serviceName, pricingSettings);
  return (
    <label className={selected ? "selected" : ""}>
      <input checked={selected} onChange={(event) => onToggleService(serviceName, event.target.checked)} type="checkbox" />
      <div>
        <strong>{serviceName}</strong>
        <span>{serviceEstimate.label}</span>
        <small>{tierSpan(serviceName, pricingSettings, vehicleHint)} depending on parts tier</small>
      </div>
    </label>
  );
}

function EstimatePartButton({ label, selected, onAdd, onRemove, pricingSettings, vehicleHint }: { label: string; selected: boolean; onAdd: (label: string) => void; onRemove: (label: string) => void; pricingSettings: PricingSettings; vehicleHint?: VehicleHint }) {
  const qty = quantityForCategoryPart(label);
  return (
    <button className={selected ? "selected" : ""} onClick={() => selected ? onRemove(label) : onAdd(label)} type="button">
      <span>{qty > 1 ? `${label} (${qty}x)` : label}</span>
      <small>{tierSpan(label, pricingSettings, vehicleHint)} installed</small>
    </button>
  );
}
