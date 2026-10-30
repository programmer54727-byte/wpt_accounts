"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useInvoiceForm } from "@/components/invoice/use-invoice-form";
import { emptyLine, emptyCharge, calcLine, calcCharge, inputClass } from "@/components/invoice/model";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

export default function NewInvoicePage() {
  const f = useInvoiceForm();

  if (f.loading) {
    return (
      <AppShell title="New Invoice">
        <p className="text-sm text-[var(--text-muted)]">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Invoice">
      <form onSubmit={f.handleSubmit} className="space-y-4">
        <Link href="/invoices" className="text-sm text-[var(--text-secondary)]">
          ← Back to invoices
        </Link>
        {f.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {f.error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Customer *">
            <SearchableSelect
              options={f.customerOptions}
              value={f.customerId}
              onChange={f.onPickCustomer}
              placeholder="Search customer…"
            />
          </Field>
          <Field label="Invoice number *">
            <input
              required
              value={f.invoiceNumber}
              onChange={(e) => f.setInvoiceNumber(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Invoice date *">
            <input
              type="date"
              required
              value={f.invoiceDate}
              onChange={(e) => f.setInvoiceDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              value={f.dueDate}
              onChange={(e) => f.setDueDate(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select value={f.status} onChange={(e) => f.setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
          <Field label="Place of supply">
            <input
              value={f.placeOfSupply}
              onChange={(e) => f.setPlaceOfSupply(e.target.value)}
              className={inputClass}
              placeholder={f.companyState ? `Co: ${f.companyState}` : "State"}
            />
          </Field>
          <Field label="Sales ledger">
            <SearchableSelect
              options={f.incomeOpts.length ? f.incomeOpts : f.ledgerOptions}
              value={f.salesLedgerId}
              onChange={f.setSalesLedgerId}
              placeholder="Sales ledger…"
            />
          </Field>
          <Field label="Order no">
            <input value={f.orderNo} onChange={(e) => f.setOrderNo(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Challan no">
            <input value={f.challanNo} onChange={(e) => f.setChallanNo(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Other ref">
            <input value={f.refNo} onChange={(e) => f.setRefNo(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Credit days">
            <input
              type="number"
              min="0"
              value={f.creditDays}
              onChange={(e) => f.applyCreditDays(e.target.value)}
              className={inputClass}
              placeholder="30"
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Notes">
              <input value={f.notes} onChange={(e) => f.setNotes(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <p className="text-sm font-medium">Line items</p>
            <button
              type="button"
              onClick={() => f.setLines((p) => [...p, emptyLine()])}
              className="text-xs text-[var(--primary)]"
            >
              + Add line
            </button>
          </div>
          <div className="space-y-2 p-3">
            {f.lines.map((line) => {
              const { amount, tax, total } = calcLine(line);
              return (
                <div
                  key={line.key}
                  className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-2 lg:grid-cols-6"
                >
                  <SearchableSelect
                    options={f.itemOptions}
                    value={line.stock_item_id}
                    onChange={(id) => f.onPickItem(line.key, id)}
                    placeholder="Item…"
                  />
                  <input
                    value={line.description}
                    onChange={(e) => f.updateLine(line.key, { description: e.target.value })}
                    className={inputClass}
                    placeholder="Description"
                  />
                  <input
                    value={line.hsn_sac}
                    onChange={(e) => f.updateLine(line.key, { hsn_sac: e.target.value })}
                    className={inputClass}
                    placeholder="HSN"
                  />
                  <input
                    type="number"
                    value={line.qty}
                    onChange={(e) => f.updateLine(line.key, { qty: e.target.value })}
                    className={inputClass}
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={line.rate}
                    onChange={(e) => f.updateLine(line.key, { rate: e.target.value })}
                    className={inputClass}
                    placeholder="Rate"
                  />
                  <input
                    type="number"
                    value={line.gst_rate}
                    onChange={(e) => f.updateLine(line.key, { gst_rate: e.target.value })}
                    className={inputClass}
                    placeholder="GST %"
                  />
                  <div className="col-span-2 flex flex-wrap justify-between gap-2 text-xs text-[var(--text-muted)] lg:col-span-6">
                    <span>
                      Disc{" "}
                      <input
                        type="number"
                        value={line.discount}
                        onChange={(e) => f.updateLine(line.key, { discount: e.target.value })}
                        className={`${inputClass} ml-1 inline-block w-20`}
                      />
                    </span>
                    <span>
                      ₹{amount.toFixed(2)} + tax ₹{tax.toFixed(2)} = ₹{total.toFixed(2)}
                    </span>
                    {f.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => f.setLines((p) => p.filter((x) => x.key !== line.key))}
                        className="text-[var(--danger)]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div>
              <p className="text-sm font-medium">Additional charges (Ledger)</p>
              <p className="text-xs text-[var(--text-muted)]">Transport, fitting, repair…</p>
            </div>
            <button
              type="button"
              onClick={() => f.setCharges((p) => [...p, emptyCharge()])}
              className="text-xs text-[var(--primary)]"
            >
              + Add charge
            </button>
          </div>
          {f.charges.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-muted)]">No extra charges.</p>
          ) : (
            <div className="space-y-2 p-3">
              {f.charges.map((c) => {
                const { tax, total } = calcCharge(c);
                return (
                  <div
                    key={c.key}
                    className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] p-2 lg:grid-cols-5"
                  >
                    <SearchableSelect
                      options={f.ledgerOptions}
                      value={c.ledger_id}
                      onChange={(id) => f.onPickLedger(c.key, id)}
                      placeholder="Ledger…"
                    />
                    <input
                      value={c.description}
                      onChange={(e) => f.updateCharge(c.key, { description: e.target.value })}
                      className={inputClass}
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={c.amount}
                      onChange={(e) => f.updateCharge(c.key, { amount: e.target.value })}
                      className={inputClass}
                      placeholder="Amount"
                    />
                    <input
                      type="number"
                      value={c.gst_rate}
                      onChange={(e) => f.updateCharge(c.key, { gst_rate: e.target.value })}
                      className={inputClass}
                      placeholder="GST %"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        ₹{total.toFixed(2)} (tax ₹{tax.toFixed(2)})
                      </span>
                      <button
                        type="button"
                        onClick={() => f.setCharges((p) => p.filter((x) => x.key !== c.key))}
                        className="text-[var(--danger)]"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
          <div className="flex w-72 justify-between text-[var(--text-secondary)]">
            <span>Taxable</span>
            <span>₹{f.totals.subtotal.toFixed(2)}</span>
          </div>
          {f.totals.isInterState ? (
            <div className="flex w-72 justify-between text-[var(--text-secondary)]">
              <span>IGST</span>
              <span>₹{f.totals.igst.toFixed(2)}</span>
            </div>
          ) : (
            <>
              <div className="flex w-72 justify-between text-[var(--text-secondary)]">
                <span>CGST</span>
                <span>₹{f.totals.cgst.toFixed(2)}</span>
              </div>
              <div className="flex w-72 justify-between text-[var(--text-secondary)]">
                <span>SGST</span>
                <span>₹{f.totals.sgst.toFixed(2)}</span>
              </div>
            </>
          )}
          <p className="w-72 text-xs text-[var(--text-muted)]">
            {f.totals.isInterState ? "Inter-state" : "Intra-state"}
            {f.companyState ? ` · Co: ${f.companyState}` : ""}
            {f.placeOfSupply ? ` · POS: ${f.placeOfSupply}` : ""}
          </p>
          <div className="flex w-72 justify-between border-t border-[var(--border)] pt-2 font-semibold">
            <span>Grand total</span>
            <span>₹{f.totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={f.saving || !f.companyId}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {f.saving ? "Saving…" : "Save invoice"}
          </button>
          <Link href="/invoices" className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
