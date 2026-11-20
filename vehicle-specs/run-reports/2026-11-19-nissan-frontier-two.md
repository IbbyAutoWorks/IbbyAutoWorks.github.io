# Vehicle-spec library run — 2026-11-19 — Nissan Frontier 2WD/4WD

## Active phase

- **Phase:** 2017–2026, the current model year plus previous nine model years.
- **Batch result:** Two exact US-market 2026 Nissan Frontier pickup sheets were added without duplicating catalog identities or moving to an older phase: 3.8L VQ38DD/9-speed automatic 2WD and part-time 4WD.[1][7][8]

## Files changed

- `vehicle-specs/data/2026/nissan/frontier/3.8l-v6-9at-2wd.md` — new 2WD/rear-wheel-drive sheet.
- `vehicle-specs/data/2026/nissan/frontier/3.8l-v6-9at-4wd.md` — new part-time 4WD sheet with an explicit source conflict.
- `vehicle-specs/catalog.md` — added both exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-19-nissan-frontier-two.md` — this report.
- Preserved without rewriting: four verified, uncommitted 2026 Hyundai Elantra/Tucson sheets and their earlier run reports, which remain in the shared worktree because the guarded publisher was previously non-executable.

## Source set

Nissan's exact-year 2026 Frontier Owner Manual is the primary mechanical source; its printed pages 353, 359–361, 369–371, 378–379, 387, 389–410, 414 and 418 support the populated fluids, capacities, torque, tire, filters, battery, bulbs, ignition and maintenance fields.[1]

EPA vehicle records 49833 and 49838 preserve the exact 3.8L six-cylinder/automatic 9-speed rear-wheel-drive and part-time four-wheel-drive identities.[7][8] Nissan's official product page independently describes the 2026 Frontier as a V6 midsize pickup with available 4x4 capability.[2]

NHTSA's official model-level endpoint returned one campaign on 2026-11-19; it remains separate recall enrichment rather than mechanical authority, a TSB or a diagnosis.[6]

## Mechanical fields

- Both sheets record 0W-20 API SP/ILSAC GF-6A oil guidance, approximately 5 1/4 US qt with filter, approximately 3 1/8 US gal of blue long-life coolant, Matic P ATF, DOT 3 brake fluid and rear GL-5 75W-90 differential oil.[1]
- The 2WD sheet marks the transfer case and front differential not applicable; the 4WD sheet separately records Nissan ATF D3M transfer fluid, front GL-5 80W-90 and rear GL-5 75W-90 specifications.[1][7][8]
- Both sheets record 98 ft-lb wheel-fastener torque, placard-controlled cold tire pressure and a 7,500-mile tire-rotation interval.[1]
- Filters, sealed maintenance-free battery cautions, FXE22HR-11 spark plugs with 0.043-inch nominal gap, replaceable 7444NA/912 bulbs versus LED assemblies, and normal/severe maintenance paths are recorded with exact printed-page locators.[1]

## Reference enrichment

- EPA IDs 49833 and 49838 keep the 2WD and part-time 4WD identities distinct and are used only for identity confirmation.[7][8]
- NHTSA campaign 26V023000 concerns certain 2025–2026 Frontier door strikers; VIN applicability remains mandatory and the campaign is not represented as a service bulletin or mechanical specification.[6]
- No TSB or aggregate owner-complaint entry was added during this run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, direct-image, creator, exact commercial-license/version, attribution, modification/share-alike, hotlinking and identity review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The 2026 owner-manual front-final-drive table prints `0.85 L` beneath a mislabeled `US Measure` row and separately prints `1-3/4 qt`; those quantities conflict, so the 4WD capacity remains `Needs research` and the sheet is marked `conflict`.[1]
- The same manual labels the transfer-fluid heading `AWD`, while EPA identifies the exact Frontier variant as part-time 4WD; the 4WD sheet requires VIN/service-information confirmation before using the published transfer value.[1][8]

## Unresolved gaps

- Automatic-transmission routine service quantity, corrected front-differential capacity, exact transfer-case nomenclature/service applicability, filter part numbers, replacement-battery group/CCA, rotation pattern, complete cab/bed/trim-specific tire and lamp mappings, exact-applicability TSBs, complaint aggregates and commercially reusable exact-generation images remain unresolved.[1]

## Completion, verification and publication

- **Completed sheets:** 2 new; 0 materially improved existing sheets.
- **Verified library total:** 145 vehicle sheets.
- **Verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 145 vehicle sheets.
- **Citation integrity:** Both sheets passed grounded-citation ledger verification; the ledger reported low sentence-count coverage because each source-backed specification bullet contains multiple sentence fragments, but all populated field bullets carry inline source IDs and exact manual locators.
- **Publication branch:** `vehicle-specs-library`; remote publication was not changed by this run.
- **Publication result:** Blocked. Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; `stat` reports mode `664` (`-rw-rw-r--`). Per the guarded-publication rule, the publisher was not bypassed through another interpreter, no commit was created, and all verified local files remain intact.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer/work-order data, secrets, accounts, payments or live data.

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/frontier/2026/2026-nissan-frontier-owner-manual.pdf — 2026 Nissan Frontier Owner Manual
[2] https://www.nissanusa.com/vehicles/trucks/2026-frontier.html — 2026 Nissan Frontier official product page
[6] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=FRONTIER&modelYear=2026 — NHTSA 2026 Nissan Frontier recalls
[7] https://www.fueleconomy.gov/ws/rest/vehicle/49833 — EPA vehicle 49833 — 2026 Nissan Frontier 2WD
[8] https://www.fueleconomy.gov/ws/rest/vehicle/49838 — EPA vehicle 49838 — 2026 Nissan Frontier 4WD
