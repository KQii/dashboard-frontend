import { AlertCircle, AlertTriangle, Info, Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert } from "../types";
import { Tooltip } from "./Tooltip";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const isSilenced = alert.status.silencedBy.length > 0;

  const severityConfig = {
    critical: {
      color: "border-red-500 bg-red-50",
      icon: AlertCircle,
      iconColor: "text-red-600",
      badge: "bg-red-100 text-red-800",
    },
    warning: {
      color: "border-orange-500 bg-orange-50",
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      badge: "bg-orange-100 text-orange-800",
    },
    info: {
      color: "border-blue-500 bg-blue-50",
      icon: Info,
      iconColor: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
    },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const BellIcon = isSilenced ? BellOff : Bell;

  // Apply muted styles if silenced - dynamically fade colors
  const fadedColor = config.color
    .replace(/border-(\w+)-500/g, "border-$1-200")
    .replace(/bg-(\w+)-50/g, "bg-$1-50");

  const containerClass = isSilenced
    ? `border-l-4 rounded-lg p-4 shadow-sm ${fadedColor} opacity-80`
    : `border-l-4 rounded-lg p-4 shadow-sm ${config.color}`;

  const fadedIconColor = config.iconColor.replace(
    /text-(\w+)-600/g,
    "text-$1-200"
  );
  const iconClass = `w-5 h-5 mt-0.5 flex-shrink-0 ${
    isSilenced ? fadedIconColor : config.iconColor
  }`;

  return (
    <div className={containerClass}>
      <div className="flex items-start gap-3">
        <Icon className={iconClass} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900">{alert.name}</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isSilenced
                  ? config.badge
                      .replace(/bg-(\w+)-100/g, "bg-$1-50")
                      .replace(/text-(\w+)-800/g, "text-$1-400")
                  : config.badge
              }`}
            >
              {alert.severity.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
              {alert.status.state}
            </span>
            <Tooltip
              content={
                isSilenced
                  ? `Silenced by: ${alert.status.silencedBy.join(", ")}`
                  : "Alert is active"
              }
              className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-gray-300 text-gray-700 border border-gray-400 flex items-center gap-1 cursor-help"
            >
              <BellIcon className="w-3 h-3" />
            </Tooltip>
          </div>
          <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">
            {alert.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {Object.entries(alert.labels).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-300"
              >
                {key}: {value}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Fired{" "}
            {formatDistanceToNow(new Date(alert.startsAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
