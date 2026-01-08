# Sprint 4 Setup Instructions

## Database Setup

Before using the new Sprint 4 features, you need to extend the `workout_exercises` table with the new columns for sets and draft snapshot.

### Step 1: Run the SQL Script

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `/scripts/sprint4-extend-workout-exercises.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the script

This will add:
- `sets` column (JSONB array) - stores set data with weight and reps
- `draft_snapshot` column (JSONB) - temporary storage for "in progress" mode Cancel functionality

### Step 2: Verify Columns

After running the script, verify the columns were added:

1. Go to **Table Editor** in Supabase
2. Select the `workout_exercises` table
3. Verify you see the new `sets` and `draft_snapshot` columns

## Features Implemented

Sprint 4 includes the following features:

### 1. Bottom Navigation
- Fixed bottom navigation bar on all pages
- Three main sections: Dashboard, Exercises, and Workouts
- Active page highlighting
- Mobile-friendly thumb-reach design
- Dark mode support

### 2. Card-Based Workout Exercise Interface
- Workout exercises displayed as color-coded cards
- **Gray**: No sets recorded yet
- **Yellow**: Some sets recorded (partial completion)
- **Green**: All sets have data (complete)
- Shows exercise name, primary body part, equipment
- Displays max weight (heaviest weight with ≥6 reps)
- Shows completion summary (e.g., "3 sets completed")

### 3. Drag-and-Drop Reordering
- Drag and drop exercise cards to reorder them
- Works on desktop (mouse), mobile (touch), and keyboard
- Order saves automatically to database
- Visual feedback during dragging

### 4. Workout Exercise Detail View with "In Progress" Mode

#### Read-Only Mode (Default)
- View exercise details and sets
- Shows max weight achieved
- Can navigate freely
- "Start Editing" button to enter edit mode

#### "In Progress" Mode (Editable)
- **Navigation Blocked**: Cannot navigate away from page
- **Auto-Save**: Changes save automatically every 500ms
- **Add/Delete Sets**: Add new sets at end, delete last set only (minimum 1 set)
- **Edit Weight/Reps**: Weight supports decimals (e.g., 22.5 kg), reps are integers
- **Save Button**: Removes empty sets, clears draft snapshot, exits mode
- **Cancel Button**: Shows confirmation, restores from draft snapshot if confirmed
- **Browser Refresh**: Auto-saved data persists, returns to read-only mode

### 5. Sets Management
- **Default Sets**: New exercises get 3 empty sets (or match count from previous workout if exercise was done before)
- **Empty Set Removal**: When saving, empty sets are automatically removed and remaining sets are renumbered
- **Set Completion**: A set is considered "complete" if it has weight OR reps (or both)
- **Placeholders**: Future enhancement (Sprint 5) will show previous workout data as placeholders

### 6. Max Weight Calculation
- Calculates max weight from all sets where reps ≥ 6
- Displayed in:
  - Workout exercise cards
  - Workout exercise detail view
  - Exercise detail view (Sprint 5)

## Navigation Flow

- **Home** (`/`) → Links to Exercise Library and Workout Calendar
- **Workout Calendar** (`/workouts`) → Click date to create workout, click workout to view details
- **Workout Detail** (`/workouts/[id]`) → View/manage workout exercises
  - Drag-and-drop to reorder exercises
  - Click card to view exercise detail
  - Add Exercise button
- **Workout Exercise Detail** (`/workouts/[id]/exercises/[exerciseId]`) → View and edit sets
  - Read-only mode by default
  - "Start Editing" to enter "in progress" mode
  - Save/Cancel when done editing

## What's Next?

Sprint 5 will add:
- Historical performance data in workout exercise detail view (last 3 workouts)
- Exercise detail view enhancements (historical table, progress chart)
- Set placeholders showing previous workout data
- Last used date tracking

## Testing Checklist

- [ ] Bottom navigation appears on all pages
- [ ] Bottom navigation highlights active page correctly
- [ ] Can create a workout and add exercises
- [ ] Exercise cards show correct color coding (gray/yellow/green)
- [ ] Can drag and drop to reorder exercises
- [ ] Can click card to open workout exercise detail view
- [ ] "Start Editing" button enters "in progress" mode
- [ ] Navigation is blocked when in "in progress" mode
- [ ] Can add new sets while editing
- [ ] Can delete last set (cannot delete below 1 set)
- [ ] Can edit weight (decimals) and reps (integers)
- [ ] Auto-save indicator appears when typing
- [ ] Save button removes empty sets and exits mode
- [ ] Cancel button shows confirmation
- [ ] Cancel button restores previous state
- [ ] Browser refresh while editing: data persists, mode exits
- [ ] Max weight calculates correctly (≥6 reps)
- [ ] Max weight displays in cards and detail view
- [ ] Dark mode works correctly for all new components
- [ ] Mobile responsive design works

## Known Limitations (To Be Addressed in Sprint 5)

- No set placeholders from previous workouts yet
- No historical performance data display yet
- Last used date not yet updated when recording sets
- No progress charts yet
