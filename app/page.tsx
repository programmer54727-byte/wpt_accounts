import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/wpt-logo.jpg"
              alt="WPT Accounts Logo"
              width={40}
              height={40}
              className="rounded-md"
              priority
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                WPT Accounts
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                by Web Power Tech
              </span>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <Image
            src="/wpt-logo.jpg"
            alt="WPT Accounts"
            width={120}
            height={120}
            className="mx-auto rounded-xl"
            priority
          />
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          WPT Accounts
        </h1>

        <p className="mb-2 text-lg text-[var(--text-secondary)]">
          Cloud-based Accounting Software
        </p>

        <p className="mb-10 max-w-xl text-[var(--text-muted)]">
          Modern, fast and secure accounting solution for businesses.  
          Manage invoices, expenses, ledgers and reports — all in one place.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]">
            Get Started
          </button>
          <button className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-elevated)]">
            View Roadmap
          </button>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
            <div className="mb-2 text-sm font-semibold text-[var(--primary)]">
              Invoices
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Create, send and track invoices with GST support.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
            <div className="mb-2 text-sm font-semibold text-[var(--primary)]">
              Expenses
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Record expenses and manage bills easily.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
            <div className="mb-2 text-sm font-semibold text-[var(--primary)]">
              Reports
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              P&L, Balance Sheet and GST reports.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-muted)]">
        © {new Date().getFullYear()} Web Power Tech. All rights reserved.
      </footer>
    </div>
  );
}
