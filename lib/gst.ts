/** Normalize Indian state names for place-of-supply comparison */
export function normalizeState(state: string | null | undefined): string {
  if (!state) return "";
  return state
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export type TaxSplit = {
  isInterState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
};

/** Split total tax amount into CGST/SGST or IGST */
export function splitTax(
  taxAmount: number,
  companyState: string | null | undefined,
  placeOfSupply: string | null | undefined
): TaxSplit {
  const tax = Math.max(0, taxAmount);
  const a = normalizeState(companyState);
  const b = normalizeState(placeOfSupply);
  // If either missing, treat as intra (safer default for local retail)
  const isInterState = Boolean(a && b && a !== b);
  if (isInterState) {
    return { isInterState: true, cgst: 0, sgst: 0, igst: round2(tax) };
  }
  const half = round2(tax / 2);
  // Absorb 0.01 rounding on SGST
  const cgst = half;
  const sgst = round2(tax - cgst);
  return { isInterState: false, cgst, sgst, igst: 0 };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
