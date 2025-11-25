import { AlertTriangle, CheckCircle, XCircle, X } from "lucide-react";
import { TableRowButton } from "../../components/common/TableRowButton";
import { TableColumn } from "../../types";
import { AlertHistory } from "../../services/apiSelfHealing";

// Action mapping
const ACTION_MAP: Record<string, { name: string; icon: string }> = {
  system_test: { name: "System Test", icon: "🔍" },
  restart_node: { name: "Restart Node", icon: "🔄" },
  cleanup_disk: { name: "Disk Cleanup", icon: "🧹" },
  optimize_indexing: { name: "Optimize Index", icon: "⚡" },
  clear_caches: { name: "Delete Cache", icon: "🗑️" },
};

export const getActionInfo = (labels: Record<string, string | undefined>) => {
  const action = labels?.action || labels?.alertname || "unknown";
  const actionLower = action.toLowerCase();

  for (const [key, value] of Object.entries(ACTION_MAP)) {
    if (actionLower === key || actionLower.includes(key)) {
      return { ...value, original: action };
    }
  }

  return { name: action, icon: "📌", original: action };
};

export const createAlertHistoriesColumns = (
  onMoreDetail: (history: AlertHistory) => void,
  page: number,
  pageSize: number
): TableColumn<AlertHistory>[] => [
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
    key: "solution" as keyof AlertHistory,
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
    key: "actions" as keyof AlertHistory,
    label: "Actions",
    width: "10%",
    render: (_value, item) => (
      <TableRowButton onClick={() => onMoreDetail(item)}>
        More Detail
      </TableRowButton>
    ),
  },
];
