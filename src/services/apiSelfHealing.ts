import { ApiResponse } from "../types/response.types";

const selfHealingBackendUrl = import.meta.env.VITE_SELF_HEALING_SERVICE_URL;

export interface AlertHistory {
  id: number;
  alert_fingerprint: string;
  alertname: string;
  created_at: string;
  starts_at: string;
  resolved_at: string;
  entry: {
    annotations: {
      description?: string;
      summary?: string;
      [key: string]: string | undefined;
    };
    labels: {
      action?: string;
      alertname?: string;
      instance?: string;
      [key: string]: string | undefined;
    };
  };
  processing_result: {
    success: boolean;
    message: string;
    error?: string;
    skipped?: boolean;
    reason?: string;
  };
  processed_at: string;
}

export interface SelfHealingStatus {
  status: "ENABLED" | "DISABLED" | "BUSY";
}

export type SelfHealingPostResponse =
  | {
      status: "success";
      new_status: "ENABLED" | "DISABLED";
    }
  | {
      status: "error";
      message: string;
    };

export interface Alertname {
  alertname: string;
  count: number;
}

export async function fetchSelfHealingHistory(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<ApiResponse<AlertHistory>> {
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

    // Add sort parameter
    if (sort && sort.length > 0) {
      const sortValue = sort
        .map((s) => (s.direction === "desc" ? `-${s.column}` : s.column))
        .join(",");
      params.append("sort", sortValue);
    }

    const url = `${selfHealingBackendUrl}/history/v3${
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
      data: result.data || result,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error fetching self-healing history:", error);
    throw error;
  }
}

export async function fetchSelfHealingStatus(): Promise<SelfHealingStatus> {
  try {
    const response = await fetch(`${selfHealingBackendUrl}/status`);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching self-healing status:", error);
    throw error;
  }
}

export async function toggleSelfHealing(
  status: string
): Promise<SelfHealingPostResponse> {
  try {
    const response = await fetch(`${selfHealingBackendUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error toggling self-healing:", error);
    throw error;
  }
}

export async function fetchAlertnames(): Promise<Alertname[]> {
  try {
    const response = await fetch(`${selfHealingBackendUrl}/alertnames`);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.alertnames;
  } catch (error) {
    console.error("Error fetching self-healing status:", error);
    throw error;
  }
}
