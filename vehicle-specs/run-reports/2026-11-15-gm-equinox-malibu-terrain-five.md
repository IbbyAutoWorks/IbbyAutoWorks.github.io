# Vehicle-spec library run — 2026-11-15 — Chevrolet Equinox/Malibu and GMC Terrain five-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Five exact US-market 2025 sheets were completed without jumping to an older phase: Chevrolet Equinox FWD/AWD crossovers, Chevrolet Malibu FWD sedan and GMC Terrain FWD/AWD crossovers.

## Files changed

- `vehicle-specs/data/2025/chevrolet/equinox/1.5l-lsd-cvt-fwd.md` — new researched CVT/FWD sheet.
- `vehicle-specs/data/2025/chevrolet/equinox/1.5l-lsd-8at-awd.md` — new researched 8-speed/AWD sheet.
- `vehicle-specs/data/2025/chevrolet/malibu/1.5l-lfv-cvt-fwd.md` — new researched CVT/FWD sedan sheet.
- `vehicle-specs/data/2025/gmc/terrain/1.5l-lsd-cvt-fwd.md` — new researched CVT/FWD sheet.
- `vehicle-specs/data/2025/gmc/terrain/1.5l-lsd-8at-awd.md` — new researched 8-speed/AWD sheet.
- `vehicle-specs/catalog.md` — added all five exact identities and the dated coverage note.
- `vehicle-specs/run-reports/2026-11-15-gm-equinox-malibu-terrain-five.md` — this report.

## Source set

- The exact-year Chevrolet Equinox owner manual is the mechanical authority for both Equinox drivetrain sheets, including FWD/AWD oil-capacity differences, CVT versus 8-speed fluids, transfer-case capacity, wheel torque, ignition data and normal/severe maintenance.[1]
- The exact-year Chevrolet Malibu owner manual supplies the sedan's oil, coolant, CVT, brake, wheel, tire, battery, lamp and maintenance data.[3]
- The exact-year GMC Terrain/Terrain Denali owner manual supplies the corresponding Terrain data while preserving the FWD CVT and AWD 8-speed paths.[4]
- EPA vehicle records independently preserve the five engine/transmission/drivetrain identities.[5][6][7]
- The additional Terrain EPA records distinguish its FWD and AWD identities.[8][9]
- NHTSA's official Malibu endpoint supplies model-level recall enrichment only, not mechanical authority.[10]

## Mechanical fields

- The Equinox and Terrain FWD sheets record SAE 0W-20 dexos1 and 4.2 qt with filter, while their AWD sheets separately record 5.3 qt, DEXRON-VI 8-speed fluid and the published 0.53-qt transfer-case capacity.[1][4]
- The Malibu sheet records SAE 0W-20 dexos1, 4.2 qt with filter, 7.4 qt whole-system coolant capacity and a CVT fluid path that remains separate from the Equinox/Terrain AWD 8-speed records.[3]
- All five sheets record DOT 4 brake fluid, 100 lb-ft wheel torque, physical-placard tire-pressure control, 7,500-mile rotation guidance, supported battery type/label cautions, spark-plug gap, bulb-versus-LED notes and normal/severe maintenance intervals.[1][3][4]
- Exact transmission service fills, unsupported axle quantities, part numbers and lamp trade numbers remain `Needs research` rather than being inferred.[1][3][4]

## Reference enrichment

- EPA IDs 48061 and 48089 preserve the Equinox FWD variable-ratio automatic and AWD 8-speed identities.[5][6]
- EPA ID 48015 preserves the Malibu 1.5L turbo/CVT/FWD identity.[7]
- EPA IDs 48603 and 48610 preserve the Terrain FWD variable-ratio automatic and AWD 8-speed identities.[8][9]
- NHTSA returned one 2025 Malibu model-level campaign on 2026-11-15: 26V212000 for a rearview-camera image concern on certain 2023–2025 vehicles; VIN applicability remains mandatory.[10]
- The NHTSA Equinox and Terrain model-level requests returned HTTP 400 during this run, so no recall counts or campaigns were asserted for those sheets.
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no bulletin was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among accepted exact-year mechanical values.
- The Equinox/Terrain manuals publish AWD transfer-case capacity but direct rear-axle product selection to current dealer/service information, so rear-axle products and capacities remain unresolved.[1][4]
- The Malibu manual says the vehicle has a standard 12-volt battery and may have AGM equipment; the sheet therefore requires the original battery label instead of assigning one battery technology to every car.[3]

## Unresolved gaps

- Exact CVT/8-speed drain-and-fill quantities, rear-axle products/capacities and separate front-final-drive service data where unpublished.
- Exact engine-air, cabin-air and oil-filter part numbers; spark-plug part numbers; battery group/CCA; and lamp trade numbers.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.
- NHTSA recall enrichment for Equinox and Terrain after the official model-level endpoint succeeds.

## Completion, verification and publication

- **Completed sheets:** 5 new; 0 materially improved existing sheets.
- **Verified library total:** 122 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 122 vehicle sheets before publication.
- **Citation check:** The report passed ledger verification at 39% sentence coverage; the only warning is an unused, failed Trax-manual discovery URL retained in the task ledger but not cited in this report.
- **Publication branch:** `vehicle-specs-library`.
- **Publication:** Pending guarded publisher execution; no deployment is permitted.

## Sources

[1] https://contentdelivery.ext.gm.com/bypass/gma-content-api/resources/sites/GMA/content/staging/MANUALS/9000/MA9284/en_US/2.0/25_CHEV_Equinox_OM_en_US_U_18110620B_2024AUG29_2P.pdf — 2025 Chevrolet Equinox Owner Manual
[3] https://contentdelivery.ext.gm.com/content/dam/cope/en_us/public/pdf_assets/active/owners_manuals_browse/2025/chevrolet/malibu/25_CHEV_Malibu_OM_en_US_U_85650750A_2024MAY14.pdf — 2025 Chevrolet Malibu Owner Manual
[4] https://contentdelivery.ext.gm.com/content/dam/cope/en_us/public/pdf_assets/active/owners_manuals_browse/2025/gmc/terrain/25_GMC_Terrain_Terrain_Denali_OM_en_US_U_18552429B_2025FEB18_2P.pdf — 2025 GMC Terrain and Terrain Denali Owner Manual
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48061 — EPA vehicle 48061: 2025 Chevrolet Equinox FWD
[6] https://www.fueleconomy.gov/ws/rest/vehicle/48089 — EPA vehicle 48089: 2025 Chevrolet Equinox AWD
[7] https://www.fueleconomy.gov/ws/rest/vehicle/48015 — EPA vehicle 48015: 2025 Chevrolet Malibu
[8] https://www.fueleconomy.gov/ws/rest/vehicle/48603 — EPA vehicle 48603: 2025 GMC Terrain FWD
[9] https://www.fueleconomy.gov/ws/rest/vehicle/48610 — EPA vehicle 48610: 2025 GMC Terrain AWD
[10] https://api.nhtsa.gov/recalls/recallsByVehicle?make=CHEVROLET&model=MALIBU&modelYear=2025 — NHTSA recalls: 2025 Chevrolet Malibu
