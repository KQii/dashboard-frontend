import { useState, useEffect, useMemo } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  BellOff,
  BetweenHorizontalStart,
  HelpCircle,
  User,
} from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Table } from "../../components/container/Table";
import { Modal } from "../../components/common/Modal";
import { Tooltip } from "../../components/common/Tooltip";
import {
  AlertRule,
  AlertHistory,
  PrometheusAlert,
  TableSort,
  ActiveAlert,
  Silence,
} from "../../types";
import { formatDistanceToNow } from "date-fns";
import { fetchAlertHistory } from "../../services/mockApi";
import {
  useAlertRules,
  useRuleGroups,
  useActiveAlerts,
  useChannels,
} from "../../features/alerts/useAlerts";
import { useSilences } from "../../features/alerts/useSilences";
import { createAlertRulesColumns } from "./alertRulesColumns";
import { historyColumns } from "./historyColumns";
import { activeInstancesColumns } from "./activeInstancesColumns";
import { createActiveAlertColumns } from "./activeAlertColumns";
import { createSilencesColumns } from "./silencesColumns";
import {
  createAlertRulesFilterConfig,
  activeAlertFilterConfig,
  silenceFilterConfig,
} from "./filterConfigs";

export function AlertsPage() {
  const [searchParams] = useSearchParams();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [showRuleDetailModal, setShowRuleDetailModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [showActiveAlertDetailModal, setShowActiveAlertDetailModal] =
    useState(false);
  const [selectedActiveAlert, setSelectedActiveAlert] =
    useState<ActiveAlert | null>(null);
  const [showSilenceDetailModal, setShowSilenceDetailModal] = useState(false);
  const [selectedSilence, setSelectedSilence] = useState<Silence | null>(null);

  // Server-side filtering, sorting, and alertRulesPagination state
  const [alertFilters, setAlertFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [alertSort, setAlertSort] = useState<TableSort[]>([]);
  const [alertPage, setAlertPage] = useState(1);
  const alertPageSize = 5;

  // Server-side filtering, sorting, and pagination state for Active Alerts
  const [activeAlertFilters, setActiveAlertFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [activeAlertSort, setActiveAlertSort] = useState<TableSort[]>([]);
  const [activeAlertPage, setActiveAlertPage] = useState(1);
  const activeAlertPageSize = 5;

  // Server-side filtering, sorting, and pagination state for Silences
  const [silenceFilters, setSilenceFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [silenceSort, setSilenceSort] = useState<TableSort[]>([]);
  const [silencePage, setSilencePage] = useState(1);
  const silencePageSize = 5;

  // Fetch unfiltered data for the summary card (total active rules count)
  const {
    alertRules: activeAlertRules = [],
    refetchAlertRules: refetchActiveAlertRules,
  } = useAlertRules({
    filters: { state: "firing,pending" },
    sort: [],
    page: 1,
    limit: 1000, // Get all rules for accurate count
  });

  // Fetch rule groups with React Query
  const { ruleGroups, refetchRuleGroups } = useRuleGroups();

  // Use React Query for alert rules with server-side params (for the table)
  const {
    alertRules = [],
    pagination: alertRulesPagination,
    isLoadingAlertRules: isLoadingRules,
    refetchAlertRules,
    alertRulesUpdatedAt,
  } = useAlertRules({
    filters: alertFilters,
    sort: alertSort,
    page: alertPage,
    limit: alertPageSize,
  });

  const {
    activeAlerts = [],
    pagination: activeAlertsPagination,
    isLoadingAlerts: isLoadingActiveAlerts,
    refetchAlerts: refetchActiveAlerts,
  } = useActiveAlerts({
    filters: activeAlertFilters,
    sort: activeAlertSort,
    page: activeAlertPage,
    limit: activeAlertPageSize,
  });

  const { channels: alertChannels = [], refetchChannels } = useChannels();

  const {
    silences = [],
    pagination: silencesPagination,
    isLoadingSilences,
    refetchSilences,
  } = useSilences({
    filters: silenceFilters,
    sort: silenceSort,
    page: silencePage,
    limit: silencePageSize,
  });

  const isFetching = useIsFetching();
  const isRefreshing = isFetching > 0;

  useEffect(() => {
    loadAlertHistory();
  }, []);

  // Handle URL parameter for showing all alerts modal (currently unused but kept for future use)
  useEffect(() => {
    const showAllAlerts = searchParams.get("showAllAlerts");
    if (showAllAlerts === "true") {
      // Modal functionality can be added here
    }
  }, [searchParams]);

  useEffect(() => {
    if (alertRulesUpdatedAt) {
      setLastUpdated(new Date(alertRulesUpdatedAt));
      setCountdown(30); // Reset countdown after fetch
    }
  }, [alertRulesUpdatedAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset when it reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      refetchAlertRules(),
      refetchActiveAlertRules(),
      refetchRuleGroups(),
      refetchActiveAlerts(),
      refetchChannels(),
      refetchSilences(),
    ]);
  };

  const loadAlertHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchAlertHistory();
      setAlertHistory(data);
    } catch (error) {
      console.error("Error loading alert history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const saveChannelPreferences = async () => {
    try {
      // Mock save - in real app, this would call an API
      console.log("Saving channel preferences:", selectedChannels);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setShowChannelModal(false);

      // Show success message (you could add a toast notification here)
      alert(
        `Successfully subscribed to ${selectedChannels.length} channel(s)!`
      );
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  // Column definitions using imported creators
  const rulesColumns = useMemo(
    () =>
      createAlertRulesColumns((rule) => {
        setSelectedRule(rule);
        setShowRuleDetailModal(true);
      }),
    []
  );

  const activeAlertColumns = useMemo(
    () =>
      createActiveAlertColumns((alert) => {
        setSelectedActiveAlert(alert);
        setShowActiveAlertDetailModal(true);
      }),
    []
  );

  const silencesColumns = useMemo(
    () =>
      createSilencesColumns((silence) => {
        setSelectedSilence(silence);
        setShowSilenceDetailModal(true);
      }),
    []
  );

  return (
    <PageLayout
      title="Alert Management"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
      showExternalLinks={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Rules</p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  activeAlertRules.filter(
                    (r) => r.state === "firing" || r.state === "pending"
                  ).length
                }
              </p>
              <p className="text-xs text-gray-600 font-normal">
                ({activeAlertRules.filter((r) => r.state === "firing").length}{" "}
                firing,{" "}
                {activeAlertRules.filter((r) => r.state === "pending").length}{" "}
                pending)
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Current Silences
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  silences.filter(
                    (r) => r.state === "active" || r.state === "pending"
                  ).length
                }
              </p>
              <p className="text-xs text-gray-600 font-normal">
                ({silences.filter((r) => r.state === "active").length} active,{" "}
                {silences.filter((r) => r.state === "pending").length} pending)
              </p>
            </div>
            <BellOff className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Alert Channels
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {alertChannels.length}
              </p>
            </div>
            <BetweenHorizontalStart className="w-12 h-12 text-cyan-600 opacity-20" />
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-3">
              Your Channels
            </p>
            <button
              onClick={() => setShowChannelModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors"
            >
              Manage Channels
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Table<AlertRule>
          data={alertRules}
          columns={rulesColumns}
          isLoading={isLoadingRules}
          title="Alert Rules"
          pageSize={alertPageSize}
          useServerSide={true}
          onFilterChange={setAlertFilters}
          onSortChange={setAlertSort}
          onPageChange={setAlertPage}
          onRefresh={refetchAlertRules}
          currentPage={alertRulesPagination?.page}
          totalCount={alertRulesPagination?.total}
          totalPages={alertRulesPagination?.totalPages}
          hasNextPage={alertRulesPagination?.hasNextPage}
          hasPrevPage={alertRulesPagination?.hasPrevPage}
          filterConfig={createAlertRulesFilterConfig(ruleGroups)}
        />
      </div>

      <div className="mb-8">
        <Table<ActiveAlert>
          data={activeAlerts}
          columns={activeAlertColumns}
          isLoading={isLoadingActiveAlerts}
          title="Active Alerts"
          pageSize={activeAlertPageSize}
          showBadgeCount={true}
          useServerSide={true}
          onFilterChange={setActiveAlertFilters}
          onSortChange={setActiveAlertSort}
          onPageChange={setActiveAlertPage}
          onRefresh={refetchActiveAlerts}
          currentPage={activeAlertsPagination?.page}
          totalCount={activeAlertsPagination?.total}
          totalPages={activeAlertsPagination?.totalPages}
          hasNextPage={activeAlertsPagination?.hasNextPage}
          hasPrevPage={activeAlertsPagination?.hasPrevPage}
          filterConfig={activeAlertFilterConfig}
        />
      </div>

      <div className="mb-8">
        <Table<Silence>
          data={silences}
          columns={silencesColumns}
          isLoading={isLoadingSilences}
          title="Silences"
          pageSize={silencePageSize}
          useServerSide={true}
          onFilterChange={setSilenceFilters}
          onSortChange={setSilenceSort}
          onPageChange={setSilencePage}
          onRefresh={refetchSilences}
          currentPage={silencesPagination?.page}
          totalCount={silencesPagination?.total}
          totalPages={silencesPagination?.totalPages}
          hasNextPage={silencesPagination?.hasNextPage}
          hasPrevPage={silencesPagination?.hasPrevPage}
          filterConfig={silenceFilterConfig}
        />
      </div>

      <div>
        <Table<AlertHistory>
          data={alertHistory}
          columns={historyColumns}
          isLoading={isLoadingHistory}
          title="Alert History"
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        title="Select Alert Channels"
        size="md"
      >
        <div className="space-y-3 mb-6">
          {alertChannels.map((channel) => (
            <label
              key={channel.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedChannels.includes(channel.id)}
                onChange={() => handleChannelToggle(channel.id)}
                className="w-4 h-4 text-cyan-600 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">{channel.name}</p>
                <p className="text-sm text-gray-500">{channel.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            onClick={() => setShowChannelModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveChannelPreferences}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showRuleDetailModal}
        onClose={() => {
          setShowRuleDetailModal(false);
          setSelectedRule(null);
        }}
        title="Alert Rule Details"
        size="xl"
      >
        {selectedRule && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Name
              </label>
              <p className="text-sm text-gray-900 font-semibold">
                {selectedRule.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <code className="block text-xs bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap break-normal">
                {selectedRule.query}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  For
                </label>
                <p className="text-sm text-gray-900">
                  {selectedRule.duration}s
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Evaluation
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedRule.lastEvaluation).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(
                      new Date(selectedRule.lastEvaluation),
                      {
                        addSuffix: true,
                      }
                    )}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedRule.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : selectedRule.severity === "warning"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedRule.severity.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedRule.state === "firing"
                      ? "bg-red-100 text-red-800"
                      : selectedRule.state === "pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedRule.state.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <Table<PrometheusAlert>
                data={selectedRule.alerts}
                columns={activeInstancesColumns}
                isLoading={isLoadingRules}
                title="Active Instances"
                pageSize={5}
                showBadgeCount={true}
                emptyDataProps={{
                  padding: "p-6",
                  message: "No active alert instance",
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={() => {
              setShowRuleDetailModal(false);
              setSelectedRule(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showActiveAlertDetailModal}
        onClose={() => {
          setShowActiveAlertDetailModal(false);
          setSelectedActiveAlert(null);
        }}
        title="Active Alert Details"
        size="xl"
      >
        {selectedActiveAlert && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Name
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {selectedActiveAlert.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Update
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedActiveAlert.updatedAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedActiveAlert.endsAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {Object.entries(selectedActiveAlert.labels).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-300"
                    >
                      {key}: {value}
                    </span>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <span className="block text-xs bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap break-normal">
                {selectedActiveAlert.annotations.summary}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <span className="block text-xs bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap break-normal">
                {selectedActiveAlert.annotations.description}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start At
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedActiveAlert.startsAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(
                      new Date(selectedActiveAlert.startsAt),
                      {
                        addSuffix: true,
                      }
                    )}
                    )
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected End Time
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedActiveAlert.endsAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedActiveAlert.endsAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedActiveAlert.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : selectedActiveAlert.severity === "warning"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {selectedActiveAlert.severity.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedActiveAlert.status.state === "active"
                      ? "bg-red-100 text-red-800"
                      : selectedActiveAlert.status.state === "suppressed"
                      ? "bg-slate-100 text-slate-800"
                      : selectedActiveAlert.status.state === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedActiveAlert.status.state.toUpperCase()}
                </span>
              </div>
            </div>

            {selectedActiveAlert.status.inhibitedBy.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-1">
                    Inhibited By
                    <Tooltip
                      content="Suppressed by higher-priority alerts to prevent redundant notifications"
                      position="top-right"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedActiveAlert.status.inhibitedBy.map(
                    (inhibitor, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 border border-purple-300"
                      >
                        {inhibitor}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {selectedActiveAlert.status.silencedBy.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center gap-1">
                    Silenced By
                    <Tooltip
                      content="Muted by silence rules, typically for maintenance or known issues"
                      position="top-right"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedActiveAlert.status.silencedBy.map(
                    (silence, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-800 border border-slate-300"
                      >
                        {silence}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={() => {
              setShowActiveAlertDetailModal(false);
              setSelectedActiveAlert(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showSilenceDetailModal}
        onClose={() => {
          setShowSilenceDetailModal(false);
          setSelectedSilence(null);
        }}
        title="Silence Details"
        size="xl"
      >
        {selectedSilence && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Silence ID
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {selectedSilence.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Update
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSilence.updatedAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedSilence.endsAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Affected Labels
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedSilence.matchers.map(({ name, value }) => (
                  <span
                    key={name}
                    className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-300"
                  >
                    {name}: {value}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment
              </label>
              <span className="block text-xs bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap break-normal">
                {selectedSilence.comment}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start At
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSilence.startsAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedSilence.startsAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ends At
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSilence.endsAt).toLocaleString()}
                  <span className="text-gray-500 ml-2">
                    (
                    {formatDistanceToNow(new Date(selectedSilence.endsAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                    selectedSilence.status.state === "active"
                      ? "bg-green-100 text-green-800"
                      : selectedSilence.status.state === "pending"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedSilence.status.state.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedSilence.createdBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={() => {
              setShowSilenceDetailModal(false);
              setSelectedSilence(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
