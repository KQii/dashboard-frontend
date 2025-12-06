import { twMerge } from "tailwind-merge";
import { ShieldCheck, UserCog } from "lucide-react";

interface RoleBadgeProps {
  role: "admin" | "operator";
  className?: string;
}

export function RoleBadge({
  role = "operator",
  className = "",
}: RoleBadgeProps) {
  const isAdmin = role === "admin";

  const bg = isAdmin ? "from-red-500 to-red-600" : "from-blue-500 to-blue-600";

  const Icon = isAdmin ? ShieldCheck : UserCog;

  return (
    <span
      className={twMerge(`
        inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold
        text-white bg-gradient-to-r ${bg}
        rounded-full shadow-sm transition-transform
        hover:scale-[1.03] active:scale-[0.97] ${className}
      `)}
    >
      <Icon size={14} />
      {role.toUpperCase()}
    </span>
  );
}
