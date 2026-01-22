-- =====================================================
-- TRATA IMOBILIÁRIA - DADOS DE TESTE (MOCK DATA)
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Executa PRIMEIRO o ficheiro COMPLETE_DATABASE_SETUP.sql
-- 2. Depois executa este ficheiro para adicionar dados de teste
--
-- Este script adiciona:
-- ✓ 10 utilizadores de teste (admin, vendedores, utilizadores)
-- ✓ 15 imóveis variados (apartamentos, moradias, terrenos, etc.)
-- ✓ 8 mensagens de contacto
-- ✓ 5 conversas de chat com mensagens
-- ✓ Dados de presença online
-- =====================================================


-- =====================================================
-- PARTE 0: UTILIZADORES DE TESTE
-- =====================================================
-- NOTA: Em produção, os utilizadores são criados automaticamente
-- quando fazem login via Google/Email. 
-- Para dados de demonstração, precisamos desativar temporariamente a FK.

-- Desativar temporariamente a constraint FK para permitir dados de teste
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

INSERT INTO public.users (id, email, name, avatar_url, role, phone, created_at) VALUES

-- Configuradores (1)
(
    'cfg00001-0000-0000-0000-000000000001',
    'admin@trata.pt',
    'Admin TRATA',
    'https://ui-avatars.com/api/?name=Admin+TRATA&background=7c3aed&color=fff',
    'configurador',
    '+351 253 000 001',
    NOW() - INTERVAL '6 months'
),

-- Administradores (2)
(
    'adm00001-0000-0000-0000-000000000001',
    'maria.gestora@trata.pt',
    'Maria Gestora',
    'https://ui-avatars.com/api/?name=Maria+Gestora&background=dc2626&color=fff',
    'admin',
    '+351 253 000 002',
    NOW() - INTERVAL '5 months'
),
(
    'adm00002-0000-0000-0000-000000000002',
    'joao.admin@trata.pt',
    'João Administrador',
    'https://ui-avatars.com/api/?name=Joao+Admin&background=dc2626&color=fff',
    'admin',
    '+351 253 000 003',
    NOW() - INTERVAL '4 months'
),

-- Vendedores (3)
(
    'vnd00001-0000-0000-0000-000000000001',
    'carlos.vendedor@trata.pt',
    'Carlos Silva',
    'https://ui-avatars.com/api/?name=Carlos+Silva&background=059669&color=fff',
    'vendedor',
    '+351 912 345 678',
    NOW() - INTERVAL '3 months'
),
(
    'vnd00002-0000-0000-0000-000000000002',
    'ana.vendedora@trata.pt',
    'Ana Ferreira',
    'https://ui-avatars.com/api/?name=Ana+Ferreira&background=059669&color=fff',
    'vendedor',
    '+351 963 852 741',
    NOW() - INTERVAL '3 months'
),
(
    'vnd00003-0000-0000-0000-000000000003',
    'pedro.vendedor@trata.pt',
    'Pedro Santos',
    'https://ui-avatars.com/api/?name=Pedro+Santos&background=059669&color=fff',
    'vendedor',
    '+351 936 147 258',
    NOW() - INTERVAL '2 months'
),

-- Utilizadores normais (4)
(
    'usr00001-0000-0000-0000-000000000001',
    'miguel.cliente@gmail.com',
    'Miguel Costa',
    'https://ui-avatars.com/api/?name=Miguel+Costa&background=3b82f6&color=fff',
    'user',
    '+351 915 753 159',
    NOW() - INTERVAL '2 months'
),
(
    'usr00002-0000-0000-0000-000000000002',
    'sofia.cliente@gmail.com',
    'Sofia Ribeiro',
    'https://ui-avatars.com/api/?name=Sofia+Ribeiro&background=ec4899&color=fff',
    'user',
    '+351 961 357 951',
    NOW() - INTERVAL '1 month'
),
(
    'usr00003-0000-0000-0000-000000000003',
    'ricardo.cliente@hotmail.com',
    'Ricardo Almeida',
    'https://ui-avatars.com/api/?name=Ricardo+Almeida&background=f59e0b&color=fff',
    'user',
    '+351 933 666 999',
    NOW() - INTERVAL '2 weeks'
),
(
    'usr00004-0000-0000-0000-000000000004',
    'beatriz.cliente@yahoo.com',
    'Beatriz Oliveira',
    'https://ui-avatars.com/api/?name=Beatriz+Oliveira&background=6366f1&color=fff',
    'user',
    '+351 966 333 222',
    NOW() - INTERVAL '1 week'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone;


-- =====================================================
-- PARTE 1: IMÓVEIS DE TESTE
-- =====================================================

INSERT INTO public.properties (
    title, description, location, neighborhood, price, price_type, 
    property_type, condition, bedrooms, bathrooms, area_sqm, year_built,
    energy_rating, features, images, virtual_tour_url, video_url, 
    status, featured
) VALUES 

-- 1. Apartamento T3 Vista Mar (DESTAQUE)
(
    'Apartamento T3 com Vista Mar Deslumbrante',
    'Magnífico apartamento T3 com vista panorâmica sobre o mar. Acabamentos de luxo, cozinha totalmente equipada, suite com closet. Localização privilegiada a 5 minutos da praia. Excelente exposição solar. Condomínio com piscina e ginásio.',
    'Braga, Centro',
    'Avenida da Liberdade',
    285000.00,
    'sale',
    'apartment',
    'new',
    3,
    2,
    120,
    2024,
    'A',
    ARRAY['piscina', 'garagem', 'varanda', 'elevador', 'ar_condicionado', 'cozinha_equipada', 'vista_mar'],
    ARRAY[
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    'https://my.matterport.com/show/?m=example1',
    'https://www.youtube.com/watch?v=example1',
    'available',
    true
),

-- 2. Moradia T4 com Jardim (DESTAQUE)
(
    'Moradia T4 com Jardim e Piscina',
    'Fantástica moradia T4 inserida em lote de 500m². Jardim com piscina aquecida, churrasqueira e zona de lazer. 4 suites, sala com 50m², cozinha americana. Garagem para 3 carros. Acabamentos premium.',
    'Braga, Gualtar',
    'Urbanização das Flores',
    425000.00,
    'sale',
    'house',
    'renovated',
    4,
    3,
    200,
    2020,
    'A+',
    ARRAY['piscina', 'garagem', 'jardim', 'churrasqueira', 'suite', 'lareira', 'aquecimento', 'paineis_solares'],
    ARRAY[
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    NULL,
    'https://www.youtube.com/watch?v=example2',
    'available',
    true
),

-- 3. Apartamento T2 Renovado
(
    'Apartamento T2 Totalmente Renovado',
    'Apartamento T2 completamente renovado em 2023. Cozinha equipada com eletrodomésticos Bosch, casa de banho moderna. Excelente localização junto a transportes e comércio.',
    'Braga, São Vicente',
    'Rua de São Vicente',
    175000.00,
    'sale',
    'apartment',
    'renovated',
    2,
    1,
    85,
    1995,
    'B',
    ARRAY['cozinha_equipada', 'vidros_duplos', 'aquecimento'],
    ARRAY[
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 4. Terreno Urbanizável
(
    'Terreno Urbanizável com Projeto Aprovado',
    'Excelente terreno de 500m² com projeto aprovado para moradia T4. Todas as infraestruturas disponíveis (água, luz, saneamento). Vista desafogada. Zona residencial tranquila.',
    'Braga, Palmeira',
    'Monte da Palmeira',
    95000.00,
    'sale',
    'land',
    'new',
    0,
    0,
    500,
    NULL,
    'isento',
    ARRAY[]::TEXT[],
    ARRAY[
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 5. Moradia T5 de Luxo (DESTAQUE)
(
    'Moradia T5 de Luxo em Bom Jesus',
    'Imponente moradia T5 com vistas deslumbrantes sobre a cidade. Piscina infinita, jardim paisagístico, home cinema, adega climatizada. 5 suites com closet. Domótica completa. Segurança 24h.',
    'Braga, Bom Jesus',
    'Estrada do Bom Jesus',
    750000.00,
    'sale',
    'house',
    'new',
    5,
    4,
    350,
    2023,
    'A+',
    ARRAY['piscina', 'garagem', 'jardim', 'suite', 'closet', 'lareira', 'ginasio', 'sauna', 'jacuzzi', 'condominio_fechado', 'video_vigilancia', 'alarme', 'paineis_solares', 'vista_montanha'],
    ARRAY[
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    ],
    'https://my.matterport.com/show/?m=example5',
    'https://www.youtube.com/watch?v=example5',
    'available',
    true
),

-- 6. Apartamento T1 para Investimento
(
    'Apartamento T1 Ideal para Investimento',
    'Apartamento T1 junto à Universidade do Minho. Rentabilidade garantida. Atualmente arrendado a 450€/mês. Excelente estado de conservação.',
    'Braga, Gualtar',
    'Campus de Gualtar',
    125000.00,
    'sale',
    'apartment',
    'to_renovate',
    1,
    1,
    45,
    1990,
    'D',
    ARRAY['elevador'],
    ARRAY[
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 7. Moradia T3 com Piscina
(
    'Moradia T3 com Piscina e Jardim',
    'Encantadora moradia T3 num lote de 400m². Piscina, jardim relvado e zona de refeições exterior. Sala ampla com recuperador de calor. Cozinha equipada. Garagem box.',
    'Braga, Fraião',
    'Urbanização do Fraião',
    385000.00,
    'sale',
    'house',
    'renovated',
    3,
    2,
    180,
    2010,
    'B',
    ARRAY['piscina', 'garagem', 'jardim', 'churrasqueira', 'lareira', 'cozinha_equipada'],
    ARRAY[
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 8. Apartamento T4 Duplex (DESTAQUE)
(
    'Apartamento T4 Duplex de Luxo',
    'Espetacular apartamento T4 duplex no último andar. Terraço privativo de 80m² com jacuzzi. Vista 360º sobre a cidade. 2 lugares de garagem. Acabamentos de alta qualidade.',
    'Braga, Centro',
    'Avenida Central',
    320000.00,
    'sale',
    'apartment',
    'new',
    4,
    2,
    150,
    2024,
    'A',
    ARRAY['terraço', 'garagem', 'elevador', 'ar_condicionado', 'jacuzzi', 'cozinha_equipada', 'suite'],
    ARRAY[
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop'
    ],
    'https://my.matterport.com/show/?m=example8',
    NULL,
    'available',
    true
),

-- 9. Quinta com 2 Hectares
(
    'Quinta Tradicional com 2 Hectares',
    'Magnífica quinta com casa principal de 6 quartos, casa de caseiro, piscina, vinha, pomar e terreno agrícola. Ideal para turismo rural ou habitação própria. Água de nascente.',
    'Braga, Priscos',
    'Lugar de Priscos',
    550000.00,
    'sale',
    'farm',
    'to_renovate',
    6,
    3,
    20000,
    1920,
    'F',
    ARRAY['piscina', 'jardim', 'lareira', 'churrasqueira', 'arrecadacao'],
    ARRAY[
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 10. Loja Comercial
(
    'Loja Comercial em Zona Prime',
    'Excelente loja comercial no centro histórico de Braga. Grande montra, pé direito alto. Ideal para comércio, restauração ou serviços. Muito movimento pedonal.',
    'Braga, Centro',
    'Rua do Souto',
    180000.00,
    'sale',
    'commercial',
    'new',
    0,
    1,
    75,
    2000,
    'C',
    ARRAY['ar_condicionado'],
    ARRAY[
        'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 11. Apartamento T3 para Arrendar
(
    'Apartamento T3 Mobilado para Arrendar',
    'Apartamento T3 completamente mobilado e equipado, pronto a habitar. Excelente localização, próximo de escolas, supermercados e transportes. Disponível imediatamente.',
    'Braga, São José de São Lázaro',
    'Rua de São José',
    850.00,
    'rent',
    'apartment',
    'renovated',
    3,
    2,
    100,
    2005,
    'C',
    ARRAY['garagem', 'elevador', 'cozinha_equipada', 'mobilado', 'ar_condicionado'],
    ARRAY[
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 12. Moradia T4 Moderna (DESTAQUE)
(
    'Moradia T4 de Arquitetura Moderna',
    'Moradia T4 de linhas contemporâneas, projetada por arquiteto premiado. Grandes vãos envidraçados, integração perfeita com o exterior. Piscina de água salgada, jardim minimalista.',
    'Braga, Lamaçães',
    'Urbanização Nova Lamaçães',
    480000.00,
    'sale',
    'house',
    'new',
    4,
    3,
    220,
    2024,
    'A+',
    ARRAY['piscina', 'garagem', 'jardim', 'suite', 'closet', 'escritorio', 'aquecimento', 'paineis_solares', 'vidros_duplos'],
    ARRAY[
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop'
    ],
    'https://my.matterport.com/show/?m=example12',
    'https://www.youtube.com/watch?v=example12',
    'available',
    true
),

-- 13. Apartamento T1 Centro Histórico
(
    'Apartamento T1 no Centro Histórico',
    'Charmoso apartamento T1 num edifício reabilitado do séc. XVIII. Tetos originais em madeira, paredes em pedra. Cozinha e casa de banho modernas. Localização única.',
    'Braga, Sé',
    'Largo da Sé',
    145000.00,
    'sale',
    'apartment',
    'renovated',
    1,
    1,
    55,
    1750,
    'D',
    ARRAY['cozinha_equipada'],
    ARRAY[
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 14. Moradia T3 para Renovar
(
    'Moradia T3 com Potencial - Para Renovar',
    'Moradia T3 em pedra, inserida em lote de 300m². Necessita de obras de remodelação. Excelente oportunidade para quem procura personalizar a sua casa. Zona muito tranquila.',
    'Braga, Ferreiros',
    'Lugar de Ferreiros',
    165000.00,
    'sale',
    'house',
    'to_renovate',
    3,
    1,
    130,
    1960,
    'G',
    ARRAY['jardim', 'lareira'],
    ARRAY[
        'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'available',
    false
),

-- 15. Apartamento T2 Vendido (para mostrar estado)
(
    'Apartamento T2 com Garagem',
    'Apartamento T2 com lugar de garagem e arrecadação. Boas áreas, muita luz natural. Prédio com elevador. Próximo de todos os serviços.',
    'Braga, Carandá',
    'Avenida do Carandá',
    210000.00,
    'sale',
    'apartment',
    'new',
    2,
    1,
    95,
    2022,
    'B',
    ARRAY['garagem', 'elevador', 'arrecadacao', 'cozinha_equipada'],
    ARRAY[
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop'
    ],
    NULL,
    NULL,
    'sold',
    false
);


-- =====================================================
-- PARTE 2: MENSAGENS DE CONTACTO (FORMULÁRIO)
-- =====================================================

-- Get some property IDs for references
DO $$
DECLARE
    prop1_id UUID;
    prop2_id UUID;
    prop5_id UUID;
BEGIN
    SELECT id INTO prop1_id FROM public.properties WHERE title LIKE '%Vista Mar%' LIMIT 1;
    SELECT id INTO prop2_id FROM public.properties WHERE title LIKE '%Jardim e Piscina%' LIMIT 1;
    SELECT id INTO prop5_id FROM public.properties WHERE title LIKE '%Luxo em Bom Jesus%' LIMIT 1;

    INSERT INTO public.messages (name, email, phone, subject, message, property_id, property_title, status, created_at) VALUES
    
    -- Mensagem 1 - Não lida
    (
        'João Silva',
        'joao.silva@email.com',
        '+351 912 345 678',
        'Interesse no Apartamento T3',
        'Bom dia! Tenho muito interesse no apartamento T3 com vista mar. Gostaria de agendar uma visita para este fim de semana se possível. Tenho disponibilidade sábado de manhã ou domingo à tarde. Aguardo contacto. Cumprimentos, João Silva',
        prop1_id,
        'Apartamento T3 com Vista Mar Deslumbrante',
        'unread',
        NOW() - INTERVAL '2 hours'
    ),
    
    -- Mensagem 2 - Não lida
    (
        'Maria Santos',
        'maria.santos@gmail.com',
        '+351 963 852 741',
        'Pedido de informações',
        'Boa tarde, vi o vosso anúncio da moradia T4 em Gualtar e gostaria de saber se o preço é negociável. Também gostaria de saber se aceitam troca por apartamento. Obrigada.',
        prop2_id,
        'Moradia T4 com Jardim e Piscina',
        'unread',
        NOW() - INTERVAL '5 hours'
    ),
    
    -- Mensagem 3 - Lida
    (
        'Pedro Costa',
        'pedro.costa@hotmail.com',
        '+351 936 147 258',
        'Proposta de compra',
        'Olá, gostaria de fazer uma proposta de 700.000€ pela moradia T5 em Bom Jesus. Tenho financiamento aprovado e posso avançar rapidamente. Aguardo resposta.',
        prop5_id,
        'Moradia T5 de Luxo em Bom Jesus',
        'read',
        NOW() - INTERVAL '1 day'
    ),
    
    -- Mensagem 4 - Respondida
    (
        'Ana Ferreira',
        'ana.ferreira@outlook.com',
        '+351 915 753 159',
        'Visita realizada - Feedback',
        'Bom dia, visitei o apartamento T2 em São Vicente ontem e gostei muito. Vou pensar e dou feedback até ao final da semana. Obrigada pela disponibilidade.',
        NULL,
        'Apartamento T2 Totalmente Renovado',
        'replied',
        NOW() - INTERVAL '2 days'
    ),
    
    -- Mensagem 5 - Arquivada
    (
        'Carlos Mendes',
        'carlos.mendes@empresa.pt',
        '+351 961 357 951',
        'Contacto comercial',
        'Boa tarde, sou investidor imobiliário e estou interessado em adquirir vários imóveis para arrendamento. Gostaria de marcar uma reunião para discutir oportunidades.',
        NULL,
        NULL,
        'archived',
        NOW() - INTERVAL '1 week'
    ),
    
    -- Mensagem 6 - Não lida
    (
        'Sofia Ribeiro',
        'sofia.ribeiro@gmail.com',
        NULL,
        'Dúvida sobre financiamento',
        'Olá! Estou interessada num dos vossos apartamentos mas tenho dúvidas sobre o processo de financiamento. Trabalham com algum banco em específico? Podem ajudar com a papelada?',
        NULL,
        NULL,
        'unread',
        NOW() - INTERVAL '30 minutes'
    ),
    
    -- Mensagem 7 - Não lida
    (
        'Ricardo Almeida',
        'ricardo.almeida@gmail.com',
        '+351 933 666 999',
        'Terreno em Palmeira',
        'Boa noite, sobre o terreno em Palmeira, qual é a área de implantação máxima permitida? O projeto aprovado pode ser alterado? Obrigado.',
        NULL,
        'Terreno Urbanizável com Projeto Aprovado',
        'unread',
        NOW() - INTERVAL '4 hours'
    ),
    
    -- Mensagem 8 - Lida
    (
        'Beatriz Oliveira',
        'beatriz.oliveira@yahoo.com',
        '+351 966 333 222',
        'Arrendamento T3',
        'Olá, o apartamento T3 para arrendar ainda está disponível? Somos um casal jovem com emprego estável. Podemos enviar documentação. Quando podemos visitar?',
        NULL,
        'Apartamento T3 Mobilado para Arrendar',
        'read',
        NOW() - INTERVAL '6 hours'
    );
END $$;


-- =====================================================
-- PARTE 3: CONVERSAS E MENSAGENS DE CHAT
-- =====================================================

-- Conversa 1: Miguel interessado no apartamento T3
INSERT INTO public.conversations (
    user_id, user_name, user_email, user_avatar,
    property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES (
    'user-miguel-123',
    'Miguel Monsanto',
    'miguel.monsanto@email.com',
    'https://ui-avatars.com/api/?name=Miguel+Monsanto&background=10b981&color=fff',
    'Apartamento T3 com Vista Mar Deslumbrante',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    'Informações sobre o apartamento T3',
    'active',
    'normal',
    'Vou verificar a agenda e confirmo. Obrigado!',
    NOW() - INTERVAL '30 minutes',
    'user',
    0,
    1
);

-- Mensagens da Conversa 1
INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-miguel-123',
    'Miguel Monsanto',
    'user',
    'Olá! Gostaria de saber mais informações sobre o apartamento T3 com vista mar. Qual a disponibilidade para visitas?',
    TRUE,
    NOW() - INTERVAL '2 hours'
FROM public.conversations c WHERE c.user_name = 'Miguel Monsanto';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'agent-trata',
    'TRATA Imobiliária',
    'agent',
    'Bom dia Miguel! O apartamento está disponível para visitas. Temos horários livres na quinta às 10h ou 16h, sexta às 14h, ou sábado às 11h. Qual lhe dá mais jeito?',
    TRUE,
    NOW() - INTERVAL '1 hour 45 minutes'
FROM public.conversations c WHERE c.user_name = 'Miguel Monsanto';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-miguel-123',
    'Miguel Monsanto',
    'user',
    'Sábado às 11h seria perfeito! O apartamento tem garagem incluída no preço?',
    TRUE,
    NOW() - INTERVAL '1 hour'
FROM public.conversations c WHERE c.user_name = 'Miguel Monsanto';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'agent-trata',
    'TRATA Imobiliária',
    'agent',
    'Sim, o preço inclui 1 lugar de garagem box. O condomínio também tem piscina e ginásio. Confirmo então sábado às 11h?',
    TRUE,
    NOW() - INTERVAL '45 minutes'
FROM public.conversations c WHERE c.user_name = 'Miguel Monsanto';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-miguel-123',
    'Miguel Monsanto',
    'user',
    'Vou verificar a agenda e confirmo. Obrigado!',
    FALSE,
    NOW() - INTERVAL '30 minutes'
FROM public.conversations c WHERE c.user_name = 'Miguel Monsanto';


-- Conversa 2: Ana interessada na moradia T4
INSERT INTO public.conversations (
    user_id, user_name, user_email, user_avatar,
    property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES (
    'user-ana-456',
    'Ana Silva',
    'ana.silva@gmail.com',
    'https://ui-avatars.com/api/?name=Ana+Silva&background=3b82f6&color=fff',
    'Moradia T4 com Jardim e Piscina',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    'Agendamento de visita - Moradia T4',
    'active',
    'high',
    'Perfeito! Sábado às 15h está confirmado. Envio-lhe a morada por email.',
    NOW() - INTERVAL '1 hour',
    'agent',
    1,
    0
);

-- Mensagens da Conversa 2
INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-ana-456',
    'Ana Silva',
    'user',
    'Boa tarde! A moradia T4 em Gualtar ainda está disponível? Adorei as fotos!',
    TRUE,
    NOW() - INTERVAL '3 hours'
FROM public.conversations c WHERE c.user_name = 'Ana Silva';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'agent-trata',
    'TRATA Imobiliária',
    'agent',
    'Boa tarde Ana! Sim, ainda está disponível. É realmente uma moradia fantástica. Gostaria de agendar uma visita?',
    TRUE,
    NOW() - INTERVAL '2 hours 30 minutes'
FROM public.conversations c WHERE c.user_name = 'Ana Silva';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-ana-456',
    'Ana Silva',
    'user',
    'Sim! Podemos marcar para este sábado à tarde?',
    TRUE,
    NOW() - INTERVAL '2 hours'
FROM public.conversations c WHERE c.user_name = 'Ana Silva';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'agent-trata',
    'TRATA Imobiliária',
    'agent',
    'Perfeito! Sábado às 15h está confirmado. Envio-lhe a morada por email.',
    FALSE,
    NOW() - INTERVAL '1 hour'
FROM public.conversations c WHERE c.user_name = 'Ana Silva';


-- Conversa 3: Pedro com proposta urgente
INSERT INTO public.conversations (
    user_id, user_name, user_email, user_avatar,
    property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES (
    'user-pedro-789',
    'Pedro Costa',
    'pedro.costa@hotmail.com',
    'https://ui-avatars.com/api/?name=Pedro+Costa&background=f59e0b&color=fff',
    'Moradia T5 de Luxo em Bom Jesus',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
    'Proposta de compra - Moradia T5',
    'active',
    'urgent',
    'Gostaria de fazer uma proposta de 700.000€. Tenho financiamento aprovado.',
    NOW() - INTERVAL '5 hours',
    'user',
    0,
    3
);

-- Mensagens da Conversa 3
INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-pedro-789',
    'Pedro Costa',
    'user',
    'Bom dia! Visitei a moradia T5 em Bom Jesus ontem e fiquei encantado. É exatamente o que procuro.',
    TRUE,
    NOW() - INTERVAL '6 hours'
FROM public.conversations c WHERE c.user_name = 'Pedro Costa';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-pedro-789',
    'Pedro Costa',
    'user',
    'Gostaria de fazer uma proposta de 700.000€. Tenho financiamento aprovado.',
    FALSE,
    NOW() - INTERVAL '5 hours'
FROM public.conversations c WHERE c.user_name = 'Pedro Costa';


-- Conversa 4: Sofia com dúvidas gerais
INSERT INTO public.conversations (
    user_id, user_name, user_email, user_avatar,
    property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES (
    'user-sofia-321',
    'Sofia Ribeiro',
    'sofia.ribeiro@gmail.com',
    'https://ui-avatars.com/api/?name=Sofia+Ribeiro&background=ec4899&color=fff',
    NULL,
    NULL,
    'Dúvidas sobre processo de compra',
    'active',
    'normal',
    'Trabalhamos com vários bancos parceiros e podemos ajudar em todo o processo.',
    NOW() - INTERVAL '20 minutes',
    'agent',
    1,
    0
);

-- Mensagens da Conversa 4
INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-sofia-321',
    'Sofia Ribeiro',
    'user',
    'Olá! É a primeira vez que vou comprar casa e tenho muitas dúvidas. Podem ajudar-me com o processo de financiamento?',
    TRUE,
    NOW() - INTERVAL '40 minutes'
FROM public.conversations c WHERE c.user_name = 'Sofia Ribeiro';

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'agent-trata',
    'TRATA Imobiliária',
    'agent',
    'Claro que sim, Sofia! Trabalhamos com vários bancos parceiros e podemos ajudar em todo o processo.',
    FALSE,
    NOW() - INTERVAL '20 minutes'
FROM public.conversations c WHERE c.user_name = 'Sofia Ribeiro';


-- Conversa 5: Conversa arquivada/resolvida
INSERT INTO public.conversations (
    user_id, user_name, user_email, user_avatar,
    property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES (
    'user-carlos-999',
    'Carlos Mendes',
    'carlos.mendes@empresa.pt',
    'https://ui-avatars.com/api/?name=Carlos+Mendes&background=6366f1&color=fff',
    'Apartamento T2 com Garagem',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=300&fit=crop',
    'Compra concluída - T2 Carandá',
    'resolved',
    'normal',
    'Obrigado por tudo! Estou muito satisfeito com a compra.',
    NOW() - INTERVAL '3 days',
    'user',
    0,
    0
);

INSERT INTO public.chat_messages (conversation_id, sender_id, sender_name, sender_type, message, is_read, created_at)
SELECT 
    c.id,
    'user-carlos-999',
    'Carlos Mendes',
    'user',
    'Obrigado por tudo! Estou muito satisfeito com a compra.',
    TRUE,
    NOW() - INTERVAL '3 days'
FROM public.conversations c WHERE c.user_name = 'Carlos Mendes';


-- =====================================================
-- PARTE 4: DADOS DE PRESENÇA ONLINE
-- =====================================================

INSERT INTO public.user_presence (user_id, user_name, user_avatar, is_online, last_seen) VALUES
('user-miguel-123', 'Miguel Monsanto', 'https://ui-avatars.com/api/?name=Miguel+Monsanto&background=10b981&color=fff', TRUE, NOW()),
('user-ana-456', 'Ana Silva', 'https://ui-avatars.com/api/?name=Ana+Silva&background=3b82f6&color=fff', TRUE, NOW() - INTERVAL '5 minutes'),
('user-pedro-789', 'Pedro Costa', 'https://ui-avatars.com/api/?name=Pedro+Costa&background=f59e0b&color=fff', FALSE, NOW() - INTERVAL '2 hours'),
('user-sofia-321', 'Sofia Ribeiro', 'https://ui-avatars.com/api/?name=Sofia+Ribeiro&background=ec4899&color=fff', TRUE, NOW() - INTERVAL '1 minute'),
('user-carlos-999', 'Carlos Mendes', 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=6366f1&color=fff', FALSE, NOW() - INTERVAL '3 days');


-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT '✅ Sample data inserted successfully!' as status;
SELECT 'Users:' as table_name, COUNT(*) as count FROM public.users;
SELECT 'Properties:' as table_name, COUNT(*) as count FROM public.properties;
SELECT 'Messages:' as table_name, COUNT(*) as count FROM public.messages;
SELECT 'Conversations:' as table_name, COUNT(*) as count FROM public.conversations;
SELECT 'Chat Messages:' as table_name, COUNT(*) as count FROM public.chat_messages;
SELECT 'User Presence:' as table_name, COUNT(*) as count FROM public.user_presence;


-- =====================================================
-- SUMÁRIO DOS DADOS CRIADOS
-- =====================================================
-- 
-- UTILIZADORES (10 total):
-- - 1 configurador (admin@trata.pt)
-- - 2 administradores
-- - 3 vendedores
-- - 4 utilizadores normais
--
-- IMÓVEIS (15 total):
-- - 6 marcados como DESTAQUE (featured)
-- - 1 marcado como VENDIDO
-- - Vários tipos: apartamentos, moradias, terreno, quinta, comercial
-- - Preços de 95.000€ a 750.000€
-- - 1 imóvel para arrendamento (850€/mês)
--
-- MENSAGENS DE CONTACTO (8 total):
-- - 4 não lidas (unread)
-- - 2 lidas (read)
-- - 1 respondida (replied)
-- - 1 arquivada (archived)
--
-- CONVERSAS DE CHAT (5 total):
-- - 4 ativas
-- - 1 resolvida
-- - Prioridades: normal, high, urgent
-- - Total de ~15 mensagens de chat
--
-- UTILIZADORES ONLINE (5 total):
-- - 3 online
-- - 2 offline
-- =====================================================
