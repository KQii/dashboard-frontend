import { ApiResponse } from "../types/response.types";
import { User } from "../types/user.types";

// const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;

export async function fetchUsers(
  filters?: Record<string, string | string[]>,
  sort?: { column: string; direction: "asc" | "desc" }[],
  page?: number,
  limit?: number
): Promise<ApiResponse<User>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Check if this is a time range filter (values start with gte: or lte:)
          const isTimeRangeFilter = value.some(
            (item) =>
              typeof item === "string" &&
              (item.startsWith("gte:") || item.startsWith("lte:"))
          );

          if (isTimeRangeFilter) {
            // For time range filters, append each item separately with the same key
            // This supports formats like: startsAt=gte:xxx&startsAt=lte:xxx
            value.forEach((item) => {
              if (item) {
                params.append(key, item);
              }
            });
          } else {
            // For checkbox filters (multiple values), join with comma
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          }
        } else if (value) {
          // For text/radio filters (single value)
          params.append(key, value);
        }
      });
    }

    // Add sort parameter (format: sort=-column1,column2,-column3)
    // Prefix with - for descending, no prefix for ascending
    if (sort && sort.length > 0) {
      const sortValue = sort
        .map((s) => (s.direction === "desc" ? `-${s.column}` : s.column))
        .join(",");
      params.append("sort", sortValue);
    }

    // const url = `${adminServiceUrl}/api/v1/users${
    //   params.toString() ? `?${params.toString()}` : ""
    // }`;
    const url = `/api/admin/users${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return {
      data: result.data,
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function updateUserFullname(
  userId: string,
  fullName: string
): Promise<User> {
  try {
    // const url = `${adminServiceUrl}/api/v1/users/${userId}/full-name`;
    const url = `/api/admin/users/${userId}/full-name`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<User> {
  try {
    // const url = `${adminServiceUrl}/api/v1/users/${userId}/status`;
    const url = `/api/admin/users/${userId}/status`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_active: isActive,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
}

export async function updateUserRole(
  userId: string,
  roleId: string
): Promise<User> {
  try {
    // const url = `${adminServiceUrl}/api/v1/users/${userId}/role`;
    const url = `/api/admin/users/${userId}/role`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId: roleId,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // const url = `${adminServiceUrl}/api/v1/users/${userId}`;
    const url = `/api/admin/users/${userId}`;

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return true;
    }

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
