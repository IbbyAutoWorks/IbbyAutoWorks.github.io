# Vehicle-spec library run — 2026-11-14 — 2025 Ford Explorer six-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Six exact US-market 2025 Ford Explorer EPA identities completed without jumping to an older phase: 2.3L RWD/part-time 4WD plus 3.0L RWD/part-time 4WD records split by EPA's `Automatic (S10)` and `Automatic 10-spd` descriptors.[5][6][7][8][9][10]

## Files changed

- `vehicle-specs/data/2025/ford/explorer/2.3l-ecoboost-10at-rwd.md` — new researched RWD SUV sheet.
- `vehicle-specs/data/2025/ford/explorer/2.3l-ecoboost-10at-awd.md` — new researched part-time-4WD SUV sheet.
- `vehicle-specs/data/2025/ford/explorer/3.0l-ecoboost-s10-rwd-epa-48281.md` — new researched EPA 48281 sheet.
- `vehicle-specs/data/2025/ford/explorer/3.0l-ecoboost-10at-rwd-epa-48282.md` — new researched EPA 48282 sheet.
- `vehicle-specs/data/2025/ford/explorer/3.0l-ecoboost-s10-awd-epa-48118.md` — new researched EPA 48118 sheet.
- `vehicle-specs/data/2025/ford/explorer/3.0l-ecoboost-10at-awd-epa-48119.md` — new researched EPA 48119 sheet.
- `vehicle-specs/catalog.md` — added all six exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-14-ford-explorer-six.md` — this report.

## Source set

- The exact-year US Ford owner manual is the mechanical authority for oil, coolant, transmission-fluid specification, brake fluid, drivetrain fluids, wheel torque, tire guidance, parts, bulbs and the oil-life maximum.[1]
- Six individual fueleconomy.gov vehicle records preserve the engine, fuel, drivetrain and transmission-descriptor identities instead of collapsing the EPA records.[5][6][7][8][9][10]
- NHTSA's official year/make/model endpoint supplies dated model-level recall enrichment only.[4]

## Mechanical fields

- The 2.3L sheets record SAE 5W-30/WSS-M2C961-A1 and 5.0 US qt with filter; the 3.0L sheets separately record the same oil specification with 6.0 US qt.[1]
- Cooling remains engine-specific: 14.3 US qt for 2.3L, while 3.0L is 18.0 US qt with rear heat or 15.5 US qt without rear heat.[1]
- All six sheets record MERCON ULV/WSS-M2C949-A but leave the unpublished service quantity as `Needs research`; AWD/4WD sheets separately carry MERCON LV transfer-case and SAE 75W-140 front-axle values.[1]
- Rear-axle values preserve the manual's 2.3L non-Timberline/Timberline distinction and limited-slip friction-modifier note; the 3.0L sheets use the manual's 1.8-L all-other-engine figure.[1]
- All six sheets record DOT 4 LV brake fluid, 150-lb-ft wheel torque, controlling physical-placard tire pressure, exact engine-specific filters/batteries/plugs/gaps, and replaceable rear bulbs versus LED assemblies.[1]
- Oil service follows the Intelligent Oil-Life Monitor with the manual's failure fallback and one-year/10,000-mile maximum; other fixed VIN-aware normal/severe intervals remain unresolved rather than inferred.[1]

## Reference enrichment

- EPA IDs 48283 and 48120 confirm the 2.3L RWD and part-time-4WD identities.[5][6]
- EPA IDs 48281/48282 and 48118/48119 preserve separate 3.0L RWD/part-time-4WD `Automatic (S10)` and `Automatic 10-spd` records.[7][8][9][10]
- The NHTSA endpoint returned 20 model-level campaigns on 2026-11-14; all remain VIN/equipment-specific and separate from mechanical authority.[4]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no TSB was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year mechanical values.
- The Ford manual lists two 3.0L replacement batteries without mapping them to trim/equipment; both are retained with an installed-battery confirmation warning.[1]
- The 2.3L rear-axle table distinguishes non-Timberline, Timberline and limited-slip requirements without fully mapping the EPA identity to trim/axle equipment; the 4WD sheet therefore keeps that capacity mapping unresolved.[1]
- EPA publishes distinct `Automatic (S10)` and `Automatic 10-spd` 3.0L records; they were kept as separate sheets rather than silently merged.[7][8][9][10]

## Unresolved gaps

- Exact automatic-transmission service quantity.
- VIN-aware fixed normal/severe intervals for brake fluid, filters, coolant, driveline fluids and spark plugs.
- Trim-specific reference tire pressures beyond the controlling physical placard.
- 2.3L 4WD trim/axle mapping and 3.0L battery-to-equipment mapping.
- Exact-applicability TSBs, aggregate unverified owner-report themes and a commercially reusable exact-generation image.

## Completion, verification and publication

- **Completed sheets:** 6 new; 0 materially improved existing sheets.
- **Verified library total:** 111 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 111 vehicle sheets.
- **Citation check:** All six new sheets passed the evidence-backed citation/source-block verifier; the shared ledger produced expected unused-source warnings on each per-variant sheet.
- **Publication branch:** `vehicle-specs-library`.
- **Publication continuation:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` initially returned exit 126 because the guarded Python publisher is not marked executable. This continuation invokes that same publisher through the Python interpreter; the resulting content commit will be recorded in a follow-up report-only publication. No alternate publication path or deployment is used.

## Sources

[1] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2025_Ford_Explorer_U625_Owner_Manual_enUSA_v1.pdf — 2025 Ford Explorer Owner Manual
    > "150 lb.ft (204 Nm)M14 x 1.5"
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=EXPLORER&modelYear=2025 — NHTSA recalls 2025 Ford Explorer
    > "The fuel injectors may have been assembled without O-ring support discs, which can result in a fuel leak."
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48283 — EPA 2025 Ford Explorer RWD 2.3L
    > "Standard Sport Utility Vehicle 2WD"
[6] https://www.fueleconomy.gov/ws/rest/vehicle/48120 — EPA 2025 Ford Explorer AWD 2.3L
    > "Standard Sport Utility Vehicle 4WD"
[7] https://www.fueleconomy.gov/ws/rest/vehicle/48281 — EPA 2025 Ford Explorer RWD 3.0L S10
    > "Standard Sport Utility Vehicle 2WD"
[8] https://www.fueleconomy.gov/ws/rest/vehicle/48282 — EPA 2025 Ford Explorer RWD 3.0L 10-speed
    > "Standard Sport Utility Vehicle 2WD"
[9] https://www.fueleconomy.gov/ws/rest/vehicle/48118 — EPA 2025 Ford Explorer AWD 3.0L S10
    > "Standard Sport Utility Vehicle 4WD"
[10] https://www.fueleconomy.gov/ws/rest/vehicle/48119 — EPA 2025 Ford Explorer AWD 3.0L 10-speed
    > "Standard Sport Utility Vehicle 4WD"
