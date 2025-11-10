import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createSilence as createSilenceApi,
  deleteSilence as deleteSilenceApi,
  fetchSilences,
} from "../../services/api";
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

  const { isPending: isCreating, mutate: createSilence } = useMutation({
    mutationFn: createSilenceApi,
    onSuccess: () => {
      toast.success("New silence successfully created");
      // Invalidate silences and active alerts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["silences"] });
      queryClient.invalidateQueries({ queryKey: ["activeAlerts"] });
    },
    onError: (error) => {
      toast.error(`Failed to create silence: ${error.message}`);
      console.error("Failed to create silence:", error);
    },
  });

  return { isCreating, createSilence };
};

export const useDeleteSilence = () => {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteSilence } = useMutation({
    mutationFn: deleteSilenceApi,
    onSuccess: () => {
      toast.success("Silence successfully deleted");
      // Invalidate silences and active alerts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["silences"] });
      queryClient.invalidateQueries({ queryKey: ["activeAlerts"] });
    },
    onError: (error) => {
      toast.error(`Failed to delete silence: ${error.message}`);
      console.error("Failed to delete silence:", error);
    },
  });

  return { isDeleting, deleteSilence };
};
