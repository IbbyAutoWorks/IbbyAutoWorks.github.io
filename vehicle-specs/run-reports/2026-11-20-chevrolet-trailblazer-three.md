# Vehicle-spec library run — 2026-11-20 — Chevrolet Trailblazer three-variant batch

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Batch result:** Three exact US-market 2026 Chevrolet Trailblazer gasoline crossover sheets were added without duplicating an existing catalog identity or moving to an older phase: 1.2L LBP/CVT/FWD, 1.3L L3T/CVT/FWD and 1.3L L3T/9-speed/AWD.[1][2][3]
- **Carryover publication:** Before new research, the guarded publisher successfully committed and pushed the previously verified eleven-sheet Hyundai/Nissan/Chevrolet Equinox carryover as `4dc320aca523a55d2027b5022dae009e0bca3b37`; local and remote branch hashes matched.

## Files changed

- `vehicle-specs/data/2026/chevrolet/trailblazer/1.2l-lbp-cvt-fwd.md` — new exact 1.2L flex-fuel CVT/FWD sheet.
- `vehicle-specs/data/2026/chevrolet/trailblazer/1.3l-l3t-cvt-fwd.md` — new exact 1.3L gasoline CVT/FWD sheet.
- `vehicle-specs/data/2026/chevrolet/trailblazer/1.3l-l3t-9at-awd.md` — new exact 1.3L gasoline 9-speed/AWD sheet.
- `vehicle-specs/catalog.md` — three exact identities and a dated coverage note added.
- `vehicle-specs/run-reports/2026-11-20-chevrolet-trailblazer-three.md` — this report.

## Source set

Chevrolet's exact-year 2026 Trailblazer Owner's Manual is the primary mechanical authority; printed pp. 201–214, 217–222, 235–242 and 274–284 support the populated oil, coolant, transmission, brake, wheel, tire, filter, battery, spark, lighting, maintenance and drivetrain fields.[5]

EPA vehicle 49443 confirms the FWD 1.2L three-cylinder, variable-ratio automatic, gasoline/E85 and stop/start identity; EPA vehicle 49444 confirms the separate FWD 1.3L three-cylinder, variable-ratio automatic, regular-gasoline and stop/start identity; EPA vehicle 49481 confirms the AWD 1.3L three-cylinder, 9-speed automatic, regular-gasoline and stop/start identity.[1][2][3]

The NHTSA model-level recall endpoint returned campaign 26V539000 on 2026-11-20; it is retained only as VIN-specific recall enrichment and not as mechanical authority or a TSB.[4]

## Mechanical fields

- **Engine and cooling:** All three sheets record dexos1 full-synthetic SAE 0W-20. The 1.2L sheet records 4.2 qt with filter and 6.7 qt entire-system coolant; both 1.3L sheets record 4.8 qt with filter and 7.8 qt entire-system coolant.[5]
- **Transmission and drivetrain:** Both FWD sheets record High Performance CVT Fluid and mark AWD systems not applicable. The AWD sheet records DEXRON-VI, a 0.24-qt transfer-case capacity and explicit unresolved rear-axle product/capacity fields.[5]
- **Brake, wheels and tires:** All sheets record DOT 4 brake fluid, 100-lb-ft wheel torque, placard-authority tire-pressure warnings and the 7,500-mile rotation interval/pattern guidance.[5]
- **Filters, battery, ignition and lights:** All sheets preserve unknown part numbers, record a maintenance-free AGM 12-volt battery and distinguish serviceable incandescent sources from LED assemblies. The 1.2L factory spark gap is 0.024–0.028 in; both 1.3L sheets use 0.026–0.030 in.[5]
- **Normal/severe service:** All sheets preserve oil-life/annual service, five-year brake fluid, 22,500-mile/24-month cabin filter, 60,000-mile spark plugs and 150,000-mile/six-year maintenance-schedule coolant service. Severe transmission service remains split between CVT fluid/filter and 9-speed fluid; AWD rear-axle timing remains confined to the AWD sheet.[5]

## Reference enrichment

- EPA records are used only to confirm engine, transmission, fuel, drivetrain and stop/start identity; they are not mechanical-service authority.[1][2][3]
- NHTSA campaign 26V539000 is labeled as a model-level, VIN-specific recall concerning rearview-camera image distortion or blank display, separate from TSBs and mechanical specifications.[4]
- No manufacturer communication/TSB or owner-complaint aggregate was added during this run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and identity review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The owner manual's cooling-system narrative says five years or 150,000 mi, while its maintenance schedule says 150,000 mi or six years; all three sheets preserve the conflict and direct the shop to current VIN-specific GM service information.[5]
- The owner manual does not publish routine transmission service-fill quantities, a separate front-differential specification/capacity or a rear-axle product/capacity; those fields remain unresolved rather than inferred.[5]

## Unresolved gaps

- CVT and 9-speed service quantities; separately serviceable front-differential mapping; exact AWD transfer-case product; rear-axle product/capacity; exact engine-air, cabin-air and oil-filter part numbers; battery group/CCA; spark-plug part numbers; exact bulb trade numbers; exact-applicability TSBs; complaint aggregates; and a commercially reusable exact-generation image remain unresolved.[5]

## Completion, verification and publication

- **Completed sheet count for this run:** 3 new; 0 materially improved existing sheets.
- **Verified library total:** 153 vehicle sheets.
- **Citation verification:** The report and all three sheets passed ledger/source-block verification; unsupported fields remain explicit research gaps. The optional 50% prose-coverage threshold was not used because the structured field lines are not counted reliably by that sentence parser.
- **Verification result:** Passed `git diff --check` and `python scripts/verify-vehicle-spec-markdown.py` with 153 vehicle sheets.
- **Publication branch:** `vehicle-specs-library`.
- **Publication status:** Guarded publisher succeeded with content commit `61917257d5acf74168a19bc0621d3f6885b84154`; local and remote `vehicle-specs-library` hashes matched, and no deployment was triggered.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://www.fueleconomy.gov/ws/rest/vehicle/49443 — EPA vehicle 49443: 2026 Chevrolet Trailblazer FWD FFV 1.2L CVT
[2] https://www.fueleconomy.gov/ws/rest/vehicle/49444 — EPA vehicle 49444: 2026 Chevrolet Trailblazer FWD 1.3L CVT
[3] https://www.fueleconomy.gov/ws/rest/vehicle/49481 — EPA vehicle 49481: 2026 Chevrolet Trailblazer AWD 1.3L 9-speed
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=CHEVROLET&model=TRAILBLAZER&modelYear=2026 — NHTSA recalls: 2026 Chevrolet Trailblazer
[5] https://contentdelivery.ext.gm.com/content/dam/cope/en_us/public/pdf_assets/active/owners_manuals_browse/2026/chevrolet/trailblazer/26_CHEV_Trailblazer_OM_en_US_U_86539123B_2025JUN03_2P.pdf — 2026 Chevrolet Trailblazer Owner Manual
