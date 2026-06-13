"use client";

import { ChevronDown } from "lucide-react";

import { serviceCategories, serviceOptions } from "@/lib/data";

type Tier = "low" | "mid" | "high";

type ServiceSelectorProps = {
  selectedServices: string[];
  selectedTier: Tier;
  onToggleService: (serviceName: string, checked: boolean) => void;
  compact?: boolean;
};

export function ServiceSelector({ selectedServices, selectedTier, onToggleService, compact = false }: ServiceSelectorProps) {
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
                  {services.map((service) => (
                    <label className={selectedServices.includes(service.name) ? "selected" : ""} key={service.name}>
                      <input checked={selectedServices.includes(service.name)} onChange={(event) => onToggleService(service.name, event.target.checked)} type="checkbox" />
                      <div>
                        <strong>{service.name}</strong>
                        <span>{service.subcategory} - {service.detail}</span>
                        <small>{service[selectedTier]} starting estimate</small>
                      </div>
                    </label>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </details>
    </div>
  );
}
