import { TableColumn, AlertRule } from "../../types";
import { Tooltip } from "../../components/common/Tooltip";
import { formatDistanceToNow } from "date-fns";
import { getSeverityColor, getAlertStateColor } from "./utils";

export const createAlertRulesColumns = (
  onMoreDetail: (rule: AlertRule) => void
): TableColumn<AlertRule>[] => [
  {
    key: "rowNumber" as keyof AlertRule,
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
    key: "groupName",
    label: "Group Name",
    width: "15%",
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
    key: "state",
    label: "Status",
    width: "5%",
    sortable: true,
    render: (state: "firing" | "pending" | "inactive") => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${getAlertStateColor(
          state
        )}`}
      >
        {state.toUpperCase()}
      </span>
    ),
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
    key: "actions" as keyof AlertRule,
    label: "Actions",
    width: "10%",
    align: "center",
    render: (_, rule) => (
      <div className="flex justify-center">
        <button
          onClick={() => onMoreDetail(rule)}
          className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors"
        >
          More Detail
        </button>
      </div>
    ),
  },
];
