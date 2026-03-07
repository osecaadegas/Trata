-- =====================================================
-- Add seller_id to properties table
-- This links a property to a responsible seller whose
-- contact info is displayed on the property page
-- =====================================================

ALTER TABLE public.properties
ADD COLUMN seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Index for seller lookups
CREATE INDEX idx_properties_seller_id ON public.properties(seller_id);
