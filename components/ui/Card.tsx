import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div 
      className={`rounded-xl border border-white/[0.07] bg-white/[0.015] ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}