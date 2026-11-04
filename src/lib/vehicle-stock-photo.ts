// Stock vehicle pictures from Wikimedia Commons. Pictures are linked, not copied, and always credited.
// Only licenses that allow business use are accepted.

export type StockPhoto = { url: string; exactYear: boolean; credit: { label: string; url: string } };

type CommonsPage = {
  title: string;
  imageinfo?: { thumburl?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }[];
};

const squash = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const plainText = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

const notWholeVehicle = /\b(interior|engine|dashboard|cockpit|badge|logo|emblem|wheels?|rims?|seats?|trunk|details?|steering|gauges?|taillights?|headlights?|crash|wreck|damaged|burned|police|race|racing|rally|modified|concept|prototype|toy|model car)\b|\.(svg|pdf|tiff?)$/i;
const notTheUsualVersion = /\b(hybrid|phev|phv|plug-in|prime|ev|electric|taxi|cab)\b/i;
const rearOnly = /\b(rear|back|heck|hinten)\b/i;

export function licenseAllowsBusinessUse(license: string) {
  const name = license.toLowerCase();
  if (/\bnc\b|\bnd\b|non-?commercial|no derivatives|fair use|all rights reserved/.test(name)) return false;
  return /^(public domain|pd\b|cc0|cc[- ]by)/.test(name);
}

// A year counts only when it isn't part of a photo date like 2015-07-09.
function titleYears(title: string) {
  return [...title.matchAll(/(?<![\d-])(19|20)\d\d(?![\d-])/g)].map((match) => Number(match[0]));
}

function score(title: string, make: string, model: string, year: number) {
  const name = squash(title);
  if (!name.includes(squash(make)) || !name.includes(squash(model)) || notWholeVehicle.test(title)) return -1;
  const years = titleYears(title.replace(/^File:/, ""));
  const exact = years.includes(year);
  // No year in the name is a last resort. A year far off is likely a different generation, so it isn't used.
  if (!years.length) return 5;
  const nearest = Math.min(...years.map((item) => Math.abs(item - year)));
  if (!exact && nearest > 2) return -1;
  // A year at the start usually means the model year. Elsewhere it can be the year of a show or an event.
  const leadsWithYear = squash(title.replace(/^File:/, "")).startsWith(`${year}${squash(make)}`);
  return (exact ? 100 : 50 - nearest * 10) + (leadsWithYear ? 10 : 0) + (rearOnly.test(title) ? -5 : 0) + (notTheUsualVersion.test(title) ? -3 : 0);
}

async function search(query: string, make: string, model: string, year: string) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrnamespace: "6",
    gsrlimit: "40",
    gsrsearch: `${query} filetype:bitmap`,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "800"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) return [];
  const data = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(data.query?.pages ?? {})
    .map((page) => {
      const info = page.imageinfo?.[0];
      const license = plainText(info?.extmetadata?.LicenseShortName?.value);
      return { page, info, license, rank: score(page.title, make, model, Number(year)) };
    })
    .filter((item) => item.rank >= 0 && item.info?.thumburl && licenseAllowsBusinessUse(item.license))
    .sort((a, b) => b.rank - a.rank);
}

export async function findStockPhoto(year: string, make: string, model: string): Promise<StockPhoto | null> {
  let candidates = await search(`${year} ${make} ${model}`, make, model, year);
  if (!candidates.some((item) => item.rank >= 30)) {
    candidates = [...candidates, ...await search(`${make} ${model}`, make, model, year)].sort((a, b) => b.rank - a.rank);
  }
  const best = candidates[0];
  if (!best) return null;
  const artist = plainText(best.info?.extmetadata?.Artist?.value).slice(0, 60);
  return {
    url: best.info!.thumburl!,
    exactYear: best.rank >= 90,
    credit: { label: `${artist ? `${artist}, ` : ""}${best.license}, via Wikimedia Commons`, url: best.info?.descriptionurl ?? "https://commons.wikimedia.org/" }
  };
}
