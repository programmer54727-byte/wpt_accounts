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
  sale_rate: number;
  purchase_rate: number;
  gst_rate: number;
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
  const [saleRate, setSaleRate] = useState("0");
  const [purchaseRate, setPurchaseRate] = useState("0");
  const [gstRate, setGstRate] = useState("18");

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
        "id, name, code, item_type, unit, hsn_sac, sale_rate, purchase_rate, gst_rate, is_active"
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

  const resetForm = () => {
    setName("");
    setCode("");
    setItemType("goods");
    setUnit("Nos");
    setHsn("");
    setSaleRate("0");
    setPurchaseRate("0");
    setGstRate("18");
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

    const supabase = createClient();
    const { error } = await supabase.from("stock_items").insert({
      company_id: companyId,
      name: name.trim(),
      code: code.trim() || null,
      item_type: itemType,
      unit: unit.trim() || "Nos",
      hsn_sac: hsn.trim() || null,
      sale_rate: Number(saleRate) || 0,
      purchase_rate: Number(purchaseRate) || 0,
      gst_rate: gst,
    });

    setSaving(false);

    if (error) {
      if (error.message.includes("stock_items_name_unique")) {
        setError("An item with this name already exists in this company.");
      } else if (error.message.includes("stock_items_code_unique")) {
        setError("An item with this code already exists in this company.");
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
            Products and services used on sales and purchase vouchers.
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
            className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
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
              <select
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className={inputClass}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </Field>
            <Field label="Sale rate">
              <input
                type="number"
                min="0"
                step="0.01"
                value={saleRate}
                onChange={(e) => setSaleRate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Purchase rate">
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving || !companyId}
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save item"}
              </button>
            </div>
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
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium text-right">GST %</th>
                    <th className="px-4 py-3 font-medium text-right">Sale</th>
                    <th className="px-4 py-3 font-medium text-right">Purchase</th>
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
                      <td className="px-4 py-3 capitalize text-[var(--text-secondary)]">
                        {item.item_type}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        {Number(item.gst_rate)}%
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        ₹{Number(item.sale_rate).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                        ₹{Number(item.purchase_rate).toFixed(2)}
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
