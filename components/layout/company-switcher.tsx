"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/company/types";

const STORAGE_KEY = "wpt-active-company-id";

export function CompanySwitcher() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      const list = (data ?? []) as Company[];
      setCompanies(list);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && list.some((c) => c.id === stored)) {
        setActiveId(stored);
      } else if (list.length > 0) {
        setActiveId(list[0].id);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      }
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const active = companies.find((c) => c.id === activeId) ?? null;

  const select = (id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
    setOpen(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-9 w-40 animate-pulse rounded-lg bg-[var(--background)]" />
    );
  }

  if (companies.length === 0) {
    return (
      <Link
        href="/onboarding"
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--surface-elevated)]"
      >
        + Create company
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[220px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-elevated)]"
      >
        <span className="truncate font-medium text-[var(--text-primary)]">
          {active?.name ?? "Select company"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-[var(--text-muted)]"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <div className="max-h-60 overflow-y-auto p-1">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => select(c.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  c.id === activeId
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-primary)] hover:bg-[var(--background)]"
                }`}
              >
                <span className="truncate">{c.name}</span>
                {c.id === activeId && (
                  <span className="text-xs opacity-90">Active</span>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-[var(--border)] p-1">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--background)]"
            >
              + Create new company
            </Link>
            <Link
              href="/select-company"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--background)]"
            >
              Manage companies
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
