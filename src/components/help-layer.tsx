"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleHelp, X } from "lucide-react";

import { useAuthRole } from "@/components/auth-gate";
import { BurnoutNavLink } from "@/components/route-burnout-loader";
import { helpFor, tours, type HelpAudience, type HelpEntry } from "@/lib/help-content";

const TOUR_SEEN_PREFIX = "ibbys-auto.tour-seen.";
const TOUR_STEP_KEY = "ibbys-auto.tour-step";
const HIGHLIGHT = "help-highlight";

function clean(text: string | null | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

// What a person would call the thing they tapped.
function labelsFor(element: Element) {
  const labels: string[] = [];
  const add = (text: string | null | undefined) => {
    const value = clean(text);
    if (value && value.length <= 80 && !labels.includes(value)) labels.push(value);
  };
  let node: Element | null = element;
  for (let depth = 0; node && depth < 4; depth += 1, node = node.parentElement) {
    add(node.getAttribute("aria-label"));
    add(node.getAttribute("placeholder"));
    if (node.matches("label")) add(node.querySelector("span")?.textContent);
    if (node.matches("button, a, summary, h1, h2, h3, strong, label, th, td")) add((node as HTMLElement).innerText);
    if (depth === 0) add((node as HTMLElement).innerText);
  }
  return labels;
}

// The heading of the card or panel it sits in.
function sectionFor(element: Element) {
  const panel = element.closest("details, .panel, section, article");
  const heading = panel?.querySelector("summary, h1, h2, h3");
  return clean((heading as HTMLElement | null)?.innerText);
}

function describeKind(element: Element) {
  const control = element.closest("button, a, input, select, textarea, summary");
  if (!control) return "information";
  if (control.matches("a")) return "a link";
  if (control.matches("button, summary")) return "a button";
  if (control.matches("select")) return "a list to choose from";
  return "a box to fill in";
}

type Explanation = { title: string; what: string; how?: string[]; manual?: string };

function explain(element: Element, entries: HelpEntry[], path: string): Explanation {
  const onPage = entries.filter((entry) => !entry.page || path.startsWith(entry.page));
  // Entries for this page win over general ones.
  const ordered = [...onPage.filter((entry) => entry.page && entry.page !== "/"), ...onPage.filter((entry) => !entry.page || entry.page === "/")];
  const labels = labelsFor(element);
  for (const label of labels) {
    const hit = ordered.find((entry) => entry.match.test(label));
    if (hit) return hit;
  }
  const section = sectionFor(element);
  const sectionHit = section ? ordered.find((entry) => entry.match.test(section)) : undefined;
  if (sectionHit) return sectionHit;
  return {
    title: labels[0] || section || "This part of the page",
    what: `This is ${describeKind(element)}${section && section !== labels[0] ? ` in the "${section}" section` : ""}. There's no specific note for it yet. If it isn't clear, tell us with Report a problem and we'll add one.`
  };
}

export function HelpLayer() {
  const { role, ready } = useAuthRole();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const audience: HelpAudience = role === "admin" ? "owner" : role === "staff" ? "tech" : "customer";
  const [picking, setPicking] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [offerTour, setOfferTour] = useState(false);
  const highlighted = useRef<Element | null>(null);

  const setHighlight = useCallback((element: Element | null) => {
    highlighted.current?.classList.remove(HIGHLIGHT);
    element?.classList.add(HIGHLIGHT);
    highlighted.current = element;
  }, []);

  const stopPicking = useCallback(() => {
    setPicking(false);
    setExplanation(null);
    setHighlight(null);
  }, [setHighlight]);

  // While picking, a tap explains the thing instead of doing it.
  useEffect(() => {
    if (!picking) return;
    const entries = helpFor(audience);
    function onClick(event: MouseEvent) {
      const target = event.target as Element;
      if (target.closest(".help-layer")) return;
      event.preventDefault();
      event.stopPropagation();
      setHighlight(target.closest("button, a, label, summary, input, select, textarea, tr, article, .panel") ?? target);
      setExplanation(explain(target, entries, window.location.pathname));
    }
    function block(event: Event) {
      if (!(event.target as Element).closest(".help-layer")) event.stopPropagation();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") stopPicking();
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("change", block, true);
    document.addEventListener("keydown", onKey);
    document.body.classList.add("help-picking");
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", block, true);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("help-picking");
    };
  }, [picking, audience, setHighlight, stopPicking]);

  // Offer the tour once per role on this device, or pick up where a tour left off.
  useEffect(() => {
    if (!ready) return;
    try {
      const saved = window.sessionStorage.getItem(TOUR_STEP_KEY);
      if (saved) {
        const [savedAudience, step] = saved.split(":");
        if (savedAudience === audience) { setTourStep(Number(step)); return; }
        window.sessionStorage.removeItem(TOUR_STEP_KEY);
      }
      setOfferTour(!window.localStorage.getItem(TOUR_SEEN_PREFIX + audience) && !pathname.startsWith("/legal"));
    } catch { /* storage unavailable: skip the offer */ }
    // Only when the role is known or changes, not on each page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, audience]);

  const steps = tours[audience];
  const step = tourStep === null ? null : steps[tourStep] ?? null;

  useEffect(() => {
    if (!step) return;
    if (step.href && pathname !== step.href) { router.push(step.href); return; }
    const timer = window.setTimeout(() => {
      const element = step.target ? document.querySelector(step.target) : null;
      const visible = element && element.getClientRects().length > 0;
      setHighlight(visible ? element : null);
      if (visible) element.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [step, pathname, router, setHighlight]);

  function markSeen() {
    setOfferTour(false);
    try { window.localStorage.setItem(TOUR_SEEN_PREFIX + audience, "1"); } catch { /* storage unavailable */ }
  }

  function goToStep(next: number | null) {
    setTourStep(next);
    setHighlight(null);
    try {
      if (next === null) window.sessionStorage.removeItem(TOUR_STEP_KEY);
      else window.sessionStorage.setItem(TOUR_STEP_KEY, `${audience}:${next}`);
    } catch { /* storage unavailable */ }
  }

  function startTour() {
    markSeen();
    stopPicking();
    goToStep(0);
  }

  const manualBase = audience === "owner" ? "/admin/manual" : "/service/manual";

  return (
    <div className="help-layer">
      {offerTour && tourStep === null && !picking ? (
        <aside className="help-card help-offer" role="dialog" aria-label="Quick tour">
          <strong>New here?</strong>
          <p>Take a quick tour of the app.</p>
          <div className="help-actions">
            <button className="primary-button" onClick={startTour} type="button">Start tour</button>
            <button className="secondary-button" onClick={markSeen} type="button">Skip</button>
          </div>
        </aside>
      ) : null}

      {step ? (
        <aside className="help-card" role="dialog" aria-label="Tour">
          <small>Step {(tourStep ?? 0) + 1} of {steps.length}</small>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          <div className="help-actions">
            {tourStep ? <button className="secondary-button" onClick={() => goToStep((tourStep ?? 1) - 1)} type="button">Back</button> : null}
            {(tourStep ?? 0) < steps.length - 1
              ? <button className="primary-button" onClick={() => goToStep((tourStep ?? 0) + 1)} type="button">Next</button>
              : <button className="primary-button" onClick={() => goToStep(null)} type="button">Finish</button>}
            {(tourStep ?? 0) < steps.length - 1 ? <button className="link-button" onClick={() => goToStep(null)} type="button">Skip tour</button> : null}
          </div>
        </aside>
      ) : null}

      {picking ? (
        <aside className="help-card" role="status" aria-live="polite">
          {explanation ? (
            <>
              <strong>{explanation.title}</strong>
              <p>{explanation.what}</p>
              {explanation.how?.length ? <ul>{explanation.how.map((line) => <li key={line}>{line}</li>)}</ul> : null}
              {explanation.manual && audience !== "customer" ? <BurnoutNavLink className="link-button" href={`${manualBase}#${explanation.manual}`}>Read more in the manual</BurnoutNavLink> : null}
              <small>Tap something else, or tap Done to go back to using the page.</small>
            </>
          ) : (
            <>
              <strong>Tap anything on the page</strong>
              <p>We&apos;ll tell you what it is and how to use it. Nothing you tap will change while this is on.</p>
            </>
          )}
          <div className="help-actions">
            <button className="primary-button" onClick={stopPicking} type="button">Done</button>
            <button className="secondary-button" onClick={startTour} type="button">Take the tour</button>
          </div>
        </aside>
      ) : null}

      <button
        aria-label={picking ? "Turn off help" : "Help: tap to learn about anything on this page"}
        aria-pressed={picking}
        className={picking ? "help-button active" : "help-button"}
        onClick={() => (picking ? stopPicking() : setPicking(true))}
        type="button"
      >
        {picking ? <X size={22} /> : <CircleHelp size={24} />}
      </button>
    </div>
  );
}
