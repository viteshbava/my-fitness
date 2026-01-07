# My Fitness Tracker

A personal fitness training application built with Next.js and Supabase to help plan and document gym training sessions.

## Features

- **Exercise Library**: Browse, search, and filter exercises with detailed information
- **Workout Management**: Plan and schedule workouts on a calendar
- **Progress Tracking**: Log sets, reps, weights, and track your progress over time
- **Mobile-First Design**: Optimized for use at the gym on mobile devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is sufficient)
- A Vercel account (optional, for deployment)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd my-fitness
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Create a new project
3. Note your database password (you'll need it)
4. Get your credentials from the project settings:
   - **Project ID**: Found in Settings → General (or in your Project URL: `https://YOUR-PROJECT-ID.supabase.co`)
   - **Publishable API Key**: Found in Settings → API

### 3. Configure Environment Variables

1. Open the `.env.local` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-publishable-api-key
```

### 4. Create Database Table

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Open the file `scripts/create-exercises-table.sql` from this project
4. Copy the SQL and paste it into the Supabase SQL Editor
5. Click "Run" to create the exercises table

### 5. Import Exercise Data

Run the import script to load exercises from the CSV file:

```bash
npx tsx scripts/import-exercises.ts
```

You should see output confirming the import of exercises.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Deployment to Vercel

### Initial Setup

1. Push your code to GitHub (if you haven't already)
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project" and import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Configure Environment Variables

In Vercel project settings:

1. Go to Settings → Environment Variables
2. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_PROJECT_ID` → Your Supabase Project ID
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your Supabase Publishable API Key
3. Apply to Production, Preview, and Development environments

### Deploy

1. Click "Deploy"
2. Wait for the build to complete (1-2 minutes)
3. Vercel will provide a live URL (e.g., `https://my-fitness.vercel.app`)
4. Test the deployed app on your mobile device

### Automatic Deployments

Once set up, Vercel will automatically deploy:
- Production deployments when you push to the `main` branch
- Preview deployments for pull requests

## Project Structure

```
my-fitness/
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── data/                # Exercise data
│   └── ExcerciseData.csv
├── docs/                # Project documentation
│   ├── BRD.html        # Business Requirements Document
│   └── ProjectPlan.html # Implementation plan
├── lib/                 # Utilities and configurations
│   └── supabase.ts     # Supabase client setup
├── scripts/            # Database and utility scripts
│   ├── create-exercises-table.sql
│   └── import-exercises.ts
├── .env.local          # Local environment variables (not in git)
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Development Workflow

### Running Locally

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Changes

1. Write SQL migration in `scripts/` directory
2. Run it in Supabase SQL Editor
3. Update TypeScript types in `lib/supabase.ts` if needed

## Sprint Progress

- ✅ **Sprint 1**: Project foundation, database setup, CSV import, deployment
- 🔄 **Sprint 2**: Exercise library and detail views (Coming next)
- 📅 **Sprint 3**: Workout management and calendar
- 📅 **Sprint 4**: Workout exercise management
- 📅 **Sprint 5**: Historical data and progress tracking
- 📅 **Sprint 6**: Video integration and final polish

## Support

For issues or questions, please refer to:
- [BRD.html](docs/BRD.html) for business requirements
- [ProjectPlan.html](docs/ProjectPlan.html) for implementation details

## Security Note

This app is designed for single-user personal use. The current implementation uses Supabase's Publishable API key without Row Level Security (RLS) for faster development. For multi-user scenarios or enhanced security, authentication and RLS policies should be added.

## License

This is a personal project for individual use.
