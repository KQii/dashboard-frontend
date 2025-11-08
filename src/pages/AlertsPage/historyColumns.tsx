import { TableColumn, AlertHistory } from "../../types";
import { Tooltip } from "../../components/common/Tooltip";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getSeverityColor } from "./utils";

export const historyColumns: TableColumn<AlertHistory>[] = [
  {
    key: "id",
    label: "#",
    width: "3%",
    render: (_, __, index) => (
      <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>
    ),
  },
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
