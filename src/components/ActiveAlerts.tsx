import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Alert } from "../types";
import { AlertCard } from "./AlertCard";

interface ActiveAlertsProps {
  alerts: Alert[];
  isLoading: boolean;
}

export function ActiveAlerts({ alerts, isLoading }: ActiveAlertsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const alertmanagerUrl = import.meta.env.VITE_ALERTMANAGER_URL;

  const severityOptions = [
    { value: "all", label: "All" },
    { value: "critical", label: "Critical" },
    { value: "warning", label: "Warning" },
    { value: "info", label: "Info" },
  ];

  const filteredAlerts =
    selectedSeverity === "all"
      ? alerts
      : alerts.filter((alert) => alert.severity === selectedSeverity);

  const alertCounts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
          {alerts.length > 0 && (
            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
              {alerts.length}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
        </div>
        <a
          href={alertmanagerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
        >
          View more <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex gap-2 mb-4">
            {severityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSeverity(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedSeverity === option.value
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
                {alertCounts[option.value as keyof typeof alertCounts] > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/30 rounded text-xs">
                    {alertCounts[option.value as keyof typeof alertCounts]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="border rounded-lg p-12 text-center bg-white">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center bg-white">
              <p className="text-gray-500">
                {selectedSeverity === "all"
                  ? "No active alerts"
                  : `No ${selectedSeverity} alerts`}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
