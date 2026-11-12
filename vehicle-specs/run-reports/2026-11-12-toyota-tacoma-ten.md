# Vehicle-spec library run — 2026-11-12 — 2025 Toyota Tacoma ten-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Ten exact US-market EPA vehicle-identity sheets completed, reaching the per-run ceiling. RWD, part-time 4WD, manual, automatic, Stop & Start, gasoline and hybrid groups remain separately identified.

## Files changed

- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-stop-start-epa-48870.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-stop-start-epa-48871.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-rwd-no-stop-start-epa-48872.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-6mt-part-time-4wd-epa-48877.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48878.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-stop-start-epa-48879.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48880.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-8at-part-time-4wd-epa-48881.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-hybrid-8at-part-time-4wd-epa-48902.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/tacoma/2.4l-turbo-hybrid-8at-4wd-epa-48903.md` — new researched sheet with transfer-type confirmation explicitly unresolved.
- `vehicle-specs/catalog.md` — added all ten exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-12-toyota-tacoma-ten.md` — this report.

## Mechanical fields

- The gasoline owner manual supports the T24A-FTS engine, ILSAC GF-6A SAE 0W-20 oil, 5.9-US-qt filtered oil capacity, Toyota Super Long Life Coolant specification, ATF WS 12.2-US-qt automatic reference capacity, 2.6-US-qt SAE 75W-90 manual-transmission reference capacity, DOT 3/DOT 4 brake fluid, NGK DILZKAR8E7H plugs at 0.027 inch and a 7444NA front turn-signal/parking bulb.[1]
- Gasoline cooling capacity is preserved as a model-code branch: 12.6 US qt for four named certification codes and 12.8 US qt for the other listed configurations. No EPA-to-certification-code mapping was inferred.[1]
- The gasoline 4WD sheets record Toyota Transfer Gear Oil LF, 1.2-US-qt transfer capacity and 1.4-US-qt front-differential capacity. Rear-differential quantity remains package-specific at 4.8 or 5.0 US qt rather than being collapsed.[1]
- The hybrid owner manual supports the same engine oil quantity, separate 12.6-US-qt engine and 2.4-US-qt power-control-unit cooling circuits, ATF WS 13.2-US-qt automatic reference capacity, a 288-V nickel-metal-hydride traction battery, part-time/full-time transfer and front-differential branches, and a 5.0-US-qt rear differential.[2]
- Wheel torque remains wheel/package dependent: 97 ft-lb for aluminum applications and 154 ft-lb for listed steel-wheel applications. Tire-pressure entries retain a physical-placard warning because the manuals publish several tire-package values.[1][2]
- The gasoline and hybrid maintenance guides support 5,000-mile tire rotation, normal 10,000-mile/12-month oil maximums, qualifying 5,000-mile/6-month severe oil service, 30,000-mile engine/cabin filters, initial 100,000-mile engine/intercooler coolant service and severe drivetrain-fluid paths.[3][4]
- Hybrid-specific enrichment retains 5,000-mile HV-battery-intake inspection, 20,000-mile cleaning and initial 150,000-mile inverter-coolant service.[4]

## Reference enrichment

- EPA IDs 48870, 48871 and 48872 distinguish the RWD automatic groups, including Stop & Start and engine-descriptor differences.[13][14][15]
- EPA ID 48877 identifies the 6-speed-manual, part-time-4WD gasoline group.[16]
- EPA IDs 48878, 48879 and 48880 preserve three automatic part-time-4WD groups, including the Stop & Start identity on 48879.[17][18][19]
- EPA ID 48881 preserves the additional automatic part-time-4WD Tacoma group.[20]
- EPA ID 48902 explicitly identifies hybrid part-time 4WD, while 48903 identifies hybrid 4WD without labeling it part-time; the latter transfer-type branch remains a VIN/model-code research item rather than an inference.[21][22]
- NHTSA recalls, manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; none were used as mechanical authority.

## Embedded image previews and license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the inspected OEM mechanical sources.
- EPA 48903 does not state whether its generic `4-Wheel Drive` record maps to the owner manual's part-time or full-time transfer branch. The sheet leaves both exact OEM capacities visible and requires VIN/model-code confirmation instead of choosing one.

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers.
- Replacement 12-volt battery group size and CCA.
- Routine drain-and-fill quantities for automatic transmission and axle/transfer units.
- EPA-ID-to-Toyota-certification-code mapping for 12.6-versus-12.8-US-qt gasoline cooling capacity.
- Trim/package mapping for 4.8-versus-5.0-US-qt gasoline rear-differential capacity.
- EPA 48903 transfer type, complete tire-package mapping, machine-readable rotation patterns and wheel-material confirmation.
- Current NHTSA recall enrichment, exact-applicability TSBs, aggregate unverified owner reports and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 10 new; 0 materially improved existing sheets.
- **Expected verified library total:** 91 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 91 vehicle sheets.
- **Citation check:** Grounded-citation ledger verification passed; fourteen cited official sources are mapped mechanically below.
- **Publication:** Guarded publisher committed and pushed the completed library batch to branch `vehicle-specs-library`; initial content commit `86dfb43`. No deployment was triggered.

## Sources

[1] https://assets.sipb.toyota.com/publications/en/om-s/OM04011U/pdf/OM04011U.pdf
[2] https://assets.sipb.toyota.com/publications/en/om-s/OM04012U/pdf/OM04012U.pdf
[3] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25Tacoma/pdf/T-MMS-25Tacoma.pdf
[4] https://assets.sipb.toyota.com/publications/en/omms-s/T-MMS-25TacomaHV/pdf/T-MMS-25TacomaHV.pdf
[13] https://www.fueleconomy.gov/ws/rest/vehicle/48870 — EPA vehicle record 48870
[14] https://www.fueleconomy.gov/ws/rest/vehicle/48871 — EPA vehicle record 48871
[15] https://www.fueleconomy.gov/ws/rest/vehicle/48872 — EPA vehicle record 48872
[16] https://www.fueleconomy.gov/ws/rest/vehicle/48877 — EPA vehicle record 48877
[17] https://www.fueleconomy.gov/ws/rest/vehicle/48878 — EPA vehicle record 48878
[18] https://www.fueleconomy.gov/ws/rest/vehicle/48879 — EPA vehicle record 48879
[19] https://www.fueleconomy.gov/ws/rest/vehicle/48880 — EPA vehicle record 48880
[20] https://www.fueleconomy.gov/ws/rest/vehicle/48881 — EPA vehicle record 48881
[21] https://www.fueleconomy.gov/ws/rest/vehicle/48902 — EPA vehicle record 48902
[22] https://www.fueleconomy.gov/ws/rest/vehicle/48903 — EPA vehicle record 48903
