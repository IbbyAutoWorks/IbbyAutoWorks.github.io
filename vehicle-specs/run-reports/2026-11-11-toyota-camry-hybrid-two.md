# Vehicle-spec library run — 2026-11-11 — 2025 Toyota Camry Hybrid FWD/AWD

## Active phase

- **Phase:** 2017–2026, the current model year plus previous nine years.
- **Batch result:** Two exact US-market vehicle/year/powertrain sheets added; the run stopped below the ten-sheet ceiling to preserve exact OEM sourcing.

## Files changed

- `vehicle-specs/data/2025/toyota/camry/2.5l-hybrid-ecvt-fwd.md` — new researched sheet.
- `vehicle-specs/data/2025/toyota/camry/2.5l-hybrid-ecvt-awd.md` — new researched sheet.
- `vehicle-specs/catalog.md` — added both sheets and a dated queue note.
- `vehicle-specs/run-reports/2026-11-11-toyota-camry-hybrid-two.md` — this report.

## Sources

1. 2025 Toyota Camry Owner's Manual OM06266U: https://assets.sipb.toyota.com/publications/en/om-s/OM06266U/pdf/OM06266U.pdf — exact engine/model-code, oil, coolant, hybrid transmission, rear differential, brake fluid, wheel torque/pressure, spark-plug and bulb data; relevant printed pages 396, 418–421 and 484–492.
2. 2025 Toyota Camry Warranty & Maintenance Guide: https://www.toyota.com/content/dam/toyota/brochures/pdf/2025/T-MMS-25Camry.pdf — normal/special-condition schedules; relevant printed pages 38–49.
3. NHTSA 2025 Toyota Camry model-level recalls: https://api.nhtsa.gov/recalls/recallsByVehicle?make=TOYOTA&model=CAMRY&modelYear=2025 — JSON reported `Count: 0` and a success message on 2026-11-11, but the HTTP status was 400; the result is preserved as unresolved and VIN lookup remains required.

## Mechanical fields added

- JASO GLV-1 SAE 0W-8 oil specification and exact with/without-filter capacities.
- Gasoline-engine and power-control-unit coolant capacities and Toyota SLLC-compatible specification.
- Toyota e-Transaxle Fluid TE hybrid-transmission specification/capacity.
- AWD-only Toyota e-Transaxle Fluid TE rear-differential specification/capacity.
- DOT 3 / DOT 4 brake-fluid specifications.
- Wheel-nut torque and package-dependent pressure data with an explicit vehicle-placard warning.
- Tire-rotation interval, engine/cabin filter schedules, 12-volt battery test/charge data, spark-plug number/gap and replaceable-bulb versus LED distinctions.
- Normal and special-condition oil, coolant, transaxle, AWD rear-differential and spark-plug intervals.

## Reference enrichment

- OEM AXVH80L FWD and AXVH85L AWD model-code identities were kept separate.
- NHTSA recall enrichment is a dated, unresolved zero-result with conflicting JSON-body and HTTP-status signals; it is not used as mechanical authority.
- No TSB or complaint entry was added; those fields remain explicit research gaps.

## Commercial image review

- **Embedded previews:** None.
- **Source/license status:** No exact-generation candidate completed original-source, exact-license, attribution, hotlinking and commercial-use review. No image was copied, uploaded or selected as a live-app default.

## Conflicts

- No source conflict was found among the populated OEM fields.
- The manual lists two different 16-inch pressure sets without enough text extraction to map each Type A/B package safely; both sheets therefore require the physical tire placard rather than selecting a value by inference.
- The tire-rotation diagram did not survive text extraction with enough fidelity to state a directional pattern; the 5,000-mile/6-month interval is populated, while the exact pattern is marked for visual shop confirmation.
- The NHTSA response body reported a successful zero-result while the transport status was HTTP 400; neither sheet presents that response as a clean authoritative zero-recall finding.

## Unresolved gaps

- Exact oil, engine-air and cabin-filter part numbers.
- 12-volt battery group size, CCA and reserve capacity.
- Trim/package mapping for the two 16-inch tire-pressure sets.
- Machine-readable tire-rotation diagram interpretation.
- TSBs, aggregate unverified owner-report themes and a commercially reusable exact-generation image.
- A stable exact fueleconomy.gov vehicle ID; the official menu endpoint returned no options during this run.

## Completion and verification

- **Completed sheets:** 2 new; 0 materially improved.
- **Verifier:** `python scripts/verify-vehicle-spec-markdown.py` passed with 67 vehicle sheets.
- **Publication:** Pending guarded publisher execution after successful verification.
