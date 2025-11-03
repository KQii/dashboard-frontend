import { useQuery } from "@tanstack/react-query";
import { fetchAlertRules } from "../../services/api";

export const useAlertRules = () => {
  const {
    data: alertRules,
    isLoading: isLoadingAlertRules,
    refetch: refetchAlertRules,
    dataUpdatedAt: alertRulesUpdatedAt,
  } = useQuery({
    queryKey: ["alertRules"],
    queryFn: fetchAlertRules,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    alertRules,
    isLoadingAlertRules,
    refetchAlertRules,
    alertRulesUpdatedAt,
  };
};
