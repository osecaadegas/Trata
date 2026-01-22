# Supabase + Google OAuth Setup Guide

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Name: "TRATA"
   - Database Password: (create a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 3: Configure Google OAuth in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. You'll need to add:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Configure OAuth consent screen if needed
6. Application type: **Web application**
7. Add **Authorized redirect URIs:**
   - `https://your-project.supabase.co/auth/v1/callback`
   - Replace with your actual Supabase URL from Step 2
8. Copy the **Client ID** and **Client Secret**
9. Paste them into Supabase Google provider settings
10. Save in Supabase

### Add Authorized JavaScript Origins (for Google):
- `http://localhost:3000`
- `https://your-vercel-app.vercel.app`

## Step 4: Add Environment Variables

1. Open the `.env` file in your project
2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Step 5: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the same three variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
4. Click "Save"
5. Redeploy your app

## Step 6: Test

1. Run locally: `npm run dev`
2. Click "Iniciar Sessão"
3. Login with Google
4. Check Supabase dashboard → Authentication → Users to see the new user

## What's Integrated:

✅ Supabase client setup
✅ Environment variables for security
✅ Google OAuth with Supabase auth
✅ User session persistence
✅ Auto-login on page refresh
✅ Secure logout

Your users will now be stored in Supabase with full authentication!
