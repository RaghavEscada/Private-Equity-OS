-- ============================================================================
-- IMPORT NOTION DEALS FROM CSV
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create a temporary table matching your CSV structure
-- Adjust column names/types to match your Notion CSV export
CREATE TEMP TABLE temp_deals_import (
  deal_name TEXT,
  company_name TEXT,
  status TEXT,
  sector TEXT,
  geography TEXT,
  revenue NUMERIC,
  ebitda NUMERIC,
  valuation_ask NUMERIC,
  analyst_owner TEXT,
  executive_summary TEXT,
  key_risks TEXT
);

-- STEP 2: Import CSV data into temp table
-- Option A: If you have the CSV file, use Supabase's import feature:
--   1. Go to Table Editor → Create new table "temp_deals_import"
--   2. Import your CSV
--   3. Then run the INSERT below

-- Option B: If you want to paste data directly, use:
-- COPY temp_deals_import FROM STDIN WITH (FORMAT csv, HEADER true);
-- [paste your CSV data here]
-- \.

-- STEP 3: Insert into deals table (deals are shared, no user_id needed)
INSERT INTO deals (
  deal_name,
  company_name,
  status,
  sector,
  geography,
  revenue,
  ebitda,
  valuation_ask,
  analyst_owner,
  executive_summary,
  key_risks
)
SELECT 
  deal_name,
  company_name,
  COALESCE(status, 'outreach_sent') as status, -- Default status if missing
  NULLIF(TRIM(sector), '') as sector,
  NULLIF(TRIM(geography), '') as geography,
  revenue,
  ebitda,
  valuation_ask,
  NULLIF(TRIM(analyst_owner), '') as analyst_owner,
  NULLIF(TRIM(executive_summary), '') as executive_summary,
  NULLIF(TRIM(key_risks), '') as key_risks
FROM temp_deals_import;

-- STEP 4: Verify the import
SELECT 
  COUNT(*) as total_imported,
  COUNT(DISTINCT company_name) as unique_companies
FROM deals;

-- STEP 5: Clean up temp table
DROP TABLE IF EXISTS temp_deals_import;

-- ============================================================================
-- ALTERNATIVE: If your CSV column names don't match, adjust the mapping:
-- ============================================================================
-- Example: If Notion exports "Company" instead of "company_name"
-- SELECT 
--   "Company" as company_name,
--   "Deal Name" as deal_name,
--   -- ... map other columns
-- FROM temp_deals_import;

