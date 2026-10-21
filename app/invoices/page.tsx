"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId, setActiveCompanyId } from "@/lib/company/active";

type InvoiceRow = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  status: string;
  grand_total: number;
  customers: { name: string } | null;
};

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const companyId = await resolveCompany();
    if (!companyId) {
      setRows([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, status, grand_total, customers(name)")
      .eq("company_id", companyId)
      .order("invoice_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setRows((data as unknown as InvoiceRow[]) ?? []);
    setLoading(false);
  }, [resolveCompany]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  return (
    <AppShell title="Sales Invoice">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Create and manage sales invoices with stock items and GST.
          </p>
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            + New invoice
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
            {error.includes("does not exist") && (
              <span className="mt-1 block text-xs">
                Run supabase/phase4_invoices.sql in Supabase SQL Editor.
              </span>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {loading ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">
              No invoices yet.{" "}
              <Link href="/invoices/new" className="text-[var(--primary)] hover:underline">
                Create the first invoice
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] table-auto text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Number</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inv) => (
                    <tr key={inv.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                        {inv.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {inv.invoice_date}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-primary)]">
                        {inv.customers?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 capitalize text-[var(--text-secondary)]">
                        {inv.status}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
                        ₹{Number(inv.grand_total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
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
