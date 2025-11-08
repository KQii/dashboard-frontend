import { useQuery } from "@tanstack/react-query";
import { fetchSilences } from "../../services/api";
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
