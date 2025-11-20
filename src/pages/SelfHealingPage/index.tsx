import { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useIsFetching } from "@tanstack/react-query";
import { PageLayout } from "../../components/layout/PageLayout";
import { Table } from "../../components/container/Table";
import { Modal } from "../../components/common/Modal";
import { DateRangePicker } from "../../components/common/DateRangePicker";
import SelectSearchInput from "../../components/common/SelectSearchInput";
import {
  useAlertnames,
  useSelfHealingHistory,
  useSelfHealingStatus,
  useToggleSelfHealing,
} from "../../features/selfHealing/useSelfHealing";
import { SelfHealingAction } from "../../services/apiSelfHealing";
import { TableColumn } from "../../types";
import { TableRowButton } from "../../components/common/TableRowButton";

// Action mapping
const ACTION_MAP: Record<string, { name: string; icon: string }> = {
  system_test: { name: "System Test", icon: "🔍" },
  restart_node: { name: "Restart Node", icon: "🔄" },
  cleanup_disk: { name: "Disk Cleanup", icon: "🧹" },
  optimize_indexing: { name: "Optimize Index", icon: "⚡" },
  clear_caches: { name: "Delete Cache", icon: "🗑️" },
};

const getActionInfo = (labels: Record<string, string | undefined>) => {
  const action = labels?.action || labels?.alertname || "unknown";
  const actionLower = action.toLowerCase();

  for (const [key, value] of Object.entries(ACTION_MAP)) {
    if (actionLower === key || actionLower.includes(key)) {
      return { ...value, original: action };
    }
  }

  return { name: action, icon: "📌", original: action };
};

export default function SelfHealingPage() {
  // State for temporary filter inputs (not applied yet)
  const [tempDateRange, setTempDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  } | null>(null);
  const [tempAlertName, setTempAlertName] = useState<string | number>("");
  const [tempProcessingResult, setTempProcessingResult] = useState<
    string | number
  >("");
  const [tempResolvedResult, setTempResolvedResult] = useState<string | number>(
    ""
  );

  // State for applied filters (sent to API)
  const [appliedDateRange, setAppliedDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  } | null>(null);
  const [appliedAlertName, setAppliedAlertName] = useState<string | number>("");
  const [appliedProcessingResult, setAppliedProcessingResult] = useState<
    string | number
  >("");
  const [appliedResolvedResult, setAppliedResolvedResult] = useState<
    string | number
  >("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  // Build filters from applied filter state
  const filters = useMemo(() => {
    const result: Record<string, string | string[]> = {};

    if (appliedDateRange?.start) {
      // Set time to start of day (00:00:00) for start date
      const startDate = new Date(appliedDateRange.start);
      startDate.setHours(0, 0, 0, 0);

      // Set time to end of day (23:59:59) for end date
      const endDate = appliedDateRange.end
        ? new Date(appliedDateRange.end)
        : new Date(appliedDateRange.start);
      endDate.setHours(23, 59, 59, 999);

      result.starts_at = [
        `gte:${startDate.toISOString()}`,
        `lte:${endDate.toISOString()}`,
      ];
    }

    if (appliedAlertName) {
      result["alertname"] = String(appliedAlertName);
    }

    if (appliedProcessingResult) {
      result["processing_result.success"] = String(appliedProcessingResult);
    }

    if (appliedResolvedResult) {
      result["resolved_at"] = String(appliedResolvedResult);
    }

    return result;
  }, [
    appliedDateRange,
    appliedAlertName,
    appliedProcessingResult,
    appliedResolvedResult,
  ]);

  // State for detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelfHealingAction | null>(
    null
  );

  // State for PageLayout
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  // React Query hooks
  const { data, isLoading, isFetching, refetch, dataUpdatedAt } =
    useSelfHealingHistory({
      filters,
      page,
      limit: pageSize,
    });
  const { data: statusData } = useSelfHealingStatus();
  const { isToggling, toggleAutomation } = useToggleSelfHealing();
  const { alertnames, refetch: refetchAlertnames } = useAlertnames();
  const isFetchingAny = useIsFetching();
  const isRefreshing = isFetchingAny > 0;

  // Update lastUpdated when data changes
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
      setCountdown(30); // Reset countdown after fetch
    }
  }, [dataUpdatedAt]);

  // Countdown timer
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

  // Table columns
  const columns = useMemo<TableColumn<SelfHealingAction>[]>(
    () => [
      {
        key: "id",
        label: "#",
        width: "3%",
        render: (_, __, index) => {
          const rowNumber = (page - 1) * pageSize + (index ?? 0) + 1;
          return <span className="text-sm text-gray-600">{rowNumber}</span>;
        },
      },
      {
        key: "starts_at",
        label: "Start Time",
        width: "12%",
        render: (value) => {
          const date = new Date(value).toLocaleString();
          return <span className="text-sm text-gray-600">{date}</span>;
        },
      },
      {
        key: "created_at",
        label: "Record Time",
        width: "15%",
        render: (value) => {
          const date = new Date(value).toLocaleString();
          return <span className="text-sm text-gray-600">{date}</span>;
        },
      },
      {
        key: "alertname",
        label: "Alert Name",
        width: "15%",
        render: (value) => <span className="text-sm font-bold">{value}</span>,
      },
      {
        key: "solution" as keyof SelfHealingAction,
        label: "Solution",
        width: "15%",
        render: (_value, item) => {
          const actionInfo = getActionInfo(
            item.entry.labels as Record<string, string | undefined>
          );
          return (
            <div className="font-medium text-gray-900">
              {actionInfo.icon} {actionInfo.name}
            </div>
          );
        },
      },
      {
        key: "processing_result",
        label: "Self-healing Result",
        width: "10%",
        render: (_value, item) => {
          let statusClass = "bg-red-100 text-red-800";
          let statusText = "Processing";
          let StatusIcon = AlertTriangle;

          const pr = item.processing_result;
          if (pr.success === true) {
            statusClass = "bg-green-100 text-green-800";
            statusText = "Processed";
            StatusIcon = CheckCircle;
          } else if (pr.success === false) {
            statusClass = "bg-red-100 text-red-800";
            statusText = "Failed";
            StatusIcon = XCircle;
          }

          return (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusText}
            </span>
          );
        },
      },
      {
        key: "processed_at",
        label: "Processed Time",
        width: "15%",
        render: (value) => {
          const date = new Date(value).toLocaleString();
          return <span className="text-sm text-gray-600">{date}</span>;
        },
      },
      {
        key: "resolved_at",
        label: "Resolved",
        width: "15%",
        render: (value) => {
          if (value) {
            const date = new Date(value).toLocaleString();
            return (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{date}</span>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-500">Not resolved</span>
            </div>
          );
        },
      },
      {
        key: "actions" as keyof SelfHealingAction,
        label: "Actions",
        width: "10%",
        render: (_value, item) => (
          <TableRowButton onClick={() => handleOpenDetailModal(item)}>
            More Detail
          </TableRowButton>
        ),
      },
    ],
    [page, pageSize]
  );

  // Handlers
  const handleOpenDetailModal = (item: SelfHealingAction) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleToggleAutomation = () => {
    if (isToggling || statusData?.status === "BUSY") {
      return;
    }

    const currentStatus = statusData?.status;
    const newStatus = currentStatus === "ENABLED" ? "DISABLED" : "ENABLED";
    const action = newStatus === "ENABLED" ? "TURN OFF" : "TURN ON";
    const message = `Do you want to ${action} the self-healing mechanism?`;

    if (window.confirm(message)) {
      toggleAutomation(newStatus);
    }
  };

  // Get unique alert names for the dropdown
  // const alertNameOptions = useMemo(() => {
  //   if (!data?.data) return [];
  //   const names = new Set<string>();
  //   data.data.forEach((item) => {
  //     if (item.entry.labels.alertname) {
  //       names.add(item.entry.labels.alertname);
  //     }
  //   });
  //   return Array.from(names)
  //     .sort()
  //     .map((name) => ({ value: name, label: name }));
  // }, [data?.data]);

  const alertNameOptions = alertnames.map((a) => ({
    value: a.alertname,
    label: a.alertname,
  }));

  // Result options for the dropdown
  const processingResultOptions = [
    { value: "true", label: "Processed" },
    { value: "false", label: "Failed" },
  ];

  // Result options for the dropdown
  const resolvedResultOptions = [
    { value: "not-null", label: "Resolved" },
    { value: "null", label: "Not Resolved" },
  ];

  // Check if any filter is active
  const hasActiveFilters =
    appliedDateRange !== null ||
    appliedAlertName !== "" ||
    appliedProcessingResult !== "" ||
    appliedResolvedResult !== "";

  const handleApplyFilters = () => {
    setAppliedDateRange(tempDateRange);
    setAppliedAlertName(tempAlertName);
    setAppliedProcessingResult(tempProcessingResult);
    setAppliedResolvedResult(tempResolvedResult);
    setPage(1);
  };

  const handleClearFilters = () => {
    // Clear both temp and applied filters
    setTempDateRange(null);
    setTempAlertName("");
    setTempProcessingResult("");
    setTempResolvedResult("");
    setAppliedDateRange(null);
    setAppliedAlertName("");
    setAppliedProcessingResult("");
    setAppliedResolvedResult("");
    setPage(1);
  };

  // Status UI
  const getStatusUI = () => {
    const status = statusData?.status || "DISABLED";

    switch (status) {
      case "ENABLED":
        return {
          color: "bg-green-500",
          text: "TURN ON",
          toggleClass: "bg-green-500",
          disabled: false,
        };
      case "DISABLED":
        return {
          color: "bg-red-500",
          text: "TURN OFF",
          toggleClass: "bg-gray-300",
          disabled: false,
        };
      case "BUSY":
        return {
          color: "bg-red-500",
          text: "BUSY",
          toggleClass: "bg-green-500",
          disabled: true,
        };
      default:
        return {
          color: "bg-gray-400",
          text: "UNKNOWN",
          toggleClass: "bg-gray-300",
          disabled: true,
        };
    }
  };

  const statusUI = getStatusUI();

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchAlertnames()]);
  };

  return (
    <PageLayout
      title="Self-Healing"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
      showExternalLinks={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Table */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Issue Log</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleApplyFilters}
                className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Inline Filters */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <DateRangePicker
                  value={
                    tempDateRange ? tempDateRange : { start: null, end: null }
                  }
                  onChange={(value) => {
                    setTempDateRange(value);
                  }}
                  placeholder="Select date range"
                />
              </div>

              {/* Alert Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Name
                </label>
                <SelectSearchInput
                  fieldName="alertName"
                  value={tempAlertName}
                  onChange={(value) => {
                    setTempAlertName(value);
                  }}
                  options={alertNameOptions}
                  placeholder=""
                  error=""
                  onFocus={() => {}}
                  havingDefaultOptions={true}
                />
              </div>

              {/* Processing Result Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process Result
                </label>
                <SelectSearchInput
                  fieldName="process-result"
                  value={tempProcessingResult}
                  onChange={(value) => {
                    setTempProcessingResult(value);
                  }}
                  options={processingResultOptions}
                  placeholder=""
                  error=""
                  onFocus={() => {}}
                  havingDefaultOptions={true}
                />
              </div>

              {/* Resolved Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolved Result
                </label>
                <SelectSearchInput
                  fieldName="resolved-result"
                  value={tempResolvedResult}
                  onChange={(value) => {
                    setTempResolvedResult(value);
                  }}
                  options={resolvedResultOptions}
                  placeholder=""
                  error=""
                  onFocus={() => {}}
                  havingDefaultOptions={true}
                />
              </div>
            </div>
          </div>

          <Table<SelfHealingAction>
            data={data?.data || []}
            columns={columns}
            isLoading={isLoading}
            pageSize={pageSize}
            useServerSide={true}
            onPageChange={setPage}
            onRefresh={refetch}
            currentPage={page}
            totalCount={data?.pagination?.total}
            totalPages={data?.pagination?.totalPages}
            hasNextPage={data?.pagination?.hasNextPage}
            hasPrevPage={data?.pagination?.hasPrevPage}
            showRefreshButton={false}
            showFilterButton={false}
          />
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Control Panel
          </h2>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Self-healing Mechanism
            </h3>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">ON/OFF</span>
              <button
                onClick={handleToggleAutomation}
                disabled={statusUI.disabled || isToggling}
                className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${statusUI.toggleClass}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    statusData?.status === "ENABLED" ||
                    statusData?.status === "BUSY"
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${statusUI.color}`} />
              <span className="text-gray-700 font-medium">{statusUI.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          title="Issue Detail"
          size="xl"
        >
          <div className="space-y-6">
            {/* Grid Layout - Left column with cards, Right column with timeline */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Left Column - Alert Header, Instance, and Solution Card */}
              <div className="space-y-4">
                {/* Alert Header */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <AlertCircle className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500">
                        Alert Name
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {selectedItem.alertname}
                      </div>
                      <div className="mt-2">
                        {selectedItem.processing_result.success ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4" />
                            Processed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <XCircle className="w-4 h-4" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instance Info */}
                {selectedItem.entry.labels?.instance && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Instance
                    </div>
                    <div className="text-sm text-gray-900 font-mono break-all bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedItem.entry.labels.instance}
                    </div>
                  </div>
                )}

                {/* Solution Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getActionInfo(selectedItem.entry.labels).icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Solution
                      </div>
                      <div className="text-base font-semibold text-gray-900">
                        {getActionInfo(selectedItem.entry.labels).name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Timeline (matches left column height) */}
              <div className="h-full">
                <div className="bg-white border border-gray-200 rounded-xl p-5 h-full flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-cyan-500 rounded"></div>
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium">
                          Start Time
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedItem.starts_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium">
                          Record Time
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedItem.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium">
                          Processed Time
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(selectedItem.processed_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          selectedItem.resolved_at
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium">
                          Resolved Status
                        </div>
                        {selectedItem.resolved_at ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {new Date(
                              selectedItem.resolved_at
                            ).toLocaleString()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <X className="w-4 h-4 text-red-600" />
                            Not resolved yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedItem.entry.annotations?.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Description
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {selectedItem.entry.annotations.description}
                </div>
              </div>
            )}

            {/* Processing Result */}
            {selectedItem.processing_result?.message && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Processing Result
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {selectedItem.processing_result.message}
                </div>
              </div>
            )}

            {/* Error */}
            {selectedItem.processing_result?.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Error Details
                </h3>
                <div className="text-sm text-red-800 leading-relaxed font-mono bg-red-100 px-3 py-2 rounded-lg border border-red-200">
                  {selectedItem.processing_result.error}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}
