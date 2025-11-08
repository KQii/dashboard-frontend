/**
 * Utility functions for AlertsPage
 */

/**
 * Generates time range filter transformation for relative time periods
 */
export const createTimeRangeTransform = (field: string) => {
  return (value: string): Record<string, string | string[]> => {
    const now = new Date();
    let targetTime: Date;

    const timeMap: Record<string, number> = {
      "5m": 5 * 60 * 1000,
      "10m": 10 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
    };

    const offset = timeMap[value];
    if (!offset) return {};

    targetTime = new Date(now.getTime() - offset);

    return {
      [field]: [`gte:${targetTime.toISOString()}`, `lte:${now.toISOString()}`],
    };
  };
};

/**
 * Generates future time range filter transformation
 */
export const createFutureTimeRangeTransform = (field: string) => {
  return (value: string): Record<string, string | string[]> => {
    const now = new Date();
    let targetTime: Date;

    const timeMap: Record<string, number> = {
      "5m": 5 * 60 * 1000,
      "10m": 10 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
    };

    const offset = timeMap[value];
    if (!offset) return {};

    targetTime = new Date(now.getTime() + offset);

    return {
      [field]: [`gte:${now.toISOString()}`, `lte:${targetTime.toISOString()}`],
    };
  };
};

/**
 * Common time range select options for past time periods
 */
export const PAST_TIME_RANGE_OPTIONS = [
  { value: "5m", label: "Last 5 minutes" },
  { value: "10m", label: "Last 10 minutes" },
  { value: "30m", label: "Last 30 minutes" },
  { value: "1h", label: "Last 1 hour" },
  { value: "6h", label: "Last 6 hours" },
  { value: "24h", label: "Last 24 hours" },
];

/**
 * Common time range select options for future time periods
 */
export const FUTURE_TIME_RANGE_OPTIONS = [
  { value: "5m", label: "Next 5 minutes" },
  { value: "10m", label: "Next 10 minutes" },
  { value: "30m", label: "Next 30 minutes" },
  { value: "1h", label: "Next 1 hour" },
  { value: "6h", label: "Next 6 hours" },
  { value: "24h", label: "Next 24 hours" },
];

/**
 * Get color classes for severity badge
 */
export const getSeverityColor = (
  severity: "critical" | "warning" | "info"
): string => {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    warning: "bg-orange-100 text-orange-800",
    info: "bg-blue-100 text-blue-800",
  };
  return colors[severity];
};

/**
 * Get color classes for alert state badge
 */
export const getAlertStateColor = (
  state: "firing" | "pending" | "inactive"
): string => {
  const colors: Record<string, string> = {
    firing: "bg-red-100 text-red-800",
    pending: "bg-orange-100 text-orange-800",
    inactive: "bg-green-100 text-green-800",
  };
  return colors[state];
};

/**
 * Get color classes for active alert status badge
 */
export const getActiveAlertStatusColor = (
  state: "active" | "suppressed" | "resolved" | "unprocessed"
): string => {
  const colors: Record<string, string> = {
    active: "bg-red-100 text-red-800",
    suppressed: "bg-slate-100 text-slate-800",
    resolved: "bg-green-100 text-green-800",
    unprocessed: "bg-yellow-100 text-yellow-800",
  };
  return colors[state];
};

/**
 * Get color classes for silence status badge
 */
export const getSilenceStatusColor = (
  state: "active" | "pending" | "expired"
): string => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    pending: "bg-orange-100 text-orange-800",
    expired: "bg-red-100 text-red-800",
  };
  return colors[state];
};
