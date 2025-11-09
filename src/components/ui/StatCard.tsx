import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-cyan-600",
}: StatCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 font-normal">{subtitle}</p>
          )}
        </div>
        <Icon className={`w-12 h-12 ${iconColor} opacity-20`} />
      </div>
    </div>
  );
}
