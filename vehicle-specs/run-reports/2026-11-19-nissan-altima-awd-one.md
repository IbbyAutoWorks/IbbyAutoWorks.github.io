# Vehicle-spec library run — 2026-11-19 — Nissan Altima AWD

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Batch result:** One exact US-market 2026 Nissan Altima passenger-car sheet was added without duplicating an existing filename/catalog identity or moving to an older phase: 2.5L PR25DD inline-4, Xtronic CVT and Intelligent All-Wheel Drive.[1][2]
- Eight previously verified but uncommitted 2026 Hyundai Elantra/Tucson and Nissan Frontier/Sentra/Altima FWD sheets were preserved in the shared worktree because the guarded publisher remains non-executable; this run did not count them as new or materially improved sheets.[unverified]

## Files changed

- `vehicle-specs/data/2026/nissan/altima/2.5l-pr25dd-cvt-awd.md` — new exact AWD Altima sheet.
- `vehicle-specs/catalog.md` — exact AWD identity and dated coverage note added.
- `vehicle-specs/run-reports/2026-11-19-nissan-altima-awd-one.md` — this report.
- Preserved without rewriting: the eight verified carryover sheets, their prior reports and prior publication-retry reports.[unverified]

## Source set

Nissan's exact-year 2026 Altima Owner Manual is the primary mechanical authority; printed pages 410–443, 448–478 and 482 support the populated fluid, capacity, torque, tire, filter, battery, bulb, ignition, AWD and maintenance fields.[1]

Nissan's official US product page confirms the 2026 model and available Intelligent AWD, while its trim/version content includes AWD offerings.[2] EPA's 2026 options response currently exposes only FWD vehicle 50064, so no government AWD vehicle ID was invented or borrowed.[3]

## Mechanical fields

- Recorded 0W-20 API SP/ILSAC GF-6A guidance and approximately 5.2 L/5 1/2 US qt with-filter capacity.[1]
- Recorded blue long-life coolant and approximately 8.3 L/2 1/4 US gal capacity while preserving the manual's internal first-time-limit conflict.[1]
- Recorded Nissan NS-3 CVT fluid, DOT 3 brake fluid and AWD differential/transfer-case GL-5 80W-90 product guidance while leaving unpublished service quantities as `Needs research`.[1]
- Recorded 83-ft-lb wheel torque, placard-controlled 33-psi reference pressures for listed original tire sizes and 10,000-mile rotation timing.[1]
- Recorded air/cabin/oil-filter guidance, sealed maintenance-free battery limitations, DXE22H11C plugs with 0.043-inch gap, and replaceable bulbs versus LED assemblies.[1]
- Recorded normal/oil-control and severe-use maintenance paths, including AWD differential/transfer-case inspection and severe replacement entries.[1]

## Reference enrichment

- Nissan's product page is used only to confirm that Intelligent AWD is offered for the 2026 Altima; it is not treated as mechanical-service authority.[2]
- EPA enrichment remains unresolved for AWD because the exact-year options response returned only the separate FWD record.[3]
- The NHTSA endpoint body reported zero results but arrived with HTTP 400, so no campaign count or identifier was asserted from that inconsistent response.[4]
- No TSB or aggregate owner-complaint entry was asserted during this run.[unverified]

## Embedded image previews and source/license status

- **Embedded remote previews:** None.[unverified]
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and identity review.[unverified] No image was copied, uploaded or selected as a live default.[unverified]

## Conflicts

- The owner manual agrees on the coolant first-replacement mileage of 105,000 miles and the later 75,000-mile/60-month recurrence, but printed pp. 410–411 and the schedule footnote state seven years/84 months while the printed p. 467 table heading says 126 months. The sheet is marked `conflict` and does not silently choose a first time limit.[1]
- EPA currently provides no exact AWD option record in its 2026 Altima response, so the official Nissan AWD identity is documented without fabricating an EPA ID.[2][3]

## Unresolved gaps

- CVT, differential and transfer-case service quantities; separately serviceable front-differential mapping; exact filter part numbers; replacement-battery group/CCA; tire-rotation pattern; exact trim lamp mapping; corrected coolant first time limit; exact AWD EPA identity; exact-applicability TSBs; complaint aggregates; and a commercially reusable exact-generation image remain unresolved.[1][3]

## Completion, verification and publication

- **Completed sheets:** 1 new; 0 materially improved existing sheets.[unverified]
- **Vehicle-spec verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 148 vehicle sheets.[unverified]
- **Citation verification:** The new sheet and this report passed strict grounded-citation verification with the evidence gate and at least 50% declared-provenance coverage.[unverified]
- **Publication branch:** `vehicle-specs-library`.[unverified]
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; its mode remains `664` (`-rw-rw-r--`).[unverified] The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.[unverified]
- **Branch state after the failed attempt:** Local `HEAD` and remote `vehicle-specs-library` both remain `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.[unverified]
- **Deployment/live data:** None.[unverified] No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.[unverified]

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/altima/2026/2026-nissan-altima-owner-manual.pdf — 2026 Nissan Altima Owner Manual
[2] https://www.nissanusa.com/vehicles/cars/altima.html — 2026 Nissan Altima official product page
[3] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Nissan&model=Altima — EPA 2026 Nissan Altima options
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=ALTIMA&modelYear=2026 — NHTSA 2026 Nissan Altima recalls
