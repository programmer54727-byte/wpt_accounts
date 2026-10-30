"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getActiveCompanyId, setActiveCompanyId } from "@/lib/company/active";
import {
  type Customer,
  type StockItem,
  type Ledger,
  type Line,
  type ChargeLine,
  emptyLine,
  emptyCharge,
  calcLine,
  calcCharge,
  splitTax,
} from "@/components/invoice/model";

export function useInvoiceForm() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyState, setCompanyState] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("sent");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [refNo, setRefNo] = useState("");
  const [creditDays, setCreditDays] = useState("");
  const [salesLedgerId, setSalesLedgerId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [charges, setCharges] = useState<ChargeLine[]>([]);

  const resolveCompany = useCallback(async () => {
    const supabase = createClient();
    const id = getActiveCompanyId();
    if (id) {
      const { data } = await supabase.from("companies").select("id").eq("id", id).maybeSingle();
      if (data) return data.id as string;
    }
    const { data } = await supabase.from("companies").select("id").order("name").limit(1);
    if (data?.[0]) {
      setActiveCompanyId(data[0].id);
      return data[0].id as string;
    }
    return null;
  }, []);

  useEffect(() => {
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setLines([emptyLine()]);
    (async () => {
      setLoading(true);
      const cid = await resolveCompany();
      setCompanyId(cid);
      if (!cid) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const [custRes, itemRes, invRes, ledgerRes, companyRes] = await Promise.all([
        supabase.from("customers").select("id, name, state").eq("company_id", cid).order("name"),
        supabase
          .from("stock_items")
          .select("id, name, unit, hsn_sac, avg_rate, gst_rate")
          .eq("company_id", cid)
          .order("name"),
        supabase
          .from("invoices")
          .select("invoice_number")
          .eq("company_id", cid)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("chart_of_accounts")
          .select("id, name, account_type")
          .eq("company_id", cid)
          .eq("is_group", false)
          .eq("is_active", true)
          .order("name"),
        supabase.from("companies").select("state").eq("id", cid).maybeSingle(),
      ]);
      if (companyRes.data?.state) setCompanyState(companyRes.data.state as string);
      if (!custRes.error) setCustomers((custRes.data as Customer[]) ?? []);
      if (!itemRes.error) setItems((itemRes.data as StockItem[]) ?? []);
      if (!ledgerRes.error) {
        const led = (ledgerRes.data as Ledger[]) ?? [];
        setLedgers(led);
        const sales = led.find((l) => l.name.toLowerCase() === "sales");
        if (sales) setSalesLedgerId(sales.id);
      }
      const nums = (invRes.data ?? [])
        .map((r) => {
          const m = String(r.invoice_number).match(/(\d+)$/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !Number.isNaN(n));
      setInvoiceNumber(`INV-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, "0")}`);
      setLoading(false);
    })();
  }, [resolveCompany]);

  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, label: c.name, sublabel: c.state || undefined })),
    [customers]
  );
  const itemOptions = useMemo(
    () => items.map((it) => ({ id: it.id, label: it.name, sublabel: it.unit })),
    [items]
  );
  const ledgerOptions = useMemo(
    () => ledgers.map((l) => ({ id: l.id, label: l.name, sublabel: l.account_type })),
    [ledgers]
  );
  const incomeOpts = useMemo(
    () =>
      ledgers
        .filter((l) => l.account_type === "income" || l.name.toLowerCase().includes("sales"))
        .map((l) => ({ id: l.id, label: l.name, sublabel: l.account_type })),
    [ledgers]
  );

  const onPickCustomer = (id: string) => {
    setCustomerId(id);
    const c = customers.find((x) => x.id === id);
    if (c?.state) setPlaceOfSupply(c.state);
  };

  const applyCreditDays = (daysStr: string) => {
    setCreditDays(daysStr);
    const days = parseInt(daysStr, 10);
    if (!invoiceDate || Number.isNaN(days) || days < 0) return;
    const d = new Date(invoiceDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().slice(0, 10));
  };

  const updateLine = (key: string, patch: Partial<Line>) =>
    setLines((p) => p.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const updateCharge = (key: string, patch: Partial<ChargeLine>) =>
    setCharges((p) => p.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const onPickItem = (key: string, stockId: string) => {
    const item = items.find((i) => i.id === stockId);
    if (!item) {
      updateLine(key, { stock_item_id: stockId });
      return;
    }
    updateLine(key, {
      stock_item_id: stockId,
      description: item.name,
      hsn_sac: item.hsn_sac ?? "",
      rate: String(item.avg_rate ?? 0),
      gst_rate: String(item.gst_rate ?? 0),
    });
  };

  const onPickLedger = (key: string, ledgerId: string) => {
    const led = ledgers.find((l) => l.id === ledgerId);
    updateCharge(key, { ledger_id: ledgerId, description: led?.name ?? "" });
  };

  const totals = useMemo(() => {
    let sub = 0;
    let taxT = 0;
    for (const line of lines) {
      const r = calcLine(line);
      sub += r.amount;
      taxT += r.tax;
    }
    for (const c of charges) {
      const r = calcCharge(c);
      sub += r.amount;
      taxT += r.tax;
    }
    const sp = splitTax(taxT, companyState, placeOfSupply);
    return { subtotal: sub, taxTotal: taxT, ...sp, grandTotal: sub + taxT };
  }, [lines, charges, companyState, placeOfSupply]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !customerId || !invoiceNumber.trim() || !invoiceDate) {
      setError("Customer, invoice number and date are required.");
      return;
    }
    const validLines = lines.filter((l) => l.description.trim() && Number(l.qty) > 0);
    const validCharges = charges.filter((c) => c.ledger_id && (Number(c.amount) || 0) > 0);
    if (!validLines.length && !validCharges.length) {
      setError("Add at least one item or charge.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .insert({
        company_id: companyId,
        customer_id: customerId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        status,
        place_of_supply: placeOfSupply.trim() || null,
        notes: notes.trim() || null,
        order_no: orderNo.trim() || null,
        challan_no: challanNo.trim() || null,
        ref_no: refNo.trim() || null,
        credit_days: creditDays === "" ? null : parseInt(creditDays, 10),
        sales_ledger_id: salesLedgerId || null,
        subtotal: totals.subtotal,
        taxable_total: totals.subtotal,
        tax_total: totals.taxTotal,
        cgst_total: totals.cgst,
        sgst_total: totals.sgst,
        igst_total: totals.igst,
        grand_total: totals.grandTotal,
      })
      .select("id")
      .single();

    if (invErr || !inv) {
      setSaving(false);
      setError(
        invErr?.message?.includes("cgst_total") || invErr?.message?.includes("order_no")
          ? "Run supabase/phase4_invoice_gst_header.sql in Supabase first."
          : invErr?.message ?? "Failed to create invoice."
      );
      return;
    }

    const itemRows = validLines.map((l, i) => {
      const { amount, tax, total } = calcLine(l);
      const sp = splitTax(tax, companyState, placeOfSupply);
      return {
        invoice_id: inv.id,
        company_id: companyId,
        line_type: "item",
        stock_item_id: l.stock_item_id || null,
        ledger_id: null,
        description: l.description.trim(),
        hsn_sac: l.hsn_sac.trim() || null,
        qty: Number(l.qty) || 0,
        rate: Number(l.rate) || 0,
        gst_rate: Number(l.gst_rate) || 0,
        discount: Number(l.discount) || 0,
        amount,
        tax_amount: tax,
        cgst_amount: sp.cgst,
        sgst_amount: sp.sgst,
        igst_amount: sp.igst,
        line_total: total,
        sort_order: i,
      };
    });
    const chargeRows = validCharges.map((c, i) => {
      const { amount, tax, total } = calcCharge(c);
      const sp = splitTax(tax, companyState, placeOfSupply);
      return {
        invoice_id: inv.id,
        company_id: companyId,
        line_type: "charge",
        stock_item_id: null,
        ledger_id: c.ledger_id,
        description: c.description.trim() || "Charge",
        hsn_sac: null,
        qty: 1,
        rate: amount,
        gst_rate: Number(c.gst_rate) || 0,
        discount: 0,
        amount,
        tax_amount: tax,
        cgst_amount: sp.cgst,
        sgst_amount: sp.sgst,
        igst_amount: sp.igst,
        line_total: total,
        sort_order: validLines.length + i,
      };
    });

    const { error: linesErr } = await supabase
      .from("invoice_items")
      .insert([...itemRows, ...chargeRows]);
    setSaving(false);
    if (linesErr) {
      await supabase.from("invoices").delete().eq("id", inv.id);
      setError(linesErr.message);
      return;
    }
    router.push("/invoices");
    router.refresh();
  };

  return {
    loading,
    saving,
    error,
    companyId,
    companyState,
    customerId,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    status,
    setStatus,
    placeOfSupply,
    setPlaceOfSupply,
    orderNo,
    setOrderNo,
    challanNo,
    setChallanNo,
    refNo,
    setRefNo,
    creditDays,
    applyCreditDays,
    salesLedgerId,
    setSalesLedgerId,
    notes,
    setNotes,
    lines,
    setLines,
    charges,
    setCharges,
    customerOptions,
    itemOptions,
    ledgerOptions,
    incomeOpts,
    onPickCustomer,
    onPickItem,
    onPickLedger,
    updateLine,
    updateCharge,
    totals,
    handleSubmit,
  };
}
