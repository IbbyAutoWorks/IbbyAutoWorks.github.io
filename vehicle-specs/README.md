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

## Status values

- `starter`: imported from an OEM-backed seed and still has missing fields.
- `researched`: all populated fields were checked against cited sources.
- `shop-reviewed`: a human at Ibby Auto Works checked the sheet.
- `conflict`: sources disagree; do not use the disputed fields until resolved.

## Nightly updater

The Hermes job `Ibby vehicle-spec markdown builder` may add or improve up to three mainstream vehicle/engine sheets per night. It must leave unsupported fields blank, update `catalog.md`, and pass `python scripts/verify-vehicle-spec-markdown.py` before finishing. It does not push or deploy changes automatically.
