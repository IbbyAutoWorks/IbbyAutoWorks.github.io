# Vehicle-spec library run — 2026-11-13 — 2025 Toyota Tacoma recall enrichment

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Ten exact US-market 2025 Toyota Tacoma EPA-identity sheets were materially improved without creating duplicate variants or advancing to an older phase.

## Files changed

- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-stop-start-epa-48870.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-stop-start-epa-48871.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-no-stop-start-epa-48872.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-6mt-part-time-4wd-epa-48877.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48878.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-stop-start-epa-48879.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48880.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48881.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-hybrid-8at-part-time-4wd-epa-48902.md`
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-hybrid-8at-4wd-epa-48903.md`
- `vehicle-specs/catalog.md`
- `vehicle-specs/run-reports/2026-11-13-toyota-tacoma-recall-enrichment-ten.md`

## Source findings

- NHTSA's official 2025 Toyota Tacoma year/make/model endpoint returned five model-level campaigns on 2026-11-13: 25V058000, 25V595000, 25V656000, 26V179000 and 26V514000.[1]
- Campaign 25V058000 is explicitly limited in NHTSA's summary to certain 2024–2025 Tacoma 4-wheel-drive vehicles; no 2WD/RWD sheet treats it as automatically applicable.[1]
- The remaining campaign summaries cover instrument-panel software, certain front-driveshaft CV joints, load-capacity modification labels and certain shock-absorber reservoir attachments; every sheet retains VIN/equipment/drivetrain applicability warnings.[1]

## Mechanical fields

- No oil, coolant, transmission, transfer-case, differential, brake-fluid, wheel-torque, tire-pressure, rotation, filter, battery, spark-plug, bulb or service-interval value was changed.
- Existing exact-year Toyota mechanical data, gasoline/hybrid separation, RWD/4WD separation, transmission distinctions, EPA identities and unresolved model-code/package branches were preserved.

## Reference enrichment

- All ten exact Tacoma sheets now record the five official NHTSA model-level campaigns with short component summaries and the retrieval date.[1]
- Recall data remains explicitly separate from mechanical specifications, manufacturer communications/TSBs and owner complaints.
- No TSB was relabeled as a recall, and no complaint narrative or aggregate was added.

## Embedded image previews and source/license status

- **Embedded remote previews:** None added or changed.
- **Source/license status:** Existing image gaps remain. No image was copied, uploaded, hotlinked, approved as a commercial-use candidate or selected as a live default.

## Conflicts and applicability handling

- No conflict was found with existing OEM mechanical sources because the NHTSA records were used only for recall enrichment.
- The rear-brake-hose campaign's 4WD limitation is preserved instead of being generalized to the three RWD sheets.[1]
- The endpoint is model-level; no campaign is represented as applicable to every VIN, trim, axle, suspension package or drivetrain.

## Unresolved gaps

- VIN-specific recall applicability remains unresolved for each sheet.
- Exact-applicability manufacturer communications/TSBs and aggregate unverified owner-report patterns remain `Needs research`.
- Existing sheet-specific gaps in filter part numbers, replacement-battery ratings, routine service-fill quantities, certification-code/package mappings, rotation-pattern extraction, tire/wheel selection and commercially reusable exact-generation images remain unchanged.

## Completion, verification and publication

- **Completed sheets:** 0 new; 10 materially improved existing sheets.
- **Verified library total:** 96 vehicle sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 96 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed in strict evidence mode at 20% declared-provenance coverage; the cited source has attached verbatim evidence and the rendered source mapping matches the task ledger.
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** The guarded publisher committed and pushed the verified content batch at `3c2378a`; this finalized report-status update is published through the same guarded path, and no deployment was triggered.

## Sources

[1] https://api.nhtsa.gov/recalls/recallsByVehicle?make=TOYOTA&model=TACOMA&modelYear=2025 — NHTSA 2025 Toyota Tacoma recalls
    > "Toyota Motor Engineering & Manufacturing (Toyota) is recalling certain 2024-2025 Tacoma 4-wheel drive vehicles."
