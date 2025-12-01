import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchChannels,
  selectChannel as selectChannelApi,
} from "../../services/apiChannels";

export const useChannels = () => {
  const {
    data: channels = [],
    isLoading: isLoadingChannels,
    refetch: refetchChannels,
    dataUpdatedAt: channelsUpdatedAt,
  } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannels,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    channels,
    isLoadingChannels,
    refetchChannels,
    channelsUpdatedAt,
  };
};

export const useSelectChannel = () => {
  const queryClient = useQueryClient();

  const { isPending: isSelecting, mutate: selectChannel } = useMutation({
    mutationFn: selectChannelApi,
    onSuccess: (data) => {
      const selectedChannels = data
        .filter((c) => c.isActive)
        .map((s) => s.type);

      if (selectedChannels.length === 0) {
        toast(
          "Alerts will not be delivered because no notification channel is subscribed."
        );
      } else {
        toast.success(
          `Subscribe successfully to ${selectedChannels.join(", ")}`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (error) => {
      toast.error(`Failed to select channel: ${error.message}`);
      console.error("Failed to select channel:", error);
    },
  });

  return { isSelecting, selectChannel };
};
