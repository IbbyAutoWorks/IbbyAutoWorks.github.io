# Vehicle-spec library run — 2026-11-14 — 2025 Honda Civic and HR-V four-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Four exact US-market 2025 sheets completed without jumping to an older phase: Civic Sedan gasoline FWD, Civic Sedan Hybrid FWD, HR-V FWD and HR-V AWD.

## Files changed

- `vehicle-specs/data/2025/honda/civic-sedan/2.0l-i4-cvt-fwd.md` — new researched gasoline/CVT/FWD sheet.
- `vehicle-specs/data/2025/honda/civic-sedan/2.0l-hybrid-ecvt-fwd.md` — new researched hybrid/eCVT/FWD sheet.
- `vehicle-specs/data/2025/honda/hr-v/2.0l-i4-cvt-fwd.md` — new researched FWD crossover sheet.
- `vehicle-specs/data/2025/honda/hr-v/2.0l-i4-cvt-awd.md` — new researched AWD crossover sheet.
- `vehicle-specs/catalog.md` — added all four exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-14-honda-civic-hr-v-four.md` — this report.

## Source set

- Exact-year Honda Owner's Manual specification, Maintenance Minder and tire-rotation pages were used as mechanical authority for the Civic.[1][2][3]
- Exact-year Honda Owner's Manual specification, Maintenance Minder and tire-rotation pages were used as mechanical authority for the HR-V.[4][5][6]
- EPA vehicle records confirm the selected Civic engine, transmission classification and FWD identities.[7][8]
- EPA vehicle records separately confirm the selected HR-V engine, transmission classification and FWD/AWD identities.[9][10]
- NHTSA's official year/make/model recall endpoints provide dated model-level enrichment only.[11][12]

## Mechanical fields

- Both Civic sheets record exact-year SAE 0W-20 oil requirements, powertrain-specific oil/coolant/drive-unit quantities, Honda DOT 3 brake fluid and 80-lbf-ft wheel-fastener torque.[1]
- The Civic hybrid preserves separate engine and high-voltage cooling circuits and Honda ATF DW-1 hybrid drive-unit service instead of combining it with the gasoline CVT data.[1][2]
- Both HR-V sheets record SAE 0W-20, Honda Type 2 coolant, Honda HCF-2 CVT fluid, Honda DOT 3 brake fluid and 80-lbf-ft wheel-fastener torque; FWD and AWD retain different coolant and CVT service quantities.[4]
- The AWD HR-V separately records Honda DPSF-II rear-differential fluid and its change quantity, while the transfer-unit specification/capacity remains `Needs research`.[4][5]
- The Civic sheets retain tire-placard authority, exact rotation patterns, Maintenance Minder items, annual oil fallback, three-year brake-fluid timing and applicable severe-service intervals.[2][3]
- The HR-V sheets retain the same categories of exact-year placard, rotation and Maintenance Minder guidance from their model-specific manual.[5][6]

## Reference enrichment

- EPA vehicle 47508 confirms the 2025 Civic 4Dr 2.0L gasoline/FWD identity, and vehicle 47442 confirms the 2.0L hybrid/FWD identity.[7][8]
- EPA vehicles 47206 and 47207 confirm the 2025 HR-V 2.0L FWD and AWD identities respectively.[9][10]
- NHTSA returned Civic campaign 25V315000 for potentially loose battery-terminal connections; applicability remains VIN-specific and the recall is kept separate from mechanical authority.[11]
- NHTSA returned zero 2025 HR-V model-level recalls on 2026-11-14; the dated result does not replace a current VIN lookup.[12]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no TSB was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year Honda mechanical sources.
- The records intentionally preserve variant differences rather than treating shared model names as proof of shared cooling, transmission or AWD service quantities.

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Replacement 12-volt battery group sizes, CCA ratings and Honda service part numbers.
- Spark-plug gaps and complete Civic replaceable-bulb versus LED-assembly inventories.
- Trim-specific reference tire pressures beyond the controlling physical placard.
- Separate front-final-drive interpretation for all four sheets and exact HR-V AWD transfer-unit fluid specification/capacity.
- Civic hybrid fixed high-voltage-coolant interval, exact-applicability TSBs, aggregate unverified owner reports and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 4 new; 0 materially improved existing sheets.
- **Verified library total:** 102 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 102 vehicle sheets.
- **Citation check:** All four new sheets passed ledger verification at 57–60% sentence coverage; warnings only identify task-ledger sources intentionally unused by the other model's sheet.
- **Publication branch:** `vehicle-specs-library`.
- **Content commit:** `cd509f0afd14aa4ce977114a321b6aa287fa509e` was pushed through the guarded publisher and matched `origin/vehicle-specs-library`; no deployment was triggered.
- **Report publication:** This report is being added through the same guarded publisher in a follow-up report-only commit.

## Sources

[1] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT202525IOM/enu/details/131265047-16992.html — 2025 Honda Civic Sedan Owner Manual - Specifications
[2] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT202525IOM/enu/details/131265047-12935.html — 2025 Honda Civic Sedan Owner Manual - Maintenance Minder
[3] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT202525IOM/enu/details/131265047-14882.html — 2025 Honda Civic Sedan Owner Manual - Tire Rotation
[4] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3V02525IOM/enu/details/131237047-16992.html — 2025 Honda HR-V Owner Manual - Specifications
[5] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3V02525IOM/enu/details/131237047-192706.html — 2025 Honda HR-V Owner Manual - Maintenance Minder
[6] https://techinfo.honda.com/rjanisis/pubs/OM/AH/A3V02525IOM/enu/details/131237047-14882.html — 2025 Honda HR-V Owner Manual - Tire Rotation
[7] https://www.fueleconomy.gov/ws/rest/vehicle/47508 — EPA vehicle 47508 - 2025 Honda Civic 4Dr
[8] https://www.fueleconomy.gov/ws/rest/vehicle/47442 — EPA vehicle 47442 - 2025 Honda Civic 4Dr Hybrid
[9] https://www.fueleconomy.gov/ws/rest/vehicle/47206 — EPA vehicle 47206 - 2025 Honda HR-V FWD
[10] https://www.fueleconomy.gov/ws/rest/vehicle/47207 — EPA vehicle 47207 - 2025 Honda HR-V AWD
[11] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=CIVIC&modelYear=2025 — NHTSA recalls API - 2025 Honda Civic
[12] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=HR-V&modelYear=2025 — NHTSA recalls API - 2025 Honda HR-V
