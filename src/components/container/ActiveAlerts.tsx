import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveAlert } from "../../types";
import { AlertCard } from "./AlertCard";
import { Badge } from "../ui/Badge";
import { Modal } from "../common/Modal";

interface ActiveAlertsProps {
  alerts: ActiveAlert[];
  isLoading: boolean;
  isSection?: boolean;
  showAllAlertsModal?: boolean;
  onCloseAllAlertsModal?: () => void;
}

export function ActiveAlerts({
  alerts,
  isLoading,
  isSection = true,
  showAllAlertsModal = false,
  onCloseAllAlertsModal,
}: ActiveAlertsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const alertmanagerUrl = import.meta.env.VITE_ALERTMANAGER_URL;
  const navigate = useNavigate();

  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;

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

  // Determine max alerts to display based on isSection
  const maxDisplayAlerts = isSection ? 4 : 2;
  const displayedAlerts = filteredAlerts.slice(0, maxDisplayAlerts);

  const handleShowMore = () => {
    if (isSection) {
      // Navigate to alerts page with modal open
      navigate("/alerts?showAllAlerts=true");
    } else {
      // Open modal in current page
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseAllAlertsModal) {
      onCloseAllAlertsModal();
    }
  };

  // Handle modal from URL parameter (for navigation from dashboard)
  const isModalOpen = showModal || showAllAlertsModal;

  return (
    <section className={isSection ? "mb-8" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
          {alerts.length > 0 && <Badge>{alerts.length}</Badge>}
          {isSection && (
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
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShowMore}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Show More
          </button>
          <a
            href={prometheusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Visit Prometheus <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={alertmanagerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
          >
            Visit Alertmanager <ExternalLink className="w-3 h-3" />
          </a>
        </div>
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
          ) : displayedAlerts.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-4 ${
                isSection ? "lg:grid-cols-2" : ""
              }`}
            >
              {displayedAlerts.map((alert) => (
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="All Active Alerts"
        size="xxl"
      >
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
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

        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </section>
  );
}
