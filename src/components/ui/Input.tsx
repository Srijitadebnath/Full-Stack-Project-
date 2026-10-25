import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, required, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`w-full bg-white border text-xs sm:text-sm text-slate-900 rounded-xl px-3.5 py-2.5 transition-all outline-none placeholder:text-slate-400 ${
              icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
