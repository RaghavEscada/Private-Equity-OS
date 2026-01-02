-- ============================================================================
-- DELETE ALL DEALS AND IMPORT FRESH FROM NOTION CSV
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Delete all existing deals (cascades to transcripts, files, etc.)
DELETE FROM deals;

-- Verify deletion
SELECT COUNT(*) as remaining_deals FROM deals;
-- Should return 0

-- STEP 2: Reset the auto-increment sequence (optional, keeps IDs clean)
-- This ensures new deals start with fresh UUIDs

-- STEP 3: Now import your CSV using ONE of these methods:

-- ============================================================================
-- METHOD A: SUPABASE TABLE EDITOR (EASIEST - RECOMMENDED)
-- ============================================================================
-- 1. Go to Table Editor → deals table
-- 2. Click "Insert" → "Import data from CSV"
-- 3. Upload your Notion CSV file
-- 4. Map your columns to these fields:
--    - Deal Name → deal_name
--    - Company Name → company_name
--    - Status → status
--    - Sector → sector
--    - Geography → geography
--    - Revenue → revenue
--    - EBITDA → ebitda
--    - Valuation Ask → valuation_ask
--    - Analyst Owner → analyst_owner
--    - Executive Summary → executive_summary
--    - Key Risks → key_risks
-- 5. SKIP these columns (auto-generated):
--    - id
--    - user_id
--    - created_at
--    - updated_at
-- 6. Click Import

-- ============================================================================
-- METHOD B: SQL IMPORT (IF METHOD A DOESN'T WORK)
-- ============================================================================

-- Create temp table for CSV data
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

-- Import your CSV here using Supabase's CSV import to temp_deals_import table
-- OR manually insert the data

-- Insert from temp table into deals
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
  key_risks,
  user_id
)
SELECT 
  COALESCE(NULLIF(TRIM(deal_name), ''), 'Untitled Deal') as deal_name,
  COALESCE(NULLIF(TRIM(company_name), ''), 'Unknown Company') as company_name,
  COALESCE(NULLIF(TRIM(status), ''), 'outreach_sent') as status,
  NULLIF(TRIM(sector), '') as sector,
  NULLIF(TRIM(geography), '') as geography,
  CASE WHEN revenue IS NOT NULL AND revenue > 0 THEN revenue ELSE NULL END as revenue,
  CASE WHEN ebitda IS NOT NULL AND ebitda > 0 THEN ebitda ELSE NULL END as ebitda,
  CASE WHEN valuation_ask IS NOT NULL AND valuation_ask > 0 THEN valuation_ask ELSE NULL END as valuation_ask,
  NULLIF(TRIM(analyst_owner), '') as analyst_owner,
  NULLIF(TRIM(executive_summary), '') as executive_summary,
  NULLIF(TRIM(key_risks), '') as key_risks,
  NULL as user_id -- Shared across all users
FROM temp_deals_import
WHERE TRIM(company_name) != '' AND TRIM(company_name) IS NOT NULL;

-- Clean up temp table
DROP TABLE IF EXISTS temp_deals_import;

-- ============================================================================
-- STEP 4: VERIFY THE IMPORT
-- ============================================================================
SELECT 
  COUNT(*) as total_deals,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(DISTINCT sector) as sectors,
  COUNT(DISTINCT status) as statuses
FROM deals;

-- Show sample of imported deals
SELECT 
  company_name,
  deal_name,
  status,
  sector,
  revenue,
  valuation_ask
FROM deals
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SUCCESS!
-- ============================================================================
SELECT 'All deals deleted and ready for fresh import!' AS message;










