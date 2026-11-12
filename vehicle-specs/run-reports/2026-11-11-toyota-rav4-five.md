# Vehicle-spec library run — 2026-11-11 — 2025 Toyota RAV4 five-variant batch

## Active phase

- **Phase:** 2017–2026, the rolling current model year plus previous nine years.
- **Batch result:** Five exact US-market vehicle/year/powertrain sheets added; the run stopped below the ten-sheet ceiling after separating the two gasoline AWD systems and the two hybrid traction-battery identities.

## Files changed

- `vehicle-specs/data/2025/toyota/rav4/2.5l-i4-8at-fwd.md` — new researched gasoline FWD sheet.
- `vehicle-specs/data/2025/toyota/rav4/2.5l-i4-8at-dynamic-torque-control-awd.md` — new researched Dynamic Torque Control AWD sheet.
- `vehicle-specs/data/2025/toyota/rav4/2.5l-i4-8at-dynamic-torque-vectoring-awd.md` — new researched Dynamic Torque Vectoring AWD sheet.
- `vehicle-specs/data/2025/toyota/rav4/2.5l-hybrid-awd-axah54l-nimh.md` — new researched AXAH54L NiMH hybrid sheet.
- `vehicle-specs/data/2025/toyota/rav4/2.5l-hybrid-awd-axal54l-lithium-ion.md` — new researched AXAL54L lithium-ion hybrid sheet.
- `vehicle-specs/catalog.md` — added all five sheets and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-11-toyota-rav4-five.md` — this report.

## Mechanical fields added

- The gasoline OEM manual identifies the A25A-FKS engine, SAE 0W-16/GF-6B oil with a 4.5-US-qt filtered capacity, coolant variants, ATF WS transmission data, DOT 3/DOT 4 brake-fluid specifications, 76-ft-lb wheel torque, spark-plug specification, battery alternatives and replaceable-bulb/LED distinctions.[3]
- Dynamic Torque Control AWD uses LT 75W-85 GL-5 fluid with a 0.48-US-qt transfer and 0.5-US-qt rear-differential reference capacity; Dynamic Torque Vectoring AWD instead uses LX fluid with 0.40-US-qt transfer and 0.56-US-qt rear-differential capacities.[3]
- The hybrid OEM manual identifies the A25A-FXS engine, AXAH54L NiMH and AXAL54L lithium-ion traction-battery identities, separate engine/power-control-unit coolant capacities, ATF WS hybrid-transaxle and rear-electric-differential capacities, wheel torque, 12-volt battery alternatives, spark plugs and bulb/LED distinctions.[6]
- The gasoline and hybrid maintenance guides support 5,000-mile/6-month inspection cadence, normal and special-condition oil paths, 30,000-mile filter service, 100,000-mile initial engine-coolant replacement, 120,000-mile spark-plug replacement, and drivetrain-specific inspection/replacement paths.[4][7]

## Reference enrichment

- The NHTSA model-level endpoint returned three 2025 RAV4 campaigns on 2026-11-11: 25V595000 for instrument-panel software, 25V744000 for PVM/rearview-camera software on equipped vehicles, and 26V256000 for front-seat-bracket welds on certain vehicles.[5]
- Recall entries are dated model-level enrichment only; every sheet requires VIN/equipment confirmation and does not use recalls as mechanical authority.
- No TSB or owner-complaint aggregate was added; those remain explicit research gaps.

## Commercial image review

- **Embedded previews:** None.
- **Source/license status:** No exact-generation image completed original-source, exact-license/version, creator, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict was found among populated OEM mechanical values.
- The gasoline manual publishes coolant capacities with and without an engine-oil cooler but does not provide a safe extracted trim/VIN mapping; both values are preserved with equipment confirmation required.[3]
- Both manuals publish multiple tire-package pressure types without enough extracted package mapping to choose safely; all sheets defer to the physical vehicle placard.[3][6]
- The gasoline maintenance guide's severe-use transmission/transfer/differential table does not extract with enough visual fidelity to restate every cadence confidently; the sheets preserve the applicable inspection/replacement requirement and mark exact cadence for visual confirmation.[4]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Gasoline and hybrid 12-volt battery Type A/B/C equipment mapping.
- Routine transmission/hybrid-transaxle drain-and-fill service quantities.
- Exact tire-package-to-pressure mapping and machine-readable tire-rotation pattern.
- Stable exact EPA vehicle IDs.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable images.

## Completion and verification

- **Completed sheets:** 5 new; 0 materially improved.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 72 vehicle sheets.
- **Publication:** Pending guarded publisher execution after successful verification.

## Sources

[3] https://assets.sipb.toyota.com/publications/en/om-s/OM0R063U/pdf/OM0R063U.pdf — 2025 Toyota RAV4 Owner Manual OM0R063U
[4] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25RAV4/pdf/T-MMS-25RAV4.pdf — 2025 Toyota RAV4 Warranty and Maintenance Guide
[5] https://api.nhtsa.gov/recalls/recallsByVehicle?make=TOYOTA&model=RAV4&modelYear=2025 — NHTSA 2025 Toyota RAV4 recalls
[6] https://assets.sipb.toyota.com/publications/en/om-s/OM0R193U/pdf/OM0R193U.pdf — 2025 Toyota RAV4 Hybrid Owner Manual OM0R193U
[7] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25RAV4HV/pdf/T-MMS-25RAV4HV.pdf — 2025 Toyota RAV4 Hybrid Warranty and Maintenance Guide
