"use client";

import { useEffect, useState } from "react";
import { BadgePercent, Gift } from "lucide-react";

import { listPromotionOffers, type ManagedPromotionOffer } from "@/lib/payment-backend";

const fallbackOffers: ManagedPromotionOffer[] = [
  { slug: "free-pre-inspection", title: "Free pre-inspection", offer_type: "free_service", summary: "Free quick pre-inspection/visual check before a full estimate.", applies_to: "inspection", discount_cents: 0, discount_percent: 100, requires_purchase: "New service request or approved quote follow-up", code: "PRECHECK", active: true, taxable_note: "Free service; no taxable receipt when charged at $0." },
  { slug: "free-diagnostic-with-repair", title: "Free diagnostic with approved repair", offer_type: "bundle_bonus", summary: "Diagnostic charge waived when the customer approves the related repair.", applies_to: "diagnostic", discount_cents: 0, discount_percent: 100, requires_purchase: "Customer approves the related repair work", code: "DIAGFREE", active: true, taxable_note: "Discount applied before payment." },
  { slug: "discounted-oil-change", title: "Discounted oil change", offer_type: "discount_amount", summary: "$15 off a standard oil change service.", applies_to: "maintenance", discount_cents: 1500, discount_percent: 0, requires_purchase: "Standard oil change appointment", code: "OIL15", active: true, taxable_note: "Discount applied before payment." },
  { slug: "free-tire-rotation-with-set", title: "Free tire rotation with tire set", offer_type: "bundle_bonus", summary: "Free tire rotation with purchase of a full set of tires.", applies_to: "tires", discount_cents: 0, discount_percent: 100, requires_purchase: "Purchase of a set of four tires", code: "ROTATEFREE", active: true, taxable_note: "Track tire fees separately." }
];

function formatOffer(offer: ManagedPromotionOffer) {
  if (offer.discount_cents > 0) return `$${(offer.discount_cents / 100).toFixed(0)} off`;
  if (offer.discount_percent > 0) return `${Number(offer.discount_percent).toFixed(0)}% off`;
  return "special";
}

export function CustomerPromoOffers() {
  const [offers, setOffers] = useState<ManagedPromotionOffer[]>(fallbackOffers);

  useEffect(() => {
    listPromotionOffers().then((data) => {
      if (data.promotions.length) setOffers(data.promotions);
    }).catch(() => setOffers(fallbackOffers));
  }, []);

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
        {offers.filter((offer) => offer.active).map((offer) => (
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
