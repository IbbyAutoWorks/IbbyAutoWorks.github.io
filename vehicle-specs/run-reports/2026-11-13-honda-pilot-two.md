# Vehicle-spec library run — 2026-11-13 — 2025 Honda Pilot FWD/AWD

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Two exact US-market 2025 Honda Pilot 3.5L/10-speed sheets completed without jumping to an older phase. FWD and AWD remain separate because their cooling, transmission and driveline service data differ.

## Files changed

- `vehicle-specs/data/2025/honda/pilot/3.5l-v6-10at-fwd.md` — new researched FWD sheet.
- `vehicle-specs/data/2025/honda/pilot/3.5l-v6-10at-awd.md` — new researched AWD sheet.
- `vehicle-specs/catalog.md` — added both exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-13-honda-pilot-two.md` — this report.

## Mechanical fields

- Exact-year Honda specifications support SAE 0W-20 and a 5.6-US-qt filtered oil capacity for both drivetrains.[1]
- FWD retains its 1.48-US-gal coolant change quantity, 2.14-US-gal total cooling capacity and 5.7-US-qt automatic-transmission change quantity; AWD instead retains 1.53 US gal, 2.30 US gal and 6.2 US qt respectively.[1]
- AWD separately records Honda HGO-1 transfer-assembly fluid at 0.48 US qt and Honda Dual Pump Fluid II rear-differential fluid at 1.92 US qt; those entries are not applied to FWD.[1]
- Both sheets record Honda DOT 3 brake fluid, 94-lbf-ft wheel-fastener torque, NGK/DENSO plug identifiers, placard-first tire-pressure guidance and exact directional/non-directional rotation rules.[1][3][4]
- Honda's exact-year charging guidance identifies the installed 12-volt battery as AGM; replacement group size and CCA remain unresolved.[9]
- Maintenance Minder coverage includes annual oil service if no reminder appears within 12 months, three-year brake-fluid replacement, 15,000-mile severe air-filter rules, the mountainous-use transmission schedule and the AWD severe rear-differential schedule.[2]

## Reference enrichment

- EPA vehicle 47753 confirms the exact 2025 Pilot AWD 3.5L six-cylinder/10-speed identity.[6]
- The official EPA 2025 Pilot 2WD options endpoint returned no vehicle records on 2026-11-13; the FWD sheet therefore does not invent an EPA ID and keeps VIN/trim confirmation explicit.[7]
- NHTSA's official model-level endpoint returned five campaigns: 24V900000, 25V031000, 25V056000, 25V391000 and 26V721000. These remain VIN/equipment-specific recall enrichment and are not used as mechanical authority.[8]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no TSB is mislabeled as a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year Honda mechanical sources.
- EPA confirms the AWD variant but returned no 2WD option record. The absence is preserved as a coverage gap rather than being used to reject the OEM-documented FWD configuration.[1][6][7]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Replacement AGM battery group size, CCA and Honda service part number.
- Spark-plug gap and complete replaceable-bulb versus LED-assembly inventory.
- Trim-specific reference tire pressures beyond the controlling physical placard.
- Independent front-final-drive interpretation, fixed normal-use mileage equivalents where Honda publishes Maintenance Minder codes, exact-applicability TSBs, aggregate unverified owner reports and a commercially reusable exact-generation image.

## Completion, verification and publication

- **Completed sheets:** 2 new; 0 materially improved existing sheets.
- **Verified library total:** 98 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 98 vehicle sheets.
- **Citation check:** Both new sheets passed ledger verification with at least 62% sentence coverage; warnings identify only task-ledger sources intentionally unused by each drivetrain-specific sheet.
- **Publication:** Pending guarded publisher execution on branch `vehicle-specs-library`; no deployment will be triggered.

## Sources

[1] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT902525IOM/enu/details/131247047-16992.html — 2025 Honda Pilot Specifications
[2] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT902525IOM/enu/details/131247047-576841.html — 2025 Honda Pilot Maintenance Minder
[3] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT902525IOM/enu/details/131247047-14882.html — 2025 Honda Pilot Tire Rotation
[4] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT902525IOM/enu/details/131247047-15363.html — 2025 Honda Pilot Flat Tire / Wheel Torque
[6] https://www.fueleconomy.gov/ws/rest/vehicle/47753 — EPA vehicle 47753 — 2025 Honda Pilot AWD
[7] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2025&make=Honda&model=Pilot%202WD — EPA 2025 Honda Pilot 2WD options query
[8] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=PILOT&modelYear=2025 — NHTSA 2025 Honda Pilot recalls API
[9] https://techinfo.honda.com/rjanisis/pubs/OM/AH/AT902525IOM/enu/details/131247047-227310.html — 2025 Honda Pilot Charging the AGM Battery
