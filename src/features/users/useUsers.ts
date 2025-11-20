import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  updateUserFullname,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../../services/apiUsers";
import { Params } from "../../types";
import toast from "react-hot-toast";

export const useUsers = (params?: Params) => {
  const {
    data,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    dataUpdatedAt: usersUpdatedAt,
  } = useQuery({
    queryKey: [
      "users",
      params?.filters,
      params?.sort,
      params?.page,
      params?.limit,
    ],
    queryFn: () =>
      fetchUsers(params?.filters, params?.sort, params?.page, params?.limit),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoadingUsers,
    refetchUsers,
    usersUpdatedAt,
  };
};

export const useUpdateUserFullname = () => {
  const queryClient = useQueryClient();

  const { mutate: updateFullname, isPending: isUpdatingFullname } = useMutation(
    {
      mutationFn: ({
        userId,
        fullName,
      }: {
        userId: string;
        fullName: string;
      }) => updateUserFullname(userId, fullName),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(`User updated successfully!`);
      },
      onError: (error: Error) => {
        toast.error(`Failed to update user full name: ${error.message}`);
      },
    }
  );

  return { updateFullname, isUpdatingFullname };
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUserStatus(userId, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `User ${data.is_active ? "enabled" : "disabled"} successfully!`
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });

  return { updateStatus, isUpdatingStatus };
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      updateUserRole(userId, roleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(`User role updated to ${data.role.name} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  return { updateRole, isUpdatingRole };
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteUserMutate, isPending: isDeletingUser } = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  return { deleteUser: deleteUserMutate, isDeletingUser };
};
