"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgePercent, BellRing, Gift, X } from "lucide-react";

import { listPromotionOffers, type ManagedPromotionOffer } from "@/lib/payment-backend";
import { effectivePrayerTime, readPrayerScheduleSettings, timeToMinutes, type PrayerBlock } from "@/lib/prayer-times";
import { MARKETING_SETTINGS_EVENT, readMarketingSettings, type MarketingSettings } from "@/lib/marketing-settings";

function formatOffer(offer?: ManagedPromotionOffer) {
  if (!offer) return "Active offer";
  if (offer.discount_cents > 0) return `$${(offer.discount_cents / 100).toFixed(0)} off`;
  if (offer.discount_percent > 0) return `${Number(offer.discount_percent).toFixed(0)}% off`;
  return "Special offer";
}

function minutesUntil(block: PrayerBlock, now = new Date()) {
  const current = now.getHours() * 60 + now.getMinutes();
  let target = timeToMinutes(effectivePrayerTime(block)) - block.reminderMinutes;
  if (target < current - 60) target += 1440;
  return target - current;
}

export function CustomerCouponPopup() {
  const [settings, setSettings] = useState<MarketingSettings>(() => readMarketingSettings());
  const [offers, setOffers] = useState<ManagedPromotionOffer[]>([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function sync() { setSettings(readMarketingSettings()); }
    sync();
    window.addEventListener(MARKETING_SETTINGS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MARKETING_SETTINGS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    listPromotionOffers().then((data) => setOffers(data.promotions.filter((offer) => offer.active))).catch(() => setOffers([]));
  }, []);

  useEffect(() => {
    if (!settings.couponPopupEnabled || dismissed) return;
    const showTimer = window.setTimeout(() => setVisible(true), settings.couponPopupDelaySeconds * 1000);
    const hideTimer = window.setTimeout(() => setVisible(false), (settings.couponPopupDelaySeconds + settings.couponPopupDurationSeconds) * 1000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [dismissed, settings]);

  const chosenOffer = useMemo(() => {
    const code = settings.couponPopupCode.trim().toLowerCase();
    return offers.find((offer) => offer.code?.toLowerCase() === code || offer.slug.toLowerCase() === code) ?? offers[0];
  }, [offers, settings.couponPopupCode]);

  if (!settings.couponPopupEnabled || !visible || dismissed) return null;

  return (
    <aside className="floating-coupon-popup" role="status" aria-live="polite">
      <button aria-label="Dismiss offer" className="coupon-popup-close" onClick={() => { setDismissed(true); setVisible(false); }}><X size={14} /></button>
      <span><BadgePercent size={14} /> {formatOffer(chosenOffer)}</span>
      <strong>{chosenOffer?.title || settings.couponPopupTitle}</strong>
      <p>{chosenOffer?.summary || settings.couponPopupMessage}</p>
      <small>Code: {chosenOffer?.code || settings.couponPopupCode}</small>
      <Link href="/request"><Gift size={14} /> Claim on request</Link>
    </aside>
  );
}

export function AdminPrayerReminder() {
  const [settings, setSettings] = useState(() => readPrayerScheduleSettings());
  const [ackUntil, setAckUntil] = useState(0);

  useEffect(() => {
    function sync() { setSettings(readPrayerScheduleSettings()); }
    sync();
    const interval = window.setInterval(sync, 60000);
    window.addEventListener("ibbys-auto.prayer-settings.changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("ibbys-auto.prayer-settings.changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const nextBlock = useMemo(() => {
    if (!settings.enabled) return null;
    return settings.blocks
      .filter((block) => block.enabled)
      .map((block) => ({ block, until: minutesUntil(block) }))
      .filter((item) => item.until >= 0 && item.until <= Math.max(item.block.reminderMinutes, 15))
      .sort((a, b) => a.until - b.until)[0] ?? null;
  }, [settings]);

  if (!nextBlock || Date.now() < ackUntil) return null;

  return (
    <aside className="admin-prayer-reminder" role="status" aria-live="polite">
      <BellRing size={18} />
      <div>
        <strong>{nextBlock.block.name} reminder</strong>
        <span>{Math.max(0, nextBlock.until)} min until reminder window. Prayer block starts at {effectivePrayerTime(nextBlock.block)}.</span>
      </div>
      <button onClick={() => setAckUntil(Date.now() + 10 * 60 * 1000)}>Push +10 min</button>
    </aside>
  );
}
