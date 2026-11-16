# Vehicle-spec library run — 2026-11-16 — Buick Encore GX three-sheet batch

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Batch result:** Three exact US-market 2025 Buick Encore GX crossover sheets were completed without jumping to an older phase: 1.2L flex-fuel CVT/FWD, 1.3L gasoline CVT/FWD and 1.3L gasoline 9-speed/AWD.
- **Preflight cleanup:** The previously verified five-sheet GM batch was published first at commit `7bb3bcb62dba5cea56ace1311e13e005797cd74f`; local and remote `vehicle-specs-library` hashes matched before this batch began.

## Files changed

- `vehicle-specs/data/2025/buick/encore-gx/1.2l-lbp-cvt-fwd.md` — new researched 1.2L flex-fuel CVT/FWD sheet.
- `vehicle-specs/data/2025/buick/encore-gx/1.3l-l3t-cvt-fwd.md` — new researched 1.3L gasoline CVT/FWD sheet.
- `vehicle-specs/data/2025/buick/encore-gx/1.3l-l3t-9at-awd.md` — new researched 1.3L gasoline 9-speed/AWD sheet.
- `vehicle-specs/catalog.md` — added all three exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-16-buick-encore-gx-three.md` — this report.

## Source set

The exact-year Buick Encore GX owner manual is the mechanical authority for all three sheets, including engine-specific oil/coolant capacities, CVT versus 9-speed fluids, AWD transfer-case capacity, wheel torque, spark gaps, lamp service paths and normal/severe maintenance.[2]

EPA vehicle records preserve the three separate engine, transmission, drivetrain, fuel and Stop/Start identities: 47786 for the 1.2L flex-fuel CVT/FWD, 47785 for the 1.3L gasoline CVT/FWD and 47791 for the 1.3L gasoline 9-speed/AWD.[3][4][5]

NHTSA's official year/make/model endpoint supplies model-level recall enrichment only and is not used as mechanical authority.[6]

## Mechanical fields

- The 1.2L sheet records SAE 0W-20 dexos1, 4.2 qt with filter, 6.7 qt whole-system coolant capacity and a 0.024–0.028 in factory spark gap.[2]
- Both 1.3L sheets separately record 4.8 qt oil, 7.8 qt whole-system coolant capacity and a 0.025–0.030 in factory spark gap.[2]
- The FWD sheets use GM High Performance CVT Fluid and exclude AWD hardware; the AWD sheet uses DEXRON-VI, records the published 0.24-qt transfer-case capacity and leaves the unnamed rear-axle product/capacity unresolved.[2]
- All three sheets record DOT 4 brake fluid, 100 lb-ft wheel torque, physical-placard tire-pressure control, 7,500-mile tire rotation, AGM Stop/Start battery requirements, replaceable base rear bulbs versus uplevel LED assemblies and normal/severe maintenance intervals.[2][3][4]
- Exact transmission service fills, axle products/capacities, filter/plug part numbers, battery group/CCA and lamp trade numbers remain `Needs research` rather than being inferred.[2]

## Reference enrichment

- EPA ID 47786 identifies the 1.2L turbo CVT/FWD configuration as gasoline-or-E85 flex fuel with Stop/Start.[4]
- EPA ID 47785 identifies the 1.3L turbo CVT/FWD configuration as regular gasoline with Stop/Start.[3]
- EPA ID 47791 identifies the 1.3L turbo 9-speed/AWD configuration as regular gasoline with Stop/Start.[5]
- NHTSA returned one 2025 Encore GX model-level campaign on 2026-11-16: 26V539000 for rearview-camera image distortion or a blank display on certain vehicles; VIN applicability remains mandatory.[6]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no bulletin was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among accepted exact-year mechanical values.
- The owner manual publishes the AWD transfer-case capacity but directs rear-axle fluid selection to current dealer/service information, so the rear-axle product and capacity remain unresolved.[2]
- Exact 12-volt battery replacement numbers remain label/VIN dependent; the sheets do not assign a group size or CCA from memory.[2]

## Unresolved gaps

- Exact CVT and 9-speed drain-and-fill quantities, rear-axle product/capacity and separate front-final-drive service data.
- Exact engine-air, cabin-air, oil-filter and spark-plug part numbers; battery group/CCA; and lamp trade numbers.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 3 new; 0 materially improved existing sheets.
- **Verified library total:** 125 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 125 vehicle sheets before publication.
- **Citation check:** The run report passed ledger verification at 40% sentence coverage; the only warning is one unused failed Trax-manual discovery URL retained in the task ledger but not cited here.
- **Publication branch:** `vehicle-specs-library`.
- **Publication:** The guarded publisher committed and pushed the three sheets, catalog update and initial report at `81bd2c8`; no deployment was triggered.

## Sources

[2] https://contentdelivery.ext.gm.com/bypass/gma-content-api/resources/sites/GMA/content/staging/MANUALS/9000/MA9150/en_US/2.0/25_BUI_Encore_GX_OM_en_US_U_85602505B_2024MAY24_2P.pdf — 2025 Buick Encore GX Owner Manual
[3] https://www.fueleconomy.gov/ws/rest/vehicle/47785 — EPA vehicle 47785: 2025 Buick Encore GX FWD 1.3L
[4] https://www.fueleconomy.gov/ws/rest/vehicle/47786 — EPA vehicle 47786: 2025 Buick Encore GX FWD 1.2L
[5] https://www.fueleconomy.gov/ws/rest/vehicle/47791 — EPA vehicle 47791: 2025 Buick Encore GX AWD 1.3L
[6] https://api.nhtsa.gov/recalls/recallsByVehicle?make=BUICK&model=ENCORE%20GX&modelYear=2025 — NHTSA recalls: 2025 Buick Encore GX
