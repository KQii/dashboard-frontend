import { useState, useMemo } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import {
  IndexingThroughputMetric,
  SearchThroughputMetric,
  SearchLatencyMetric,
  TimeRange,
  IndexingLatencyMetric,
} from "../../types";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface ApplicationMetricsProps {
  indexingThroughputMetrics: IndexingThroughputMetric[];
  indexingLatencyMetrics: IndexingLatencyMetric[];
  searchThroughputMetrics: SearchThroughputMetric[];
  searchLatencyMetrics: SearchLatencyMetric[];
  isLoading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function ApplicationMetrics({
  indexingThroughputMetrics,
  indexingLatencyMetrics,
  searchThroughputMetrics,
  searchLatencyMetrics,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: ApplicationMetricsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;
  const grafanaUrl = import.meta.env.VITE_GRAFANA_URL;

  const timeRangeOptions: TimeRange[] = ["1h", "6h", "24h", "7d"];

  const nodeNames = useMemo(() => {
    return [...new Set(indexingThroughputMetrics.map((m) => m.nodeName))];
  }, [indexingThroughputMetrics]);

  const indexingThroughputChartData = useMemo(() => {
    return indexingThroughputMetrics.reduce((acc, metric) => {
      const existing = acc.find((d) => d.timestamp === metric.timestamp);
      if (existing) {
        existing[metric.nodeName] = metric.value;
      } else {
        acc.push({
          timestamp: metric.timestamp,
          [metric.nodeName]: metric.value,
        });
      }
      return acc;
    }, [] as any[]);
  }, [indexingThroughputMetrics]);

  const indexingThroughputLines = useMemo(() => {
    return nodeNames.map((nodeName, index) => ({
      dataKey: nodeName,
      stroke: ["#0891b2", "#059669", "#dc2626"][index % 3],
      name: nodeName,
    }));
  }, [nodeNames]);

  const indexingLatencyChartData = useMemo(() => {
    return indexingLatencyMetrics.reduce((acc, metric) => {
      const existing = acc.find((d) => d.timestamp === metric.timestamp);
      if (existing) {
        existing[metric.nodeName] = metric.value;
      } else {
        acc.push({
          timestamp: metric.timestamp,
          [metric.nodeName]: metric.value,
        });
      }
      return acc;
    }, [] as any[]);
  }, [indexingLatencyMetrics]);

  const indexingLatencyLines = useMemo(() => {
    return nodeNames.map((nodeName, index) => ({
      dataKey: nodeName,
      stroke: ["#0891b2", "#059669", "#dc2626"][index % 3],
      name: nodeName,
    }));
  }, [nodeNames]);

  const searchThroughputChartData = useMemo(() => {
    return searchThroughputMetrics.reduce((acc, metric) => {
      const existing = acc.find((d) => d.timestamp === metric.timestamp);
      if (existing) {
        existing[metric.nodeName] = metric.value;
      } else {
        acc.push({
          timestamp: metric.timestamp,
          [metric.nodeName]: metric.value,
        });
      }
      return acc;
    }, [] as any[]);
  }, [searchThroughputMetrics]);

  const searchThroughputLines = useMemo(() => {
    return nodeNames.map((nodeName, index) => ({
      dataKey: nodeName,
      stroke: ["#0891b2", "#059669", "#dc2626"][index % 3],
      name: nodeName,
    }));
  }, [nodeNames]);

  const searchLatencyChartData = useMemo(() => {
    return searchLatencyMetrics.reduce((acc, metric) => {
      const existing = acc.find((d) => d.timestamp === metric.timestamp);
      if (existing) {
        existing[metric.nodeName] = metric.value;
      } else {
        acc.push({
          timestamp: metric.timestamp,
          [metric.nodeName]: metric.value,
        });
      }
      return acc;
    }, [] as any[]);
  }, [searchLatencyMetrics]);

  const searchLatencyLines = useMemo(() => {
    return nodeNames.map((nodeName, index) => ({
      dataKey: nodeName,
      stroke: ["#0891b2", "#059669", "#dc2626"][index % 3],
      name: nodeName,
    }));
  }, [nodeNames]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Cluster Operation Metrics
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
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Indexing Throughput Rate
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={indexingThroughputChartData}
                lines={indexingThroughputLines}
                xAxisKey="timestamp"
                yAxisLabel="docs/second"
              />
            )}
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Indexing Latency Rate
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={indexingLatencyChartData}
                lines={indexingLatencyLines}
                xAxisKey="timestamp"
                yAxisLabel="second"
              />
            )}
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Throughput Rate
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={searchThroughputChartData}
                lines={searchThroughputLines}
                xAxisKey="timestamp"
                yAxisLabel="ops/second"
              />
            )}
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Latency Rate
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={searchLatencyChartData}
                lines={searchLatencyLines}
                xAxisKey="timestamp"
                yAxisLabel="second"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
