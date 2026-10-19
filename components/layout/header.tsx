"use client";

import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* User avatar placeholder */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-medium text-white">
          A
        </div>
      </div>
    </header>
  );
}
