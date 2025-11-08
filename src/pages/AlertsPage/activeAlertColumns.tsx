import { TableColumn, ActiveAlert, ActiveAlertStatus } from "../../types";
import { Tooltip } from "../../components/common/Tooltip";
import { formatDistanceToNow } from "date-fns";
import { getSeverityColor, getActiveAlertStatusColor } from "./utils";

export const createActiveAlertColumns = (
  onMoreDetail: (alert: ActiveAlert) => void
): TableColumn<ActiveAlert>[] => [
  {
    key: "id",
    label: "#",
    width: "3%",
    render: (_, __, index) => (
      <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>
    ),
  },
  {
    key: "name",
    label: "Alert Name",
    width: "15%",
    sortable: true,
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "annotations",
    label: "Summary",
    width: "25%",
    render: (value) => <span>{value.summary}</span>,
  },
  {
    key: "severity",
    label: "Severity",
    width: "5%",
    sortable: true,
    render: (severity: "critical" | "warning" | "info") => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
          severity
        )}`}
      >
        {severity.toUpperCase()}
      </span>
    ),
  },
  {
    key: "startsAt",
    label: "Triggered",
    width: "10%",
    render: (value) => (
      <Tooltip content={new Date(value).toLocaleString()}>
        <span className="cursor-help">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </Tooltip>
    ),
  },
  {
    key: "updatedAt",
    label: "Last Update",
    width: "10%",
    render: (value) => (
      <Tooltip content={new Date(value).toLocaleString()}>
        <span className="cursor-help">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </Tooltip>
    ),
  },
  {
    key: "endsAt",
    label: "Expected End Time",
    width: "10%",
    render: (value) => (
      <Tooltip content={new Date(value).toLocaleString()}>
        <span className="cursor-help">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </Tooltip>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: "5%",
    sortable: true,
    render: (status: ActiveAlertStatus) => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${getActiveAlertStatusColor(
          status.state
        )}`}
      >
        {status.state.toUpperCase()}
      </span>
    ),
  },
  {
    key: "id",
    label: "Actions",
    width: "20%",
    align: "center",
    render: (_, alert) => (
      <div className="flex justify-center">
        <button
          onClick={() => onMoreDetail(alert)}
          className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors"
        >
          More Detail
        </button>
      </div>
    ),
  },
];
