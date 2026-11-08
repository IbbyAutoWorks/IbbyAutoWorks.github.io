# Vehicle-spec library run report — 2026-11-08 Chevrolet Trailblazer three-powertrain batch

## Scope and phase

- **Active phase:** 2017–2026, the rolling newest ten model years as of 2026.
- **Batch result:** 3 new exact US-market sheets completed; the batch stopped below ten because exact OEM research and powertrain separation were prioritized over quota.
- **Coverage mix:** mainstream subcompact crossover with 1.2L/CVT/FWD, 1.3L/CVT/FWD and 1.3L/9-speed/AWD identities kept separate.[10][11][12]

## Files changed

- `data/2025/chevrolet/trailblazer/1.2l-lbp-cvt-fwd.md`
- `data/2025/chevrolet/trailblazer/1.3l-l3t-cvt-fwd.md`
- `data/2025/chevrolet/trailblazer/1.3l-l3t-9at-awd.md`
- `catalog.md`
- `run-reports/2026-11-08-chevrolet-trailblazer-three.md`

## Sources and mechanical fields

- The exact 2025 Chevrolet Trailblazer owner manual supports dexos1 SAE 0W-20 oil, engine-specific with-filter capacities, DEX-COOL/GMW3420 coolant and engine-specific capacities, CVT or DEXRON-VI transmission fluid, DOT 4 brake fluid, 100 lb-ft wheel torque, placard-controlled tire pressure, 7,500-mile rotation, AGM battery construction, engine-specific spark-plug gaps, lamp assembly distinctions, and normal/severe service schedules.[2]
- The AWD sheet separately records the published 0.24-qt transfer-case capacity, dealer-directed rear-axle fluid selection, 45,000-mile severe 9-speed service, 75,000-mile severe rear-axle service and 150,000-mile normal rear-axle service.[2]
- Unsupported transmission service quantities, exact filter part numbers, battery group/CCA, exact bulb trade numbers, and incomplete AWD fluid details remain `Needs research`; no neighboring-year values or calculated conversions were substituted.[2]

## Reference enrichment

- fueleconomy.gov IDs 47788, 47787 and 47792 confirm the exact 1.2L/CVT/FWD, 1.3L/CVT/FWD and 1.3L/9-speed/AWD configurations respectively.[10][11][12]
- The NHTSA endpoint returned one model-level campaign on 2026-11-08: 26V539000 for a rearview-camera image issue; all sheets label applicability VIN-specific and keep recall evidence separate from mechanical authority.[6]
- **TSBs/manufacturer communications:** No TSB entry was added.
- **Owner complaints:** No complaint aggregate was added and no personal narrative was copied.

## Commercial images

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, exact-generation and commercial-license review; no image was copied, uploaded or selected as a live-app default.

## Conflicts and corrections

- The OEM manual's cooling-system narrative says coolant is designed for five years or 150,000 miles, while the maintenance schedule says 150,000 miles or six years. Every new sheet preserves this conflict and directs the shop to current VIN-specific GM service information.[2]
- No unsupported mechanical draft values were promoted to sourced specifications.[2]

## Unresolved gaps

- Transmission service-fill quantities; exact filter part numbers; battery group/CCA; exact bulb trade numbers; FWD transaxle/front-differential detail; AWD transfer-case product/current part number, rear-axle product/capacity and front differential detail; TSBs; complaint aggregates; and a commercially reusable exact-generation image.

## Verification and publication

- **Completed sheet count:** 3 created; 0 previously published sheets materially improved.
- **Grounded-citation verification:** Citation IDs and generated source mappings passed ledger verification for all three sheets and this report; coverage diagnostics were reviewed.
- **Repository verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with **61 vehicle sheets**.
- **Publication branch:** `vehicle-specs-library`.
- **Publication status:** Guarded publisher succeeded at initial library commit `088a9cc`; local and remote branch hashes matched at `088a9ccec62578b4e1f800d1a5278c1025b339c8`. This report annotation is included in the follow-up guarded publication commit. No deployment was triggered.

## Sources

[2] https://contentdelivery.ext.gm.com/content/dam/cope/en_us/public/pdf_assets/active/owners_manuals_browse/2025/chevrolet/trailblazer/25_CHEV_Trailblazer_OM_en_US_U_85602511C_2025NOV20_3P.pdf — 2025 Chevrolet Trailblazer Owner Manual
[6] https://api.nhtsa.gov/recalls/recallsByVehicle?make=CHEVROLET&model=TRAILBLAZER&modelYear=2025 — NHTSA recalls: 2025 Chevrolet Trailblazer
[10] https://www.fueleconomy.gov/ws/rest/vehicle/47787 — EPA vehicle record 47787: 2025 Chevrolet Trailblazer FWD 1.3L CVT
[11] https://www.fueleconomy.gov/ws/rest/vehicle/47788 — EPA vehicle record 47788: 2025 Chevrolet Trailblazer FWD 1.2L CVT
[12] https://www.fueleconomy.gov/ws/rest/vehicle/47792 — EPA vehicle record 47792: 2025 Chevrolet Trailblazer AWD 1.3L 9-speed
