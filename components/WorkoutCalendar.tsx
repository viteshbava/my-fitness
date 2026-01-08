'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Workout } from '@/types/database';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface WorkoutCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Workout;
}

interface WorkoutCalendarProps {
  workouts: Workout[];
  onSelectWorkout: (workout: Workout) => void;
  onSelectDate: (date: Date) => void;
}

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  workouts,
  onSelectWorkout,
  onSelectDate,
}) => {

  // Convert workouts to calendar events
  const events = useMemo<WorkoutCalendarEvent[]>(() => {
    return workouts.map((workout) => {
      const date = new Date(workout.date);
      const time = new Date(workout.created_at);

      return {
        id: workout.id,
        title: `Workout`,
        start: date,
        end: date,
        resource: workout,
      };
    });
  }, [workouts]);

  const handleSelectEvent = (event: WorkoutCalendarEvent) => {
    onSelectWorkout(event.resource);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    onSelectDate(slotInfo.start);
  };

  const handleShowMore = (events: WorkoutCalendarEvent[], date: Date) => {
    // When "+X more" is clicked, show the same modal as clicking on a date
    onSelectDate(date);
  };

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
      },
    };
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-4' style={{ height: '600px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onShowMore={handleShowMore}
        selectable
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView='month'
        className='dark:text-white'
      />
    </div>
  );
};

export default WorkoutCalendar;
