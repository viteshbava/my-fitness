/**
 * Formatting Controller
 *
 * Display formatting functions including:
 * - Date and time formatting
 * - Relative time (e.g., "2 hours ago")
 * - Weight formatting (kg)
 * - Rep/set summaries (e.g., "4 sets completed")
 */

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NZ', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const formatWeight = (weight: number | null | undefined): string => {
  if (weight === null || weight === undefined) return '-';
  return `${weight.toFixed(1)} kg`;
};

export const formatReps = (reps: number | null | undefined): string => {
  if (reps === null || reps === undefined) return '-';
  return `${reps}`;
};

// Add more formatting functions as needed
