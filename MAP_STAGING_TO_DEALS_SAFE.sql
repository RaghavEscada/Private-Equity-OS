-- ============================================================================
-- MAP STAGING TABLE → deals table (SAFE VERSION - handles all edge cases)
-- ============================================================================

-- Helper function to safely parse numeric values
CREATE OR REPLACE FUNCTION safe_numeric(text_val TEXT, multiplier NUMERIC DEFAULT 1)
RETURNS NUMERIC AS $$
DECLARE
  cleaned TEXT;
BEGIN
  IF text_val IS NULL OR TRIM(text_val) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-numeric characters except dots
  cleaned := REGEXP_REPLACE(text_val, '[^0-9.]', '', 'g');
  -- Remove trailing periods
  cleaned := REGEXP_REPLACE(cleaned, '\.+$', '');
  -- Remove leading periods
  cleaned := REGEXP_REPLACE(cleaned, '^\.+', '');
  
  -- Check if it's a valid number
  IF cleaned = '' OR cleaned !~ '^[0-9]+\.?[0-9]*$' THEN
    RETURN NULL;
  END IF;
  
  -- Convert and multiply
  BEGIN
    RETURN cleaned::NUMERIC * multiplier;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Main import
INSERT INTO deals (
  company_name, deal_name, status, sector, revenue, mrr, valuation_ask,
  analyst_owner, executive_summary, competitors, contact_email, seller_social,
  source, deal_type, due_date, follow_up_task, google_drive_url, supporting_doc_url, user_id
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
  
  -- Revenue: MRR * 12, handle k/m suffixes
  CASE 
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%k%' THEN safe_numeric("MRR", 1000 * 12)
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%m%' THEN safe_numeric("MRR", 1000000 * 12)
    ELSE safe_numeric("MRR", 12)
  END as revenue,
  
  -- MRR: handle k/m suffixes
  CASE 
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%k%' THEN safe_numeric("MRR", 1000)
    WHEN LOWER(COALESCE("MRR", '')) LIKE '%m%' THEN safe_numeric("MRR", 1000000)
    ELSE safe_numeric("MRR", 1)
  END as mrr,
  
  -- Valuation Ask: handle k/m suffixes
  CASE 
    WHEN LOWER(COALESCE("Asking Price", '')) LIKE '%k%' THEN safe_numeric("Asking Price", 1000)
    WHEN LOWER(COALESCE("Asking Price", '')) LIKE '%m%' THEN safe_numeric("Asking Price", 1000000)
    ELSE safe_numeric("Asking Price", 1)
  END as valuation_ask,
  
  COALESCE(NULLIF(TRIM("Client"), ''), NULLIF(TRIM("Team"), '')) as analyst_owner,
  NULLIF(TRIM("Company Description"), '') as executive_summary,
  NULLIF(TRIM("Competitors & Competitive Advantages:"), '') as competitors,
  NULLIF(TRIM("Contact email"), '') as contact_email,
  NULLIF(TRIM("Seller's Social"), '') as seller_social,
  NULLIF(TRIM("Source"), '') as source,
  NULLIF(TRIM("Type"), '') as deal_type,
  CASE 
    WHEN "Due Date" IS NOT NULL AND TRIM("Due Date") != '' AND "Due Date" ~ '^\d{4}-\d{2}-\d{2}' THEN "Due Date"::DATE
    WHEN "Due Date" IS NOT NULL AND TRIM("Due Date") != '' AND "Due Date" ~ '^\d{1,2}/\d{1,2}/\d{4}' THEN TO_DATE("Due Date", 'MM/DD/YYYY')
    ELSE NULL
  END as due_date,
  NULLIF(TRIM("Follow up Task"), '') as follow_up_task,
  NULLIF(TRIM("Google Drive File"), '') as google_drive_url,
  NULLIF(TRIM("Supporting Doc"), '') as supporting_doc_url,
  NULL as user_id
FROM notion_import_staging
WHERE "Company name" IS NOT NULL AND TRIM("Company name") != '';

-- Verify
SELECT COUNT(*) as total_deals_imported FROM deals;

-- Clean up function (optional)
-- DROP FUNCTION IF EXISTS safe_numeric(TEXT, NUMERIC);
