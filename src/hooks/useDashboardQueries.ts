import { useQuery } from "@tanstack/react-query";
import { TimeRange } from "../types";
import {
  fetchClusterMetrics,
  fetchCPUMetrics,
  fetchJVMMemoryMetrics,
  fetchActiveAlerts,
} from "../services/api";
import {
  fetchSearchMetrics,
  fetchQueryLatencyMetrics,
} from "../services/mockApi";

// Cluster Metrics Query
export const useClusterMetrics = () => {
  return useQuery({
    queryKey: ["clusterMetrics"],
    queryFn: fetchClusterMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// CPU Metrics Query
export const useCPUMetrics = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["cpuMetrics", timeRange],
    queryFn: () => fetchCPUMetrics(timeRange),
    refetchInterval: 30000,
  });
};

// JVM Memory Metrics Query
export const useJVMMemoryMetrics = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["jvmMetrics", timeRange],
    queryFn: () => fetchJVMMemoryMetrics(timeRange),
    refetchInterval: 30000,
  });
};

// Search Metrics Query
export const useSearchMetrics = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["searchMetrics", timeRange],
    queryFn: () => fetchSearchMetrics(timeRange),
    refetchInterval: 30000,
  });
};

// Query Latency Metrics Query
export const useQueryLatencyMetrics = (timeRange: TimeRange) => {
  return useQuery({
    queryKey: ["latencyMetrics", timeRange],
    queryFn: () => fetchQueryLatencyMetrics(timeRange),
    refetchInterval: 30000,
  });
};

// Active Alerts Query
export const useActiveAlerts = () => {
  return useQuery({
    queryKey: ["activeAlerts"],
    queryFn: fetchActiveAlerts,
    refetchInterval: 30000,
  });
};
