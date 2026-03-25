-- Add featured_position column to control display order of featured properties on homepage
ALTER TABLE public.properties ADD COLUMN featured_position INTEGER DEFAULT NULL;

-- Index for efficient ordering
CREATE INDEX idx_properties_featured_position ON public.properties(featured_position) WHERE featured_position IS NOT NULL;
