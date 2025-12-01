export interface Params {
  filters?: Record<string, string | string[]>;
  sort?: TableSort[];
  page?: number;
  limit?: number;
}

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

export interface ActiveAlert {
  id: string;
  name: string;
  severity: "critical" | "warning" | "info";
  status: ActiveAlertStatus;
  annotations: {
    description: string;
    summary: string;
  };
  labels: Record<string, string>;
  receivers: Record<string, string>[];
  startsAt: string;
  endsAt: string;
  updatedAt: string;
}

export interface ActiveAlertStatus {
  inhibitedBy: string[];
  mutedBy: string[];
  silencedBy: string[];
  state: "active" | "suppressed" | "resolved" | "unprocessed";
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

export interface SilenceMatcher {
  isEqual: string;
  isRegex: string;
  name: string;
  value: string;
}

export interface Silence {
  id: string;
  status: {
    state: "active" | "pending" | "expired";
  };
  state: "active" | "pending" | "expired";
  updatedAt: string;
  comment: string;
  createdBy: string;
  endsAt: string;
  matchers: SilenceMatcher[];
  startsAt: string;
}

export interface Channel {
  id: string;
  type: string;
  sendTo: string;
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
  type: string;
  name?: string;
  description?: string;
  sendTo: string;
  isActive: boolean;
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
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index?: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableSort {
  column: string;
  direction: "asc" | "desc";
}
