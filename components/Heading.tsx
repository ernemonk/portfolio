import React from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
  gradient?: boolean;
  children: React.ReactNode;
}

const sizeMap: Record<HeadingSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
  '2xl': 'text-2xl md:text-3xl',
  '3xl': 'text-3xl md:text-4xl',
  '4xl': 'text-4xl md:text-5xl lg:text-6xl',
};

export function Heading({
  level = 'h2',
  size,
  gradient = false,
  className,
  children,
  ...props
}: HeadingProps) {
  const defaultSizes: Record<HeadingLevel, HeadingSize> = {
    h1: '4xl',
    h2: '3xl',
    h3: '2xl',
    h4: 'xl',
    h5: 'lg',
    h6: 'base',
  };

  const finalSize = size || defaultSizes[level];
  const finalClassName = `
    ${sizeMap[finalSize]}
    font-bold
    text-neutral-50
    leading-tight
    ${gradient ? 'text-gradient' : ''}
    ${className || ''}
  `;

  // Render based on level
  switch (level) {
    case 'h1':
      return <h1 className={finalClassName} {...props}>{children}</h1>;
    case 'h2':
      return <h2 className={finalClassName} {...props}>{children}</h2>;
    case 'h3':
      return <h3 className={finalClassName} {...props}>{children}</h3>;
    case 'h4':
      return <h4 className={finalClassName} {...props}>{children}</h4>;
    case 'h5':
      return <h5 className={finalClassName} {...props}>{children}</h5>;
    case 'h6':
      return <h6 className={finalClassName} {...props}>{children}</h6>;
    default:
      return <h2 className={finalClassName} {...props}>{children}</h2>;
  }
}

export default Heading;
