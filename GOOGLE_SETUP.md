# Google OAuth Setup Guide

## Get Your Google Client ID

To enable Google login, you need to create a Google OAuth Client ID:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing):**
   - Click "Select a project" → "New Project"
   - Give it a name like "TRATA Imobiliária"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Select "Web application"
   - Name: "TRATA Web Client"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:5173` (Vite default)
   - Click "Create"

5. **Copy Your Client ID:**
   - Copy the Client ID (it looks like: `xxxxx-xxxxx.apps.googleusercontent.com`)

6. **Update App.jsx:**
   - Open `src/App.jsx`
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID

## For Production

When deploying to production, add your production domain to:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com`

## Current Setup

The button now says "Iniciar Sessão" (Login) and opens a modal with Google login.
After login, it displays the user's profile picture and name.
