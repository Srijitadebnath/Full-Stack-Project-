import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
