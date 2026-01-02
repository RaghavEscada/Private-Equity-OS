-- ============================================================================
-- FINAL IMPORT: Map notion_import_staging → deals table
-- Run this AFTER importing your CSV into notion_import_staging
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
  -- Company name
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company') as company_name,
  
  -- Deal name (same as company name)
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled Deal') as deal_name,
  
  -- Map Deal Stage to status
  CASE 
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%replied%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%response%' THEN 'replied'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%interested%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%in talks%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%discussion%' THEN 'interested'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%ioi%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%indication%' THEN 'ioi_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%loi%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%letter%' THEN 'loi_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%diligence%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%dd%' THEN 'diligence'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%won%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%closed%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%acquired%' THEN 'closed_won'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%lost%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%pass%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%declined%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END as status,
  
  -- Industry → sector
  NULLIF(TRIM("Industry"), '') as sector,
  
  -- Calculate ARR from MRR (revenue = MRR * 12)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 12)
    WHEN "MRR" ~ '[0-9]+[kK]' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000 * 12)
    WHEN "MRR" ~ '[0-9]+[mM]' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000000 * 12)
    ELSE NULL
  END as revenue,
  
  -- MRR (parse numeric value)
  CASE 
    WHEN "MRR" ~ '^[0-9]+\.?[0-9]*$' THEN 
      REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric
    WHEN "MRR" ~ '[0-9]+[kK]' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "MRR" ~ '[0-9]+[mM]' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 1000000)
    ELSE NULL
  END as mrr,
  
  -- Asking Price → valuation_ask
  CASE 
    WHEN "Asking Price" ~ '[0-9]+[kK]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" ~ '[0-9]+[mM]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+\.?[0-9]*$' THEN 
      REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END as valuation_ask,
  
  -- Client or Team → analyst_owner
  COALESCE(
    NULLIF(TRIM("Client"), ''),
    NULLIF(TRIM("Team"), '')
  ) as analyst_owner,
  
  -- Company Description → executive_summary
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  
  -- Competitors & Competitive Advantages → split into two fields
  -- For now, put everything in competitors (we can split later if needed)
  NULLIF(TRIM("Competitors & Competitive Advantages:"), '') as competitors,
  
  -- competitive_advantages (empty for now, can be extracted later)
  NULL as competitive_advantages,
  
  -- Contact email
  NULLIF(TRIM("Contact email"), '') as contact_email,
  
  -- Seller's Social
  NULLIF(TRIM("Seller's Social"), '') as seller_social,
  
  -- Source
  NULLIF(TRIM("Source"), '') as source,
  
  -- Type → deal_type
  NULLIF(TRIM("Type"), '') as deal_type,
  
  -- Due Date (parse various date formats)
  CASE 
    WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    WHEN "Due Date" ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN TO_DATE("Due Date", 'MM/DD/YYYY')
    WHEN "Due Date" ~ '^\d{1,2}-\d{1,2}-\d{4}' THEN TO_DATE("Due Date", 'MM-DD-YYYY')
    ELSE NULL
  END as due_date,
  
  -- Follow up Task
  NULLIF(TRIM("Follow up Task"), '') as follow_up_task,
  
  -- Google Drive File
  NULLIF(TRIM("Google Drive File"), '') as google_drive_url,
  
  -- Supporting Doc
  NULLIF(TRIM("Supporting Doc"), '') as supporting_doc_url,
  
  -- user_id = NULL (shared deals)
  NULL as user_id
  
FROM notion_import_staging
WHERE "Company name" IS NOT NULL 
  AND TRIM("Company name") != '';

-- ============================================================================
-- VERIFY IMPORT
-- ============================================================================
SELECT 
  COUNT(*) as total_deals_imported,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as deals_with_email,
  COUNT(*) FILTER (WHERE mrr IS NOT NULL) as deals_with_mrr,
  COUNT(*) FILTER (WHERE source IS NOT NULL) as deals_with_source,
  COUNT(*) FILTER (WHERE due_date IS NOT NULL) as deals_with_due_date
FROM deals;

-- ============================================================================
-- PREVIEW IMPORTED DATA
-- ============================================================================
SELECT 
  company_name,
  status,
  sector,
  mrr,
  revenue as arr,
  valuation_ask,
  analyst_owner,
  contact_email,
  source,
  deal_type,
  due_date
FROM deals
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- ✅ DONE! Your Notion data is now in the deals table.
-- ============================================================================










