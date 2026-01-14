/**
 * Color utility for templates and workouts
 */

export interface WorkoutColor {
  id: string;
  name: string;
  // Color for the pill/badge display
  pillBg: string;
  pillText: string;
  // Color for the calendar workout entries
  calendarBg: string;
  calendarHoverBg: string;
  calendarActiveBg: string;
  calendarText: string;
}

export const WORKOUT_COLORS: WorkoutColor[] = [
  {
    id: 'green',
    name: 'Green',
    pillBg: 'bg-green-500',
    pillText: 'text-white',
    calendarBg: 'bg-green-500',
    calendarHoverBg: 'hover:bg-green-600',
    calendarActiveBg: 'active:bg-green-700',
    calendarText: 'text-white',
  },
  {
    id: 'blue',
    name: 'Blue',
    pillBg: 'bg-blue-500',
    pillText: 'text-white',
    calendarBg: 'bg-blue-500',
    calendarHoverBg: 'hover:bg-blue-600',
    calendarActiveBg: 'active:bg-blue-700',
    calendarText: 'text-white',
  },
  {
    id: 'purple',
    name: 'Purple',
    pillBg: 'bg-purple-500',
    pillText: 'text-white',
    calendarBg: 'bg-purple-500',
    calendarHoverBg: 'hover:bg-purple-600',
    calendarActiveBg: 'active:bg-purple-700',
    calendarText: 'text-white',
  },
  {
    id: 'orange',
    name: 'Orange',
    pillBg: 'bg-orange-500',
    pillText: 'text-white',
    calendarBg: 'bg-orange-500',
    calendarHoverBg: 'hover:bg-orange-600',
    calendarActiveBg: 'active:bg-orange-700',
    calendarText: 'text-white',
  },
  {
    id: 'pink',
    name: 'Pink',
    pillBg: 'bg-pink-500',
    pillText: 'text-white',
    calendarBg: 'bg-pink-500',
    calendarHoverBg: 'hover:bg-pink-600',
    calendarActiveBg: 'active:bg-pink-700',
    calendarText: 'text-white',
  },
];

export const DEFAULT_COLOR_ID = 'green';

/**
 * Get a color by its ID
 */
export const getColorById = (colorId: string | null): WorkoutColor => {
  if (!colorId) {
    return WORKOUT_COLORS.find((c) => c.id === DEFAULT_COLOR_ID)!;
  }
  return WORKOUT_COLORS.find((c) => c.id === colorId) || WORKOUT_COLORS.find((c) => c.id === DEFAULT_COLOR_ID)!;
};

/**
 * Get the Tailwind classes for a color's pill/badge
 */
export const getColorPillClasses = (colorId: string | null): string => {
  const color = getColorById(colorId);
  return `${color.pillBg} ${color.pillText}`;
};

/**
 * Get the Tailwind classes for a color's calendar entry
 */
export const getColorCalendarClasses = (colorId: string | null): string => {
  const color = getColorById(colorId);
  return `${color.calendarBg} ${color.calendarHoverBg} ${color.calendarActiveBg} ${color.calendarText}`;
};
