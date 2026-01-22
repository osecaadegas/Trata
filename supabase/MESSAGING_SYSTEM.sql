-- =====================================================
-- PROFESSIONAL MESSAGING SYSTEM
-- Email-to-Chat Bridge for Real Estate Platform
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. CONVERSATIONS TABLE (links users to properties with chat threads)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User info (the client)
    user_id TEXT NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_avatar TEXT,
    
    -- Property reference (optional - general inquiries have no property)
    property_id UUID,
    property_title VARCHAR(255),
    property_image TEXT,
    
    -- Assigned agent
    assigned_agent_id UUID,
    assigned_agent_name VARCHAR(255),
    assigned_agent_email VARCHAR(255),
    
    -- Conversation metadata
    subject VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'resolved')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Last message preview
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_by VARCHAR(20), -- 'user', 'agent', 'system'
    
    -- Unread counters
    user_unread_count INTEGER DEFAULT 0,
    agent_unread_count INTEGER DEFAULT 0,
    
    -- Presence tracking
    user_last_seen TIMESTAMP WITH TIME ZONE,
    user_is_typing BOOLEAN DEFAULT FALSE,
    agent_is_typing BOOLEAN DEFAULT FALSE,
    
    -- Email thread reference
    email_thread_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX idx_conv_user ON conversations(user_id);
CREATE INDEX idx_conv_property ON conversations(property_id);
CREATE INDEX idx_conv_agent ON conversations(assigned_agent_id);
CREATE INDEX idx_conv_status ON conversations(status);
CREATE INDEX idx_conv_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conv_user_unread ON conversations(user_id, user_unread_count) WHERE user_unread_count > 0;


-- 2. CHAT MESSAGES TABLE
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    
    -- Sender info
    sender_id TEXT,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    sender_avatar TEXT,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    
    -- Message content
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'property_card', 'system')),
    
    -- Attachments (JSON array)
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Email integration
    email_message_id VARCHAR(255),
    is_from_email BOOLEAN DEFAULT FALSE,
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for messages
CREATE INDEX idx_msg_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_msg_sender ON chat_messages(sender_id);
CREATE INDEX idx_msg_created ON chat_messages(created_at);
CREATE INDEX idx_msg_unread ON chat_messages(conversation_id, is_read) WHERE is_read = FALSE;


-- 3. USER PRESENCE TABLE (for online/offline tracking)
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    user_name VARCHAR(255),
    user_avatar TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_page VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_presence_user ON user_presence(user_id);
CREATE INDEX idx_presence_online ON user_presence(is_online) WHERE is_online = TRUE;


-- 4. ENABLE RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "conversations_policy" ON conversations;
DROP POLICY IF EXISTS "messages_policy" ON chat_messages;
DROP POLICY IF EXISTS "presence_policy" ON user_presence;

-- Permissive policies (for anon key - adjust for production)
CREATE POLICY "conversations_policy" ON conversations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "messages_policy" ON chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "presence_policy" ON user_presence FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 5. FUNCTION: Update conversation when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_message = LEFT(NEW.message, 200),
        last_message_at = NEW.created_at,
        last_message_by = NEW.sender_type,
        updated_at = NOW(),
        -- Increment unread counter for the other party
        user_unread_count = CASE 
            WHEN NEW.sender_type IN ('agent', 'system') THEN user_unread_count + 1 
            ELSE user_unread_count 
        END,
        agent_unread_count = CASE 
            WHEN NEW.sender_type = 'user' THEN agent_unread_count + 1 
            ELSE agent_unread_count 
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation ON chat_messages;
CREATE TRIGGER trigger_update_conversation
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_new_message();


-- 6. FUNCTION: Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_conversation_id UUID,
    p_reader_type VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    -- Mark messages as read
    UPDATE chat_messages 
    SET is_read = TRUE, read_at = NOW()
    WHERE conversation_id = p_conversation_id 
    AND is_read = FALSE
    AND sender_type != p_reader_type;
    
    -- Reset unread counter
    IF p_reader_type = 'user' THEN
        UPDATE conversations SET user_unread_count = 0 WHERE id = p_conversation_id;
    ELSE
        UPDATE conversations SET agent_unread_count = 0 WHERE id = p_conversation_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 7. FUNCTION: Update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    p_user_id TEXT,
    p_user_name VARCHAR(255) DEFAULT NULL,
    p_user_avatar TEXT DEFAULT NULL,
    p_current_page VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_presence (user_id, user_name, user_avatar, is_online, last_seen, current_page, updated_at)
    VALUES (p_user_id, p_user_name, p_user_avatar, TRUE, NOW(), p_current_page, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        user_name = COALESCE(EXCLUDED.user_name, user_presence.user_name),
        user_avatar = COALESCE(EXCLUDED.user_avatar, user_presence.user_avatar),
        is_online = TRUE,
        last_seen = NOW(),
        current_page = COALESCE(EXCLUDED.current_page, user_presence.current_page),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;


-- 8. FUNCTION: Set user offline (called when inactive for X minutes)
CREATE OR REPLACE FUNCTION set_inactive_users_offline()
RETURNS VOID AS $$
BEGIN
    UPDATE user_presence 
    SET is_online = FALSE 
    WHERE is_online = TRUE 
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;


-- 9. INSERT SAMPLE DATA
-- Create a sample conversation
INSERT INTO conversations (
    user_id, user_name, user_email, user_avatar,
    property_id, property_title, property_image,
    subject, status, priority,
    last_message, last_message_at, last_message_by,
    user_unread_count, agent_unread_count
) VALUES 
(
    'sample-user-1',
    'Miguel Monsanto',
    'miguel@email.com',
    'https://ui-avatars.com/api/?name=Miguel+Monsanto&background=10b981&color=fff',
    NULL,
    'Apartamento T3 Vista Mar',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    'Informações sobre o apartamento',
    'active',
    'normal',
    'Obrigado pela sua resposta! Vou analisar e dou feedback.',
    NOW() - INTERVAL '2 hours',
    'user',
    1,
    0
),
(
    'sample-user-2',
    'Ana Silva',
    'ana.silva@email.com',
    'https://ui-avatars.com/api/?name=Ana+Silva&background=10b981&color=fff',
    NULL,
    'Moradia T4 com Jardim',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
    'Agendamento de visita',
    'active',
    'high',
    'Perfeito! Sábado às 15h está confirmado.',
    NOW() - INTERVAL '30 minutes',
    'agent',
    2,
    1
);

-- Get the conversation IDs for sample messages
DO $$
DECLARE
    conv1_id UUID;
    conv2_id UUID;
BEGIN
    SELECT id INTO conv1_id FROM conversations WHERE user_name = 'Miguel Monsanto' LIMIT 1;
    SELECT id INTO conv2_id FROM conversations WHERE user_name = 'Ana Silva' LIMIT 1;
    
    -- Messages for conversation 1
    INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_type, message, created_at, is_read) VALUES
    (conv1_id, 'sample-user-1', 'Miguel Monsanto', 'user', 'Olá! Gostaria de saber mais informações sobre o apartamento T3 com vista mar.', NOW() - INTERVAL '1 day', TRUE),
    (conv1_id, 'agent-1', 'TRATA Imobiliária', 'agent', 'Bom dia Miguel! Claro, terei todo o gosto em ajudar. O apartamento tem 120m², 3 quartos, 2 casas de banho, varanda com vista mar e estacionamento. O preço é 285.000€. Tem interesse em agendar uma visita?', NOW() - INTERVAL '23 hours', TRUE),
    (conv1_id, 'sample-user-1', 'Miguel Monsanto', 'user', 'Sim, gostaria de visitar. Qual a disponibilidade?', NOW() - INTERVAL '22 hours', TRUE),
    (conv1_id, 'agent-1', 'TRATA Imobiliária', 'agent', 'Temos disponibilidade esta semana: quinta às 10h ou 16h, sexta às 14h, ou sábado às 11h. Qual prefere?', NOW() - INTERVAL '21 hours', TRUE),
    (conv1_id, 'sample-user-1', 'Miguel Monsanto', 'user', 'Obrigado pela sua resposta! Vou analisar e dou feedback.', NOW() - INTERVAL '2 hours', FALSE);
    
    -- Messages for conversation 2
    INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_type, message, created_at, is_read) VALUES
    (conv2_id, 'sample-user-2', 'Ana Silva', 'user', 'Boa tarde! A moradia T4 ainda está disponível?', NOW() - INTERVAL '3 hours', TRUE),
    (conv2_id, 'agent-1', 'TRATA Imobiliária', 'agent', 'Boa tarde Ana! Sim, ainda está disponível. É uma excelente opção com 200m², jardim privativo, garagem para 2 carros e acabamentos de qualidade.', NOW() - INTERVAL '2 hours 30 minutes', TRUE),
    (conv2_id, 'sample-user-2', 'Ana Silva', 'user', 'Ótimo! Podemos agendar uma visita para este sábado?', NOW() - INTERVAL '2 hours', TRUE),
    (conv2_id, 'agent-1', 'TRATA Imobiliária', 'agent', 'Perfeito! Sábado às 15h está confirmado.', NOW() - INTERVAL '30 minutes', FALSE);
END $$;


-- 10. VERIFY
SELECT 'Messaging system tables created!' as status;
SELECT 'Conversations:' as info, COUNT(*) as count FROM conversations;
SELECT 'Messages:' as info, COUNT(*) as count FROM chat_messages;
