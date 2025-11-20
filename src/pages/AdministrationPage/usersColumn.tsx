import { BadgeCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip } from "../../components/common/Tooltip";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { RoleBadge } from "../../components/ui/RoleBadge";
import { TableRowButton } from "../../components/common/TableRowButton";
import { TableColumn } from "../../types";
import { User } from "../../types/user.types";

export const createUsersColumns = (
  onMoreDetail: (user: User) => void,
  onDisable: (user: User) => void,
  onEnable: (user: User) => void,
  page: number,
  pageSize: number
): TableColumn<User>[] => [
  {
    key: "rowNumber" as keyof User,
    label: "#",
    width: "5%",
    render: (_, __, index) => {
      const rowNumber = (page - 1) * pageSize + (index ?? 0) + 1;
      return <span className="text-sm text-gray-600">{rowNumber}</span>;
    },
  },
  {
    key: "id",
    label: "User ID",
    width: "15%",
    sortable: true,
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "username",
    label: "Username",
    width: "10%",
    sortable: true,
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "email",
    label: "Email",
    width: "10%",
    sortable: true,
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "role",
    label: "Role",
    width: "10%",
    render: (value) => <RoleBadge role={value.name} />,
  },
  {
    key: "is_verified",
    label: "Verified",
    width: "10%",
    render: (value) =>
      value ? (
        <BadgeCheck className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-red-600" />
      ),
  },
  {
    key: "created_at",
    label: "Created At",
    width: "15%",
    sortable: true,
    render: (value) => (
      <Tooltip content={new Date(value).toLocaleString()}>
        <span className="cursor-help">
          {formatDistanceToNow(new Date(value), { addSuffix: true })}
        </span>
      </Tooltip>
    ),
  },
  {
    key: "is_active",
    label: "Status",
    width: "5%",
    sortable: true,
    render: (value) => <StatusBadge status={value} />,
  },

  {
    key: "actions" as keyof User,
    label: "Actions",
    width: "20%",
    align: "center",
    render: (_, user) => (
      <div className="flex justify-center gap-2">
        <TableRowButton onClick={() => onMoreDetail(user)} variant="primary">
          More Detail
        </TableRowButton>
        {user.is_active ? (
          <TableRowButton onClick={() => onDisable(user)} variant="warning">
            Disable
          </TableRowButton>
        ) : (
          <TableRowButton onClick={() => onEnable(user)} variant="success">
            Enable
          </TableRowButton>
        )}
      </div>
    ),
  },
];
