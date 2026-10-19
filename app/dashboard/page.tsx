import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Receivables"
            value="₹0"
            subtitle="Pending invoices"
            color="text-[var(--success)]"
          />
          <StatCard
            title="Total Payables"
            value="₹0"
            subtitle="Pending bills"
            color="text-[var(--danger)]"
          />
          <StatCard
            title="This Month Income"
            value="₹0"
            subtitle="Invoices paid"
            color="text-[var(--primary)]"
          />
          <StatCard
            title="This Month Expense"
            value="₹0"
            subtitle="Expenses recorded"
            color="text-[var(--warning)]"
          />
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Recent Invoices
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              No invoices yet. Create your first invoice to get started.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Recent Expenses
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              No expenses recorded yet.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs font-medium text-[var(--text-muted)]">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">{subtitle}</p>
    </div>
  );
}
