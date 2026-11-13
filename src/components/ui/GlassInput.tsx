import React from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  rightElement,
  className = '',
  disabled,
  ...props
}) => {
  // Render icon safely whether passed as JSX element <Icon /> or component identifier Icon
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && '$$typeof' in icon)) {
      return React.createElement(icon as unknown as React.ComponentType<{ className?: string }>, {
        className: 'w-4 h-4',
      });
    }
    return null;
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-[#4B4763] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#8B87A3] pointer-events-none flex items-center justify-center">
            {renderIcon()}
          </div>
        )}
        <input
          disabled={disabled}
          className={`w-full h-11 ${
            icon ? 'pl-10' : 'pl-4'
          } ${rightElement ? 'pr-11' : 'pr-4'} py-2 neo-inset text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/35 focus:border-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-rose-400 focus:ring-rose-500/30' : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};
