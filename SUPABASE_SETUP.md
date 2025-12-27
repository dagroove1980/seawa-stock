# Supabase Setup Guide for SEAWA SOAP Stock Manager

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `seawa-soap-stock-manager`
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait for the project to be created (takes ~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Verify tables were created by going to **Table Editor** - you should see:
   - `materials`
   - `formulas`
   - `formula_materials`
   - `products`

## Step 3: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Add Environment Variables to Vercel

1. Go to your Vercel project: https://vercel.com/davids-projects-794668e3/seawa-soap-stock-manager/settings
2. Click on **Environment Variables**
3. Add these two variables:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase Project URL
   - **Environments**: Production, Preview, Development (check all)

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key
   - **Environments**: Production, Preview, Development (check all)

4. Click "Save"

## Step 5: Redeploy

After adding environment variables, redeploy your site:

```bash
cd /Users/david.scebat/Documents/SEAWA_SOAP_Stock_Manager
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.

## Step 6: Verify It Works

1. Visit your deployed site
2. Open browser console (F12)
3. You should see: "Supabase client initialized"
4. Add a material or formula
5. Check Supabase dashboard → Table Editor to see your data

## Data Migration

The app will automatically migrate your existing localStorage data to Supabase on first load. You'll see a success message when migration completes.

## Troubleshooting

### Data not syncing?
- Check browser console for errors
- Verify environment variables are set correctly in Vercel
- Make sure RLS policies allow operations (the schema sets permissive policies)

### Can't see data in Supabase?
- Check Table Editor in Supabase dashboard
- Verify the tables exist (run the schema SQL again if needed)
- Check RLS policies aren't blocking access

### Still using localStorage?
- Check browser console - if you see "Supabase credentials not found", the env vars aren't set
- Make sure you redeployed after adding environment variables

## Security Notes

The current setup uses permissive RLS policies (allows all operations). For production, you may want to:
- Add authentication (Supabase Auth)
- Restrict RLS policies to authenticated users only
- Use service role key for admin operations (never expose this in frontend)

