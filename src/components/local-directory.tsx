"use client";

import { MapPin, Phone, Store } from "lucide-react";

import { dealersForMake, directoryCheckedOn, localDealers, localPartsStores, telLink } from "@/lib/local-directory";

function mapLink(address: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
}

// Lewiston-Auburn parts stores and dealer parts desks, the job's make first.
export function LocalDirectoryPanel({ make = "" }: { make?: string }) {
  const matching = dealersForMake(make);
  const others = localDealers.filter((dealer) => !matching.includes(dealer));
  return (
    <details className="panel local-directory">
      <summary className="panel-title">
        <div>
          <p className="section-label">Lewiston-Auburn</p>
          <h2>Parts stores and dealer parts desks</h2>
        </div>
        <Store />
      </summary>
      {make && !matching.length ? <p className="legal-note">No {make} dealer in L-A on file. <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${make} dealer parts near Lewiston ME`)}`} target="_blank" rel="noopener noreferrer">Find the nearest {make} parts desk</a>.</p> : null}
      <div className="directory-grid">
        {[...matching, ...others].map((dealer) => (
          <div className={matching.includes(dealer) ? "directory-card highlighted" : "directory-card"} key={dealer.name}>
            <strong>{dealer.name}</strong>
            <small>{dealer.brands.join(", ")}</small>
            <a href={telLink(dealer.phone)}><Phone size={13} /> {dealer.phone} <small>({dealer.phoneLabel})</small></a>
            <a href={mapLink(dealer.address)} target="_blank" rel="noopener noreferrer"><MapPin size={13} /> {dealer.address}</a>
            {dealer.note ? <small className="dtc-warning">{dealer.note}</small> : null}
          </div>
        ))}
      </div>
      <p className="section-label">Parts stores</p>
      <div className="directory-grid">
        {localPartsStores.map((store) => (
          <div className="directory-card" key={store.name}>
            <strong>{store.name}</strong>
            <a href={telLink(store.phone)}><Phone size={13} /> {store.phone}</a>
            <a href={mapLink(store.address)} target="_blank" rel="noopener noreferrer"><MapPin size={13} /> {store.address}</a>
            <a href={store.website} target="_blank" rel="noopener noreferrer">Store page</a>
          </div>
        ))}
      </div>
      <p className="legal-note">Numbers checked against each business&apos;s own site in {directoryCheckedOn}. Tap a number to call.</p>
    </details>
  );
}
