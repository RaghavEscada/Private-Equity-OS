-- ============================================================================
-- EXACT COMMANDS TO RUN - COPY AND PASTE EACH BLOCK IN ORDER
-- ============================================================================

-- ============================================================================
-- COMMAND 1: Check your current deals table structure
-- ============================================================================
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'deals' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- EXPECTED OUTPUT: You should see columns like:
-- id, deal_name, company_name, status, sector, geography, revenue, ebitda, 
-- valuation_ask, analyst_owner, executive_summary, key_risks, user_id, created_at, updated_at

-- ============================================================================
-- COMMAND 2: Add new Notion fields to deals table
-- ============================================================================
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_social TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS mrr NUMERIC;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitors TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitive_advantages TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS follow_up_task TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS google_drive_url TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS supporting_doc_url TEXT;

-- EXPECTED OUTPUT: "Success. No rows returned" (this is good!)

-- ============================================================================
-- COMMAND 3: Verify new columns were added
-- ============================================================================
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'deals' 
  AND table_schema = 'public'
  AND column_name IN (
    'deal_type', 'seller_social', 'contact_email', 'source', 'mrr',
    'competitors', 'competitive_advantages', 'due_date', 'follow_up_task',
    'google_drive_url', 'supporting_doc_url'
  );

-- EXPECTED OUTPUT: Should show all 11 new column names

-- ============================================================================
-- COMMAND 4: Delete existing deals (start fresh)
-- ============================================================================
DELETE FROM deals;

-- EXPECTED OUTPUT: "Success. Deleted X rows" or "Success. No rows returned"

-- ============================================================================
-- COMMAND 5: Create staging table for your Notion CSV import
-- ============================================================================
DROP TABLE IF EXISTS notion_import_staging;

CREATE TABLE notion_import_staging (
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

-- EXPECTED OUTPUT: "Success. No rows returned"

-- ============================================================================
-- NOW STOP HERE!
-- Go to Table Editor → notion_import_staging → Insert → Import CSV
-- Upload your Notion CSV file → Click Import
-- THEN come back and run COMMAND 6
-- ============================================================================










