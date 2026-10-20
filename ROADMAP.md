# WPT Accounts — Product Roadmap

**Cloud-based Accounting Application by Web Power Tech**

This document outlines the complete development roadmap — from current status to a production-ready product.  
Follow the phases in order for best results.

**Important notes:**

- This application has **only one role — Accountant**. There are no Admin / Viewer / multi-role permissions. Every logged-in user is an Accountant with full access.
- **Multi-company** is supported from Phase 2. See the design document linked below.

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
| Core accounting modules (invoices, etc.) | ⬜ Not started |
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

### Optional / deferred (can ship with later phases)

- `customers` / `vendors` / `tax_rates` tables (before invoice module)
- Chart of Accounts UI page (`/ledgers`) — full CRUD in Phase 6

---

## Navigation structure (sidebar) ✅ IN APP

| Section | Items |
|---------|--------|
| **Overview** | Dashboard |
| **Masters** | Chart of Accounts, Customers, Vendors, Stock Items, Godowns, Tax Rates, Cost Centres |
| **Vouchers** | Sales Invoice, Purchase / Bills, Payment, Receipt, Journal, Contra, Credit Note, Debit Note, Expenses |
| **Reports** | Day Book, Cash Book, Bank Book, Ledger Statement, Trial Balance, P&L, Balance Sheet, Aged Receivables/Payables, GST Summary, All Reports |
| **System** | Company Profile, Export / Backup, Settings |

Routes are wired in the sidebar; page UIs will be built phase by phase.

---

## Phase 3 — Dashboard ✅ UI COMPLETE

**Goal:** Clear overview for the Accountant (active company).

### Completed

1. ✅ Welcome + active company name
2. ✅ Stat cards: Receivables, Payables, Income, Expense
3. ✅ Cash & bank overview block
4. ✅ Quick actions (invoice, bill, expense, payment, receipt, masters, journal)
5. ✅ Income vs expense chart placeholder (ready for live data)
6. ✅ Recent invoices / expenses empty states with CTAs
7. ✅ Report shortcuts
8. ✅ Light / Dark theme support

### Pending (after Phase 4–5 vouchers)

- Live totals from invoices, bills, payments
- Real chart data
- Recent lists populated from database

---

## Phase 4 — Invoice Module

**Most important module for an accounting product.**

### Features

- Create / edit / delete invoices
- Multiple line items
- Customer selection / creation
- Tax calculation (GST)
- Invoice status (Draft, Sent, Paid, Overdue)
- PDF generation
- Send invoice by email
- Record payment against invoice
- Unique invoice number per company

**Status:** ⬜ Not started (sidebar link only)

---

## Phase 5 — Expense & Bill Management

### Features

- Record expenses
- Upload receipts
- Categorize expenses (link to ledgers)
- Vendor management
- Bill tracking (accounts payable)
- Payment / receipt vouchers

**Status:** ⬜ Not started (sidebar links only)

---

## Phase 6 — Chart of Accounts & Ledger

### Features

- View and manage full Chart of Accounts (built on Phase 2 defaults) — **data already seeded**
- Add custom ledgers (no duplicate names)
- Manual journal entries
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

- Inventory management (Stock Items, Godowns — menu reserved)
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
