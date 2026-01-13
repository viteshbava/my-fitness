'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Workout } from '@/types/database';

interface CustomWorkoutCalendarProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
  onSelectDate: (date: Date) => void;
}

const CustomWorkoutCalendar: React.FC<CustomWorkoutCalendarProps> = ({
  workouts,
  onSelectWorkout,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');

  // Get all days to display in the calendar (including days from prev/next month to fill the grid)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group workouts by date
  const workoutsByDate = useMemo(() => {
    const grouped: Record<string, Workout[]> = {};
    workouts.forEach((workout) => {
      if (!grouped[workout.date]) {
        grouped[workout.date] = [];
      }
      grouped[workout.date].push(workout);
    });
    return grouped;
  }, [workouts]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onSelectDate(date);
  };

  const getWorkoutsForDate = (date: Date): Workout[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workoutsByDate[dateStr] || [];
  };

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-gray-900 text-white rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <button className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Add Request
          </button>
        </div>

        {/* Month Navigation and View Toggle */}
        <div className="flex items-center justify-between">
          {/* Month Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center min-w-[180px]">
              <div className="font-semibold">
                {format(currentMonth, 'MMMM')}
              </div>
              <div className="text-gray-400 text-sm">
                {format(currentMonth, 'yyyy')}
              </div>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                view === 'month'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                view === 'list'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayHeaders.map((day) => (
              <div
                key={day}
                className="text-center text-gray-400 font-medium py-2 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-700">
            {calendarDays.map((day, index) => {
              const workoutsForDay = getWorkoutsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const dateStr = format(day, 'd');

              return (
                <div
                  key={index}
                  onClick={() => isCurrentMonth && handleDateClick(day)}
                  className={`
                    min-h-[100px] bg-gray-900 p-2
                    ${isCurrentMonth ? 'cursor-pointer hover:bg-gray-800' : 'opacity-40'}
                    transition-colors
                  `}
                >
                  <div className="text-right mb-1">
                    <span className={`text-sm ${isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                      {dateStr}
                    </span>
                  </div>

                  {/* Workout Pills */}
                  <div className="space-y-1">
                    {workoutsForDay.map((workout, idx) => (
                      <div
                        key={workout.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectWorkout(workout);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        Full Body
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="p-4">
          <div className="space-y-2">
            {workouts
              .filter((w) => {
                const workoutDate = new Date(w.date);
                return isSameMonth(workoutDate, currentMonth);
              })
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => onSelectWorkout(workout)}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Full Body</div>
                      <div className="text-sm text-gray-400">
                        {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            {workouts.filter((w) => isSameMonth(new Date(w.date), currentMonth)).length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No workouts this month
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomWorkoutCalendar;
