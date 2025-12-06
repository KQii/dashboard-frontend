import { FilterConfig } from "../../components/container/Table";

/**
 * Transform date range values to query parameters
 * Converts start/end dates to ISO strings with gte/lte operators
 */
const createDateRangeTransform = (field: string) => {
  return (value: {
    start: Date | null;
    end: Date | null;
  }): Record<string, string | string[]> => {
    if (!value.start) return {};

    // Set start time to beginning of day (00:00:00.000)
    const start = new Date(value.start);
    start.setHours(0, 0, 0, 0);

    // Set end time to end of day (23:59:59.999)
    // If no end date or same date selected, use the same date as end
    const end = new Date(value.end || value.start);
    end.setHours(23, 59, 59, 999);

    // Always return an array with both gte and lte for consistent API format
    return {
      [field]: [`gte:${start.toISOString()}`, `lte:${end.toISOString()}`],
    };
  };
};

export const createUsersFilterConfig = (
  roles: { id: string; name: string }[]
): FilterConfig[] => [
  {
    type: "text",
    label: "User ID",
    field: "id",
    placeholder: "Search by user ID...",
  },
  {
    type: "text",
    label: "Email",
    field: "email",
    placeholder: "Search by email...",
  },
  {
    type: "text",
    label: "Username",
    field: "username",
    placeholder: "Search by username...",
  },
  {
    type: "radio",
    label: "Status",
    field: "is_active",
    selectOptions: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    type: "radio",
    label: "Verification",
    field: "is_verified",
    selectOptions: [
      { value: "true", label: "Verified" },
      { value: "false", label: "Not Verified" },
    ],
  },
  {
    type: "daterange",
    label: "Created Date",
    field: "created_at",
    placeholder: "Select date range",
    transformValue: createDateRangeTransform("created_at"),
  },
  {
    type: "combobox",
    label: "Role",
    field: "role.name",
    placeholder: "Search role...",
    options: roles.map(
      (role) => role.name.charAt(0).toUpperCase() + role.name.slice(1)
    ),
  },
];
