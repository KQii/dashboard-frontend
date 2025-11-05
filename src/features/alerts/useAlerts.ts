import { useQuery } from "@tanstack/react-query";
import { fetchAlertRules, fetchRuleGroups } from "../../services/api";
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

export const useRuleGroups = () => {
  const {
    data: ruleGroups = [],
    isLoading: isLoadingRuleGroups,
    refetch: refetchRuleGroups,
    dataUpdatedAt: ruleGroupsUpdatedAt,
  } = useQuery({
    queryKey: ["ruleGroups"],
    queryFn: fetchRuleGroups,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    ruleGroups,
    isLoadingRuleGroups,
    refetchRuleGroups,
    ruleGroupsUpdatedAt,
  };
};
