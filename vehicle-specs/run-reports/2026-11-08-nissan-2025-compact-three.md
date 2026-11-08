# Vehicle-spec library run report — 2026-11-08 Nissan 2025 compact three

## Scope and phase

- **Active phase:** 2017–2026, the rolling newest ten model years as of 2026.
- **Batch result:** 3 new exact US-market sheets completed; the batch stopped below ten because exactness was prioritized over retaining unsupported draft values.
- **Coverage mix:** compact passenger car plus compact crossover, with FWD and AWD Kicks configurations kept separate.

## Files changed

- `data/2025/nissan/sentra/2.0l-i4-cvt-fwd.md`
- `data/2025/nissan/kicks/2.0l-i4-cvt-fwd.md`
- `data/2025/nissan/kicks/2.0l-i4-cvt-awd.md`
- `catalog.md`
- `run-reports/2026-11-08-nissan-2025-compact-three.md`

## Sources and mechanical fields

- The exact-year Nissan Sentra owner manual supports 0W-20 SP/GF-6A oil, 4.1 L with-filter refill, 7.1 L CVT-model coolant capacity, NS-3 CVT fluid, DOT 3/DOT 4 brake fluid, 83 ft-lb wheel torque, 5,000-mile tire rotation, DXE22H11C plugs at 1.1 mm, and normal/severe maintenance conditions.[3]
- The exact-year Nissan Kicks owner manual supports 0W-20 SP/GF-6A oil, 4.1 L with-filter refill, 7.4 L coolant capacity, NS-3 CVT fluid, DOT 3/DOT 4 brake fluid, AWD-specific 75W-80 rear differential oil, 75W-90 transfer fluid and LSC 12-301 coupling oil, 83 ft-lb wheel torque, tire-size-specific placard pressures, 5,000-mile tire rotation, SXE22H11C plugs at 1.1 mm, lamp distinctions and normal/severe intervals.[4]
- Unsupported CVT service quantities, Kicks AWD transfer/differential/coupling capacities, exact filter part numbers, battery group/CCA and incomplete trim-specific bulb inventories remain `Needs research`; no neighboring-year or calculated values were substituted.[3][4]

## Reference enrichment

- fueleconomy.gov confirms the 2025 Sentra 2.0L variable-ratio automatic FWD identity at vehicle ID 48500.[11]
- fueleconomy.gov confirms the 2025 Kicks 2.0L variable-ratio automatic identities at vehicle IDs 48259 for FWD and 48277 for AWD.[12][13]
- The NHTSA endpoints returned four model-level campaigns for Sentra and four for Kicks on 2026-11-08; every sheet labels those results VIN/equipment-specific and keeps them separate from mechanical authority.[19][20]
- **TSBs/manufacturer communications:** No TSB entry was added.
- **Owner complaints:** No complaint aggregate was added and no personal narrative was copied.

## Commercial images

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, exact-generation and commercial-license review. No image was copied, uploaded or selected as a live-app default.

## Conflicts and corrections

- Unsupported pre-publication drafts had overstated Kicks/Sentra oil and coolant quantities, invented CVT/AWD capacities, and used a 7,500-mile rotation interval. The final sheets replace those claims with exact 2025 manual values or `Needs research`.[3][4]
- No conflict remained between the final mechanical values and the exact OEM manuals.

## Unresolved gaps

- **Sentra:** exact filter part numbers, battery group/CCA, trim-specific tire-pressure table, bulb/LED inventory, CVT service quantity, TSBs, complaint aggregates and a commercially reusable exact-generation image.
- **Kicks:** exact filter part numbers, battery group/CCA, full trim-specific bulb inventory, CVT service quantity, AWD driveline capacities, TSBs, complaint aggregates and a commercially reusable exact-generation image.

## Verification and publication

- **Completed sheet count:** 3 created; 0 previously published sheets materially improved.
- **Grounded-citation verification:** all three sheets passed with 69–71% declared sentence provenance and no unknown citation IDs.
- **Repository verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with **56 vehicle sheets**.
- **Publication branch:** `vehicle-specs-library`.
- **Publication status:** guarded publisher succeeded at commit `4bc708a`; a follow-up guarded commit records this publication annotation. No deployment was triggered.

## Sources

[3] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/sentra/2025/2025-nissan-sentra-owner-manual.pdf — 2025 Nissan Sentra Owner Manual
[4] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/kicks/2025/2025-nissan-kicks-owner-manual.pdf — 2025 Nissan Kicks Owner Manual
[11] https://www.fueleconomy.gov/ws/rest/vehicle/48500 — fueleconomy.gov vehicle 48500
[12] https://www.fueleconomy.gov/ws/rest/vehicle/48259 — fueleconomy.gov vehicle 48259
[13] https://www.fueleconomy.gov/ws/rest/vehicle/48277 — fueleconomy.gov vehicle 48277
[19] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=Sentra&modelYear=2025 — NHTSA 2025 Nissan Sentra recalls
[20] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=Kicks&modelYear=2025 — NHTSA 2025 Nissan Kicks recalls
