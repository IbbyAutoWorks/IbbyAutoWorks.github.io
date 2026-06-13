import { BookOpen, ExternalLink } from "lucide-react";

import { maineInspectionManual, maineInspectionPdfPage, maineInspectionQuickLinks } from "@/lib/inspection-reference";

export function InspectionReferencePanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "inspection-reference compact" : "inspection-reference"}>
      <div className="panel-title">
        <div>
          <p className="section-label">Official inspection reference</p>
          <h2>Maine inspection manual quick links</h2>
        </div>
        <BookOpen />
      </div>
      <div className="inspection-reference-actions">
        <a href={maineInspectionManual.officialPage} target="_blank" rel="noreferrer">
          Maine State Police page <ExternalLink size={14} />
        </a>
        <a href={maineInspectionManual.pdf} target="_blank" rel="noreferrer">
          Open full manual <ExternalLink size={14} />
        </a>
      </div>
      <p>{maineInspectionManual.note}</p>
      <details open={!compact}>
        <summary>Quick section jump by PDF page</summary>
        <div className="inspection-link-grid">
          {maineInspectionQuickLinks.map((link) => (
            <a href={maineInspectionPdfPage(link.page)} key={link.label} target="_blank" rel="noreferrer">
              <strong>{link.label}</strong>
              <span>{link.category} - page {link.page}</span>
              <small>{link.summary}</small>
            </a>
          ))}
        </div>
      </details>
      <small>Inspection questions or complaints: Maine State Police Inspection Unit {maineInspectionManual.complaintPhone}.</small>
    </div>
  );
}
