# WPT Accounts — Product Roadmap

**Cloud-based Accounting Application by Web Power Tech**

This document outlines the complete development roadmap — from current status to a production-ready product.  
Follow the phases in order for best results.

**Important notes:**

- This application has **only one role — Accountant**. There are no Admin / Viewer / multi-role permissions. Every logged-in user is an Accountant with full access.
- **Multi-company** is supported from Phase 2. See the design document linked below.
- **No separate Expenses voucher** — daily costs use Payment (to expense ledger), Purchase/Bills, or Journal.

---

## Current Status (as of October 2026)

| Item | Status |
|------|--------|
| Repository / README / Theme | ✅ Done |
| Next.js + Vercel deploy | ✅ Done |
| Auth (Login / Register / Logout) | ✅ Done |
| Multi-company + CoA seed + switcher | ✅ Done |
| Dashboard UI (Phase 3) | ✅ Done |
| Live dashboard totals | ⬜ After vouchers |
| Stock Items / Customers / Vendors | ✅ Done |
| Sales Invoice (basic + charges) | ✅ Partial |
| GST CGST/SGST/IGST split | 🔄 In progress |
| Purchase / Payment / Receipt / Journal | ⬜ Not started |
| Reports with live data | ⬜ Not started |

**Overall progress:** Phase 0–3 ✅ · Phase 4 ~45% · Phases 5–8 pending

---

## Phase 0 — Project Foundation ✅ COMPLETE

---

## Phase 1 — Authentication ✅ COMPLETE

---

## Phase 2 — Database, Multi-Company & Default Ledgers ✅ COMPLETE (core)

👉 **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**  
👉 **SQL:** [supabase/phase2_schema.sql](./supabase/phase2_schema.sql)

---

## Navigation structure (sidebar) ✅ IN APP

| Section | Items |
|---------|--------|
| **Overview** | Dashboard |
| **Masters** | Chart of Accounts, Customers, Vendors, Stock Items, Godowns, Tax Rates, Cost Centres |
| **Vouchers** | Sales Invoice, Purchase / Bills, Payment, Receipt, Journal, Contra, Credit Note, Debit Note |
| **Reports** | Day Book, Cash Book, Bank Book, Ledger Statement, Trial Balance, P&L, Balance Sheet, Aged Receivables/Payables, GST Summary, All Reports |
| **System** | Company Profile, Export / Backup, Settings |

---

## Phase 3 — Dashboard ✅ UI COMPLETE

Live totals pending until vouchers post numbers.

---

## Phase 4 — Voucher Entry (Sales, Purchase & Stock Items)

**Status:** 🔄 In progress (~45%)

👉 **Sales design (vs Tally):** [docs/SALES_INVOICE_DESIGN.md](./docs/SALES_INVOICE_DESIGN.md)

### 4A — Masters ✅ MOSTLY COMPLETE

| Master | Status |
|--------|--------|
| Stock Items (avg rate, opening, GST, HSN, edit) | ✅ |
| Customers (+ GST type) | ✅ |
| Vendors (+ GST type) | ✅ |
| Tax Rates table | ✅ DB (UI optional) |

### 4B — Sales Invoice

| Feature | Status |
|---------|--------|
| List + create + delete | ✅ |
| Customer search + quick add | ✅ |
| Item lines + searchable + quick add | ✅ |
| Keyboard navigation (arrows + Enter) | ✅ |
| Additional ledger charges | ✅ |
| CGST / SGST / IGST split | 🔄 |
| Order / challan / ref / credit days / sales ledger | 🔄 |
| Stock outward on save | ⬜ |
| Bill-wise outstanding | ⬜ |
| PDF print | ⬜ |

**SQL**

- [supabase/phase4_masters.sql](./supabase/phase4_masters.sql)
- [supabase/phase4_invoices.sql](./supabase/phase4_invoices.sql)
- [supabase/phase4_invoice_ledger_charges.sql](./supabase/phase4_invoice_ledger_charges.sql)
- [supabase/phase4_invoice_gst_header.sql](./supabase/phase4_invoice_gst_header.sql)

### 4C — Still to build

1. Finish sales GST header + split UI/save
2. Purchase / Bills (mirror sales)
3. Payment & Receipt
4. Journal, Contra, Credit Note, Debit Note
5. Stock movement on sales/purchase
6. Dashboard live numbers

### Out of scope for Phase 4

- Full inventory valuation, batch/serial, multi-godown reports
- Bank reconciliation, recurring invoices, e-invoice IRN

---

## Phase 5 — Payments depth & party ledgers ⬜

## Phase 6 — Chart of Accounts & Ledger UI ⬜ (seed ✅)

## Phase 7 — Reports & Analytics ⬜

## Phase 8 — Polish, Testing & Launch Prep ⬜ (Vercel ✅)

---

## Recommended Tech Stack

| Area | Technology |
|------|------------|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables (Light/Dark) |
| Backend / DB | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Role | Single — Accountant |
| Deploy | Vercel |

---

**Web Power Tech**  
Building reliable software, one step at a time.
