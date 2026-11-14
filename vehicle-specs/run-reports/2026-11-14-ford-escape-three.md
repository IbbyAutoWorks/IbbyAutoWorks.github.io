# Vehicle-spec library run — 2026-11-14 — 2025 Ford Escape three-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Three exact US-market 2025 gasoline Escape sheets completed without jumping to an older phase: 1.5L EcoBoost FWD, 1.5L EcoBoost AWD and 2.0L EcoBoost AWD.

## Files changed

- `vehicle-specs/data/2025/ford/escape/1.5l-ecoboost-8at-fwd.md` — new researched FWD crossover sheet.
- `vehicle-specs/data/2025/ford/escape/1.5l-ecoboost-8at-awd.md` — new researched 1.5L AWD crossover sheet.
- `vehicle-specs/data/2025/ford/escape/2.0l-ecoboost-8at-awd.md` — new researched 2.0L AWD crossover sheet.
- `vehicle-specs/catalog.md` — added all three exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-14-ford-escape-three.md` — this report.

## Source set

- Exact-year US Ford Owner's Manual pages are the mechanical authority for engine oil, coolant, transmission, brake fluid, AWD rear-drive-unit fluid, wheel torque, tire guidance, parts and maintenance intervals.[3][5][7]
- Separate Ford pages preserve the 2.0L engine's oil, coolant and service-part differences instead of borrowing 1.5L values.[4][6][14]
- EPA records confirm the three selected engine, transmission, fuel and drivetrain identities.[17][18][19]
- NHTSA's official year/make/model endpoint provides dated model-level recall enrichment only.[20]

## Mechanical fields

- Both 1.5L sheets record SAE 0W-20 meeting WSS-M2C962-A1 and 5.00 qt with filter, while the 2.0L sheet separately records SAE 5W-30 meeting WSS-M2C961-A1, its extreme-cold 0W-30 alternative and 6.13 qt with filter.[3][4]
- The 1.5L and 2.0L cooling capacities remain engine-specific; all three sheets retain Ford's WSS-M97B57-A2 yellow-coolant requirement.[5][6]
- All three sheets record MERCON ULV and the published 11.6-qt approximate 8F35 dry fill, explicitly preserving that it is not an accepted drain-and-fill service quantity.[7]
- Both AWD sheets separately record 0.8 qt of Motorcraft Disconnect Rear Drive Unit Fluid XY-75W-QL; the FWD sheet marks rear-drive-unit service not applicable.[9][17]
- Ford DOT 4 LV brake fluid and 100-lb-ft wheel-nut torque are retained across all three sheets.[8][10]
- Tire pressure remains controlled by the physical vehicle label, while exact Motorcraft filter, battery and spark-plug references remain engine-specific.[13][14][21]
- Normal and special-operating-condition intervals remain separate, including oil-life-monitor service, three-year brake fluid, fixed filter/coolant/transmission/plug intervals and severe-use transmission, plug, tire-rotation and oil-service paths.[15][16]

## Reference enrichment

- EPA vehicle 48602 confirms the 1.5L FWD identity, 48608 confirms the 1.5L AWD identity and 48607 confirms the 2.0L AWD identity.[17][18][19]
- The NHTSA endpoint returned nine 2025 Escape model-level campaigns on 2026-11-14; every campaign remains equipment/VIN-specific and separate from mechanical authority.[20]
- Manufacturer communications/TSBs and aggregate owner-complaint themes remain `Needs research`; no TSB was labeled a recall and no complaint narrative was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct contradiction was found among the accepted exact-year Ford mechanical pages.
- Ford publishes the 8F35 quantity as an approximate dry-fill value and warns that the actual amount can vary during fluid changes; the sheets therefore do not present it as a drain-and-fill quantity.[7]

## Unresolved gaps

- Exact automatic-transmission drain-and-fill service quantity.
- AWD power-transfer-unit fluid specification/capacity and separately labeled front-final-drive service data.
- Spark-plug gap and complete replaceable-bulb versus LED-assembly inventory.
- Trim-specific reference tire pressures beyond the controlling physical placard.
- Exact-applicability TSBs, aggregate unverified owner-report themes and a commercially reusable exact-generation image.

## Completion, verification and publication

- **Completed sheets:** 3 new; 0 materially improved existing sheets.
- **Verified library total:** 105 sheets.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 105 vehicle sheets.
- **Citation check:** All three new sheets passed ledger verification at 55–59% sentence coverage. The run report passed ledger/source-block verification; its lower 36% metric reflects uncited repository-state and workflow reporting rather than unsupported outside-source claims.
- **Publication branch:** `vehicle-specs-library`.
- **Content commit:** `2d416419c4d1283782f841c374d77f9765fccc34` was pushed through the guarded publisher and matched `origin/vehicle-specs-library`; no deployment was triggered.
- **Report publication:** This finalized report is being added through the same guarded publisher in a follow-up report-only commit.

## Sources

[3] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133834&Uid=G2320660&ProcUid=G2320664&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[4] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133834&Uid=G2320661&ProcUid=G2320665&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[5] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133835&Uid=G2261025&ProcUid=G2261038&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[6] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133835&Uid=G2261027&ProcUid=G2261040&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[7] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133843&Uid=G2263187&ProcUid=G2263191&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[8] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133844&Uid=G2261047&ProcUid=G2220008&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[9] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2133847&Uid=G2395721&ProcUid=G2395722&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[10] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2154962&Uid=G2180866&ProcUid=G2181101&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[13] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G1517147&Uid=G2275613&ProcUid=G2211463&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[14] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G1517147&Uid=G2320945&ProcUid=G2320947&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[15] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G1612532&Uid=G1995755&ProcUid=G2037562&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[16] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G1612531&Uid=G1995756&ProcUid=G2135310&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web
[17] https://www.fueleconomy.gov/ws/rest/vehicle/48602
[18] https://www.fueleconomy.gov/ws/rest/vehicle/48608
[19] https://www.fueleconomy.gov/ws/rest/vehicle/48607
[20] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=ESCAPE&modelYear=2025
[21] https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?variantid=10278&languageCode=en&countryCode=USA&moidRef=G2092006&Uid=G2151503&ProcUid=G2137072&userMarket=USA&div=f&vFilteringEnabled=False&buildtype=web — 2025 Ford Escape Owner Manual - Locating the Tire Label
