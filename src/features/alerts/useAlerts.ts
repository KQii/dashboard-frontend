import { useQuery } from "@tanstack/react-query";
import { fetchAlertRules } from "../../services/api";
import { TableSort } from "../../types";

interface UseAlertRulesParams {
  filters?: Record<string, string | string[]>;
  sort?: TableSort[];
  page?: number;
  limit?: number;
}

export const useAlertRules = (params?: UseAlertRulesParams) => {
  const {
    data,
    isLoading: isLoadingAlertRules,
    refetch: refetchAlertRules,
    dataUpdatedAt: alertRulesUpdatedAt,
  } = useQuery({
    queryKey: [
      "alertRules",
      params?.filters,
      params?.sort,
      params?.page,
      params?.limit,
    ],
    queryFn: () =>
      fetchAlertRules(
        params?.filters,
        params?.sort,
        params?.page,
        params?.limit
      ),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    alertRules: data?.data || [],
    pagination: data?.pagination,
    isLoadingAlertRules,
    refetchAlertRules,
    alertRulesUpdatedAt,
  };
};
