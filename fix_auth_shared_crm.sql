-- ============================================================================
-- FIX AUTH: SHARED CRM, PRIVATE CHATS
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- DEALS: Make user_id nullable and allow all users to access all deals
ALTER TABLE deals ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS deals_select_own ON deals;
DROP POLICY IF EXISTS deals_insert_own ON deals;
DROP POLICY IF EXISTS deals_update_own ON deals;

-- Create new policies: All authenticated users can access all deals
CREATE POLICY deals_select_all ON deals
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY deals_insert_all ON deals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY deals_update_all ON deals
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY deals_delete_all ON deals
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Set all existing deals to NULL user_id (shared)
UPDATE deals SET user_id = NULL;

-- CALL TRANSCRIPTS: Shared (tied to deals, not users)
DO $$
BEGIN
  IF to_regclass('public.call_transcripts') IS NOT NULL THEN
    -- Make user_id nullable
    ALTER TABLE call_transcripts ALTER COLUMN user_id DROP NOT NULL;
    
    -- Drop old policies
    DROP POLICY IF EXISTS call_transcripts_select_own ON call_transcripts;
    DROP POLICY IF EXISTS call_transcripts_insert_own ON call_transcripts;
    DROP POLICY IF EXISTS call_transcripts_update_own ON call_transcripts;
    
    -- Create new policies: All authenticated users can access all transcripts
    CREATE POLICY call_transcripts_select_all ON call_transcripts
      FOR SELECT USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY call_transcripts_insert_all ON call_transcripts
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    
    CREATE POLICY call_transcripts_update_all ON call_transcripts
      FOR UPDATE USING (auth.uid() IS NOT NULL);
      
    -- Set all existing transcripts to NULL user_id
    UPDATE call_transcripts SET user_id = NULL;
  END IF;
END $$;

-- EXTRACTED UPDATES: Shared (tied to deals/transcripts)
DO $$
BEGIN
  IF to_regclass('public.extracted_deal_updates') IS NOT NULL THEN
    -- Disable RLS on extracted_deal_updates (approval workflow should be shared)
    ALTER TABLE extracted_deal_updates DISABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS updates_select_own ON extracted_deal_updates;
    DROP POLICY IF EXISTS updates_insert_own ON extracted_deal_updates;
    DROP POLICY IF EXISTS updates_update_own ON extracted_deal_updates;
  END IF;
END $$;

-- DEAL FILES: Shared
DO $$
BEGIN
  IF to_regclass('public.deal_files') IS NOT NULL THEN
    -- Enable RLS if not already
    ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
    
    -- Drop any existing policies
    DROP POLICY IF EXISTS deal_files_select_all ON deal_files;
    DROP POLICY IF EXISTS deal_files_insert_all ON deal_files;
    DROP POLICY IF EXISTS deal_files_delete_all ON deal_files;
    
    -- All authenticated users can access all files
    CREATE POLICY deal_files_select_all ON deal_files
      FOR SELECT USING (auth.uid() IS NOT NULL);
    
    CREATE POLICY deal_files_insert_all ON deal_files
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
      
    CREATE POLICY deal_files_delete_all ON deal_files
      FOR DELETE USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- CHATS: Keep private per user (UNCHANGED - already correct)
-- chat_sessions and chat_messages remain user-scoped

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT 'SUCCESS! CRM is now shared, chats remain private per user.' AS message;

-- Show current policy setup
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('deals', 'chat_sessions', 'call_transcripts', 'deal_files')
ORDER BY tablename, policyname;










