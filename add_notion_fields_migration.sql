-- ============================================================================
-- ADD NOTION DATABASE FIELDS TO DEALS TABLE
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add new columns to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT; -- Type (equity, asset purchase, etc.)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_social TEXT; -- Seller's Social (LinkedIn, Twitter, etc.)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_email TEXT; -- Contact email
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source TEXT; -- Source (referral, outbound, etc.)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS mrr NUMERIC; -- Monthly Recurring Revenue
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitors TEXT; -- Competitors list/analysis
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitive_advantages TEXT; -- Competitive advantages
ALTER TABLE deals ADD COLUMN IF NOT EXISTS due_date DATE; -- Due date for follow-up
ALTER TABLE deals ADD COLUMN IF NOT EXISTS follow_up_task TEXT; -- Next follow-up action
ALTER TABLE deals ADD COLUMN IF NOT EXISTS google_drive_url TEXT; -- Google Drive folder link
ALTER TABLE deals ADD COLUMN IF NOT EXISTS supporting_doc_url TEXT; -- Supporting documents link

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_deals_due_date ON deals(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_source ON deals(source) WHERE source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_type ON deals(deal_type) WHERE deal_type IS NOT NULL;

-- Verify new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'deals'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- SUCCESS! New fields added to deals table.
-- ============================================================================
SELECT 'Schema updated! Now you can import your full Notion database.' AS message;










