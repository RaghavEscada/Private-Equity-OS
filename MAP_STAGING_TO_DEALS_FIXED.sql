-- ============================================================================
-- MAP STAGING TABLE → deals table (FIXED for numeric parsing errors)
-- ============================================================================

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
  
  -- Revenue: Clean MRR and convert to ARR (multiply by 12)
  CASE 
    WHEN "MRR" IS NOT NULL AND TRIM("MRR") != '' THEN
      CASE 
        WHEN LOWER("MRR") LIKE '%k%' AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000 * 12)
        WHEN LOWER("MRR") LIKE '%m%' AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000000 * 12)
        ELSE 
          CASE 
            WHEN REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' 
                 AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') ~ '^[0-9]+\.?[0-9]*$' THEN
              (REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 12)
            ELSE NULL
          END
      END
    ELSE NULL
  END as revenue,
  
  -- MRR: Clean and parse
  CASE 
    WHEN "MRR" IS NOT NULL AND TRIM("MRR") != '' THEN
      CASE 
        WHEN LOWER("MRR") LIKE '%k%' AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000)
        WHEN LOWER("MRR") LIKE '%m%' AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000000)
        ELSE 
          CASE 
            WHEN REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') != '' 
                 AND REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '') ~ '^[0-9]+\.?[0-9]*$' THEN
              REGEXP_REPLACE(REGEXP_REPLACE("MRR", '[^0-9.]', '', 'g'), '\.+$', '')::numeric
            ELSE NULL
          END
      END
    ELSE NULL
  END as mrr,
  
  -- Valuation Ask: Clean and parse
  CASE 
    WHEN "Asking Price" IS NOT NULL AND TRIM("Asking Price") != '' THEN
      CASE 
        WHEN LOWER("Asking Price") LIKE '%k%' AND REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000)
        WHEN LOWER("Asking Price") LIKE '%m%' AND REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '') != '' THEN
          (REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '')::numeric * 1000000)
        ELSE 
          CASE 
            WHEN REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '') != '' 
                 AND REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '') ~ '^[0-9]+\.?[0-9]*$' THEN
              REGEXP_REPLACE(REGEXP_REPLACE("Asking Price", '[^0-9.]', '', 'g'), '\.+$', '')::numeric
            ELSE NULL
          END
      END
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
FROM notion_import_staging
WHERE "Company name" IS NOT NULL AND TRIM("Company name") != '';

-- Verify
SELECT COUNT(*) as total_deals_imported FROM deals;

