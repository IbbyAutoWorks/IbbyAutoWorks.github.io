# Vehicle-spec library run — 2026-11-20 — verified nine-sheet carryover and publication retry

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Run result:** No additional vehicle sheet was started because the shared worktree already held nine verified, uncommitted exact 2026 sheets from prior batches. This run preserved those files, reverified the complete library, and retried only the required guarded publication path.

## Files changed

- `vehicle-specs/catalog.md` — added a dated carryover/publication-status note.
- `vehicle-specs/run-reports/2026-11-20-publication-retry-nine-carryover.md` — this report.
- Preserved without rewriting: two 2026 Hyundai Elantra sheets, two 2026 Hyundai Tucson sheets, two 2026 Nissan Frontier sheets, one 2026 Nissan Sentra sheet, two 2026 Nissan Altima sheets, and their earlier run/publication reports.

## Source set

The carried Elantra and Tucson sheets use Hyundai's exact-year owner manuals as their primary mechanical authorities.[1][2]

The carried Frontier, Sentra and Altima sheets use Nissan's exact-year owner manuals as their primary mechanical authorities.[3][4][5]

EPA records 49833 and 49838 preserve separate 2026 Frontier 2WD and part-time 4WD identities, while EPA record 50064 preserves the exact Altima FWD identity.[6][7][8]

## Mechanical fields

- **Elantra:** Separate 2.0L/IVT and 1.6L turbo/7DCT sheets preserve engine-specific oil/coolant quantities, transmission products, ignition timing and severe-service paths.[1]
- **Tucson:** Separate gasoline FWD and HTRAC AWD sheets preserve AWD-only transfer-case/rear-differential products, published capacities and severe-service intervals.[2]
- **Frontier:** Separate 2WD and part-time 4WD sheets preserve drivetrain-specific fluids, capacities and severe-service paths.[3][6][7]
- **Sentra:** The redesigned 2.0L/CVT/FWD sheet preserves exact-year oil, coolant, wheel-torque, tire, ignition, lamp and maintenance information.[4]
- **Altima:** Separate FWD and Intelligent AWD sheets preserve AWD-only differential/transfer guidance and the exact-year manual's unresolved coolant interval conflict.[5][8]
- Placard-controlled tire-pressure warnings and explicit `Needs research` fields remain intact across all nine sheets.

## Reference enrichment

- EPA records remain identity evidence only and are not treated as mechanical-service authority.[6][7][8]
- Existing NHTSA recall entries remain VIN/equipment-specific enrichment, separate from TSBs, complaints and mechanical specifications.
- No TSB or owner-complaint content was added during this retry run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and exact-generation review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The Tucson manual's oil drain/refill value is not explicitly labeled as the requested with-filter quantity, so both Tucson sheets leave that field unresolved.[2]
- The Frontier 4WD sheet preserves conflicting/mislabeled front-final-drive capacity rows and ambiguous transfer-fluid nomenclature instead of silently resolving them.[3][7]
- Both Altima sheets preserve the owner manual's conflicting first coolant-replacement time limits.[5]
- No new source conflict was introduced during this retry run.

## Unresolved gaps

- Exact filter part numbers, installed-battery mappings, routine transmission service quantities, selected spark-plug gaps/part numbers, trim-specific tire/lamp mappings, exact-applicability TSBs, complaint aggregates and commercially reusable exact-generation images remain unresolved.
- Tucson oil capacity explicitly labeled with filter, Frontier corrected front-differential capacity/transfer nomenclature and Sentra clean brake-fluid interval mapping remain unresolved.[2][3][4]
- Altima's corrected first coolant time limit remains unresolved.[5]

## Completion, verification and publication

- **Completed sheet count for this run:** 0 new; 0 materially improved. Nine already-completed exact sheets remain verified carryover.
- **Verified library total:** 148 vehicle sheets.
- **Verification result:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 148 vehicle sheets after this report and the catalog update were added.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; its mode remains `664` (`-rw-rw-r--`). The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Branch state at retry:** Local `HEAD` and remote `vehicle-specs-library` both remained `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://ownersmanual.hyundai.com/full_pdf/CN7/2026/en_US — 2026 Hyundai Elantra Owner Manual
[2] https://ownersmanual.hyundai.com/full_pdf/NX4/2026/en_US — 2026 Hyundai Tucson Owner Manual
[3] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/frontier/2026/2026-nissan-frontier-owner-manual.pdf — 2026 Nissan Frontier Owner Manual
[4] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/sentra/2026/2026-nissan-sentra-owner-manual.pdf — 2026 Nissan Sentra Owner Manual
[5] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/altima/2026/2026-nissan-altima-owner-manual.pdf — 2026 Nissan Altima Owner Manual
[6] https://www.fueleconomy.gov/ws/rest/vehicle/49833 — EPA 2026 Nissan Frontier 2WD
[7] https://www.fueleconomy.gov/ws/rest/vehicle/49838 — EPA 2026 Nissan Frontier 4WD
[8] https://www.fueleconomy.gov/ws/rest/vehicle/50064 — EPA 2026 Nissan Altima FWD
