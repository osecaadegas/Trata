-- =====================================================
-- TRATA IMOBILIÁRIA - COMPLETE DATABASE SETUP
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Vai ao Supabase Dashboard → SQL Editor
-- 2. Cria uma nova query
-- 3. Cola TODO este código
-- 4. Clica "Run" 
--
-- IMPORTANTE: Este script faz "DROP" de todas as tabelas existentes!
-- Todos os dados serão perdidos!
-- =====================================================


-- =====================================================
-- PARTE 1: LIMPAR TUDO (NUKE)
-- =====================================================

-- Drop all existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_on_new_message() CASCADE;
DROP FUNCTION IF EXISTS mark_messages_read(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS update_user_presence(TEXT, VARCHAR, TEXT, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS set_inactive_users_offline() CASCADE;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- =====================================================
-- PARTE 2: TABELA DE UTILIZADORES
-- =====================================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'vendedor', 'admin', 'configurator', 'configurador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Anyone authenticated can read users"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own data"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any user"
    ON public.users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator', 'configurador')
        )
    );

CREATE POLICY "Service role can do anything"
    ON public.users FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to handle new user signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_updated
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- PARTE 3: TABELA DE IMÓVEIS
-- =====================================================

CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    neighborhood TEXT,
    price DECIMAL(12, 2) NOT NULL,
    price_type TEXT NOT NULL DEFAULT 'sale' CHECK (price_type IN ('sale', 'rent')),
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'land', 'commercial', 'farm')),
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'renovated', 'to_renovate')),
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm INTEGER,
    year_built INTEGER,
    energy_rating TEXT CHECK (energy_rating IN ('A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G', 'isento') OR energy_rating IS NULL),
    features TEXT[],
    images TEXT[],
    virtual_tour_url TEXT,
    video_url TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'rented')),
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_featured ON public.properties(featured) WHERE featured = true;
CREATE INDEX idx_properties_created_by ON public.properties(created_by);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policies for properties
CREATE POLICY "Anyone can view properties"
    ON public.properties FOR SELECT
    TO anon, authenticated
    USING (true);

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

CREATE POLICY "Sellers can update own properties"
    ON public.properties FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Admins can update any property"
    ON public.properties FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator', 'configurador')
        )
    );

CREATE POLICY "Sellers can delete own properties"
    ON public.properties FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "Admins can delete any property"
    ON public.properties FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator', 'configurador')
        )
    );

-- Trigger for updated_at
CREATE TRIGGER on_property_updated
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- PARTE 4: TABELA DE FAVORITOS
-- =====================================================

CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Indexes
CREATE INDEX idx_favorites_user ON public.user_favorites(user_id);
CREATE INDEX idx_favorites_property ON public.user_favorites(property_id);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own favorites"
    ON public.user_favorites FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
    ON public.user_favorites FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
    ON public.user_favorites FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- =====================================================
-- PARTE 5: MENSAGENS DO FORMULÁRIO DE CONTACTO
-- =====================================================

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_property_id ON public.messages(property_id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit messages"
    ON public.messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Staff can view all messages"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('seller', 'vendedor', 'admin', 'configurator', 'configurador')
        )
    );

CREATE POLICY "Staff can update messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('seller', 'vendedor', 'admin', 'configurator', 'configurador')
        )
    );

CREATE POLICY "Admins can delete messages"
    ON public.messages FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'configurator', 'configurador')
        )
    );

-- Trigger
CREATE TRIGGER on_message_updated
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- =====================================================
-- PARTE 6: SISTEMA DE CHAT (CONVERSAS)
-- =====================================================

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User info (the client)
    user_id TEXT NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_avatar TEXT,
    
    -- Property reference (optional)
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title VARCHAR(255),
    property_image TEXT,
    
    -- Conversation metadata
    subject VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'resolved')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Last message preview
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_by VARCHAR(20),
    
    -- Unread counters
    user_unread_count INTEGER DEFAULT 0,
    agent_unread_count INTEGER DEFAULT 0,
    
    -- Presence
    user_last_seen TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conv_user ON public.conversations(user_id);
CREATE INDEX idx_conv_status ON public.conversations(status);
CREATE INDEX idx_conv_last_message ON public.conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for simplicity - adjust for production)
CREATE POLICY "Authenticated can manage conversations"
    ON public.conversations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon can create conversations"
    ON public.conversations FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anon can view conversations"
    ON public.conversations FOR SELECT
    TO anon
    USING (true);


-- =====================================================
-- PARTE 7: MENSAGENS DO CHAT
-- =====================================================

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    
    -- Sender info
    sender_id TEXT,
    sender_name VARCHAR(255),
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    
    -- Message content
    message TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_msg_conversation ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_msg_created ON public.chat_messages(created_at);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated can manage chat messages"
    ON public.chat_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon can create chat messages"
    ON public.chat_messages FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anon can view chat messages"
    ON public.chat_messages FOR SELECT
    TO anon
    USING (true);

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET 
        last_message = LEFT(NEW.message, 200),
        last_message_at = NEW.created_at,
        last_message_by = NEW.sender_type,
        updated_at = NOW(),
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

CREATE TRIGGER trigger_update_conversation
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_new_message();


-- =====================================================
-- PARTE 8: PRESENÇA ONLINE
-- =====================================================

CREATE TABLE public.user_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    user_name VARCHAR(255),
    user_avatar TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_presence_user ON public.user_presence(user_id);
CREATE INDEX idx_presence_online ON public.user_presence(is_online) WHERE is_online = TRUE;

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can manage presence"
    ON public.user_presence FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);


-- =====================================================
-- PARTE 9: FUNÇÕES AUXILIARES
-- =====================================================

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_conversation_id UUID,
    p_reader_type VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.chat_messages 
    SET is_read = TRUE, read_at = NOW()
    WHERE conversation_id = p_conversation_id 
    AND is_read = FALSE
    AND sender_type != p_reader_type;
    
    IF p_reader_type = 'user' THEN
        UPDATE public.conversations SET user_unread_count = 0 WHERE id = p_conversation_id;
    ELSE
        UPDATE public.conversations SET agent_unread_count = 0 WHERE id = p_conversation_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    p_user_id TEXT,
    p_user_name VARCHAR(255) DEFAULT NULL,
    p_user_avatar TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_presence (user_id, user_name, user_avatar, is_online, last_seen, updated_at)
    VALUES (p_user_id, p_user_name, p_user_avatar, TRUE, NOW(), NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        user_name = COALESCE(EXCLUDED.user_name, user_presence.user_name),
        user_avatar = COALESCE(EXCLUDED.user_avatar, user_presence.user_avatar),
        is_online = TRUE,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- PARTE 10: STORAGE BUCKET PARA IMAGENS
-- =====================================================

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images', 
    'property-images', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880;

-- Storage policies
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
    USING (bucket_id = 'property-images');

CREATE POLICY "Users can delete own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'property-images');


-- =====================================================
-- PARTE 11: GRANTS (PERMISSÕES)
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT ON public.messages TO anon;
GRANT SELECT, INSERT ON public.conversations TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO anon;
GRANT ALL ON public.user_presence TO anon;

GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.user_favorites TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.user_presence TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION mark_messages_read(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_presence(TEXT, VARCHAR, TEXT) TO anon, authenticated;


-- =====================================================
-- PARTE 12: CRIAR UTILIZADOR ADMIN PARA O USER ATUAL
-- =====================================================

-- This will sync any existing auth users to the users table
INSERT INTO public.users (id, email, name, avatar_url, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=' || split_part(email, '@', 1) || '&background=10b981&color=fff'),
    'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT '✅ Database setup complete!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;


-- =====================================================
-- NOTA: DEPOIS DE EXECUTAR ESTE SCRIPT
-- =====================================================
-- 
-- Para dar role de CONFIGURADOR ao teu utilizador, executa:
--
-- UPDATE public.users 
-- SET role = 'configurador' 
-- WHERE email = 'SEU_EMAIL_AQUI';
--
-- Substitui 'SEU_EMAIL_AQUI' pelo teu email de login.
-- =====================================================
