import { splitTax } from "@/lib/gst";

export type Customer = { id: string; name: string; state: string | null };
export type StockItem = {
  id: string;
  name: string;
  unit: string;
  hsn_sac: string | null;
  avg_rate: number;
  gst_rate: number;
};
export type Ledger = { id: string; name: string; account_type: string };
export type Line = {
  key: string;
  stock_item_id: string;
  description: string;
  hsn_sac: string;
  qty: string;
  rate: string;
  gst_rate: string;
  discount: string;
};
export type ChargeLine = {
  key: string;
  ledger_id: string;
  description: string;
  amount: string;
  gst_rate: string;
};

let seq = 0;
export const nextKey = () => `k-${++seq}`;
export const emptyLine = (): Line => ({
  key: nextKey(),
  stock_item_id: "",
  description: "",
  hsn_sac: "",
  qty: "1",
  rate: "0",
  gst_rate: "0",
  discount: "0",
});
export const emptyCharge = (): ChargeLine => ({
  key: nextKey(),
  ledger_id: "",
  description: "",
  amount: "0",
  gst_rate: "0",
});

export function calcLine(line: Line) {
  const qty = Number(line.qty) || 0;
  const rate = Number(line.rate) || 0;
  const discount = Number(line.discount) || 0;
  const gst = Number(line.gst_rate) || 0;
  const amount = Math.max(0, qty * rate - discount);
  const tax = (amount * gst) / 100;
  return { amount, tax, total: amount + tax };
}

export function calcCharge(c: ChargeLine) {
  const amount = Math.max(0, Number(c.amount) || 0);
  const tax = (amount * (Number(c.gst_rate) || 0)) / 100;
  return { amount, tax, total: amount + tax };
}

export { splitTax };

export const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";
