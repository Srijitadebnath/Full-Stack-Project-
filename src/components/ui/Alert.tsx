import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-800 icon-text:text-emerald-600',
    error: 'bg-rose-50 border-rose-100 text-rose-800 icon-text:text-rose-600',
    warning: 'bg-amber-50 border-amber-100 text-amber-800 icon-text:text-amber-600',
    info: 'bg-sky-50 border-sky-100 text-sky-800 icon-text:text-sky-600',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm ${styles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-0.5 hover:opacity-75 cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
