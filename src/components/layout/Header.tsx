import { useNavigate } from "react-router-dom";
import { RefreshCw, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserMenu } from "../container/UserMenu";
import { ExternalLink } from "../ui/ExternalLink";

interface HeaderProps {
  title: string;
  pageTitle?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  countdown?: number;
}

export default function Header({
  title,
  pageTitle,
  lastUpdated,
  onRefresh,
  isRefreshing,
  countdown,
}: HeaderProps) {
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;
  const alertmanagerUrl = import.meta.env.VITE_ALERTMANAGER_URL;

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-slate-200 border-b shadow-sm transition-all duration-300">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex gap-4">
              <h1
                className="mt-1 text-xl md:text-3xl font-bold text-gray-900 cursor-pointer"
                onClick={() => navigate("/")}
              >
                {title}
              </h1>
              <ChevronRight className="mt-3" />
              {lastUpdated && countdown ? (
                <div className="transform">
                  <h1 className="text-lg font-bold text-gray-900">
                    {pageTitle}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
              ) : (
                <div className="transform">
                  <h1 className="mt-1.5 text-2xl font-bold text-gray-900">
                    {pageTitle}
                  </h1>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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

            <div className="pl-3 flex items-center gap-2 border-l border-gray-300">
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

            <div className="pl-3 border-l border-gray-300">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
