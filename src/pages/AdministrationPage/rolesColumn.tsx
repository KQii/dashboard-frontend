import { RoleBadge } from "../../components/ui/RoleBadge";
import { TableColumn } from "../../types";
import { Role } from "../../types/user.types";

export const createRolesColumns = (
  page: number,
  pageSize: number
): TableColumn<Role>[] => [
  {
    key: "rowNumber" as keyof Role,
    label: "#",
    width: "10%",
    render: (_, __, index) => {
      const rowNumber = (page - 1) * pageSize + (index ?? 0) + 1;
      return <span className="text-sm text-gray-600">{rowNumber}</span>;
    },
  },
  {
    key: "id",
    label: "Role ID",
    width: "30%",
    render: (value) => <span className="text-sm font-bold">{value}</span>,
  },
  {
    key: "name",
    label: "Role Name",
    width: "20%",
    render: (value) => <RoleBadge role={value} />,
  },
  {
    key: "description",
    label: "Description",
    width: "30%",
    render: (value) => <span>{value}</span>,
  },
  {
    key: "users",
    label: "User Count",
    width: "10%",
    render: (value) => <span>{value.length}</span>,
  },
];
