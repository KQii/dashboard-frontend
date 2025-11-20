import { twMerge } from "tailwind-merge";

interface InputProps {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}

export function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder = "Enter Input",
  className = "",
  required = false,
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={twMerge(
        `w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition ${className}`
      )}
      required={required}
    />
  );
}
