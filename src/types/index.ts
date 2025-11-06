export interface ClusterMetrics {
  health: "green" | "yellow" | "red";
  nodeCount: number;
  dataNodeCount: number;
  primaryShards: number;
  unassignedShards: number;
  documentCount: number;
  timestamp: string;
}

export interface CPUMetric {
  timestamp: string;
  nodeName: string;
  usage: number;
}

export interface JVMMemoryMetric {
  timestamp: string;
  nodeName: string;
  heapUsed: number;
  heapMax: number;
  heapPercent: number;
}

export interface SearchMetric {
  timestamp: string;
  queriesPerSecond: number;
}

export interface QueryLatencyMetric {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface Alert {
  id: string;
  name: string;
  severity: "critical" | "warning" | "info";
  status: {
    inhibitedBy: string[];
    mutedBy: string[];
    silencedBy: string[];
    state: "active" | "suppressed";
  };
  description: string;
  labels: Record<string, string>;
  startsAt: string;
  endsAt?: string;
}

export interface PrometheusAlert {
  id: string;
  labels: {
    alertname: string;
    cluster: string;
    color: string;
    instance: string;
    job: string;
    severity: string;
  };
  annotations: {
    description: string;
    summary: string;
  };
  state: string;
  activeAt: string;
  value: string;
}

export interface User {
  sub: string;
  name: string;
  email: string;
  preferred_username: string;
  roles: string[];
}

export interface AuthTokens {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface AlertRule {
  id: string;
  name: string;
  groupName: string;
  state: "firing" | "pending" | "inactive";
  query: string;
  duration: number;
  severity: "critical" | "warning" | "info";
  annotations: {
    description: string;
    summary: string;
  };
  alerts: PrometheusAlert[];
  lastEvaluation: string;
}

export interface AlertChannel {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  enabled: boolean;
  created_at: string;
}

export interface AlertHistory {
  id: string;
  rule_id: string;
  triggered_at: string;
  resolved_at?: string;
  message: string;
  severity: "critical" | "warning" | "info";
  created_at: string;
}

export interface Account {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "viewer";
  status: "active" | "inactive" | "suspended";
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: "success" | "failure";
  error_message?: string;
  created_at: string;
}

export type TimeRange = "1h" | "6h" | "24h" | "7d";

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableSort {
  column: string;
  direction: "asc" | "desc";
}

export interface BackendResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
