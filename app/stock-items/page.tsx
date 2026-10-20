"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId, setActiveCompanyId } from "@/lib/company/active";

type StockItem = {
  id: string;
  name: string;
  code: string | null;
  item_type: string;
  unit: string;
  hsn_sac: string | null;
  avg_rate: number;
  gst_rate: number;
  opening_qty: number;
  opening_value: number;
  is_active: boolean;
};

export default function StockItemsPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [itemType, setItemType] = useState<"goods" | "service">("goods");
  const [unit, setUnit] = useState("Nos");
  const [hsn, setHsn] = useState("");
  const [gstRate, setGstRate] = useState("5");
  const [openingQty, setOpeningQty] = useState("0");
  const [avgRate, setAvgRate] = useState("0");
  const [openingValue, setOpeningValue] = useState("0");
  const [valueManual, setValueManual] = useState(false);

  const resolveCompany = useCallback(async () => {
    const supabase = createClient();
    const id = getActiveCompanyId();

    if (id) {
      const { data } = await supabase
        .from("companies")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (data) return data.id as string;
    }

    const { data } = await supabase.from("companies").select("id").order("name").limit(1);
    if (data?.[0]) {
      setActiveCompanyId(data[0].id);
      return data[0].id as string;
    }
    return null;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const id = await resolveCompany();
    setCompanyId(id);

    if (!id) {
      setItems([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("stock_items")
      .select(
        "id, name, code, item_type, unit, hsn_sac, avg_rate, gst_rate, opening_qty, opening_value, is_active"
      )
      .eq("company_id", id)
      .order("name");

    if (error) setError(error.message);
    else setItems((data as StockItem[]) ?? []);
    setLoading(false);
  }, [resolveCompany]);

  useEffect(() => {
    load();
  }, [load]);

  const recalcValue = (qtyStr: string, rateStr: string) => {
    if (valueManual) return;
    const q = Number(qtyStr) || 0;
    const r = Number(rateStr) || 0;
    setOpeningValue((q * r).toFixed(2));
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setItemType("goods");
    setUnit("Nos");
    setHsn("");
    setGstRate("5");
    setOpeningQty("0");
    setAvgRate("0");
    setOpeningValue("0");
    setValueManual(false);
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !name.trim()) return;

    setSaving(true);
    setError(null);

    const gst = Number(gstRate);
    if (Number.isNaN(gst) || gst < 0 || gst > 100) {
      setError("GST rate must be between 0 and 100.");
      setSaving(false);
      return;
    }

    const qty = Number(openingQty) || 0;
    const rate = Number(avgRate) || 0;
    const value = valueManual ? Number(openingValue) || 0 : qty * rate;

    const supabase = createClient();
    const { error } = await supabase.from("stock_items").insert({
      company_id: companyId,
      name: name.trim(),
      code: code.trim() || null,
      item_type: itemType,
      unit: unit.trim() || "Nos",
      hsn_sac: hsn.trim() || null,
      gst_rate: gst,
      avg_rate: rate,
      opening_qty: qty,
      opening_value: value,
    });

    setSaving(false);

    if (error) {
      if (error.message.includes("stock_items_name_unique")) {
        setError("An item with this name already exists in this company.");
      } else if (error.message.includes("stock_items_code_unique")) {
        setError("An item with this code already exists in this company.");
      } else if (error.message.includes("sale_rate") || error.message.includes("purchase_rate")) {
        setError(
          "Database still has old columns. Run phase4_drop_sale_purchase_rates.sql in Supabase."
        );
      } else {
        setError(error.message);
      }
      return;
    }

    resetForm();
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stock item?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("stock_items").delete().eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  return (
    <AppShell title="Stock Items">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Opening stock: qty × rate = value. Avg rate later updates from inward only.
          </p>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            {showForm ? "Cancel" : "+ Add item"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name *">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Item name"
                />
              </Field>
              <Field label="Code / SKU">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </Field>
              <Field label="Type">
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as "goods" | "service")}
                  className={inputClass}
                >
                  <option value="goods">Goods</option>
                  <option value="service">Service</option>
                </select>
              </Field>
              <Field label="Unit">
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={inputClass}
                  placeholder="Nos, Kg, Hrs…"
                />
              </Field>
              <Field label="HSN / SAC">
                <input
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="GST rate (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 5, 18"
                />
              </Field>
            </div>

            {/* Opening stock */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Opening stock
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Opening qty">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={openingQty}
                    onChange={(e) => {
                      setOpeningQty(e.target.value);
                      recalcValue(e.target.value, avgRate);
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field label="Rate (₹)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={avgRate}
                    onChange={(e) => {
                      setAvgRate(e.target.value);
                      recalcValue(openingQty, e.target.value);
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field label="Total value (₹)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={openingValue}
                    onChange={(e) => {
                      setValueManual(true);
                      setOpeningValue(e.target.value);
                    }}
                    className={inputClass}
                  />
                </Field>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Value auto = qty × rate. Edit value to override. Rate becomes starting avg rate.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving || !companyId}
              className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save item"}
            </button>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {loading ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">
              No stock items yet. Add your first product or service.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium text-right">GST %</th>
                    <th className="px-4 py-3 font-medium text-right">Op. qty</th>
                    <th className="px-4 py-3 font-medium text-right">Rate</th>
                    <th className="px-4 py-3 font-medium text-right">Op. value</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                        {item.name}
                        {item.hsn_sac && (
                          <span className="ml-2 text-xs text-[var(--text-muted)]">
                            HSN {item.hsn_sac}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {item.code ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        {Number(item.gst_rate)}%
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        {Number(item.opening_qty)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        ₹{Number(item.avg_rate || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        ₹{Number(item.opening_value || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs text-[var(--danger)] hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";
