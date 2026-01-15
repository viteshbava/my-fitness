# Progressive Loading Pattern

## Overview

This document describes the progressive loading pattern implemented for optimizing page load performance across the application. This pattern is particularly useful for pages that fetch multiple pieces of data, some critical and some non-critical.

## Problem Statement

Traditional loading patterns wait for ALL data to load before showing the page:

```typescript
// ❌ OLD PATTERN: Wait for everything
const loadData = async () => {
  setLoading(true);
  const exercise = await fetchExercise();
  const historical = await fetchHistorical();
  const bestSet = await fetchBestSet();
  setLoading(false); // Page shows only after ALL data loads
};
```

**Issues:**
- Slow initial page render
- User sees loading spinner for 3+ seconds
- Non-critical data blocks critical UI

## Solution: Progressive Loading

Load critical data first, show the page immediately, then load non-critical data in the background.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PHASE 1: Critical                    │
│              Load basic info → Show page                │
│                    (< 1 second)                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                PHASE 2: Progressive (Parallel)          │
│         Load historical data + best set                 │
│      Show loading skeletons → Replace with data         │
│                    (background)                         │
└─────────────────────────────────────────────────────────┘
```

## Implementation Guide

### 1. Identify Data Categories

Categorize your data as:
- **Critical**: Required to show the page (e.g., exercise name, details)
- **Progressive**: Nice to have but can load later (e.g., historical data, charts)

### 2. Create Separate Loading States

```typescript
// Critical loading state
const [loading, setLoading] = useState(true);

// Progressive loading states (one per section)
const [loadingHistorical, setLoadingHistorical] = useState(false);
const [loadingBestSet, setLoadingBestSet] = useState(false);

// Separate error states
const [error, setError] = useState<string | null>(null);
const [historicalError, setHistoricalError] = useState<string | null>(null);
const [bestSetError, setBestSetError] = useState<string | null>(null);
```

### 3. Implement Phase 1: Critical Load

```typescript
const loadCriticalData = async () => {
  setLoading(true);

  const { data, error } = await fetchCriticalData();

  if (error) {
    setError(error);
    setLoading(false);
    return;
  }

  setCriticalData(data);
  setLoading(false); // ✅ Page shows NOW

  // Phase 2: Trigger background loading
  loadProgressiveData(data.id);
};
```

### 4. Implement Phase 2: Progressive Load (Parallel)

```typescript
const loadProgressiveData = async (id: string) => {
  // Load multiple sections in parallel for best performance
  Promise.all([
    loadHistoricalData(id),
    loadBestSet(id)
  ]);
};

const loadHistoricalData = async (id: string) => {
  setLoadingHistorical(true);
  const { data, error } = await fetchHistorical(id);

  if (error) {
    setHistoricalError(error);
  } else {
    setHistoricalData(data);
  }

  setLoadingHistorical(false);
};

const loadBestSet = async (id: string) => {
  setLoadingBestSet(true);
  const { data, error } = await fetchBestSet(id);

  if (error) {
    setBestSetError(error);
  } else {
    setBestSet(data);
  }

  setLoadingBestSet(false);
};
```

### 5. Use SectionLoader Component

Use the reusable `SectionLoader` component to handle loading/error/empty states:

```typescript
import SectionLoader from '@/components/SectionLoader';

<SectionLoader
  loading={loadingHistorical}
  error={historicalError}
  skeleton='table'
  skeletonLines={3}
  isEmpty={historicalData.length === 0}
  emptyMessage='No data available'>
  {/* Your content here */}
</SectionLoader>
```

## Reusable Components

### LoadingSkeleton

Location: `/components/LoadingSkeleton.tsx`

Provides skeleton loading animations for different content types:

```typescript
<LoadingSkeleton variant='text' lines={3} />
<LoadingSkeleton variant='title' />
<LoadingSkeleton variant='card' />
<LoadingSkeleton variant='table' lines={5} />
<LoadingSkeleton variant='chart' />
```

**Variants:**
- `text`: Multiple text lines with animation
- `title`: Single title line
- `card`: Card-shaped skeleton
- `table`: Table row skeletons
- `chart`: Chart-shaped skeleton

### SectionLoader

Location: `/components/SectionLoader.tsx`

Wrapper component that handles loading/error/empty states automatically:

```typescript
<SectionLoader
  loading={boolean}           // Show skeleton when true
  error={string | null}       // Show error message if present
  skeleton='text'             // Skeleton variant to show
  skeletonLines={3}          // Number of skeleton lines
  isEmpty={boolean}          // Whether data is empty
  emptyMessage='No data'>    // Message to show when empty
  {children}                 // Your actual content
</SectionLoader>
```

## Caching Strategy

### Server Actions with React Cache

Wrap data-fetching server actions with React's `cache()` function:

```typescript
import { cache } from 'react';

export const fetchExerciseById = cache(async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error: error?.message || null };
});
```

**Benefits:**
- Deduplicates requests within a single render
- Near-instant on revisit (during same session)
- No manual cache management needed

### Cache Invalidation

Use Next.js `revalidatePath()` after mutations:

```typescript
import { revalidatePath } from 'next/cache';

export const updateExerciseNotes = async (id: string, notes: string) => {
  // Update database...

  // Revalidate affected pages
  revalidatePath('/exercises');
  revalidatePath(`/exercises/${id}`);

  return { data, error: null };
};
```

## Performance Benefits

### Before Progressive Loading

```
User clicks exercise → 3 second loading spinner → Page appears
```

**Timeline:**
- 0ms: User clicks
- 500ms: Fetch exercise basic info
- 1500ms: Fetch historical data
- 2500ms: Fetch best set
- 3000ms: Page finally appears ❌

### After Progressive Loading

```
User clicks exercise → 500ms → Page appears → Sections load progressively
```

**Timeline:**
- 0ms: User clicks
- 500ms: Page appears with basic info ✅
- 500-1500ms: Historical data loads in background (shows skeleton)
- 500-1000ms: Best set loads in background (shows skeleton)
- All data visible by 1500ms ✅

**Improvement: 66% faster perceived load time**

## When to Use This Pattern

### ✅ Use Progressive Loading When:

1. **Multiple data sources**: Page requires 2+ database calls
2. **Non-critical sections**: Some data isn't essential for initial view
3. **Slow queries**: Historical data, aggregations, or complex joins
4. **User experience**: Want to show something quickly

### ❌ Don't Use Progressive Loading When:

1. **Single data source**: Only one fetch needed
2. **All data critical**: Everything required to show the page
3. **Very fast queries**: Sub-100ms queries don't benefit much

## Examples in Codebase

### ExerciseDetailView Component

Location: `/components/ExerciseDetailView.tsx`

**Critical Data (Phase 1):**
- Exercise basic info (name, pattern, video, notes)

**Progressive Data (Phase 2):**
- Historical workout data
- Best set / max weight
- Progress chart

**Result:** Page appears in ~500ms instead of 3+ seconds

## Best Practices

### 1. Always Use Parallel Loading

```typescript
// ✅ GOOD: Load in parallel
Promise.all([
  loadHistorical(),
  loadBestSet(),
  loadStats()
]);

// ❌ BAD: Load sequentially
await loadHistorical();
await loadBestSet();
await loadStats();
```

### 2. Provide Visual Feedback

Always show loading skeletons, not just spinners:

```typescript
// ✅ GOOD: Skeleton shows content structure
<SectionLoader loading={true} skeleton='table' />

// ❌ BAD: Generic spinner
{loading && <Spinner />}
```

### 3. Handle Errors Gracefully

Each section should handle its own errors:

```typescript
// ✅ GOOD: Section-specific errors
<SectionLoader
  loading={loadingHistorical}
  error={historicalError}  // Won't crash entire page
/>

// ❌ BAD: One error breaks everything
{error && <ErrorPage />}
```

### 4. Keep Skeletons Realistic

Match skeleton to actual content structure:

```typescript
// ✅ GOOD: Table skeleton for table data
<LoadingSkeleton variant='table' lines={5} />

// ❌ BAD: Text skeleton for table
<LoadingSkeleton variant='text' lines={10} />
```

## Troubleshooting

### Issue: Data flickers when loading

**Cause:** Loading state set to true after data already exists

**Solution:** Check if data exists before setting loading state:

```typescript
const loadData = async () => {
  // Don't show loading if we already have data
  if (!data) setLoading(true);

  const result = await fetch();
  setData(result);
  setLoading(false);
};
```

### Issue: Skeletons don't match content

**Cause:** Wrong skeleton variant chosen

**Solution:** Use the appropriate variant:
- Table data → `variant='table'`
- Chart → `variant='chart'`
- Text content → `variant='text'`

### Issue: Sections load too slowly

**Cause:** Loading sequentially instead of parallel

**Solution:** Use `Promise.all()` for parallel loading:

```typescript
// Load all non-critical data in parallel
Promise.all([loadA(), loadB(), loadC()]);
```

## Future Enhancements

Potential improvements to this pattern:

1. **Streaming SSR**: Use React 18 Suspense for server-side progressive rendering
2. **Prefetching**: Prefetch progressive data on hover/route change
3. **Priority hints**: Allow sections to specify priority levels
4. **Retry logic**: Auto-retry failed progressive loads
5. **Analytics**: Track which sections load slowest

## Related Documentation

- [Actions Pattern](../CLAUDE.md#actions-pattern-database-access) - Server actions for data fetching
- [MVC Architecture](../CLAUDE.md#mvc-architecture-pattern) - Overall architecture
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching) - Official Next.js docs
