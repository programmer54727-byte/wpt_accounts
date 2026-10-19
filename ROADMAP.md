# WPT Accounts — Product Roadmap

**Cloud-based Accounting Application by Web Power Tech**

This document outlines the complete development roadmap — from current status to a production-ready product.  
Follow the phases in order for best results.

---

## Current Status (as of October 2026)

| Item                    | Status          |
|-------------------------|-----------------|
| Repository created      | ✅ Done         |
| README + Theme docs     | ✅ Done         |
| Next.js app scaffold    | ✅ Done (`my-app`) |
| Official Logo           | ✅ Added        |
| Project structure       | 🔄 In progress  |
| Authentication          | ⬜ Not started  |
| Database / Supabase     | ⬜ Not started  |
| Core Accounting modules | ⬜ Not started  |

---

## Phase 0 — Project Foundation (Week 1)

**Goal:** Clean, professional base for the entire application.

### Steps:

1. **Move Next.js app to root (Recommended)**
   - Currently the app is inside `my-app/`
   - Move all files from `my-app/` to repository root for cleaner structure
   - Update paths and commit

2. **Finalize Project Structure**
   ```
   /
   ├── app/                  # Next.js App Router
   ├── components/           # Reusable UI components
   ├── lib/                  # Utilities, Supabase client, helpers
   ├── types/                # TypeScript types
   ├── public/               # Static assets (logo, icons)
   ├── styles/               # Global styles (if needed)
   ├── ROADMAP.md
   ├── THEME.md
   └── README.md
   ```

3. **Setup Tailwind + Theme System**
   - Install and configure Tailwind CSS properly
   - Implement Light & Dark mode using the colors defined in `THEME.md`
   - Add theme toggle component
   - Persist theme preference in `localStorage`

4. **Add shadcn/ui (Recommended)**
   - Initialize shadcn/ui
   - Install core components: Button, Card, Input, Dialog, Dropdown, Table, etc.

5. **Basic Layout**
   - Create App Shell (Sidebar + Top Navbar)
   - Responsive design (Desktop + Mobile)
   - Logo integration in Navbar

---

## Phase 1 — Authentication & User Management (Week 2)

**Goal:** Secure login system using Supabase Auth.

### Steps:

1. Create Supabase project
2. Configure Authentication (Email + Google provider)
3. Create Auth pages:
   - Login
   - Register / Sign up
   - Forgot Password
   - Reset Password
4. Protect routes (middleware)
5. User profile page (basic)
6. Role system foundation (Admin / Accountant / Viewer)

---

## Phase 2 — Database & Core Schema (Week 2–3)

**Goal:** Solid database design for accounting.

### Key Tables to design:

- `organizations` / `companies`
- `users` (linked to Supabase Auth)
- `chart_of_accounts`
- `customers` / `vendors`
- `invoices` + `invoice_items`
- `expenses` / `bills`
- `transactions` / `journal_entries`
- `payments`
- `tax_rates` (GST focused for India)

### Steps:

1. Design full database schema
2. Write SQL migrations / Supabase schema
3. Enable Row Level Security (RLS)
4. Create TypeScript types from schema
5. Setup Supabase client in the app

---

## Phase 3 — Dashboard (Week 3)

**Goal:** Beautiful and useful overview for users.

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

---

## Phase 5 — Expense & Bill Management (Week 5–6)

### Features:

- Record expenses
- Upload receipts
- Categorize expenses
- Vendor management
- Bill tracking (Accounts Payable)
- Payment recording

---

## Phase 6 — Chart of Accounts & Ledger (Week 6–7)

### Features:

- Full Chart of Accounts (Assets, Liabilities, Equity, Income, Expenses)
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

- Multi-company support
- Inventory management
- Bank reconciliation + automatic import
- Recurring invoices
- Team collaboration & permissions
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
| PDF Generation    | @react-pdf/renderer or similar|
| Charts            | Recharts or Chart.js          |
| Deployment        | Vercel                        |

---

## How to Use This Roadmap

- Mark tasks as done by changing `⬜` → `✅`
- Focus on **one phase at a time**
- After every phase, commit and push to GitHub
- Keep `THEME.md` and this `ROADMAP.md` updated

---

**Web Power Tech**  
Building reliable software, one step at a time.
