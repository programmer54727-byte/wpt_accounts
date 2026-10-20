"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:h-16 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] lg:hidden"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <h1 className="truncate text-base font-semibold text-[var(--text-primary)] sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden min-[400px]:block">
          <CompanySwitcher />
        </div>

        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)] sm:px-3"
        >
          Logout
        </button>

        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-medium text-white sm:flex">
          A
        </div>
      </div>
    </header>
  );
}
