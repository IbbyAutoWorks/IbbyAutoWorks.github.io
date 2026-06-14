"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, LogIn, ShieldCheck, Star, UserPlus } from "lucide-react";

import { CUSTOMER_RECORDS_EVENT, readPrototypeCustomerRecords, type PrototypeCustomerRecord } from "@/lib/local-store";
import { SiteFooter } from "@/components/site-footer";

const fallbackReviews = [
  { name: "Local driver", review: "Clear updates, clean records, and the work order was easy to follow.", reviewRating: 5 },
  { name: "Fleet customer", review: "The mobile workflow makes scheduling service and tracking reports simple.", reviewRating: 5 },
  { name: "Ibby Auto Works™ customer", review: "Professional mobile service with the details saved for next time.", reviewRating: 5 }
];

export function CustomerPortal() {
  // Customer review state: pulls prototype customer records from browser storage.
  const [customers, setCustomers] = useState<PrototypeCustomerRecord[]>([]);

  useEffect(() => {
    function syncCustomers() {
      setCustomers(readPrototypeCustomerRecords());
    }

    syncCustomers();
    window.addEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
    window.addEventListener("storage", syncCustomers);
    return () => {
      window.removeEventListener(CUSTOMER_RECORDS_EVENT, syncCustomers);
      window.removeEventListener("storage", syncCustomers);
    };
  }, []);

  const reviews = useMemo(() => {
    const customerReviews = customers
      .filter((customer) => customer.review.trim())
      .map((customer) => ({ name: customer.name || "Customer", review: customer.review, reviewRating: customer.reviewRating || 5 }));
    return customerReviews.length ? customerReviews : fallbackReviews;
  }, [customers]);

  return (
    <main className="public-home">
      {/* Hero section: public landing copy and primary customer entry points. */}
      <section className="customer-hero public-hero">
        <div>
          <p className="section-label">Ibby Auto Works™</p>
          <h1>Mobile auto service requests, updates, and vehicle records without the runaround.</h1>
          <p>
            Start a one-time request, create an account for saved vehicles and reports, or sign in to view service history.
          </p>
          <div className="hero-actions">
            <Link href="/request" className="primary-button">Start request <ArrowRight size={17} /></Link>
            <Link href="/account" className="secondary-button"><LogIn size={16} /> Log in</Link>
            <Link href="/account" className="secondary-button"><UserPlus size={16} /> Sign up</Link>
          </div>
        </div>
        <div className="request-card">
          <div className="request-head">
            <span>Work request</span>
            <strong>#New</strong>
          </div>
          <div className="field-grid">
            <div><span>Guest</span><strong>One-time request</strong></div>
            <div><span>Account</span><strong>Saved vehicles</strong></div>
            <div><span>Updates</span><strong>Notify / en route</strong></div>
            <div><span>Records</span><strong>Reports and PDFs</strong></div>
          </div>
          <div className="upload-strip"><Camera size={16} /> Photos, symptoms, location, agreements, and appointment window</div>
        </div>
      </section>

      {/* Reviews section: saved customer reviews, with static fallbacks for a fresh browser. */}
      <section className="public-review-section">
        <div className="panel-title">
          <div>
            <p className="section-label">Customer reviews</p>
            <h2>Recent feedback</h2>
          </div>
          <ShieldCheck />
        </div>
        <div className="review-carousel">
          {reviews.slice(0, 6).map((review, index) => (
            <article className="review-card" key={`${review.name}-${index}`}>
              <div className="review-stars">
                {Array.from({ length: Math.min(review.reviewRating, 5) }).map((_, starIndex) => <Star fill="currentColor" key={starIndex} size={14} />)}
              </div>
              <p>{review.review}</p>
              <strong>{review.name}</strong>
            </article>
          ))}
        </div>
      </section>

<SiteFooter context="home" />
    </main>
  );
}
