-- ============================================================================
-- IMPORT YOUR NOTION CSV - EXACT COLUMN MAPPING
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create temp table matching YOUR exact CSV structure
CREATE TEMP TABLE temp_notion_import (
  "Company name" TEXT,
  "Asking Price" TEXT,
  "Client" TEXT,
  "Company Description" TEXT,
  "Competitors & Competitive Advantages:" TEXT,
  "Contact email" TEXT,
  "Created time" TEXT,
  "Deal Stage" TEXT,
  "Due Date" TEXT,
  "Follow up Task" TEXT,
  "Google Drive File" TEXT,
  "Industry" TEXT,
  "MRR" TEXT,
  "Seller's Social" TEXT,
  "Source" TEXT,
  "Supporting Doc" TEXT,
  "Team" TEXT,
  "Type" TEXT
);

-- STEP 2: Import your CSV into temp_notion_import
-- 1. Go to Supabase Table Editor
-- 2. Create a new table called "temp_notion_import" 
-- 3. Use the structure above (or just import CSV and it will auto-create)
-- 4. Import your CSV file
-- 5. Come back here and run STEP 3

-- STEP 3: Insert into deals table with proper column mapping
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
  -- Company name
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company') as company_name,
  
  -- Generate deal name from company name
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled') as deal_name,
  
  -- Map Deal Stage to status
  CASE 
    WHEN LOWER("Deal Stage") LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER("Deal Stage") LIKE '%replied%' THEN 'replied'
    WHEN LOWER("Deal Stage") LIKE '%interested%' THEN 'interested'
    WHEN LOWER("Deal Stage") LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER("Deal Stage") LIKE '%ioi%' THEN 'ioi_sent'
    WHEN LOWER("Deal Stage") LIKE '%loi%' THEN 'loi_signed'
    WHEN LOWER("Deal Stage") LIKE '%diligence%' OR LOWER("Deal Stage") LIKE '%dd%' THEN 'diligence'
    WHEN LOWER("Deal Stage") LIKE '%won%' OR LOWER("Deal Stage") LIKE '%closed%' THEN 'closed_won'
    WHEN LOWER("Deal Stage") LIKE '%lost%' OR LOWER("Deal Stage") LIKE '%pass%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END as status,
  
  -- Industry → sector
  NULLIF(TRIM("Industry"), '') as sector,
  
  -- Geography (not in your CSV, set to NULL)
  NULL as geography,
  
  -- MRR → Annual Revenue (multiply by 12)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN 
      ("MRR"::numeric * 12) -- Convert MRR to ARR
    WHEN "MRR" LIKE '%k%' OR "MRR" LIKE '%K%' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000 * 12)
    ELSE NULL
  END as revenue,
  
  -- EBITDA (not in CSV)
  NULL as ebitda,
  
  -- Asking Price → valuation_ask
  CASE 
    WHEN "Asking Price" LIKE '%k' OR "Asking Price" LIKE '%K' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" LIKE '%m' OR "Asking Price" LIKE '%M' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+\.?[0-9]*$' THEN 
      "Asking Price"::numeric
    ELSE NULL
  END as valuation_ask,
  
  -- Client or Team → analyst_owner
  COALESCE(
    NULLIF(TRIM("Client"), ''),
    NULLIF(TRIM("Team"), '')
  ) as analyst_owner,
  
  -- Company Description → executive_summary
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  
  -- Competitors & Competitive Advantages → key_risks
  -- Combine key risks with follow-up tasks and contact info
  CASE 
    WHEN "Competitors & Competitive Advantages:" IS NOT NULL AND TRIM("Competitors & Competitive Advantages:") != '' THEN
      TRIM("Competitors & Competitive Advantages:") ||
      CASE WHEN "Follow up Task" IS NOT NULL AND TRIM("Follow up Task") != '' 
           THEN E'\n\nFollow-up: ' || TRIM("Follow up Task")
           ELSE '' END ||
      CASE WHEN "Contact email" IS NOT NULL AND TRIM("Contact email") != '' 
           THEN E'\nContact: ' || TRIM("Contact email")
           ELSE '' END ||
      CASE WHEN "Source" IS NOT NULL AND TRIM("Source") != ''
           THEN E'\nSource: ' || TRIM("Source")
           ELSE '' END
    ELSE 
      CASE WHEN "Follow up Task" IS NOT NULL AND TRIM("Follow up Task") != '' THEN
        'Follow-up: ' || TRIM("Follow up Task") ||
        CASE WHEN "Contact email" IS NOT NULL AND TRIM("Contact email") != '' 
             THEN E'\nContact: ' || TRIM("Contact email")
             ELSE '' END ||
        CASE WHEN "Source" IS NOT NULL AND TRIM("Source") != ''
             THEN E'\nSource: ' || TRIM("Source")
             ELSE '' END
      ELSE NULL
      END
  END as key_risks,
  
  -- All deals are shared (no user_id)
  NULL as user_id
  
FROM temp_notion_import
WHERE "Company name" IS NOT NULL 
  AND TRIM("Company name") != '';

-- STEP 4: Verify the import
SELECT 
  COUNT(*) as total_imported,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(DISTINCT sector) as industries,
  COUNT(DISTINCT status) as deal_stages
FROM deals;

-- Show sample of imported deals
SELECT 
  company_name,
  status as deal_stage,
  sector as industry,
  revenue as arr,
  valuation_ask,
  analyst_owner,
  LEFT(executive_summary, 50) as description_preview
FROM deals
ORDER BY created_at DESC
LIMIT 15;

-- STEP 5: Clean up temp table
DROP TABLE IF EXISTS temp_notion_import;

-- ============================================================================
-- SUCCESS! Your Notion database is now imported.
-- ============================================================================

