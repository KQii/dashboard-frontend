import { useState, useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { TimeRange } from "../types";
import { PageLayout } from "../components/layout/PageLayout";
import { ClusterOverview } from "../components/container/ClusterOverview";
import { PerformanceMetrics } from "../components/container/PerformanceMetrics";
import { ApplicationMetrics } from "../components/container/ApplicationMetrics";
import { ActiveAlerts } from "../components/container/ActiveAlerts";
import {
  useClusterMetrics,
  useCPUMetrics,
  useJVMMemoryMetrics,
  useSearchMetrics,
  useQueryLatencyMetrics,
} from "../features/dashboard/useDashboard";
import { useActiveAlerts } from "../features/alerts/useAlerts";
import useTitle from "../hooks/useTitle";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  // React Query hooks - automatically handle loading, caching, and refetching
  const { clusterMetrics, isLoadingCluster, refetchCluster, clusterUpdatedAt } =
    useClusterMetrics();

  const {
    cpuMetrics = [],
    isLoadingCPU: isLoadingCpu,
    refetchCPU: refetchCpu,
    cpuUpdatedAt: cpuMetricsUpdatedAt,
  } = useCPUMetrics(timeRange);

  const {
    jvmMetrics = [],
    isLoadingJVM: isLoadingJvm,
    refetchJVM: refetchJvm,
    jvmUpdatedAt: jvmMetricsUpdatedAt,
  } = useJVMMemoryMetrics(timeRange);

  const {
    searchMetrics = [],
    isLoadingSearch,
    refetchSearch,
    searchUpdatedAt: searchMetricsMetricsUpdatedAt,
  } = useSearchMetrics(timeRange);

  const {
    latencyMetrics = [],
    isLoadingLatency,
    refetchLatency,
    latencyUpdatedAt: latencyMetricsUpdatedAt,
  } = useQueryLatencyMetrics(timeRange);

  const {
    activeAlerts = [],
    isLoadingAlerts,
    refetchAlerts,
  } = useActiveAlerts({ page: 1, limit: 4 });

  useTitle("Dashboard");

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
      pageTitle="Dashboard"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
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

      <ActiveAlerts alerts={activeAlerts} isLoading={isLoadingAlerts} />
    </PageLayout>
  );
}
