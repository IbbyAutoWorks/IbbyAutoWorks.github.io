// VIN helpers for scanning: every vehicle sold in North America since 1981 carries
// a check digit (position 9), so a scan or OCR result is only accepted when it validates.

const transliteration: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
};
const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
// Position 10 encodes the model year and never uses U, Z or 0.
const modelYearCodes = "ABCDEFGHJKLMNPRSTVWXY123456789";

export function isValidVin(vin: string) {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;
  if (!modelYearCodes.includes(vin[9])) return false;
  const sum = [...vin].reduce((total, char, index) => {
    const value = /\d/.test(char) ? Number(char) : transliteration[char];
    return total + value * weights[index];
  }, 0);
  const remainder = sum % 11;
  return vin[8] === (remainder === 10 ? "X" : String(remainder));
}

// VINs never use I, O or Q, so OCR'd look-alikes can be corrected safely.
function fixLookAlikes(text: string) {
  return text.replace(/[OQ]/g, "0").replace(/I/g, "1");
}

// Pull a VIN out of barcode or OCR text. Only whole tokens count: sliding a
// 17-character window across longer text "finds" a fake VIN about 1 time in 11
// (the check digit is one character), which turned busy labels into gibberish.
export function extractVin(raw: string): string | null {
  const tokens = raw.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  const candidates: string[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.length === 17) candidates.push(token);
    // Door-jamb Code 39 labels on imported vehicles prefix an "I".
    if (token.length === 18 && token.startsWith("I")) candidates.push(token.slice(1));
    // Some printed VINs are split into 2-3 groups by spaces; stray short scraps
    // of OCR noise are not joined.
    if (token.length >= 3) {
      let joined = token;
      for (let next = index + 1; next < Math.min(tokens.length, index + 3) && joined.length < 17 && tokens[next].length >= 3; next++) {
        joined += tokens[next];
        if (joined.length === 17) candidates.push(joined);
      }
    }
  }
  for (const candidate of candidates) {
    for (const version of [candidate, fixLookAlikes(candidate)]) {
      if (isValidVin(version)) return version;
    }
  }
  return null;
}
