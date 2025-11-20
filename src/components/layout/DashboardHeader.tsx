import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserMenu } from "../container/UserMenu";
import { useSidebar } from "../../contexts/SidebarContext";
import { ExternalLink } from "../ui/ExternalLink";

interface DashboardHeaderProps {
  title: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  countdown?: number;
  showExternalLinks?: boolean;
}

export function DashboardHeader({
  title,
  lastUpdated,
  onRefresh,
  isRefreshing,
  countdown,
  showExternalLinks,
}: DashboardHeaderProps) {
  const { sidebarWidth } = useSidebar();

  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;
  const alertmanagerUrl = import.meta.env.VITE_ALERTMANAGER_URL;

  return (
    <header className="sticky top-0 z-10 bg-slate-200 border-b shadow-sm transition-all duration-300">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              {lastUpdated && (
                <span>
                  Updated{" "}
                  {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </span>
              )}
              {countdown && countdown > 0 && (
                <span className="text-gray-500">
                  Next refresh in {countdown}s
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {showExternalLinks && (
              <div className="flex items-center gap-2">
                <ExternalLink href={prometheusUrl} variant="prometheus">
                  Visit Prometheus
                </ExternalLink>
                <ExternalLink href={grafanaUrl} variant="grafana">
                  Visit Grafana
                </ExternalLink>
                <ExternalLink href={alertmanagerUrl} variant="alertmanager">
                  Visit Alertmanager
                </ExternalLink>
              </div>
            )}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            )}

            <div className="pl-3 border-l border-gray-300">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
