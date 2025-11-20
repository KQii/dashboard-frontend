import { useQuery } from "@tanstack/react-query";
import { fetchRoles } from "../../services/apiRoles";
import { Params } from "../../types";

export const useRoles = (params?: Params) => {
  const {
    data,
    isLoading: isLoadingRoles,
    refetch: refetchRoles,
    dataUpdatedAt: rolesUpdatedAt,
  } = useQuery({
    queryKey: [
      "roles",
      params?.filters,
      params?.sort,
      params?.page,
      params?.limit,
    ],
    queryFn: () =>
      fetchRoles(params?.filters, params?.sort, params?.page, params?.limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    roles: data?.data || [],
    pagination: data?.pagination,
    isLoadingRoles,
    refetchRoles,
    rolesUpdatedAt,
  };
};
