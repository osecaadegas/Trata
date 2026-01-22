-- ============================================
-- Migration: Update properties table and add sample data
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, let's add the 'condition' column for property status (Novo/Renovado/Para Renovar)
-- and update property_type to include more options
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_property_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_property_type_check 
CHECK (property_type IN ('apartment', 'house', 'land', 'commercial', 'farm'));

-- Add condition column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'condition') THEN
        ALTER TABLE public.properties ADD COLUMN condition TEXT DEFAULT 'new' 
        CHECK (condition IN ('new', 'renovated', 'to_renovate'));
    END IF;
END $$;

-- Add city column for better location filtering
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'city') THEN
        ALTER TABLE public.properties ADD COLUMN city TEXT DEFAULT 'Braga';
    END IF;
END $$;

-- Add neighborhood column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'neighborhood') THEN
        ALTER TABLE public.properties ADD COLUMN neighborhood TEXT;
    END IF;
END $$;

-- ============================================
-- Insert Sample Properties Data
-- ============================================

-- Clear existing sample data (optional - remove if you want to keep existing)
-- DELETE FROM public.properties WHERE created_by IS NULL;

-- Insert 18 sample properties
INSERT INTO public.properties (
    title, 
    description, 
    location, 
    city,
    neighborhood,
    price, 
    price_type, 
    property_type, 
    bedrooms, 
    bathrooms, 
    area_sqm, 
    condition,
    features, 
    images, 
    status, 
    featured
) VALUES 
-- Property 1
(
    'Apartamento T3 com Vista Mar',
    'Magnífico apartamento T3 com vista mar, acabamentos de luxo, cozinha totalmente equipada e varanda ampla. Localizado em zona premium com fácil acesso a transportes e serviços.',
    'Braga, Centro',
    'Braga',
    'Centro',
    285000,
    'sale',
    'apartment',
    3,
    2,
    120,
    'new',
    ARRAY['Varanda', 'Cozinha Equipada', 'Estacionamento', 'Elevador'],
    ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'],
    'available',
    true
),
-- Property 2
(
    'Moradia T4 com Jardim',
    'Espaçosa moradia T4 com amplo jardim, garagem para 2 carros e acabamentos de qualidade. Zona residencial tranquila com excelente exposição solar.',
    'Braga, Gualtar',
    'Braga',
    'Gualtar',
    425000,
    'sale',
    'house',
    4,
    3,
    200,
    'renovated',
    ARRAY['Jardim', 'Garagem', 'Lareira', 'Churrasqueira'],
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'],
    'available',
    true
),
-- Property 3
(
    'Apartamento T2 Renovado',
    'Apartamento T2 totalmente renovado, com cozinha moderna e casa de banho nova. Excelente localização perto de escolas e comércio.',
    'Braga, São Vicente',
    'Braga',
    'São Vicente',
    175000,
    'sale',
    'apartment',
    2,
    1,
    85,
    'renovated',
    ARRAY['Cozinha Equipada', 'Vidros Duplos', 'Aquecimento Central'],
    ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 4
(
    'Terreno Urbanizável',
    'Terreno urbanizável com 500m², excelente para construção de moradia. Infraestruturas disponíveis e boa exposição solar.',
    'Braga, Palmeira',
    'Braga',
    'Palmeira',
    95000,
    'sale',
    'land',
    0,
    0,
    500,
    'new',
    ARRAY['Água', 'Luz', 'Saneamento'],
    ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 5
(
    'Moradia T5 de Luxo',
    'Moradia de luxo T5 com piscina, jardim paisagístico e acabamentos premium. Vista panorâmica e privacidade total.',
    'Braga, Bom Jesus',
    'Braga',
    'Bom Jesus',
    750000,
    'sale',
    'house',
    5,
    4,
    350,
    'new',
    ARRAY['Piscina', 'Jardim', 'Garagem', 'Domótica', 'Painéis Solares'],
    ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'],
    'available',
    true
),
-- Property 6
(
    'Apartamento T1 para Investimento',
    'Apartamento T1 com grande potencial de rentabilidade, ideal para investimento ou primeira casa. Necessita de algumas obras de modernização.',
    'Braga, Universidade',
    'Braga',
    'Universidade',
    125000,
    'sale',
    'apartment',
    1,
    1,
    45,
    'to_renovate',
    ARRAY['Perto da Universidade', 'Transportes'],
    ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 7
(
    'Moradia T3 com Piscina',
    'Moradia T3 com piscina aquecida, zona de barbecue e garagem. Excelente para família, em zona muito sossegada.',
    'Braga, Fraião',
    'Braga',
    'Fraião',
    385000,
    'sale',
    'house',
    3,
    2,
    180,
    'renovated',
    ARRAY['Piscina Aquecida', 'Churrasqueira', 'Garagem', 'Alarme'],
    ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'],
    'available',
    true
),
-- Property 8
(
    'Apartamento T4 Duplex',
    'Fantástico apartamento duplex T4 com terraço privativo. Acabamentos modernos e muita luz natural.',
    'Braga, Maximinos',
    'Braga',
    'Maximinos',
    320000,
    'sale',
    'apartment',
    4,
    2,
    150,
    'new',
    ARRAY['Terraço', 'Duplex', 'Garagem', 'Arrecadação'],
    ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 9
(
    'Quinta com 2 Hectares',
    'Quinta rústica com 2 hectares, casa principal para renovar e várias dependências. Grande potencial turístico ou agrícola.',
    'Braga, Priscos',
    'Braga',
    'Priscos',
    550000,
    'sale',
    'farm',
    6,
    3,
    20000,
    'to_renovate',
    ARRAY['Terreno Agrícola', 'Poço', 'Anexos', 'Vinha'],
    ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 10
(
    'Apartamento T2 com Varanda',
    'Apartamento T2 com varanda generosa, orientação sul e excelente luminosidade. Prédio com elevador e garagem.',
    'Braga, Real',
    'Braga',
    'Real',
    195000,
    'sale',
    'apartment',
    2,
    1,
    90,
    'new',
    ARRAY['Varanda', 'Elevador', 'Garagem', 'Orientação Sul'],
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 11
(
    'Moradia Geminada T3',
    'Moradia geminada T3 com quintal e garagem. Zona residencial familiar com boa vizinhança e acessos.',
    'Braga, Nogueira',
    'Braga',
    'Nogueira',
    295000,
    'sale',
    'house',
    3,
    2,
    140,
    'renovated',
    ARRAY['Quintal', 'Garagem', 'Lareira'],
    ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 12
(
    'Loja Comercial',
    'Espaço comercial em zona de grande movimento, com montra ampla e boas condições. Ideal para comércio ou serviços.',
    'Braga, Centro',
    'Braga',
    'Centro',
    180000,
    'sale',
    'commercial',
    0,
    1,
    75,
    'new',
    ARRAY['Montra', 'WC', 'Zona de Grande Movimento'],
    ARRAY['https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 13
(
    'Apartamento T3 com Terraço',
    'Último piso com terraço privativo de 30m². Vista desafogada e muita privacidade. Acabamentos de qualidade.',
    'Braga, São José',
    'Braga',
    'São José',
    265000,
    'sale',
    'apartment',
    3,
    2,
    110,
    'new',
    ARRAY['Terraço', 'Último Piso', 'Vista Desafogada', 'Garagem'],
    ARRAY['https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 14
(
    'Moradia T4 Moderna',
    'Moradia contemporânea T4 com linhas modernas, piscina e jardim. Domótica e eficiência energética A+.',
    'Braga, Lamaçães',
    'Braga',
    'Lamaçães',
    480000,
    'sale',
    'house',
    4,
    3,
    220,
    'new',
    ARRAY['Piscina', 'Domótica', 'Eficiência A+', 'Painéis Solares'],
    ARRAY['https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop'],
    'available',
    true
),
-- Property 15
(
    'Apartamento T1 Centro Histórico',
    'Charmoso T1 no centro histórico, totalmente renovado mantendo características originais. Ideal para turismo ou habitação.',
    'Braga, Sé',
    'Braga',
    'Sé',
    145000,
    'sale',
    'apartment',
    1,
    1,
    55,
    'renovated',
    ARRAY['Centro Histórico', 'Renovado', 'Características Originais'],
    ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 16
(
    'Terreno Industrial',
    'Terreno industrial com 2000m², junto a zona industrial consolidada. Todas as infraestruturas disponíveis.',
    'Braga, Celeirós',
    'Braga',
    'Celeirós',
    250000,
    'sale',
    'land',
    0,
    0,
    2000,
    'new',
    ARRAY['Zona Industrial', 'Infraestruturas', 'Bons Acessos'],
    ARRAY['https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 17
(
    'Moradia T3 para Renovar',
    'Moradia T3 com bom potencial, necessita de obras de modernização. Terreno com 300m² e boa localização.',
    'Braga, Ferreiros',
    'Braga',
    'Ferreiros',
    165000,
    'sale',
    'house',
    3,
    1,
    130,
    'to_renovate',
    ARRAY['Terreno 300m²', 'Potencial de Valorização'],
    ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop'],
    'available',
    false
),
-- Property 18
(
    'Apartamento T2 com Garagem',
    'Excelente T2 com garagem box e arrecadação. Cozinha equipada, roupeiros embutidos e excelentes acabamentos.',
    'Braga, Carandá',
    'Braga',
    'Carandá',
    210000,
    'sale',
    'apartment',
    2,
    1,
    95,
    'new',
    ARRAY['Garagem Box', 'Arrecadação', 'Cozinha Equipada', 'Roupeiros'],
    ARRAY['https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop'],
    'available',
    false
);

-- ============================================
-- Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_condition ON public.properties(condition);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON public.properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);

-- ============================================
-- Verify the data was inserted
-- ============================================
-- SELECT COUNT(*) as total_properties FROM public.properties;
-- SELECT * FROM public.properties ORDER BY created_at DESC LIMIT 5;
