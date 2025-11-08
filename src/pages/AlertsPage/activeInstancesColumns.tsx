import { TableColumn, PrometheusAlert } from "../../types";
import { Tooltip } from "../../components/common/Tooltip";
import { formatDistanceToNow } from "date-fns";
import { getAlertStateColor } from "./utils";

export const activeInstancesColumns: TableColumn<PrometheusAlert>[] = [
  {
    key: "id",
    label: "#",
    width: "3%",
    render: (_, __, index) => (
      <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>
    ),
  },
  {
    key: "labels",
    label: "Alert Name",
    width: "15%",
    sortable: true,
    render: (value) => (
      <span className="text-sm font-bold">{value.alertname}</span>
    ),
  },
  {
    key: "annotations",
    label: "Summary",
    width: "25%",
    render: (value) => <span>{value.summary}</span>,
  },
  {
    key: "state",
    label: "Status",
    width: "25%",
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
    key: "activeAt",
    label: "Active At",
    width: "25%",
    render: (value) => (
      <Tooltip content={new Date(value).toLocaleString()}>
        <span className="cursor-help">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </Tooltip>
    ),
  },
];
