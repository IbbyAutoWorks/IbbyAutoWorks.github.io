# Vehicle-spec library run — 2026-11-13 — 2025 Honda Accord Hybrid

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** One exact US-market 2025 Honda Accord Hybrid 2.0L/eCVT/FWD sheet completed without jumping to an older phase. Exactness and official-source support took priority over the ten-sheet ceiling.

## Files changed

- `vehicle-specs/data/2025/honda/accord/2.0l-hybrid-ecvt-fwd.md` — new researched sheet.
- `vehicle-specs/catalog.md` — added the exact identity and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-13-honda-accord-hybrid-one.md` — this report.

## Mechanical fields

- The exact-year Honda specifications support SAE 0W-20, 4.0-US-qt filtered oil capacity, Honda Type 2 coolant, separate 1.77-US-gal gasoline-engine and 1.92-US-qt high-voltage-system coolant change quantities, Honda ATF DW-1 hybrid drive-unit fluid with a 2.0-US-qt change quantity, and Honda DOT 3 brake fluid.[1]
- The same specifications support 235/40R19 at 35 psi, 225/50R17 at 33 psi and the compact spare at 60 psi, with the physical tire placard retained as the controlling authority.[1]
- The sheet records the 259-V lithium-ion high-voltage battery and NGK DILZKAR7G11Y spark-plug identifier; unsupported 12-volt battery ratings and spark-plug gap remain unresolved.[1]
- Exact-year Maintenance Minder data supports annual oil service when no reminder appears within 12 months, a three-year brake-fluid interval, 15,000-mile severe-condition air-filter intervals, and the severe hybrid drive-unit-fluid schedule of 47,500 miles/three years initially and 30,000 miles/two years thereafter.[2]

## Reference enrichment

- EPA record 48505 confirms the 2025 Accord Hybrid 2.0L/FWD identity, while EPA record 48497 separately confirms the Accord Hybrid Sport/Touring 2.0L/FWD identity.[3][4]
- NHTSA recalls, manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; none were used as mechanical authority.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year Honda mechanical sources and EPA identity records.
- EPA publishes separate base-hybrid and Sport/Touring records, while the Honda specifications publish multiple tire packages in one hybrid manual. The sheet preserves both EPA identities and requires trim/placard confirmation instead of treating the tire packages as interchangeable.[1][3][4]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Replacement 12-volt battery group size, CCA and Honda service part number.
- Spark-plug gap, wheel fastener torque and the exact tire-rotation diagram.
- Complete replaceable-bulb versus LED-assembly inventory.
- Separate front-final-drive service data and fixed normal-use mileage equivalents where Honda publishes Maintenance Minder codes.
- Current NHTSA recalls, exact-applicability TSBs, aggregate unverified owner reports and a commercially reusable exact-generation image.

## Completion, verification and publication

- **Completed sheets:** 1 new; 0 materially improved existing sheets.
- **Expected verified library total:** 96 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 96 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed in strict mode for the new sheet and this run report; every cited ID exists in the task ledger and each Sources block matches the ledger.
- **Publication:** Guarded publisher committed and pushed the completed library batch to branch `vehicle-specs-library` at content commit `cb2b9a7`; no deployment was triggered. A final report-only publication commit follows so this result is preserved in the branch history.

## Sources

[1] https://techinfo.honda.com/rjanisis/pubs/om/ah/a30b2525iom/enu/details/131245047-16992.html — 2025 Honda Accord Hybrid Specifications
[2] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A30B2525IOM/enu/details/131245047-522621.html — 2025 Honda Accord Hybrid Maintenance Minder
[3] https://www.fueleconomy.gov/ws/rest/vehicle/48505 — EPA vehicle record 48505
[4] https://www.fueleconomy.gov/ws/rest/vehicle/48497 — EPA vehicle record 48497
