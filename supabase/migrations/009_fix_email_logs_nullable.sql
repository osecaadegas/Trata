-- Quick fix for email_logs table
-- Run this in Supabase SQL Editor to fix the NOT NULL constraint error

-- Make recipient_email nullable (for pending alert notifications)
ALTER TABLE public.email_logs 
ALTER COLUMN recipient_email DROP NOT NULL;

-- Make subject nullable (for pending records)
ALTER TABLE public.email_logs 
ALTER COLUMN subject DROP NOT NULL;

-- Delete any failed pending records so you can retry
DELETE FROM public.email_logs 
WHERE email_type = 'property_alert_pending' 
AND recipient_email IS NULL;

SELECT 'Fix applied! You can now add properties without errors.' as result;
