"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data, error: rpcError } = await supabase.rpc(
      "create_company_with_defaults",
      {
        p_name: name.trim(),
        p_legal_name: legalName.trim() || null,
        p_gstin: gstin.trim() || null,
        p_pan: pan.trim() || null,
        p_address: address.trim() || null,
        p_city: city.trim() || null,
        p_state: state.trim() || null,
        p_pincode: pincode.trim() || null,
        p_country: "India",
        p_currency: "INR",
      }
    );

    setLoading(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    if (data) {
      localStorage.setItem("wpt-active-company-id", data as string);
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-lg">
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
            Create your company
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Set up your first company to start accounting. Default ledgers will
            be created automatically.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          <Field label="Company Name *" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Web Power Tech"
              className={inputClass}
            />
          </Field>

          <Field label="Legal Name">
            <input
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Registered legal name"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="GSTIN">
              <input
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="Optional"
                maxLength={15}
                className={inputClass}
              />
            </Field>
            <Field label="PAN">
              <input
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="Optional"
                maxLength={10}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Address">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="City">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="State">
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Pincode">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Currency: INR · Financial year starts 1 April (default)
          </p>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {loading ? "Creating company..." : "Create Company & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
        {label}
        {required ? "" : ""}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";
