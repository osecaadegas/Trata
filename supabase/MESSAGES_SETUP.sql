-- =====================================================
-- MESSAGES TABLE SETUP FOR TRATA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop existing table if you want to start fresh (CAREFUL - deletes all messages!)
-- DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table for contact form submissions
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(100),
    message TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    property_title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns if table already exists
ALTER TABLE messages ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS property_title VARCHAR(255);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_property_id ON messages(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_assigned_to ON messages(assigned_to);

-- Enable RLS (Row Level Security)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins and vendors can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins and vendors can update messages" ON messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON messages;
DROP POLICY IF EXISTS "Anyone can submit messages" ON messages;

-- Policy for admins and vendors to SELECT messages
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

-- Policy for admins and vendors to UPDATE messages
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

-- Policy for admins to DELETE messages
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

-- Policy for ANYONE to INSERT messages (contact form - works without login)
CREATE POLICY "Anyone can submit messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS messages_updated_at_trigger ON messages;
CREATE TRIGGER messages_updated_at_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- =====================================================
-- VERIFY SETUP
-- =====================================================
-- Check if table was created successfully
SELECT 'Messages table created successfully!' as status, count(*) as message_count FROM messages;
