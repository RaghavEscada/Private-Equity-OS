-- ============================================================================
-- ADD FINANCIAL METRICS TO DEALS TABLE
-- Key metrics for PE deal analysis
-- ============================================================================

-- Add financial metric columns
ALTER TABLE deals ADD COLUMN IF NOT EXISTS arr NUMERIC; -- Annual Recurring Revenue
ALTER TABLE deals ADD COLUMN IF NOT EXISTS arr_growth_rate NUMERIC; -- YoY ARR growth %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS gross_margin NUMERIC; -- Gross margin %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ebitda_margin NUMERIC; -- EBITDA margin %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS burn_rate NUMERIC; -- Monthly burn rate
ALTER TABLE deals ADD COLUMN IF NOT EXISTS runway_months NUMERIC; -- Cash runway in months
ALTER TABLE deals ADD COLUMN IF NOT EXISTS cac NUMERIC; -- Customer Acquisition Cost
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ltv NUMERIC; -- Lifetime Value
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ltv_cac_ratio NUMERIC; -- LTV/CAC ratio
ALTER TABLE deals ADD COLUMN IF NOT EXISTS net_revenue_retention NUMERIC; -- NRR %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS gross_revenue_retention NUMERIC; -- GRR %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS payback_period_months NUMERIC; -- CAC payback period
ALTER TABLE deals ADD COLUMN IF NOT EXISTS rule_of_40 NUMERIC; -- Growth rate + EBITDA margin
ALTER TABLE deals ADD COLUMN IF NOT EXISTS customer_count INTEGER; -- Total customers
ALTER TABLE deals ADD COLUMN IF NOT EXISTS average_contract_value NUMERIC; -- ACV
ALTER TABLE deals ADD COLUMN IF NOT EXISTS churn_rate NUMERIC; -- Monthly churn %
ALTER TABLE deals ADD COLUMN IF NOT EXISTS revenue_per_employee NUMERIC; -- Revenue per FTE
ALTER TABLE deals ADD COLUMN IF NOT EXISTS employee_count INTEGER; -- Total employees
ALTER TABLE deals ADD COLUMN IF NOT EXISTS cash_balance NUMERIC; -- Current cash balance
ALTER TABLE deals ADD COLUMN IF NOT EXISTS total_funding NUMERIC; -- Total funding raised
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_round_valuation NUMERIC; -- Last funding round valuation
ALTER TABLE deals ADD COLUMN IF NOT EXISTS debt_balance NUMERIC; -- Outstanding debt

-- Add columns for valuation multiples (can be calculated or manual)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ev_revenue_multiple NUMERIC; -- EV/Revenue multiple
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ev_ebitda_multiple NUMERIC; -- EV/EBITDA multiple

-- Add date fields for financial tracking
ALTER TABLE deals ADD COLUMN IF NOT EXISTS fiscal_year_end DATE; -- Fiscal year end date
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_financial_update DATE; -- When financials were last updated

-- Comments for clarity
COMMENT ON COLUMN deals.arr IS 'Annual Recurring Revenue';
COMMENT ON COLUMN deals.arr_growth_rate IS 'Year-over-Year ARR growth rate (%)';
COMMENT ON COLUMN deals.gross_margin IS 'Gross margin percentage';
COMMENT ON COLUMN deals.ebitda_margin IS 'EBITDA margin percentage';
COMMENT ON COLUMN deals.burn_rate IS 'Monthly cash burn rate';
COMMENT ON COLUMN deals.runway_months IS 'Cash runway in months';
COMMENT ON COLUMN deals.cac IS 'Customer Acquisition Cost';
COMMENT ON COLUMN deals.ltv IS 'Customer Lifetime Value';
COMMENT ON COLUMN deals.ltv_cac_ratio IS 'LTV to CAC ratio';
COMMENT ON COLUMN deals.net_revenue_retention IS 'Net Revenue Retention percentage';
COMMENT ON COLUMN deals.gross_revenue_retention IS 'Gross Revenue Retention percentage';
COMMENT ON COLUMN deals.payback_period_months IS 'CAC payback period in months';
COMMENT ON COLUMN deals.rule_of_40 IS 'Rule of 40 score (growth rate + EBITDA margin)';
COMMENT ON COLUMN deals.customer_count IS 'Total number of customers';
COMMENT ON COLUMN deals.average_contract_value IS 'Average Contract Value';
COMMENT ON COLUMN deals.churn_rate IS 'Monthly customer churn rate (%)';
COMMENT ON COLUMN deals.revenue_per_employee IS 'Revenue per full-time employee';
COMMENT ON COLUMN deals.employee_count IS 'Total number of employees';
COMMENT ON COLUMN deals.cash_balance IS 'Current cash and cash equivalents';
COMMENT ON COLUMN deals.total_funding IS 'Total funding raised to date';
COMMENT ON COLUMN deals.last_round_valuation IS 'Valuation from last funding round';
COMMENT ON COLUMN deals.debt_balance IS 'Outstanding debt balance';
COMMENT ON COLUMN deals.ev_revenue_multiple IS 'Enterprise Value / Revenue multiple';
COMMENT ON COLUMN deals.ev_ebitda_multiple IS 'Enterprise Value / EBITDA multiple';
COMMENT ON COLUMN deals.fiscal_year_end IS 'Fiscal year end date';
COMMENT ON COLUMN deals.last_financial_update IS 'Date when financials were last updated';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'deals' 
  AND column_name IN (
    'arr', 'arr_growth_rate', 'gross_margin', 'ebitda_margin', 
    'burn_rate', 'runway_months', 'cac', 'ltv', 'ltv_cac_ratio',
    'net_revenue_retention', 'gross_revenue_retention', 
    'payback_period_months', 'rule_of_40', 'customer_count',
    'average_contract_value', 'churn_rate', 'revenue_per_employee',
    'employee_count', 'cash_balance', 'total_funding',
    'last_round_valuation', 'debt_balance', 'ev_revenue_multiple',
    'ev_ebitda_multiple', 'fiscal_year_end', 'last_financial_update'
  )
ORDER BY ordinal_position;

-- ============================================================================
-- ✅ DONE! Financial metrics columns added to deals table
-- ============================================================================










