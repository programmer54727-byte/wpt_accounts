"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId, setActiveCompanyId } from "@/lib/company/active";

type Customer = { id: string; name: string; state: string | null };
type StockItem = {
  id: string;
  name: string;
  unit: string;
  hsn_sac: string | null;
  avg_rate: number;
  gst_rate: number;
};

type Line = {
  key: string;
  stock_item_id: string;
  description: string;
  hsn_sac: string;
  qty: string;
  rate: string;
  gst_rate: string;
  discount: string;
};

let lineKeySeq = 0;
function nextLineKey() {
  lineKeySeq += 1;
  return `line-${lineKeySeq}`;
}

function emptyLine(): Line {
  return {
    key: nextLineKey(),
    stock_item_id: "",
    description: "",
    hsn_sac: "",
    qty: "1",
    rate: "0",
    gst_rate: "0",
    discount: "0",
  };
}

function calcLine(line: Line) {
  const qty = Number(line.qty) || 0;
  const rate = Number(line.rate) || 0;
  const discount = Number(line.discount) || 0;
  const gst = Number(line.gst_rate) || 0;
  const amount = Math.max(0, qty * rate - discount);
  const tax = (amount * gst) / 100;
  const total = amount + tax;
  return { amount, tax, total };
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";

export default function NewInvoicePage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("sent");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  // Quick-add modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerDraftName, setCustomerDraftName] = useState("");
  const [customerDraftState, setCustomerDraftState] = useState("");
  const [customerDraftGstin, setCustomerDraftGstin] = useState("");
  const [customerDraftPhone, setCustomerDraftPhone] = useState("");
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [itemTargetLineKey, setItemTargetLineKey] = useState<string | null>(null);
  const [itemDraftName, setItemDraftName] = useState("");
  const [itemDraftUnit, setItemDraftUnit] = useState("Nos");
  const [itemDraftHsn, setItemDraftHsn] = useState("");
  const [itemDraftRate, setItemDraftRate] = useState("0");
  const [itemDraftGst, setItemDraftGst] = useState("5");
  const [savingItem, setSavingItem] = useState(false);

  const resolveCompany = useCallback(async () => {
    const supabase = createClient();
    const id = getActiveCompanyId();
    if (id) {
      const { data } = await supabase.from("companies").select("id").eq("id", id).maybeSingle();
      if (data) return data.id as string;
    }
    const { data } = await supabase.from("companies").select("id").order("name").limit(1);
    if (data?.[0]) {
      setActiveCompanyId(data[0].id);
      return data[0].id as string;
    }
    return null;
  }, []);

  useEffect(() => {
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setLines([emptyLine()]);

    (async () => {
      setLoading(true);
      const cid = await resolveCompany();
      setCompanyId(cid);
      if (!cid) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const [custRes, itemRes, invRes] = await Promise.all([
        supabase.from("customers").select("id, name, state").eq("company_id", cid).order("name"),
        supabase
          .from("stock_items")
          .select("id, name, unit, hsn_sac, avg_rate, gst_rate")
          .eq("company_id", cid)
          .order("name"),
        supabase
          .from("invoices")
          .select("invoice_number")
          .eq("company_id", cid)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (custRes.error) setError(custRes.error.message);
      else setCustomers((custRes.data as Customer[]) ?? []);

      if (itemRes.error) setError(itemRes.error.message);
      else setItems((itemRes.data as StockItem[]) ?? []);

      const nums = (invRes.data ?? [])
        .map((r) => {
          const m = String(r.invoice_number).match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !Number.isNaN(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      setInvoiceNumber(`INV-${String(next).padStart(4, "0")}`);

      setLoading(false);
    })();
  }, [resolveCompany]);

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        id: c.id,
        label: c.name,
        sublabel: c.state || undefined,
      })),
    [customers]
  );

  const itemOptions = useMemo(
    () =>
      items.map((it) => ({
        id: it.id,
        label: it.name,
        sublabel: [it.unit, it.hsn_sac ? `HSN ${it.hsn_sac}` : null]
          .filter(Boolean)
          .join(" · "),
      })),
    [items]
  );

  const onPickCustomer = (id: string) => {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (c?.state) setPlaceOfSupply(c.state);
  };

  const updateLine = (key: string, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const onPickItem = (key: string, stockId: string) => {
    const item = items.find((i) => i.id === stockId);
    if (!item) {
      updateLine(key, { stock_item_id: stockId });
      return;
    }
    updateLine(key, {
      stock_item_id: stockId,
      description: item.name,
      hsn_sac: item.hsn_sac ?? "",
      rate: String(item.avg_rate ?? 0),
      gst_rate: String(item.gst_rate ?? 0),
    });
  };

  const openCustomerModal = (nameHint: string) => {
    setCustomerDraftName(nameHint);
    setCustomerDraftState("");
    setCustomerDraftGstin("");
    setCustomerDraftPhone("");
    setShowCustomerModal(true);
  };

  const openItemModal = (lineKey: string, nameHint: string) => {
    setItemTargetLineKey(lineKey);
    setItemDraftName(nameHint);
    setItemDraftUnit("Nos");
    setItemDraftHsn("");
    setItemDraftRate("0");
    setItemDraftGst("5");
    setShowItemModal(true);
  };

  const saveQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !customerDraftName.trim()) return;
    setSavingCustomer(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        name: customerDraftName.trim(),
        state: customerDraftState.trim() || null,
        gstin: customerDraftGstin.trim() || null,
        phone: customerDraftPhone.trim() || null,
        gst_type: "unregistered",
      })
      .select("id, name, state")
      .single();
    setSavingCustomer(false);
    if (error || !data) {
      setError(error?.message ?? "Could not create customer");
      return;
    }
    setCustomers((prev) => [...prev, data as Customer].sort((a, b) => a.name.localeCompare(b.name)));
    setCustomerId(data.id);
    if (data.state) setPlaceOfSupply(data.state);
    setShowCustomerModal(false);
  };

  const saveQuickItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !itemDraftName.trim()) return;
    setSavingItem(true);
    setError(null);
    const rate = Number(itemDraftRate) || 0;
    const gst = Number(itemDraftGst) || 0;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("stock_items")
      .insert({
        company_id: companyId,
        name: itemDraftName.trim(),
        unit: itemDraftUnit.trim() || "Nos",
        hsn_sac: itemDraftHsn.trim() || null,
        avg_rate: rate,
        gst_rate: gst,
        opening_qty: 0,
        opening_value: 0,
      })
      .select("id, name, unit, hsn_sac, avg_rate, gst_rate")
      .single();
    setSavingItem(false);
    if (error || !data) {
      setError(error?.message ?? "Could not create item");
      return;
    }
    const item = data as StockItem;
    setItems((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
    if (itemTargetLineKey) {
      onPickItem(itemTargetLineKey, item.id);
    }
    setShowItemModal(false);
    setItemTargetLineKey(null);
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;
    for (const line of lines) {
      const { amount, tax } = calcLine(line);
      subtotal += amount;
      taxTotal += tax;
    }
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  }, [lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!customerId) {
      setError("Select a customer.");
      return;
    }
    if (!invoiceNumber.trim()) {
      setError("Invoice number is required.");
      return;
    }
    if (!invoiceDate) {
      setError("Invoice date is required.");
      return;
    }

    const validLines = lines.filter((l) => l.description.trim() && Number(l.qty) > 0);
    if (validLines.length === 0) {
      setError("Add at least one line item.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();

    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .insert({
        company_id: companyId,
        customer_id: customerId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        status,
        place_of_supply: placeOfSupply.trim() || null,
        notes: notes.trim() || null,
        subtotal: totals.subtotal,
        tax_total: totals.taxTotal,
        grand_total: totals.grandTotal,
      })
      .select("id")
      .single();

    if (invErr || !inv) {
      setSaving(false);
      if (invErr?.message.includes("invoices_number_unique")) {
        setError("Invoice number already exists for this company.");
      } else if (invErr?.message.includes("does not exist")) {
        setError("Run supabase/phase4_invoices.sql in Supabase first.");
      } else {
        setError(invErr?.message ?? "Failed to create invoice.");
      }
      return;
    }

    const itemRows = validLines.map((l, i) => {
      const { amount, tax, total } = calcLine(l);
      return {
        invoice_id: inv.id,
        company_id: companyId,
        stock_item_id: l.stock_item_id || null,
        description: l.description.trim(),
        hsn_sac: l.hsn_sac.trim() || null,
        qty: Number(l.qty) || 0,
        rate: Number(l.rate) || 0,
        gst_rate: Number(l.gst_rate) || 0,
        discount: Number(l.discount) || 0,
        amount,
        tax_amount: tax,
        line_total: total,
        sort_order: i,
      };
    });

    const { error: linesErr } = await supabase.from("invoice_items").insert(itemRows);
    setSaving(false);

    if (linesErr) {
      await supabase.from("invoices").delete().eq("id", inv.id);
      setError(linesErr.message);
      return;
    }

    router.push("/invoices");
    router.refresh();
  };

  if (loading) {
    return (
      <AppShell title="New Invoice">
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Invoice">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/invoices"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Back to invoices
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Customer *">
            <SearchableSelect
              options={customerOptions}
              value={customerId}
              onChange={onPickCustomer}
              placeholder="Search customer…"
              createLabel="Add customer"
              onCreate={openCustomerModal}
            />
          </Field>
          <Field label="Invoice number *">
            <input
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Invoice date *">
            <input
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
          <Field label="Place of supply (state)">
            <input
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Notes">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--text-primary)]">Line items</p>
            <button
              type="button"
              onClick={() => setLines((p) => [...p, emptyLine()])}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              + Add line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-[var(--background)] text-xs text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium min-w-[180px]">Item</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-left font-medium">HSN</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Rate</th>
                  <th className="px-3 py-2 text-right font-medium">Disc</th>
                  <th className="px-3 py-2 text-right font-medium">GST %</th>
                  <th className="px-3 py-2 text-right font-medium">Amount</th>
                  <th className="px-3 py-2 text-right font-medium">Tax</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const { amount, tax, total } = calcLine(line);
                  return (
                    <tr key={line.key} className="border-t border-[var(--border)]">
                      <td className="px-2 py-2">
                        <SearchableSelect
                          options={itemOptions}
                          value={line.stock_item_id}
                          onChange={(id) => onPickItem(line.key, id)}
                          placeholder="Search item…"
                          createLabel="Add item"
                          onCreate={(q) => openItemModal(line.key, q)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={line.description}
                          onChange={(e) => updateLine(line.key, { description: e.target.value })}
                          className={inputClass}
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={line.hsn_sac}
                          onChange={(e) => updateLine(line.key, { hsn_sac: e.target.value })}
                          className={`${inputClass} w-24`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={line.qty}
                          onChange={(e) => updateLine(line.key, { qty: e.target.value })}
                          className={`${inputClass} w-20 text-right`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.rate}
                          onChange={(e) => updateLine(line.key, { rate: e.target.value })}
                          className={`${inputClass} w-24 text-right`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={line.discount}
                          onChange={(e) => updateLine(line.key, { discount: e.target.value })}
                          className={`${inputClass} w-20 text-right`}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={line.gst_rate}
                          onChange={(e) => updateLine(line.key, { gst_rate: e.target.value })}
                          className={`${inputClass} w-20 text-right`}
                        />
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        ₹{amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">₹{tax.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                        ₹{total.toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLines((p) => p.filter((x) => x.key !== line.key))}
                            className="text-xs text-[var(--danger)] hover:underline"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1 border-t border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm">
            <div className="flex w-56 justify-between text-[var(--text-secondary)]">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex w-56 justify-between text-[var(--text-secondary)]">
              <span>Tax</span>
              <span>₹{totals.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-56 justify-between text-base font-semibold text-[var(--text-primary)]">
              <span>Grand total</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || !companyId}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save invoice"}
          </button>
          <Link
            href="/invoices"
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background)]"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Customer quick-add modal */}
      {showCustomerModal && (
        <Modal title="Add customer" onClose={() => setShowCustomerModal(false)}>
          <form onSubmit={saveQuickCustomer} className="space-y-3">
            <Field label="Name *">
              <input
                required
                value={customerDraftName}
                onChange={(e) => setCustomerDraftName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </Field>
            <Field label="State">
              <input
                value={customerDraftState}
                onChange={(e) => setCustomerDraftState(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="GSTIN">
              <input
                value={customerDraftGstin}
                onChange={(e) => setCustomerDraftGstin(e.target.value.toUpperCase())}
                className={inputClass}
                maxLength={15}
              />
            </Field>
            <Field label="Phone">
              <input
                value={customerDraftPhone}
                onChange={(e) => setCustomerDraftPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={savingCustomer}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {savingCustomer ? "Saving…" : "Save & select"}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock item quick-add modal */}
      {showItemModal && (
        <Modal title="Add stock item" onClose={() => setShowItemModal(false)}>
          <form onSubmit={saveQuickItem} className="space-y-3">
            <Field label="Name *">
              <input
                required
                value={itemDraftName}
                onChange={(e) => setItemDraftName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit">
                <input
                  value={itemDraftUnit}
                  onChange={(e) => setItemDraftUnit(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="HSN">
                <input
                  value={itemDraftHsn}
                  onChange={(e) => setItemDraftHsn(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Rate (₹)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemDraftRate}
                  onChange={(e) => setItemDraftRate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="GST %">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={itemDraftGst}
                  onChange={(e) => setItemDraftGst(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={savingItem}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {savingItem ? "Saving…" : "Save & select"}
              </button>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
