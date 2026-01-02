-- ============================================================================
-- DEBUG: Check why import returned 0 deals
-- ============================================================================

-- Step 1: Check if notion_staging has data
SELECT COUNT(*) as rows_in_notion_staging FROM notion_staging;

-- Step 2: Check if notion_import_staging has data
SELECT COUNT(*) as rows_in_notion_import_staging FROM notion_import_staging;

-- Step 3: Preview first few rows from notion_staging
SELECT * FROM notion_staging LIMIT 3;

-- Step 4: Check if Company name column exists and has data
SELECT 
  COUNT(*) as total_rows,
  COUNT("Company name") as rows_with_company_name,
  COUNT(*) FILTER (WHERE "Company name" IS NOT NULL AND TRIM("Company name") != '') as valid_company_names
FROM notion_staging;

-- Step 5: Show sample company names
SELECT "Company name", "Deal Stage", "Industry", "MRR" 
FROM notion_staging 
LIMIT 5;










