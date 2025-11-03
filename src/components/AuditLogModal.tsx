import { Modal } from "./Modal";
import { AuditLog } from "../types";
import { Table } from "./Table";
import { format } from "date-fns";

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  logs: AuditLog[];
  isLoading?: boolean;
}

export function AuditLogModal({
  isOpen,
  onClose,
  userId,
  logs,
  isLoading,
}: AuditLogModalProps) {
  const filteredLogs = logs.filter((log) => log.user_id === userId);

  const columns = [
    {
      key: "action" as const,
      label: "Action",
      width: "20%",
      render: (action: string) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {action.toUpperCase()}
        </span>
      ),
    },
    {
      key: "resource_type" as const,
      label: "Resource",
      width: "20%",
    },
    {
      key: "status" as const,
      label: "Status",
      width: "15%",
      render: (status: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "created_at" as const,
      label: "Timestamp",
      width: "30%",
      render: (value: string) => format(new Date(value), "PPp"),
    },
    {
      key: "ip_address" as const,
      label: "IP Address",
      width: "15%",
      render: (ip?: string) => ip || "-",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit Log - User ${userId}`}
      size="xl"
    >
      <Table<AuditLog>
        data={filteredLogs}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        density="compact"
      />
    </Modal>
  );
}
