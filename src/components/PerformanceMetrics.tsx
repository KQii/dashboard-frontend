import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { CPUMetric, JVMMemoryMetric, TimeRange } from "../types";
import { TimeSeriesChart } from "./TimeSeriesChart";

interface PerformanceMetricsProps {
  cpuMetrics: CPUMetric[];
  jvmMetrics: JVMMemoryMetric[];
  isLoading: boolean;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function PerformanceMetrics({
  cpuMetrics,
  jvmMetrics,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: PerformanceMetricsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prometheusUrl = import.meta.env.VITE_PROMETHEUS_URL;

  const timeRangeOptions: TimeRange[] = ["1h", "6h", "24h", "7d"];

  const cpuChartData = cpuMetrics.reduce((acc, metric) => {
    const existing = acc.find((d) => d.timestamp === metric.timestamp);
    if (existing) {
      existing[metric.nodeName] = metric.usage;
    } else {
      acc.push({
        timestamp: metric.timestamp,
        [metric.nodeName]: metric.usage,
      });
    }
    return acc;
  }, [] as any[]);

  const nodeNames = [...new Set(cpuMetrics.map((m) => m.nodeName))];

  const cpuLines = nodeNames.map((nodeName, index) => ({
    dataKey: nodeName,
    stroke: ["#0891b2", "#059669", "#dc2626"][index % 3],
    name: nodeName,
  }));

  const jvmChartData = jvmMetrics.reduce((acc, metric) => {
    const existing = acc.find((d) => d.timestamp === metric.timestamp);
    if (existing) {
      existing[`Heap Used (${metric.nodeName})`] = metric.heapUsed;
      existing[`Heap Max (${metric.nodeName})`] = metric.heapMax;
    } else {
      acc.push({
        timestamp: metric.timestamp,
        [`Heap Used (${metric.nodeName})`]: metric.heapUsed,
        [`Heap Max (${metric.nodeName})`]: metric.heapMax,
      });
    }
    return acc;
  }, [] as any[]);

  // Generate lines for JVM chart - different colors per node, solid for Used, dashed for Max
  const jvmNodeNamesUnique = [...new Set(jvmMetrics.map((m) => m.nodeName))];
  const nodeColors = [
    "#0891b2",
    "#059669",
    "#dc2626",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const jvmLines = jvmNodeNamesUnique.flatMap((nodeName, index) => {
    const color = nodeColors[index % nodeColors.length];
    return [
      {
        dataKey: `Heap Used (${nodeName})`,
        stroke: color,
        name: `${nodeName} (Used)`,
        strokeWidth: 2,
        legendGroup: nodeName, // Group both lines under node name
      },
      {
        dataKey: `Heap Max (${nodeName})`,
        stroke: color,
        name: `${nodeName} (Max)`,
        strokeWidth: 1,
        strokeDasharray: "5 5", // Dashed line for max
        legendGroup: nodeName, // Group both lines under node name
      },
    ];
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Cluster Performance Metrics
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
          >
            View more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              CPU Usage (%)
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={cpuChartData}
                lines={cpuLines}
                xAxisKey="timestamp"
                yAxisLabel="CPU %"
              />
            )}
          </div>

          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              JVM Memory Usage
            </h3>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <TimeSeriesChart
                data={jvmChartData}
                lines={jvmLines}
                xAxisKey="timestamp"
                yAxisLabel="Memory (MB)"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
