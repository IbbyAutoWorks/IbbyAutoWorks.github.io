# Vehicle-spec library run — 2026-11-15 — Ford Bronco Sport and Maverick six-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Six exact US-market 2025 Ford sheets were completed without jumping to an older phase: three Bronco Sport crossover identities and three Maverick pickup identities.

## Files changed

- `vehicle-specs/data/2025/ford/bronco-sport/1.5l-ecoboost-8at-4wd.md` — new researched 1.5L non-Sasquatch sheet.
- `vehicle-specs/data/2025/ford/bronco-sport/1.5l-ecoboost-8at-sasquatch-4wd.md` — new researched 1.5L Sasquatch sheet.
- `vehicle-specs/data/2025/ford/bronco-sport/2.0l-ecoboost-s8-4wd.md` — new researched 2.0L sheet preserving EPA's `Automatic (S8)` identity.
- `vehicle-specs/data/2025/ford/maverick/2.0l-ecoboost-8at-awd.md` — new researched EcoBoost AWD pickup sheet.
- `vehicle-specs/data/2025/ford/maverick/2.5l-hybrid-ecvt-fwd.md` — new researched Hybrid FWD sheet.
- `vehicle-specs/data/2025/ford/maverick/2.5l-hybrid-ecvt-awd.md` — new researched Hybrid AWD sheet.
- `vehicle-specs/catalog.md` — added all six exact identities and the dated coverage note.
- `vehicle-specs/run-reports/2026-11-15-ford-bronco-sport-maverick-six.md` — this report.

## Source set

- The exact-year US Ford Bronco Sport owner manual is the mechanical authority for oil, coolant, transmission-fluid specification, brake fluid, wheel torque, tire guidance, filters, ignition, lamps and maintenance intervals on the three Bronco Sport sheets.[4]
- The exact-year US/Canada Ford Maverick owner manual supplies the corresponding mechanical fields while preserving EcoBoost and hybrid cooling, parts and ignition differences.[5]
- EPA vehicle records preserve the three Bronco Sport identities: 1.5L part-time 4WD, 1.5L Sasquatch 4WD and 2.0L 4WD.[17][18][19]
- EPA vehicle records separately preserve Maverick 2.0L part-time 4WD, Hybrid FWD and Hybrid part-time 4WD identities.[20][21][22]
- NHTSA year/make/model endpoints provide dated model-level recall enrichment only, not mechanical authority.[6][7]

## Mechanical fields

- The Bronco Sport 1.5L sheets record SAE 0W-20/WSS-M2C962-A1 and 5.0 US qt with filter, while the 2.0L sheet separately records its 6.1-US-qt capacity, cold-weather oil alternative, larger coolant quantity, different air filter and different spark-gap range.[4]
- The Maverick EcoBoost sheet records SAE 5W-30/WSS-M2C961-A1, 6.1 US qt with filter and tow-package-dependent coolant quantity; the hybrid sheets separately record SAE 0W-20, 5.7 US qt and distinct high- and low-temperature cooling circuits.[5]
- Exact transmission and AWD-unit service quantities remain `Needs research` where the owner manuals do not publish a supported service fill; conventional MERCON ULV data was not applied to the hybrid eCVT.[4][5]
- All six sheets record DOT 4 LV brake fluid, physical-placard tire-pressure control, rotation guidance, wheel torque, supported filter references, spark plugs/gaps, replaceable bulbs versus LED assemblies, and normal/severe maintenance paths.[4][5]

## Reference enrichment

- EPA IDs 48916, 49057 and 48917 keep Bronco Sport non-Sasquatch 1.5L, Sasquatch 1.5L and 2.0L records distinct.[17][18][19]
- EPA IDs 48874, 48869 and 48873 keep Maverick EcoBoost AWD, Hybrid FWD and Hybrid AWD records distinct.[20][21][22]
- The Bronco Sport NHTSA endpoint returned seven model-level campaigns on 2026-11-15, and the Maverick endpoint returned twelve; every campaign remains VIN/equipment/powertrain-specific and separate from specifications.[6][7]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no bulletin was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among accepted exact-year mechanical values.
- EPA labels the 2.0L Bronco Sport transmission `Automatic (S8)` while the owner-facing sheet describes the powertrain without establishing a service-fill quantity; the EPA descriptor is preserved rather than normalized.[18]
- The manuals discuss PTU/rear-axle maintenance exceptions but do not publish supported service fills for these exact variants, so those fields remain unresolved instead of borrowing nearby Ford data.[4][5]

## Unresolved gaps

- Exact automatic/eCVT service fluids and quantities where not explicitly supported, plus PTU/front/rear-drive-unit service fills.
- Replacement 12-volt battery ratings/part numbers and separate hybrid traction-battery service specifications.
- Trim-specific reference tire pressures beyond the controlling physical placard.
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 6 new; 0 materially improved existing sheets.
- **Verified library total:** 117 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 117 vehicle sheets before publication.
- **Citation check:** The evidence-backed report passed ledger verification at 36% sentence coverage; uncited sentences are repository-state and workflow reporting rather than outside factual claims.
- **Publication branch:** `vehicle-specs-library`.
- **Content commit:** `66f39a6eec41f5bd8caec50a65a876648e2568e3` was pushed through the guarded publisher and matched `origin/vehicle-specs-library`; no deployment was triggered.
- **Report publication:** This finalized publication record is being added through the same guarded publisher in a follow-up report-only commit.

## Sources

[4] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2025_Ford_Bronco_Sport_OM_ENGLISH_V1.pdf — 2025 Ford Bronco Sport Owner Manual
    > "5.0 qt (4.7 L)All."
[5] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2025_P758_Maverick_OM_USCAN_enUSA.pdf — 2025 Ford Maverick Owner Manual
    > "5.77 L (6.1 qt)All."
[6] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=BRONCO%20SPORT&modelYear=2025 — NHTSA recalls 2025 Ford Bronco Sport
    > "Ford Motor Company (Ford) is recalling certain 2025 Bronco Sport, Escape, and Lincoln Corsair vehicles."
[7] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=MAVERICK&modelYear=2025 — NHTSA recalls 2025 Ford Maverick
    > "Ford Motor Company (Ford) is recalling certain 2025 Maverick vehicles."
[17] https://www.fueleconomy.gov/ws/rest/vehicle/48916 — EPA vehicle 48916
    > "Bronco Sport 4WD"
[18] https://www.fueleconomy.gov/ws/rest/vehicle/48917 — EPA vehicle 48917
    > "Bronco Sport 4WD"
[19] https://www.fueleconomy.gov/ws/rest/vehicle/49057 — EPA vehicle 49057
    > "Bronco Sport Sasquatch 4WD"
[20] https://www.fueleconomy.gov/ws/rest/vehicle/48874 — EPA vehicle 48874
    > "Part-time 4-Wheel Drive"
[21] https://www.fueleconomy.gov/ws/rest/vehicle/48869 — EPA vehicle 48869
    > "Maverick HEV FWD"
[22] https://www.fueleconomy.gov/ws/rest/vehicle/48873 — EPA vehicle 48873
    > "Maverick HEV AWD"
