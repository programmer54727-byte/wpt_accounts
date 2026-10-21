"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId, setActiveCompanyId } from "@/lib/company/active";

type Vendor = {
  id: string;
  name: string;
  code: string | null;
  gstin: string | null;
  pan: string | null;
  email: string | null;
  phone: string | null;
  billing_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  notes: string | null;
  is_active: boolean;
};

const emptyForm = {
  name: "",
  code: "",
  gstin: "",
  pan: "",
  email: "",
  phone: "",
  billing_address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  notes: "",
};

export default function VendorsPage() {
  const [rows, setRows] = useState<Vendor[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const resolveCompany = useCallback(async () => {
    const supabase = createClient();
    const id = getActiveCompanyId();

    if (id) {
      const { data } = await supabase
        .from("companies")
        .select("id")
        .eq("id", id)
        .maybeSingle();
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
    const id = await resolveCompany();
    setCompanyId(id);

    if (!id) {
      setRows([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("vendors")
      .select(
        "id, name, code, gstin, pan, email, phone, billing_address, city, state, pincode, country, notes, is_active"
      )
      .eq("company_id", id)
      .order("name");

    if (error) setError(error.message);
    else setRows((data as Vendor[]) ?? []);
    setLoading(false);
  }, [resolveCompany]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setForm({
      name: v.name,
      code: v.code ?? "",
      gstin: v.gstin ?? "",
      pan: v.pan ?? "",
      email: v.email ?? "",
      phone: v.phone ?? "",
      billing_address: v.billing_address ?? "",
      city: v.city ?? "",
      state: v.state ?? "",
      pincode: v.pincode ?? "",
      country: v.country || "India",
      notes: v.notes ?? "",
    });
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !form.name.trim()) return;

    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      gstin: form.gstin.trim() || null,
      pan: form.pan.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      billing_address: form.billing_address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      pincode: form.pincode.trim() || null,
      country: form.country.trim() || "India",
      notes: form.notes.trim() || null,
    };

    const supabase = createClient();
    let error;

    if (editingId) {
      const res = await supabase
        .from("vendors")
        .update(payload)
        .eq("id", editingId)
        .eq("company_id", companyId);
      error = res.error;
    } else {
      const res = await supabase.from("vendors").insert({
        company_id: companyId,
        ...payload,
      });
      error = res.error;
    }

    setSaving(false);

    if (error) {
      if (error.message.includes("vendors_name_unique")) {
        setError("A vendor with this name already exists in this company.");
      } else if (error.message.includes("vendors_code_unique")) {
        setError("A vendor with this code already exists in this company.");
      } else if (error.message.includes("vendors_gstin_unique")) {
        setError("A vendor with this GSTIN already exists in this company.");
      } else if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        setError("Vendors table missing. Run supabase/phase4_masters.sql in Supabase.");
      } else {
        setError(error.message);
      }
      return;
    }

    resetForm();
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) setError(error.message);
    else {
      if (editingId === id) resetForm();
      await load();
    }
  };

  return (
    <AppShell title="Vendors">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Parties for purchase bills, payments and debit notes.
          </p>
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm();
              else {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm(true);
              }
            }}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            {showForm ? "Cancel" : "+ Add vendor"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {editingId ? "Edit vendor" : "New vendor"}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name *">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={inputClass}
                  placeholder="Vendor name"
                />
              </Field>
              <Field label="Code">
                <input
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                />
              </Field>
              <Field label="GSTIN">
                <input
                  value={form.gstin}
                  onChange={(e) => setField("gstin", e.target.value.toUpperCase())}
                  className={inputClass}
                  placeholder="15 characters"
                  maxLength={15}
                />
              </Field>
              <Field label="PAN">
                <input
                  value={form.pan}
                  onChange={(e) => setField("pan", e.target.value.toUpperCase())}
                  className={inputClass}
                  maxLength={10}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="State">
                <input
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  className={inputClass}
                  placeholder="For GST place of supply"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Pincode">
                <input
                  value={form.pincode}
                  onChange={(e) => setField("pincode", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Country">
                <input
                  value={form.country}
                  onChange={(e) => setField("country", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Billing address">
                  <textarea
                    value={form.billing_address}
                    onChange={(e) => setField("billing_address", e.target.value)}
                    className={`${inputClass} min-h-[72px] resize-y`}
                    rows={2}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Notes">
                  <input
                    value={form.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving || !companyId}
                className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update vendor"
                    : "Save vendor"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background)]"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {loading ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-[var(--text-muted)]">
              No vendors yet. Add your first vendor.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-auto text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Code</th>
                    <th className="px-4 py-3 text-left font-medium">GSTIN</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">State</th>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v) => (
                    <tr
                      key={v.id}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        editingId === v.id ? "bg-[var(--background)]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-left font-medium text-[var(--text-primary)]">
                        {v.name}
                      </td>
                      <td className="px-4 py-3 text-left text-[var(--text-secondary)]">
                        {v.code ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-left whitespace-nowrap text-[var(--text-primary)]">
                        {v.gstin ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-left text-[var(--text-secondary)]">
                        {v.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-left text-[var(--text-secondary)]">
                        {v.state ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-left text-[var(--text-secondary)]">
                        {v.city ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(v)}
                            className="text-xs font-medium text-[var(--primary)] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v.id)}
                            className="text-xs text-[var(--danger)] hover:underline"
                          >
                            Delete
                          </button>
                        </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]";
