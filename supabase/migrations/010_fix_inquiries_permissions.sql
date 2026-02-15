-- Fix permissions for inquiries table
-- Run this in Supabase SQL Editor

-- Drop existing policies that cause permission issues
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;

-- Create simple policies that don't reference users table for anonymous access

-- Allow anyone to INSERT (for the contact form)
CREATE POLICY "Allow anonymous inquiry submissions" ON public.inquiries
    FOR INSERT 
    WITH CHECK (true);

-- Allow authenticated users to view their own inquiries
CREATE POLICY "Users can view own inquiries by email" ON public.inquiries
    FOR SELECT 
    USING (
        -- Anonymous can't view
        -- Authenticated users can view if they're admin or it's their inquiry
        auth.uid() IS NOT NULL AND (
            auth.uid() = user_id OR
            email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
        )
    );

-- Allow admins to update/delete inquiries
CREATE POLICY "Admins can manage inquiries" ON public.inquiries
    FOR ALL 
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- Grant permissions
GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT ON public.inquiries TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;

-- Make sure the table has RLS enabled
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

SELECT 'Inquiries permissions fixed!' as result;
