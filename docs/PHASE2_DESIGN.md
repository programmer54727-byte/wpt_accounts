# Phase 2 Design Document — Database, Multi-Company & Default Ledgers

**WPT Accounts** by Web Power Tech  
Linked from: [ROADMAP.md](../ROADMAP.md)

Is document ko pehle padho. Iske basis pe Phase 2 ka implementation hoga.

---

## 1. Goal of Phase 2

1. **Multi-company support** — ek user multiple companies manage kar sake
2. Login ke baad pehla flow: **Company create / select**
3. Har company ke liye **Tally-style default Chart of Accounts (ledgers)** auto-create
4. **Duplicate nahi** — same company me duplicate ledger / item / customer code allow nahi
5. Solid database schema + uniqueness rules

---

## 2. Post-Login Flow (Important)

```
Login / Register
      ↓
User ke paas koi company hai?
      ↓
   NO  →  /onboarding  (Create first company)
      ↓
   YES →  /select-company  (agar 1 se zyada)  YA  directly /dashboard (agar sirf 1)
      ↓
Active company set (cookie / local context)
      ↓
Dashboard + modules (sirf us company ka data)
```

### Rules

- Har logged-in user **Accountant** role me hai (single role — already decided)
- User multiple companies create kar sakta hai
- Ek time pe **ek active company** select rahegi
- Sidebar / Dashboard hamesha **active company** ke data dikhayega
- Company switch option header / settings me rahega

---

## 3. Multi-Company Model

### Tables (high level)

| Table | Purpose |
|-------|--------|
| `companies` | Company master (name, GSTIN, address, FY, etc.) |
| `company_members` | User ↔ Company link (kaun si company access kar sakta hai) |
| `chart_of_accounts` | Ledgers (per company) |
| `customers` | Customers (per company) |
| `vendors` | Vendors (per company) |
| `invoices` | Sales invoices (per company) |
| `expenses` / `bills` | Expenses & purchase bills (per company) |
| `tax_rates` | GST rates (per company or global defaults) |

### Company fields (suggested)

- `id` (UUID)
- `name` (unique per user? or globally unique slug)
- `legal_name`
- `gstin` (optional, unique if present)
- `pan`
- `address`, `city`, `state`, `pincode`, `country`
- `financial_year_start` (e.g. 1 April)
- `currency` (default INR)
- `created_by` (user id)
- `created_at`, `updated_at`

### company_members

- `company_id`
- `user_id`
- `role` → abhi sirf `accountant` (future-proof column)
- Unique: `(company_id, user_id)` — same user same company me do baar nahi

---

## 4. Default Ledgers (Tally-style Chart of Accounts)

Jab **nayi company create** hoti hai, system automatically yeh default ledgers bana dega.

Structure Tally jaisa: **Groups → Ledgers**

### 4.1 Primary Groups (System, non-deletable)

| Group Name | Nature | Type |
|------------|--------|------|
| Capital Account | Liability | Group |
| Current Assets | Asset | Group |
| Current Liabilities | Liability | Group |
| Fixed Assets | Asset | Group |
| Investments | Asset | Group |
| Loans (Liability) | Liability | Group |
| Suspense Account | Asset | Group |
| Sales Accounts | Income | Group |
| Purchase Accounts | Expense | Group |
| Direct Expenses | Expense | Group |
| Indirect Expenses | Expense | Group |
| Direct Incomes | Income | Group |
| Indirect Incomes | Income | Group |
| Duties & Taxes | Liability | Group |
| Bank Accounts | Asset | Sub-group under Current Assets |
| Cash-in-Hand | Asset | Sub-group under Current Assets |
| Sundry Debtors | Asset | Sub-group under Current Assets |
| Sundry Creditors | Liability | Sub-group under Current Liabilities |
| Stock-in-Hand | Asset | Sub-group under Current Assets |

### 4.2 Default Ledgers (auto-created with company)

| Ledger Name | Under Group | Notes |
|-------------|-------------|-------|
| Capital | Capital Account | Opening capital |
| Cash | Cash-in-Hand | Default cash |
| Bank Account | Bank Accounts | Placeholder — user rename/add more |
| Sales | Sales Accounts | Default sales |
| Purchase | Purchase Accounts | Default purchase |
| CGST | Duties & Taxes | GST |
| SGST | Duties & Taxes | GST |
| IGST | Duties & Taxes | GST |
| Input CGST | Duties & Taxes | Input tax credit |
| Input SGST | Duties & Taxes | Input tax credit |
| Input IGST | Duties & Taxes | Input tax credit |
| Round Off | Indirect Expenses | Invoice round-off |
| Discount Allowed | Indirect Expenses | |
| Discount Received | Indirect Incomes | |
| Freight Charges | Direct Expenses | |
| Salary | Indirect Expenses | |
| Rent | Indirect Expenses | |
| Electricity | Indirect Expenses | |
| Office Expenses | Indirect Expenses | |
| Profit & Loss A/c | — | System |

> Exact list implementation time pe refine ho sakti hai, lekin principle same: **Tally-like defaults on company create**.

### 4.3 Rules for Ledgers

1. **System ledgers** (Cash, CGST, SGST, IGST, P&L, etc.) → delete nahi, rename limited
2. User **naye ledgers** add kar sakta hai under existing groups
3. **Duplicate ledger name** same company me **allowed nahi**
4. Ledger code (optional) bhi unique per company
5. Groups hierarchy maintain (parent_id)

---

## 5. No Duplicate Rules (Uniqueness)

Har company ke andar yeh unique rahenge:

| Entity | Unique on |
|--------|-----------|
| Ledger name | `(company_id, name)` |
| Ledger code (if used) | `(company_id, code)` |
| Customer name / code | `(company_id, name)` or `(company_id, code)` |
| Vendor name / code | `(company_id, name)` or `(company_id, code)` |
| Invoice number | `(company_id, invoice_number)` |
| GSTIN on customer/vendor | `(company_id, gstin)` where gstin not null |
| Company GSTIN | globally unique if provided |

### Implementation

- Database: `UNIQUE` constraints + indexes
- App: create/update se pehle check + clear error message  
  Example: *"Ledger already exists with this name in this company"*

---

## 6. Onboarding Screens (UI)

### A. `/onboarding` — Create Company (first time)

Fields:
- Company Name *
- Legal Name
- GSTIN (optional, validated format)
- PAN (optional)
- Address, State, Pincode
- Financial Year Start (default 1 April)
- Currency (default INR)

Actions:
- Create Company → auto-create default ledgers → set as active → redirect `/dashboard`

### B. `/select-company` — Multiple companies

- List of companies user belongs to
- Click → set active company → dashboard
- Button: **+ Create New Company**

### C. Header / Settings

- Active company name dikhe
- Switch company dropdown
- Manage companies

---

## 7. Data Isolation

- Har query me `company_id = active_company_id` filter
- Row Level Security (RLS) on Supabase:
  - User sirf un companies ka data dekh sake jisme `company_members` me entry hai
- Middleware / layout: active company resolve kare (cookie ya user preference table)

---

## 8. Suggested Implementation Order (Phase 2)

1. **Schema SQL** — companies, company_members, chart_of_accounts (+ groups)
2. **RLS policies**
3. **Seed function** — `create_default_ledgers(company_id)`
4. **Onboarding page** — create first company
5. **Select company page**
6. **Active company context** (React context + cookie)
7. **Uniqueness** constraints + API validation
8. Protect dashboard: company required, warna onboarding pe bhejo

---

## 9. Out of Scope for Phase 2 (baad me)

- Full invoice/expense modules (Phase 4+)
- Bank reconciliation
- Inventory / stock items master (alag phase)
- Multi-currency complex accounting
- Godown / branch within company

---

## 10. Decisions Summary (Confirm before coding)

| Topic | Decision |
|-------|----------|
| Roles | Single: Accountant only |
| Multi-company | Yes |
| First screen after login | Company create / select |
| Default ledgers | Tally-style, auto on company create |
| Duplicate ledgers | Not allowed (per company) |
| Duplicate customers/vendors | Not allowed (per company) |
| System ledgers deletable? | No |
| Currency default | INR |
| FY default | 1 April |

---

## 11. Next Step

Is document ko padho aur confirm / change batao:

- Default ledger list me kuch add/remove?
- Company fields me kuch extra chahiye?
- Onboarding flow theek hai?

Confirmation ke baad Phase 2 implementation shuru hogi (schema → onboarding → default ledgers).

---

**Web Power Tech**  
Document version: 1.0 — October 2026
