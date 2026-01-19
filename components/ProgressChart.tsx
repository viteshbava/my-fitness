import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Set } from '@/types/database';

interface ProgressChartProps {
  historicalData: Array<{ date: string; sets: Set[] }>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ historicalData }) => {
  // Filter to last 12 months only
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const filteredData = historicalData.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= twelveMonthsAgo;
  });

  // Prepare data for chart - calculate average power per set and max weight (≥6 reps) for each workout_exercise
  const chartData = filteredData.map(workout => {
    // Calculate average power per set: (sum of weight×reps for all sets) / number of sets
    const validSets = workout.sets.filter(set => set.weight != null && set.reps != null);
    const totalPower = validSets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0);
    const avgPowerPerSet = validSets.length > 0 ? Math.round(totalPower / validSets.length) : null;

    // Calculate max weight from sets with ≥6 reps only
    const qualifyingSets = workout.sets.filter(set => (set.reps || 0) >= 6 && set.weight != null);
    const maxWeight = qualifyingSets.length > 0
      ? Math.max(...qualifyingSets.map(set => set.weight || 0))
      : 0;

    return {
      date: workout.date,
      formattedDate: format(new Date(workout.date), 'MMM d, yyyy'),
      avgPower: avgPowerPerSet,
      maxWeight: maxWeight,
    };
  });

  // Sort by date ascending for proper chart display
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (chartData.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500 dark:text-gray-400'>
          No data available for the last 12 months
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-gray-300 dark:stroke-gray-600' />
        <XAxis
          dataKey='formattedDate'
          className='text-xs'
          tick={{ fill: 'currentColor' }}
          angle={-45}
          textAnchor='end'
          height={80}
        />
        <YAxis
          yAxisId='left'
          label={{ value: 'Avg Power/Set', angle: -90, position: 'insideLeft', fill: '#3b82f6' }}
          tick={{ fill: '#3b82f6' }}
          className='text-sm'
        />
        <YAxis
          yAxisId='right'
          orientation='right'
          label={{ value: 'Max Weight (kg)', angle: 90, position: 'insideRight', fill: '#10b981' }}
          tick={{ fill: '#10b981' }}
          className='text-sm'
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          labelStyle={{ color: '#000' }}
        />
        <Line
          yAxisId='left'
          type='monotone'
          dataKey='avgPower'
          stroke='#3b82f6'
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name='Avg Power/Set'
          connectNulls
        />
        <Line
          yAxisId='right'
          type='monotone'
          dataKey='maxWeight'
          stroke='#10b981'
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
          name='Max Weight (≥6 reps)'
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
