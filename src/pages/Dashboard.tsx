import { useState, useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { TimeRange } from "../types";
import { PageLayout } from "../components/PageLayout";
import { ClusterOverview } from "../components/ClusterOverview";
import { PerformanceMetrics } from "../components/PerformanceMetrics";
import { ApplicationMetrics } from "../components/ApplicationMetrics";
import { ActiveAlerts } from "../components/ActiveAlerts";
import {
  useClusterMetrics,
  useCPUMetrics,
  useJVMMemoryMetrics,
  useSearchMetrics,
  useQueryLatencyMetrics,
  useActiveAlerts,
} from "../hooks/useDashboardQueries";

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  // React Query hooks - automatically handle loading, caching, and refetching
  const {
    data: clusterMetrics,
    isLoading: isLoadingCluster,
    refetch: refetchCluster,
    dataUpdatedAt: clusterUpdatedAt,
  } = useClusterMetrics();

  const {
    data: cpuMetrics = [],
    isLoading: isLoadingCpu,
    refetch: refetchCpu,
    dataUpdatedAt: cpuMetricsUpdatedAt,
  } = useCPUMetrics(timeRange);

  const {
    data: jvmMetrics = [],
    isLoading: isLoadingJvm,
    refetch: refetchJvm,
    dataUpdatedAt: jvmMetricsUpdatedAt,
  } = useJVMMemoryMetrics(timeRange);

  const {
    data: searchMetrics = [],
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
    dataUpdatedAt: searchMetricsMetricsUpdatedAt,
  } = useSearchMetrics(timeRange);

  const {
    data: latencyMetrics = [],
    isLoading: isLoadingLatency,
    refetch: refetchLatency,
    dataUpdatedAt: latencyMetricsUpdatedAt,
  } = useQueryLatencyMetrics(timeRange);

  const {
    data: alerts = [],
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
  } = useActiveAlerts();

  // Track if any query is currently fetching
  const isFetching = useIsFetching();
  const isRefreshing = isFetching > 0;

  // Combined loading states
  const isLoadingPerformance = isLoadingCpu || isLoadingJvm;
  const isLoadingApplication = isLoadingSearch || isLoadingLatency;

  // Update lastUpdated when cluster data is fetched
  useEffect(() => {
    if (
      clusterUpdatedAt ||
      cpuMetricsUpdatedAt ||
      jvmMetricsUpdatedAt ||
      searchMetricsMetricsUpdatedAt ||
      latencyMetricsUpdatedAt
    ) {
      setLastUpdated(new Date(clusterUpdatedAt));
      setCountdown(30); // Reset countdown after fetch
    }
  }, [
    clusterUpdatedAt,
    cpuMetricsUpdatedAt,
    jvmMetricsUpdatedAt,
    searchMetricsMetricsUpdatedAt,
    latencyMetricsUpdatedAt,
  ]);

  // Countdown timer (counts down from 30 to 0)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Manual refresh all queries
  const handleRefresh = async () => {
    await Promise.all([
      refetchCluster(),
      refetchCpu(),
      refetchJvm(),
      refetchSearch(),
      refetchLatency(),
      refetchAlerts(),
    ]);
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    // React Query will automatically refetch queries that depend on timeRange
  };

  return (
    <PageLayout
      title="Elasticsearch Monitoring Dashboard"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
      showExternalLinks={true}
    >
      <ClusterOverview
        metrics={clusterMetrics ?? null}
        isLoading={isLoadingCluster}
      />

      <PerformanceMetrics
        cpuMetrics={cpuMetrics}
        jvmMetrics={jvmMetrics}
        isLoading={isLoadingPerformance}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      <ApplicationMetrics
        searchMetrics={searchMetrics}
        latencyMetrics={latencyMetrics}
        isLoading={isLoadingApplication}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      <ActiveAlerts alerts={alerts} isLoading={isLoadingAlerts} />
    </PageLayout>
  );
}
