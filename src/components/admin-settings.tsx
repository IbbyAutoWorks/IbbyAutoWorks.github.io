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
import { inspectionTemplates } from "@/lib/data";
import { appointmentWindows, businessSchedule } from "@/lib/schedule";
import { readSavedTheme, saveTheme, ThemeRoleColors } from "@/lib/theme";
import { readPricingSettings, savePricingSettings, type PricingSettings } from "@/lib/pricing-settings";
import { fetchPrayerTimesFromAladhan, prayerBlockLabel, readPrayerScheduleSettings, savePrayerScheduleSettings, type PrayerBlock, type PrayerScheduleSettings } from "@/lib/prayer-times";
import { defaultMarketingSettings, readMarketingSettings, saveMarketingSettings, type MarketingSettings } from "@/lib/marketing-settings";
import { PaymentSettingsPanel } from "@/components/payment-settings";
import { IntegrationHub } from "@/components/integration-hub";
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
const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeOptions = ["6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00"];
const calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

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
  const [workflowColumns, setWorkflowColumns] = useState(["Requested", "Scheduled", "In Progress", "Waiting Parts", "Complete"]);
  const [enabledDays, setEnabledDays] = useState(dayOptions.slice(0, 5));
  const [startTime, setStartTime] = useState("8:00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endTime, setEndTime] = useState("5:00");
  const [endPeriod, setEndPeriod] = useState("PM");
  const [blockedDays, setBlockedDays] = useState([12, 18]);
  const [calendarMonth, setCalendarMonth] = useState("June 2026");
  const [serviceRadius, setServiceRadius] = useState("25");
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() => readPricingSettings());
  const [prayerSettings, setPrayerSettings] = useState<PrayerScheduleSettings>(() => readPrayerScheduleSettings());
  const [marketingSettings, setMarketingSettings] = useState<MarketingSettings>(() => readMarketingSettings());
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

  function updateWorkflowColumn(index: number, value: string) {
    setWorkflowColumns((current) => current.map((column, columnIndex) => columnIndex === index ? value : column));
  }

  function moveWorkflowColumn(index: number, direction: -1 | 1) {
    setWorkflowColumns((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function toggleDay(day: string) {
    setEnabledDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  function toggleBlockedDay(day: number) {
    setBlockedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  return (
    <div className="settings-workspace">
      <section className="admin-header">
        <div>
          <p className="section-label">Configurable admin workspace</p>
          <h1>Make the app editable without turning it into a fragile page builder.</h1>
        </div>
        <button className="primary-button" onClick={() => { saveTheme(roleColors); savePricingSettings(pricingSettings); }}><Save size={16} /> Save draft settings</button>
      </section>

      <section className="settings-stack">
        <IntegrationHub />
      <PaymentPlanManager />
      <CouponTaxManager />
      <PaymentSettingsPanel />

        <details className="panel settings-accordion" open>
          <summary><span><BadgePercent size={16} /> Public popups, reviews, and homepage widget</span><ChevronDown size={16} /></summary>
          <div className="settings-fields marketing-settings-fields">
            <label><span>Coupon popup</span><select value={marketingSettings.couponPopupEnabled ? "on" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, couponPopupEnabled: event.target.value === "on" })}><option value="on">On</option><option value="off">Off</option></select></label>
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

        <details className="panel settings-accordion" open>
          <summary><span><Cloud size={16} /> Google Photos, Drive, and Calendar readiness</span><ChevronDown size={16} /></summary>
          <div className="settings-fields marketing-settings-fields">
            <label><span>Google Photos work-order album flow</span><select value={marketingSettings.googlePhotosEnabled ? "planned" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, googlePhotosEnabled: event.target.value === "planned" })}><option value="off">Off / not authorized</option><option value="planned">Planned after Google OAuth</option></select></label>
            <label><span>Google Drive ZIP archive</span><select value={marketingSettings.googleDriveArchiveEnabled ? "planned" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, googleDriveArchiveEnabled: event.target.value === "planned" })}><option value="off">Off / not authorized</option><option value="planned">Planned after Google OAuth</option></select></label>
            <label><span>Google Calendar booking blocks</span><select value={marketingSettings.googleCalendarBookingEnabled ? "planned" : "off"} onChange={(event) => updateMarketingSettings({ ...marketingSettings, googleCalendarBookingEnabled: event.target.value === "planned" })}><option value="off">Off / local blocks only</option><option value="planned">Planned after Calendar OAuth</option></select></label>
            <p className="legal-note wide-field">Recommended architecture: Supabase remains the app database/storage index; Google Photos stores job-progress albums; Google Drive stores compressed per-work-order ZIP archives; Google Calendar becomes the private source for accepted work-order and prayer booking blocks. Google Contacts should mirror customer names/phone/email once OAuth scopes are approved. Google Sheets/Docs should receive professional year-to-date and year-end reconciliation exports. Production write access needs Google OAuth/server routes first.</p>
          </div>
        </details>

        <details className="panel settings-accordion" open>
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
              <small>Uploaded images are saved into this browser prototype so he can switch back later.</small>
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

        <details className="panel settings-accordion" open>
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



        <details className="panel settings-accordion" open>
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
            <p className="legal-note">These settings feed the customer request estimator, retailer comparison cards, and saved work-order part quotes in this browser prototype.</p>
          </div>
        </details>

        <details className="panel settings-accordion" open>
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

        <details className="panel settings-accordion" open>
          <summary><span><SlidersHorizontal size={16} /> Workflow columns</span><ChevronDown size={16} /></summary>
          <div className="workflow-column-editor">
            {workflowColumns.map((column, index) => (
              <div className="workflow-column-row" key={`${column}-${index}`}>
                <strong>Position {index + 1}</strong>
                <input value={column} onChange={(event) => updateWorkflowColumn(index, event.target.value)} />
                <button onClick={() => moveWorkflowColumn(index, -1)} disabled={index === 0}>Up</button>
                <button onClick={() => moveWorkflowColumn(index, 1)} disabled={index === workflowColumns.length - 1}>Down</button>
              </div>
            ))}
          </div>
        </details>

        <details className="panel settings-accordion" open>
          <summary><span><MapPinned size={16} /> Service area and radius</span><ChevronDown size={16} /></summary>
          <div className="service-radius-grid">
            <div className="radius-map">
              <div className="radius-ring" style={{ width: `${Number(serviceRadius) * 3}px`, height: `${Number(serviceRadius) * 3}px` }}>
                <MapPinned size={28} />
              </div>
              <span>Auburn / Lewiston base</span>
            </div>
            <div className="settings-fields">
              <label><span>Base location</span><input defaultValue="Auburn, ME" /></label>
              <label><span>Included radius</span><select value={serviceRadius} onChange={(event) => setServiceRadius(event.target.value)}>
                {["10", "15", "20", "25", "35", "50"].map((radius) => <option key={radius} value={radius}>{radius} miles</option>)}
              </select></label>
              <label><span>Outside-area fee</span><input defaultValue="$2.50 per mile after included radius" /></label>
              <label><span>Customer message</span><input defaultValue="Outside service area may require an added travel fee." /></label>
            </div>
          </div>
        </details>

        <details className="panel settings-accordion" open>
          <summary><span><Clock3 size={16} /> Working days and hours</span><ChevronDown size={16} /></summary>
          <div className="day-toggle-row">
            {dayOptions.map((day) => (
              <button className={enabledDays.includes(day) ? "toggle-pill selected" : "toggle-pill"} key={day} onClick={() => toggleDay(day)}>
                {day}
              </button>
            ))}
          </div>
          <div className="time-editor-grid">
            <label><span>Open</span><select value={startTime} onChange={(event) => setStartTime(event.target.value)}>{timeOptions.map((time, index) => <option key={`start-${time}-${index}`}>{time}</option>)}</select></label>
            <label><span>AM / PM</span><select value={startPeriod} onChange={(event) => setStartPeriod(event.target.value)}><option>AM</option><option>PM</option></select></label>
            <label><span>Close</span><select value={endTime} onChange={(event) => setEndTime(event.target.value)}>{timeOptions.map((time, index) => <option key={`end-${time}-${index}`}>{time}</option>)}</select></label>
            <label><span>AM / PM</span><select value={endPeriod} onChange={(event) => setEndPeriod(event.target.value)}><option>AM</option><option>PM</option></select></label>
          </div>
        </details>

        <details className="panel settings-accordion" open>
          <summary><span><CalendarClock size={16} /> Blocked dates</span><ChevronDown size={16} /></summary>
          <label className="wide-field">
            <span>Calendar month</span>
            <select value={calendarMonth} onChange={(event) => setCalendarMonth(event.target.value)}>
              {["June 2026", "July 2026", "August 2026", "September 2026"].map((month) => <option key={month}>{month}</option>)}
            </select>
          </label>
          <div className="blocked-calendar-grid">
            {calendarDays.map((day) => (
              <button className={blockedDays.includes(day) ? "blocked" : ""} key={day} onClick={() => toggleBlockedDay(day)}>
                <strong>{day}</strong>
                <span>{blockedDays.includes(day) ? "Blocked" : "Open"}</span>
              </button>
            ))}
          </div>
        </details>

        <div className="panel template-panel">
          <div className="panel-title">
            <h2>Inspection templates</h2>
            <FileText />
          </div>
          {inspectionTemplates.map((template) => (
            <div className="template-row" key={template.name}>
              <div>
                <strong>{template.name}</strong>
                <span>{template.items} items - {template.requiredPhotos} required photos</span>
              </div>
              <em>{template.status}</em>
            </div>
          ))}
        </div>

        <div className="panel schedule-config-panel">
          <div className="panel-title">
            <div>
              <p className="section-label">Customer booking rules</p>
              <h2>Hours and appointment availability</h2>
            </div>
            <CalendarClock />
          </div>
          <div className="schedule-summary-grid">
            <div>
              <span>Work days</span>
              <strong>{enabledDays.join(", ")}</strong>
            </div>
            <div>
              <span>Hours</span>
              <strong>{startTime} {startPeriod} - {endTime} {endPeriod}</strong>
            </div>
            <div>
              <span>Service area</span>
              <strong>{businessSchedule.serviceArea} - {serviceRadius} mile included radius</strong>
            </div>
            <div>
              <span>Google Calendar</span>
              <strong>{businessSchedule.googleCalendarStatus}</strong>
            </div>
          </div>
          <div className="appointment-window-list">
            {appointmentWindows.map((window) => (
              <div className={window.booked ? "appointment-window booked" : "appointment-window"} key={window.label}>
                <div>
                  <strong>{window.label}</strong>
                  <span>{window.reason}</span>
                </div>
                <em>{window.booked ? "Blocked" : "Open"}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
