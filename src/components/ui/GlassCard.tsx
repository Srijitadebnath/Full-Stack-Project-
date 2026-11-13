import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  lift?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  dark = false,
  lift = false,
  onClick,
  ...props
}) => {
  const baseClasses = dark
    ? 'glass-dark p-6 transition-all duration-200'
    : `glass-card p-6 ${lift ? 'glass-card-lift' : ''} ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
