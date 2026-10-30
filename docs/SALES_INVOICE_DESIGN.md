# Sales Invoice — Design & Tally Parity

**Goal:** Move from basic tax invoice entry toward a Tally-style sales bill.

---

## Current implementation (as of Oct 2026)

| Feature | Status |
|---------|--------|
| Customer (search + quick add) | ✅ |
| Invoice number / date / due date / status | ✅ |
| Place of supply | ✅ |
| Stock line items (qty, rate, disc, HSN, GST %) | ✅ |
| Searchable item + create | ✅ |
| Keyboard nav (type → arrows → Enter) | ✅ |
| Additional ledger charges (transport, fitting, etc.) | ✅ |
| Line GST + grand total | ✅ |
| Notes | ✅ |
| CGST / SGST / IGST split | ⬜ In progress |
| Header refs (order, challan, credit days) | ⬜ In progress |
| Sales ledger on voucher | ⬜ In progress |
| Stock outward on save | ⬜ Planned |
| Bill-wise party outstanding | ⬜ Planned |
| PDF / print GST invoice | ⬜ Planned |

**Rough Tally-like sales bill progress:** ~40% after current sprint targets.

---

## Tally comparison (what still matters)

### High priority

1. **CGST+SGST vs IGST** — compare company state vs place of supply
2. **Sales ledger** — which income ledger is credited
3. **Order / challan / ref + credit days**
4. **Round off** (ledger charge or auto)
5. **Stock out** when invoice is saved (non-draft)
6. **Bill-wise outstanding** for receipts
7. **PDF print**

### Medium

- Shipping address, transport / e-way fields
- Godown on line, batch
- Voucher-level discount, cost centre, narration

### Later

- TCS/TDS, RCM, export/SEZ, e-invoice IRN

---

## Data model extensions

### `invoices` (header)

| Column | Purpose |
|--------|--------|
| `order_no`, `challan_no`, `ref_no` | Commercial references |
| `credit_days` | Optional; can drive due date |
| `sales_ledger_id` | FK → chart_of_accounts |
| `cgst_total`, `sgst_total`, `igst_total` | Tax split totals |
| `taxable_total` | Sum of taxable amounts |

### `invoice_items` (lines + charges)

| Column | Purpose |
|--------|--------|
| `cgst_amount`, `sgst_amount`, `igst_amount` | Per-line tax split |
| `line_type` | `item` \| `charge` (already) |
| `ledger_id` | Charge lines (already) |

### GST rule

```
if normalize(company.state) == normalize(place_of_supply):
  cgst = tax/2, sgst = tax/2, igst = 0   # intra-state
else:
  igst = tax, cgst = 0, sgst = 0         # inter-state
```

---

## Implementation order (this sprint)

1. SQL migration — header + tax split columns
2. UI — order/challan/ref, credit days, sales ledger
3. UI — show CGST / SGST / IGST on totals
4. Save split amounts on header + lines
5. Next: stock movement, PDF, bill-wise

---

## SQL files

- [supabase/phase4_invoices.sql](../supabase/phase4_invoices.sql)
- [supabase/phase4_invoice_ledger_charges.sql](../supabase/phase4_invoice_ledger_charges.sql)
- [supabase/phase4_invoice_gst_header.sql](../supabase/phase4_invoice_gst_header.sql) — run for this sprint

---

**Web Power Tech**
