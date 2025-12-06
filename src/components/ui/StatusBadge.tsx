import { twMerge } from "tailwind-merge";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: boolean;
  onClick?: () => void;
  className?: string;
}

export function StatusBadge({
  status,
  onClick,
  className = "",
}: StatusBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={twMerge(`
        inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
        rounded-md transition-all duration-150 select-none
        shadow-sm border
        ${
          status
            ? "bg-green-500 border-green-600 text-white hover:bg-green-600 active:shadow-md"
            : "bg-gray-300 border-gray-400 text-gray-800 hover:bg-gray-400 active:shadow-md"
        } ${className}
      `)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {status ? (
        <CheckCircle2 size={18} strokeWidth={2.4} />
      ) : (
        <XCircle size={18} strokeWidth={2.4} />
      )}
      {status ? "Active" : "Inactive"}
    </button>
  );
}
