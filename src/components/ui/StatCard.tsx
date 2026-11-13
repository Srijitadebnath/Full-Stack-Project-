import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  helperText?: string;
  trend?: {
    value?: string;
    text?: string;
    type?: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  className?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  helperText,
  trend,
  className = '',
  iconBg = 'text-purple-600',
  onClick,
}) => {
  // Render icon safely whether passed as JSX element <Icon /> or component identifier Icon
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon)) {
      return React.createElement(icon as unknown as React.ComponentType<{ className?: string }>, {
        className: 'w-5 h-5',
      });
    }
    return null;
  };

  const trendText = trend?.value || trend?.text;
  const isUp = trend?.type === 'up' || trend?.isPositive === true;
  const isDown = trend?.type === 'down' || trend?.isPositive === false;

  return (
    <div
      onClick={onClick}
      className={`glass-card glass-card-lift p-5 sm:p-6 flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs sm:text-sm font-medium text-[#8B87A3] tracking-normal block mb-1">
            {label}
          </span>
          <div className="text-3xl sm:text-[34px] font-extrabold text-[#1E1B2E] tracking-tight leading-tight">
            {value}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl neo-raised flex items-center justify-center shrink-0 border border-white/60">
          <div className={iconBg}>{renderIcon()}</div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-purple-500/10 flex items-center justify-between text-xs">
        {trendText ? (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
              isUp
                ? 'bg-emerald-500/15 text-emerald-700'
                : isDown
                ? 'bg-rose-500/15 text-rose-700'
                : 'bg-slate-500/10 text-slate-700'
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isDown ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{trendText}</span>
          </div>
        ) : (
          <span className="text-[#8B87A3] text-[11px]">{helperText || 'Active Live Data'}</span>
        )}
      </div>
    </div>
  );
};
