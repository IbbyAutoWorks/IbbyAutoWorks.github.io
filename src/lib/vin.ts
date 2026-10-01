// VIN helpers for scanning: every vehicle sold in North America since 1981 carries
// a check digit (position 9), so a scan or OCR result is only accepted when it validates.

const transliteration: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
};
const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidVin(vin: string) {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;
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

// Pull the first valid VIN out of barcode or OCR text. Door-jamb Code 39 labels on
// imported vehicles often prefix an "I", and QR labels can carry extra fields.
export function extractVin(raw: string): string | null {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (const candidateText of [compact, fixLookAlikes(compact)]) {
    for (let start = 0; start + 17 <= candidateText.length; start++) {
      const candidate = candidateText.slice(start, start + 17);
      if (isValidVin(candidate)) return candidate;
    }
  }
  return null;
}
