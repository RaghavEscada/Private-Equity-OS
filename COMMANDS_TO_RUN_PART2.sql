-- ============================================================================
-- COMMAND 6: Map Notion data to deals table
-- (Run this AFTER importing your CSV into notion_import_staging)
-- ============================================================================

INSERT INTO deals (
  company_name,
  deal_name,
  status,
  sector,
  revenue,
  mrr,
  valuation_ask,
  analyst_owner,
  executive_summary,
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
  -- Map your Notion columns to database columns
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown'),
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled'),
  
  -- Map Deal Stage to our status values
  CASE 
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%replied%' THEN 'replied'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%interested%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%in talks%' THEN 'interested'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%ioi%' THEN 'ioi_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%loi%' THEN 'loi_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%diligence%' THEN 'diligence'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%won%' THEN 'closed_won'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%lost%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%pass%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END,
  
  NULLIF(TRIM("Industry"), ''),
  
  -- Calculate ARR from MRR
  CASE 
    WHEN "MRR" ~ '^[0-9]+' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 12)
    ELSE NULL
  END,
  
  -- MRR
  CASE 
    WHEN "MRR" ~ '^[0-9]+' THEN 
      REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END,
  
  -- Asking Price
  CASE 
    WHEN "Asking Price" ~ '[0-9]+[kK]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" ~ '[0-9]+[mM]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+' THEN 
      REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END,
  
  -- Client or Team → analyst
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')),
  
  NULLIF(TRIM("Company Description"), ''),
  NULLIF(TRIM("Competitors & Competitive Advantages:"), ''),
  NULL, -- competitive_advantages (separate field)
  NULLIF(TRIM("Contact email"), ''),
  NULLIF(TRIM("Seller's Social"), ''),
  NULLIF(TRIM("Source"), ''),
  NULLIF(TRIM("Type"), ''),
  
  -- Parse due date
  CASE 
    WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    WHEN "Due Date" ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN TO_DATE("Due Date", 'MM/DD/YYYY')
    ELSE NULL
  END,
  
  NULLIF(TRIM("Follow up Task"), ''),
  NULLIF(TRIM("Google Drive File"), ''),
  NULLIF(TRIM("Supporting Doc"), ''),
  NULL -- user_id = NULL (shared across all users)
  
FROM notion_import_staging
WHERE "Company name" IS NOT NULL 
  AND TRIM("Company name") != '';

-- ============================================================================
-- COMMAND 7: Verify import worked
-- ============================================================================
SELECT 
  COUNT(*) as total_deals,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as deals_with_email,
  COUNT(*) FILTER (WHERE mrr IS NOT NULL) as deals_with_mrr,
  COUNT(*) FILTER (WHERE source IS NOT NULL) as deals_with_source
FROM deals;

-- ============================================================================
-- COMMAND 8: Preview imported data
-- ============================================================================
SELECT 
  company_name,
  status,
  sector,
  mrr,
  valuation_ask,
  analyst_owner,
  contact_email,
  source,
  deal_type,
  due_date
FROM deals
ORDER BY created_at DESC
LIMIT 15;

-- ============================================================================
-- COMMAND 9: Clean up staging table (optional - run after you verify data looks good)
-- ============================================================================
-- DROP TABLE notion_import_staging;

-- ============================================================================
-- ALL DONE! Your full Notion database is imported.
-- ============================================================================










