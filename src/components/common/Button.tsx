import { twMerge } from "tailwind-merge";

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  onClick,
  disabled = false,
  className = "",
  children,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(`px-4 py-2 rounded-lg text-sm text-white font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}
            ${
              disabled
                ? "bg-cyan-300 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
            }`)}
    >
      {children}
    </button>
  );
}
