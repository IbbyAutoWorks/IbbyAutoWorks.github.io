# Vehicle-spec library run — 2026-11-17 — Kia Sorento four-sheet batch

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Batch result:** Four exact US-market 2026 Kia Sorento gasoline sheets were added without jumping to an older phase: naturally aspirated 2.5L/8AT FWD and AWD, plus turbo 2.5L/wet-DCT FWD and AWD.

## Files changed

- `vehicle-specs/data/2026/kia/sorento/2.5l-gdi-8at-fwd.md` — new conflict-status naturally aspirated FWD sheet.
- `vehicle-specs/data/2026/kia/sorento/2.5l-gdi-8at-awd.md` — new conflict-status naturally aspirated AWD sheet.
- `vehicle-specs/data/2026/kia/sorento/2.5l-t-gdi-8dct-fwd.md` — new conflict-status turbo FWD sheet.
- `vehicle-specs/data/2026/kia/sorento/2.5l-t-gdi-8dct-awd.md` — new conflict-status turbo AWD sheet.
- `vehicle-specs/catalog.md` — added four exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-17-kia-sorento-four.md` — this report.

## Source set

The exact-year Kia Owner's Manual is the primary mechanical source for oil specifications and drain/refill quantity, coolant specification/capacity, 8AT and wet-DCT fluids, AWD transfer/rear-differential fluids, DOT 4 brake fluid, wheel torque, tire pressure, bulb construction and normal/severe maintenance intervals.[3]

Kia's official 2026 pricing matrix confirms the exact engine, transmission and drivetrain combinations, while Kia's official specification page supplies battery and spark-plug construction details but also exposes unresolved oil/coolant capacity conflicts against the owner manual.[8][9]

The fueleconomy.gov options endpoint returned no 2026 Sorento records on 2026-11-17, so no EPA vehicle ID was accepted.[5]

The NHTSA model-level endpoint returned campaigns 25V745000 and 26V046000; they are kept as VIN/equipment-specific recall enrichment and are not used as mechanical authority.[10]

## Mechanical fields

- Naturally aspirated sheets record full-synthetic SAE 0W-20; turbo sheets record full-synthetic SAE 0W-30. The owner manual states 6.13 US qt (5.8 L) drain/refill for both engines.[3]
- Naturally aspirated sheets record phosphate-based ethylene-glycol coolant and the owner-manual 9.72 US qt (9.2 L) figure; turbo sheets record the same coolant specification and the owner-manual 8.88 US qt (8.4 L) figure.[3]
- The 2.5L GDI sheets preserve SP4M-1 8AT fluid and a 6.87 US qt (6.5 L) published volume. The turbo sheets separately preserve wet-DCT gear oil at 3.49–3.59 US qt and hydraulic-control oil at 2.59–2.64 US qt; routine service-fill procedures remain unresolved.[3]
- AWD sheets separately record API GL-5 SAE 75W-85 rear-differential fluid at 0.56–0.66 US qt. The naturally aspirated AWD transfer case is 0.65–0.72 US qt, while the turbo AWD transfer case is 0.51–0.55 US qt.[3]
- All four sheets record DOT 4 brake fluid, 79–94 lb-ft wheel-fastener torque, placard-controlled tire pressure, 8,000-mile/12-month rotation, normal and severe oil service, filter schedules, coolant timing, brake-fluid timing, spark-plug timing and replaceable-bulb versus LED distinctions.[3]
- Kia Media's 70 Ah naturally aspirated and 60 Ah turbo battery entries are recorded with installed-label/CCA/construction confirmation warnings. Exact filter part numbers, oil-filter number and spark-plug part/gap remain `Needs research`.[8]

## Reference enrichment

- Kia's pricing table preserves four exact configurations instead of collapsing engine, transmission and drivetrain variants.[9]
- NHTSA campaign 25V745000 concerns an incorrect temporary spare tire on certain 2026 Sorento vehicles; campaign 26V046000 concerns instrument-panel display software on certain 2025–2026 Kia vehicles. Both remain VIN/equipment-specific and separate from TSBs, complaints and mechanical specifications.[10]
- No manufacturer communication/TSB was added, and no owner-complaint narrative or personal information was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The owner manual lists 5.8 L as the engine-oil drain/refill quantity for both engines, while Kia Media lists 6.8 L as “lubricant oil capacity.” The sheets preserve both official figures and do not silently treat the broader capacity label as a filter-service quantity.[3][8]
- The owner manual lists cooling-system capacities of 9.2 L for the naturally aspirated engine and 8.4 L for the turbo engine, while Kia Media lists engine-coolant capacities of 3.8 L and 3.3 L respectively. The intended circuit/fill definitions need current Kia service-information confirmation.[3][8]
- All four sheets are marked `conflict` and require shop review before the disputed capacity fields are used.

## Unresolved gaps

- Current Kia service information resolving the oil and coolant capacity definitions.
- Exact routine drain-and-fill procedure/quantity for the 8AT and both wet-DCT oil circuits; visual confirmation of the severe-use DCT replacement interval.
- Exact engine-air, cabin-air and oil-filter part numbers; battery group/CCA/construction; spark-plug part numbers and gaps.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 4 new; 0 materially improved existing sheets.
- **Verified library total before publication:** 136 vehicle sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 136 vehicle sheets.
- **Citation check:** Passed grounded-citation ledger verification: 47 prose sentences, 14 with declared provenance, five distinct cited sources, and an automatically rendered ledger-backed Sources block. Strict mode was not asserted because five exploratory sources remained registered but uncited.
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** Guarded publisher committed and pushed the verified batch at `36314f5`. The publisher file was not executable by mode, so the same guarded script was invoked with Python; its branch, path, credential-scan, verification and no-deployment safeguards remained in force. This finalized report-status update is published through the same guarded path.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer data, accounts, payments or live data.

## Sources

[3] https://ownersmanual.kia.com/full_pdf/MQ4A/2026/en_US — 2026 Kia Sorento Owner Manual
[5] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Kia&model=Sorento — EPA 2026 Kia Sorento options
[8] https://www.kiamedia.com/us/en/models/sorento/2026/specifications — 2026 Kia Sorento Specifications
[9] https://www.kiamedia.com/us/en/models/sorento/2026/pricing — 2026 Kia Sorento Pricing and Powertrain Matrix
[10] https://api.nhtsa.gov/recalls/recallsByVehicle?make=KIA&model=SORENTO&modelYear=2026 — NHTSA 2026 Kia Sorento Recalls
