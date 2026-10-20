# WPT Accounts — Product Roadmap

**Cloud-based Accounting Application by Web Power Tech**

This document outlines the complete development roadmap — from current status to a production-ready product.  
Follow the phases in order for best results.

**Important Note:**  
This application has **only one role — Accountant**.  
There are no Admin / Viewer / multi-role permissions. Every logged-in user is an Accountant with full access to the system.

**Multi-company:** Supported from Phase 2. See design doc below.

---

## Current Status (as of October 2026)

| Item                    | Status          |
|-------------------------|-----------------|
| Repository created      | ✅ Done         |
| README + Theme docs     | ✅ Done         |
| Next.js app scaffold    | ✅ Done         |
| Official Logo           | ✅ Done         |
| Project structure       | ✅ Done         |
| Theme (Light/Dark)      | ✅ Done         |
| App Shell (Sidebar)     | ✅ Done         |
| Authentication          | ✅ Done         |
| Database / Supabase     | ⬜ Phase 2      |
| Core Accounting modules | ⬜ Not started  |

---

## Phase 0 — Project Foundation ✅ COMPLETE

**Goal:** Clean, professional base for the entire application.

### Completed:

1. ✅ Move Next.js app to root
2. ✅ Finalize project structure
3. ✅ Setup Tailwind + Theme System (Light & Dark)
4. ✅ Theme toggle with localStorage
5. ✅ Basic Layout — App Shell (Sidebar + Header)
6. ✅ Dashboard placeholder page
7. ✅ Logo integration
8. ✅ Deployed on Vercel

---

## Phase 1 — Authentication ✅ COMPLETE

**Goal:** Secure login system using Supabase Auth.  
**Role:** Only Accountant (single role system)

### Completed:

1. ✅ Supabase project (via Vercel integration)
2. ✅ Email auth (Login + Register)
3. ✅ Route protection (middleware)
4. ✅ Logout
5. ✅ Dashboard accessible only when logged in

---

## Phase 2 — Database, Multi-Company & Default Ledgers

**Goal:** Multi-company setup, Tally-style default Chart of Accounts, no duplicates.

### Design Document (READ FIRST)

👉 **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)**

Is document me detail hai:

- Login ke baad company create / select flow
- Multi-company tables (`companies`, `company_members`)
- Tally-style **default ledgers** (auto-create on new company)
- **No duplicate** rules (ledger, customer, vendor, invoice no.)
- RLS + data isolation per company
- Implementation order

### Key deliverables

1. Schema: companies, company_members, chart_of_accounts (groups + ledgers)
2. Onboarding UI: create first company after login
3. Select-company UI (multiple companies)
4. Seed default ledgers (Cash, Bank, Sales, Purchase, CGST, SGST, IGST, …)
5. Uniqueness constraints in DB + app validation
6. Active company context for entire app

### Also prepare for later modules

- customers / vendors tables (with unique per company)
- tax_rates
- Foundation for invoices / expenses (full modules in Phase 4–5)

---

## Phase 3 — Dashboard (Week 3)

**Goal:** Beautiful and useful overview for the Accountant (active company).

### Features:

- Total Receivables / Payables
- Cash balance overview
- Recent invoices & expenses
- Monthly income vs expense chart
- Quick action buttons (Create Invoice, Add Expense)
- Dark / Light theme support

---

## Phase 4 — Invoice Module (Week 4–5)

**Most important module for any accounting software.**

### Features:

- Create / Edit / Delete Invoice
- Add multiple line items
- Customer selection / creation
- Tax calculation (GST)
- Invoice status (Draft, Sent, Paid, Overdue)
- Generate PDF
- Send invoice via email
- Record payment against invoice
- Unique invoice number per company

---

## Phase 5 — Expense & Bill Management (Week 5–6)

### Features:

- Record expenses
- Upload receipts
- Categorize expenses (link to ledgers)
- Vendor management
- Bill tracking (Accounts Payable)
- Payment recording

---

## Phase 6 — Chart of Accounts & Ledger (Week 6–7)

### Features:

- View / manage full Chart of Accounts (built on Phase 2 defaults)
- Add custom ledgers (no duplicate names)
- Manual Journal Entries
- General Ledger view
- Account-wise transaction history
- Trial Balance report

---

## Phase 7 — Reports & Analytics (Week 7–8)

### Essential Reports:

- Profit & Loss (P&L)
- Balance Sheet
- Cash Flow Statement
- GST Reports (GSTR-1, GSTR-3B style summary)
- Aged Receivables / Payables
- Custom date range filters
- Export to Excel / PDF

---

## Phase 8 — Polish, Testing & Launch Prep (Week 8–10)

### Tasks:

- Full responsive testing
- Performance optimization
- Error handling & loading states
- Empty states design
- Basic unit + integration tests
- SEO & meta tags
- Environment variables & production config
- Deploy to Vercel
- Connect custom domain (optional)

---

## Future Phases (Post-Launch)

- Inventory management
- Bank reconciliation + automatic import
- Recurring invoices
- Mobile app (React Native / PWA)
- AI-powered insights (expense categorization, cashflow prediction)
- WhatsApp / Email notifications

---

## Recommended Tech Stack (Final)

| Area              | Technology                    |
|-------------------|-------------------------------|
| Frontend          | Next.js 15 (App Router)       |
| Language          | TypeScript                    |
| Styling           | Tailwind CSS + shadcn/ui      |
| Theme             | Light + Dark (CSS variables)  |
| Backend / DB      | Supabase (PostgreSQL)         |
| Auth              | Supabase Auth                 |
| Role              | Single Role — Accountant      |
| Multi-company     | Yes (Phase 2)                 |
| PDF Generation    | @react-pdf/renderer or similar|
| Charts            | Recharts or Chart.js          |
| Deployment        | Vercel                        |

---

## How to Use This Roadmap

- Mark tasks as done by changing `⬜` → `✅`
- Focus on **one phase at a time**
- Phase 2 se pehle **[docs/PHASE2_DESIGN.md](./docs/PHASE2_DESIGN.md)** padho
- After every phase, commit and push to GitHub
- Keep `THEME.md` and this `ROADMAP.md` updated

---

**Web Power Tech**  
Building reliable software, one step at a time.
