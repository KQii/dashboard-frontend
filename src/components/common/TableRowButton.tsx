import { twMerge } from "tailwind-merge";

interface TableRowButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "info" | "success" | "warning";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function TableRowButton({
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  children,
}: TableRowButtonProps) {
  const variantClasses = {
    primary: "text-cyan-700 bg-cyan-50 hover:bg-cyan-100",
    secondary: "text-blue-700 bg-blue-50 hover:bg-blue-100",
    danger: "text-red-700 bg-red-50 hover:bg-red-100",
    info: "text-slate-700 bg-slate-50 hover:bg-slate-100",
    success: "text-lime-700 bg-lime-50 hover:bg-lime-100",
    warning: "text-yellow-700 bg-yellow-50 hover:bg-yellow-100",
  };

  return (
    <button
      onClick={onClick}
      className={twMerge(
        `px-3 py-1 text-xs font-medium rounded transition-colors ${
          variantClasses[variant]
        } ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${className}`
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
