"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown, PackagePlus, Search, X } from "lucide-react";

import { serviceCategories, serviceOptions } from "@/lib/data";
import { buildPartSupplierCandidates, estimatePartCategories, estimateServiceParts, estimateServices, formatPriceRange, popularEstimateQueries } from "@/lib/parts";


type ServiceSelectorProps = {
  selectedServices: string[];
  onToggleService: (serviceName: string, checked: boolean) => void;
  compact?: boolean;
};

export function ServiceSelector({ selectedServices, onToggleService, compact = false }: ServiceSelectorProps) {
  const [partSearch, setPartSearch] = useState("");
  const estimate = useMemo(() => estimateServices(selectedServices), [selectedServices]);
  const selectedSet = useMemo(() => new Set(selectedServices.map((service) => service.toLowerCase())), [selectedServices]);
  const normalizedPartSearch = partSearch.trim();
  const visibleCategories = compact ? estimatePartCategories.slice(0, 6) : estimatePartCategories;

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
      <details open>
        <summary>
          <span>{selectedServices.length} service{selectedServices.length === 1 ? "" : "s"} selected</span>
          <ChevronDown size={16} />
        </summary>
        <div className="service-category-list">
          {serviceCategories.map((category, index) => {
            const services = serviceOptions.filter((service) => service.category === category);
            const selectedCount = services.filter((service) => selectedServices.includes(service.name)).length;
            return (
              <details className="service-category" key={category} open={!compact && index < 3}>
                <summary>
                  <strong>{category}</strong>
                  <span>{selectedCount}/{services.length} selected</span>
                </summary>
                <div className="service-option-list">
                  {services.map((service) => {
                    const serviceEstimate = estimateServiceParts(service.name);
                    return (
                      <label className={selectedServices.includes(service.name) ? "selected" : ""} key={service.name}>
                        <input checked={selectedServices.includes(service.name)} onChange={(event) => onToggleService(service.name, event.target.checked)} type="checkbox" />
                        <div>
                          <strong>{service.name}</strong>
                          <span>{service.subcategory} - {service.detail}</span>
                          <small>{formatPriceRange(serviceEstimate.total)} draft range - {serviceEstimate.parts.length} parts - {serviceEstimate.laborHours} labor hr</small>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </details>

      <section className="estimate-builder-panel">
        <div className="panel-title estimate-builder-title">
          <div>
            <p className="section-label">IAW estimate builder</p>
            <h2>Pick parts or job sections and watch the estimate add up.</h2>
          </div>
          <Calculator />
        </div>
        <p className="legal-note">These are draft customer planning numbers from the IAW parts finder logic. Final quotes still require live fitment, supplier price/stock, photos, and technician approval.</p>

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
          {visibleCategories.map((category, index) => {
            const categoryParts = [
              ...(category.parts ?? []),
              ...(category.groups ?? []).flatMap((group) => group.parts)
            ];
            const selectedCount = categoryParts.filter((part) => selectedSet.has(part.toLowerCase())).length;
            return (
              <details className="service-category estimate-parts-category" key={category.label} open={!compact && index < 4}>
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
            <small>{selectedServices.length ? `${estimate.jobs.length} job(s), ${estimate.parts.length} part line(s), ${estimate.laborHours.toFixed(1)} labor hr. Max includes possible add-ons` : "Use the service list, quick chips, category browser, or manual part box."}</small>
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
                <div className="estimate-supplier-strip">
                  {job.parts.slice(0, 4).flatMap((part) => buildPartSupplierCandidates(part.name).slice(0, 3).map((supplier) => (
                    <a href={supplier.url} key={`${job.service}-${part.name}-${supplier.name}`} rel="noreferrer" target="_blank">
                      <span>{supplier.name}</span>
                      <small>{part.name}</small>
                    </a>
                  )))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
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
