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

### Commercial-use vehicle images

Google Images may be used only to discover a possible original source. A Google result, thumbnail, hotlink, or `Usage rights` filter is not itself a license and must never be copied directly into the app.

Preferred discovery sources are Wikimedia Commons and Openverse because they expose creator and license metadata. Carefully reviewed Unsplash or Pexels photos may also be considered under their site licenses. Manufacturer, dealer, auction, marketplace, news, social-media and enthusiast-site images are rejected unless the original rights holder publishes explicit commercial reuse terms for that exact image.

Before any image becomes a shop default, record:

- Original source/file-description page URL
- Original image URL
- Creator/author
- Exact license identifier and version
- License URL
- Required attribution text
- Whether modification or share-alike requirements apply
- Vehicle identity confidence: exact year/generation, make and model
- Review date

Normally acceptable after metadata review:

- Public domain or CC0
- CC BY, with visible attribution
- CC BY-SA, with attribution and share-alike handling for adaptations
- A site-specific license that explicitly permits commercial app use and the intended hosting/copying behavior

Always reject:

- `All rights reserved`, unknown or missing licenses
- CC BY-NC and every other noncommercial license
- No-derivatives licenses when the app will crop, resize, overlay or otherwise modify the image
- Search thumbnails and images whose original source cannot be verified
- Images that depict the wrong generation or an uncertain vehicle

Prefer linking to the original hosted image when its terms allow hotlinking. After all license and identity checks pass, the library may embed a remote Markdown preview and must place the original source-page link, creator, license and attribution directly beneath it. If the app later stores a copy, it must preserve the same attribution and license metadata beside that copy. Automated inclusion in a Markdown sheet does not by itself approve the image as the live app default; live selection remains a separate reviewed application-data change.

## Per-vehicle sheet additions

When reliable data exists, a vehicle sheet may include:

- **EPA/NHTSA identity check:** exact engine, transmission, fuel and drivetrain variants.
- **NHTSA recalls:** count and official lookup link, kept separate from specifications.
- **NHTSA manufacturer communications:** identifiers and brief summaries only.
- **NHTSA complaint patterns:** aggregate owner-reported themes with a clear disclaimer.
- **Image candidate:** Commons metadata and attribution, pending shop review.

These sections are enrichment. Missing enrichment must never block a fluid, torque or maintenance sheet, and enrichment must not weaken the exact-source requirements for mechanical specifications.
