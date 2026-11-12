# Vehicle-spec library run — 2026-11-12 — 2025 Toyota Corolla and Sienna five-sheet batch

## Active phase

- **Phase:** 2017–2026, the rolling current model year plus previous nine years.
- **Batch result:** Five exact US-market vehicle/year/powertrain sheets added, staying below the ten-sheet ceiling after separating gasoline/hybrid and FWD/AWD service identities.

## Files changed

- `vehicle-specs/data/2025/toyota/corolla/2.0l-i4-cvt-fwd.md` — new researched gasoline Corolla sedan sheet.
- `vehicle-specs/data/2025/toyota/corolla/1.8l-hybrid-ecvt-fwd.md` — new researched Corolla Hybrid FWD sheet.
- `vehicle-specs/data/2025/toyota/corolla/1.8l-hybrid-ecvt-awd.md` — new researched Corolla Hybrid AWD sheet.
- `vehicle-specs/data/2025/toyota/sienna/2.5l-hybrid-ecvt-fwd.md` — new researched Sienna Hybrid FWD minivan sheet.
- `vehicle-specs/data/2025/toyota/sienna/2.5l-hybrid-ecvt-awd.md` — new researched Sienna Hybrid AWD minivan sheet.
- `vehicle-specs/catalog.md` — added all five sheets and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-12-toyota-corolla-sienna-five.md` — this report.

## Mechanical fields added

- The gasoline Corolla OEM manual identifies the 2.0L M20A-FKS, JASO GLV-1 SAE 0W-8 oil, 4.4-US-qt filtered oil capacity, 6.8-US-qt coolant capacity, CVT Fluid FE with a 9.0-US-qt reference capacity, DOT 3/DOT 4 brake-fluid specifications, 76-ft-lb wheel torque, DENSO FC20HR-Q8 plugs with 0.032-inch gap, tire-package pressures and replaceable-bulb distinctions.[1]
- The Corolla Hybrid OEM manual identifies the 1.8L 2ZR-FXE, 207.2-V lithium-ion traction battery, SAE 0W-16 oil with 4.4-US-qt filtered capacity, separate engine/PCU coolant quantities, e-Transaxle Fluid TE, 76-ft-lb wheel torque and the AWD-only 1.5-US-qt rear-electric-differential reference capacity.[2]
- The Sienna OEM manual identifies the 2.5L A25A-FXS, 288-V nickel-metal-hydride traction battery, SAE 0W-16 oil with 4.5-US-qt filtered capacity, separate engine/PCU coolant quantities, ATF WS hybrid-transaxle fluid, 76-ft-lb wheel torque and the AWD-only 1.8-US-qt rear-electric-differential reference capacity.[5]
- The three maintenance guides support a 5,000-mile/6-month inspection cadence, normal and special-condition oil paths, 30,000-mile engine/cabin filter service, 100,000-mile initial engine-coolant replacement, 150,000-mile initial inverter-coolant replacement for hybrids, 120,000-mile spark-plug replacement and drivetrain-specific severe-service paths.[3][4][6]

## Reference enrichment

- Exact OEM manual identities were preserved for M20A-FKS gasoline Corolla, 2ZR-FXE Corolla Hybrid FWD/AWD and A25A-FXS Sienna Hybrid FWD/AWD.[1][2][5]
- Stable exact EPA IDs, current NHTSA model-level recall results, TSBs and owner-complaint aggregates were not added because the available official recall API request did not return usable data during this run; all remain explicit research gaps.
- Recalls, bulletins and complaints were not used as mechanical authority.

## Commercial image review

- **Embedded previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, exact-license/version, creator, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict was found among the populated OEM mechanical values.
- The manuals publish several tire-package pressures but do not provide a safe extracted trim/VIN mapping for every package, so every sheet keeps the physical tire placard authoritative.[1][2][5]
- OEM transmission and rear-electric-differential capacities are labeled reference quantities rather than routine drain-and-fill amounts; routine service quantities remain unresolved.[1][2][5]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Exact 12-volt replacement-battery group sizes and CCA ratings.
- Routine CVT/hybrid-transaxle and AWD rear-electric-differential drain-and-fill quantities.
- Machine-readable tire-rotation patterns and complete trim-to-pressure mappings.
- Stable exact EPA vehicle IDs and successful current NHTSA recall enrichment.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable images.

## Completion and verification

- **Completed sheets:** 5 new; 0 materially improved.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 77 vehicle sheets.
- **Publication branch:** `vehicle-specs-library`; guarded publisher commit pending at this checkpoint.

## Sources

[1] https://assets.sipb.toyota.com/publications/en/om-s/OM02688U/pdf/OM02688U.pdf — 2025 Toyota Corolla Owner Manual OM02688U
    > "Model 2.0 L 4-cylinder (M20A-FKS)"
[2] https://assets.sipb.toyota.com/publications/en/om-s/OM12S84U/pdf/OM12S84U.pdf — 2025 Toyota Corolla Hybrid Owner Manual OM12S84U
    > "Model 1.8 L 4-cylinder (2ZR-FXE)"
[3] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25Corolla/pdf/T-MMS-25Corolla.pdf — 2025 Toyota Corolla Warranty and Maintenance Guide
    > "Toyota recommends obtaining scheduled maintenance for your vehicle every 5,000 miles or six months, whichever comes first."
[4] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25CorollaHV/pdf/T-MMS-25CorollaHV.pdf — 2025 Toyota Corolla Hybrid Warranty and Maintenance Guide
    > "Toyota recommends obtaining scheduled maintenance for your vehicle every 5,000 miles or six months, whichever comes first."
[5] https://assets.sipb.toyota.com/publications/en/om-s/OM08070U/pdf/OM08070U.pdf — 2025 Toyota Sienna Owner Manual OM08070U
    > "Model 2.5 L 4-cylinder (A25A-FXS)"
[6] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25Sienna/pdf/T-MMS-25Sienna.pdf — 2025 Toyota Sienna Warranty and Maintenance Guide
    > "Toyota recommends obtaining scheduled maintenance for your vehicle every 5,000 miles or six months, whichever comes first."
