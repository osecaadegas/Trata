-- =====================================================
-- FIX USER FAVORITES RLS - Run this in Supabase SQL Editor
-- =====================================================

-- First, ensure the user_favorites table exists
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON user_favorites(property_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Allow all favorites operations" ON user_favorites;

-- Create permissive policy for anon key (same approach as messages)
-- This allows the app to work with the anon key
CREATE POLICY "Allow all favorites operations"
ON user_favorites FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify
SELECT 'User favorites table ready!' as status;
SELECT COUNT(*) as total_favorites FROM user_favorites;
