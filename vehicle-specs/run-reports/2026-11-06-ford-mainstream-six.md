# Vehicle-spec library run report — 2026-11-06 Ford mainstream six

## Scope and phase

- **Active phase:** 2017–2026, the rolling newest ten model years as of 2026.
- **Batch result:** 6 new exact US-market sheets; 0 materially improved existing sheets.
- **Coverage mix:** compact pickup, compact crossover/SUV and passenger-car/coupe-convertible coverage.
- **Variants preserved:** Maverick 2.0L FWD, 2.0L AWD and 2.5L hybrid FWD; Bronco Sport 1.5L and 2.0L 4WD; Mustang 2.3L automatic RWD base/non-performance configuration.

## Files changed

- `data/2024/ford/maverick/2.0l-ecoboost-fwd.md`
- `data/2024/ford/maverick/2.0l-ecoboost-awd.md`
- `data/2024/ford/maverick/2.5l-hybrid-fwd.md`
- `data/2024/ford/bronco-sport/1.5l-ecoboost-4wd.md`
- `data/2024/ford/bronco-sport/2.0l-ecoboost-4wd.md`
- `data/2024/ford/mustang/2.3l-ecoboost-auto-rwd-base.md`
- `catalog.md`
- `run-reports/2026-11-06-ford-mainstream-six.md`

## Sources and mechanical fields

- The exact-year Ford Maverick manual supports engine-specific oil specifications and capacities, separate hybrid cooling circuits, brake-fluid specification, wheel torque, placard guidance, rotation patterns, filters, 12V batteries, spark plugs/gaps, bulb/LED distinctions and oil-life limits.[1]
- The exact-year Ford Bronco Sport manual supports separate 1.5L and 2.0L oil/coolant values, MERCON ULV transmission-fluid specification, brake-fluid specification, wheel torque, placard guidance, filters, batteries, spark plugs/gaps, bulb/LED distinctions and oil-life limits.[2]
- The exact-year Ford Mustang manual supports the 2.3L oil/coolant values, 10R80 fluid and published total capacity, brake fluid, rear-axle lubricant/capacity, wheel torque, placard and rotation guidance, filters, battery, plugs/gap, LED status and normal/severe/track maintenance intervals.[3]
- Unsupported Maverick transmission/AWD service quantities, Bronco Sport transmission/4WD-unit quantities and routine Mustang transmission drain-and-fill quantity remain `Needs research`; no neighboring-model or calculated values were substituted.

## Reference enrichment

- fueleconomy.gov confirms the three exact Maverick identities: 2.0L turbo/8-speed FWD ID 47363, 2.0L turbo/8-speed AWD ID 47366 and 2.5L variable-ratio hybrid FWD ID 47364.[4][5][6]
- fueleconomy.gov confirms Bronco Sport 4WD IDs 47375 for the 1.5L turbo/8-speed and 47376 for the 2.0L turbo/8-speed.[7]
- fueleconomy.gov confirms Mustang ID 46646 for the 2.3L turbo/10-speed configuration.[8]
- The NHTSA model-year endpoints returned 15 Maverick, 8 Bronco Sport and 12 Mustang recall records on 2026-11-06; every sheet labels these as VIN/equipment-specific enrichment rather than mechanical authority.[9][10][11]
- Engine/powertrain distinctions were retained where the official recall text is specific: Maverick hybrid-control campaigns are not asserted for gasoline sheets, Bronco Sport campaign 25V467000 is kept on the 1.5L sheet and excluded from the 2.0L sheet, and Mustang campaign 24V220000 is identified as 2.3L-specific.[9][10][11]
- **TSBs/manufacturer communications:** No TSB entry was added in this batch.
- **Owner complaints:** No complaint aggregate was added; no personal narratives were copied.

## Commercial images

- **Embedded remote previews:** None.
- **Source/license status:** No candidate passed original-source, exact-generation and commercial-license review during this batch. No image was copied, uploaded or selected as a live-app default.

## Conflicts and unresolved gaps

- **Conflicts:** No cross-source value conflict was found. The Maverick manual's hybrid oil-life wording notes that hybrid intervals can exceed 10,000 miles while also stating a 10,000-mile maximum; the sheet preserves the conservative maximum and directs the shop to the displayed message and current VIN-specific Ford schedule.
- **Maverick gaps:** transmission/eCVT specifications and service quantities, AWD unit fluids/capacities, non-oil VIN-specific intervals, high-voltage battery service data, TSBs, complaint aggregates and a commercially reusable exact-generation image.
- **Bronco Sport gaps:** transmission service quantity, power-transfer/rear-drive-unit fluids and capacities, non-oil VIN-specific intervals, TSBs, complaint aggregates and a commercially reusable exact-generation image.
- **Mustang gaps:** routine automatic-transmission drain-and-fill quantity, TSBs, complaint aggregates and a commercially reusable exact-generation image.

## Verification and publication

- **Completed sheet count:** 6 created; 0 materially improved.
- **Verifier before publication:** `python scripts/verify-vehicle-spec-markdown.py` passed with **37 vehicle sheets**.
- **Publication branch:** `vehicle-specs-library`.
- **Publication commit:** Pending assignment by the required guarded publisher; this report will be finalized with the first guarded content commit if publication succeeds. No deployment is permitted or triggered.

## Sources

[1] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2024_Ford_Maverick_Owners_Manual_version_1_om_EN-US.pdf — 2024 Ford Maverick Owner Manual
[2] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2024_Ford_Bronco_Sport_Owners_Manual_version_1_om_EN-US.pdf — 2024 Ford Bronco Sport Owner Manual
[3] https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2024_Ford_Mustang_Owners_Manual_version_1_om_EN-US.pdf — 2024 Ford Mustang Owner Manual
[4] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Maverick%20FWD — fueleconomy.gov 2024 Ford Maverick FWD options
[5] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Maverick%20AWD — fueleconomy.gov 2024 Ford Maverick AWD options
[6] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Maverick%20HEV%20FWD — fueleconomy.gov 2024 Ford Maverick HEV FWD options
[7] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Bronco%20Sport%204WD — fueleconomy.gov 2024 Ford Bronco Sport 4WD options
[8] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Ford&model=Mustang — fueleconomy.gov 2024 Ford Mustang options
[9] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=MAVERICK&modelYear=2024 — NHTSA 2024 Ford Maverick recalls API
[10] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=BRONCO%20SPORT&modelYear=2024 — NHTSA 2024 Ford Bronco Sport recalls API
[11] https://api.nhtsa.gov/recalls/recallsByVehicle?make=FORD&model=MUSTANG&modelYear=2024 — NHTSA 2024 Ford Mustang recalls API
