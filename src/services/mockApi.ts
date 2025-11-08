import {
  ClusterMetrics,
  CPUMetric,
  JVMMemoryMetric,
  SearchMetric,
  QueryLatencyMetric,
  ActiveAlert,
} from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const nodeNames = ["node-1", "node-2", "node-3"];

function getRandomValue(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateTimeSeries(count: number, intervalMinutes: number): string[] {
  const timestamps: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    timestamps.push(time.toISOString());
  }

  return timestamps;
}

export async function fetchClusterMetrics(): Promise<ClusterMetrics> {
  await delay(300);

  const healthStates: Array<"green" | "yellow" | "red"> = [
    "green",
    "yellow",
    "red",
  ];
  const health =
    healthStates[
      Math.floor(Math.random() * 10) < 7
        ? 0
        : Math.floor(Math.random() * 10) < 9
        ? 1
        : 2
    ];

  return {
    health,
    nodeCount: 3,
    dataNodeCount: 2,
    primaryShards: Math.floor(getRandomValue(50, 100)),
    unassignedShards: health === "green" ? 0 : Math.floor(getRandomValue(0, 5)),
    documentCount: Math.floor(getRandomValue(1000000, 5000000)),
    timestamp: new Date().toISOString(),
  };
}

export async function fetchCPUMetrics(timeRange: string): Promise<CPUMetric[]> {
  await delay(500);

  const pointsMap: Record<string, number> = {
    "1h": 12,
    "6h": 36,
    "24h": 48,
    "7d": 84,
  };

  const intervalMap: Record<string, number> = {
    "1h": 5,
    "6h": 10,
    "24h": 30,
    "7d": 120,
  };

  const points = pointsMap[timeRange] || 12;
  const interval = intervalMap[timeRange] || 5;
  const timestamps = generateTimeSeries(points, interval);

  const metrics: CPUMetric[] = [];

  nodeNames.forEach((nodeName) => {
    const baseUsage = getRandomValue(20, 50);
    timestamps.forEach((timestamp, index) => {
      const variance = Math.sin(index * 0.5) * 15;
      const usage = Math.max(
        0,
        Math.min(100, baseUsage + variance + getRandomValue(-5, 5))
      );

      metrics.push({
        timestamp,
        nodeName,
        usage: parseFloat(usage.toFixed(2)),
      });
    });
  });

  return metrics;
}

export async function fetchJVMMemoryMetrics(
  timeRange: string
): Promise<JVMMemoryMetric[]> {
  await delay(500);

  const pointsMap: Record<string, number> = {
    "1h": 12,
    "6h": 36,
    "24h": 48,
    "7d": 84,
  };

  const intervalMap: Record<string, number> = {
    "1h": 5,
    "6h": 10,
    "24h": 30,
    "7d": 120,
  };

  const points = pointsMap[timeRange] || 12;
  const interval = intervalMap[timeRange] || 5;
  const timestamps = generateTimeSeries(points, interval);

  const metrics: JVMMemoryMetric[] = [];

  nodeNames.forEach((nodeName) => {
    const heapMax = 1024 * 1024 * 1024; // 1GB in bytes
    const baseHeapUsed = getRandomValue(500 * 1024 * 1024, 800 * 1024 * 1024);

    timestamps.forEach((timestamp, index) => {
      const variance = Math.sin(index * 0.3) * 100 * 1024 * 1024;
      const heapUsed = Math.max(
        200 * 1024 * 1024,
        Math.min(
          heapMax - 50 * 1024 * 1024,
          baseHeapUsed +
            variance +
            getRandomValue(-50 * 1024 * 1024, 50 * 1024 * 1024)
        )
      );

      metrics.push({
        timestamp,
        nodeName,
        heapUsed: parseFloat(heapUsed.toFixed(2)),
        heapMax,
        heapPercent: parseFloat(((heapUsed / heapMax) * 100).toFixed(2)),
      });
    });
  });

  return metrics;
}

export async function fetchSearchMetrics(
  timeRange: string
): Promise<SearchMetric[]> {
  await delay(500);

  const pointsMap: Record<string, number> = {
    "1h": 12,
    "6h": 36,
    "24h": 48,
    "7d": 84,
  };

  const intervalMap: Record<string, number> = {
    "1h": 5,
    "6h": 10,
    "24h": 30,
    "7d": 120,
  };

  const points = pointsMap[timeRange] || 12;
  const interval = intervalMap[timeRange] || 5;
  const timestamps = generateTimeSeries(points, interval);

  const baseQPS = getRandomValue(100, 300);

  return timestamps.map((timestamp, index) => {
    const variance = Math.sin(index * 0.4) * 50;
    const qps = Math.max(0, baseQPS + variance + getRandomValue(-20, 20));

    return {
      timestamp,
      queriesPerSecond: parseFloat(qps.toFixed(2)),
    };
  });
}

export async function fetchQueryLatencyMetrics(
  timeRange: string
): Promise<QueryLatencyMetric[]> {
  await delay(500);

  const pointsMap: Record<string, number> = {
    "1h": 12,
    "6h": 36,
    "24h": 48,
    "7d": 84,
  };

  const intervalMap: Record<string, number> = {
    "1h": 5,
    "6h": 10,
    "24h": 30,
    "7d": 120,
  };

  const points = pointsMap[timeRange] || 12;
  const interval = intervalMap[timeRange] || 5;
  const timestamps = generateTimeSeries(points, interval);

  const baseP50 = getRandomValue(5, 15);
  const baseP95 = getRandomValue(30, 60);
  const baseP99 = getRandomValue(80, 150);

  return timestamps.map((timestamp, index) => {
    const variance = Math.sin(index * 0.3) * 5;

    return {
      timestamp,
      p50: parseFloat(
        Math.max(1, baseP50 + variance + getRandomValue(-2, 2)).toFixed(2)
      ),
      p95: parseFloat(
        Math.max(10, baseP95 + variance * 2 + getRandomValue(-5, 5)).toFixed(2)
      ),
      p99: parseFloat(
        Math.max(30, baseP99 + variance * 3 + getRandomValue(-10, 10)).toFixed(
          2
        )
      ),
    };
  });
}

export async function fetchActiveAlerts(): Promise<ActiveAlert[]> {
  await delay(400);

  const mockAlerts: ActiveAlert[] = [
    {
      id: "1",
      name: "HighCPUUsage",
      severity: "warning",
      status: {
        inhibitedBy: [],
        mutedBy: [],
        silencedBy: [],
        state: "active",
      },
      description:
        "CPU usage on node-2 has exceeded 80% for the last 10 minutes",
      labels: {
        node: "node-2",
        cluster: "production",
        alertname: "HighCPUUsage",
      },
      startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      name: "HighMemoryPressure",
      severity: "critical",
      status: {
        inhibitedBy: [],
        mutedBy: [],
        silencedBy: [],
        state: "active",
      },
      description: "JVM heap usage is above 90% on multiple nodes",
      labels: {
        cluster: "production",
        alertname: "HighMemoryPressure",
      },
      startsAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      name: "SlowQueryDetected",
      severity: "info",
      status: {
        inhibitedBy: [],
        mutedBy: [],
        silencedBy: ["silence-1"],
        state: "active",
      },
      description: "Query latency p99 is above 200ms",
      labels: {
        cluster: "production",
        alertname: "SlowQueryDetected",
      },
      startsAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "UnassignedShards",
      severity: "warning",
      status: {
        inhibitedBy: [],
        mutedBy: [],
        silencedBy: [],
        state: "active",
      },
      description: "There are 3 unassigned shards in the cluster",
      labels: {
        cluster: "production",
        alertname: "UnassignedShards",
      },
      startsAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  // return mockAlerts.slice(0, Math.floor(Math.random() * 4) + 1);
  return mockAlerts;
}

// Mock data for AlertsPage
export async function fetchAlertRules() {
  await delay(400);

  return [
    {
      id: "rule-1",
      name: "High CPU Usage",
      condition: "cpu_usage > 80 for 10m",
      severity: "warning" as const,
      enabled: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rule-2",
      name: "Memory Pressure Critical",
      condition: "jvm_heap_usage > 90 for 5m",
      severity: "critical" as const,
      enabled: true,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rule-3",
      name: "Slow Query Detection",
      condition: "query_latency_p99 > 200ms",
      severity: "info" as const,
      enabled: true,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rule-4",
      name: "Unassigned Shards",
      condition: "unassigned_shards > 0 for 15m",
      severity: "warning" as const,
      enabled: true,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rule-5",
      name: "Disk Space Low",
      condition: "disk_usage > 85%",
      severity: "critical" as const,
      enabled: false,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rule-6",
      name: "High Search Rate",
      condition: "search_rate > 1000 qps",
      severity: "info" as const,
      enabled: true,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function fetchAlertChannels() {
  await delay(300);

  return [
    {
      id: "channel-1",
      name: "Email - Operations Team",
      type: "email",
      description: "Sends alerts to ops@company.com",
      enabled: true,
      config: { recipients: ["ops@company.com"] },
      created_at: new Date(
        Date.now() - 100 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: "channel-2",
      name: "Slack - #alerts",
      type: "slack",
      description: "Posts to #alerts channel in Slack",
      enabled: true,
      config: { webhook_url: "https://hooks.slack.com/..." },
      created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "channel-3",
      name: "PagerDuty - On-Call",
      type: "pagerduty",
      description: "Pages on-call engineer for critical alerts",
      enabled: true,
      config: { service_key: "xxxxx" },
      created_at: new Date(
        Date.now() - 120 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      id: "channel-4",
      name: "SMS - Manager",
      type: "sms",
      description: "Sends SMS to manager for critical issues",
      enabled: true,
      config: { phone_number: "+1234567890" },
      created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function fetchAlertHistory() {
  await delay(500);

  const severities = ["critical", "warning", "info"] as const;
  const messages = [
    "High CPU usage detected on node-2",
    "Memory pressure exceeds threshold",
    "Query latency spike detected",
    "Unassigned shards found in cluster",
    "Disk usage critical on node-1",
    "Search rate anomaly detected",
    "JVM garbage collection pause time high",
    "Network latency increase detected",
    "Index refresh time exceeded",
    "Document count threshold reached",
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const triggeredAt = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    );
    const resolved = Math.random() > 0.3;
    const resolvedAt = resolved
      ? new Date(
          triggeredAt.getTime() + Math.random() * 2 * 60 * 60 * 1000
        ).toISOString()
      : undefined;

    return {
      id: `history-${i + 1}`,
      rule_id: `rule-${Math.floor(Math.random() * 6) + 1}`,
      message: messages[Math.floor(Math.random() * messages.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      triggered_at: triggeredAt.toISOString(),
      resolved_at: resolvedAt,
      created_at: triggeredAt.toISOString(),
    };
  }).sort(
    (a, b) =>
      new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
  );
}
