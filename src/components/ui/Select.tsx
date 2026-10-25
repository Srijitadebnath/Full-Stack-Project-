import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, required, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={`w-full bg-white border text-xs sm:text-sm text-slate-800 rounded-xl px-3.5 py-2.5 transition-all outline-none cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
              : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
