import { capitalize } from "../utils/capitalize";
import {
  ClusterMetrics,
  CPUMetric,
  JVMMemoryMetric,
  TimeRange,
  ActiveAlert,
  AlertRule,
  BackendResponse,
  Silence,
} from "../types";

const dashboardBackendUrl = import.meta.env.VITE_DASHBOARD_BACKEND_URL;

const descriptionMap: Record<string, Record<string, string>> = {
  email: {
    name: " - Operations Team",
    description: "Sends alerts to ...",
  },
  slack: {
    name: " - ...",
    description: "Posts to ... channel on Slack",
  },
};

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

export async function fetchActiveAlerts(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<BackendResponse<ActiveAlert>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Check if this is a time range filter (values start with gte: or lte:)
          const isTimeRangeFilter = value.some(
            (item) =>
              typeof item === "string" &&
              (item.startsWith("gte:") || item.startsWith("lte:"))
          );

          if (isTimeRangeFilter) {
            // For time range filters, append each item separately with the same key
            // This supports formats like: startsAt=gte:xxx&startsAt=lte:xxx
            value.forEach((item) => {
              if (item) {
                params.append(key, item);
              }
            });
          } else {
            // For checkbox filters (multiple values), join with comma
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
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

    const url = `${dashboardBackendUrl}/api/alertmanager/alerts${
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

export async function fetchAlertLabels(): Promise<string[]> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/alertmanager/alert-labels`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching rule groups:", error);
    throw error;
  }
}

export async function fetchAlertRules(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<BackendResponse<AlertRule>> {
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

export async function fetchRuleGroups(): Promise<string[]> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/prometheus/rule-groups`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching rule groups:", error);
    throw error;
  }
}

export async function fetchChannels(): Promise<any[]> {
  try {
    const response = await fetch(
      `${dashboardBackendUrl}/api/alertmanager/channels`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const channels = result.data.map((c: Record<string, string>) => {
      const name = capitalize(
        c.type
          .concat(descriptionMap[c.type]["name"])
          .replace(/\.\.\./g, c.sendTo)
      );
      const description = descriptionMap[c.type]["description"].replace(
        /\.\.\./g,
        c.sendTo
      );

      return {
        ...c,
        name,
        description,
      };
    });
    console.log(channels);

    return channels;
  } catch (error) {
    console.error("Error fetching rule groups:", error);
    throw error;
  }
}

export async function fetchSilences(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<BackendResponse<Silence>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Check if this is a time range filter (values start with gte: or lte:)
          const isTimeRangeFilter = value.some(
            (item) =>
              typeof item === "string" &&
              (item.startsWith("gte:") || item.startsWith("lte:"))
          );

          if (isTimeRangeFilter) {
            // For time range filters, append each item separately with the same key
            // This supports formats like: startsAt=gte:xxx&startsAt=lte:xxx
            value.forEach((item) => {
              if (item) {
                params.append(key, item);
              }
            });
          } else {
            // For checkbox filters (multiple values), join with comma
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
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

    const url = `${dashboardBackendUrl}/api/alertmanager/silences${
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

export async function createSilence(silenceData: {
  matchers: Array<{
    name: string;
    value: string;
    isRegex?: boolean;
  }>;
  startsAt: string;
  endsAt: string;
  createdBy: string;
  comment: string;
}): Promise<Silence> {
  try {
    const requestBody = {
      ...silenceData,
      matchers: silenceData.matchers.map((matcher) => ({
        name: matcher.name,
        value: matcher.value,
        isRegex: matcher.isRegex ?? false,
      })),
    };

    const response = await fetch(
      `${dashboardBackendUrl}/api/alertmanager/silences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating silence:", error);
    throw error;
  }
}
