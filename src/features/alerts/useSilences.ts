import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createSilence, fetchSilences } from "../../services/api";
import { Params } from "../../types";

export const useSilences = (params?: Params) => {
  const {
    data,
    isLoading: isLoadingSilences,
    refetch: refetchSilences,
    dataUpdatedAt: silencesUpdatedAt,
  } = useQuery({
    queryKey: [
      "silences",
      params?.filters,
      params?.sort,
      params?.page,
      params?.limit,
    ],
    queryFn: () =>
      fetchSilences(params?.filters, params?.sort, params?.page, params?.limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    silences: data?.data || [],
    pagination: data?.pagination,
    isLoadingSilences,
    refetchSilences,
    silencesUpdatedAt,
  };
};

export const useCreateSilence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSilence,
    onSuccess: () => {
      toast.success("New silence successfully created");
      // Invalidate all silences queries to refetch
      queryClient.invalidateQueries({ queryKey: ["silences"] });
    },
    onError: (error) => {
      toast.error(`Failed to create silence: ${error.message}`);
      console.error("Failed to create silence:", error);
    },
  });
};
