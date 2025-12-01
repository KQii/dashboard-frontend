import { useQuery } from "@tanstack/react-query";
import {
  fetchAlertRules,
  fetchRuleGroups,
  fetchActiveAlerts,
  fetchAlertLabels,
} from "../../services/apiAlerts";
import { Params } from "../../types";

export const useAlertRules = (params?: Params) => {
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

// Active Alerts Query
export const useActiveAlerts = (params: Params) => {
  const {
    data,
    isLoading: isLoadingAlerts,
    refetch: refetchAlerts,
    dataUpdatedAt: alertsUpdatedAt,
  } = useQuery({
    queryKey: [
      "activeAlerts",
      params?.filters,
      params?.sort,
      params?.page,
      params?.limit,
    ],
    queryFn: () =>
      fetchActiveAlerts(
        params?.filters,
        params?.sort,
        params?.page,
        params?.limit
      ),
    refetchInterval: 30000,
  });

  return {
    activeAlerts: data?.data || [],
    pagination: data?.pagination,
    isLoadingAlerts,
    refetchAlerts,
    alertsUpdatedAt,
  };
};

export const useAlertLabels = () => {
  const {
    data: labels = [],
    isLoading: isLoadingLabels,
    refetch: refetchLabels,
    dataUpdatedAt: labelsUpdatedAt,
  } = useQuery({
    queryKey: ["alert-labels"],
    queryFn: fetchAlertLabels,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    labels,
    isLoadingLabels,
    refetchLabels,
    labelsUpdatedAt,
  };
};
