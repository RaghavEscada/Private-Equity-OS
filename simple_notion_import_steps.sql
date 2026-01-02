-- ============================================================================
-- SIMPLE NOTION IMPORT - STEP BY STEP
-- ============================================================================

-- STEP 1: Run this to create a regular (not temp) import table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notion_import_staging (
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

-- You should see: "Success. No rows returned"
-- ============================================================================

-- NOW: Go to Table Editor → Find "notion_import_staging" → Click "Insert" → 
--      "Import data from CSV" → Upload your Notion CSV → Import
-- ============================================================================

-- AFTER CSV IS IMPORTED, RUN STEP 2 BELOW:
-- ============================================================================










