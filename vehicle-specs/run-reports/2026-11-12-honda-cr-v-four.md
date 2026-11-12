# Vehicle-spec library run — 2026-11-12 — 2025 Honda CR-V four-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Four exact US-market 2025 CR-V identities completed without jumping to an older phase: 1.5L turbo FWD/AWD and 2.0L hybrid FWD/AWD.

## Files changed

- `vehicle-specs/data/2025/honda/cr-v/1.5l-turbo-cvt-fwd.md` — new researched sheet.
- `vehicle-specs/data/2025/honda/cr-v/1.5l-turbo-cvt-awd.md` — new researched sheet.
- `vehicle-specs/data/2025/honda/cr-v/2.0l-hybrid-ecvt-fwd.md` — new researched sheet.
- `vehicle-specs/data/2025/honda/cr-v/2.0l-hybrid-ecvt-awd.md` — new researched sheet.
- `vehicle-specs/catalog.md` — added all four identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-12-honda-cr-v-four.md` — this report.

## Mechanical fields

- The exact-year gasoline specifications support SAE 0W-20, 3.7-US-qt filtered oil capacity, Honda Type 2 coolant with a 1.84-US-gal change quantity, HCF-2 CVT fluid, 3.7-US-qt FWD and 4.1-US-qt AWD CVT change quantities, DOT 3 brake fluid, the DILKAR8P8SY plug identifier, tire-package pressures and LED-versus-replaceable-lamp distinctions.[1]
- The gasoline AWD sheet separately records Honda Dual Pump Fluid II and a 1.32-US-qt rear-differential change quantity; the FWD sheet does not carry an AWD rear-differential entry.[1][8][10]
- Exact-year gasoline maintenance data records condition-based oil/filter, coolant, ignition and drivetrain codes, a three-year brake-fluid rule, 15,000-mile severe air-filter rules and a 25,000-mile severe CVT interval.[2]
- The gasoline tire pages support the published rotation patterns, TPMS recalibration reminder and 80-lbf-ft wheel-nut torque.[5][6]
- The exact-year hybrid specifications support SAE 0W-20, 4.0-US-qt filtered oil capacity, separate engine/high-voltage cooling circuits, ATF DW-1 hybrid drive-unit fluid, 2.0-US-qt FWD and 2.1-US-qt AWD change quantities, DOT 3 brake fluid, lithium-ion high-voltage battery identity, DILZKAR7G11Y plugs, tire-package pressures and lamp distinctions.[3]
- Hybrid FWD/AWD cooling quantities remain separate. The AWD sheet alone records Honda DPSF-II with 1.32-US-qt change and 1.48-US-qt total rear-differential quantities.[3]
- Hybrid maintenance retains the 47,500-mile/three-year initial and 30,000-mile/two-year repeated severe drive-unit-fluid schedule, plus the AWD severe rear-differential rule; hybrid tire rotation remains tied to sub-item 1 and the exact rotation page.[4][7]

## Reference enrichment

- EPA record 47949 confirms the 2025 CR-V FWD 1.5L turbo identity.[8]
- EPA record 47950 confirms the 2025 CR-V FWD 2.0L hybrid identity.[9]
- EPA record 47956 confirms the 2025 CR-V AWD 1.5L turbo identity.[10]
- EPA record 47957 confirms the 2025 CR-V AWD 2.0L hybrid identity.[11]
- NHTSA recalls, manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; none were used as mechanical authority.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year OEM mechanical sources and EPA identity records.
- Honda's AWD Maintenance Minder references transfer fluid, while the accepted specifications do not publish a separate exact transfer-fluid specification or capacity. The AWD sheets preserve that as an unresolved service-information gap rather than assigning another fluid.

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Replacement 12-volt battery group size, CCA and Honda service part number.
- Spark-plug gaps.
- Separate front-final-drive and AWD transfer-fluid specifications/capacities.
- An accepted exact hybrid-manual wheel-torque locator.
- Fixed normal-use mileage equivalents where Honda publishes only Maintenance Minder codes.
- Current NHTSA recalls, exact-applicability TSBs, aggregate unverified owner reports and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 4 new; 0 materially improved existing sheets.
- **Expected verified library total:** 95 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 95 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed for the run report and all four sheets; every cited ID exists in the task ledger and each sheet's cited IDs are present in its Sources block.
- **Publication:** Guarded publisher committed and pushed the completed library batch to branch `vehicle-specs-library` at content commit `1cbf934`; no deployment was triggered. The publisher was invoked with Python because the approved script file lacked an executable mode bit; its internal branch, path, credential-scan, verification and push guards remained the only publication path.

## Sources

[1] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3A02525IOM/enu/details/131240047-16992.html — 2025 Honda CR-V Specifications
[2] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3A02525IOM/enu/details/131240047-391987.html — 2025 Honda CR-V Maintenance Minder
[3] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3D42525IOM/enu/details/131241047-16992.html — 2025 Honda CR-V Hybrid Specifications
[4] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3D42525IOM/enu/details/131229047-12935.html — 2025 Honda CR-V Hybrid Maintenance Minder
[5] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3A02525IOM/enu/details/131240047-14882.html — 2025 Honda CR-V Tire Rotation
[6] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3A02525IOM/enu/details/131240047-15363.html — 2025 Honda CR-V Wheel Nut Torque
[7] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3D42525IOM/enu/details/131241047-14882.html — 2025 Honda CR-V Hybrid Tire Rotation
[8] https://www.fueleconomy.gov/ws/rest/vehicle/47949 — EPA vehicle record 47949
[9] https://www.fueleconomy.gov/ws/rest/vehicle/47950 — EPA vehicle record 47950
[10] https://www.fueleconomy.gov/ws/rest/vehicle/47956 — EPA vehicle record 47956
[11] https://www.fueleconomy.gov/ws/rest/vehicle/47957 — EPA vehicle record 47957
