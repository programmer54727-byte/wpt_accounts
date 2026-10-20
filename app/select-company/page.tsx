"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Company } from "@/lib/company/types";

export default function SelectCompanyPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const list = (data ?? []) as Company[];
      setCompanies(list);

      if (list.length === 0) {
        router.replace("/onboarding");
        return;
      }

      if (list.length === 1) {
        localStorage.setItem("wpt-active-company-id", list[0].id);
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const selectCompany = (id: string) => {
    localStorage.setItem("wpt-active-company-id", id);
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-muted)]">
        Loading companies...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-xl">
            <Image
              src="/wpt-logo.jpg"
              alt="WPT Accounts"
              fill
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Select company
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Choose which company you want to work with
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          {companies.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCompany(c.id)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--background)]"
            >
              <div>
                <div className="font-medium text-[var(--text-primary)]">
                  {c.name}
                </div>
                {c.gstin && (
                  <div className="text-xs text-[var(--text-muted)]">
                    GSTIN: {c.gstin}
                  </div>
                )}
              </div>
              <span className="text-[var(--primary)] text-sm">Open →</span>
            </button>
          ))}
        </div>

        <Link
          href="/onboarding"
          className="mt-6 block text-center text-sm font-medium text-[var(--primary)] hover:underline"
        >
          + Create new company
        </Link>
      </div>
    </div>
  );
}
