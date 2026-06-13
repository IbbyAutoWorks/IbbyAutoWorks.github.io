"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BURNOUT_DURATION_MS = 3200;

const loaderVariants = ["burnout", "clipboard", "lift", "parts", "calendar", "preferences", "signature", "review"] as const;

type LoaderVariant = (typeof loaderVariants)[number];

const loaderCopy: Record<LoaderVariant, string> = {
  burnout: "Loading the next bay...",
  clipboard: "Writing up the request...",
  lift: "Raising the vehicle...",
  parts: "Checking parts grades...",
  calendar: "Finding the appointment window...",
  preferences: "Setting service preferences...",
  signature: "Preparing agreements...",
  review: "Reviewing the work order..."
};

type BurnoutNavLinkProps = {
  href: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
  children: React.ReactNode;
};

export function RouteBurnoutLoader() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const firstRender = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [variant, setVariant] = useState<LoaderVariant>("burnout");

  function showLoader(nextVariant: LoaderVariant = "burnout") {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setVariant(nextVariant);
    setIsAnimating(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsAnimating(false);
      timeoutRef.current = null;
    }, BURNOUT_DURATION_MS);
  }

  useEffect(() => {
    function startBurnout(event: Event) {
      const nextVariant = event instanceof CustomEvent && loaderVariants.includes(event.detail?.variant) ? event.detail.variant : "burnout";
      showLoader(nextVariant);
    }

    window.addEventListener("ibbys-auto.route-burnout", startBurnout);
    return () => {
      window.removeEventListener("ibbys-auto.route-burnout", startBurnout);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      previousPath.current = pathname;
      return;
    }

    if (previousPath.current === pathname) {
      return;
    }

    previousPath.current = pathname;
    showLoader("burnout");
  }, [pathname]);

  return (
    <div className={isAnimating ? `burnout-loader active loader-${variant}` : `burnout-loader loader-${variant}`} data-testid="route-burnout-loader" aria-hidden={!isAnimating}>
      {variant === "burnout" ? <BurnoutStage /> : <WorkflowLoaderStage variant={variant} />}
      <span>{loaderCopy[variant]}</span>
    </div>
  );
}

export function BurnoutNavLink({ href, active, className, onClick, children, "aria-label": ariaLabel }: BurnoutNavLinkProps) {
  function armBurnout(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href === window.location.pathname) {
      onClick?.();
      return;
    }

    window.dispatchEvent(new CustomEvent("ibbys-auto.route-burnout"));
    onClick?.();
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={[className, active ? "active" : ""].filter(Boolean).join(" ")} onClick={armBurnout}>
      {children}
    </Link>
  );
}

function BurnoutStage() {
  return (
    <div className="burnout-stage">
      <div className="burnout-smoke smoke-one" />
      <div className="burnout-smoke smoke-two" />
      <div className="burnout-smoke smoke-three" />
      <div className="burnout-tracks" />
      <div className="burnout-car">
        <div className="car-roof" />
        <div className="car-body" />
        <div className="wheel front" />
        <div className="wheel rear" />
      </div>
    </div>
  );
}

function WorkflowLoaderStage({ variant }: { variant: Exclude<LoaderVariant, "burnout"> }) {
  return (
    <svg className={`workflow-loader-stage workflow-loader-${variant}`} viewBox="0 0 360 160" role="img" aria-label={loaderCopy[variant]}>
      <defs>
        <linearGradient id="loader-red-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#c6202e" />
          <stop offset="100%" stopColor="#8f1420" />
        </linearGradient>
      </defs>
      <ellipse className="workflow-ground" cx="180" cy="132" rx="122" ry="12" />
      {variant === "clipboard" && (
        <g className="workflow-clipboard">
          <rect className="workflow-paper" x="132" y="28" width="96" height="106" rx="10" />
          <rect className="workflow-red-fill" x="152" y="18" width="56" height="24" rx="9" />
          <rect className="workflow-form-line line-one" x="152" y="62" width="68" height="8" rx="4" />
          <rect className="workflow-form-line line-two" x="152" y="84" width="58" height="8" rx="4" />
          <rect className="workflow-form-line line-three" x="152" y="106" width="72" height="8" rx="4" />
          <g className="workflow-pencil">
            <polygon points="190,75 202,70 202,80" />
            <rect x="202" y="70" width="58" height="10" rx="5" />
          </g>
        </g>
      )}
      {variant === "lift" && (
        <g className="workflow-lift">
          <rect className="workflow-metal" x="78" y="28" width="14" height="108" rx="7" />
          <rect className="workflow-metal" x="268" y="28" width="14" height="108" rx="7" />
          <g className="workflow-lift-motion">
            <rect className="workflow-red-fill" x="102" y="104" width="156" height="8" rx="4" />
            <rect className="workflow-white-fill" x="114" y="90" width="132" height="8" rx="4" />
            <g className="workflow-car-small">
              <rect className="workflow-car-roof-small" x="153" y="54" width="54" height="24" rx="9" />
              <rect className="workflow-car-body-small" x="118" y="74" width="128" height="34" rx="11" />
              <circle cx="145" cy="110" r="12" />
              <circle cx="220" cy="110" r="12" />
            </g>
          </g>
        </g>
      )}
      {variant === "parts" && (
        <g className="workflow-parts">
          <path className="workflow-loader-wrench" d="M110 113 156 67m-21-2c-8-8-8-20 0-28l12 12 11-11-12-12c10-5 22-3 30 5 10 10 10 26 0 36l-49 49c-5 5-13 5-18 0s-5-13 0-18Z" />
          <g className="workflow-part-box box-two">
            <rect x="216" y="54" width="70" height="48" rx="9" />
            <rect x="232" y="68" width="38" height="7" rx="3" />
          </g>
          <g className="workflow-money">
            <circle cx="236" cy="116" r="26" />
            <text x="236" y="126" textAnchor="middle">$</text>
          </g>
        </g>
      )}
      {variant === "calendar" && (
        <g className="workflow-calendar">
          <rect className="workflow-paper" x="125" y="30" width="110" height="110" rx="12" />
          <rect className="workflow-red-fill" x="125" y="30" width="110" height="28" rx="12" />
          <rect className="workflow-calendar-cell" x="142" y="72" width="24" height="22" rx="5" />
          <rect className="workflow-calendar-cell" x="180" y="72" width="24" height="22" rx="5" />
          <rect className="workflow-calendar-cell" x="142" y="106" width="24" height="22" rx="5" />
          <rect className="workflow-calendar-cell" x="180" y="106" width="24" height="22" rx="5" />
          <g className="workflow-checked-day">
            <rect x="210" y="72" width="24" height="22" rx="5" />
            <path d="M216 82 l6 6 l12 -14" />
          </g>
        </g>
      )}
      {variant === "preferences" && (
        <g className="workflow-preferences">
          <rect className="workflow-dark-panel" x="108" y="38" width="144" height="104" rx="16" />
          <line x1="132" y1="68" x2="228" y2="68" />
          <line x1="132" y1="94" x2="228" y2="94" />
          <line x1="132" y1="120" x2="228" y2="120" />
          <circle className="workflow-slider-knob knob-one" cx="146" cy="68" r="11" />
          <circle className="workflow-slider-knob knob-two" cx="180" cy="94" r="11" />
          <circle className="workflow-slider-knob knob-three" cx="214" cy="120" r="11" />
        </g>
      )}
      {variant === "signature" && (
        <g className="workflow-signature">
          <rect className="workflow-paper" x="130" y="28" width="100" height="116" rx="12" />
          <path className="workflow-signature-line" d="M150 106 C164 84 174 122 190 99 S215 103 222 91" />
          <g className="workflow-signature-pen">
            <polygon points="186,91 198,86 198,96" />
            <rect x="198" y="86" width="62" height="10" rx="5" />
          </g>
        </g>
      )}
      {variant === "review" && (
        <g className="workflow-review">
          <rect className="workflow-paper" x="118" y="28" width="94" height="118" rx="12" />
          <rect className="workflow-doc-line" x="140" y="58" width="50" height="8" rx="4" />
          <rect className="workflow-doc-line" x="140" y="82" width="58" height="8" rx="4" />
          <rect className="workflow-doc-line" x="140" y="106" width="44" height="8" rx="4" />
          <g className="workflow-magnifier">
            <circle cx="226" cy="94" r="31" />
            <line x1="247" y1="116" x2="276" y2="138" />
          </g>
        </g>
      )}
    </svg>
  );
}
