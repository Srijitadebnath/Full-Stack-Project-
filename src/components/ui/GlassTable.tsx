import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface GlassTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function GlassTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
}: GlassTableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-purple-500/10 bg-white/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3.5 px-4 text-xs font-bold text-[#8B87A3] uppercase tracking-wider first:rounded-l-xl last:rounded-r-xl ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-500/8">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-sm text-[#8B87A3]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={`group transition-all duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-white/70' : 'hover:bg-white/50'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-4 px-4 text-xs sm:text-sm text-[#4B4763] group-hover:text-[#1E1B2E] transition-colors ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(row, index)
                      : (row as Record<string, unknown>)[col.key] !== undefined
                      ? String((row as Record<string, unknown>)[col.key])
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
