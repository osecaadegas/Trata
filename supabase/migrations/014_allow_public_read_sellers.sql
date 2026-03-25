-- Fix 1: "permission denied for table users" on inquiry form
-- The "Admins can manage inquiries" FOR ALL policy causes the error because
-- it references public.users but the anon role can't read that table.
-- Split it into separate policies that don't apply to INSERT.

DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;

-- Admin SELECT on inquiries (already covered by "Users can view own inquiries by email" but this ensures full access)
CREATE POLICY "Admins can view all inquiries" ON public.inquiries
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- Admin UPDATE on inquiries
CREATE POLICY "Admins can update inquiries" ON public.inquiries
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- Admin DELETE on inquiries
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador', 'vendedor'))
    );

-- Fix 2: Allow public read of seller info from users table
-- Needed for PropertyDetailPage seller display and ContactPage seller dropdown
GRANT SELECT ON public.users TO anon;

CREATE POLICY "Anyone can read basic seller info"
    ON public.users FOR SELECT
    TO anon
    USING (role IN ('vendedor', 'seller', 'admin', 'configurador'));

SELECT 'Inquiries + seller permissions fixed!' as result;
