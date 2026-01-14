import React from 'react';
import { WORKOUT_COLORS, getColorById } from '@/lib/utils/colors';

interface ColorSelectorProps {
  selectedColorId: string;
  onColorChange: (colorId: string) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ selectedColorId, onColorChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Color
      </label>
      <div className="flex gap-3">
        {WORKOUT_COLORS.map((color) => {
          const isSelected = selectedColorId === color.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onColorChange(color.id)}
              className={`
                w-10 h-10 rounded-full cursor-pointer transition-all
                ${color.pillBg}
                ${isSelected ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'hover:scale-105 active:scale-95'}
              `}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorSelector;
