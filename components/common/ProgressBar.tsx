
import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  colorClass?: string; // Allow custom color
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = 'h-2', colorClass = 'bg-primary-600' }) => {
  // Ensure progress is a valid number between 0 and 100
  const validProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`} 
        style={{ width: `${validProgress}%` }}
      />
    </div>
  );
};
