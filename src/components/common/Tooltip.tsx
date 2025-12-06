import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
}

export function Tooltip({
  content,
  children,
  className = "",
  position = "top",
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    "top-left": "bottom-full right-0 mb-2",
    "top-right": "bottom-full left-0 mb-2",
    "bottom-left": "top-full right-0 mt-2",
    "bottom-right": "top-full left-0 mt-2",
  };

  return (
    <span className={`relative group ${className}`}>
      {children}
      <span
        className={twMerge(
          `absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap`
        )}
      >
        {content}
      </span>
    </span>
  );
}
