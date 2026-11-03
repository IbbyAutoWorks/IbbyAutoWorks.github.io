#!/usr/bin/env python3
"""Validate the local Markdown vehicle-spec library without reading secrets."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "vehicle-specs"
DATA = LIBRARY / "data"
REQUIRED_FRONTMATTER = {
    "schema_version",
    "status",
    "review_state",
    "year",
    "make",
    "model",
    "engine",
    "powertrain_notes",
    "last_verified",
}
REQUIRED_SECTIONS = {
    "## Fluids and capacities",
    "## Wheels and tires",
    "## Filters, battery, bulbs and ignition",
    "## Basic service intervals",
    "## Variant warnings",
    "## Sources",
    "## Research notes",
}
URL_RE = re.compile(r"https://[^\s)]+")

errors: list[str] = []
files = sorted(DATA.rglob("*.md"))
if not files:
    errors.append("No vehicle Markdown files found")

for path in files:
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT)
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        errors.append(f"{rel}: missing YAML frontmatter")
        continue
    frontmatter, body = text[4:].split("\n---\n", 1)
    keys = {
        line.split(":", 1)[0].strip()
        for line in frontmatter.splitlines()
        if ":" in line
    }
    missing_keys = REQUIRED_FRONTMATTER - keys
    if missing_keys:
        errors.append(f"{rel}: missing frontmatter keys {sorted(missing_keys)}")
    missing_sections = [section for section in REQUIRED_SECTIONS if section not in body]
    if missing_sections:
        errors.append(f"{rel}: missing sections {missing_sections}")
    source_block = body.split("## Sources", 1)[-1].split("## Research notes", 1)[0]
    if not URL_RE.search(source_block):
        errors.append(f"{rel}: no HTTPS source in Sources section")
    if "Verify the VIN" not in body:
        errors.append(f"{rel}: missing VIN/variant warning")

catalog = (LIBRARY / "catalog.md").read_text(encoding="utf-8") if (LIBRARY / "catalog.md").is_file() else ""
for path in files:
    expected = str(path.relative_to(LIBRARY))
    if expected not in catalog:
        errors.append(f"catalog.md: missing {expected}")

if errors:
    print("Vehicle-spec Markdown verification FAILED")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print(f"Vehicle-spec Markdown verification passed: {len(files)} vehicle sheets")
