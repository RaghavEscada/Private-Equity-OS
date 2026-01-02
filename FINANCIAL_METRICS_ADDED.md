# Financial Metrics Feature

## What Was Added

Added comprehensive financial metrics tracking and visualization for PE deal analysis.

## Database Changes

### New Columns in `deals` Table (26 metrics)

Run `add_financial_metrics.sql` to add:

**Revenue & Growth:**
- `arr` - Annual Recurring Revenue
- `arr_growth_rate` - YoY ARR growth %
- `gross_margin` - Gross margin %
- `ebitda_margin` - EBITDA margin %

**Unit Economics:**
- `cac` - Customer Acquisition Cost
- `ltv` - Lifetime Value
- `ltv_cac_ratio` - LTV/CAC ratio
- `payback_period_months` - CAC payback period

**Retention & Growth:**
- `net_revenue_retention` - NRR %
- `gross_revenue_retention` - GRR %
- `churn_rate` - Monthly churn %
- `rule_of_40` - Growth + EBITDA margin

**Customer Metrics:**
- `customer_count` - Total customers
- `average_contract_value` - ACV

**Operational:**
- `employee_count` - Total employees
- `revenue_per_employee` - Revenue per FTE

**Cash & Runway:**
- `cash_balance` - Current cash
- `burn_rate` - Monthly burn
- `runway_months` - Months of runway
- `total_funding` - Total funding raised
- `last_round_valuation` - Last round valuation
- `debt_balance` - Outstanding debt

**Valuation Multiples:**
- `ev_revenue_multiple` - EV/Revenue
- `ev_ebitda_multiple` - EV/EBITDA

**Dates:**
- `fiscal_year_end` - FY end date
- `last_financial_update` - Last update date

## UI Components

### New Component: `FinancialMetrics.tsx`

A comprehensive dashboard showing:

1. **Revenue & Growth Section**
   - MRR, ARR, ARR Growth Rate, Gross Margin
   - Color-coded health indicators

2. **Profitability & Efficiency Section**
   - EBITDA, EBITDA Margin, Rule of 40, Revenue per Employee
   - Auto-calculated Rule of 40 score

3. **Unit Economics Section**
   - CAC, LTV, LTV:CAC Ratio, Payback Period
   - Health indicators (✓ Healthy >3x for LTV:CAC)

4. **Retention & Customer Metrics**
   - NRR, GRR, Churn Rate, Customer Count
   - ACV display

5. **Cash & Valuation Section**
   - Cash Balance, Burn Rate, Runway, Total Funding
   - Auto-calculated EV multiples
   - Runway warnings

6. **Health Check Summary**
   - Positive indicators badge
   - Quick health assessment

### Features:
- ✅ Auto-calculates missing metrics (EV multiples, Rule of 40)
- ✅ Color-coded health indicators (green/yellow/red)
- ✅ Responsive grid layout
- ✅ Handles N/A values gracefully
- ✅ Currency formatting (1.5M, 500k)
- ✅ Percentage formatting
- ✅ Multiple formatting (5.2x)

## Integration

Updated `/deals/[id]/page.tsx`:
- Replaced simple 3-metric card with comprehensive dashboard
- Shows all financial metrics in organized sections
- Appears above analyst notes

## How to Use

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor
-- Run: add_financial_metrics.sql
```

### 2. Add Metrics to Deals
Metrics can be added via:
- Deal form (needs update to include new fields)
- Direct database update
- API integration
- Import from financial systems

### 3. View Metrics
- Navigate to any deal: `/deals/[id]`
- Financial dashboard appears below deal header
- Metrics auto-calculate when possible

## Metric Calculations

**Auto-calculated if data exists:**
- `ARR` = `MRR` × 12 (if ARR not set)
- `EV/Revenue` = `valuation_ask` / `revenue`
- `EV/EBITDA` = `valuation_ask` / `ebitda`
- `Rule of 40` = `arr_growth_rate` + `ebitda_margin`

## Health Indicators

- **LTV:CAC** → Healthy if ≥ 3x
- **NRR** → Healthy if ≥ 100%
- **Rule of 40** → Healthy if ≥ 40
- **Runway** → Healthy if ≥ 12 months

## Files Modified

1. **Database:**
   - `add_financial_metrics.sql` - Migration script

2. **TypeScript Types:**
   - `lib/supabase.ts` - Updated Deal type

3. **Components:**
   - `components/ui/FinancialMetrics.tsx` - New component

4. **Pages:**
   - `app/deals/[id]/page.tsx` - Integrated component

## Next Steps

- [ ] Update DealForm to include financial metric inputs
- [ ] Add financial metrics to CSV import
- [ ] Create API endpoint for bulk metric updates
- [ ] Add time-series tracking for metrics over time
- [ ] Create comparative analysis (deal vs sector benchmarks)










