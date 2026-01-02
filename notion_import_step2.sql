-- ============================================================================
-- STEP 2: Map and Insert (Run AFTER CSV is imported into notion_import_staging)
-- ============================================================================

-- Delete old deals first
DELETE FROM deals;

-- Insert with full mapping
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
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company'),
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled'),
  CASE 
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%outreach%' THEN 'outreach_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%replied%' THEN 'replied'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%interested%' OR LOWER(COALESCE("Deal Stage", '')) LIKE '%in talks%' THEN 'interested'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%nda%' THEN 'nda_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%ioi%' THEN 'ioi_sent'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%loi%' THEN 'loi_signed'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%diligence%' THEN 'diligence'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%won%' THEN 'closed_won'
    WHEN LOWER(COALESCE("Deal Stage", '')) LIKE '%lost%' THEN 'closed_lost'
    ELSE 'outreach_sent'
  END,
  NULLIF(TRIM("Industry"), ''),
  CASE 
    WHEN "MRR" ~ '^[0-9]+' THEN 
      (REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric * 12)
    ELSE NULL
  END,
  CASE 
    WHEN "MRR" ~ '^[0-9]+' THEN 
      REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END,
  CASE 
    WHEN "Asking Price" ~ '[0-9]+[kK]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000)
    WHEN "Asking Price" ~ '[0-9]+[mM]' THEN 
      (REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric * 1000000)
    WHEN "Asking Price" ~ '^[0-9]+' THEN 
      REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g')::numeric
    ELSE NULL
  END,
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')),
  NULLIF(TRIM("Company Description"), ''),
  NULLIF(TRIM("Competitors & Competitive Advantages:"), ''),
  NULL,
  NULLIF(TRIM("Contact email"), ''),
  NULLIF(TRIM("Seller's Social"), ''),
  NULLIF(TRIM("Source"), ''),
  NULLIF(TRIM("Type"), ''),
  CASE 
    WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    ELSE NULL
  END,
  NULLIF(TRIM("Follow up Task"), ''),
  NULLIF(TRIM("Google Drive File"), ''),
  NULLIF(TRIM("Supporting Doc"), ''),
  NULL
FROM notion_import_staging
WHERE "Company name" IS NOT NULL 
  AND TRIM("Company name") != ''
  AND TRIM("Company name") NOT LIKE '%http%';

-- Verify
SELECT COUNT(*) as total_imported FROM deals;

-- ============================================================================
-- STEP 3: Clean up staging table (optional - run after verifying)
-- ============================================================================
-- DROP TABLE notion_import_staging;










