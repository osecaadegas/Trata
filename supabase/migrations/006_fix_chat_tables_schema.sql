-- Fix Existing Chat Tables Schema
-- Run this in Supabase SQL Editor to add missing columns

-- =====================================================
-- 1. FIX chat_messages TABLE - Add missing columns
-- =====================================================

-- Add sender_avatar if missing
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS sender_avatar TEXT;

-- Add is_read if missing
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add created_at if missing
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at if missing
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);


-- =====================================================
-- 2. FIX conversations TABLE - Add missing columns
-- =====================================================

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS agent_unread_count INT DEFAULT 0;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS user_unread_count INT DEFAULT 0;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_agent_name TEXT;

ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- =====================================================
-- 3. FIX user_presence TABLE - Add missing columns  
-- =====================================================

ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS user_name TEXT;

ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS user_avatar TEXT;

ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS current_page TEXT;

ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();


-- =====================================================
-- 4. CREATE FUNCTIONS (if not exist)
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


-- Function to mark messages as read
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


-- Function to update user presence
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


-- =====================================================
-- 5. FIX RLS POLICIES - Make permissive for chat
-- =====================================================

-- chat_messages policies
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete chat messages" ON public.chat_messages;

CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat messages" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete chat messages" ON public.chat_messages FOR DELETE USING (true);

-- conversations policies
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.conversations;

CREATE POLICY "Anyone can view conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can create conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.conversations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete conversations" ON public.conversations FOR DELETE USING (true);

-- user_presence policies
DROP POLICY IF EXISTS "Anyone can view presence" ON public.user_presence;
DROP POLICY IF EXISTS "Anyone can insert presence" ON public.user_presence;
DROP POLICY IF EXISTS "Anyone can update presence" ON public.user_presence;
DROP POLICY IF EXISTS "Anyone can delete presence" ON public.user_presence;

CREATE POLICY "Anyone can view presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Anyone can insert presence" ON public.user_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update presence" ON public.user_presence FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete presence" ON public.user_presence FOR DELETE USING (true);


-- Done!
SELECT 'Chat tables schema fixed successfully!' as result;
