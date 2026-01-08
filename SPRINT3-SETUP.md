# Sprint 3 Setup Instructions

## Database Setup

Before running the application, you need to create the `workouts` and `workout_exercises` tables in your Supabase database.

### Step 1: Run the SQL Script

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `/scripts/create-workout-tables.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the script

This will create:
- `workouts` table with columns: id, date, created_at, updated_at
- `workout_exercises` table with columns: id, workout_id, exercise_id, order_index, created_at, updated_at
- Necessary indexes for performance
- Triggers for auto-updating the `updated_at` timestamp

### Step 2: Verify Tables

After running the script, verify the tables were created:

1. Go to **Table Editor** in Supabase
2. You should see `workouts` and `workout_exercises` in the list
3. Check that the foreign key relationships are set up correctly

## Features Implemented

Sprint 3 includes the following features:

### 1. Workout Calendar View
- Navigate to `/workouts` to see the calendar
- Calendar displays all workouts by date
- Click on any date to create a new workout
- Multiple workouts can be created on the same day
- Click on an existing workout to view details

### 2. Workout Management
- **Create**: Click a date on the calendar to create a new workout
- **View**: Click on a workout in the calendar to view its details
- **Delete**: Delete a workout from the date selection modal or workout detail page
- Confirmation dialog appears before deletion

### 3. Exercise Assignment
- From a workout detail page, click "Add Exercise"
- Browse and search available exercises
- Use filters to find specific exercises
- Click "Add to Workout" to assign an exercise
- Same exercise can be added multiple times to one workout
- Remove exercises from workout with confirmation

### 4. Calendar Features
- Month, Week, and Day views
- Today's date highlighted
- Multiple workouts per day shown as stacked entries
- Responsive design for mobile and desktop
- Dark mode support

## Navigation

The following navigation paths are available:

- Home: `/` - Links to Exercise Library and Workout Calendar
- Workout Calendar: `/workouts` - Calendar view with all workouts
- Workout Detail: `/workouts/[id]` - View and manage a specific workout
- Add Exercise: `/workouts/[id]/add-exercise` - Browse and add exercises to workout
- Exercise Library: `/exercises` - Browse all exercises
- Exercise Detail: `/exercises/[id]` - View exercise details

## What's Next?

Sprint 4 will add:
- Card-based interface for workout exercises
- Set management (weight, reps, set numbers)
- "In Progress" mode with auto-save
- Drag-and-drop reordering of exercises
- Color-coded completion status
- Default sets based on previous workouts

## Testing Checklist

- [ ] Calendar loads and displays correctly
- [ ] Can create a workout on any date (past, present, future)
- [ ] Can create multiple workouts on the same day
- [ ] Workouts appear on correct dates in calendar
- [ ] Can navigate to workout detail page by clicking a workout
- [ ] Can add exercises to a workout
- [ ] Can add the same exercise multiple times
- [ ] Can remove exercises from a workout
- [ ] Confirmation dialog appears before deletion
- [ ] Can delete a workout
- [ ] Dark mode works correctly
- [ ] Mobile responsive design works

## Known Limitations (To Be Addressed in Sprint 4)

- No set/rep/weight tracking yet (shows "No sets recorded yet" placeholder)
- No drag-and-drop reordering of exercises
- No color-coded completion status
- Exercise cards show basic information only
