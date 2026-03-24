-- =====================================================
-- Add lot_area_sqm to properties table
-- Optional field for displaying the lot/terrain area
-- in square meters (separate from the built area)
-- =====================================================

ALTER TABLE public.properties
ADD COLUMN lot_area_sqm INTEGER;
