-- Add Missing Chat Tables
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE user_presence TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    user_name TEXT,
    user_avatar TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_page TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policies for user_presence
DROP POLICY IF EXISTS "Anyone can view presence" ON public.user_presence;
DROP POLICY IF EXISTS "Anyone can manage presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can view presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can manage their own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can delete their own presence" ON public.user_presence;

CREATE POLICY "Anyone can view presence" ON public.user_presence
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert presence" ON public.user_presence
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update presence" ON public.user_presence
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete presence" ON public.user_presence
    FOR DELETE USING (true);


-- =====================================================
-- 2. CREATE chat_messages TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    sender_type TEXT NOT NULL DEFAULT 'user', -- 'user' or 'agent'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create chat messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can manage all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated can manage chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anon can create chat messages" ON public.chat_messages;

-- Create permissive policies (for chat to work)
CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update chat messages" ON public.chat_messages
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete chat messages" ON public.chat_messages
    FOR DELETE USING (true);


-- =====================================================
-- 3. CREATE conversations TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    user_avatar TEXT,
    property_id UUID,
    property_title TEXT,
    property_image TEXT,
    subject TEXT,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'normal',
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_by TEXT,
    agent_unread_count INT DEFAULT 0,
    user_unread_count INT DEFAULT 0,
    assigned_agent_id UUID,
    assigned_agent_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated can manage conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anon can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anon can view conversations" ON public.conversations;

-- Create permissive policies
CREATE POLICY "Anyone can view conversations" ON public.conversations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update conversations" ON public.conversations
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete conversations" ON public.conversations
    FOR DELETE USING (true);


-- =====================================================
-- 4. CREATE/UPDATE TRIGGER FOR CONVERSATION UPDATES
-- =====================================================

-- Function to update conversation when new message is added
CREATE OR REPLACE FUNCTION public.update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message = NEW.message,
        last_message_at = NOW(),
        last_message_by = NEW.sender_type,
        agent_unread_count = CASE 
            WHEN NEW.sender_type = 'user' THEN COALESCE(agent_unread_count, 0) + 1 
            ELSE agent_unread_count 
        END,
        user_unread_count = CASE 
            WHEN NEW.sender_type = 'agent' THEN COALESCE(user_unread_count, 0) + 1 
            ELSE user_unread_count 
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON public.chat_messages;
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_on_new_message();


-- =====================================================
-- 5. FUNCTION TO MARK MESSAGES AS READ
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_messages_read(p_conversation_id UUID, p_reader_type TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.chat_messages
    SET is_read = true
    WHERE conversation_id = p_conversation_id
        AND sender_type != p_reader_type
        AND is_read = false;
    
    IF p_reader_type = 'agent' THEN
        UPDATE public.conversations SET agent_unread_count = 0 WHERE id = p_conversation_id;
    ELSE
        UPDATE public.conversations SET user_unread_count = 0 WHERE id = p_conversation_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 6. FUNCTION TO UPDATE USER PRESENCE
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_user_presence(
    p_user_id TEXT,
    p_user_name TEXT DEFAULT NULL,
    p_user_avatar TEXT DEFAULT NULL,
    p_current_page TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_presence (user_id, user_name, user_avatar, last_seen, is_online, current_page)
    VALUES (p_user_id, p_user_name, p_user_avatar, NOW(), true, p_current_page)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        user_name = COALESCE(EXCLUDED.user_name, public.user_presence.user_name),
        user_avatar = COALESCE(EXCLUDED.user_avatar, public.user_presence.user_avatar),
        last_seen = NOW(), 
        is_online = true,
        current_page = COALESCE(EXCLUDED.current_page, public.user_presence.current_page);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Done! All chat tables should now be properly set up.
SELECT 'Chat tables created/updated successfully!' as result;
