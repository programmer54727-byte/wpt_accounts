# Phase 2 Design Document — Database, Multi-Company & Default Ledgers

**WPT Accounts** by Web Power Tech  
Linked from: [ROADMAP.md](../ROADMAP.md)

Read this document before implementation. Phase 2 work will follow this design.

---

## 1. Goals of Phase 2

1. **Multi-company support** — one user can manage multiple companies
2. After login, the first flow is **company create / select**
3. For every new company, auto-create a **Tally-style default Chart of Accounts (ledgers)**
4. **No duplicates** — within the same company, duplicate ledger / item / customer codes are not allowed
5. Solid database schema with clear uniqueness rules

---

## 2. Post-Login Flow (Important)

```
Login / Register
      ↓
Does the user have any company?
      ↓
   NO  →  /onboarding  (Create first company)
      ↓
   YES →  /select-company  (if more than one)
           OR directly /dashboard (if only one)
      ↓
Active company is set (cookie / app context)
      ↓
Dashboard + modules (data for active company only)
```

### Rules

- Every logged-in user has the **Accountant** role (single role — already decided)
- A user can create multiple companies
- Only **one active company** is selected at a time
- Sidebar and Dashboard always show data for the **active company**
- Company switch will be available in the header / settings

---

## 3. Multi-Company Model

### Tables (high level)

| Table | Purpose |
|-------|--------|
| `companies` | Company master (name, GSTIN, address, financial year, etc.) |
| `company_members` | Link between user and company (who can access which company) |
| `chart_of_accounts` | Ledgers (per company) |
| `customers` | Customers (per company) |
| `vendors` | Vendors (per company) |
| `invoices` | Sales invoices (per company) |
| `expenses` / `bills` | Expenses and purchase bills (per company) |
| `tax_rates` | GST rates (per company or shared defaults) |

### Suggested company fields

- `id` (UUID)
- `name`
- `legal_name`
- `gstin` (optional; unique when present)
- `pan`
- `address`, `city`, `state`, `pincode`, `country`
- `financial_year_start` (e.g. 1 April)
- `currency` (default INR)
- `created_by` (user id)
- `created_at`, `updated_at`

### company_members

- `company_id`
- `user_id`
- `role` → currently only `accountant` (column kept for future use)
- Unique constraint: `(company_id, user_id)` — same user cannot be added twice to the same company

---

## 4. Default Ledgers (Tally-style Chart of Accounts)

When a **new company is created**, the system automatically creates the default ledgers below.

Structure follows Tally: **Groups → Ledgers**

### 4.1 Primary Groups (system, non-deletable)

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

### 4.2 Default Ledgers (auto-created with each company)

| Ledger Name | Under Group | Notes |
|-------------|-------------|-------|
| Capital | Capital Account | Opening capital |
| Cash | Cash-in-Hand | Default cash |
| Bank Account | Bank Accounts | Placeholder — user can rename or add more |
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
| Profit & Loss A/c | — | System ledger |

> The exact list may be refined during implementation. The principle stays the same: **Tally-like defaults on company create**.

### 4.3 Rules for Ledgers

1. **System ledgers** (Cash, CGST, SGST, IGST, Profit & Loss A/c, etc.) cannot be deleted; rename is limited or disabled
2. Users can **add new ledgers** under existing groups
3. **Duplicate ledger names** within the same company are **not allowed**
4. Optional ledger code must also be unique per company
5. Group hierarchy is maintained via `parent_id`

---

## 5. No-Duplicate Rules (Uniqueness)

Within each company, the following must be unique:

| Entity | Unique on |
|--------|-----------|
| Ledger name | `(company_id, name)` |
| Ledger code (if used) | `(company_id, code)` |
| Customer name / code | `(company_id, name)` or `(company_id, code)` |
| Vendor name / code | `(company_id, name)` or `(company_id, code)` |
| Invoice number | `(company_id, invoice_number)` |
| Customer/Vendor GSTIN | `(company_id, gstin)` where gstin is not null |
| Company GSTIN | globally unique when provided |

### Implementation

- Database: `UNIQUE` constraints and indexes
- Application: validate before create/update and show a clear error  
  Example: *"A ledger with this name already exists in this company"*

---

## 6. Onboarding Screens (UI)

### A. `/onboarding` — Create Company (first time)

Fields:

- Company Name * (required)
- Legal Name
- GSTIN (optional, format validated)
- PAN (optional)
- Address, State, Pincode
- Financial Year Start (default: 1 April)
- Currency (default: INR)

Actions:

- Create Company → auto-create default ledgers → set as active company → redirect to `/dashboard`

### B. `/select-company` — Multiple companies

- List of companies the user belongs to
- Click a company → set as active → go to dashboard
- Button: **+ Create New Company**

### C. Header / Settings

- Show active company name
- Company switch dropdown
- Manage companies

---

## 7. Data Isolation

- Every query is filtered by `company_id = active_company_id`
- Row Level Security (RLS) on Supabase:
  - Users can only access data for companies where they have a row in `company_members`
- Middleware / layout resolves the active company (cookie or user preference table)

---

## 8. Suggested Implementation Order (Phase 2)

1. **Schema SQL** — `companies`, `company_members`, `chart_of_accounts` (groups + ledgers)
2. **RLS policies**
3. **Seed function** — `create_default_ledgers(company_id)`
4. **Onboarding page** — create first company
5. **Select company page**
6. **Active company context** (React context + cookie)
7. **Uniqueness** — DB constraints + app validation
8. Protect dashboard: if no company, redirect to onboarding

---

## 9. Out of Scope for Phase 2 (later phases)

- Full invoice and expense modules (Phase 4+)
- Bank reconciliation
- Inventory / stock item master (separate phase)
- Complex multi-currency accounting
- Godown / branch within a company

---

## 10. Decisions Summary (Confirm before coding)

| Topic | Decision |
|-------|----------|
| Roles | Single: Accountant only |
| Multi-company | Yes |
| First screen after login | Company create / select |
| Default ledgers | Tally-style, auto-created on company create |
| Duplicate ledgers | Not allowed (per company) |
| Duplicate customers/vendors | Not allowed (per company) |
| System ledgers deletable? | No |
| Default currency | INR |
| Default financial year start | 1 April |

---

## 11. Next Step

Review this document and confirm or request changes:

- Add or remove items from the default ledger list?
- Extra fields needed on company?
- Is the onboarding flow correct?

After confirmation, Phase 2 implementation will start (schema → onboarding → default ledgers).

---

**Web Power Tech**  
Document version: 1.1 — October 2026
