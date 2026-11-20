# Vehicle-spec library run — 2026-11-18 — verified carryover and publication retry

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Run result:** No additional vehicle sheet was started because the shared worktree already held four verified, uncommitted exact 2026 Hyundai sheets from two earlier same-day batches. This run preserved those files, reverified the complete library, and retried only the required guarded publication path.

## Files changed

- `vehicle-specs/run-reports/2026-11-18-publication-retry-four-carryover.md` — this retry report.
- Preserved without rewriting: two 2026 Hyundai Elantra sheets, two 2026 Hyundai Tucson sheets, their two prior run reports, and the corresponding `catalog.md` entries.

## Source set

The carried Elantra sheets use Hyundai's exact-year CN7 owner manual for fluids, capacities, torque, tire, lamp and maintenance data, with Hyundai's product page for powertrain identity.[1][2] NHTSA recall data remains separate enrichment.[3]

The carried Tucson sheets use Hyundai's exact-year NX4 owner manual for fluids, capacities, torque, tire, lamp and maintenance data, with Hyundai's product page for FWD/AWD identity.[4][5] NHTSA recall data remains separate enrichment.[6]

## Mechanical fields

- **Elantra:** The two preserved sheets separate the 2.0L/IVT and 1.6L turbo/7DCT powertrains, including engine-specific oil/coolant quantities, transmission products and severe-service intervals.[1]
- **Tucson:** The two preserved sheets separate gasoline FWD and HTRAC AWD, including AWD-only transfer-case/rear-differential products, capacities and severe-service intervals.[4]
- Wheel-fastener torque, placard-controlled tire-pressure warnings, rotation intervals, brake fluid, battery cautions, spark-plug intervals, bulb/LED distinctions and normal/severe maintenance paths remain recorded with exact manual locators in each sheet.[1][4]

## Reference enrichment

- Hyundai product data preserves the exact powertrain/drivetrain identities and prevents hybrid or other materially different variants from being collapsed into these four sheets.[2][5]
- NHTSA model-level campaigns are recorded only as VIN/equipment-specific recall enrichment, not as mechanical authority, TSBs or diagnoses.[3][6]
- No TSB or owner-complaint content was added during this retry run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and exact-generation review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The Tucson owner manual's 6.13-US-qt oil drain/refill value is not explicitly labeled as the requested with-filter quantity, so that field remains unresolved rather than inferred.[4]
- No new source conflict was introduced during this publication retry.

## Unresolved gaps

- Exact filter and spark-plug part numbers, spark-plug gaps, installed-battery mappings, routine transmission drain-and-fill quantities, exact trim-to-lamp mappings, TSBs, complaint aggregates and commercially reusable exact-generation images remain unresolved.
- Tucson oil capacity explicitly labeled with filter and any separately serviceable AWD front-differential identity remain unresolved.[4]

## Completion, verification and publication

- **Completed sheet count for this run:** 0 new; 0 materially improved. Four already-completed same-day sheets remain as verified carryover.
- **Verified library total:** 143 vehicle sheets.
- **Verification result:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 143 vehicle sheets.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` remains mode `664` and direct execution failed with exit 126, `Permission denied`. The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://ownersmanual.hyundai.com/full_pdf/CN7/2026/en_US — 2026 Hyundai Elantra Owner Manual
[2] https://www.hyundaiusa.com/us/en/vehicles/elantra — 2026 Hyundai Elantra official product page
[3] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HYUNDAI&model=ELANTRA&modelYear=2026 — NHTSA 2026 Hyundai Elantra recalls
[4] https://ownersmanual.hyundai.com/full_pdf/NX4/2026/en_US — 2026 Hyundai Tucson Owner Manual
[5] https://www.hyundaiusa.com/us/en/vehicles/tucson — 2026 Hyundai Tucson official product page
[6] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HYUNDAI&model=TUCSON&modelYear=2026 — NHTSA 2026 Hyundai Tucson recalls
