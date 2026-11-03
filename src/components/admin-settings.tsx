"use client";

import { useEffect, useState } from "react";
import { BadgePercent, CalendarClock, ChevronDown, Clock3, Cloud, Crown, FileImage, FileText, MapPinned, Palette, RotateCcw, Save, SlidersHorizontal, Upload, Wrench, Bell } from "lucide-react";

import {
  CROWN_LOGO_SRC,
  EMBLEM_LOGO_SRC,
  BrandingSettings,
  defaultBrandingSettings,
  readSavedBranding,
  saveBranding
} from "@/lib/branding";
import { readSavedTheme, saveTheme, ThemeRoleColors } from "@/lib/theme";
import { readPricingSettings, savePricingSettings, type PricingSettings } from "@/lib/pricing-settings";
import { fetchPrayerTimesFromAladhan, prayerBlockLabel, readPrayerScheduleSettings, savePrayerScheduleSettings, type PrayerBlock, type PrayerScheduleSettings } from "@/lib/prayer-times";
import { isoDate, readScheduleSettings, saveScheduleSettings, SCHEDULE_DAYS, type ScheduleSettings } from "@/lib/schedule";
import { SHARED_SETTINGS_ERROR_EVENT } from "@/lib/shared-settings";
import { defaultMarketingSettings, readMarketingSettings, saveMarketingSettings, type MarketingSettings } from "@/lib/marketing-settings";
import { PaymentSettingsPanel } from "@/components/payment-settings";
import { PaymentPlanManager } from "@/components/payment-plan-manager";
import { CouponTaxManager } from "@/components/coupon-tax-manager";

const brandPalettes = [
  { name: "Ibby Red", colors: ["#b7192a", "#111418", "#ffffff", "#d6a11f"], note: "Default red, white, black, gold" },
  { name: "Garage Graphite", colors: ["#e63946", "#2b2d42", "#edf2f4", "#8d99ae"], note: "Sharp shop contrast" },
  { name: "Maine Coast", colors: ["#006d77", "#1d3557", "#f1faee", "#e9c46a"], note: "Blue-green coastal" },
  { name: "Performance Blue", colors: ["#1d4ed8", "#0f172a", "#f8fafc", "#f97316"], note: "Sport service feel" },
  { name: "Inspection Green", colors: ["#15803d", "#111827", "#f8fafc", "#facc15"], note: "Safety/checklist forward" },
  { name: "Premium Gold", colors: ["#c99700", "#171717", "#fffaf0", "#7f1d1d"], note: "Higher-end garage look" },
  { name: "Clean Slate", colors: ["#475569", "#0f172a", "#f8fafc", "#38bdf8"], note: "Neutral tech dashboard" },
  { name: "High Visibility", colors: ["#f97316", "#111827", "#fff7ed", "#16a34a"], note: "Field work visibility" }
];

const colorRoles = ["Primary buttons", "Sidebar", "Page background", "Accent icons"] as const;
const clockOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2) % 12 || 12;
  return `${hour}:${index % 2 ? "30" : "00"} ${index < 24 ? "AM" : "PM"}`;
});
const calendarMonths = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(new Date().getFullYear(), new Date().getMonth() + index, 1);
  return { label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }), year: date.getFullYear(), month: date.getMonth() };
});

export function AdminSettings() {
  // Brand settings: controls the browser icon, sidebar logo, and saved logo rotation.
  const [branding, setBranding] = useState<BrandingSettings>(defaultBrandingSettings());
  const [selectedPalette, setSelectedPalette] = useState(brandPalettes[0].name);
  const selectedPaletteColors = brandPalettes.find((palette) => palette.name === selectedPalette)?.colors ?? brandPalettes[0].colors;
  const [roleColors, setRoleColors] = useState<ThemeRoleColors>({
    "Primary buttons": brandPalettes[0].colors[0],
    Sidebar: brandPalettes[0].colors[1],
    "Page background": brandPalettes[0].colors[2],
    "Accent icons": brandPalettes[0].colors[3]
  });
  const [schedule, setSchedule] = useState<ScheduleSettings>(() => readScheduleSettings());
  const [calendarMonth, setCalendarMonth] = useState(calendarMonths[0].label);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() => readPricingSettings());
  const [prayerSettings, setPrayerSettings] = useState<PrayerScheduleSettings>(() => readPrayerScheduleSettings());
  const [marketingSettings, setMarketingSettings] = useState<MarketingSettings>(() => readMarketingSettings());
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    const onError = (event: Event) => setShareError((event as CustomEvent<{ message: string }>).detail.message);
    window.addEventListener(SHARED_SETTINGS_ERROR_EVENT, onError);
    return () => window.removeEventListener(SHARED_SETTINGS_ERROR_EVENT, onError);
  }, []);
  const [prayerFetchStatus, setPrayerFetchStatus] = useState("Prayer blocks are local until live calendar sync is connected.");

  useEffect(() => {
    const savedTheme = readSavedTheme();
    if (!savedTheme) return;
    setRoleColors(savedTheme);
    const matchingPalette = brandPalettes.find((palette) => palette.colors.every((color) => Object.values(savedTheme).includes(color)));
    if (matchingPalette) setSelectedPalette(matchingPalette.name);
  }, []);

  useEffect(() => {
    setBranding(readSavedBranding());
  }, []);

  useEffect(() => {
    setSchedule(readScheduleSettings());
    setPricingSettings(readPricingSettings());
    setPrayerSettings(readPrayerScheduleSettings());
    setMarketingSettings(readMarketingSettings());
  }, []);

  function updateMarketingSettings(nextSettings: MarketingSettings) {
    setMarketingSettings(nextSettings);
    saveMarketingSettings(nextSettings);
  }

  function updatePricingSetting(field: keyof PricingSettings, value: string) {
    const next = {
      ...pricingSettings,
      [field]: field === "defaultSearchArea" ? value : Number(value)
    } as PricingSettings;
    setPricingSettings(next);
    savePricingSettings(next);
  }

  function updatePrayerSettings(nextSettings: PrayerScheduleSettings) {
    setPrayerSettings(nextSettings);
    savePrayerScheduleSettings(nextSettings);
  }

  function updatePrayerBlock(index: number, field: keyof PrayerBlock, value: string | boolean) {
    const nextBlocks = prayerSettings.blocks.map((block, blockIndex) => blockIndex === index ? {
      ...block,
      [field]: typeof block[field] === "number" ? Number(value) : value
    } : block);
    updatePrayerSettings({ ...prayerSettings, blocks: nextBlocks });
  }

  function pushPrayerBlock(index: number, minutes: number) {
    const nextBlocks = prayerSettings.blocks.map((block, blockIndex) => blockIndex === index ? { ...block, oneTimePushMinutes: minutes } : block);
    updatePrayerSettings({ ...prayerSettings, blocks: nextBlocks });
  }

  async function syncPrayerTimes() {
    setPrayerFetchStatus("Fetching prayer times from Aladhan...");
    try {
      const next = await fetchPrayerTimesFromAladhan(prayerSettings);
      setPrayerSettings(next);
      setPrayerFetchStatus(`Fetched prayer times for ${next.city}, ${next.state}. Review before relying on blocks.`);
    } catch (error) {
      setPrayerFetchStatus(`${error instanceof Error ? error.message : "Prayer time lookup failed."} Manual times are still editable.`);
    }
  }

  function updateBranding(nextBranding: BrandingSettings) {
    setBranding(nextBranding);
    saveBranding(nextBranding);
  }

  function uploadLogo(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      const logo = {
        id: `logo-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, "") || "Uploaded logo",
        src,
        savedAt: new Date().toISOString()
      };
      updateBranding({
        ...branding,
        logoSource: "custom",
        customLogoId: logo.id,
        savedLogos: [logo, ...branding.savedLogos]
      });
    });
    reader.readAsDataURL(file);
  }

  function selectPalette(name: string) {
    const palette = brandPalettes.find((item) => item.name === name) ?? brandPalettes[0];
    const nextColors: ThemeRoleColors = {
      "Primary buttons": palette.colors[0],
      Sidebar: palette.colors[1],
      "Page background": palette.colors[2],
      "Accent icons": palette.colors[3]
    };
    setSelectedPalette(palette.name);
    setRoleColors(nextColors);
    saveTheme(nextColors);
  }

  function updateRoleColor(role: keyof ThemeRoleColors, color: string) {
    const nextColors = { ...roleColors, [role]: color };
    setRoleColors(nextColors);
    saveTheme(nextColors);
  }

  function updateSchedule(patch: Partial<ScheduleSettings>) {
    const next = { ...schedule, ...patch };
    setSchedule(next);
    saveScheduleSettings(next);
  }

  function toggleDay(day: string) {
    updateSchedule({ workDays: schedule.workDays.includes(day) ? schedule.workDays.filter((item) => item !== day) : [...schedule.workDays, day] });
  }

  function toggleBlockedDate(iso: string) {
    updateSchedule({ blockedDates: schedule.blockedDates.includes(iso) ? schedule.blockedDates.filter((item) => item !== iso) : [...schedule.blockedDates, iso] });
  }

  const shownMonth = calendarMonths.find((month) => month.label === calendarMonth) ?? calendarMonths[0];
  const blockedCalendarDays = Array.from({ length: new Date(shownMonth.year, shownMonth.month + 1, 0).getDate() }, (_, index) => ({
    day: index + 1,
    iso: isoDate(new Date(shownMonth.year, shownMonth.month, index + 1))
  }));

  return (
    <div className="settings-workspace">
      <section className="admin-header">
        <div>
          <p className="section-label">Configurable admin workspace</p>
          <h1>Settings</h1>
        </div>
      </section>

      <section className="settings-stack">
        {shareError ? <p className="legal-note" role="alert">A change saved on this device only and didn't reach customers: {shareError}</p> : null}
        <details className="panel settings-accordion">
          <summary><span><BadgePercent size={16} /> Coupon list and Maine sales tax</span><ChevronDown size={16} /></summary>
          <CouponTaxManager />
        </details>
        <details className="panel settings-accordion">
          <summary><span><Wrench size={16} /> Payment plans</span><ChevronDown size={16} /></summary>
          <PaymentPlanManager />
        </details>
        <PaymentSettingsPanel />

        <details className="panel settings-accordion">
          <summary><span><BadgePercent size={16} /> Coupons: on or off, when and where</span><ChevronDown size={16} /></summary>
          <div className="settings-fields marketing-settings-fields">
            <label className="toggle-row wide-field"><input type="checkbox" checked={marketingSettings.couponsEnabled} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponsEnabled: event.target.checked })} /><span><strong>Show coupons to customers</strong> (turning this off hides them everywhere)</span></label>
            <label><span>Start showing on</span><input type="date" value={marketingSettings.couponStartDate} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponStartDate: event.target.value })} /></label>
            <label><span>Stop showing after</span><input type="date" value={marketingSettings.couponEndDate} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponEndDate: event.target.value })} /></label>
            {([
              ["couponPopupEnabled", "In the app: pop-up on the home page"],
              ["couponOnRequestPage", "In the app: on the request page"],
              ["couponOnAccountPage", "In the app: on the customer's account page"],
              ["couponInEmail", "In emails to customers"],
              ["couponInText", "In text messages to customers"],
              ["couponWithConfirmation", "Messages: with appointment confirmations"],
              ["couponWithReminder", "Messages: with appointment reminders"],
              ["couponWithNextService", "Messages: with next-service reminders"]
            ] as const).map(([key, label]) => (
              <label className="toggle-row" key={key}><input type="checkbox" disabled={!marketingSettings.couponsEnabled} checked={marketingSettings[key]} onChange={(event) => updateMarketingSettings({ ...marketingSettings, [key]: event.target.checked })} /><span>{label}</span></label>
            ))}
            <p className="legal-note wide-field">Leave the dates empty to show coupons all the time. Which coupons exist and their codes are set under Coupon list and Maine sales tax. Only text coupons to customers who agreed to promotional texts.</p>
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><BadgePercent size={16} /> Pop-up details, reviews, and homepage widget</span><ChevronDown size={16} /></summary>
          <div className="settings-fields marketing-settings-fields">
            <label><span>Popup delay seconds</span><input type="number" min="0" max="120" value={marketingSettings.couponPopupDelaySeconds} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupDelaySeconds: Number(event.target.value || 0) })} /></label>
            <label><span>Popup visible seconds</span><input type="number" min="5" max="120" value={marketingSettings.couponPopupDurationSeconds} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupDurationSeconds: Number(event.target.value || 5) })} /></label>
            <label><span>Coupon code or slug</span><input value={marketingSettings.couponPopupCode} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupCode: event.target.value.toUpperCase() })} /></label>
            <label><span>Fallback title</span><input value={marketingSettings.couponPopupTitle} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupTitle: event.target.value })} /></label>
            <label className="wide-field"><span>Fallback popup message</span><textarea value={marketingSettings.couponPopupMessage} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupMessage: event.target.value })} /></label>
            <label><span>Review carousel</span><select value={marketingSettings.reviewCarouselEnabled ? "on" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, reviewCarouselEnabled: event.target.value === "on" })}><option value="on">On</option><option value="off">Off</option></select></label>
            <label><span>Review cards visible</span><input type="number" min="1" max="6" value={marketingSettings.reviewCardsVisible} onChange={(event) => updateMarketingSettings({ ...marketingSettings, reviewCardsVisible: Number(event.target.value || 3) })} /></label>
            <label><span>Homepage widget</span><select value={marketingSettings.homepageWidgetEnabled ? "on" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, homepageWidgetEnabled: event.target.value === "on" })}><option value="on">On</option><option value="off">Off</option></select></label>
            <label><span>Widget title</span><input value={marketingSettings.homepageWidgetTitle} onChange={(event) => updateMarketingSettings({ ...marketingSettings, homepageWidgetTitle: event.target.value })} /></label>
            <label className="wide-field"><span>Widget message</span><textarea value={marketingSettings.homepageWidgetMessage} onChange={(event) => updateMarketingSettings({ ...marketingSettings, homepageWidgetMessage: event.target.value })} /></label>
            <label><span>Widget CTA</span><input value={marketingSettings.homepageWidgetCta} onChange={(event) => updateMarketingSettings({ ...marketingSettings, homepageWidgetCta: event.target.value })} /></label>
            <button className="secondary-button" onClick={() => updateMarketingSettings(defaultMarketingSettings())} type="button"><RotateCcw size={15} /> Reset marketing widgets</button>
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><Crown size={16} /> Logo and browser icon</span><ChevronDown size={16} /></summary>
          <div className="branding-settings-grid">
            <div className="brand-preview-card">
              <span>URL icon</span>
              <div className="favicon-preview">
                <div className={branding.faviconCrownColor === "black" ? "favicon-crown black" : "favicon-crown white"}>
                  <Crown size={22} />
                </div>
                <strong>Red icon with {branding.faviconCrownColor} crown</strong>
              </div>
              <div className="segmented-control">
                <button className={branding.faviconCrownColor === "white" ? "selected" : ""} onClick={() => updateBranding({ ...branding, faviconCrownColor: "white" })}>White</button>
                <button className={branding.faviconCrownColor === "black" ? "selected" : ""} onClick={() => updateBranding({ ...branding, faviconCrownColor: "black" })}>Black</button>
              </div>
            </div>

            <div className="brand-preview-card">
              <span>App logo</span>
              <div className="logo-preview-ring">
                <img src={branding.logoSource === "crown" ? CROWN_LOGO_SRC : branding.savedLogos.find((logo) => logo.id === branding.customLogoId)?.src ?? EMBLEM_LOGO_SRC} alt="" />
              </div>
              <div className="logo-choice-grid">
                <button className={branding.logoSource === "emblem" ? "selected" : ""} onClick={() => updateBranding({ ...branding, logoSource: "emblem", customLogoId: "" })}>
                  <img src={EMBLEM_LOGO_SRC} alt="" />
                  <span>Current emblem</span>
                </button>
                <button className={branding.logoSource === "crown" ? "selected" : ""} onClick={() => updateBranding({ ...branding, logoSource: "crown", customLogoId: "" })}>
                  <img src={CROWN_LOGO_SRC} alt="" />
                  <span>Original crown</span>
                </button>
              </div>
            </div>

            <div className="brand-preview-card brand-upload-card">
              <span>Upload logo</span>
              <label className="file-upload-button">
                <Upload size={15} />
                Upload image
                <input type="file" accept="image/*" onChange={(event) => uploadLogo(event.target.files?.[0] ?? null)} />
              </label>
              <small>Uploaded images are saved so you can switch back later.</small>
            </div>

            <div className="brand-preview-card saved-logo-card">
              <span>Saved logo rotation</span>
              {branding.savedLogos.length ? (
                <div className="saved-logo-grid">
                  {branding.savedLogos.map((logo) => (
                    <button className={branding.logoSource === "custom" && branding.customLogoId === logo.id ? "selected" : ""} key={logo.id} onClick={() => updateBranding({ ...branding, logoSource: "custom", customLogoId: logo.id })}>
                      <img src={logo.src} alt="" />
                      <span>{logo.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-inline">
                  <FileImage size={18} />
                  <strong>No uploaded logos yet</strong>
                  <span>Upload one above to add it to the saved rotation.</span>
                </div>
              )}
              <button className="secondary-button" onClick={() => updateBranding(defaultBrandingSettings())}><RotateCcw size={15} /> Reset branding</button>
            </div>
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><Palette size={16} /> Brand colors</span><ChevronDown size={16} /></summary>
          <div className="settings-fields">
            <label className="wide-field">
              <span>Color palette</span>
              <select value={selectedPalette} onChange={(event) => selectPalette(event.target.value)}>
                {brandPalettes.map((palette) => <option key={palette.name} value={palette.name}>{palette.name} - {palette.note}</option>)}
              </select>
            </label>
            <div className="palette-preview-row">
              {selectedPaletteColors.map((color) => <span key={color} style={{ background: color }}>{color}</span>)}
            </div>
            {colorRoles.map((role) => (
              <label key={role}>
                <span>{role}</span>
                <select value={roleColors[role]} onChange={(event) => updateRoleColor(role, event.target.value)}>
                  {selectedPaletteColors.map((color) => <option key={`${role}-${color}`} value={color}>{color}</option>)}
                </select>
              </label>
            ))}
          </div>
        </details>



        <details className="panel settings-accordion">
          <summary><span><Wrench size={16} /> IAW estimate pricing</span><ChevronDown size={16} /></summary>
          <div className="settings-fields">
            <label>
              <span>Ibby labor rate ($/hr)</span>
              <input type="number" min="0" step="1" value={pricingSettings.shopLaborRate} onChange={(event) => updatePricingSetting("shopLaborRate", event.target.value)} />
            </label>
            <label>
              <span>Market comparison rate ($/hr)</span>
              <input type="number" min="0" step="1" value={pricingSettings.marketLaborRate} onChange={(event) => updatePricingSetting("marketLaborRate", event.target.value)} />
            </label>
            <label className="wide-field">
              <span>Default distributor search area</span>
              <input value={pricingSettings.defaultSearchArea} onChange={(event) => updatePricingSetting("defaultSearchArea", event.target.value)} placeholder="Auburn ME" />
            </label>
            <p className="legal-note">Customer price estimates and part quotes are built from these.</p>
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><Bell size={16} /> Prayer time blocks and reminders</span><ChevronDown size={16} /></summary>
          <div className="settings-fields prayer-settings-fields">
            <label><span>Enable prayer blocking</span><select value={prayerSettings.enabled ? "yes" : "no"} onChange={(event) => updatePrayerSettings({ ...prayerSettings, enabled: event.target.value === "yes" })}><option value="yes">Yes - show as booked windows</option><option value="no">No - keep as reminders only</option></select></label>
            <label><span>City</span><input value={prayerSettings.city} onChange={(event) => updatePrayerSettings({ ...prayerSettings, city: event.target.value })} /></label>
            <label><span>State</span><input value={prayerSettings.state} onChange={(event) => updatePrayerSettings({ ...prayerSettings, state: event.target.value })} /></label>
            <label><span>Country</span><input value={prayerSettings.country} onChange={(event) => updatePrayerSettings({ ...prayerSettings, country: event.target.value })} /></label>
            <button className="secondary-button" onClick={syncPrayerTimes} type="button"><Clock3 size={15} /> Pull today's prayer times</button>
            <p className="legal-note wide-field">{prayerFetchStatus} Reminders are shown in-app for now; native push notifications need the later notification/backend worker.</p>
          </div>
          <div className="prayer-block-grid">
            {prayerSettings.blocks.map((block, index) => (
              <div className={block.enabled ? "prayer-block-card enabled" : "prayer-block-card"} key={block.name}>
                <label className="inline-input"><input checked={block.enabled} onChange={(event) => updatePrayerBlock(index, "enabled", event.target.checked)} type="checkbox" /> <strong>{block.name}</strong></label>
                <label><span>Time</span><input type="time" value={block.time} onChange={(event) => updatePrayerBlock(index, "time", event.target.value)} /></label>
                <label><span>Block minutes</span><input min="5" max="120" type="number" value={block.durationMinutes} onChange={(event) => updatePrayerBlock(index, "durationMinutes", event.target.value)} /></label>
                <label><span>Reminder before</span><input min="0" max="120" type="number" value={block.reminderMinutes} onChange={(event) => updatePrayerBlock(index, "reminderMinutes", event.target.value)} /></label>
                <div className="prayer-push-row">
                  <button onClick={() => pushPrayerBlock(index, 10)} type="button">Push once +10</button>
                  <button onClick={() => pushPrayerBlock(index, 30)} type="button">Push once +30</button>
                  <button onClick={() => pushPrayerBlock(index, 0)} type="button">Clear push</button>
                </div>
                <small>{prayerBlockLabel(block)}{block.oneTimePushMinutes ? ` (one-time +${block.oneTimePushMinutes} min)` : ""}</small>
                <small>Admin reminder: {block.reminderMinutes} min before this prayer block</small>
              </div>
            ))}
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><MapPinned size={16} /> Service area and radius</span><ChevronDown size={16} /></summary>
          <div className="settings-fields">
            <label><span>Base location</span><input value={schedule.baseLocation} onChange={(event) => updateSchedule({ baseLocation: event.target.value })} /></label>
            <label><span>Included radius (miles)</span><select value={String(schedule.includedRadiusMiles)} onChange={(event) => updateSchedule({ includedRadiusMiles: Number(event.target.value) })}>
              {["10", "15", "20", "25", "35", "50"].map((radius) => <option key={radius} value={radius}>{radius} miles</option>)}
            </select></label>
            <label><span>Outside-area fee</span><input value={schedule.outsideRadiusFee} onChange={(event) => updateSchedule({ outsideRadiusFee: event.target.value })} /></label>
            <label><span>Area shown to customers</span><input value={schedule.serviceArea} onChange={(event) => updateSchedule({ serviceArea: event.target.value })} /></label>
          </div>
        </details>

        <details className="panel settings-accordion">
          <summary><span><Clock3 size={16} /> Working days and hours</span><ChevronDown size={16} /></summary>
          <div className="day-toggle-row">
            {SCHEDULE_DAYS.map((day) => (
              <button aria-pressed={schedule.workDays.includes(day)} className={schedule.workDays.includes(day) ? "toggle-pill selected" : "toggle-pill"} key={day} onClick={() => toggleDay(day)} type="button">
                {day}
              </button>
            ))}
          </div>
          <div className="time-editor-grid">
            <label><span>Open</span><select value={schedule.openTime} onChange={(event) => updateSchedule({ openTime: event.target.value })}>{clockOptions.map((time) => <option key={time}>{time}</option>)}</select></label>
            <label><span>Close</span><select value={schedule.closeTime} onChange={(event) => updateSchedule({ closeTime: event.target.value })}>{clockOptions.map((time) => <option key={time}>{time}</option>)}</select></label>
          </div>
          <p className="legal-note">Customers can only pick these days and times. You can still book any time yourself under New work order.</p>
        </details>

        <details className="panel settings-accordion">
          <summary><span><CalendarClock size={16} /> Blocked dates</span><ChevronDown size={16} /></summary>
          <label className="wide-field">
            <span>Month</span>
            <select value={calendarMonth} onChange={(event) => setCalendarMonth(event.target.value)}>
              {calendarMonths.map((month) => <option key={month.label}>{month.label}</option>)}
            </select>
          </label>
          <div className="blocked-calendar-grid">
            {blockedCalendarDays.map(({ day, iso }) => (
              <button className={schedule.blockedDates.includes(iso) ? "blocked" : ""} key={iso} onClick={() => toggleBlockedDate(iso)} type="button">
                <strong>{day}</strong>
                <span>{schedule.blockedDates.includes(iso) ? "Blocked" : "Open"}</span>
              </button>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
