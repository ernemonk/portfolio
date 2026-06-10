import React from 'react';

type CardVariant = 'default' | 'glass' | 'elevated';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'glass',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-neutral-900 border border-neutral-800 rounded-lg',
    glass: 'glass glass-hover',
    elevated: 'bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg hover:shadow-glow-sm',
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        p-6
        ${interactive ? 'cursor-pointer transition-all duration-300 hover:scale-105' : 'transition-all duration-300'}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
