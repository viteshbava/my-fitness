# Claude Code Development Guidelines

## Git Policy

**DO NOT perform git operations (commit, push, pull, etc.) unless explicitly requested by the user.**

- Never create commits automatically after making changes
- If you believe a commit would be beneficial, ask the user first
- The user prefers to manage git operations manually
- Only perform git commands when explicitly asked to do so

## React Component Pattern

All React `.tsx` component files should follow the **rafce** (React Arrow Function Component Export) pattern:

```tsx
import React from 'react';

const ComponentName = () => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Function Style

- **All functions should be arrow functions**, not traditional function declarations
- Use `const` for function definitions

### Example:

```tsx
// ✅ Correct - Arrow function
const handleClick = () => {
  console.log('Clicked');
};

// ❌ Incorrect - Traditional function
function handleClick() {
  console.log('Clicked');
}
```

## Component Structure

```tsx
import React from 'react';

// Props interface (if needed)
interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction }) => {
  // State and hooks
  const [count, setCount] = React.useState(0);

  // Event handlers (arrow functions)
  const handleIncrement = () => {
    setCount(count + 1);
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
};

export default ComponentName;
```

## Notes

- Use TypeScript for all components
- Follow Next.js App Router conventions
- Keep components in the `app/` or `components/` directories

## Documentation Policy

- **DO NOT update README.md** unless explicitly requested by the user
- The README is user-managed documentation
- Focus on code implementation, not documentation updates

## BRD Compliance

- **ALWAYS follow the BRD (Business Requirements Document)** located in `/docs/BRD.html`
- Before implementing any feature, verify the requirements against the BRD
- If the current implementation deviates from the BRD intentionally (e.g., as a temporary measure to be fixed later per the ProjectPlan):
  - Add a clear comment in the code explaining the deviation
  - Add a visible UI note/banner informing the user that this will be changed later
  - Reference the specific sprint or section of the plan where it will be corrected
- **Check BRD compliance** before considering a sprint complete
- If unclear about requirements, refer to the BRD first, then ask the user for clarification

## Actions Pattern (Database Access)

### Server Actions for Database Operations

**NEVER call Supabase directly from client components (.tsx files)**. All database operations should go through server actions in the `/actions` folder.

### Why Use Actions?

1. **Separation of Concerns**: Keeps data access logic separate from UI components
2. **Performance**: Reduces client bundle size significantly (55kB → 3kB for accounts page)
3. **Security**: Database operations happen on the server, not exposed to client
4. **Maintainability**: All database logic in one place, easier to update
5. **Reusability**: Actions can be used across multiple components

### Pattern Structure

✅ **Correct Pattern:**

**`/actions/resource.ts`** (Server Actions)

```tsx
'use server';

import { createClient } from '@/lib/supabase/server';
import { ResourceType } from '@/types/resource';

export const fetchResources = async (): Promise<{ data: ResourceType[] | null; error: string | null }> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('resources').select('*');

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Failed to fetch' };
  }
};

export const createResource = async (formData: FormDataType): Promise<{ data: ResourceType | null; error: string | null }> => {
  // Implementation...
};
```

**`/app/resources/page.tsx`** (Client Component)

```tsx
'use client';

import { fetchResources, createResource } from '@/actions/resources';

const ResourcesPage = () => {
  const loadResources = async () => {
    const { data, error } = await fetchResources();
    if (error) {
      setError(error);
      return;
    }
    setResources(data || []);
  };

  // Use the actions, don't call Supabase directly
};
```

❌ **Incorrect Pattern:**

```tsx
'use client';

import { createClient } from '@/lib/supabase/client'; // DON'T DO THIS

const ResourcesPage = () => {
  const supabase = createClient(); // DON'T DO THIS

  const loadResources = async () => {
    const { data } = await supabase.from('resources').select('*'); // DON'T DO THIS
  };
};
```

### Action File Naming

- Actions files should be plural and match the database table name
- Example: `/actions/accounts.ts` for `accounts` table
- Example: `/actions/balance-records.ts` for `balance_records` table

### Return Type Convention

All action functions should return an object with:

- `{ data: T | null, error: string | null }` for operations that return data
- `{ success: boolean, error: string | null }` for operations that don't return data (like delete)

### Error Handling

- Wrap all actions in try/catch
- Return user-friendly error messages
- Never let errors crash the server action
- Convert Supabase errors to simple string messages

## User Feedback & Modals

### NEVER Use Browser Alert/Confirm Dialogs

**ALWAYS use custom modal components instead of browser dialogs** (`alert()`, `confirm()`, `prompt()`).

### Why?

1. **Better UX**: Custom modals match the application design and theme (light/dark mode)
2. **Accessibility**: Custom modals can be styled for better accessibility
3. **Consistency**: All user feedback looks the same across the application
4. **Flexibility**: Can show different types (error, warning, info, success) with appropriate colors and icons

### Available Modal Components

#### AlertModal (Single Action)

Use for displaying information, errors, or warnings that only require acknowledgment.

**Location**: `/components/AlertModal.tsx`

**Props**:

```tsx
interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'info' | 'error' | 'warning' | 'success';
}
```

**Example Usage**:

```tsx
import AlertModal from '@/components/AlertModal';

const MyComponent = () => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'warning' | 'info' | 'success'
  });

  const showAlert = (title: string, message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setAlertModalContent({ title, message, type });
    setAlertModalOpen(true);
  };

  const handleSomeAction = async () => {
    const { error } = await someAction();
    if (error) {
      showAlert('Error', `Failed to perform action: ${error}`, 'error');
      return;
    }
  };

  return (
    <>
      {/* Component content */}
      <AlertModal
        isOpen={alertModalOpen}
        title={alertModalContent.title}
        message={alertModalContent.message}
        type={alertModalContent.type}
        onClose={() => setAlertModalOpen(false)}
      />
    </>
  );
};
```

#### ConfirmationModal (Dual Action)

Use for confirmation dialogs that require user to choose between two actions (e.g., delete confirmation).

**Location**: `/components/ConfirmationModal.tsx`

**Props**:

```tsx
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}
```

**Example Usage**:

```tsx
import ConfirmationModal from '@/components/ConfirmationModal';

const MyComponent = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    // Perform delete action
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      {/* Component content */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDangerous={true}
      />
    </>
  );
};
```

### Modal Type Colors

AlertModal supports different types with appropriate colors:

- **error**: Red - for errors and failures
- **warning**: Yellow - for warnings and cautions
- **info**: Blue - for informational messages
- **success**: Green - for success confirmations

### Best Practices

1. **Always use custom modals** for all user feedback
2. **Choose the right type**: Use AlertModal for information, ConfirmationModal for choices
3. **Set appropriate type**: Use error for failures, warning for cautions, info for general messages, success for confirmations
4. **Clear, concise messages**: Keep modal text short and actionable
5. **Handle cleanup**: Always reset modal state after closing

## MVC Architecture Pattern

This application follows a **Model-View-Controller (MVC)** architecture to separate concerns and improve maintainability.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                          │
│              (.tsx files in /app and /components)           │
│                                                             │
│  - Responsible for rendering UI only                        │
│  - Minimal logic (event handlers, state management)         │
│  - Imports from controllers and actions                     │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                        │
│                 (files in /lib/controllers)                  │
│                                                             │
│  - Business logic and calculations                          │
│  - Data manipulation and transformations                    │
│  - Pure functions (no side effects)                         │
│  - Formatting and display logic                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        MODEL LAYER                           │
│                    (files in /actions)                       │
│                                                             │
│  - Database operations (CRUD)                               │
│  - Server actions ('use server')                            │
│  - Data fetching and persistence                            │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
/app                    - View layer (pages and routes)
/components             - View layer (reusable UI components)
/lib/controllers        - Controller layer (business logic)
/actions                - Model layer (database operations)
/types                  - TypeScript type definitions
```

### Controller Layer (/lib/controllers)

The controller layer contains **pure functions** that perform:

1. **Calculations**: Mathematical operations, aggregations, statistics
2. **Data transformations**: Sorting, filtering, grouping, mapping
3. **Business logic**: Application-specific rules and algorithms
4. **Formatting**: Currency, dates, numbers, strings for display
5. **Validation**: Data validation and sanitization logic

**Key Principles:**

- **Pure functions**: No side effects, same input always produces same output
- **No database calls**: Controllers never call actions or Supabase directly
- **No React**: No hooks, no JSX, no React-specific code
- **Testable**: Easy to unit test without mocking
- **Reusable**: Can be used across multiple components

### Example Controller Files

#### `/lib/controllers/exercise-controller.ts`

Business logic for exercises:

- Grouping exercises by body part or equipment
- Filtering by mastered status
- Sorting by name, last used date
- Search and filter logic

#### `/lib/controllers/workout-controller.ts`

Business logic for workouts:

- Grouping workouts by date/month
- Calculating workout statistics
- Determining workout completion status
- Filtering workouts by date range

#### `/lib/controllers/workout-exercise-controller.ts`

Business logic for workout exercises:

- Calculating max weight (≥6 reps criterion)
- Determining set completion status (color coding)
- Sorting sets by set number
- Calculating set totals and summaries

#### `/lib/controllers/formatting-controller.ts`

Display formatting functions:

- Date and time formatting
- Relative time (e.g., "2 hours ago")
- Weight formatting (kg)
- Rep/set summaries (e.g., "4 sets completed")

### Usage Pattern

✅ **Correct Pattern:**

**View Layer** ([app/exercises/page.tsx](app/exercises/page.tsx))

```tsx
'use client';

import { fetchExercises } from '@/actions/exercises';
import {
  groupExercisesByBodyPart,
  filterMasteredExercises
} from '@/lib/controllers/exercise-controller';

const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Fetch data from actions (Model)
  const loadData = async () => {
    const { data } = await fetchExercises();
    setExercises(data || []);
  };

  // Use controller functions for calculations
  const groupedExercises = groupExercisesByBodyPart(exercises);
  const masteredExercises = filterMasteredExercises(exercises);

  // Render UI
  return <div>...</div>;
};
```

**Controller Layer** ([lib/controllers/exercise-controller.ts](lib/controllers/exercise-controller.ts))

```tsx
export const groupExercisesByBodyPart = (
  exercises: Exercise[]
): Record<string, Exercise[]> => {
  return exercises.reduce((groups, exercise) => {
    const bodyPart = exercise.primary_body_part || 'Unknown';
    if (!groups[bodyPart]) groups[bodyPart] = [];
    groups[bodyPart].push(exercise);
    return groups;
  }, {} as Record<string, Exercise[]>);
};

export const filterMasteredExercises = (
  exercises: Exercise[]
): Exercise[] => {
  return exercises.filter(exercise => exercise.is_mastered);
};
```

**Model Layer** ([actions/exercises.ts](actions/exercises.ts))

```tsx
'use server';

import { createClient } from '@/lib/supabase/server';

export const fetchExercises = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('exercises').select('*');
  return { data, error: error?.message || null };
};
```

❌ **Incorrect Pattern:**

```tsx
// DON'T put business logic directly in components
const WorkoutsPage = () => {
  // ❌ Calculation logic in the view
  const maxWeight = workoutExercises
    .flatMap(we => we.sets || [])
    .filter(set => set.reps >= 6)
    .reduce((max, set) => Math.max(max, set.weight || 0), 0);

  // ❌ Formatting logic in the view
  const formatWeight = (weight: number) => {
    return `${weight.toFixed(1)} kg`;
  };

  return <div>...</div>;
};
```

### When to Create a New Controller

Create a new controller file when:

1. **New resource type**: Adding a new domain entity (e.g., exercises, workouts, workout_exercises)
2. **Cross-cutting logic**: Logic that applies to multiple resources (e.g., formatting, validation)
3. **Complex calculations**: Max weight calculations, set statistics, progress tracking
4. **File size**: Existing controller exceeds ~200-300 lines

### Controller Naming Convention

- Use kebab-case for file names: `exercise-controller.ts`, `workout-exercise-controller.ts`
- Use camelCase for function names: `calculateMaxWeight`, `formatWeight`
- Export individual functions (not a class or default export)
- Group related functions in the same file

### Benefits of This Pattern

1. **Separation of Concerns**: UI, logic, and data access are clearly separated
2. **Testability**: Pure functions in controllers are easy to unit test
3. **Reusability**: Controllers can be used by multiple components
4. **Maintainability**: Logic changes don't require touching UI code
5. **Performance**: Pure functions can be memoized for optimization
6. **Readability**: Components focus on UI, controllers focus on logic

### Migration Strategy

When refactoring existing code:

1. **Identify logic**: Look for calculations, transformations, formatting in .tsx files
2. **Extract to controller**: Move the logic to appropriate controller file
3. **Import and use**: Import the controller function in the component
4. **Test**: Verify the refactored code works as expected
5. **Clean up**: Remove the old inline logic from the component
