# Vehicle-spec library run — 2026-11-16 — Envista and Traverse four-sheet batch

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Batch result:** Four exact US-market 2025 sheets were completed without jumping to an older phase: Buick Envista LIH regular-gasoline FWD, Buick Envista LBP flex-fuel FWD, Chevrolet Traverse FWD and Chevrolet Traverse AWD.

## Files changed

- `vehicle-specs/data/2025/buick/envista/1.2l-lih-6at-fwd.md` — new researched regular-gasoline sheet.
- `vehicle-specs/data/2025/buick/envista/1.2l-lbp-flex-fuel-6at-fwd.md` — new researched flex-fuel sheet.
- `vehicle-specs/data/2025/chevrolet/traverse/2.5l-lk0-8at-fwd.md` — new researched FWD sheet.
- `vehicle-specs/data/2025/chevrolet/traverse/2.5l-lk0-8at-awd.md` — new researched AWD sheet.
- `vehicle-specs/catalog.md` — added all four exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-16-envista-traverse-four.md` — this report.

## Source set

The exact-year Buick Envista owner manual is the mechanical authority for both Envista sheets, including VIN engine codes, oil/coolant capacities, DEXRON-VI, brake fluid, wheel torque, spark gaps, bulbs and normal/severe maintenance.[1]

The exact-year Chevrolet Traverse owner manual is the mechanical authority for both Traverse sheets, including the LK0/VIN-S identity, FWD/AWD distinctions, oil/coolant capacities, DEXRON-VI, brake fluid, wheel torque, AGM battery, spark gap, LED assemblies and normal/severe maintenance.[2]

EPA vehicle records preserve the two Envista fuel identities: 47780 regular-gasoline Envista and 47941 flex-fuel Envista.[3][4]

Separate EPA records preserve the Traverse drivetrains: 48110 FWD and 48117 AWD.[5][6]

NHTSA's official year/make/model endpoints supply model-level recall enrichment only and are not used as mechanical authority.[7][8]

## Mechanical fields

- Both Envista sheets record SAE 0W-20 dexos1, 4.2 qt with filter, 6.7 qt whole-system coolant capacity, DEXRON-VI, DOT 4, 100 lb-ft wheel torque and a 0.024–0.028 in factory spark gap.[1]
- The Envista sheets keep VIN-2 LIH regular gasoline separate from VIN-P LBP flex fuel and require the yellow flex-fuel label before E85 use.[1][3][4]
- Both Traverse sheets record SAE 0W-20 dexos1, 5.5 qt with filter, 17.9 qt whole-system coolant capacity, DEXRON-VI, DOT 4, 140 lb-ft wheel torque, AGM battery construction and a 0.026–0.030 in factory spark gap.[2]
- The Traverse AWD sheet separately records the transfer-case no-normal-maintenance statement and normal/severe rear-axle intervals while leaving products and capacities unresolved; the FWD sheet excludes that hardware.[2][5][6]
- All four sheets record placard-controlled tire pressure, 7,500-mile rotation, oil-life service, 22,500-mile/24-month cabin-filter service, six-year/150,000-mile coolant service, five-year brake-fluid service and 60,000-mile spark-plug service.[1][2]
- Exact transmission service fills, final-drive/axle products and capacities, filter/plug part numbers, selected battery ratings and exact-applicability bulletins remain `Needs research` rather than being inferred.[1][2]

## Reference enrichment

- EPA ID 47780 identifies the regular-gasoline 1.2L turbo, 6-speed/FWD, Stop/Start Envista identity; EPA ID 47941 identifies the gasoline-or-E85 flex-fuel counterpart.[3][4]
- EPA IDs 48110 and 48117 identify the 2.5L turbo, 8-speed, Stop/Start Traverse as FWD and AWD respectively.[5][6]
- NHTSA returned one 2025 Envista model-level campaign on 2026-11-16: 26V539000 for rearview-camera image distortion or a blank display on certain vehicles; VIN applicability remains mandatory.[7]
- NHTSA returned zero 2025 Traverse model-level campaigns on 2026-11-16; the dated result is not a substitute for a VIN-specific lookup.[8]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no bulletin was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among accepted exact-year mechanical values.
- The Envista manual and EPA records require a VIN/fuel-label distinction between the regular-gasoline and flex-fuel records; the sheets preserve that separation rather than treating all 1.2L vehicles as interchangeable.[1][3][4]
- The Traverse manual gives rear-axle intervals but directs the exact rear-axle product to current service information and does not publish transfer-case or rear-axle capacities.[2]

## Unresolved gaps

- Exact 6-speed and 8-speed drain-and-fill quantities; Envista front-final-drive data; Traverse transfer-case and rear-axle products/capacities.
- Exact engine-air, cabin-air, oil-filter and spark-plug part numbers; Envista battery construction/group/CCA and Traverse battery group/CCA.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 4 new; 0 materially improved existing sheets.
- **Verified library total:** 129 vehicle sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 129 vehicle sheets.
- **Citation check:** The run report passed grounded-citation ledger verification; all cited source IDs and URLs are ledger-backed.
- **Publication branch:** `vehicle-specs-library`.
- **Content commit:** `7e3997ba6592a4d36a809a8a2b97eb2e66692b48` was committed and pushed through the guarded publisher, and the remote branch matched the local commit; no deployment was triggered.
- **Report publication:** This finalized report is being added through the same guarded publisher in a follow-up report-only commit.

## Sources

[1] https://contentdelivery.ext.gm.com/bypass/gma-content-api/resources/sites/GMA/content/staging/MANUALS/9000/MA9164/en_US/3.0/25_BUI_Envista_OM_en_US_U_85602525B_2024JUL29_2P.pdf — 2025 Buick Envista Owner Manual
[2] https://contentdelivery.ext.gm.com/bypass/gma-content-api/resources/sites/GMA/content/staging/MANUALS/9000/MA9453/en_US/1.0/25_CHEV_Traverse_OM_en_US_U_18001588A_2024SEP23.pdf — 2025 Chevrolet Traverse Owner Manual
[3] https://www.fueleconomy.gov/ws/rest/vehicle/47780 — EPA vehicle 47780: 2025 Buick Envista regular gasoline
[4] https://www.fueleconomy.gov/ws/rest/vehicle/47941 — EPA vehicle 47941: 2025 Buick Envista flex fuel
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48110 — EPA vehicle 48110: 2025 Chevrolet Traverse FWD
[6] https://www.fueleconomy.gov/ws/rest/vehicle/48117 — EPA vehicle 48117: 2025 Chevrolet Traverse AWD
[7] https://api.nhtsa.gov/recalls/recallsByVehicle?make=BUICK&model=ENVISTA&modelYear=2025 — NHTSA recalls: 2025 Buick Envista
[8] https://api.nhtsa.gov/recalls/recallsByVehicle?make=CHEVROLET&model=TRAVERSE&modelYear=2025 — NHTSA recalls: 2025 Chevrolet Traverse
