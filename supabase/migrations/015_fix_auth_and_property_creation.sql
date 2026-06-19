-- =====================================================
-- Fix auth/user sync and property creation permissions
-- =====================================================
-- Safe to run on an existing Supabase project. It does not drop data.

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS lot_area_sqm INTEGER;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS featured_position INTEGER DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_featured_position
    ON public.properties(featured_position)
    WHERE featured_position IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '&background=10b981&color=fff'),
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.users (id, email, name, avatar_url, role)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || split_part(email, '@', 1) || '&background=10b981&color=fff'),
    'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Sellers can create properties" ON public.properties;
CREATE POLICY "Sellers can create properties"
    ON public.properties FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role IN ('seller', 'vendedor', 'admin', 'configurator', 'configurador')
        )
    );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Anyone can view property images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated can upload property images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'property-images')
    WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can delete own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'property-images');

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;

SELECT 'Auth and property creation repair complete' AS result;
