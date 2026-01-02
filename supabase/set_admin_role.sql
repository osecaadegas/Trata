-- Set your account as Configurator
-- Run this in Supabase SQL Editor after first login

UPDATE users 
SET role = 'configurator' 
WHERE email = 'osecaadegas95@gmail.com';

-- Verify the update
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'osecaadegas95@gmail.com';
