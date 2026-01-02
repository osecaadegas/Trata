-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    price_type TEXT NOT NULL CHECK (price_type IN ('sale', 'rent')),
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'land', 'commercial')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm INTEGER,
    features TEXT[], -- Array of features like ["piscina", "garagem", "jardim"]
    images TEXT[], -- Array of image URLs
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'rented')),
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can create properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update all properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete all properties" ON public.properties;

-- Policy: Anyone can view available properties
CREATE POLICY "Anyone can view available properties"
    ON public.properties
    FOR SELECT
    USING (true);

-- Policy: Sellers and above can create properties
CREATE POLICY "Sellers can create properties"
    ON public.properties
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('seller', 'admin', 'configurator')
        )
    );

-- Policy: Sellers can update their own properties
CREATE POLICY "Sellers can update own properties"
    ON public.properties
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy: Admins can update all properties
CREATE POLICY "Admins can update all properties"
    ON public.properties
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator')
        )
    );

-- Policy: Sellers can delete their own properties
CREATE POLICY "Sellers can delete own properties"
    ON public.properties
    FOR DELETE
    USING (created_by = auth.uid());

-- Policy: Admins can delete all properties
CREATE POLICY "Admins can delete all properties"
    ON public.properties
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator')
        )
    );

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS on_property_updated ON public.properties;
CREATE TRIGGER on_property_updated
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own property images" ON storage.objects;

CREATE POLICY "Anyone can view property images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'property-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own property images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'property-images' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete own property images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'property-images' AND auth.uid()::text = owner);
