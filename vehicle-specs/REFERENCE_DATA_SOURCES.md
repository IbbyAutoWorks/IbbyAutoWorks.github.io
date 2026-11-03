# Reference-data source policy

This document separates vehicle specifications from larger reference datasets used by Ibby Auto Works. A source being public does not automatically make every field accurate, redistributable, or safe to display without attribution.

## Current application coverage

### Diagnostic trouble codes

The repository currently contains `supabase/seed/dtc_definitions.json`, derived from `Wal33D/dtc-database`. Its repository license file identifies the imported dataset as **MIT licensed**, not CC0. The migration describes approximately 9.4k generic and manufacturer-specific definitions.

- Keep the existing source name and MIT attribution with the data.
- Display descriptions as reference information, not a diagnosis.
- Do not silently replace or merge definitions from another DTC project without preserving source-level provenance.
- OBDex may be evaluated as an additional source, but its records and claimed license must be independently verified before import.

### EPA/fueleconomy.gov vehicle catalog

The app already reads fueleconomy.gov live for 1984-and-newer engine, transmission, fuel and drivetrain options.

A saved snapshot may be added for resilience and reproducible research. Snapshot records should preserve the EPA vehicle ID, source URL, retrieval date and original fields. Refresh the snapshot periodically rather than treating it as permanent because future model years and corrections are added over time.

### NHTSA recalls

The app already queries the NHTSA recall API by year, make and model. Recalls must remain visually separate from service bulletins and owner complaints because they have different meanings and legal significance.

## Planned enrichment

### NHTSA manufacturer communications / technical service bulletins

Store only source-backed metadata such as:

- NHTSA communication or bulletin identifier
- Manufacturer
- Model year, make and model applicability
- Component/category
- Published or received date
- Short NHTSA/manufacturer summary
- Official NHTSA record or download URL
- Retrieval date

Do not represent a bulletin as a recall. Do not infer that every vehicle has the described condition. Full documents should be linked rather than republished unless redistribution rights are clear.

### NHTSA owner complaints

Complaint information may be useful as a pattern-finding reference, but an allegation is not a verified defect.

- Prefer aggregate counts, components, dates and recurring themes.
- Link to the official NHTSA results.
- Do not copy personal information or unnecessarily preserve free-text narratives.
- Label all complaint summaries as owner reports, not confirmed failures.
- Never turn complaint frequency into a diagnosis or safety conclusion without stronger evidence.

### Wikimedia Commons vehicle images

A search result or Wikipedia thumbnail is not enough to establish reusable image rights. Before a Commons image becomes a shop default, record:

- Commons file-description page URL
- Original file URL
- Creator/author
- Exact license identifier
- License URL
- Required attribution text
- Whether modification/share-alike requirements apply
- Review date

Only images with acceptable reusable licenses and complete attribution metadata may be used. Files with unclear, noncommercial-only, no-derivatives or missing-license metadata must be rejected. Prefer linking to the Commons-hosted image rather than copying it into the repository.

## Per-vehicle sheet additions

When reliable data exists, a vehicle sheet may include:

- **EPA/NHTSA identity check:** exact engine, transmission, fuel and drivetrain variants.
- **NHTSA recalls:** count and official lookup link, kept separate from specifications.
- **NHTSA manufacturer communications:** identifiers and brief summaries only.
- **NHTSA complaint patterns:** aggregate owner-reported themes with a clear disclaimer.
- **Image candidate:** Commons metadata and attribution, pending shop review.

These sections are enrichment. Missing enrichment must never block a fluid, torque or maintenance sheet, and enrichment must not weaken the exact-source requirements for mechanical specifications.
