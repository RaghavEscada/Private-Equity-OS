-- ============================================================================
-- CALL TRANSCRIPTS SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create call_transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  call_date TIMESTAMP DEFAULT NOW(),
  call_title TEXT, -- e.g., "Initial Discovery Call", "Follow-up #2"
  extracted_data JSONB, -- AI-extracted structured data
  extraction_status TEXT DEFAULT 'pending', -- pending, extracted, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create extracted_deal_updates table for tracking changes
CREATE TABLE IF NOT EXISTS extracted_deal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  transcript_id UUID NOT NULL REFERENCES call_transcripts(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL, -- e.g., 'revenue', 'valuation_ask', 'status'
  old_value TEXT,
  new_value TEXT,
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_transcripts_deal ON call_transcripts(deal_id, call_date DESC);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_status ON call_transcripts(extraction_status);
CREATE INDEX IF NOT EXISTS idx_extracted_updates_deal ON extracted_deal_updates(deal_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_extracted_updates_transcript ON extracted_deal_updates(transcript_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_transcript_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE call_transcripts
  SET updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_call_transcript_timestamp
  AFTER UPDATE ON call_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_call_transcript_updated_at();

-- ============================================================================
-- VERIFY TABLES WERE CREATED
-- ============================================================================
SELECT 'SUCCESS! Call transcripts and extracted updates tables created.' as message;


