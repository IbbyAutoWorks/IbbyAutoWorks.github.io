# Vehicle-spec library run — 2026-11-17 — Hyundai Sonata three-sheet batch

## Active phase

- **Phase:** 2017–2026, the current rolling model-year decade.
- **Batch result:** Three exact US-market 2026 Hyundai Sonata gasoline sheets were added without jumping to an older phase: 2.5L GDI/8AT FWD, 2.5L GDI/8AT HTRAC AWD and N Line 2.5L T-GDI/wet 8-speed DCT FWD.[14]

## Files changed

- `vehicle-specs/data/2026/hyundai/sonata/2.5l-gdi-8at-fwd.md` — new naturally aspirated FWD sheet.
- `vehicle-specs/data/2026/hyundai/sonata/2.5l-gdi-8at-awd.md` — new naturally aspirated HTRAC AWD sheet.
- `vehicle-specs/data/2026/hyundai/sonata/2.5l-t-gdi-8dct-fwd.md` — new N Line turbo wet-DCT FWD sheet.
- `vehicle-specs/catalog.md` — added three exact identities and a dated coverage note.
- `vehicle-specs/run-reports/2026-11-17-hyundai-sonata-three.md` — this report.

## Source set

Hyundai's exact-year DN8 Owner's Manual is the primary mechanical source.[1]

Its dedicated tables provide engine identities, lubricant specifications/capacities and tire/wheel data.[2][4][5]

Separate manual sections provide bulb types and normal/severe maintenance schedules.[3][6][7]

Tire-rotation and battery-label pages provide the remaining focused service context.[8][9]

Hyundai's official 2026 Sonata product page confirms SE/SEL Sport naturally aspirated identities, separates SEL Sport FWD and AWD, and identifies N Line as the 290-hp 2.5L turbo with N 8-speed wet dual-clutch transmission.[14]

The fueleconomy.gov options endpoint returned no 2026 Sonata records on 2026-11-17, so no EPA vehicle ID was accepted.[12]

The NHTSA model-level endpoint returned campaign 26V047000; it is kept as VIN-specific recall enrichment and is not used as mechanical authority.[15]

## Mechanical fields

- Both naturally aspirated sheets record full-synthetic SAE 0W-20, while the turbo N Line records full-synthetic SAE 0W-30. The owner manual publishes 6.13 US qt (5.8 L) drain/refill for both engine rows.[5]
- The naturally aspirated sheets record 9.2 US qt (8.7 L) coolant capacity; the turbo sheet records 9.3 US qt (8.8 L). All use ethylene-glycol-base coolant for an aluminum radiator mixed with distilled water.[5]
- Naturally aspirated sheets preserve SP4M-1 8AT fluid and a 6.8 US qt (6.5 L) published volume. The N Line separately records GS WDCTF HD G gear oil at 3.49–3.59 US qt and GS WDCTF HD H control oil at 2.59–2.64 US qt; exact routine service procedures remain unresolved.[5]
- The AWD sheet separately records API GL-5 SAE 75W-85 transfer-case oil at 0.69 US qt and rear-differential oil at 0.62 US qt; the two FWD sheets mark those systems not applicable.[5][14]
- All three sheets record DOT 4 brake fluid, 79–94 lb-ft wheel-fastener torque and placard-controlled tire pressure.[4][5]
- They also record an 8,000-mile/12-month tire-rotation interval plus normal/severe oil service, brake-fluid timing, filter schedules and coolant timing.[6][7][8]
- Spark-plug timing remains engine-specific: 96,000 miles for Smartstream 2.5 GDI and 48,000 miles for Smartstream 2.5 T-GDI. Exact plug part numbers and gaps remain `Needs research`.[6]
- Exterior lighting is separated into LED assemblies and replaceable P21W reverse/W5W license-plate bulbs.[3]

## Reference enrichment

- The official product page preserves three exact gasoline configurations instead of collapsing drivetrain and transmission variants.[14]
- NHTSA campaign 26V047000 concerns instrument-panel display software on certain 2026 Sonata vehicles; it remains VIN-specific and separate from TSBs, complaints and mechanical specifications.[15]
- No manufacturer communication/TSB was added, and no owner-complaint narrative or personal information was copied.

## Embedded image previews and source/license status

- **Embedded remote previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, direct-image, creator, exact license/version, attribution, modification/share-alike, hotlinking and commercial-app review. No image was copied, uploaded or selected as a live default.

## Conflicts

- No direct conflict between the accepted exact-year Hyundai sources was identified in this batch.[5][14]
- The battery-label page is illustrative and explicitly warns that the actual label may differ; the sheets therefore require installed-battery confirmation instead of treating the example as universal fitment.[9]
- Published transmission and AWD table volumes are not represented as confirmed routine drain-and-fill quantities.[5]

## Unresolved gaps

- Exact engine-air, cabin-air and oil-filter part numbers plus spark-plug part numbers and gaps remain unsupported by the accepted manual sections.[1][5][6]
- Installed-battery mapping and exact CCA/group information remain unresolved because the manual's label is illustrative rather than universal.[9]
- Routine 8AT, wet-DCT, transfer-case and rear-differential service procedures/quantities remain unresolved where the owner table provides only published volumes.[5]
- Exact-applicability TSBs, aggregate unverified owner-report themes and commercially reusable exact-generation images.

## Completion, verification and publication

- **Completed sheets:** 3 new; 0 materially improved existing sheets.
- **Verified library total before publication:** 139 vehicle sheets.
- **Verifier:** Passed `python scripts/verify-vehicle-spec-markdown.py`.
- **Citation check:** Passed grounded-citation verification at 51% sentence coverage (24 of 47 prose sentences); three retrieved but unused ledger sources remain intentionally uncited.
- **Publication branch:** `vehicle-specs-library`.
- **Publication result:** Guarded publisher committed and pushed the batch to `vehicle-specs-library` at `d936b0b0021359c56f7e4078e6f423dc901dfd74`; the remote branch hash matched after push. This report-finalization edit is published separately by the same guarded path.
- **Deployment/live data:** None; this run did not deploy or touch application code, Supabase, customer data, accounts, payments or live data.

## Sources

[1] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/owner.html — 2026 Hyundai Sonata Owner Manual
[2] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/idf8adbad7d6b.html
[3] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/ida12c2d1e81c.html
[4] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/id1abb106d7d1.html
[5] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/ideebd8cfc412.html
[6] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/topic_ybb_1yh_lwb.html
[7] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/topic_kwy_byh_lwb.html
[8] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/id364d499f5ef.html
[9] https://ownersmanual.hyundai.com/full_webhelp/DN8/2026/en_US/id4b2b685a84c.html
[12] https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2026&make=Hyundai&model=Sonata — EPA 2026 Hyundai Sonata options
[14] https://www.hyundaiusa.com/us/en/vehicles/2026-sonata — 2026 Hyundai Sonata official vehicle page
[15] https://api.nhtsa.gov/recalls/recallsByVehicle?make=HYUNDAI&model=SONATA&modelYear=2026 — NHTSA 2026 Hyundai Sonata recalls
