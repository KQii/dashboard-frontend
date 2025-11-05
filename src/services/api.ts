import {
  ClusterMetrics,
  CPUMetric,
  JVMMemoryMetric,
  TimeRange,
  Alert,
  AlertRule,
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

export async function fetchActiveAlerts(): Promise<Alert[]> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/alertmanager/alerts`
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

export interface AlertRulesResponse {
  data: AlertRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchAlertRules(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<AlertRulesResponse> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // For checkbox filters (multiple values), join with comma
          if (value.length > 0) {
            params.append(key, value.join(","));
          }
        } else if (value) {
          // For text/radio filters (single value)
          params.append(key, value);
        }
      });
    }

    // Add sort parameter (format: sort=-column1,column2,-column3)
    // Prefix with - for descending, no prefix for ascending
    if (sort && sort.length > 0) {
      const sortValue = sort
        .map((s) => (s.direction === "desc" ? `-${s.column}` : s.column))
        .join(",");
      params.append("sort", sortValue);
    }

    const url = `${dashboardBackendUrl}/api/prometheus/rules${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    throw error;
  }
}
