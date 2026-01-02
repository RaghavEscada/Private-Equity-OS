-- ============================================================================
-- IMPORT NOTION CSV WITH CUSTOM COLUMN MAPPING
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create temp table matching YOUR Notion CSV structure
CREATE TEMP TABLE temp_notion_import (
  "Company name" TEXT,
  "Asking Price" TEXT,  -- As text first, we'll convert to number
  "Client" TEXT,
  "Company Description" TEXT
  -- Add more columns as they appear in your CSV
);

-- STEP 2: Import CSV into temp_notion_import using Supabase Table Editor:
-- 1. Create a NEW table called "temp_notion_import" with the columns above
-- 2. Import your CSV into that temp table
-- 3. Then run STEP 3 below

-- STEP 3: Insert into deals table with proper mapping
INSERT INTO deals (
  company_name,
  deal_name,
  status,
  sector,
  geography,
  revenue,
  ebitda,
  valuation_ask,
  analyst_owner,
  executive_summary,
  key_risks,
  user_id
)
SELECT 
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company') as company_name,
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Deal') || ' Deal' as deal_name, -- Generate deal name from company
  'outreach_sent' as status, -- Default status for all
  NULL as sector, -- Add if you have this column
  NULL as geography, -- Add if you have this column
  NULL as revenue, -- Add if you have this column
  NULL as ebitda, -- Add if you have this column
  -- Parse asking price (handle $1k, $5k-$10k, etc.)
  CASE 
    WHEN "Asking Price" LIKE '%k' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" LIKE '%m' OR "Asking Price" LIKE '%M' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+$' THEN 
      "Asking Price"::numeric
    ELSE NULL
  END as valuation_ask,
  NULLIF(TRIM("Client"), '') as analyst_owner, -- Map Client to analyst_owner
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  NULL as key_risks, -- Add if you have this column
  NULL as user_id
FROM temp_notion_import
WHERE TRIM("Company name") != '' AND "Company name" IS NOT NULL;

-- STEP 4: Verify import
SELECT 
  COUNT(*) as total_imported,
  company_name,
  valuation_ask,
  analyst_owner,
  executive_summary
FROM deals
ORDER BY created_at DESC
LIMIT 10;

-- STEP 5: Clean up
DROP TABLE IF EXISTS temp_notion_import;

-- ============================================================================
-- If you have MORE columns in your CSV, add them above!
-- Share the full list of your CSV headers and I'll adjust this script.
-- ============================================================================

