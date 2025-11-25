import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchRecommendations,
  triggerAnalysis,
} from "../../services/apiRecommendations";

export const useRecommendations = () => {
  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    refetch: refetchRecommendations,
    dataUpdatedAt: recommendsUpdatedAt,
  } = useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    recommendations,
    isLoadingRecommendations,
    refetchRecommendations,
    recommendsUpdatedAt,
  };
};

export const useCreateRecommendation = () => {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createRecommendation } = useMutation({
    mutationFn: triggerAnalysis,
    onSuccess: (data) => {
      toast.success(`${data.message}`);
      // Invalidate silences and active alerts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error) => {
      toast.error(`Failed to trigger analysis: ${error.message}`);
      console.error("Failed to trigger analysis:", error);
    },
  });

  return { isCreating, createRecommendation };
};
