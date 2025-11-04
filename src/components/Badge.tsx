import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full ${className}`}
    >
      {children}
    </span>
  );
}
