-- Fix: "permission denied for table users" on inquiry form
-- Root cause: .select() after .insert() triggers SELECT policy evaluation,
-- and multiple SELECT/ALL policies reference public.users table.
-- Fix: Drop ALL problematic policies and recreate clean ones.

-- Drop ALL known inquiry policies (various naming from migrations 008, 010, 014)
DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries by email" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow anonymous inquiry submissions" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can read basic seller info" ON public.users;

-- 1. Anyone can INSERT inquiries (no users table reference)
CREATE POLICY "Anyone can create inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

-- 2. Admin SELECT on inquiries
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- 3. Admin UPDATE on inquiries
CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- 4. Admin DELETE on inquiries
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- Grants
GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT ON public.inquiries TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;

-- Allow public read of seller info from users table
GRANT SELECT ON public.users TO anon;

CREATE POLICY "Anyone can read basic seller info"
    ON public.users FOR SELECT
    TO anon
    USING (role IN ('vendedor', 'seller', 'admin', 'configurador'));

SELECT 'Inquiries + seller permissions fixed!' as result;
