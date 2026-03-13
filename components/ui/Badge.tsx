import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error";
}

export function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  const variantClasses = {
    default: "bg-gray-600 text-gray-100",
    success: "bg-emerald-600 text-emerald-100",
    warning: "bg-yellow-600 text-yellow-100",
    error: "bg-red-600 text-red-100"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}