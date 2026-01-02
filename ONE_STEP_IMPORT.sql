-- ============================================================================
-- ONE-STEP IMPORT: CSV → deals table
-- The staging table is TEMPORARY and gets deleted automatically
-- ============================================================================

-- STEP 1: Create temporary staging table (matches your CSV headers exactly)
CREATE TABLE IF NOT EXISTS notion_staging (
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

-- ============================================================================
-- NOW: Go to Table Editor → notion_staging → Insert → Import CSV
-- Your CSV will import successfully because column names match exactly!
-- ============================================================================

-- STEP 2: After importing CSV, run this to map data to deals table
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
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown') as company_name,
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled') as deal_name,
  
  CASE 
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%replied%' THEN 'replied'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%interested%' THEN 'interested'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%ioi%' THEN 'ioi_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%loi%' THEN 'loi_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%diligence%' THEN 'diligence'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%won%' THEN 'closed_won'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%lost%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END as status,
  
  NULLIF(TRIM("Industry"), '') as sector,
  
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 12)
    WHEN "MRR" ~ '[0-9]+[kK]' THEN (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000 * 12)
    ELSE NULL
  END as revenue,
  
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric
    WHEN "MRR" ~ '[0-9]+[kK]' THEN (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000)
    ELSE NULL
  END as mrr,
  
  CASE 
    WHEN "Asking Price" ~ '[0-9]+[kK]' THEN (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" ~ '[0-9]+[mM]' THEN (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+\.?[0-9]*$' THEN REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END as valuation_ask,
  
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')) as analyst_owner,
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  NULLIF(TRIM("Competitors & Competitive Advantages:"), '') as competitors,
  NULLIF(TRIM("Contact email"), '') as contact_email,
  NULLIF(TRIM("Seller's Social"), '') as seller_social,
  NULLIF(TRIM("Source"), '') as source,
  NULLIF(TRIM("Type"), '') as deal_type,
  
  CASE 
    WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    WHEN "Due Date" ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN TO_DATE("Due Date", 'MM/DD/YYYY')
    ELSE NULL
  END as due_date,
  
  NULLIF(TRIM("Follow up Task"), '') as follow_up_task,
  NULLIF(TRIM("Google Drive File"), '') as google_drive_url,
  NULLIF(TRIM("Supporting Doc"), '') as supporting_doc_url,
  NULL as user_id
  
FROM notion_staging
WHERE "Company name" IS NOT NULL AND TRIM("Company name") != '';

-- STEP 3: Verify import
SELECT 
  COUNT(*) as total_deals,
  COUNT(*) FILTER (WHERE mrr IS NOT NULL) as deals_with_mrr,
  COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as deals_with_email
FROM deals;

-- STEP 4: Delete staging table (cleanup)
DROP TABLE IF EXISTS notion_staging;

-- ============================================================================
-- ✅ DONE! Your data is in deals table, staging table is deleted.
-- ============================================================================










