# Vehicle-spec library run — 2026-11-19 — verified six-sheet carryover and publication retry

## Active phase

- **Phase:** 2017–2026, the current 2026 model year plus the previous nine model years.
- **Run result:** No additional vehicle sheet was started because the shared worktree already held six verified, uncommitted exact 2026 sheets from three prior batches. This run preserved those files, reverified the complete library, and retried only the required guarded publication path.

## Files changed

- `vehicle-specs/run-reports/2026-11-19-publication-retry-six-carryover.md` — this retry report.
- Preserved without rewriting: two 2026 Hyundai Elantra sheets, two 2026 Hyundai Tucson sheets, two 2026 Nissan Frontier sheets, their three prior batch reports, the earlier four-sheet publication-retry report, and the corresponding `catalog.md` entries.

## Source set

The carried Elantra sheets use Hyundai's exact-year CN7 owner manual for fluid, capacity, wheel, tire, lamp and maintenance data; Hyundai's official product page separates the 2.0L/IVT and 1.6L turbo/7DCT identities.[1][2]

The carried Tucson sheets use Hyundai's exact-year NX4 owner manual for mechanical data; Hyundai's official product page separates gasoline FWD and HTRAC AWD from Hybrid/PHEV variants.[3][4]

The carried Frontier sheets use Nissan's exact-year owner manual for mechanical data, while EPA records 49833 and 49838 keep the 2WD and part-time 4WD identities separate.[5][6][7]

## Mechanical fields

- **Elantra:** The two preserved sheets separate engine-specific oil/coolant quantities, IVT versus DCT products, spark-plug timing and severe transmission-service paths.[1]
- **Tucson:** The two preserved sheets separate FWD from AWD-only transfer-case/rear-differential products, published capacities and severe-service intervals.[3]
- **Frontier:** The two preserved sheets separate 2WD from part-time 4WD drivetrain fluids and severe-service paths while retaining the exact-year manual's oil, coolant, brake-fluid, wheel-torque, tire, filter, battery, spark-plug and lamp data.[5][6][7]
- Placard-controlled tire-pressure warnings and explicit `Needs research` fields remain intact across all six sheets.

## Reference enrichment

- Hyundai OEM product data is used only to preserve exact powertrain/drivetrain identity; it is not treated as mechanical-service authority.[2][4]
- EPA records are used only to preserve the exact Frontier drivetrain identities; they are not treated as mechanical-service authority.[6][7]
- Existing NHTSA recall entries remain VIN/equipment-specific enrichment, separate from TSBs, complaints and mechanical specifications.
- No TSB or owner-complaint content was added during this retry run.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No candidate completed original-source, direct-image, creator, exact commercial license/version, attribution, modification/share-alike, hotlinking and exact-generation review. No image was copied, uploaded or selected as a live default.

## Conflicts

- The Tucson manual's 6.13-US-qt oil drain/refill value is not explicitly labeled as the requested with-filter quantity, so both Tucson sheets leave that field unresolved.[3]
- The Frontier 4WD sheet preserves the Nissan manual's conflicting/mislabeled front-final-drive capacity rows and its ambiguous `AWD` transfer-fluid heading rather than silently resolving either issue.[5][7]
- No new source conflict was introduced during this publication retry.

## Unresolved gaps

- Exact filter part numbers, installed-battery mappings, routine transmission service quantities, selected spark-plug gaps/part numbers, trim-specific tire/lamp mappings, exact-applicability TSBs, complaint aggregates and commercially reusable exact-generation images remain unresolved.
- Tucson oil capacity explicitly labeled with filter and Frontier corrected front-differential capacity/transfer nomenclature remain unresolved.[3][5]

## Completion, verification and publication

- **Completed sheet count for this run:** 0 new; 0 materially improved. Six already-completed sheets remain verified carryover.
- **Verified library total:** 145 vehicle sheets.
- **Verification result:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 145 vehicle sheets after this report was added.
- **Publication branch:** `vehicle-specs-library`.
- **Publication blocker:** Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with exit 126, `Permission denied`; its mode remains `664` (`-rw-rw-r--`). The publisher was not bypassed through another interpreter, no commit was created, and verified local files remain intact.
- **Branch state at retry:** Local `HEAD` and remote `vehicle-specs-library` both remained `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.
- **Deployment/live data:** None. No application code, customer/work-order data, secrets, Supabase, Vercel, DNS, accounts, payments or live data were touched.

## Sources

[1] https://ownersmanual.hyundai.com/full_pdf/CN7/2026/en_US — 2026 Hyundai Elantra Owner Manual
[2] https://www.hyundaiusa.com/us/en/vehicles/elantra — 2026 Hyundai Elantra official product page
[3] https://ownersmanual.hyundai.com/full_pdf/NX4/2026/en_US — 2026 Hyundai Tucson Owner Manual
[4] https://www.hyundaiusa.com/us/en/vehicles/tucson — 2026 Hyundai Tucson official product page
[5] https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/frontier/2026/2026-nissan-frontier-owner-manual.pdf — 2026 Nissan Frontier Owner Manual
[6] https://www.fueleconomy.gov/ws/rest/vehicle/49833 — EPA vehicle 49833 — 2026 Nissan Frontier 2WD
[7] https://www.fueleconomy.gov/ws/rest/vehicle/49838 — EPA vehicle 49838 — 2026 Nissan Frontier 4WD
