-- Email Automation System for Portuguese Real Estate Agency
-- Run this in Supabase SQL Editor
-- Includes GDPR-compliant fields and property alerts system

-- =====================================================
-- 1. UPDATE USERS TABLE - Add GDPR consent fields
-- =====================================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consent_ip TEXT,
ADD COLUMN IF NOT EXISTS consent_text_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS brevo_contact_id TEXT;

-- Create index for unsubscribe token lookups
CREATE INDEX IF NOT EXISTS idx_users_unsubscribe_token ON public.users(unsubscribe_token);


-- =====================================================
-- 2. CREATE PROPERTY ALERT PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.property_alert_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    
    -- Alert criteria
    location TEXT[],  -- Array of locations e.g., ['Braga, Centro', 'Braga, Gualtar']
    property_types TEXT[],  -- Array e.g., ['apartment', 'house']
    min_price DECIMAL(12,2),
    max_price DECIMAL(12,2),
    min_bedrooms INT,
    max_bedrooms INT,
    min_area INT,
    max_area INT,
    conditions TEXT[],  -- ['new', 'renovated', 'to_renovate']
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    frequency TEXT DEFAULT 'instant',  -- 'instant', 'daily', 'weekly'
    last_alert_sent TIMESTAMPTZ,
    
    -- GDPR Consent
    marketing_consent BOOLEAN DEFAULT false NOT NULL,
    consent_timestamp TIMESTAMPTZ NOT NULL,
    consent_ip TEXT,
    consent_text_version TEXT DEFAULT '1.0',
    
    -- Unsubscribe
    unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    
    -- Brevo integration
    brevo_contact_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alert_prefs_email ON public.property_alert_preferences(email);
CREATE INDEX IF NOT EXISTS idx_alert_prefs_active ON public.property_alert_preferences(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_prefs_token ON public.property_alert_preferences(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_alert_prefs_locations ON public.property_alert_preferences USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_alert_prefs_types ON public.property_alert_preferences USING GIN(property_types);

-- Enable RLS
ALTER TABLE public.property_alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own alert preferences" ON public.property_alert_preferences;
DROP POLICY IF EXISTS "Users can create alert preferences" ON public.property_alert_preferences;
DROP POLICY IF EXISTS "Users can update own alert preferences" ON public.property_alert_preferences;
DROP POLICY IF EXISTS "Users can delete own alert preferences" ON public.property_alert_preferences;
DROP POLICY IF EXISTS "Anyone can create alert preferences" ON public.property_alert_preferences;

CREATE POLICY "Users can view own alert preferences" ON public.property_alert_preferences
    FOR SELECT USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create alert preferences" ON public.property_alert_preferences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own alert preferences" ON public.property_alert_preferences
    FOR UPDATE USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete own alert preferences" ON public.property_alert_preferences
    FOR DELETE USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));


-- =====================================================
-- 3. CREATE INQUIRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User info (can be anonymous or logged in)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Property reference
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_title TEXT,
    
    -- Inquiry details
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general',  -- 'visit', 'info', 'price', 'general'
    preferred_contact TEXT DEFAULT 'email',  -- 'email', 'phone', 'whatsapp'
    preferred_time TEXT,  -- 'morning', 'afternoon', 'evening'
    
    -- Status tracking
    status TEXT DEFAULT 'new',  -- 'new', 'contacted', 'scheduled', 'completed', 'archived'
    assigned_agent_id UUID REFERENCES public.users(id),
    notes TEXT,
    
    -- Response tracking
    first_response_at TIMESTAMPTZ,
    response_time_minutes INT,
    
    -- GDPR
    marketing_consent BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    consent_ip TEXT,
    
    -- Metadata
    source TEXT DEFAULT 'website',  -- 'website', 'portal', 'referral'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_agent TEXT,
    ip_address TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON public.inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;

CREATE POLICY "Anyone can create inquiries" ON public.inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own inquiries" ON public.inquiries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador'))
    );

CREATE POLICY "Admins can manage all inquiries" ON public.inquiries
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador'))
    );


-- =====================================================
-- 4. CREATE EMAIL LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Email details
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    template_name TEXT,
    
    -- Type and status
    email_type TEXT NOT NULL,  -- 'inquiry_confirmation', 'inquiry_notification', 'property_alert', 'welcome', 'password_reset'
    status TEXT DEFAULT 'pending',  -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    
    -- Provider info
    provider TEXT,  -- 'resend', 'brevo', 'sendgrid'
    provider_message_id TEXT,
    
    -- Related entities
    inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    alert_preference_id UUID REFERENCES public.property_alert_preferences(id) ON DELETE SET NULL,
    
    -- Error handling
    error_message TEXT,
    retry_count INT DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    
    -- Tracking
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_inquiry ON public.email_logs(inquiry_id);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

CREATE POLICY "Admins can view all email logs" ON public.email_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'configurador'))
    );

CREATE POLICY "System can insert email logs" ON public.email_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email logs" ON public.email_logs
    FOR UPDATE USING (true);


-- =====================================================
-- 5. CREATE RATE LIMITING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,  -- IP address or email
    action_type TEXT NOT NULL,  -- 'inquiry', 'alert_subscription', 'password_reset'
    attempts INT DEFAULT 1,
    first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    
    UNIQUE(identifier, action_type)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, action_type);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow insert/update for rate limiting
CREATE POLICY "Anyone can manage rate limits" ON public.rate_limits FOR ALL USING (true);


-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action_type TEXT,
    p_max_attempts INT DEFAULT 5,
    p_window_minutes INT DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_record RECORD;
    v_is_allowed BOOLEAN := true;
BEGIN
    -- Get or create rate limit record
    SELECT * INTO v_record 
    FROM public.rate_limits 
    WHERE identifier = p_identifier AND action_type = p_action_type;
    
    IF v_record IS NULL THEN
        -- First attempt
        INSERT INTO public.rate_limits (identifier, action_type)
        VALUES (p_identifier, p_action_type);
        RETURN true;
    END IF;
    
    -- Check if blocked
    IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
        RETURN false;
    END IF;
    
    -- Check if window has passed
    IF v_record.first_attempt_at < NOW() - (p_window_minutes || ' minutes')::INTERVAL THEN
        -- Reset counter
        UPDATE public.rate_limits 
        SET attempts = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), blocked_until = NULL
        WHERE identifier = p_identifier AND action_type = p_action_type;
        RETURN true;
    END IF;
    
    -- Increment counter
    IF v_record.attempts >= p_max_attempts THEN
        -- Block for window duration
        UPDATE public.rate_limits 
        SET blocked_until = NOW() + (p_window_minutes || ' minutes')::INTERVAL, last_attempt_at = NOW()
        WHERE identifier = p_identifier AND action_type = p_action_type;
        RETURN false;
    ELSE
        UPDATE public.rate_limits 
        SET attempts = attempts + 1, last_attempt_at = NOW()
        WHERE identifier = p_identifier AND action_type = p_action_type;
        RETURN true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to find matching alert subscriptions for a property
CREATE OR REPLACE FUNCTION public.find_matching_alert_subscriptions(p_property_id UUID)
RETURNS TABLE (
    alert_id UUID,
    email TEXT,
    unsubscribe_token UUID
) AS $$
DECLARE
    v_property RECORD;
BEGIN
    -- Get property details
    SELECT * INTO v_property FROM public.properties WHERE id = p_property_id;
    
    IF v_property IS NULL THEN
        RETURN;
    END IF;
    
    -- Find matching subscriptions
    RETURN QUERY
    SELECT 
        ap.id as alert_id,
        ap.email,
        ap.unsubscribe_token
    FROM public.property_alert_preferences ap
    WHERE 
        ap.is_active = true
        AND ap.marketing_consent = true
        AND (
            ap.location IS NULL 
            OR v_property.location = ANY(ap.location)
            OR array_length(ap.location, 1) IS NULL
        )
        AND (
            ap.property_types IS NULL 
            OR v_property.property_type = ANY(ap.property_types)
            OR array_length(ap.property_types, 1) IS NULL
        )
        AND (ap.min_price IS NULL OR v_property.price >= ap.min_price)
        AND (ap.max_price IS NULL OR v_property.price <= ap.max_price)
        AND (ap.min_bedrooms IS NULL OR v_property.bedrooms >= ap.min_bedrooms)
        AND (ap.max_bedrooms IS NULL OR v_property.bedrooms <= ap.max_bedrooms)
        AND (ap.min_area IS NULL OR v_property.area_sqm >= ap.min_area)
        AND (ap.max_area IS NULL OR v_property.area_sqm <= ap.max_area);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to unsubscribe by token
CREATE OR REPLACE FUNCTION public.unsubscribe_by_token(p_token UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := false;
BEGIN
    -- Update alert preferences
    UPDATE public.property_alert_preferences
    SET is_active = false, marketing_consent = false, updated_at = NOW()
    WHERE unsubscribe_token = p_token;
    
    IF FOUND THEN
        v_updated := true;
    END IF;
    
    -- Also update user if exists
    UPDATE public.users
    SET marketing_consent = false
    WHERE unsubscribe_token = p_token;
    
    IF FOUND THEN
        v_updated := true;
    END IF;
    
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 7. TRIGGER FOR NEW PROPERTY ALERTS
-- =====================================================

-- Function to notify about new property (called by trigger or edge function)
CREATE OR REPLACE FUNCTION public.notify_new_property()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a notification record that can be picked up by a background job
    -- This is more reliable than trying to call external APIs from a trigger
    INSERT INTO public.email_logs (
        email_type,
        status,
        property_id,
        metadata
    ) VALUES (
        'property_alert_pending',
        'pending',
        NEW.id,
        jsonb_build_object(
            'property_title', NEW.title,
            'property_type', NEW.property_type,
            'location', NEW.location,
            'price', NEW.price
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new properties
DROP TRIGGER IF EXISTS trigger_notify_new_property ON public.properties;
CREATE TRIGGER trigger_notify_new_property
    AFTER INSERT ON public.properties
    FOR EACH ROW
    WHEN (NEW.status = 'available')
    EXECUTE FUNCTION public.notify_new_property();


-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON public.property_alert_preferences TO authenticated;
GRANT ALL ON public.property_alert_preferences TO anon;
GRANT ALL ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO anon;
GRANT ALL ON public.email_logs TO authenticated;
GRANT SELECT ON public.email_logs TO anon;
GRANT ALL ON public.rate_limits TO authenticated;
GRANT ALL ON public.rate_limits TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION public.find_matching_alert_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION public.unsubscribe_by_token TO authenticated;
GRANT EXECUTE ON FUNCTION public.unsubscribe_by_token TO anon;


-- Done!
SELECT 'Email automation system tables created successfully!' as result;
