"use client";

import { useEffect, useState } from "react";
import { BadgePercent, Gift } from "lucide-react";

import { couponShowsIn, MARKETING_SETTINGS_EVENT, readMarketingSettings, type MarketingSettings } from "@/lib/marketing-settings";
import { listPromotionOffers, type ManagedPromotionOffer } from "@/lib/payment-backend";

function formatOffer(offer: ManagedPromotionOffer) {
  if (offer.discount_cents > 0) return `$${(offer.discount_cents / 100).toFixed(0)} off`;
  if (offer.discount_percent > 0) return `${Number(offer.discount_percent).toFixed(0)}% off`;
  return "special";
}

export function CustomerPromoOffers({ place }: { place: "request" | "account" }) {
  const [offers, setOffers] = useState<ManagedPromotionOffer[]>([]);
  const [settings, setSettings] = useState<MarketingSettings>(() => readMarketingSettings());

  useEffect(() => {
    listPromotionOffers().then((data) => setOffers(data.promotions.filter((offer) => offer.active))).catch(() => setOffers([]));
    const sync = () => setSettings(readMarketingSettings());
    window.addEventListener(MARKETING_SETTINGS_EVENT, sync);
    return () => window.removeEventListener(MARKETING_SETTINGS_EVENT, sync);
  }, []);

  if (!offers.length || !couponShowsIn(settings, place)) return null;

  return (
    <div className="panel promo-offers-panel">
      <div className="panel-title">
        <div>
          <p className="section-label">Coupons and promos</p>
          <h2>Ask about active Ibby Auto Works offers before checkout.</h2>
        </div>
        <Gift />
      </div>
      <div className="promo-offer-grid">
        {offers.map((offer) => (
          <article key={offer.slug}>
            <span><BadgePercent size={14} /> {formatOffer(offer)}</span>
            <strong>{offer.title}</strong>
            <p>{offer.summary}</p>
            <small>Code: {offer.code || offer.slug.toUpperCase()} - {offer.requires_purchase}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
