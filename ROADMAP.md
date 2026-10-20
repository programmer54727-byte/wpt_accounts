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
| Repository created | ✅ Done |
| README + Theme docs | ✅ Done |
| Next.js app scaffold | ✅ Done |
| Official logo | ✅ Done |
| Project structure | ✅ Done |
| Theme (Light / Dark) | ✅ Done |
| App shell (Sidebar + Header) | ✅ Done |
| Tally-style navigation menu | ✅ Done |
| Authentication (Login / Register / Logout) | ✅ Done |
| Multi-company + onboarding | ✅ Done |
| Default Chart of Accounts (seed) | ✅ Done |
| Company switcher | ✅ Done |
| Database schema (Phase 2 core) | ✅ Done |
| Dashboard UI (Phase 3) | ✅ Done |
| Live dashboard totals | ⬜ After vouchers |
| Stock items / voucher modules | ⬜ Phase 4 |
| Reports with live data | ⬜ Not started |

**Overall progress:** Phase 0 ✅ · Phase 1 ✅ · Phase 2 ✅ · Phase 3 UI ✅ · Phases 4–8 pending

---

## Phase 0 — Project Foundation ✅ COMPLETE

**Goal:** Clean, professional base for the entire application.

### Completed

1. ✅ Move Next.js app to repository root
2. ✅ Finalize project structure
3. ✅ Set up Tailwind + theme system (Light & Dark)
4. ✅ Theme toggle with localStorage
5. ✅ Basic layout — App Shell (Sidebar + Header)
6. ✅ Dashboard placeholder page
7. ✅ Logo integration
8. ✅ Deployed on Vercel

---

## Phase 1 — Authentication ✅ COMPLETE

**Goal:** Secure login using Supabase Auth.  
**Role:** Accountant only (single-role system).

### Completed

1. ✅ Supabase project (via Vercel integration)
2. ✅ Email authentication (Login + Register)
3. ✅ Route protection (middleware)
4. ✅ Logout
5. ✅ Dashboard accessible only when logged in

---

## Phase 2 — Database, Multi-Company & Default Ledgers ✅ COMPLETE (core)

**Goal:** Multi-company setup, Tally-style default Chart of Accounts, and no-duplicate rules.

### Design document

👉 **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**  
👉 **SQL:** [supabase/phase2_schema.sql](./supabase/phase2_schema.sql)

### Completed

1. ✅ Schema: `companies`, `company_members`, `chart_of_accounts`
2. ✅ RLS policies (data isolated per company membership)
3. ✅ `create_default_ledgers()` — Tally-style groups + ledgers (GST not auto-seeded)
4. ✅ `create_company_with_defaults()` RPC
5. ✅ Uniqueness constraints (ledger name/code per company; company GSTIN)
6. ✅ Onboarding UI (`/onboarding`) — create first / new company
7. ✅ Select-company UI (`/select-company`)
8. ✅ Post-login flow: no company → onboarding; one or more → select / dashboard
9. ✅ Company switcher in header
10. ✅ Middleware: protect app routes; redirect if no company
11. ✅ Tally-style sidebar navigation (Masters / Vouchers / Reports / System)

---

## Navigation structure (sidebar) ✅ IN APP

| Section | Items |
|---------|--------|
| **Overview** | Dashboard |
| **Masters** | Chart of Accounts, Customers, Vendors, Stock Items, Godowns, Tax Rates, Cost Centres |
| **Vouchers** | Sales Invoice, Purchase / Bills, Payment, Receipt, Journal, Contra, Credit Note, Debit Note |
| **Reports** | Day Book, Cash Book, Bank Book, Ledger Statement, Trial Balance, P&L, Balance Sheet, Aged Receivables/Payables, GST Summary, All Reports |
| **System** | Company Profile, Export / Backup, Settings |

**Note:** Expenses voucher removed — use Payment / Purchase / Journal instead.

---

## Phase 3 — Dashboard ✅ UI COMPLETE

**Goal:** Clear overview for the Accountant (active company).

### Completed

1. ✅ Welcome + active company name
2. ✅ Stat cards: Receivables, Payables, Income, Expense
3. ✅ Cash & bank overview block
4. ✅ Quick actions (invoice, bill, payment, receipt, masters, journal)
5. ✅ Income vs expense chart placeholder (ready for live data)
6. ✅ Recent invoices / bills empty states with CTAs
7. ✅ Report shortcuts
8. ✅ Light / Dark theme support

### Pending (after Phase 4 vouchers)

- Live totals from invoices, bills, payments
- Real chart data
- Recent lists populated from database

---

## Phase 4 — Voucher Entry (Sales, Purchase & Stock Items)

**Goal:** Full focus on voucher entry. Sales and Purchase need **stock/items**, customers, vendors, and tax rates as foundations.

**Status:** ⬜ Not started

### 4A — Masters required for vouchers (build first)

| Master | Purpose |
|--------|--------|
| **Stock Items** | Product/service lines on sales & purchase vouchers |
| **Customers** | Parties for Sales Invoice, Receipt, Credit Note |
| **Vendors** | Parties for Purchase/Bills, Payment, Debit Note |
| **Tax Rates** | GST % for line items (CGST/SGST/IGST logic later) |

#### Stock Items (essential)

- Create / edit / delete item (per company)
- Fields: name, code/SKU, unit (Nos, Kg, etc.), HSN/SAC (optional), sale rate, purchase rate, tax rate link, item type (goods / service)
- **No duplicate** name or code within the same company
- Optional: opening stock qty/value (basic; full inventory valuation later)
- List + search UI (`/stock-items`)

#### Customers & Vendors

- Name, GSTIN, phone, email, billing address, state (for GST place of supply)
- Unique name / GSTIN per company where applicable
- List + create/edit UI

#### Tax Rates

- Name, rate %, type (CGST/SGST/IGST/combined or simple %)
- Used on invoice/bill line items

### 4B — Core vouchers

#### Sales Invoice

- Create / edit / delete (Draft → Sent → Paid / Overdue)
- Customer selection (+ quick create)
- **Multiple line items** from Stock Items (qty, rate, discount, tax)
- Auto totals + GST calculation
- Unique invoice number per company
- PDF generation (can be Phase 4 end or Phase 8)
- Optional: email send

#### Purchase / Bills

- Create / edit / delete
- Vendor selection (+ quick create)
- **Multiple line items** from Stock Items
- Tax calculation
- Unique bill number per company
- Status: unpaid / partial / paid

#### Payment & Receipt

- Payment: pay vendor / expense ledger / other (against bill or on account)
- Receipt: receive from customer (against invoice or on account)
- Link to cash/bank ledger

#### Journal, Contra, Credit Note, Debit Note

- Journal: free Dr/Cr lines
- Contra: cash ↔ bank
- Credit Note: sales return / reduction (link customer + optional items)
- Debit Note: purchase return / claim (link vendor + optional items)

### 4C — Database (Phase 4 SQL)

Tables to add (all scoped by `company_id` + RLS):

- `stock_items`
- `customers`
- `vendors`
- `tax_rates`
- `invoices` + `invoice_items`
- `bills` + `bill_items`
- `payments` / `receipts` (or unified `vouchers` + lines — decide at implementation)
- Supporting voucher tables for journal / contra / credit note / debit note as needed

### 4D — Implementation order (recommended)

1. SQL: `stock_items`, `customers`, `vendors`, `tax_rates` + RLS + uniqueness
2. UI: Stock Items list + form
3. UI: Customers, Vendors, Tax Rates
4. SQL + UI: Sales Invoice (with item lines)
5. SQL + UI: Purchase / Bills (with item lines)
6. Payment & Receipt
7. Journal, Contra, Credit Note, Debit Note
8. Wire dashboard live counts where possible

### Out of scope for Phase 4 (later)

- Full inventory valuation, godown transfer, stock journal
- Batch / serial tracking
- Advanced multi-godown stock reports
- Bank reconciliation
- Recurring invoices

---

## Phase 5 — Payments depth & party ledgers

**Goal:** Strengthen payment/receipt allocation and party outstanding.

### Features

- Allocate payments/receipts against multiple invoices/bills
- Party outstanding statements
- Ageing inputs for reports
- Optional receipt/image attachment on payments

**Status:** ⬜ Not started (builds on Phase 4 vouchers)

---

## Phase 6 — Chart of Accounts & Ledger

### Features

- View and manage full Chart of Accounts (built on Phase 2 defaults) — **data already seeded**
- Add custom ledgers (no duplicate names)
- Manual journal entries (if not fully done in Phase 4)
- General ledger / ledger statement view
- Account-wise transaction history
- Trial balance report

**Status:** ⬜ UI not started; backend seed ✅

---

## Phase 7 — Reports & Analytics

### Essential reports

- Day Book, Cash Book, Bank Book
- Profit & Loss (P&L)
- Balance Sheet
- Cash Flow Statement
- GST reports (GSTR-1 / GSTR-3B style summaries)
- Aged receivables / payables
- Stock summary (basic, if items tracked)
- Custom date range filters
- Export to Excel / PDF

**Status:** ⬜ Not started (sidebar links only)

---

## Phase 8 — Polish, Testing & Launch Prep

### Tasks

- Full responsive testing (mobile sidebar)
- Performance optimization
- Error handling and loading states
- Empty states design
- Basic unit and integration tests
- SEO and meta tags
- Environment variables and production config
- Deploy on Vercel ✅ already live
- Optional custom domain

---

## Future Phases (Post-Launch)

- Advanced inventory (godowns, stock transfer, valuation methods)
- Bank reconciliation and automatic import
- Recurring invoices
- Mobile app (React Native / PWA)
- AI-powered insights (expense categorization, cash-flow prediction)
- WhatsApp / email notifications

---

## Recommended Tech Stack

| Area | Technology |
|------|------------|
| Frontend | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Theme | Light + Dark (CSS variables) |
| Backend / DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Role | Single role — Accountant |
| Multi-company | Yes (Phase 2) |
| PDF generation | @react-pdf/renderer or similar |
| Charts | Recharts or Chart.js |
| Deployment | Vercel |

---

## How to Use This Roadmap

- Mark tasks done by changing status to ✅
- Focus on **one phase at a time**
- Phase 2 design: **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**
- After every phase, commit and push to GitHub
- Keep `THEME.md` and this `ROADMAP.md` up to date

---

**Web Power Tech**  
Building reliable software, one step at a time.
