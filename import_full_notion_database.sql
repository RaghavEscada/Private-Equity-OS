-- ============================================================================
-- IMPORT FULL NOTION DATABASE WITH ALL FIELDS
-- Run this AFTER running add_notion_fields_migration.sql
-- ============================================================================

-- STEP 1: Create temp table matching YOUR Notion CSV
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

-- STEP 2: Import CSV via Supabase Table Editor
-- 1. Go to Table Editor → Create table "temp_notion_import" with columns above
-- 2. Click Insert → Import CSV
-- 3. Upload your Notion CSV
-- 4. Then run STEP 3 below

-- STEP 3: Insert with full mapping
INSERT INTO deals (
  company_name,
  deal_name,
  status,
  sector,
  geography,
  revenue,
  mrr,
  ebitda,
  valuation_ask,
  analyst_owner,
  executive_summary,
  key_risks,
  competitors,
  competitive_advantages,
  contact_email,
  seller_social,
  source,
  deal_type,
  due_date,
  follow_up_task,
  google_drive_url,
  supporting_doc_url,
  user_id
)
SELECT 
  -- Company name
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company'),
  
  -- Deal name (use company name as base)
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled'),
  
  -- Deal Stage → status
  CASE 
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%replied%' THEN 'replied'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%interested%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%in talks%' THEN 'interested'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%ioi%' THEN 'ioi_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%loi%' THEN 'loi_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%diligence%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%dd%' THEN 'diligence'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%won%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%closed%' THEN 'closed_won'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%lost%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%pass%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END,
  
  -- Industry → sector
  NULLIF(TRIM("Industry"), ''),
  
  -- Geography (not in CSV)
  NULL,
  
  -- MRR → Annual Revenue (ARR = MRR * 12)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN 
      ("MRR"::numeric * 12)
    WHEN LOWER("MRR") LIKE '%k%' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000 * 12)
    ELSE NULL
  END,
  
  -- MRR (keep original)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN "MRR"::numeric
    WHEN LOWER("MRR") LIKE '%k%' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000)
    ELSE NULL
  END,
  
  -- EBITDA (not in CSV, estimate at ~30% of revenue if available)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN 
      (("MRR"::numeric * 12) * 0.3)
    WHEN LOWER("MRR") LIKE '%k%' THEN 
      ((REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000 * 12) * 0.3)
    ELSE NULL
  END,
  
  -- Asking Price → valuation_ask
  CASE 
    WHEN LOWER("Asking Price") LIKE '%k%' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN LOWER("Asking Price") LIKE '%m%' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+\.?[0-9]*$' THEN 
      "Asking Price"::numeric
    ELSE NULL
  END,
  
  -- Client or Team → analyst_owner
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')),
  
  -- Company Description → executive_summary
  NULLIF(TRIM("Company Description"), ''),
  
  -- key_risks (leave empty for now)
  NULL,
  
  -- Competitors (split the combined field if needed)
  SPLIT_PART("Competitors & Competitive Advantages:", E'\n', 1),
  
  -- Competitive Advantages
  CASE 
    WHEN LENGTH("Competitors & Competitive Advantages:") > LENGTH(SPLIT_PART("Competitors & Competitive Advantages:", E'\n', 1)) THEN
      SUBSTRING("Competitors & Competitive Advantages:" FROM LENGTH(SPLIT_PART("Competitors & Competitive Advantages:", E'\n', 1)) + 2)
    ELSE NULL
  END,
  
  -- Contact email
  NULLIF(TRIM("Contact email"), ''),
  
  -- Seller's Social
  NULLIF(TRIM("Seller's Social"), ''),
  
  -- Source
  NULLIF(TRIM("Source"), ''),
  
  -- Type
  NULLIF(TRIM("Type"), ''),
  
  -- Due Date (parse if date format)
  CASE 
    WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    ELSE NULL
  END,
  
  -- Follow up Task
  NULLIF(TRIM("Follow up Task"), ''),
  
  -- Google Drive File
  NULLIF(TRIM("Google Drive File"), ''),
  
  -- Supporting Doc
  NULLIF(TRIM("Supporting Doc"), ''),
  
  -- All deals are shared
  NULL
  
FROM temp_notion_import
WHERE "Company name" IS NOT NULL 
  AND TRIM("Company name") != ''
  AND TRIM("Company name") NOT LIKE '%http%'; -- Skip URLs that got parsed as company names

-- Verify import
SELECT 
  COUNT(*) as total_imported,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(DISTINCT sector) as industries,
  COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as with_email,
  COUNT(*) FILTER (WHERE due_date IS NOT NULL) as with_due_date
FROM deals;

-- Sample preview
SELECT 
  company_name,
  status,
  sector,
  mrr,
  valuation_ask,
  analyst_owner,
  contact_email,
  source,
  deal_type
FROM deals
ORDER BY created_at DESC
LIMIT 10;

DROP TABLE IF EXISTS temp_notion_import;

-- ============================================================================
-- SUCCESS!
-- ============================================================================










