import { User } from "lucide-react";
import { TableColumn, Silence } from "../../types";
import { Tooltip } from "../../components/common/Tooltip";
import { formatDistanceToNow } from "date-fns";
import { getSilenceStatusColor } from "./utils";

export const createSilencesColumns = (
  onMoreDetail: (silence: Silence) => void
): TableColumn<Silence>[] => [
  {
    key: "rowNumber" as keyof Silence,
    label: "#",
    width: "3%",
    render: (_, __, index) => (
      <span className="text-sm text-gray-600">{(index ?? 0) + 1}</span>
    ),
  },
  {
    key: "id",
    label: "Silence ID",
    width: "15%",
    sortable: true,
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "createdBy",
    label: "Created By",
    width: "15%",
    render: (value) => (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
          <User className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    ),
  },
  {
    key: "startsAt",
    label: "Starts At",
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
    label: "Ends At",
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
    render: (status) => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${getSilenceStatusColor(
          status.state
        )}`}
      >
        {status.state.toUpperCase()}
      </span>
    ),
  },
  {
    key: "actions" as keyof Silence,
    label: "Actions",
    width: "20%",
    align: "center",
    render: (_, silence) => (
      <div className="flex justify-center">
        <button
          onClick={() => onMoreDetail(silence)}
          className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors"
        >
          More Detail
        </button>
      </div>
    ),
  },
];
