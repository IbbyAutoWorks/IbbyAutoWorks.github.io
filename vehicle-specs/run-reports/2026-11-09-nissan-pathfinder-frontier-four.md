# Vehicle-spec library run report — 2026-11-09 Nissan Pathfinder/Frontier four-sheet batch

## Scope and phase

- **Active phase:** 2017–2026, the rolling newest ten model years as of 2026.
- **Batch result:** 4 new exact US-market sheets completed; the batch stopped below ten because exact OEM extraction, drivetrain separation and a source conflict were prioritized over quota.[1][2]
- **Coverage mix:** mainstream three-row SUV and midsize pickup coverage, with Pathfinder FWD/4WD and Frontier 2WD/4WD kept separate.[1][2]

## Files changed

- `data/2025/nissan/pathfinder/3.5l-v6-9at-fwd.md`
- `data/2025/nissan/pathfinder/3.5l-v6-9at-4wd.md`
- `data/2025/nissan/frontier/3.8l-v6-9at-2wd.md`
- `data/2025/nissan/frontier/3.8l-v6-9at-4wd.md`
- `catalog.md`
- `run-reports/2026-11-09-nissan-pathfinder-frontier-four.md`

## Sources and mechanical fields

- The exact-year Nissan Pathfinder owner manual supports VQ35DD 0W-20 SP/GF-6A oil, 4.8 L/5 1/8 US qt with-filter refill, tow-package-dependent coolant capacity, Matic R ATF, DOT 3 brake fluid, 83 ft-lb wheel torque, FXE22HR-11 plugs at 1.1 mm, bulb/assembly distinctions and normal/severe schedules.[1]
- The Pathfinder 4WD sheet separately records 75W-90 differential/transfer fluids and LSC 12-301 coupling fluid; unpublished capacities remain `Needs research` instead of being inferred.[1]
- The exact-year Nissan Frontier owner manual supports VQ38DD 0W-20 SP/GF-6A oil, 5.0 L/5 1/4 US qt with-filter refill, 12.0 L coolant capacity, Matic P ATF, DOT 3 brake fluid, 98 ft-lb wheel torque, FXE22HR-11 plugs at 1.1 mm, bulb/assembly distinctions and normal/severe schedules.[2]
- The Frontier 4WD sheet separately records D3M transfer fluid at 1.5 L, front-final-drive 80W-90 and rear-final-drive 75W-90 at 2.01 L; the source conflict on the front-final-drive capacity is preserved rather than silently corrected.[2]
- Exact filter part numbers, battery group/CCA, rotation patterns, selected service quantities and complete trim-specific tire/lamp details remain `Needs research` where the manuals did not supply exact support.[1][2]

## Reference enrichment

- fueleconomy.gov IDs 48606 and 48615 confirm the 2025 Pathfinder 3.5L six-cylinder/automatic 9-speed FWD and 4WD identities.[5][6]
- fueleconomy.gov IDs 48509 and 48514 confirm the 2025 Frontier 3.8L six-cylinder/automatic 9-speed RWD and part-time 4WD identities.[7][8]
- The NHTSA Pathfinder endpoint returned campaign 25V173000 on 2026-11-09; the sheets label it VIN/equipment-specific and separate it from mechanical authority.[3]
- The NHTSA Frontier endpoint returned campaigns 25V324000, 25V508000 and 26V023000 on 2026-11-09; the sheets keep recalls separate from specifications.[4]
- **TSBs/manufacturer communications:** No TSB entry was added.
- **Owner complaints:** No complaint aggregate was added and no personal narrative was copied.

## Commercial images

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, exact-generation and commercial-license review; no image was copied, uploaded or selected as a live-app default.

## Conflicts and corrections

- The Frontier manual extraction places a 0.85 L metric front-final-drive capacity beside 1 3/4 US qt.[2] Those quantities are inconsistent, so the 4WD sheet publishes the source-stated metric value with an explicit conflict warning and withholds the US-unit figure pending a clean OEM table or service source.[2]
- No populated value was taken from a neighboring year, retailer, forum, search snippet or calculated unit conversion.[1][2]

## Unresolved gaps

- Automatic-transmission service quantities; Pathfinder 4WD differential/transfer/coupling capacities; clean confirmation of the Frontier front-final-drive US-unit capacity; exact filter part numbers; battery group/CCA; rotation patterns; complete trim-specific tire/lamp inventories; TSBs; complaint aggregates; and commercially reusable exact-generation images.[1][2]

## Verification and publication

- **Completed sheet count:** 4 created; 0 previously published sheets materially improved.
- **Grounded-citation verification:** Citation IDs and mechanically rendered source mappings passed ledger verification; the strict run-report coverage gate passed at 58%.
- **Repository verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with **65 vehicle sheets**.
- **Publication branch:** `vehicle-specs-library`.
- **Publication status:** Pending guarded publisher after successful local verification; no deployment will be triggered.

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/pathfinder/2025/2025-nissan-pathfinder-owner-manual.pdf — 2025 Nissan Pathfinder Owner Manual
[2] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/frontier/2025/2025-nissan-frontier-owner-manual.pdf — 2025 Nissan Frontier Owner Manual
[3] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=Pathfinder&modelYear=2025 — NHTSA 2025 Nissan Pathfinder recalls
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=Frontier&modelYear=2025 — NHTSA 2025 Nissan Frontier recalls
[5] https://www.fueleconomy.gov/ws/rest/vehicle/48606 — fueleconomy.gov vehicle 48606
[6] https://www.fueleconomy.gov/ws/rest/vehicle/48615 — fueleconomy.gov vehicle 48615
[7] https://www.fueleconomy.gov/ws/rest/vehicle/48509 — fueleconomy.gov vehicle 48509
[8] https://www.fueleconomy.gov/ws/rest/vehicle/48514 — fueleconomy.gov vehicle 48514
