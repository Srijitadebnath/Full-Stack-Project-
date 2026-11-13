import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_6px_25px_-4px_rgba(124,58,237,0.04),0_2px_8px_-1px_rgba(0,0,0,0.02)] p-5 sm:p-6 transition-all duration-200 ${
        hoverable ? 'hover:border-purple-300 hover:shadow-[0_10px_35px_-5px_rgba(124,58,237,0.09)] hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={`text-base font-semibold text-slate-900 tracking-tight ${className}`}>{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`pt-4 mt-4 border-t border-slate-100 flex items-center justify-between ${className}`}>{children}</div>;
