import { ActiveAlert, AlertRule } from "../types";
import { ApiResponse } from "../types/response.types";

const dashboardBackendUrl = import.meta.env.VITE_DASHBOARD_BACKEND_URL;

export async function fetchActiveAlerts(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<ApiResponse<ActiveAlert>> {
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
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
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
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
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
): Promise<ApiResponse<AlertRule>> {
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
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
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
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching rule groups:", error);
    throw error;
  }
}
