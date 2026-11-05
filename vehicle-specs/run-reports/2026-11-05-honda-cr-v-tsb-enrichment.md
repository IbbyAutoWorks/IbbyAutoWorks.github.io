# Vehicle-spec library run report — 2026-11-05 Honda CR-V TSB enrichment

## Scope and phase

- **Active phase:** 2017–2026 (the rolling newest ten model years as of 2026).
- **Batch result:** 0 new sheets; 2 materially improved exact US-market sheets.
- **Variants preserved:** 2026 Honda CR-V 1.5L turbo/CVT FWD and AWD remain separate; hybrid trims remain excluded.

## Files changed

- `data/2026/honda/cr-v/1.5l-turbo-cvt-fwd.md`
- `data/2026/honda/cr-v/1.5l-turbo-cvt-awd.md`
- `catalog.md`
- `run-reports/2026-11-05-honda-cr-v-tsb-enrichment.md`

## Sources and fields

- Honda Service Bulletin 25-085, dated September 19, 2025, applies to 2026 CR-V LX, EX and EX-L vehicles subject to Honda VIN eligibility. It describes an SRS Event Data Recorder CAN-setting/software condition and directs an SRS software update, with SRS-unit replacement only when the update cannot be completed.[1]
- **Mechanical fields:** Existing exact-year owner-manual fluid, capacity, wheel/tire, filter, ignition, bulb and maintenance values were preserved unchanged; this run did not introduce a new mechanical value.
- **Reference enrichment:** Both sheets now identify Bulletin 25-085 by number and date, record trim/VIN applicability, summarize the official condition and corrective action, and explicitly keep the product update separate from recalls.

## Images

- **Embedded previews:** None.
- **Source/license status:** No image candidate was researched or approved; no repository copy, remote preview or live-app default was added.

## Conflicts and unresolved gaps

- **Conflicts:** None found. No existing sourced value was replaced.
- **Unresolved:** Exact filter and battery part data, spark-plug gap, front-differential/transfer-case details, EPA vehicle IDs, gasoline-variant recall status, additional TSBs, complaint aggregates and commercially licensed exact-generation images remain `Needs research` where applicable.

## Verification and publication

- **Completed sheet count:** 2 materially improved; 0 created.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with **27 vehicle sheets**.
- **Publication:** Guarded publisher successfully published branch `vehicle-specs-library` at content commit `bd1b363`; no deployment was triggered.

## Sources

[1] https://static.nhtsa.gov/odi/tsbs/2025/MC-11023863-0001.pdf — Honda Service Bulletin 25-085 — 2026 CR-V SRS EDR software update
