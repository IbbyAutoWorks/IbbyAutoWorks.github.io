# Vehicle-spec library run — 2026-11-19 — Nissan Altima FWD

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Batch result:** One exact US-market 2026 Nissan Altima passenger-car sheet was added without duplicating an existing filename/catalog identity or moving to an older phase: 2.5L PR25DD inline-4, Xtronic CVT, front-wheel drive and EPA vehicle 50064.[1][3][5]
- Seven previously verified but uncommitted 2026 Hyundai Elantra/Tucson and Nissan Frontier/Sentra sheets were preserved in the shared worktree because the guarded publisher remains non-executable; this run did not count them as new or materially improved sheets.

## Files changed

- `vehicle-specs/data/2026/nissan/altima/2.5l-pr25dd-cvt-fwd-epa-50064.md` — new exact FWD Altima sheet.
- `vehicle-specs/catalog.md` — exact identity and dated coverage note added.
- `vehicle-specs/run-reports/2026-11-19-nissan-altima-fwd-one.md` — this report.
- Preserved without rewriting: the seven verified carryover sheets, their prior reports and prior publication-retry reports.

## Source set

Nissan's exact-year 2026 Altima Owner Manual is the primary mechanical authority; printed pages 410–443, 448–478 and 482 support the populated fluid, capacity, torque, tire, filter, battery, bulb, ignition and maintenance fields.[1]

Nissan's official US page confirms the 2026 Altima and available Intelligent AWD, while EPA option record 50064 identifies the exact 2.5L, variable-ratio automatic/CVT, regular-gasoline, front-wheel-drive identity used for this sheet.[2][3][5]

## Mechanical fields

- Recorded 0W-20 API SP/ILSAC GF-6A guidance and approximately 5.2 L/5 1/2 US qt with-filter capacity.[1]
- Recorded blue long-life coolant and approximately 8.3 L/2 1/4 US gal capacity with reservoir, while preserving the manual's internal first-time-limit conflict.[1]
- Recorded Nissan NS-3 CVT fluid and DOT 3 brake fluid while leaving unpublished service quantities as `Needs research`.[1]
- Recorded 83-ft-lb wheel torque, placard-controlled 33-psi reference pressures for the listed original tire sizes and 10,000-mile rotation timing.[1]
- Recorded air/cabin/oil-filter guidance, sealed maintenance-free battery limitations, DXE22H11C plugs with 0.043-inch gap, and the manual's replaceable-bulb inventory versus LED assemblies.[1]
- Recorded normal/oil-control and severe-use maintenance paths; FWD excludes all AWD-only differential/transfer-case service fields.[1][5]

## Reference enrichment

- EPA vehicle 50064 is used only to preserve the exact FWD powertrain identity; it is not treated as mechanical-service authority.[3][5]
- Nissan's product page is used only to establish that Intelligent AWD is available and must remain a separate material variant.[2]
- No NHTSA campaign was asserted because the official model endpoint did not return usable data during this run.[4]
- No TSB or aggregate owner-complaint entry was added.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and identity review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The owner manual agrees on the coolant first-replacement mileage of 105,000 miles and the later 75,000-mile/60-month recurrence, but printed pp. 410–411 and the schedule footnote state seven years/84 months while the printed p. 467 table heading says 126 months. The sheet is marked `conflict` and does not silently choose a first time limit.[1]
- No second source was found that safely resolves that exact-year internal OEM conflict.

## Unresolved gaps

- CVT service quantity, exact filter part numbers, replacement-battery group/CCA, tire-rotation pattern, exact trim lamp mapping, corrected coolant first time limit, exact AWD government identity, exact-applicability TSBs, complaint aggregates and a commercially reusable exact-generation image remain unresolved.[1]

## Completion, verification and publication

- **Completed sheets:** 1 new; 0 materially improved existing sheets.
- **Verified library total:** 147 vehicle sheets.
- **Vehicle-spec verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 147 vehicle sheets.
- **Citation verification:** The new sheet and this report passed strict ledger/source integrity checks. Their specification bullets contain multiple sentence fragments, so low sentence-count coverage warnings do not indicate unknown citation IDs or a mismatched Sources block.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`. The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Branch state after the failed attempt:** Local `HEAD` and remote `vehicle-specs-library` both remain `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/altima/2026/2026-nissan-altima-owner-manual.pdf — 2026 Nissan Altima Owner Manual
[2] https://www.nissanusa.com/vehicles/cars/altima.html — 2026 Nissan Altima official product page
[3] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Nissan&model=Altima — EPA 2026 Nissan Altima options
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=ALTIMA&modelYear=2026 — NHTSA 2026 Nissan Altima recalls
[5] https://www.fueleconomy.gov/ws/rest/vehicle/50064 — EPA vehicle 50064 — 2026 Nissan Altima
