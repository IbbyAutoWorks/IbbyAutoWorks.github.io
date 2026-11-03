// Rebuilds public/data/obdex from OBDex (https://github.com/foerbsnavi/OBDex, data under CC0).
// Keeps English and splits by the first three characters, so a lookup only loads a small file.
// Euro repair costs are left out because they aren't Maine prices.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public", "data", "obdex");
const response = await fetch("https://foerbsnavi.github.io/OBDex/generic.min.json");
if (!response.ok) throw new Error(`OBDex answered ${response.status}`);
const codes = await response.json();

const groups = new Map();
for (const item of codes) {
  const group = item.code.slice(0, 3).toUpperCase();
  if (!groups.has(group)) groups.set(group, {});
  groups.get(group)[item.code.toUpperCase()] = {
    title: item.title?.en ?? "",
    description: item.description?.en ?? "",
    causes: (item.common_causes ?? []).map((cause) => ({ label: cause.label?.en ?? cause.label ?? "", likelihood: cause.likelihood ?? "" })),
    symptoms: (item.symptoms ?? []).map((symptom) => symptom.en ?? symptom),
    hours: item.repair?.estimated_hours ?? null,
    difficulty: item.repair?.difficulty ?? "",
    related: item.related_codes ?? [],
    sources: (item.sources ?? []).slice(0, 3),
    reviewed: item.reviewed ?? ""
  };
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
let bytes = 0;
for (const [group, entries] of groups) {
  const text = JSON.stringify(entries);
  bytes += Buffer.byteLength(text);
  writeFileSync(join(out, `${group}.json`), text);
}
console.log(`${codes.length} codes, ${groups.size} files, ${(bytes / 1e6).toFixed(1)} MB`);
