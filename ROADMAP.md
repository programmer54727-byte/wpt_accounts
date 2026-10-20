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
| App shell (Sidebar) | ✅ Done |
| Authentication | ✅ Done |
| Database / Supabase schema | ⬜ Phase 2 |
| Core accounting modules | ⬜ Not started |

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

## Phase 2 — Database, Multi-Company & Default Ledgers

**Goal:** Multi-company setup, Tally-style default Chart of Accounts, and no-duplicate rules.

### Design document (read first)

👉 **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**

That document covers:

- Post-login company create / select flow
- Multi-company tables (`companies`, `company_members`)
- Tally-style **default ledgers** (auto-created for each new company)
- **No-duplicate** rules (ledger, customer, vendor, invoice number)
- RLS and data isolation per company
- Suggested implementation order

### Key deliverables

1. Schema: `companies`, `company_members`, `chart_of_accounts` (groups + ledgers)
2. Onboarding UI: create first company after login
3. Select-company UI (when the user has multiple companies)
4. Seed default ledgers (Cash, Bank, Sales, Purchase, expenses, etc. — see design doc; GST ledgers are not auto-seeded)
5. Uniqueness constraints in the database and app validation
6. Active company context for the whole app

### Also prepare for later modules

- `customers` / `vendors` tables (unique per company)
- `tax_rates`
- Foundation for invoices / expenses (full modules in Phase 4–5)

---

## Phase 3 — Dashboard

**Goal:** Clear overview for the Accountant (active company).

### Features

- Total receivables / payables
- Cash balance overview
- Recent invoices and expenses
- Monthly income vs expense chart
- Quick actions (Create Invoice, Add Expense)
- Light / Dark theme support

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

---

## Phase 5 — Expense & Bill Management

### Features

- Record expenses
- Upload receipts
- Categorize expenses (link to ledgers)
- Vendor management
- Bill tracking (accounts payable)
- Payment recording

---

## Phase 6 — Chart of Accounts & Ledger

### Features

- View and manage full Chart of Accounts (built on Phase 2 defaults)
- Add custom ledgers (no duplicate names)
- Manual journal entries
- General ledger view
- Account-wise transaction history
- Trial balance report

---

## Phase 7 — Reports & Analytics

### Essential reports

- Profit & Loss (P&L)
- Balance Sheet
- Cash Flow Statement
- GST reports (GSTR-1 / GSTR-3B style summaries)
- Aged receivables / payables
- Custom date range filters
- Export to Excel / PDF

---

## Phase 8 — Polish, Testing & Launch Prep

### Tasks

- Full responsive testing
- Performance optimization
- Error handling and loading states
- Empty states design
- Basic unit and integration tests
- SEO and meta tags
- Environment variables and production config
- Deploy on Vercel
- Optional custom domain

---

## Future Phases (Post-Launch)

- Inventory management
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
- Before Phase 2 implementation, read **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**
- After every phase, commit and push to GitHub
- Keep `THEME.md` and this `ROADMAP.md` up to date

---

**Web Power Tech**  
Building reliable software, one step at a time.
