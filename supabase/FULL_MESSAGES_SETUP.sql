-- =====================================================
-- FULL MESSAGES SETUP
-- Run this SINGLE file in Supabase SQL Editor
-- It creates the table AND inserts sample messages
-- =====================================================

-- 1. CREATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    property_id UUID,
    property_title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    assigned_to UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- 2. ADD MISSING COLUMNS IF TABLE EXISTS
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS property_title VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- 3. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 4. ENABLE RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING POLICIES (to avoid conflicts)
DROP POLICY IF EXISTS "Admins and vendors can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins and vendors can update messages" ON messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON messages;
DROP POLICY IF EXISTS "Anyone can submit messages" ON messages;

-- 6. CREATE POLICIES
CREATE POLICY "Admins and vendors can view all messages"
ON messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('configurator', 'admin', 'vendedor')
    )
);

CREATE POLICY "Admins and vendors can update messages"
ON messages FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('configurator', 'admin', 'vendedor')
    )
);

CREATE POLICY "Admins can delete messages"
ON messages FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('configurator', 'admin')
    )
);

CREATE POLICY "Anyone can submit messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. INSERT SAMPLE MESSAGES (delete existing first to avoid duplicates)
DELETE FROM messages;

INSERT INTO messages (name, email, phone, subject, message, property_title, status, notes, created_at) VALUES

-- Unread messages (most recent)
(
    'João Silva',
    'joao.silva@email.com',
    '+351 912 345 678',
    'comprar',
    'Olá, estou interessado no apartamento T3 em Braga Centro. Gostaria de agendar uma visita para o próximo fim de semana se possível. Tenho disponibilidade sábado de manhã ou domingo à tarde. Obrigado!',
    'Apartamento T3 Vista Mar',
    'unread',
    NULL,
    NOW() - INTERVAL '2 hours'
),
(
    'Ana Ferreira',
    'ana.ferreira@outlook.com',
    '+351 961 234 567',
    'avaliacao',
    'Bom dia, gostaria de solicitar uma avaliação gratuita do meu apartamento T2 em Guimarães. O imóvel tem cerca de 85m², está em bom estado e fica perto do centro. Quando seria possível agendar?',
    NULL,
    'unread',
    NULL,
    NOW() - INTERVAL '5 hours'
),
(
    'Carlos Mendes',
    'carlos.mendes@gmail.com',
    '+351 923 876 543',
    'interesse',
    'Vi a moradia T4 com jardim no vosso site e estou muito interessado. Podem enviar-me mais fotos e informações sobre a zona? Obrigado.',
    'Moradia T4 com Jardim',
    'unread',
    NULL,
    NOW() - INTERVAL '1 day'
),

-- Read messages
(
    'Maria Santos',
    'maria.santos@gmail.com',
    '+351 923 456 789',
    'vender',
    'Bom dia, gostaria de saber mais informações sobre como vender o meu imóvel através da TRATA. Tenho uma moradia T3 em Braga, zona de Gualtar, com cerca de 180m² e jardim. Qual é o processo e quais são as vossas comissões?',
    NULL,
    'read',
    'Cliente interessado em venda. Agendar chamada para amanhã.',
    NOW() - INTERVAL '2 days'
),
(
    'Ricardo Oliveira',
    'ricardo.oliveira@mail.com',
    '+351 915 678 901',
    'comprar',
    'Boa tarde, vi a moradia V4 em Barcelos e estou muito interessado. Qual é a disponibilidade para uma visita? Também gostaria de saber se há margem de negociação no preço. Aguardo resposta.',
    'Moradia V4 com Jardim',
    'read',
    'Visita agendada para 25/01 às 15h',
    NOW() - INTERVAL '3 days'
),
(
    'Sofia Costa',
    'sofia.costa@empresa.pt',
    '+351 936 789 012',
    'arrendar',
    'Preciso de um apartamento T2 para arrendar na zona de Braga. O meu orçamento é até 750€/mês. Tenho disponibilidade imediata para mudança. Têm alguma opção disponível?',
    NULL,
    'read',
    'Enviada lista de 3 imóveis disponíveis por email',
    NOW() - INTERVAL '4 days'
),

-- Replied messages
(
    'António Rodrigues',
    'antonio.rodrigues@gmail.com',
    '+351 967 890 123',
    'comprar',
    'Gostaria de informações sobre financiamento para compra de habitação. Trabalham com algum banco em particular? Qual o processo?',
    NULL,
    'replied',
    'Enviada informação sobre parcerias bancárias. Cliente vai analisar.',
    NOW() - INTERVAL '5 days'
),
(
    'Beatriz Almeida',
    'beatriz.almeida@hotmail.com',
    '+351 912 111 222',
    'interesse',
    'Olá! Vi o apartamento T2 renovado no centro e adorei. Ainda está disponível? Gostaria de fazer uma visita esta semana se possível.',
    'Apartamento T2 Renovado',
    'replied',
    'Visita realizada. Cliente vai pensar e dar resposta até sexta.',
    NOW() - INTERVAL '6 days'
),

-- Archived messages
(
    'Fernando Lima',
    'fernando.lima@outlook.pt',
    '+351 925 333 444',
    'arrendar',
    'Procuro um T1 ou T2 para arrendar perto da universidade do Minho. Sou estudante de mestrado e preciso do imóvel a partir de setembro.',
    NULL,
    'archived',
    'Sem imóveis disponíveis na zona pretendida. Contactar quando houver.',
    NOW() - INTERVAL '2 weeks'
),
(
    'Carla Nunes',
    'carla.nunes@gmail.com',
    '+351 968 555 666',
    'avaliacao',
    'Gostaria de avaliar o meu terreno em Vila Verde para possível venda. Tem cerca de 2000m² e está localizado numa zona residencial.',
    NULL,
    'archived',
    'Avaliação concluída. Cliente decidiu não vender por agora.',
    NOW() - INTERVAL '3 weeks'
);

-- 8. VERIFY
SELECT 
    status,
    COUNT(*) as count
FROM messages 
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'unread' THEN 1 
        WHEN 'read' THEN 2 
        WHEN 'replied' THEN 3 
        WHEN 'archived' THEN 4 
    END;
