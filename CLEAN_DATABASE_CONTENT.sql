-- ============================================================================
-- CLEAN DATABASE CONTENT (KEEP TABLES, DELETE DATA ONLY)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Delete in order to respect foreign key constraints
-- (child tables first, then parent tables)

-- Step 1: Delete extracted deal updates (references call_transcripts)
DELETE FROM extracted_deal_updates;

-- Step 2: Delete call transcripts (references deals)
DELETE FROM call_transcripts;

-- Step 3: Delete deal files (if you have a deal_files table)
-- Uncomment if you have this table:
-- DELETE FROM deal_files;

-- Step 4: Delete chat messages (references chat_sessions)
DELETE FROM chat_messages;

-- Step 5: Delete chat sessions (references deals via context)
DELETE FROM chat_sessions;

-- Step 6: Delete all deals (parent table)
DELETE FROM deals;

-- Step 7: Verify everything is empty
SELECT 
  (SELECT COUNT(*) FROM deals) as deals_count,
  (SELECT COUNT(*) FROM call_transcripts) as transcripts_count,
  (SELECT COUNT(*) FROM extracted_deal_updates) as updates_count,
  (SELECT COUNT(*) FROM chat_sessions) as chat_sessions_count,
  (SELECT COUNT(*) FROM chat_messages) as chat_messages_count;

-- Expected output: All counts should be 0

-- ============================================================================
-- ✅ DONE! Your tables are intact, but all data is cleared.
-- Now you can import your CSV into notion_import_staging table.
-- ============================================================================










