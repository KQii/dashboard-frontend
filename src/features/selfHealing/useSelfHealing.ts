import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchAlertnames,
  fetchSelfHealingHistory,
  fetchSelfHealingStatus,
  SelfHealingStatus,
  toggleSelfHealing,
} from "../../services/apiSelfHealing";

interface UseSelfHealingHistoryProps {
  filters?: Record<string, string | string[]>;
  sort?: { column: string; direction: "asc" | "desc" }[];
  page?: number;
  limit?: number;
}

export const useSelfHealingHistory = ({
  filters,
  sort,
  page,
  limit,
}: UseSelfHealingHistoryProps) => {
  return useQuery({
    queryKey: ["selfHealingHistory", filters, sort, page, limit],
    queryFn: () => fetchSelfHealingHistory(filters, sort, page, limit),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};

export const useSelfHealingStatus = () => {
  return useQuery({
    queryKey: ["selfHealingStatus"],
    queryFn: fetchSelfHealingStatus,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const useToggleSelfHealing = () => {
  const queryClient = useQueryClient();

  const { isPending: isToggling, mutate: toggleAutomation } = useMutation({
    mutationFn: toggleSelfHealing,
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["selfHealingStatus"] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<SelfHealingStatus>([
        "selfHealingStatus",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<SelfHealingStatus>(["selfHealingStatus"], {
        status: "BUSY",
      });

      // Return a context object with the snapshotted value
      return { previousStatus };
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.setQueryData<SelfHealingStatus>(["selfHealingStatus"], {
          status: data.new_status,
        });
        toast.success(
          `Self-healing automation ${
            data.new_status === "ENABLED" ? "enabled" : "disabled"
          }`
        );
      } else {
        toast.error(`Failed to toggle automation: ${data.message}`);
      }
    },
    onError: (error, _variables, context) => {
      // Rollback to previous status on error
      if (context?.previousStatus) {
        queryClient.setQueryData<SelfHealingStatus>(
          ["selfHealingStatus"],
          context.previousStatus
        );
      }
      toast.error(`Failed to toggle automation: ${error.message}`);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["selfHealingStatus"] });
    },
  });

  return { isToggling, toggleAutomation };
};

export const useAlertnames = () => {
  const { data: alertnames = [], refetch } = useQuery({
    queryKey: ["Alertnames"],
    queryFn: fetchAlertnames,
    refetchInterval: 30000, // Auto-refresh every 5 seconds
  });

  return {
    alertnames,
    refetch,
  };
};
