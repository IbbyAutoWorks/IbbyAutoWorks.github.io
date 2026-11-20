# Vehicle-spec library run — 2026-11-18 — Hyundai Tucson gasoline FWD/AWD

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Two exact US-market 2026 Hyundai Tucson gasoline sheets were added without duplicating catalog identities or moving to an older phase: Smartstream 2.5L GDI/8-speed automatic FWD and HTRAC AWD.[1][3]

## Files changed

- `vehicle-specs/data/2026/hyundai/tucson/2.5l-gdi-8at-fwd.md` — new gasoline FWD sheet.
- `vehicle-specs/data/2026/hyundai/tucson/2.5l-gdi-8at-awd.md` — new gasoline HTRAC AWD sheet.
- `vehicle-specs/catalog.md` — added both exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-18-hyundai-tucson-gas-two.md` — this report.

The worktree already contained the verified, uncommitted 2026 Hyundai Elantra two-sheet batch and its report from an earlier blocked publication attempt; those files were preserved and not rewritten during this Tucson research batch.

## Source set

Hyundai's exact-year NX4 Owner's Manual PDF is the primary mechanical source; its maintenance schedules, lubricant/capacity table, tire tables, battery-label example and bulb tables were cited with printed-page and section locators.[1] The official digital owner-manual landing page was retained as the companion OEM manual entry.[2]

Hyundai's official 2026 Tucson product page identifies the gasoline model as a 187-hp configuration and separates FWD from available HTRAC AWD while also distinguishing Hybrid and Plug-in Hybrid models.[3]

The EPA options endpoint returned an empty options list on 2026-11-18, so neither sheet received an EPA vehicle ID.[5] NHTSA's model-level endpoint returned five current campaigns; they were recorded only as VIN-specific recall enrichment and not as mechanical authority.[4]

## Mechanical fields

- Both sheets record full-synthetic SAE 0W-20 meeting API SN PLUS/SP or ILSAC GF-6, while preserving that the manual's 6.13-US-qt drain/refill quantity is not explicitly labeled “with filter.”[1]
- Both sheets record 8.99 US qt of phosphate-based ethylene-glycol coolant, 6.87 US qt as the published SP4M-1 automatic-transmission volume, and DOT-4 LV brake-fluid requirements.[1]
- The AWD sheet separately records API GL-5 SAE 75W-85 transfer-case and rear-differential products, published capacities of 0.65–0.71 US qt and 0.56–0.67 US qt, and 72,000-mile severe-service replacement intervals; the FWD sheet marks those systems not applicable.[1]
- Both sheets record 79–94 lb-ft wheel-fastener torque, placard-controlled tire pressure, the manual's listed 35-psi tire packages and an 8,000-mile/12-month rotation interval.[1]
- Normal/severe schedules include 8,000-mile/12-month versus 5,000-mile/6-month oil service, 96,000-mile spark plugs, 120,000-mile/120-month initial coolant replacement, 48,000-mile/48-month brake-fluid replacement and 60,000-mile severe automatic-transmission service.[1]
- Replaceable rear-lamp trade numbers are separated from LED assemblies; exact trim-to-lamp mapping remains unresolved.[1]

## Reference enrichment

- Hyundai's manual and product data preserve the gasoline FWD and HTRAC AWD records as separate variants and exclude Hybrid/PHEV mechanical data from these sheets.[1][3]
- NHTSA campaigns 25V549000, 26V047000, 26V254000, 26V316000 and 26V400000 are recorded as model-level, VIN/equipment-specific recall enrichment. They remain separate from mechanical specifications, TSBs and owner reports.[4]
- No manufacturer communication/TSB was added, no bulletin was labeled a recall, and no owner-complaint narrative or personal information was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict was found among the accepted exact-year mechanical sources.[1][3]
- The owner's manual publishes a 6.13-US-qt engine-oil drain/refill volume but does not explicitly say “with filter”; both sheets leave the requested with-filter capacity unresolved instead of silently promoting the table value.[1]
- The battery section illustrates AGM70L-DIN specifications but warns that the actual vehicle label may differ; installed-battery confirmation remains required.[1]
- EPA's options endpoint returned no 2026 Tucson records on 2026-11-18, so no EPA identity was inferred from neighboring years.[5]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers; spark-plug part number and gap; confirmed oil capacity with filter; installed-battery mapping; and exact trim-to-lamp mapping remain `Needs research`.[1]
- Routine automatic-transmission drain-and-fill procedures and service quantities remain unresolved where the owner manual supplies only a published total volume.[1]
- The AWD sheet still needs confirmation whether any separately serviceable front-differential identity exists beyond the published transfer-case entry.[1]
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images remain unresolved.[1][3][4]

## Completion, verification and publication

- **Completed sheets:** 2 new; 0 materially improved existing sheets.
- **Verified library total:** 143 vehicle sheets.
- **Verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 143 vehicle sheets.
- **Citation checks:** Both new sheets passed grounded-citation verification above 45% coverage: FWD 50% and AWD 51%. The digital-manual landing page remained registered but uncited in the individual sheets; it is cited in this run report.[2]
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** Blocked. Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with `Permission denied` because the publisher remains mode `664` and is not executable. Per the guarded-publication rule, it was not bypassed through another interpreter. Verified local files remain intact and uncommitted.
- **Branch hashes:** Local `HEAD` and remote `vehicle-specs-library` both remain `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`; no publication commit was created.
- **Preserved carryover:** The earlier verified Elantra two-sheet batch remains in the same uncommitted worktree alongside this Tucson batch because the guarded publisher is still blocked.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer data, accounts, payments or live data.

## Sources

[1] https://ownersmanual.hyundai.com/full_pdf/NX4/2026/en_US — 2026 Hyundai Tucson Owner Manual PDF
[2] https://ownersmanual.hyundai.com/full_webhelp/NX4/2026/en_US/owner.html — 2026 Hyundai Tucson Digital Owner Manual
[3] https://www.hyundaiusa.com/us/en/vehicles/tucson — 2026 Hyundai Tucson official product page
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HYUNDAI&model=TUCSON&modelYear=2026 — NHTSA 2026 Hyundai Tucson recalls
[5] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Hyundai&model=Tucson — EPA 2026 Hyundai Tucson options
