-- ============================================================================
-- SHOW DATABASE SCHEMA
-- Run this in Supabase SQL Editor to see all your table structures
-- ============================================================================

-- Show deals table schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'deals' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- Show all tables in your database
-- ============================================================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name 
   AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- Show detailed schema for ALL tables (optional - more detailed)
-- ============================================================================
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c 
  ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;










