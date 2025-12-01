import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useIsFetching } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertCircle,
  BellOff,
  BetweenHorizontalStart,
  HelpCircle,
  User,
  X,
} from "lucide-react";
import { RootState } from "../../store";
import { PageLayout } from "../../components/layout/PageLayout";
import { Table } from "../../components/container/Table";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Tooltip } from "../../components/common/Tooltip";
import { DateTimePicker } from "../../components/common/DateTimePicker";
import { StatCard } from "../../components/ui/StatCard";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import {
  AlertRule,
  PrometheusAlert,
  TableSort,
  ActiveAlert,
  Silence,
} from "../../types";
import { formatDistanceToNow } from "date-fns";
import { dateTimeRangeToISO } from "../../utils/dateTimePickerUtils";
import {
  useAlertRules,
  useRuleGroups,
  useActiveAlerts,
  useAlertLabels,
} from "../../features/alerts/useAlerts";
import {
  useChannels,
  useSelectChannel,
} from "../../features/channels/useChannels";
import {
  useSilences,
  useCreateSilence,
  useDeleteSilence,
} from "../../features/alerts/useSilences";
import { createAlertRulesColumns } from "./alertRulesColumns";
import { activeInstancesColumns } from "./activeInstancesColumns";
import { createActiveAlertColumns } from "./activeAlertColumns";
import { createSilencesColumns } from "./silencesColumns";
import {
  createAlertRulesFilterConfig,
  activeAlertFilterConfig,
  silenceFilterConfig,
} from "./filterConfigs";
import useTitle from "../../hooks/useTitle";

export default function AlertsPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
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
  const [showCreateSilenceModal, setShowCreateSilenceModal] = useState(false);
  const [showConfirmExpireModal, setShowConfirmExpireModal] = useState(false);
  const [silenceToExpire, setSilenceToExpire] = useState<Silence | null>(null);
  const [silenceDateTimeRange, setSilenceDateTimeRange] = useState<{
    start: { date: Date | null; time: { hour: number; minute: number } };
    end: { date: Date | null; time: { hour: number; minute: number } };
  } | null>(null);
  const [selectedMatchers, setSelectedMatchers] = useState<
    { key: string; value: string }[]
  >([]);
  const [editingMatcherIndex, setEditingMatcherIndex] = useState<number | null>(
    null
  );
  const [newMatcherKey, setNewMatcherKey] = useState("");
  const [newMatcherValue, setNewMatcherValue] = useState("");
  const [silenceComment, setSilenceComment] = useState("");

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
  const { isSelecting: isSelectingChannel, selectChannel } = useSelectChannel();

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

  const { labels = [] } = useAlertLabels();

  // Use the create silence mutation hook
  const { isCreating, createSilence } = useCreateSilence();

  const { isDeleting, deleteSilence } = useDeleteSilence();

  // Initialize matchers from labels on modal open (only if not already populated)
  useEffect(() => {
    if (
      showCreateSilenceModal &&
      labels &&
      typeof labels === "object" &&
      selectedMatchers.length === 0 // Only populate if matchers are empty
    ) {
      const initialMatchers: { key: string; value: string }[] = [];
      Object.entries(labels).forEach(([key, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          values.forEach((value) => {
            initialMatchers.push({ key, value });
          });
        }
      });
      setSelectedMatchers(initialMatchers);
    }
  }, [showCreateSilenceModal, labels, selectedMatchers.length]);

  const isFetching = useIsFetching();
  const isRefreshing = isFetching > 0;

  useTitle("Alerts");

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

  // Initialize selectedChannels when modal opens
  useEffect(() => {
    if (showChannelModal) {
      const activeChannelIds = alertChannels
        .filter((ch) => ch.isActive)
        .map((ch) => ch.id);
      setSelectedChannels(activeChannelIds);
    }
  }, [showChannelModal, alertChannels]);

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleRemoveMatcher = (index: number) => {
    setSelectedMatchers((prev) => prev.filter((_, i) => i !== index));
    if (editingMatcherIndex === index) {
      setEditingMatcherIndex(null);
    }
  };

  const handleEditMatcher = (index: number) => {
    setEditingMatcherIndex(index);
  };

  const handleUpdateMatcher = (index: number, key: string, value: string) => {
    setSelectedMatchers((prev) =>
      prev.map((m, i) => (i === index ? { key, value } : m))
    );
  };

  const handleFinishEditing = () => {
    // Validate before finishing edit - remove if key or value is empty
    if (editingMatcherIndex !== null) {
      const matcher = selectedMatchers[editingMatcherIndex];
      if (!matcher.key.trim() || !matcher.value.trim()) {
        // Remove the matcher if either key or value is empty
        setSelectedMatchers((prev) =>
          prev.filter((_, i) => i !== editingMatcherIndex)
        );
      }
    }
    setEditingMatcherIndex(null);
  };

  const handleAddNewMatcher = () => {
    if (newMatcherKey && newMatcherValue) {
      setSelectedMatchers((prev) => [
        ...prev,
        { key: newMatcherKey, value: newMatcherValue },
      ]);
      setNewMatcherKey("");
      setNewMatcherValue("");
    }
  };

  const isValidMatcherFormat = (key: string, value: string): boolean => {
    // Both key and value must be non-empty
    if (!key.trim() || !value.trim()) {
      return false;
    }
    // Check if key follows valid identifier pattern
    const keyRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return keyRegex.test(key);
  };

  const canAddNewMatcher = useMemo(() => {
    return isValidMatcherFormat(newMatcherKey, newMatcherValue);
  }, [newMatcherKey, newMatcherValue]);

  const saveChannelPreferences = () => {
    const selectedTypes = alertChannels
      .filter((channel) => selectedChannels.includes(channel.id))
      .map((channel) => channel.type);

    selectChannel(selectedTypes);
    setShowChannelModal(false);
  };

  const handleSilenceAlert = useCallback((alert: ActiveAlert) => {
    // Set duration: current time to 5 minutes later
    const now = new Date();
    const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

    setSilenceDateTimeRange({
      start: {
        date: now,
        time: {
          hour: now.getHours(),
          minute: now.getMinutes(),
        },
      },
      end: {
        date: endTime,
        time: {
          hour: endTime.getHours(),
          minute: endTime.getMinutes(),
        },
      },
    });

    // Set matchers from alert labels
    const matchers = Object.entries(alert.labels).map(([key, value]) => ({
      key,
      value,
    }));
    setSelectedMatchers(matchers);

    // Open the create silence modal
    setShowCreateSilenceModal(true);
  }, []);

  const handleRecreateSilence = useCallback((silence: Silence) => {
    // Set duration: current time to 5 minutes later
    const now = new Date();
    const endTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes later

    setSilenceDateTimeRange({
      start: {
        date: now,
        time: {
          hour: now.getHours(),
          minute: now.getMinutes(),
        },
      },
      end: {
        date: endTime,
        time: {
          hour: endTime.getHours(),
          minute: endTime.getMinutes(),
        },
      },
    });

    // Set matchers from silence matchers
    const matchers = silence.matchers.map((matcher) => ({
      key: matcher.name,
      value: matcher.value,
    }));
    setSelectedMatchers(matchers);

    // Pre-populate creator and comment from the expired silence
    setSilenceComment(silence.comment);

    // Open the create silence modal
    setShowCreateSilenceModal(true);
  }, []);

  const handleExpireSilence = useCallback((silence: Silence) => {
    setSilenceToExpire(silence);
    setShowConfirmExpireModal(true);
  }, []);

  const confirmExpireSilence = () => {
    if (silenceToExpire) {
      deleteSilence(silenceToExpire.id);
      setShowConfirmExpireModal(false);
      setSilenceToExpire(null);
    }
  };

  // Column definitions using imported creators
  const rulesColumns = useMemo(
    () =>
      createAlertRulesColumns(
        (rule) => {
          setSelectedRule(rule);
          setShowRuleDetailModal(true);
        },
        alertPage,
        alertPageSize
      ),
    [alertPage]
  );

  const activeAlertColumns = useMemo(
    () =>
      createActiveAlertColumns(
        (alert) => {
          setSelectedActiveAlert(alert);
          setShowActiveAlertDetailModal(true);
        },
        handleSilenceAlert,
        activeAlertPage,
        activeAlertPageSize
      ),
    [handleSilenceAlert, activeAlertPage]
  );

  const silencesColumns = useMemo(
    () =>
      createSilencesColumns(
        (silence) => {
          setSelectedSilence(silence);
          setShowSilenceDetailModal(true);
        },
        handleRecreateSilence,
        handleExpireSilence,
        silencePage,
        silencePageSize
      ),
    [handleRecreateSilence, handleExpireSilence, silencePage]
  );

  return (
    <PageLayout
      pageTitle="Alert Management"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Active Rules"
          value={
            activeAlertRules.filter(
              (r) => r.state === "firing" || r.state === "pending"
            ).length
          }
          subtitle={`(${
            activeAlertRules.filter((r) => r.state === "firing").length
          } firing, ${
            activeAlertRules.filter((r) => r.state === "pending").length
          } pending)`}
          icon={AlertCircle}
          iconColor="text-green-600"
        />

        <StatCard
          label="Current Silences"
          value={
            silences.filter(
              (r) => r.state === "active" || r.state === "pending"
            ).length
          }
          subtitle={`(${
            silences.filter((r) => r.state === "active").length
          } active, ${
            silences.filter((r) => r.state === "pending").length
          } pending)`}
          icon={BellOff}
          iconColor="text-orange-600"
        />

        <StatCard
          label="Alert Channels"
          value={alertChannels.length}
          subtitle={`(Subscribing to ${
            alertChannels.filter((a) => a.isActive).length
          } channel${
            alertChannels.filter((a) => a.isActive).length > 1 ? "s" : ""
          })`}
          icon={BetweenHorizontalStart}
          iconColor="text-cyan-600"
        />

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
          headerActions={
            <button
              onClick={() => setShowCreateSilenceModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              Create Silence
            </button>
          }
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
            disabled={isSelectingChannel}
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
                showRefreshButton={false}
                showFilterButton={false}
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
                    {formatDistanceToNow(
                      new Date(selectedActiveAlert.updatedAt),
                      {
                        addSuffix: true,
                      }
                    )}
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
                    {formatDistanceToNow(new Date(selectedSilence.updatedAt), {
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

      {/* Create Silence Modal */}
      <Modal
        isOpen={showCreateSilenceModal}
        onClose={() => {
          setShowCreateSilenceModal(false);
          setSilenceDateTimeRange(null);
          setSelectedMatchers([]);
          setEditingMatcherIndex(null);
          setNewMatcherKey("");
          setNewMatcherValue("");
          setSilenceComment("");
        }}
        title="Create Silence"
        size="xl"
      >
        <div className="space-y-6">
          {/* Date Time Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <DateTimePicker
              value={silenceDateTimeRange || undefined}
              onChange={setSilenceDateTimeRange}
              placeholder="Select start and end date/time"
            />
          </div>

          {/* Matchers Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matchers
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Alerts affected by this silence
            </p>
            <div className="space-y-2">
              {/* Existing matchers */}
              {selectedMatchers.map((matcher, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 border rounded-lg bg-white"
                >
                  {editingMatcherIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={matcher.key}
                        onChange={(e) =>
                          handleUpdateMatcher(
                            index,
                            e.target.value,
                            matcher.value
                          )
                        }
                        placeholder="key"
                        className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none"
                      />
                      <span className="text-gray-400">=</span>
                      <input
                        type="text"
                        value={matcher.value}
                        onChange={(e) =>
                          handleUpdateMatcher(
                            index,
                            matcher.key,
                            e.target.value
                          )
                        }
                        placeholder="value"
                        className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none"
                      />
                      <button
                        onClick={handleFinishEditing}
                        className="px-3 py-2 text-sm text-cyan-600 hover:text-cyan-700"
                      >
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditMatcher(index)}
                        className="flex-1 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-cyan-600">{matcher.key}</span>
                        <span className="text-gray-400">="</span>
                        <span className="text-green-600">{matcher.value}</span>
                        <span className="text-gray-400">"</span>
                      </button>
                      <button
                        onClick={() => handleRemoveMatcher(index)}
                        className="px-3 py-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add new matcher card */}
              <div className="flex items-center gap-2 border rounded-lg bg-white">
                <input
                  type="text"
                  value={newMatcherKey}
                  onChange={(e) => setNewMatcherKey(e.target.value)}
                  placeholder="key"
                  className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none"
                />
                <span className="text-gray-400">=</span>
                <span className="text-gray-400">"</span>
                <input
                  type="text"
                  value={newMatcherValue}
                  onChange={(e) => setNewMatcherValue(e.target.value)}
                  placeholder="value"
                  className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none"
                />
                <span className="text-gray-400">"</span>
                <button
                  onClick={handleAddNewMatcher}
                  disabled={!canAddNewMatcher}
                  className={`px-3 py-2 transition-colors ${
                    canAddNewMatcher
                      ? "text-cyan-600 hover:text-cyan-700"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Helper text */}
              <p className="text-xs text-gray-500 italic">
                Custom matcher, e.g. env="production"
              </p>
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={silenceComment}
              onChange={(e) => setSilenceComment(e.target.value)}
              placeholder="Reason for silence..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-3 justify-end pt-6 border-t mt-6">
          <button
            onClick={() => {
              setShowCreateSilenceModal(false);
              setSilenceDateTimeRange(null);
              setSelectedMatchers([]);
              setEditingMatcherIndex(null);
              setNewMatcherKey("");
              setNewMatcherValue("");
              setSilenceComment("");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={() => {
              // Validate required fields
              if (!silenceDateTimeRange?.start.date) {
                toast.error("Please select a start date and time");
                return;
              }
              if (selectedMatchers.length === 0) {
                toast.error("Please add at least one matcher");
                return;
              }
              if (!silenceComment.trim()) {
                toast.error("Please enter a comment");
                return;
              }

              // Transform data to API format
              const { startsAt, endsAt } =
                dateTimeRangeToISO(silenceDateTimeRange);

              const matchers = selectedMatchers.map((matcher) => ({
                name: matcher.key,
                value: matcher.value,
                isRegex: false,
              }));

              // Call the mutation
              createSilence(
                {
                  matchers,
                  startsAt,
                  endsAt,
                  createdBy: user.preferred_username,
                  comment: silenceComment,
                },
                {
                  onSuccess: () => {
                    // Close modal and reset form state on success
                    setShowCreateSilenceModal(false);
                    setSilenceDateTimeRange(null);
                    setSelectedMatchers([]);
                    setSilenceComment("");
                    setEditingMatcherIndex(null);
                    setNewMatcherKey("");
                    setNewMatcherValue("");
                  },
                }
              );
            }}
            disabled={isCreating}
            className="transition-colors"
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </Modal>

      {/* Confirm Expire Silence Modal */}
      <ConfirmModal
        isOpen={showConfirmExpireModal}
        title="Confirm Expire"
        resourceName={silenceToExpire?.id || "this silence"}
        onConfirm={confirmExpireSilence}
        onCloseModal={() => {
          setShowConfirmExpireModal(false);
          setSilenceToExpire(null);
        }}
        disabled={isDeleting}
        message="Are you sure you want to expire this silence?"
        confirmText="Expire"
      />
    </PageLayout>
  );
}
