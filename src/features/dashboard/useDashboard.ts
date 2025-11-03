import { useQuery } from "@tanstack/react-query";
import { TimeRange } from "../../types";
import {
  fetchClusterMetrics,
  fetchCPUMetrics,
  fetchJVMMemoryMetrics,
  fetchActiveAlerts,
} from "../../services/api";
import {
  fetchSearchMetrics,
  fetchQueryLatencyMetrics,
} from "../../services/mockApi";

// Cluster Metrics Query
export const useClusterMetrics = () => {
  const {
    data: clusterMetrics,
    isLoading: isLoadingCluster,
    refetch: refetchCluster,
    dataUpdatedAt: clusterUpdatedAt,
  } = useQuery({
    queryKey: ["clusterMetrics"],
    queryFn: fetchClusterMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return { clusterMetrics, isLoadingCluster, refetchCluster, clusterUpdatedAt };
};

// CPU Metrics Query
export const useCPUMetrics = (timeRange: TimeRange) => {
  const {
    data: cpuMetrics,
    isLoading: isLoadingCPU,
    refetch: refetchCPU,
    dataUpdatedAt: cpuUpdatedAt,
  } = useQuery({
    queryKey: ["cpuMetrics", timeRange],
    queryFn: () => fetchCPUMetrics(timeRange),
    refetchInterval: 30000,
  });

  return { cpuMetrics, isLoadingCPU, refetchCPU, cpuUpdatedAt };
};

// JVM Memory Metrics Query
export const useJVMMemoryMetrics = (timeRange: TimeRange) => {
  const {
    data: jvmMetrics,
    isLoading: isLoadingJVM,
    refetch: refetchJVM,
    dataUpdatedAt: jvmUpdatedAt,
  } = useQuery({
    queryKey: ["jvmMetrics", timeRange],
    queryFn: () => fetchJVMMemoryMetrics(timeRange),
    refetchInterval: 30000,
  });

  return { jvmMetrics, isLoadingJVM, refetchJVM, jvmUpdatedAt };
};

// Search Metrics Query
export const useSearchMetrics = (timeRange: TimeRange) => {
  const {
    data: searchMetrics,
    isLoading: isLoadingSearch,
    refetch: refetchSearch,
    dataUpdatedAt: searchUpdatedAt,
  } = useQuery({
    queryKey: ["searchMetrics", timeRange],
    queryFn: () => fetchSearchMetrics(timeRange),
    refetchInterval: 30000,
  });

  return { searchMetrics, isLoadingSearch, refetchSearch, searchUpdatedAt };
};

// Query Latency Metrics Query
export const useQueryLatencyMetrics = (timeRange: TimeRange) => {
  const {
    data: latencyMetrics,
    isLoading: isLoadingLatency,
    refetch: refetchLatency,
    dataUpdatedAt: latencyUpdatedAt,
  } = useQuery({
    queryKey: ["latencyMetrics", timeRange],
    queryFn: () => fetchQueryLatencyMetrics(timeRange),
    refetchInterval: 30000,
  });

  return { latencyMetrics, isLoadingLatency, refetchLatency, latencyUpdatedAt };
};

// Active Alerts Query
export const useActiveAlerts = () => {
  const {
    data: activeAlerts,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
    dataUpdatedAt: alertsUpdatedAt,
  } = useQuery({
    queryKey: ["activeAlerts"],
    queryFn: fetchActiveAlerts,
    refetchInterval: 30000,
  });

  return { activeAlerts, isLoadingAlerts, refetchAlerts, alertsUpdatedAt };
};
