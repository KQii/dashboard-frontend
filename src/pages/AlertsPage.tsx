import { useState, useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { AlertCircle, Bell, CheckCircle2 } from "lucide-react";
import { PageLayout } from "../components/PageLayout";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Tooltip } from "../components/Tooltip";
import { AlertRule, AlertChannel, AlertHistory, TableColumn } from "../types";
import { formatDistanceToNow } from "date-fns";
import { fetchAlertChannels, fetchAlertHistory } from "../services/mockApi";
import { useAlertRules } from "../features/alerts/useAlerts";

export function AlertsPage() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [alertChannels, setAlertChannels] = useState<AlertChannel[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true); // Reserved for future channel loading UI
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showRuleDetailModal, setShowRuleDetailModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);

  // Use React Query for alert rules
  const {
    alertRules = [],
    isLoadingAlertRules: isLoadingRules,
    refetchAlertRules,
    alertRulesUpdatedAt,
  } = useAlertRules();

  const isFetching = useIsFetching();
  const isRefreshing = isFetching > 0;

  useEffect(() => {
    loadAlertChannels();
    loadAlertHistory();
  }, []);

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
    await Promise.all([refetchAlertRules()]);
  };

  const loadAlertChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const data = await fetchAlertChannels();
      setAlertChannels(data as AlertChannel[]);
    } catch (error) {
      console.error("Error loading alert channels:", error);
    } finally {
      setIsLoadingChannels(false);
    }
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

  const rulesColumns: TableColumn<AlertRule>[] = [
    {
      key: "name",
      label: "Alert Name",
      width: "20%",
      sortable: true,
      render: (value) => <span className="text-sm font-bold">{value}</span>,
    },
    {
      key: "query",
      label: "Condition",
      width: "35%",
      render: (value) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: "severity",
      label: "Severity",
      width: "5%",
      sortable: true,
      render: (severity: "critical" | "warning" | "info") => {
        const colors: Record<string, string> = {
          critical: "bg-red-100 text-red-800",
          warning: "bg-orange-100 text-orange-800",
          info: "bg-blue-100 text-blue-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[severity]}`}
          >
            {severity.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "state",
      label: "Status",
      width: "5%",
      render: (state: "firing" | "pending" | "inactive") => {
        const colors: Record<string, string> = {
          firing: "bg-red-100 text-red-800",
          pending: "bg-orange-100 text-orange-800",
          inactive: "bg-green-100 text-green-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[state]}`}
          >
            {state.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "lastEvaluation",
      label: "Last Evaluation",
      width: "15%",
      render: (value) => (
        <Tooltip content={new Date(value).toLocaleString()}>
          <span className="cursor-help">
            {formatDistanceToNow(new Date(value), { addSuffix: true })}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "id",
      label: "Actions",
      width: "10%",
      render: (_, rule) => (
        <button
          onClick={() => {
            setSelectedRule(rule);
            setShowRuleDetailModal(true);
          }}
          className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors"
        >
          More Detail
        </button>
      ),
    },
  ];

  const historyColumns: TableColumn<AlertHistory>[] = [
    {
      key: "message",
      label: "Message",
      width: "35%",
      sortable: true,
    },
    {
      key: "severity",
      label: "Severity",
      width: "15%",
      sortable: true,
      render: (severity: "critical" | "warning" | "info") => {
        const colors: Record<string, string> = {
          critical: "bg-red-100 text-red-800",
          warning: "bg-orange-100 text-orange-800",
          info: "bg-blue-100 text-blue-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${colors[severity]}`}
          >
            {severity.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "triggered_at",
      label: "Triggered",
      width: "20%",
      render: (value) => (
        <Tooltip content={new Date(value).toLocaleString()}>
          <span className="cursor-help">
            {formatDistanceToNow(new Date(value), { addSuffix: true })}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "resolved_at",
      label: "Status",
      width: "15%",
      render: (resolved) => (
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            resolved
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {resolved ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {resolved ? "Resolved" : "Firing"}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      title="Alert Management"
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      countdown={countdown}
      showExternalLinks={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Rules</p>
              <p className="text-3xl font-bold text-gray-900">
                {alertRules.filter((r) => r.state === "firing").length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-orange-600 opacity-20" />
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
            <Bell className="w-12 h-12 text-cyan-600 opacity-20" />
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
          pageSize={5}
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
        size="lg"
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
              <code className="block text-xs bg-gray-100 px-3 py-2 rounded whitespace-pre-wrap break-all">
                {selectedRule.query}
              </code>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Evaluation
              </label>
              <p className="text-sm text-gray-900">
                {new Date(selectedRule.lastEvaluation).toLocaleString()}
                <span className="text-gray-500 ml-2">
                  (
                  {formatDistanceToNow(new Date(selectedRule.lastEvaluation), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </p>
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
    </PageLayout>
  );
}
