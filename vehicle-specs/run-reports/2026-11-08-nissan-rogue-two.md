# Vehicle-spec library run report — 2026-11-08 Nissan Rogue FWD/AWD

## Scope and phase

- **Active phase:** 2017–2026, the rolling newest ten model years as of 2026.
- **Batch result:** 2 new exact US-market sheets completed; the batch stopped below ten because exact OEM research and variant separation were prioritized over quota.
- **Coverage mix:** mainstream compact crossover with FWD and AWD configurations kept separate; AWD includes standard, SL/Platinum and Rock Creek identity groups with tire/equipment warnings.

## Files changed

- `data/2025/nissan/rogue/1.5l-vc-turbo-cvt-fwd.md`
- `data/2025/nissan/rogue/1.5l-vc-turbo-cvt-awd.md`
- `catalog.md`
- `run-reports/2026-11-08-nissan-rogue-two.md`

## Sources and mechanical fields

- The exact-year Nissan Rogue owner manual supports 0W-20 SP/GF-6A oil, 4.7 L/5 US qt with-filter refill, 8.5 L/9 US qt engine coolant, 3.0 L/3 1/8 US qt intercooler coolant, NS-3 CVT fluid, DOT 3 brake fluid, 80 ft-lb wheel torque, trim-specific tire pressures, ILMAR8G8GS plugs at 0.8 mm, lamp distinctions and normal/severe maintenance schedules.[1]
- The AWD sheet separately records 75W-80 rear-differential oil, synthetic 75W-90 transfer fluid and Nissan LSC 12-301 coupling oil.[1]
- Unsupported CVT and AWD service quantities, exact filter part numbers, battery group/CCA, rotation pattern and a confidently parsed numeric brake-fluid interval remain `Needs research`; no neighboring-year or calculated values were substituted.[1]

## Reference enrichment

- fueleconomy.gov IDs 48522 and 48523 confirm the 2025 Rogue 1.5L turbo/automatic-variable-ratio/FWD identities for standard and SL/Platinum groups.[8][9]
- fueleconomy.gov IDs 48540, 48541 and 48542 confirm the corresponding AWD identities for standard, SL/Platinum and Rock Creek groups.[10][11][12]
- The NHTSA endpoint returned three model-level campaigns on 2026-11-08: 24V748000, 26V080000 and 26V081000; both sheets label the results VIN/equipment-specific and keep them separate from mechanical authority.[7]
- **TSBs/manufacturer communications:** No TSB entry was added.
- **Owner complaints:** No complaint aggregate was added and no personal narrative was copied.

## Commercial images

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, exact-generation and commercial-license review; no image was copied, uploaded or selected as a live-app default.

## Conflicts and corrections

- No conflict remained between populated mechanical values and the exact 2025 OEM manual.[1]
- The owner manual’s schedule-table extraction was not clear enough to publish a numeric brake-fluid replacement interval, so that interval remains an explicit research gap rather than a guess.[1]

## Unresolved gaps

- CVT service quantity; AWD differential, transfer and coupling capacities; coupling-oil replacement interval; exact filter part numbers; battery group/CCA; complete trim-specific lamp inventory; rotation pattern; numeric brake-fluid interval; TSBs; complaint aggregates; and a commercially reusable exact-generation image.

## Verification and publication

- **Completed sheet count:** 2 created; 0 previously published sheets materially improved.
- **Grounded-citation verification:** citation IDs and generated source mappings passed ledger verification; the coverage diagnostic was reviewed, and source-bearing mechanical bullets carry inline provenance.
- **Repository verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with **58 vehicle sheets**.
- **Publication branch:** `vehicle-specs-library`.
- **Publication status:** Guarded publication pending; this annotation will be updated after the publisher returns a commit. No deployment is authorized.

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/rogue/2025/2025-nissan-rogue-owner-manual.pdf — 2025 Nissan Rogue Owner Manual
[7] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=Rogue&modelYear=2025 — NHTSA 2025 Nissan Rogue recalls
[8] https://www.fueleconomy.gov/ws/rest/vehicle/48522 — fueleconomy.gov vehicle 48522
[9] https://www.fueleconomy.gov/ws/rest/vehicle/48523 — fueleconomy.gov vehicle 48523
[10] https://www.fueleconomy.gov/ws/rest/vehicle/48540 — fueleconomy.gov vehicle 48540
[11] https://www.fueleconomy.gov/ws/rest/vehicle/48541 — fueleconomy.gov vehicle 48541
[12] https://www.fueleconomy.gov/ws/rest/vehicle/48542 — fueleconomy.gov vehicle 48542
