# Vehicle-spec library run — 2026-11-19 — redesigned Nissan Sentra

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Batch result:** One exact US-market 2026 Nissan Sentra passenger-car sheet was added without duplicating an existing filename/catalog identity or moving to an older phase: 2.0L MR20DD inline-4, Xtronic CVT and front-wheel drive.[1][2]
- Six previously verified but uncommitted 2026 Hyundai Elantra/Tucson and Nissan Frontier sheets were preserved in the shared worktree because the guarded publisher remains non-executable; this run did not count them as new or materially improved sheets.

## Files changed

- `vehicle-specs/data/2026/nissan/sentra/2.0l-mr20dd-cvt-fwd.md` — new redesigned-generation Sentra sheet.
- `vehicle-specs/catalog.md` — added the exact identity and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-19-nissan-sentra-one.md` — this report.
- Preserved without rewriting: the six verified carryover sheets, their earlier run reports and the prior publication-retry reports.

## Source set

Nissan's exact-year 2026 Sentra Owner Manual is the primary mechanical authority; printed pages 396–405, 413–423, 431–450 and 454 support the populated fluid, capacity, torque, tire, filter, battery, bulb, ignition and maintenance fields.[1]

Nissan's official US product page confirms the all-new 2026 Sentra identity and Xtronic CVT configuration.[2] The EPA options endpoint returned no 2026 Sentra records on 2026-11-19, so no EPA vehicle ID was asserted.[3]

NHTSA's official model-level endpoint returned one campaign on 2026-11-19; it remains VIN-specific recall enrichment rather than mechanical authority, a TSB or a diagnosis.[4]

## Mechanical fields

- Recorded 0W-20 API SP/ILSAC GF-6A oil guidance and approximately 4.1 L/4 3/8 US qt with-filter capacity.[1]
- Recorded blue long-life coolant and approximately 8.2 L/2 1/8 US gal capacity with reservoir.[1]
- Recorded Nissan NS-3 CVT fluid and DOT 3/DOT 4 brake fluid while leaving unpublished service quantities as `Needs research`.[1]
- Recorded 88.5 ft-lb wheel-fastener torque, placard-controlled tire-pressure warnings, trim/tire reference pressures and 5,000-mile rotation timing.[1]
- Recorded filter schedule guidance, sealed maintenance-free battery limitations, ILKAR7AE11S plugs with 0.043-inch nominal gap, and the replaceable No. 158 trunk bulb versus LED assemblies.[1]
- Recorded normal/oil-control and severe-use maintenance paths; the ambiguous extracted brake-fluid table remains unresolved rather than inferred.[1]

## Reference enrichment

- NHTSA campaign 26V145000 concerns potentially insufficient front-seat-frame hook-bracket welds on certain 2026 Sentra and Kicks vehicles; VIN applicability remains mandatory.[4]
- EPA identity enrichment remains unavailable because the official options query returned an empty result set.[3]
- No TSB or aggregate owner-complaint entry was added during this run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and identity review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No disagreement was found between populated exact-year mechanical sources.
- The owner manual's extracted multi-column maintenance table does not provide a clean enough brake-fluid interval mapping for safe use, so that interval remains `Needs research` instead of being reconstructed from layout.[1]
- The EPA options endpoint had no 2026 Sentra record; this is documented as an enrichment gap rather than treated as a vehicle-identity conflict.[3]

## Unresolved gaps

- CVT routine service quantity, exact filter part numbers, replacement-battery group/CCA, tire-rotation pattern, complete trim-specific lamp mapping, clean normal/severe brake-fluid timing, exact-applicability TSBs, complaint aggregates and a commercially reusable exact-generation image remain unresolved.[1]

## Completion, verification and publication

- **Completed sheets:** 1 new; 0 materially improved existing sheets.
- **Verified library total:** 146 vehicle sheets.
- **Vehicle-spec verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 146 vehicle sheets before final publication attempt.
- **Citation verification:** The new sheet and this report passed grounded-citation ledger integrity checks; specification bullets contain multiple sentence fragments, so low sentence-count coverage warnings do not indicate unknown citation IDs or a mismatched Sources block.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; its mode remains `664` (`-rw-rw-r--`). The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Branch state after the failed attempt:** Local `HEAD` and remote `vehicle-specs-library` both remain `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/sentra/2026/2026-nissan-sentra-owner-manual.pdf — 2026 Nissan Sentra Owner Manual
[2] https://www.nissanusa.com/vehicles/cars/2026-sentra.html — 2026 Nissan Sentra official product page
[3] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Nissan&model=Sentra — EPA 2026 Nissan Sentra options
[4] https://api.nhtsa.gov/recalls/recallsByVehicle?make=NISSAN&model=SENTRA&modelYear=2026 — NHTSA 2026 Nissan Sentra recalls
