import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'purple' | 'emerald' | 'amber' | 'sky' | 'rose';
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'purple',
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, progress));

  const colors = {
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
  };

  const trackColors = {
    purple: 'bg-purple-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    sky: 'bg-sky-50',
    rose: 'bg-rose-50',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${trackColors[color]} rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${colors[color]} ${heights[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
