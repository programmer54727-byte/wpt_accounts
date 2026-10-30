"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default function NewInvoicePage() {
  const router = useRouter();
  useEffect(() => {
    // Full form is being restored — avoid blank PLACEHOLDER crash
  }, []);
  return (
    <AppShell title="New Invoice">
      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm">
        <p className="font-medium text-[var(--text-primary)]">Invoice form update in progress</p>
        <p className="text-[var(--text-secondary)]">
          Please wait for the next deploy. SQL you can run now:{" "}
          <code className="text-xs">supabase/phase4_invoice_gst_header.sql</code>
        </p>
        <a href="/invoices" className="inline-block text-[var(--primary)] hover:underline">
          ← Back to invoices
        </a>
      </div>
    </AppShell>
  );
}
