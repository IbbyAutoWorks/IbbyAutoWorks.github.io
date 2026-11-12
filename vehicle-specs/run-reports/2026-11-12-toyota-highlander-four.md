# Vehicle-spec library run — 2026-11-12 — 2025 Toyota Highlander four-sheet batch

## Active phase

- **Phase:** 2017–2026, the current model year plus previous nine years.
- **Batch result:** Four exact US-market vehicle/year/powertrain sheets completed, below the ten-sheet ceiling. Gasoline FWD/AWD, Stop & Start equipment, and hybrid AWD remain separate.

## Files changed

- `vehicle-specs/data/2025/toyota/highlander/2.4l-turbo-8at-fwd-stop-start.md` — new researched gasoline FWD/Stop & Start sheet.
- `vehicle-specs/data/2025/toyota/highlander/2.4l-turbo-8at-fwd-no-stop-start.md` — new researched gasoline FWD/no-Stop-&-Start sheet.
- `vehicle-specs/data/2025/toyota/highlander/2.4l-turbo-8at-awd-stop-start.md` — new researched gasoline AWD/Stop & Start sheet.
- `vehicle-specs/data/2025/toyota/highlander/2.5l-hybrid-ecvt-awd.md` — new conflict-status hybrid AWD sheet because Toyota and EPA disagree on traction-battery identity.
- `vehicle-specs/catalog.md` — added all four exact variants and the dated coverage/conflict note.
- `vehicle-specs/run-reports/2026-11-12-toyota-highlander-four.md` — this report.

## Mechanical fields

- The gasoline owner manual supports the T24A-FTS engine, ILSAC GF-6A SAE 0W-20 oil, 5.6-US-qt filtered oil capacity, Stop-&-Start-specific 12.3-US-qt versus non-Stop-&-Start 11.7-US-qt engine-coolant capacities, 3.3-US-qt intercooler capacity, ATF WS, DOT 3/DOT 4 brake fluid, 76-ft-lb wheel torque, NGK DILZKAR8E7H plugs at 0.028 inch, and documented replaceable-bulb positions.[1]
- The AWD gasoline sheet separately records Toyota Differential Gear Oil LX for the transfer and rear differential, with 0.41-US-qt and 0.56-US-qt reference capacities; the FWD sheets mark those components not applicable.[1]
- The gasoline replacement-battery field is now sourced: LN3, at least 65 Ah/603 A CCA for Stop & Start variants and at least 70 Ah/603 A CCA without Stop & Start.[1]
- The hybrid owner manual supports the A25A-FXS engine, ILSAC GF-6B SAE 0W-16 oil, 4.5-US-qt filtered capacity, separate engine and power-control-unit coolant quantities, ATF WS hybrid-transaxle and rear-electric-differential reference capacities, DOT 3/DOT 4 brake fluid, 76-ft-lb wheel torque, DENSO FC16HR-Q8 plugs at 0.031 inch, and an LN2 12-volt battery rated at least 55 Ah/345 A CCA.[2]
- The gasoline maintenance guide supports normal and special-condition oil paths, 5,000-mile tire rotation, 30,000-mile engine/cabin filter replacement, initial 100,000-mile engine/intercooler coolant service, 40,000-mile spark plugs, and drivetrain-specific severe-service replacements.[3]
- The hybrid maintenance guide supports 5,000-mile tire rotation and HV-battery-intake inspection, 20,000-mile intake-filter cleaning, 30,000-mile engine/cabin filters, initial 100,000-mile engine-coolant service, initial 150,000-mile inverter-coolant service, 120,000-mile spark plugs, and severe-service hybrid-transaxle/rear-differential paths.[4]

## Reference enrichment

- EPA records 48912, 48913 and 48940 preserve the exact gasoline distinctions for FWD with Stop & Start, FWD without Stop & Start, and AWD.[5][6][7]
- EPA records 48981 and 48979 identify 2025 Highlander Hybrid AWD entries, with 48979 representing the Limited/Platinum grouping in the fetched record.[8][9]
- NHTSA recalls, manufacturer communications/TSBs and owner-complaint aggregates remain `Needs research`; none were used as mechanical authority.

## Commercial image review

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- Toyota's 2025 Highlander Hybrid owner manual specifies a nickel-metal-hydride traction battery with 40 modules and 288-V nominal voltage.[2]
- The two exact EPA Highlander Hybrid AWD records instead expose `259V Li-Ion` in the electric-motor field.[8][9]
- The hybrid sheet therefore has `status: conflict`; it requires VIN/model-code applicability evidence before the traction-battery chemistry or EPA mapping is used. Toyota's owner manual remains the mechanical source, while EPA remains identity enrichment.

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Routine drain-and-fill quantities for the gasoline automatic transmission, AWD transfer/rear differential, hybrid transaxle and rear electric differential.
- Machine-readable tire-rotation patterns and complete trim-to-pressure mappings; the physical tire placard remains authoritative.
- Resolution of the hybrid Toyota-versus-EPA traction-battery identity conflict.
- Current NHTSA recall enrichment, exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 4 new; 0 materially improved existing sheets.
- **Expected verified library total:** 81 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 81 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed in strict mode; nine retrieved official sources are mapped mechanically below.
- **Publication:** Pending guarded publisher execution on branch `vehicle-specs-library`; no deployment is permitted.

## Sources

[1] https://assets.sipb.toyota.com/publications/en/om-s/OM0E144U/pdf/OM0E144U.pdf — 2025 Toyota Highlander Owner Manual OM0E144U
[2] https://assets.sipb.toyota.com/publications/en/om-s/OM0E260U/pdf/OM0E260U.pdf — 2025 Toyota Highlander Hybrid Owner Manual OM0E260U
[3] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25Highlander/pdf/T-MMS-25Highlander.pdf — 2025 Toyota Highlander Warranty and Maintenance Guide
[4] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25HighlanderHV/pdf/T-MMS-25HighlanderHV.pdf — 2025 Toyota Highlander Hybrid Warranty and Maintenance Guide
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48912 — EPA vehicle record 48912
[6] https://www.fueleconomy.gov/ws/rest/vehicle/48913 — EPA vehicle record 48913
[7] https://www.fueleconomy.gov/ws/rest/vehicle/48940 — EPA vehicle record 48940
[8] https://www.fueleconomy.gov/ws/rest/vehicle/48981 — EPA vehicle record 48981
[9] https://www.fueleconomy.gov/ws/rest/vehicle/48979 — EPA vehicle record 48979
