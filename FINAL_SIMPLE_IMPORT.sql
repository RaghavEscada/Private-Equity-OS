-- ============================================================================
-- SIMPLE IMPORT - Handles all edge cases
-- ============================================================================

-- Step 1: Create safe numeric conversion function
CREATE OR REPLACE FUNCTION safe_to_numeric(text_val TEXT)
RETURNS NUMERIC AS $$
DECLARE
  cleaned TEXT;
BEGIN
  IF text_val IS NULL OR TRIM(text_val) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-numeric except dots
  cleaned := REGEXP_REPLACE(text_val, '[^0-9.]', '', 'g');
  -- Remove trailing/leading dots
  cleaned := REGEXP_REPLACE(REGEXP_REPLACE(cleaned, '\.+$', ''), '^\.+', '');
  
  IF cleaned = '' OR cleaned !~ '^[0-9]+\.?[0-9]*$' THEN
    RETURN NULL;
  END IF;
  
  RETURN cleaned::NUMERIC;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 2: Import with deduplication (keeps first occurrence)
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
SELECT DISTINCT ON (TRIM(LOWER(COALESCE("Company name", 'Unknown'))))
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Unknown Company') as company_name,
  COALESCE(NULLIF(TRIM("Company name"), ''), 'Untitled Deal') as deal_name,
  
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
  
  -- Revenue: MRR * 12 with k/m multipliers
  CASE 
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%k%' THEN safe_to_numeric("MRR") * 1000 * 12
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%m%' THEN safe_to_numeric("MRR") * 1000000 * 12
    ELSE safe_to_numeric("MRR") * 12
  END as revenue,
  
  -- MRR with k/m multipliers
  CASE 
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%k%' THEN safe_to_numeric("MRR") * 1000
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%m%' THEN safe_to_numeric("MRR") * 1000000
    ELSE safe_to_numeric("MRR")
  END as mrr,
  
  -- Valuation Ask with k/m multipliers
  CASE 
    WHEN LOWER(COALESCE("Asking Price", '')) LIKE '%k%' THEN safe_to_numeric("Asking Price") * 1000
    WHEN LOWER(COALESCE("Asking Price", '')) LIKE '%m%' THEN safe_to_numeric("Asking Price") * 1000000
    ELSE safe_to_numeric("Asking Price")
  END as valuation_ask,
  
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')) as analyst_owner,
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  NULLIF(TRIM("Competitors & Competitive Advantages:"), '') as competitors,
  NULLIF(TRIM("Contact email"), '') as contact_email,
  NULLIF(TRIM("Seller's Social"), '') as seller_social,
  NULLIF(TRIM("Source"), '') as source,
  NULLIF(TRIM("Type"), '') as deal_type,
  
  -- Due date parsing
  CASE 
    WHEN "Due Date" IS NOT NULL AND TRIM("Due Date") != '' THEN
      CASE 
        WHEN "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
        WHEN "Due Date" ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN TO_DATE("Due Date", 'MM/DD/YYYY')
        ELSE NULL
      END
    ELSE NULL
  END as due_date,
  
  NULLIF(TRIM("Follow up Task"), '') as follow_up_task,
  NULLIF(TRIM("Google Drive File"), '') as google_drive_url,
  NULLIF(TRIM("Supporting Doc"), '') as supporting_doc_url,
  NULL as user_id
  
FROM notion_import_staging
WHERE "Company name" IS NOT NULL AND TRIM("Company name") != ''
ORDER BY TRIM(LOWER(COALESCE("Company name", 'Unknown')));

-- Step 3: Show results
SELECT 
  COUNT(*) as total_imported,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(*) FILTER (WHERE mrr IS NOT NULL) as with_mrr,
  COUNT(*) FILTER (WHERE contact_email IS NOT NULL) as with_email,
  COUNT(*) FILTER (WHERE source IS NOT NULL) as with_source
FROM deals;

-- Step 4: Preview imported deals
SELECT 
  company_name,
  status,
  sector,
  mrr,
  valuation_ask,
  analyst_owner,
  contact_email
FROM deals
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- ✅ DONE! If you see numbers above, your import succeeded.
-- ============================================================================










