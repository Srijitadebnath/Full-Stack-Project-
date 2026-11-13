import React from 'react';

export interface ChipProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'purple' | 'neutral';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'neutral',
  icon,
  children,
  className = '',
  size = 'md',
  dot = false,
  onClick,
}) => {
  const variantClasses = {
    success: 'chip-success',
    danger: 'chip-danger',
    warning: 'chip-warning',
    info: 'chip-info',
    purple: 'chip-purple',
    neutral: 'bg-slate-500/10 text-slate-700',
  }[variant];

  const dotClasses = {
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    purple: 'bg-purple-600',
    neutral: 'bg-slate-500',
  }[variant];

  const sizeClasses = {
    sm: 'text-[10px] h-6 px-2.5',
    md: 'text-xs h-7 px-3',
    lg: 'text-sm h-8 px-4',
  }[size];

  return (
    <span
      onClick={onClick}
      className={`chip ${sizeClasses} ${variantClasses} ${onClick ? 'cursor-pointer hover:opacity-85' : ''} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1 shrink-0 ${dotClasses}`} />
      )}
      {icon && <span className="shrink-0 mr-1">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
