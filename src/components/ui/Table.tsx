import React from 'react';

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
    <table className={`w-full text-left border-collapse ${className}`}>{children}</table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = '',
  onClick,
}) => (
  <tr
    onClick={onClick}
    className={`transition-colors hover:bg-slate-50/60 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <th className={`px-4 py-3.5 ${className}`}>{children}</th>;

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>;

export const TableEmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({
  title = 'No records found',
  description = 'There are no entries available to display.',
  icon,
}) => (
  <tr>
    <td colSpan={100} className="py-12 text-center">
      <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
        {icon && <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl mb-3">{icon}</div>}
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
    </td>
  </tr>
);
