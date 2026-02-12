/** CIK normalisation helpers. */

/**
 * Zero-pad a CIK to exactly 10 digits.
 * Accepts string or number input; strips non-digit characters.
 */
export function normalizeCik(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 0) throw new Error("Invalid CIK: no digits found");
  if (digits.length > 10) throw new Error("Invalid CIK: too many digits");
  return digits.padStart(10, "0");
}

/**
 * Format CIK for display (strip leading zeros).
 */
export function displayCik(cik: string): string {
  return cik.replace(/^0+/, "") || "0";
}
