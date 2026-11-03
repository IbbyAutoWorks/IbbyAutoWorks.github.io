# Ibby Auto Works vehicle-spec library

This folder is a source-backed, human-readable companion to the app's Supabase `vehicle_specs` table. It is intended to grow gradually across mainstream vehicles commonly serviced in the United States.

## Safety and accuracy rules

- Identify the exact **year, make, model, engine, transmission, drivetrain, body configuration, and relevant option/RPO codes** before using a value.
- Treat the tire-information placard on the actual vehicle as the authority for tire pressure.
- Prefer manufacturer owner manuals, maintenance guides, service information, and technical bulletins. NHTSA and fueleconomy.gov may be used to confirm vehicle/engine combinations.
- Never infer a specification from a neighboring year, similar model, unit conversion, forum post, search snippet, or AI memory.
- A blank or `Needs research` field is better than a plausible but unsupported number.
- Every populated value must include a source URL and page, table, or section locator when available.
- These notes are a shop reference, not a substitute for current OEM service information or VIN-specific procedures.

## Layout

Vehicle files are stored under:

`data/<year>/<make>/<model>/<engine>.md`

Each engine or materially different powertrain gets its own file. Hybrid, plug-in hybrid, EV, diesel, high-output, HD, Classic/legacy-body, and other variants must not share a sheet unless the OEM source explicitly gives the same specification.

## Reference-data enrichment

Mechanical specification sheets may also carry carefully separated EPA/NHTSA identity information, NHTSA recall links, manufacturer-communication/TSB summaries, aggregate owner-complaint themes, and license-reviewed Wikimedia Commons image candidates. These are governed by [`REFERENCE_DATA_SOURCES.md`](REFERENCE_DATA_SOURCES.md). Recalls, bulletins, owner reports and mechanical specifications must never be presented as interchangeable evidence.

## Status values

- `starter`: imported from an OEM-backed seed and still has missing fields.
- `researched`: all populated fields were checked against cited sources.
- `shop-reviewed`: a human at Ibby Auto Works checked the sheet.
- `conflict`: sources disagree; do not use the disputed fields until resolved.

## Scheduled updater

The Hermes job `Ibby vehicle-spec markdown builder` runs three times each day and may add or materially improve up to ten exact vehicle/year/engine sheets per run. That permits up to 30 carefully sourced sheets per day when suitable OEM information is available; unsupported fields must remain blank rather than being guessed.

Coverage moves backward in year phases:

1. **2017–current model year:** complete the newest ten model years first.
2. **2007–2016:** continue through the preceding decade.
3. **1997–2006:** continue through the next older decade.
4. **1990–1996:** finish the requested 1990s coverage.

Within the active phase, high-volume vehicles and models appearing in the existing app queue take priority. A run must not jump to an older phase while reasonable mainstream gaps remain in a newer phase. Each run updates `catalog.md` and must pass `python scripts/verify-vehicle-spec-markdown.py` before finishing. The updater does not push or deploy changes automatically.
