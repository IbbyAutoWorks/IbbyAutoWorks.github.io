# Vehicle-spec library run — 2026-11-16 — Mazda CX-5 three-sheet batch

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Batch result:** Three exact US-market 2025 Mazda CX-5 AWD sheets were completed without jumping to an older phase: naturally aspirated without cylinder deactivation/stop-start, naturally aspirated with cylinder deactivation/i-stop, and turbo.

## Files changed

- `vehicle-specs/data/2025/mazda/cx-5/2.5l-na-6at-awd-no-cylinder-deactivation.md` — new researched naturally aspirated EPA 48537 sheet.
- `vehicle-specs/data/2025/mazda/cx-5/2.5l-na-cylinder-deactivation-6at-awd.md` — new researched naturally aspirated cylinder-deactivation/i-stop EPA 48538 sheet.
- `vehicle-specs/data/2025/mazda/cx-5/2.5l-turbo-6at-awd.md` — new researched turbo EPA 48539 sheet.
- `vehicle-specs/catalog.md` — added all three exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-16-mazda-cx5-three.md` — this report.

## Source set

The exact-year Mazda owner manual is the mechanical authority for engine-specific oil and coolant data, i-stop-dependent ATF and battery data, transfer/rear-differential products and capacities, brake fluid, wheel torque, tire pressures, spark-plug part numbers and LED lamp construction.[1]

The exact-year scheduled-maintenance guide supplies normal and severe oil/tire intervals, coolant and spark-plug replacement intervals, cabin-filter severe service and the table-level air-filter requirements.[2]

EPA vehicle records preserve three separate exact identities: 48537 without cylinder deactivation or stop-start, 48538 with cylinder deactivation and stop-start, and 48539 turbo without cylinder deactivation or stop-start.[3][4][5]

## Mechanical fields

- The naturally aspirated sheets record API-certified SAE 0W-20, 4.8 US qt with filter, FL-22 coolant and 8.1 US qt cooling-system capacity; the turbo sheet separately records SAE 5W-30, 5.1 US qt with filter and 9.0 US qt cooling-system capacity.[1]
- The no-stop-start naturally aspirated sheet uses ATF-FZ with a published 8.2 US qt approximate capacity; the i-stop/cylinder-deactivation sheet uses ATF-A7 with a published 7.5 US qt approximate capacity; the turbo sheet uses ATF-FZ with a published 8.5 US qt approximate capacity.[1][4][5]
- All three sheets record Mazda Long Life Hypoid Gear Oil SG1, with a 0.48 US qt transfer-case capacity for naturally aspirated variants, 0.42 US qt for turbo and 0.37 US qt rear-differential capacity for all three.[1]
- All three record DOT 3 brake fluid, 80–108 lb-ft lug-nut torque, placard-controlled tire pressure, normal 7,500-mile rotation, severe 5,000-mile rotation and all-LED exterior lamp assemblies.[1][2]
- Battery and ignition distinctions remain explicit: S-95 and P5SP-18110 for the i-stop identity; installed-battery confirmation plus PE5R-18-110-A for naturally aspirated no-i-stop; installed-battery confirmation plus PY8V-18-110 for turbo.[1][4][5]
- Non-turbo spark-plug replacement is 75,000 miles; turbo replacement is 40,000 miles. Coolant is first due at 120,000 miles/10 years and then every 60,000 miles/5 years.[2]
- Published transmission and axle numbers are labeled approximate total capacities rather than routine drain-and-fill quantities. Exact filters, spark gaps and several fixed normal-use filter intervals remain `Needs research` rather than inferred.[1][2]

## Reference enrichment

- EPA ID 48537 identifies 2.5L SIDI, 4-wheel drive, Automatic (S6), regular gasoline, no cylinder deactivation and no stop-start.[3]
- EPA ID 48538 identifies 2.5L SIDI with cylinder deactivation, 4-wheel drive, Automatic (S6), regular gasoline and stop-start.[4]
- EPA ID 48539 identifies turbocharged 2.5L SIDI, 4-wheel drive, Automatic (S6), regular gasoline, no cylinder deactivation and no stop-start.[5]
- NHTSA recalls, exact-applicability manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no bulletin was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among accepted exact-year mechanical values.
- The owner manual's fluid, battery and spark-plug tables depend on i-stop/turbo identity.[1]
- EPA separates the cylinder-deactivation/stop-start combinations, and the sheets preserve those identities instead of treating all 2.5L CX-5 vehicles as interchangeable.[3][4][5]
- The owner manual says periodic automatic-transmission-fluid replacement is unnecessary, but the published capacity is not a routine service-fill amount; the sheets preserve that distinction.[1]

## Unresolved gaps

- Exact routine transmission, transfer-case and rear-differential drain-and-fill quantities; separately published front-final-drive service data.
- Exact engine-air, cabin-air and oil-filter part numbers; spark-plug gaps; exact no-i-stop battery option mapping.
- Visual confirmation of fixed normal-use air-filter and cabin-filter table columns.
- NHTSA recalls, exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 3 new; 0 materially improved existing sheets.
- **Verified library total before publication:** 132 vehicle sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 132 vehicle sheets before publication.
- **Citation check:** Passed strict grounded-citation ledger verification; 16 prose sentences carry inline citations, and all five cited source IDs and URLs are ledger-backed. No minimum-coverage threshold was asserted.
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** Pending guarded publisher execution.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer data, accounts, payments or live data.

## Sources

[1] https://www.mazdausa.com/siteassets/global-resources/vehicle-resources/owner-manuals/2025/cx-5/2025-cx-5-owners-manual.pdf — 2025 Mazda CX-5 Owner Manual
[2] https://www.mazdausa.com/siteassets/pdf/owners-optimized/2025/cx-5/2025-cx-5-scheduled-maintenance.pdf — 2025 Mazda CX-5 Scheduled Maintenance
[3] https://www.fueleconomy.gov/ws/rest/vehicle/48537 — EPA vehicle 48537: 2025 Mazda CX-5 2.5L AWD
[4] https://www.fueleconomy.gov/ws/rest/vehicle/48538 — EPA vehicle 48538: 2025 Mazda CX-5 2.5L cylinder-deactivation AWD
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48539 — EPA vehicle 48539: 2025 Mazda CX-5 2.5L turbo AWD
