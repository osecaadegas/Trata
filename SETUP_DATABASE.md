# Database Setup Instructions

## The Problem
Your property creation is hanging because the database tables and storage bucket don't exist yet. You need to run the SQL migrations in Supabase.

## Step-by-Step Solution

### 1. Go to Supabase SQL Editor
1. Open https://supabase.com/dashboard
2. Select your project: `qguujdzlzvdrfhgvvcjv`
3. Click on **SQL Editor** in the left sidebar

### 2. Run Migration 1: Create Users Table
1. Click **New Query**
2. Copy and paste the entire content of `supabase/migrations/001_create_users_table.sql`
3. Click **Run** button
4. Wait for "Success. No rows returned" message

### 3. Run Migration 2: Create Properties Table & Storage
1. Click **New Query** again
2. Copy and paste the entire content of `supabase/migrations/002_create_properties_table.sql`
3. Click **Run** button
4. Wait for "Success" message

### 4. Set Your User Role to Configurator
1. Click **New Query**
2. Run this SQL:
```sql
UPDATE public.users 
SET role = 'configurator' 
WHERE email = 'osecaadegas95@gmail.com';
```
3. Click **Run** button

### 5. Verify Everything Works
1. Go to **Table Editor** in Supabase
2. You should see two tables: `users` and `properties`
3. Go to **Storage** in Supabase
4. You should see a bucket named `property-images`

### 6. Test Property Creation
1. Refresh your website: https://trata-lovat.vercel.app
2. Log in with your Google account
3. Go to "Gerir Imóveis"
4. Try adding a new property with an image
5. It should work now!

## What These Migrations Do

**Migration 001** creates:
- `users` table with role system (user/seller/admin/configurator)
- Automatic role assignment for new users
- Security policies (RLS)

**Migration 002** creates:
- `properties` table with all property fields
- `property-images` storage bucket for uploading photos
- Security policies so sellers can manage their properties

## Troubleshooting

If you see errors like:
- `relation "properties" does not exist` → You didn't run migration 002
- `bucket "property-images" does not exist` → You didn't run migration 002
- You can't access admin menu → You didn't run the configurator role update

## Need Help?
If something doesn't work, check the browser console (F12) for error messages and let me know!
