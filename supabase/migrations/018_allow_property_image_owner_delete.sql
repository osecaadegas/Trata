-- =====================================================
-- Allow property image cleanup for staff and upload owners
-- =====================================================
-- Configuradores/admins can delete any property image. Other authenticated
-- users can delete images only from their own top-level upload folder.

DROP POLICY IF EXISTS "Configurators can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Staff and owners can delete property images" ON storage.objects;

CREATE POLICY "Staff and owners can delete property images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'property-images'
        AND (
            EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                  AND role IN ('admin', 'configurator', 'configurador')
            )
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

SELECT 'Property image deletes allowed for staff and upload owners' AS result;
