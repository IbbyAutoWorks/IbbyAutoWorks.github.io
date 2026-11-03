"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { readPrototypeWorkOrders, WORK_ORDERS_EVENT, type PrototypeWorkOrder } from "@/lib/local-store";

// Staff search across the shared board: customer, phone, vehicle, VIN, plate, service, or id.
export function WorkOrderSearch({ basePath }: { basePath: "/admin" | "/service" }) {
  const [orders, setOrders] = useState<PrototypeWorkOrder[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sync = () => setOrders(readPrototypeWorkOrders());
    sync();
    window.addEventListener(WORK_ORDERS_EVENT, sync);
    const close = (event: MouseEvent) => { if (!box.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => {
      window.removeEventListener(WORK_ORDERS_EVENT, sync);
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return orders
      .filter((order) => [order.id, order.customer, order.phone, order.email, order.vehicle, order.vin, order.plate, order.service, ...(order.services ?? [])].join(" ").toLowerCase().includes(needle))
      .slice(0, 8);
  }, [orders, query]);

  return (
    <div className="search-box work-order-search" ref={box}>
      <Search size={16} />
      <input
        aria-label="Search work orders"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search jobs, VINs, customers"
      />
      {open && query.trim().length >= 2 ? (
        <div className="work-order-search-results" role="listbox">
          {results.map((order) => (
            <a href={`${basePath}?order=${encodeURIComponent(order.id)}`} key={order.id} role="option" aria-selected="false">
              <strong>{order.customer}</strong>
              <span>#{order.id} - {order.vehicle} - {order.status}</span>
            </a>
          ))}
          {!results.length ? <span className="work-order-search-empty">No jobs match &quot;{query.trim()}&quot;</span> : null}
        </div>
      ) : null}
    </div>
  );
}
