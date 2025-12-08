import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2 ${className}`}>
      <div 
        className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};