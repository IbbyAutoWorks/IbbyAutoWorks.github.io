# Vehicle-spec library run — 2026-11-13 — ten-sheet NHTSA recall enrichment

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Ten exact US-market 2025 vehicle/powertrain sheets were materially improved without adding duplicate identities or moving to an older phase.

## Files changed

- `vehicle-specs/data/2025/honda/accord/2.0l-hybrid-ecvt-fwd.md`
- `vehicle-specs/data/2025/honda/cr-v/1.5l-turbo-cvt-fwd.md`
- `vehicle-specs/data/2025/honda/cr-v/1.5l-turbo-cvt-awd.md`
- `vehicle-specs/data/2025/honda/cr-v/2.0l-hybrid-ecvt-fwd.md`
- `vehicle-specs/data/2025/honda/cr-v/2.0l-hybrid-ecvt-awd.md`
- `vehicle-specs/data/2025/toyota/corolla/2.0l-i4-cvt-fwd.md`
- `vehicle-specs/data/2025/toyota/corolla/1.8l-hybrid-ecvt-fwd.md`
- `vehicle-specs/data/2025/toyota/corolla/1.8l-hybrid-ecvt-awd.md`
- `vehicle-specs/data/2025/toyota/sienna/2.5l-hybrid-ecvt-fwd.md`
- `vehicle-specs/data/2025/toyota/sienna/2.5l-hybrid-ecvt-awd.md`
- `vehicle-specs/catalog.md`
- `vehicle-specs/run-reports/2026-11-13-nhtsa-recall-enrichment-ten.md`

## Source findings

- NHTSA's official 2025 Honda Accord year/make/model endpoint returned zero model-level recall records on 2026-11-13.[1]
- NHTSA's official 2025 Honda CR-V endpoint returned campaign 24V744000, covering certain CR-V and CR-V Hybrid vehicles whose steering gearbox assembly may have excessive internal friction and cause steering difficulty.[2]
- NHTSA's official 2025 Toyota Corolla year/make/model endpoint returned zero model-level recall records on 2026-11-13.[3]
- NHTSA's official 2025 Toyota Sienna year/make/model endpoint returned zero model-level recall records on 2026-11-13.[4]

## Mechanical fields

- No oil, coolant, transmission, axle, brake-fluid, wheel-torque, tire, filter, battery, spark-plug, bulb or service-interval value was changed.
- Existing exact-year OEM mechanical data and variant separation were preserved.

## Reference enrichment

- The four CR-V gasoline/hybrid and FWD/AWD sheets now record campaign 24V744000 with a short official steering summary, VIN-specific applicability warning and explicit separation from mechanical authority.[2]
- The Accord Hybrid, three Corolla gasoline/hybrid sheets and two Sienna FWD/AWD sheets now carry dated zero-result snapshots with a warning that model-level results do not prove a particular VIN has no open campaign.[1][3][4]
- Manufacturer communications/TSBs and owner-complaint aggregates remain separate and unresolved; no bulletin was labeled a recall and no complaint narrative was added.

## Embedded image previews and source/license status

- **Embedded remote previews:** None added or changed.
- **Source/license status:** Existing image gaps remain. No image was copied, uploaded, hotlinked, approved as a commercial-use candidate or selected as a live default.

## Conflicts

- No conflict was found between the accepted NHTSA model-level results and existing mechanical sources because recall data was not used as mechanical authority.
- Zero-result responses are retained only as dated snapshots; VIN-specific lookup remains required.

## Unresolved gaps

- Exact-applicability manufacturer communications/TSBs and aggregate unverified owner-report patterns remain `Needs research` across the ten sheets.
- Existing sheet-specific gaps in filter parts, replacement-battery ratings, selected drivetrain service quantities, EPA identities, bulb inventories and commercially reusable images remain unchanged.
- Honda's technical-information site returned temporary HTTP 503 responses during attempted exact-year manual retrieval, so no unsupported new Honda sheet was created from search snippets or neighboring-year data.

## Completion, verification and publication

- **Completed sheets:** 0 new; 10 materially improved existing sheets.
- **Verified library total:** 96 vehicle sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 96 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed in strict mode at 25% declared-provenance coverage; all four cited source IDs and the mechanically rendered Sources block match the task ledger.
- **Publication:** Pending guarded publisher execution on branch `vehicle-specs-library`; no deployment is permitted.

## Sources

[1] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=ACCORD&modelYear=2025 — NHTSA recalls API — 2025 Honda Accord
[2] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HONDA&model=CR-V&modelYear=2025 — NHTSA recalls API — 2025 Honda CR-V
[3] https://api.nhtsa.gov/recalls/recallsByVehicle?make=TOYOTA&model=COROLLA&modelYear=2025 — NHTSA recalls API — 2025 Toyota Corolla
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=TOYOTA&model=SIENNA&modelYear=2025 — NHTSA recalls API — 2025 Toyota Sienna
