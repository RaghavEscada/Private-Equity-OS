-- ============================================================================
-- CHAT SESSIONS SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, -- Auto-generated from first message or user-defined
  mode TEXT NOT NULL DEFAULT 'deals', -- deals, documents, loi, diligence
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  data JSONB, -- For structured data like deals, summaries
  message_order INTEGER NOT NULL, -- Order of message in conversation
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_created ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, message_order);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at when messages are added
CREATE TRIGGER update_chat_session_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_updated_at();

-- ============================================================================
-- VERIFY TABLES WERE CREATED
-- ============================================================================
SELECT 'SUCCESS! Chat sessions and messages tables created.' as message;


