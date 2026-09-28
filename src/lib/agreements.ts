export type AgreementId = "inspection" | "partsReturn" | "preRepair" | "billing" | "safety" | "damage" | "repair";

export type PartsReturnPreference = "return" | "dispose" | "core";

export type AgreementAcceptance = {
  accepted: Record<AgreementId, boolean>;
  partsReturnPreference: PartsReturnPreference;
  acceptedAt: string;
  acceptedBy: string;
};

// Agreement documents live in the app repo's root as Markdown files. Build the
// links from one base so they can't drift to a stale/wrong repo, and keep the
// ".md" extension so the GitHub blob URLs actually resolve.
const AGREEMENT_DOC_BASE = "https://github.com/IbbyAutoWorks/IbbyAutoWorks.github.io/blob/main";

const agreementDocs: Array<{ id: AgreementId; title: string; source: string; summary: string }> = [
  {
    id: "inspection",
    title: "Four-point inspection acknowledgement",
    source: "4PointInspection",
    summary: "Acknowledges the inspection checklist and documentation scope used before, during, or after service."
  },
  {
    id: "partsReturn",
    title: "Return or dispose replaced parts",
    source: "ReturnDisposeParts",
    summary: "Confirms whether replaced parts should be returned, disposed, or held for core/warranty handling."
  },
  {
    id: "preRepair",
    title: "Pre-repair condition and walk-around acknowledgement",
    source: "PreInspect",
    summary: "Confirms pre-existing damage, warning lights, leaks, rust, or missing trim should be documented before moving/lifting."
  },
  {
    id: "billing",
    title: "Labor rates and billing authorization",
    source: "LaborRates",
    summary: "Acknowledges labor billing, payment due on completion, storage fees, and authorization if estimate changes exceed 10%."
  },
  {
    id: "safety",
    title: "Workshop safety and non-interference agreement",
    source: "InterferenceAgreement",
    summary: "Requires safe distance from tools, vehicles, and active work areas and covers customer/third-party safety responsibilities."
  },
  {
    id: "damage",
    title: "Mechanical breakdown and property damage waiver",
    source: "DamageWaiver",
    summary: "Acknowledges aged, rusted, or brittle components may fail during normal repair work and may require added parts/labor."
  },
  {
    id: "repair",
    title: "Automotive repair agreement and liability disclosure",
    source: "AutomotiveRepairAgreement",
    summary: "Authorizes the requested work, acknowledges hidden damage and estimate limits, and allows diagnostic/test driving when needed."
  }
];

export const agreementSummaries: Array<{ id: AgreementId; title: string; source: string; url: string; summary: string }> =
  agreementDocs.map((doc) => ({ ...doc, url: `${AGREEMENT_DOC_BASE}/${doc.source}.md` }));

export const partsReturnOptions: Array<{ value: PartsReturnPreference; label: string; detail: string }> = [
  { value: "dispose", label: "Dispose replaced parts", detail: "Customer waives return and authorizes disposal unless core/warranty rules apply." },
  { value: "return", label: "Return replaced parts", detail: "Customer wants replaced parts returned when legally and practically available." },
  { value: "core", label: "Core/warranty return", detail: "Parts may need to be returned to supplier/manufacturer for core or warranty handling." }
];

export function defaultAgreementAcceptance(): AgreementAcceptance {
  return {
    accepted: {
      inspection: false,
      partsReturn: false,
      preRepair: false,
      billing: false,
      safety: false,
      damage: false,
      repair: false
    },
    partsReturnPreference: "dispose",
    acceptedAt: "",
    acceptedBy: ""
  };
}

export function hasRequiredAgreementAcceptance(acceptance: AgreementAcceptance) {
  return agreementSummaries.every((agreement) => acceptance.accepted[agreement.id]);
}
