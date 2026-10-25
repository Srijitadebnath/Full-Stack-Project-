import React from 'react';

export type BadgeVariant = 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'cyan';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    purple: 'bg-purple-50 text-purple-700 border-purple-100/80',
    blue: 'bg-sky-50 text-sky-700 border-sky-100/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-100/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-100/80',
    slate: 'bg-slate-100 text-slate-600 border-slate-200/80',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100/80',
  };

  const dots = {
    purple: 'bg-purple-500',
    blue: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    cyan: 'bg-cyan-500',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
