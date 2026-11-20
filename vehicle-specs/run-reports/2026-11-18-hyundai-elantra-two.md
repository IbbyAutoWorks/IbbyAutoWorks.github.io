# Vehicle-spec library run — 2026-11-18 — Hyundai Elantra two-sheet batch

## Active phase

- **Phase:** 2017–2026, the applicable current model year plus previous nine years.
- **Batch result:** Two exact US-market 2026 Hyundai Elantra gasoline/FWD sheets were added without duplicating catalog identities or moving to an older phase: Smartstream 2.0L/IVT and N Line Smartstream 1.6L turbo/7-speed DCT.[1][4]

## Files changed

- `vehicle-specs/data/2026/hyundai/elantra/2.0l-atkinson-ivt-fwd.md` — new gasoline 2.0L Atkinson/IVT/FWD sheet.
- `vehicle-specs/data/2026/hyundai/elantra/1.6l-t-gdi-7dct-fwd.md` — new N Line 1.6L turbo/7DCT/FWD sheet.
- `vehicle-specs/catalog.md` — added both exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-18-hyundai-elantra-two.md` — this report.

## Source set

Hyundai's exact-year CN7 Owner's Manual PDF is the primary mechanical source; its lubricant/capacity table, maintenance schedules, tire tables, battery-label examples and bulb tables were cited with PDF and printed-page locators.[1] The official digital-manual landing page and lubricant/capacity chapter were retained as companion OEM references.[2][3]

Hyundai's official 2026 Elantra product page separates the 147-hp 2.0L gasoline trim family from the 201-hp N Line 1.6L Turbo GDI/7-speed DCT configuration.[4]

The EPA options endpoint returned vehicle ID 49815 only for a 2026 Elantra “Auto (AM-S7), 4 cyl, 1.6 L, Turbo”; it supports the N Line powertrain identity but was not assigned to the 2.0L/IVT sheet.[6]

NHTSA's model-level endpoint returned three current 2026 Elantra campaigns; they were recorded only as VIN-specific recall enrichment and not as mechanical authority.[5]

## Mechanical fields

- Both sheets record full-synthetic SAE 0W-20 meeting API SN PLUS/SP or ILSAC GF-6. The manual publishes drain/refill quantities of 4.54 US qt for Smartstream G2.0 and 5.07 US qt for Smartstream G1.6 T-GDI.[1]
- Cooling-system capacities remain engine-specific: 7.82 US qt for G2.0 and 7.19 US qt for G1.6 T-GDI, using phosphate-based ethylene-glycol coolant for an aluminum radiator.[1]
- The 2.0L sheet records SP-CVT1 IVT fluid and a 6.87-US-qt published volume; the N Line sheet separately records SAE 70W/API GL-4 DCT fluid and a 1.7–1.8-US-qt published volume. Neither table volume is represented as a confirmed routine drain-and-fill quantity.[1]
- Both sheets record DOT 4 brake-fluid requirements, 79–94 lb-ft wheel-fastener torque, placard-controlled pressure and an 8,000-mile/12-month tire-rotation interval.[1]
- Normal and severe schedules remain powertrain-specific: IVT severe replacement is 60,000 miles, DCT severe replacement is 80,000 miles, G2.0 spark plugs are due at 96,000 miles and G1.6 T-GDI spark plugs at 48,000 miles.[1]
- Published replaceable bulb trade numbers are separated from equipment-dependent LED assemblies; exact trim-to-lamp mapping remains unresolved.[1]

## Reference enrichment

- Hyundai and EPA identity data preserve the 2.0L/IVT and 1.6L turbo/7DCT records as separate exact variants.[4][6]
- NHTSA campaigns 26V254000, 26V692000 and 26V693000 concern certain vehicles' impact sensors, front-strut fasteners and wheel lug nuts/hub assemblies, respectively. VIN lookup remains mandatory.[5]
- No manufacturer communication/TSB was added, no bulletin was labeled a recall, and no owner-complaint narrative or personal information was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation image completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict was found among the accepted exact-year mechanical sources.[1][4]
- The battery section illustrates two possible label families but does not map either universally to each exact trim; both sheets require installed-battery confirmation rather than inferring fitment.[1]
- EPA's options endpoint exposed only the 1.6L turbo automatic identity and no 2.0L/IVT record on 2026-11-18; the 2.0L sheet therefore carries no EPA vehicle ID.[6]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers; spark-plug part numbers and gaps; installed-battery mapping; and exact trim-to-lamp mapping remain `Needs research`.[1]
- Routine IVT/DCT drain-and-fill procedures and service quantities remain unresolved where the owner manual supplies only published volumes.[1]
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images remain unresolved.[1][4][5]

## Completion, verification and publication

- **Completed sheets:** 2 new; 0 materially improved existing sheets.
- **Verified library total:** 141 vehicle sheets.
- **Verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py` with 141 vehicle sheets.
- **Citation check:** Passed strict grounded-citation verification at 46% sentence coverage (19 of 41 prose sentences), with all six registered sources cited and a mechanically rendered Sources block.
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** Blocked. Direct execution of `/home/ubuntu/.hermes/profiles/ibby/scripts/publish_vehicle_specs_branch.py` failed with `Permission denied` because the publisher is mode `664` (`-rw-rw-r--`) and is not executable. Per the guarded-publication rule, the script was not bypassed by invoking it through another interpreter; verified local files remain intact and uncommitted. Local and remote `vehicle-specs-library` remain at `78a9655a0beb2f5c4fc4b62b87c4b4f1ddbf7141`.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer data, accounts, payments or live data.

## Sources

[1] https://ownersmanual.hyundai.com/full_pdf/CN7/2026/en_US — 2026 Hyundai Elantra Owner Manual (PDF)
[2] https://ownersmanual.hyundai.com/full_webhelp/CN7/2026/en_US/owner.html — 2026 Hyundai Elantra digital owner manual
[3] https://ownersmanual.hyundai.com/full_webhelp/cn7/2026/en_us/ide89740d0fa5.html — Recommended lubricants and capacities
[4] https://www.hyundaiusa.com/us/en/vehicles/elantra — 2026 Hyundai Elantra official product page
[5] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HYUNDAI&model=ELANTRA&modelYear=2026 — NHTSA 2026 Hyundai Elantra recalls
[6] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Hyundai&model=Elantra — EPA 2026 Hyundai Elantra options
