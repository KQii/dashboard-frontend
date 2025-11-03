import {
  Activity,
  Server,
  Database,
  FileText,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { ClusterMetrics } from "../types";
import { MetricCard } from "./MetricCard";
import { HealthBadge } from "./HealthBadge";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface ClusterOverviewProps {
  metrics: ClusterMetrics | null;
  isLoading: boolean;
}

export function ClusterOverview({ metrics, isLoading }: ClusterOverviewProps) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Cluster Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!metrics) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Cluster Overview
        </h2>
        <div className="border rounded-lg p-6 text-center text-gray-500">
          No cluster data available
        </div>
      </section>
    );
  }

  const healthStatus =
    metrics.health === "green"
      ? "success"
      : metrics.health === "yellow"
      ? "warning"
      : "danger";

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Cluster Overview</h2>
        <HealthBadge status={metrics.health} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Nodes"
          value={metrics.nodeCount}
          icon={Server}
          status="info"
          timestamp={metrics.timestamp}
        />

        <MetricCard
          title="Data Nodes"
          value={metrics.dataNodeCount}
          icon={Layers}
          status="info"
          timestamp={metrics.timestamp}
        />

        <MetricCard
          title="Primary Shards"
          value={metrics.primaryShards}
          icon={Database}
          status="info"
          timestamp={metrics.timestamp}
        />

        <MetricCard
          title="Unassigned Shards"
          value={metrics.unassignedShards}
          icon={AlertTriangle}
          status={metrics.unassignedShards > 0 ? "warning" : "success"}
          timestamp={metrics.timestamp}
        />

        <MetricCard
          title="Total Documents"
          value={metrics.documentCount.toLocaleString()}
          icon={FileText}
          status="info"
          timestamp={metrics.timestamp}
        />

        <MetricCard
          title="Cluster Health"
          value={metrics.health.toUpperCase()}
          icon={Activity}
          status={healthStatus}
          timestamp={metrics.timestamp}
        />
      </div>
    </section>
  );
}
