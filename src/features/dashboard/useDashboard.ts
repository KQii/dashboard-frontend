import { useQuery } from "@tanstack/react-query";
import { TimeRange } from "../../types";
import {
  fetchClusterMetrics,
  fetchCPUMetrics,
  fetchJVMMemoryMetrics,
  fetchIndexingThroughputMetrics,
  fetchIndexingAverageLatencyMetrics,
  fetchSearchThroughputMetrics,
  fetchSearchAverageLatencyMetrics,
} from "../../services/apiDashboards";
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

export const useIndexingThroughputMetrics = (timeRange: TimeRange) => {
  const {
    data: indexingThroughputMetrics,
    isLoading: isLoadingIndexingThroughputMetrics,
    refetch: refetchIndexingThroughputMetrics,
    dataUpdatedAt: indexingThroughputMetricsUpdatedAt,
  } = useQuery({
    queryKey: ["indexingThroughputMetrics", timeRange],
    queryFn: () => fetchIndexingThroughputMetrics(timeRange),
    refetchInterval: 30000,
  });

  return {
    indexingThroughputMetrics,
    isLoadingIndexingThroughputMetrics,
    refetchIndexingThroughputMetrics,
    indexingThroughputMetricsUpdatedAt,
  };
};

export const useIndexingLatencyMetrics = (timeRange: TimeRange) => {
  const {
    data: indexingLatencyMetrics,
    isLoading: isLoadingIndexingLatencyMetrics,
    refetch: refetchIndexingLatencyMetrics,
    dataUpdatedAt: searchIndexingLatencyUpdatedAt,
  } = useQuery({
    queryKey: ["indexingLatencyMetrics", timeRange],
    queryFn: () => fetchIndexingAverageLatencyMetrics(timeRange),
    refetchInterval: 30000,
  });

  return {
    indexingLatencyMetrics,
    isLoadingIndexingLatencyMetrics,
    refetchIndexingLatencyMetrics,
    searchIndexingLatencyUpdatedAt,
  };
};

export const useSearchThroughputMetrics = (timeRange: TimeRange) => {
  const {
    data: searchThroughputMetrics,
    isLoading: isLoadingSearchThroughputMetrics,
    refetch: refetchSearchThroughputMetrics,
    dataUpdatedAt: searchThroughputMetricsUpdatedAt,
  } = useQuery({
    queryKey: ["searchThroughputMetrics", timeRange],
    queryFn: () => fetchSearchThroughputMetrics(timeRange),
    refetchInterval: 30000,
  });

  return {
    searchThroughputMetrics,
    isLoadingSearchThroughputMetrics,
    refetchSearchThroughputMetrics,
    searchThroughputMetricsUpdatedAt,
  };
};

export const useSearchLatencyMetrics = (timeRange: TimeRange) => {
  const {
    data: searchLatencyMetrics,
    isLoading: isLoadingSearchLatencyMetrics,
    refetch: refetchSearchLatencyMetrics,
    dataUpdatedAt: searchThroughputLatencyUpdatedAt,
  } = useQuery({
    queryKey: ["searchLatencyMetrics", timeRange],
    queryFn: () => fetchSearchAverageLatencyMetrics(timeRange),
    refetchInterval: 30000,
  });

  return {
    searchLatencyMetrics,
    isLoadingSearchLatencyMetrics,
    refetchSearchLatencyMetrics,
    searchThroughputLatencyUpdatedAt,
  };
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
