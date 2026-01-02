-- Grant read access to anonymous users (anon role)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.properties TO anon;

-- Grant read access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.properties TO authenticated;

-- Make sure the RLS policy is correct for anonymous users
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;

CREATE POLICY "Anyone can view available properties"
    ON public.properties
    FOR SELECT
    TO anon, authenticated
    USING (true);
