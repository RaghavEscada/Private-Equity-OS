-- ============================================================================
-- AUTH USER SCOPING SCHEMA
-- Run this in your Supabase SQL Editor AFTER the base tables exist
-- ============================================================================

-- 1) Add user_id to core tables (nullable for existing data)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
DO $$
BEGIN
  IF to_regclass('public.call_transcripts') IS NOT NULL THEN
    ALTER TABLE call_transcripts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  END IF;
  IF to_regclass('public.extracted_deal_updates') IS NOT NULL THEN
    ALTER TABLE extracted_deal_updates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 2) Backfill existing rows to a single owner if you want (optional)
-- UPDATE deals SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- UPDATE chat_sessions SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- UPDATE call_transcripts SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- UPDATE extracted_deal_updates SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;

-- 3) Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF to_regclass('public.call_transcripts') IS NOT NULL THEN
    ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF to_regclass('public.extracted_deal_updates') IS NOT NULL THEN
    ALTER TABLE extracted_deal_updates ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4) Policies: each user only sees / modifies their own rows

-- Deals
DROP POLICY IF EXISTS deals_select_own ON deals;
DROP POLICY IF EXISTS deals_insert_own ON deals;
DROP POLICY IF EXISTS deals_update_own ON deals;
CREATE POLICY deals_select_own ON deals
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY deals_insert_own ON deals
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY deals_update_own ON deals
  FOR UPDATE USING (user_id = auth.uid());

-- Chat sessions
DROP POLICY IF EXISTS chat_sessions_select_own ON chat_sessions;
DROP POLICY IF EXISTS chat_sessions_insert_own ON chat_sessions;
DROP POLICY IF EXISTS chat_sessions_update_own ON chat_sessions;
CREATE POLICY chat_sessions_select_own ON chat_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY chat_sessions_insert_own ON chat_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY chat_sessions_update_own ON chat_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Chat messages (via parent session)
DROP POLICY IF EXISTS chat_messages_select_by_session ON chat_messages;
DROP POLICY IF EXISTS chat_messages_insert_by_session ON chat_messages;
CREATE POLICY chat_messages_select_by_session ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );
CREATE POLICY chat_messages_insert_by_session ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Call transcripts (only if table exists)
DO $$
BEGIN
  IF to_regclass('public.call_transcripts') IS NOT NULL THEN
    DROP POLICY IF EXISTS call_transcripts_select_own ON call_transcripts;
    DROP POLICY IF EXISTS call_transcripts_insert_own ON call_transcripts;
    DROP POLICY IF EXISTS call_transcripts_update_own ON call_transcripts;
    CREATE POLICY call_transcripts_select_own ON call_transcripts
      FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY call_transcripts_insert_own ON call_transcripts
      FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY call_transcripts_update_own ON call_transcripts
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Extracted updates (only if table exists)
DO $$
BEGIN
  IF to_regclass('public.extracted_deal_updates') IS NOT NULL THEN
    DROP POLICY IF EXISTS updates_select_own ON extracted_deal_updates;
    DROP POLICY IF EXISTS updates_insert_own ON extracted_deal_updates;
    DROP POLICY IF EXISTS updates_update_own ON extracted_deal_updates;
    CREATE POLICY updates_select_own ON extracted_deal_updates
      FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY updates_insert_own ON extracted_deal_updates
      FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY updates_update_own ON extracted_deal_updates
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT 'SUCCESS! User scoping columns and RLS policies created.' AS message;