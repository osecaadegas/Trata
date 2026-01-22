-- =====================================================
-- FIX MESSAGES RLS - Run this in Supabase SQL Editor
-- =====================================================

-- Option 1: Temporarily disable RLS for testing (quick fix)
-- Uncomment the line below if you just want to test:
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Option 2: Add a permissive policy that allows anon access for reading
-- This is needed because the app uses the anon key

-- First, drop all existing policies
DROP POLICY IF EXISTS "Admins and vendors can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins and vendors can update messages" ON messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON messages;
DROP POLICY IF EXISTS "Anyone can submit messages" ON messages;
DROP POLICY IF EXISTS "Allow all to read messages" ON messages;
DROP POLICY IF EXISTS "Allow all to update messages" ON messages;
DROP POLICY IF EXISTS "Allow all to delete messages" ON messages;

-- Make sure RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that work with anon key
-- For a real production app, you'd want proper JWT auth, but for demo:

CREATE POLICY "Allow all to read messages"
ON messages FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all to update messages"
ON messages FOR UPDATE
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all to delete messages"
ON messages FOR DELETE
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can submit messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Verify messages exist
SELECT 'Messages in database:' as info, COUNT(*) as count FROM messages;

-- Show sample
SELECT id, name, email, status, created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;
