# Vehicle-spec library run — 2026-11-20 — Chevrolet Equinox FWD/AWD

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Batch result:** Two exact US-market 2026 Chevrolet Equinox gasoline crossover sheets were added without duplicating an existing catalog identity or moving to an older phase: 1.5L LSD/CVT/FWD and 1.5L LSD/8-speed/AWD.[4][8][9]
- Nine previously verified but uncommitted 2026 Hyundai/Nissan sheets were preserved in the shared worktree because the guarded publisher remains non-executable; they are not counted as new or materially improved in this run.

## Files changed

- `vehicle-specs/data/2026/chevrolet/equinox/1.5l-lsd-cvt-fwd.md` — new exact FWD/CVT sheet.
- `vehicle-specs/data/2026/chevrolet/equinox/1.5l-lsd-8at-awd.md` — new exact AWD/8-speed sheet.
- `vehicle-specs/catalog.md` — both exact identities and a dated coverage note added.
- `vehicle-specs/run-reports/2026-11-20-chevrolet-equinox-two.md` — this report.
- Preserved without rewriting: the nine verified Hyundai Elantra/Tucson and Nissan Frontier/Sentra/Altima carryover sheets and their earlier reports.

## Source set

Chevrolet's exact-year 2026 Equinox Owner's Manual is the primary mechanical authority; printed pp. 162, 220–234, 247–253 and 280–290 support the populated oil, coolant, transmission, brake, wheel, tire, filter, battery, spark, lighting, maintenance and drivetrain fields.[4]

EPA vehicle 49442 confirms the FWD 1.5L four-cylinder, variable-ratio automatic, regular-gasoline and stop/start identity, while EPA vehicle 49480 confirms the separate AWD 1.5L four-cylinder, 8-speed automatic, regular-gasoline and stop/start identity.[8][9]

The NHTSA model-level recall endpoint returned campaign 26V114000 on 2026-11-20; it is retained only as VIN-specific recall enrichment and not as mechanical authority or a TSB.[7]

## Mechanical fields

- **Engine and cooling:** Both sheets record dexos1 full-synthetic SAE 0W-20, 6.4 qt of 50/50 DEX-COOL/GMW3420 coolant, and separate with-filter oil quantities of 4.2 qt FWD versus 5.3 qt AWD.[4]
- **Transmission and drivetrain:** The FWD sheet records HPCVTF for the CVT and marks AWD systems not applicable; the AWD sheet records DEXRON-VI, a 0.53-qt transfer-case capacity and explicit unresolved rear-axle product/capacity fields.[4][8][9]
- **Brake, wheels and tires:** Both sheets record DOT 4 brake fluid, 100-lb-ft wheel torque, placard-authority tire-pressure warnings and the 7,500-mile rotation interval/pattern guidance.[4]
- **Filters, battery, ignition and lights:** Both sheets preserve unknown part numbers, record a maintenance-free AGM 12-volt battery, a 0.024–0.028-inch factory spark gap and all-LED exterior-light assemblies with no serviceable incandescent sources.[4]
- **Normal/severe service:** Both sheets preserve oil-life/annual service, five-year brake fluid, 22,500-mile/24-month cabin filter, 60,000-mile spark plugs and 150,000-mile/six-year coolant service. Severe transmission service remains split between CVT fluid/filter and 8-speed fluid; AWD rear-axle timing remains confined to the AWD sheet.[4]

## Reference enrichment

- EPA records are used only to confirm engine, transmission, fuel, drivetrain and stop/start identity; they are not mechanical-service authority.[8][9]
- NHTSA campaign 26V114000 is labeled as a model-level, VIN-specific recall concerning electronic owner's-manual download configuration, separate from TSBs and mechanical specifications.[7]
- No manufacturer communication/TSB or owner-complaint aggregate was added during this run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and identity review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict was found among the accepted exact-year mechanical sources.[4][8][9]
- The owner manual does not publish routine transmission service-fill quantities, a separate front-differential specification/capacity or a rear-axle product/capacity; those fields remain unresolved rather than inferred.[4]

## Unresolved gaps

- CVT and 8-speed service quantities; separately serviceable front-differential mapping; exact AWD transfer-case product; rear-axle product/capacity; exact engine-air, cabin-air and oil-filter part numbers; battery group/CCA; spark-plug part number; exact-applicability TSBs; complaint aggregates; and a commercially reusable exact-generation image remain unresolved.[4]

## Completion, verification and publication

- **Completed sheet count for this run:** 2 new; 0 materially improved existing sheets.
- **Verified library total:** 150 vehicle sheets.
- **Verification result:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 150 vehicle sheets.
- **Citation verification:** Both new sheets passed the grounded-citation evidence gate with at least 50% declared-provenance coverage.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; its mode is `664` (`-rw-rw-r--`). The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources