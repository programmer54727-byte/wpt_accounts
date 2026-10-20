"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/company/types";

const STORAGE_KEY = "wpt-active-company-id";

export function DashboardView() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const stored = localStorage.getItem(STORAGE_KEY);

      let query = supabase.from("companies").select("*").order("name").limit(1);

      if (stored) {
        const { data } = await supabase
          .from("companies")
          .select("*")
          .eq("id", stored)
          .maybeSingle();
        if (data) {
          setCompany(data as Company);
          setLoading(false);
          return;
        }
      }

      const { data } = await query;
      if (data && data[0]) {
        setCompany(data[0] as Company);
        localStorage.setItem(STORAGE_KEY, data[0].id);
      }
      setLoading(false);
    };

    load();
  }, []);

  const companyName = company?.name ?? (loading ? "…" : "Your company");

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Welcome back
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Overview for{" "}
            <span className="font-medium text-[var(--text-secondary)]">
              {companyName}
            </span>
          </p>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Figures update when you add invoices, bills and expenses.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Receivables"
          value="₹0"
          subtitle="Unpaid customer invoices"
          accent="border-l-[var(--success)]"
          valueClass="text-[var(--success)]"
        />
        <StatCard
          title="Payables"
          value="₹0"
          subtitle="Unpaid vendor bills"
          accent="border-l-[var(--danger)]"
          valueClass="text-[var(--danger)]"
        />
        <StatCard
          title="Income (this month)"
          value="₹0"
          subtitle="Sales & receipts"
          accent="border-l-[var(--primary)]"
          valueClass="text-[var(--primary)]"
        />
        <StatCard
          title="Expense (this month)"
          value="₹0"
          subtitle="Bills & expenses"
          accent="border-l-[var(--warning)]"
          valueClass="text-[var(--warning)]"
        />
      </div>

      {/* Cash + quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-1">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Cash & bank overview
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            ₹0
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Combined cash + bank balances
          </p>
          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <Row label="Cash-in-Hand" value="₹0" />
            <Row label="Bank Account" value="₹0" />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-2">
          <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Quick actions
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Action href="/invoices" label="New Sales Invoice" />
            <Action href="/bills" label="New Purchase Bill" />
            <Action href="/expenses" label="Add Expense" />
            <Action href="/receipts" label="Record Receipt" />
            <Action href="/payments" label="Record Payment" />
            <Action href="/customers" label="Add Customer" />
            <Action href="/vendors" label="Add Vendor" />
            <Action href="/ledgers" label="Chart of Accounts" />
            <Action href="/journals" label="Journal Entry" />
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Income vs Expense
          </h3>
          <span className="text-xs text-[var(--text-muted)]">This month</span>
        </div>
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)]">
          <p className="text-sm text-[var(--text-muted)]">
            Chart will appear when you have transactions
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            (Phase 4+ vouchers → live chart)
          </p>
          {/* Simple visual bars placeholder */}
          <div className="mt-6 flex items-end gap-3">
            {[40, 65, 30, 80, 50, 70, 45].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-6 rounded-t bg-[var(--primary)]/20"
                  style={{ height: `${h}px` }}
                />
                <span className="text-[9px] text-[var(--text-muted)]">
                  {"MTWTFSS"[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EmptyList
          title="Recent invoices"
          description="No sales invoices yet."
          ctaLabel="Create invoice"
          ctaHref="/invoices"
        />
        <EmptyList
          title="Recent expenses & bills"
          description="No expenses or bills recorded yet."
          ctaLabel="Add expense"
          ctaHref="/expenses"
        />
      </div>

      {/* Reports shortcuts */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
          Reports
        </p>
        <div className="flex flex-wrap gap-2">
          <ReportChip href="/reports/trial-balance" label="Trial Balance" />
          <ReportChip href="/reports/profit-loss" label="Profit & Loss" />
          <ReportChip href="/reports/balance-sheet" label="Balance Sheet" />
          <ReportChip href="/reports/gst" label="GST Summary" />
          <ReportChip href="/reports/day-book" label="Day Book" />
          <ReportChip href="/reports" label="All reports" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  accent,
  valueClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  valueClass: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] border-l-4 bg-[var(--surface)] p-5 ${accent}`}
    >
      <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[var(--text-secondary)]">
      <span>{label}</span>
      <span className="font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-center text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      {label}
    </Link>
  );
}

function EmptyList({
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-8">
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
        <Link
          href={ctaHref}
          className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function ReportChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      {label}
    </Link>
  );
}
