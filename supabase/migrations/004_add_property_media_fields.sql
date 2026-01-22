-- Add new columns to properties table for media and additional details
-- Run this in your Supabase SQL Editor

-- Add condition column (new, renovated, to_renovate)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'new' 
CHECK (condition IN ('new', 'renovated', 'to_renovate'));

-- Add virtual tour URL for 3D tours (Matterport, Kuula, etc.)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

-- Add video URL for property videos (YouTube, Vimeo)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add year built
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS year_built INTEGER;

-- Add energy rating/certificate
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS energy_rating TEXT 
CHECK (energy_rating IN ('A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'isento') OR energy_rating IS NULL);

-- Add neighborhood for more detailed location
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Add farm to property_type options (if not already there)
-- First drop the constraint, then re-add with farm included
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_property_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_property_type_check 
CHECK (property_type IN ('apartment', 'house', 'land', 'commercial', 'farm'));

-- Create index on new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_condition ON public.properties(condition);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON public.properties(year_built);
CREATE INDEX IF NOT EXISTS idx_properties_energy_rating ON public.properties(energy_rating);

-- Add comment to table
COMMENT ON COLUMN public.properties.virtual_tour_url IS 'URL for 3D virtual tour (Matterport, Kuula, etc.)';
COMMENT ON COLUMN public.properties.video_url IS 'URL for property video (YouTube, Vimeo)';
COMMENT ON COLUMN public.properties.year_built IS 'Year the property was built';
COMMENT ON COLUMN public.properties.energy_rating IS 'Energy certificate rating (A+ to G or isento)';
COMMENT ON COLUMN public.properties.condition IS 'Property condition: new, renovated, or to_renovate';
