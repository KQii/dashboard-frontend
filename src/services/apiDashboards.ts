import {
  ClusterMetrics,
  CPUMetric,
  JVMMemoryMetric,
  TimeRange,
} from "../types";

const dashboardBackendUrl = import.meta.env.VITE_DASHBOARD_BACKEND_URL;

export async function fetchClusterMetrics(): Promise<ClusterMetrics> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/prometheus/cluster-metrics`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cluster metrics:", error);
    throw error;
  }
}

export async function fetchCPUMetrics(
  timeRange: TimeRange
): Promise<CPUMetric[]> {
  const convertMap = {
    "1h": {
      start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      step: "5m",
    },
    "6h": {
      start:
        new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split(".")[0] +
        "Z",
      end: new Date().toISOString(),
      step: "30m",
    },
    "24h": {
      start:
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split(".")[0] +
        "Z",
      end: new Date().toISOString(),
      step: "2h",
    },
    "7d": {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      step: "1d",
    },
  };

  const params = new URLSearchParams(convertMap[timeRange]);

  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/prometheus/cpu-metrics?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching cluster metrics:", error);
    throw error;
  }
}

export async function fetchJVMMemoryMetrics(
  timeRange: TimeRange
): Promise<JVMMemoryMetric[]> {
  const convertMap = {
    "1h": {
      start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      step: "5m",
    },
    "6h": {
      start:
        new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split(".")[0] +
        "Z",
      end: new Date().toISOString(),
      step: "30m",
    },
    "24h": {
      start:
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split(".")[0] +
        "Z",
      end: new Date().toISOString(),
      step: "2h",
    },
    "7d": {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      step: "1d",
    },
  };

  const params = new URLSearchParams(convertMap[timeRange]);

  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/prometheus/jvm-metrics?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching cluster metrics:", error);
    throw error;
  }
}
