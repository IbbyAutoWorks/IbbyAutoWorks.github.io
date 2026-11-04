"""Turns NHTSA's manufacturer communication files into small JSON files for ibby-bulletin-load.

Usage: python -I scripts/build-bulletin-data.py <folder with TSBS_RECEIVED_*.zip> <output folder>
Keeps common makes from model year 2015 on, and stores each bulletin once.
"""
import json, re, sys, zipfile
from pathlib import Path

MIN_YEAR = 2015
PER_FILE = 1000
MAKES = {
    "ACURA", "BUICK", "CADILLAC", "CHEVROLET", "CHRYSLER", "DODGE", "FORD", "GMC", "HONDA", "HYUNDAI", "INFINITI", "JEEP",
    "KIA", "LEXUS", "LINCOLN", "MAZDA", "MERCURY", "MITSUBISHI", "NISSAN", "PONTIAC", "RAM", "SATURN", "SCION", "SUBARU", "TOYOTA", "VOLKSWAGEN"
}

source, output = Path(sys.argv[1]), Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)
bulletins = {}
models = {}


def squash(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def iso(date):
    return f"{date[:4]}-{date[4:6]}-{date[6:8]}" if re.fullmatch(r"\d{8}", date) else None


for path in sorted(source.glob("TSBS_RECEIVED_*.zip")):
    with zipfile.ZipFile(path) as archive, archive.open(archive.namelist()[0]) as raw:
        for line in raw:
            parts = line.decode("cp1252", "replace").rstrip("\r\n").split("\t")
            if len(parts) < 14 or not parts[0].strip().isdigit():
                continue
            make, model, year = parts[7].strip().upper(), parts[8].strip().upper(), parts[9].strip()
            if make not in MAKES or not model or not year.isdigit() or int(year) < MIN_YEAR:
                continue
            number = int(parts[0])
            entry = bulletins.get(number)
            if entry is None:
                entry = bulletins[number] = {
                    "doc": parts[3].strip()[:128],
                    "date": iso(parts[4].strip()),
                    "kind": parts[6].strip()[:40],
                    "parts": set(),
                    "summary": re.sub(r"\s+", " ", parts[13]).strip()[:4000],
                }
            if parts[10].strip():
                entry["parts"].add(parts[10].strip())
            models.setdefault(number, {}).setdefault(f"{squash(make)}|{squash(model)}", set()).add(int(year))
    print("read", path.name, "bulletins", len(bulletins), flush=True)

ids = sorted(bulletins)
files = 0
rows = 0
for start in range(0, len(ids), PER_FILE):
    batch = ids[start:start + PER_FILE]
    data = {
        "bulletins": [[n, bulletins[n]["doc"], bulletins[n]["date"], bulletins[n]["kind"], ", ".join(sorted(bulletins[n]["parts"])[:3])[:300], bulletins[n]["summary"]] for n in batch],
        "models": [[key, sorted(years), n] for n in batch for key, years in models[n].items()],
    }
    rows += len(data["models"])
    (output / f"bulletins-{files:04d}.json").write_text(json.dumps(data, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    files += 1
(output / "manifest.json").write_text(json.dumps({"files": files, "bulletins": len(ids), "models": rows}), encoding="utf-8")
print(f"{len(ids)} bulletins, {rows} vehicle rows, {files} files")
