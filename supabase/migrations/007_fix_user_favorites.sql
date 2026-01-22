-- Fix User Favorites RLS Policies
-- Run this in Supabase SQL Editor

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.user_favorites(property_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Anyone can view favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Anyone can add favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Anyone can delete favorites" ON public.user_favorites;

-- Create permissive policies for authenticated users
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_favorites TO authenticated;

-- Done!
SELECT 'User favorites policies fixed!' as result;
