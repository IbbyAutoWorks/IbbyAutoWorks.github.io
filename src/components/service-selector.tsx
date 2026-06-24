"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Calculator, ChevronDown, ExternalLink, PackagePlus, Search, X } from "lucide-react";

import { buildRetailerEstimateResults, estimatePartCategories, estimateServiceParts, estimateServices, formatPriceRange, popularEstimateQueries } from "@/lib/parts";


type ServiceSelectorProps = {
  selectedServices: string[];
  onToggleService: (serviceName: string, checked: boolean) => void;
  compact?: boolean;
  selectedSupplierChoices?: Record<string, string>;
  onSupplierChoiceChange?: (choiceKey: string, supplierName: string) => void;
};

function partsForCategory(category: (typeof estimatePartCategories)[number]) {
  return [
    ...(category.parts ?? []),
    ...(category.groups ?? []).flatMap((group) => group.parts)
  ];
}

export function ServiceSelector({ selectedServices, onToggleService, compact = false, selectedSupplierChoices = {}, onSupplierChoiceChange }: ServiceSelectorProps) {
  const [partSearch, setPartSearch] = useState("");
  const estimate = useMemo(() => estimateServices(selectedServices), [selectedServices]);
  const selectedSet = useMemo(() => new Set(selectedServices.map((service) => service.toLowerCase())), [selectedServices]);
  const normalizedPartSearch = partSearch.trim();
  const visibleCategories = compact ? estimatePartCategories.slice(0, 8) : estimatePartCategories;

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
          <span>{selectedServices.length} requested service{selectedServices.length === 1 ? "" : "s"} selected</span>
          <small>Click to expand IAW service categories</small>
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
                      {group.parts.map((service) => <RequestedServiceOption key={service} serviceName={service} selected={selectedSet.has(service.toLowerCase())} onToggleService={onToggleService} />)}
                    </div>
                  </details>
                )) : (
                  <div className="service-option-list">
                    {(category.parts ?? []).map((service) => <RequestedServiceOption key={service} serviceName={service} selected={selectedSet.has(service.toLowerCase())} onToggleService={onToggleService} />)}
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
            <p className="section-label">IAW estimate builder</p>
            <h2>Pick IAW categories, compare distributors, then flow the choice into this Ibby request.</h2>
          </div>
          <Calculator />
        </div>
        <p className="legal-note">These are draft customer planning numbers from the standalone IAW parts finder flow. Open each distributor for live fitment, images, stock, and exact local price before ordering.</p>

        <div className="part-search-row">
          <Search size={16} />
          <input value={partSearch} onChange={(event) => setPartSearch(event.target.value)} placeholder="Add a part or job: rear struts, wipers, alternator, exhaust leak..." />
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
                {category.groups ? category.groups.map((group) => (
                  <div className="estimate-part-group" key={group.label}>
                    <strong>{group.label}</strong>
                    <div className="estimate-part-button-grid">
                      {group.parts.map((part) => <EstimatePartButton key={part} label={part} selected={selectedSet.has(part.toLowerCase())} onAdd={addEstimateItem} onRemove={removeEstimateItem} />)}
                    </div>
                  </div>
                )) : (
                  <div className="estimate-part-button-grid">
                    {(category.parts ?? []).map((part) => <EstimatePartButton key={part} label={part} selected={selectedSet.has(part.toLowerCase())} onAdd={addEstimateItem} onRemove={removeEstimateItem} />)}
                  </div>
                )}
              </details>
            );
          })}
        </div>

        <div className="estimate-live-summary">
          <div className="estimate-total-card">
            <span>Customer-visible draft estimate</span>
            <strong>{selectedServices.length ? formatPriceRange(estimate.total) : "Pick a service"}</strong>
            <small>{selectedServices.length ? `${estimate.jobs.length} job(s), ${estimate.parts.length} part line(s), ${estimate.laborHours.toFixed(1)} labor hr. Max includes possible add-ons` : "Use the collapsed requested-services list, quick chips, category browser, or manual part box."}</small>
          </div>
          <div className="estimate-total-breakdown">
            <div><span>Selected parts</span><strong>{formatPriceRange(estimate.selectedParts)}</strong></div>
            <div><span>Possible add-ons included in max</span><strong>{formatPriceRange(estimate.possibleParts)}</strong></div>
            <div><span>Ibby labor</span><strong>{formatPriceRange(estimate.labor)}</strong></div>
            <div><span>Market comparison</span><strong>{formatPriceRange(estimate.marketTotal)}</strong></div>
          </div>
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
                <div className="estimate-job-totals">
                  <div><span>Job total</span><strong>{formatPriceRange(job.total)}</strong></div>
                  <div><span>Parts</span><strong>{formatPriceRange(job.selectedParts)}</strong></div>
                  <div><span>Labor</span><strong>{formatPriceRange(job.labor)}</strong></div>
                  <div><span>Not sure</span><strong>{formatPriceRange(job.possibleParts)}</strong></div>
                </div>
                <div className="estimate-part-lines">
                  {job.parts.map((part) => (
                    <div className={part.status === "possible" ? "possible" : "selected"} key={`${job.service}-${part.name}`}>
                      <span>{part.qty > 1 ? `${part.qty}x ` : ""}{part.name}<em>{part.status === "possible" ? "not sure / included in max" : "selected"}</em></span>
                      <strong>{formatPriceRange(part.totalPrice)}</strong>
                    </div>
                  ))}
                </div>
                <div className="retailer-result-stack">
                  {buildRetailerEstimateResults(job.service).map((retailer, retailerIndex) => {
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
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function RequestedServiceOption({ serviceName, selected, onToggleService }: { serviceName: string; selected: boolean; onToggleService: (serviceName: string, checked: boolean) => void }) {
  const serviceEstimate = estimateServiceParts(serviceName);
  return (
    <label className={selected ? "selected" : ""}>
      <input checked={selected} onChange={(event) => onToggleService(serviceName, event.target.checked)} type="checkbox" />
      <div>
        <strong>{serviceName}</strong>
        <span>{serviceEstimate.label}</span>
        <small>{formatPriceRange(serviceEstimate.total)} draft range - {serviceEstimate.parts.length} parts - {serviceEstimate.laborHours} labor hr</small>
      </div>
    </label>
  );
}

function EstimatePartButton({ label, selected, onAdd, onRemove }: { label: string; selected: boolean; onAdd: (label: string) => void; onRemove: (label: string) => void }) {
  const estimate = estimateServiceParts(label);
  return (
    <button className={selected ? "selected" : ""} onClick={() => selected ? onRemove(label) : onAdd(label)} type="button">
      <span>{label}</span>
      <small>{formatPriceRange(estimate.total)}</small>
    </button>
  );
}
