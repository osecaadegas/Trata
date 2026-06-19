-- =====================================================
-- Restrict property image deletion to staff roles
-- =====================================================
-- The UI only exposes cleanup to configuradores, but storage deletion also
-- needs a database policy guard because client-side checks are not enough.

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Configurators can delete property images" ON storage.objects;

CREATE POLICY "Configurators can delete property images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'property-images'
        AND EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
              AND role IN ('admin', 'configurator', 'configurador')
        )
    );

SELECT 'Property image deletes restricted to configurators/admins' AS result;
