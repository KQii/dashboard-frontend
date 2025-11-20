import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createUser as createUserApi,
  updatePassword as updatePasswordApi,
} from "../../services/apiAuth";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createUser } = useMutation({
    mutationFn: createUserApi,
    onSuccess: (data) => {
      toast.success(`${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(`${error.message}`);
      console.error("Failed to create silence:", error);
    },
  });

  return { isCreating, createUser };
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation(
    {
      mutationFn: ({
        passwordCurrent,
        password,
      }: {
        passwordCurrent: string;
        password: string;
      }) => updatePasswordApi(passwordCurrent, password),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(`Change password successfully!`);
      },
      onError: (error: Error) => {
        toast.error(`Failed to change password: ${error.message}`);
      },
    }
  );

  return { updatePassword, isUpdatingPassword };
};
