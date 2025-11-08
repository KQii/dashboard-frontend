import { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  timestamp?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  timestamp,
  trend,
  status = 'info'
}: MetricCardProps) {
  const statusColors = {
    success: 'border-green-500 bg-green-50',
    warning: 'border-orange-500 bg-orange-50',
    danger: 'border-red-500 bg-red-50',
    info: 'border-cyan-500 bg-cyan-50',
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    info: 'text-cyan-600',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${iconColors[status]}`} />
            <span className="text-sm font-medium text-gray-700">{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {trend && (
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {trendIcons[trend]}
              </span>
            )}
          </div>
        </div>
      </div>
      {timestamp && (
        <div className="mt-2 text-xs text-gray-500">
          Updated {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </div>
      )}
    </div>
  );
}
