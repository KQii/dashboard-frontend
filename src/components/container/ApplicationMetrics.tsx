import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { SearchMetric, QueryLatencyMetric, TimeRange } from "../../types";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface ApplicationMetricsProps {
  searchMetrics: SearchMetric[];
  latencyMetrics: QueryLatencyMetric[];
  isLoading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function ApplicationMetrics({
  searchMetrics,
  latencyMetrics,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: ApplicationMetricsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;

  const timeRangeOptions: TimeRange[] = ["1h", "6h", "24h", "7d"];

  const searchChartData = searchMetrics.map((metric) => ({
    timestamp: metric.timestamp,
    "Queries/sec": metric.queriesPerSecond,
  }));

  const latencyChartData = latencyMetrics.map((metric) => ({
    timestamp: metric.timestamp,
    p50: metric.p50,
    p95: metric.p95,
    p99: metric.p99,
  }));

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Application Metrics
          </h2>
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
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {timeRangeOptions.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <a
            href={prometheusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Visit Prometheus <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={grafanaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            Visit Grafana <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Operations Rate
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={searchChartData}
                lines={[
                  {
                    dataKey: "Queries/sec",
                    stroke: "#0891b2",
                    name: "Queries/sec",
                  },
                ]}
                xAxisKey="timestamp"
                yAxisLabel="Queries/sec"
              />
            )}
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Query Latency Percentiles
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={latencyChartData}
                lines={[
                  { dataKey: "p50", stroke: "#059669", name: "p50" },
                  { dataKey: "p95", stroke: "#ea580c", name: "p95" },
                  { dataKey: "p99", stroke: "#dc2626", name: "p99" },
                ]}
                xAxisKey="timestamp"
                yAxisLabel="Latency (ms)"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
