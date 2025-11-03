/*
  # Elasticsearch Monitoring Dashboard - Database Schema

  ## Overview
  This migration creates the database schema for storing historical metrics and user preferences
  for the Elasticsearch monitoring dashboard.

  ## New Tables
  
  ### `cluster_metrics`
  Stores historical snapshots of cluster health and statistics
  - `id` (uuid, primary key) - Unique identifier
  - `health` (text) - Cluster health status: green, yellow, or red
  - `node_count` (integer) - Total number of nodes in the cluster
  - `primary_shards` (integer) - Number of primary shards
  - `replica_shards` (integer) - Number of replica shards
  - `unassigned_shards` (integer) - Number of unassigned shards
  - `document_count` (bigint) - Total documents in cluster
  - `timestamp` (timestamptz) - When the metric was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `cpu_metrics`
  Time-series data for CPU usage per node
  - `id` (uuid, primary key) - Unique identifier
  - `node_name` (text) - Name of the Elasticsearch node
  - `usage` (numeric) - CPU usage percentage (0-100)
  - `timestamp` (timestamptz) - When the metric was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `jvm_metrics`
  Time-series data for JVM memory statistics
  - `id` (uuid, primary key) - Unique identifier
  - `heap_used` (numeric) - JVM heap memory used (MB)
  - `heap_max` (numeric) - JVM heap memory maximum (MB)
  - `heap_percent` (numeric) - Heap usage percentage
  - `timestamp` (timestamptz) - When the metric was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `search_metrics`
  Time-series data for search operations
  - `id` (uuid, primary key) - Unique identifier
  - `queries_per_second` (numeric) - Search queries per second
  - `timestamp` (timestamptz) - When the metric was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `query_latency_metrics`
  Time-series data for query latency percentiles
  - `id` (uuid, primary key) - Unique identifier
  - `p50` (numeric) - 50th percentile latency (ms)
  - `p95` (numeric) - 95th percentile latency (ms)
  - `p99` (numeric) - 99th percentile latency (ms)
  - `timestamp` (timestamptz) - When the metric was recorded
  - `created_at` (timestamptz) - Record creation timestamp

  ### `alert_events`
  Historical log of alert occurrences
  - `id` (uuid, primary key) - Unique identifier
  - `alert_id` (text) - External alert identifier
  - `name` (text) - Alert name
  - `severity` (text) - Alert severity: critical, warning, info
  - `status` (text) - Alert status: firing, pending, resolved
  - `description` (text) - Alert description
  - `labels` (jsonb) - Alert labels as JSON object
  - `starts_at` (timestamptz) - When alert started firing
  - `ends_at` (timestamptz, nullable) - When alert was resolved
  - `created_at` (timestamptz) - Record creation timestamp

  ### `user_preferences`
  User-specific dashboard settings
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `refresh_interval` (integer) - Auto-refresh interval in seconds
  - `default_time_range` (text) - Default time range for charts
  - `preferences` (jsonb) - Additional preferences as JSON
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for metrics tables (dashboard is for monitoring team)
  - User-specific access for user_preferences table

  ## Indexes
  - Timestamp indexes on all metrics tables for efficient time-range queries
  - User ID index on user_preferences for quick lookup
*/

-- Cluster metrics table
CREATE TABLE IF NOT EXISTS cluster_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  health text NOT NULL CHECK (health IN ('green', 'yellow', 'red')),
  node_count integer NOT NULL DEFAULT 0,
  primary_shards integer NOT NULL DEFAULT 0,
  replica_shards integer NOT NULL DEFAULT 0,
  unassigned_shards integer NOT NULL DEFAULT 0,
  document_count bigint NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cluster_metrics_timestamp ON cluster_metrics(timestamp DESC);

-- CPU metrics table
CREATE TABLE IF NOT EXISTS cpu_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name text NOT NULL,
  usage numeric(5, 2) NOT NULL CHECK (usage >= 0 AND usage <= 100),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpu_metrics_timestamp ON cpu_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cpu_metrics_node ON cpu_metrics(node_name, timestamp DESC);

-- JVM metrics table
CREATE TABLE IF NOT EXISTS jvm_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  heap_used numeric NOT NULL,
  heap_max numeric NOT NULL,
  heap_percent numeric(5, 2) NOT NULL CHECK (heap_percent >= 0 AND heap_percent <= 100),
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jvm_metrics_timestamp ON jvm_metrics(timestamp DESC);

-- Search metrics table
CREATE TABLE IF NOT EXISTS search_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queries_per_second numeric NOT NULL DEFAULT 0,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_metrics_timestamp ON search_metrics(timestamp DESC);

-- Query latency metrics table
CREATE TABLE IF NOT EXISTS query_latency_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  p50 numeric NOT NULL,
  p95 numeric NOT NULL,
  p99 numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_query_latency_metrics_timestamp ON query_latency_metrics(timestamp DESC);

-- Alert events table
CREATE TABLE IF NOT EXISTS alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id text NOT NULL,
  name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  status text NOT NULL CHECK (status IN ('firing', 'pending', 'resolved')),
  description text,
  labels jsonb DEFAULT '{}'::jsonb,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_starts_at ON alert_events(starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_events_severity ON alert_events(severity);
CREATE INDEX IF NOT EXISTS idx_alert_events_status ON alert_events(status);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  refresh_interval integer DEFAULT 30,
  default_time_range text DEFAULT '24h' CHECK (default_time_range IN ('1h', '6h', '24h', '7d')),
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE cluster_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpu_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE jvm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_latency_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for metrics tables (public read for monitoring team)
CREATE POLICY "Public read access for cluster metrics"
  ON cluster_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for CPU metrics"
  ON cpu_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for JVM metrics"
  ON jvm_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for search metrics"
  ON search_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for query latency metrics"
  ON query_latency_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access for alert events"
  ON alert_events FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user preferences (user-specific access)
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
