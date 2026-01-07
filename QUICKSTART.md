# Quick Start Guide - Sprint 1 Setup

## What's Been Done

Sprint 1 implementation is complete! Here's what has been set up:

✅ Next.js 16 project with TypeScript and Tailwind CSS
✅ Supabase client configuration
✅ Database migration script for exercises table
✅ CSV import utility for exercise data
✅ Basic home page and navigation
✅ Production build tested and working
✅ Git repository initialized

## Your Next Steps

### Step 1: Configure Environment Variables

Open the `.env.local` file and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-api-key
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. **Project ID**: Settings → General (or extract from URL: `https://YOUR-ID.supabase.co`)
3. **Anon Key**: Settings → API → Project API keys → `anon` `public`

### Step 2: Create Database Table

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy the contents of `scripts/create-exercises-table.sql`
4. Paste and run in the SQL Editor

### Step 3: Import Exercise Data

Once the table is created, import your exercises:

```bash
npx tsx scripts/import-exercises.ts
```

You should see success messages for each imported exercise.

### Step 4: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 to see your app running.

### Step 5: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Sprint 1 complete: Project foundation"
   git push
   ```

2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy!

## Verification Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Database table created in Supabase
- [ ] Exercises imported (check Supabase Table Editor)
- [ ] App runs locally at http://localhost:3000
- [ ] Production build succeeds (`npm run build`)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Vercel URL opens and works on mobile

## Files to Note

- **[README.md](README.md)** - Comprehensive project documentation
- **[scripts/create-exercises-table.sql](scripts/create-exercises-table.sql)** - Database schema
- **[scripts/import-exercises.ts](scripts/import-exercises.ts)** - CSV import utility
- **[lib/supabase.ts](lib/supabase.ts)** - Supabase client configuration
- **[.env.local](.env.local)** - Your local environment variables (FILL THIS IN!)

## Troubleshooting

### Import script fails
- Verify `.env.local` has correct Supabase credentials
- Ensure exercises table exists in Supabase
- Check that `data/ExcerciseData.csv` exists

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run lint`

### Can't connect to database
- Verify Project ID and API key are correct
- Check Supabase project status in dashboard
- Ensure `.env.local` file exists and is not gitignored

## What's Next?

Once Sprint 1 is verified and deployed, you're ready for **Sprint 2**: Exercise Library & Detail Views!

For detailed information, see:
- [README.md](README.md) - Full documentation
- [docs/ProjectPlan.html](docs/ProjectPlan.html) - Sprint 2 details
