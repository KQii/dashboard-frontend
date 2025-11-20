import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { setLogged, setUser } from "../slices/authSlice";
import { AuthUser } from "../types/auth.types";

const authService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (account: { username: string; password: string }) =>
      axios.post<IResponseData<LoginResponse>>("/auth/login", account),
    onError: onError,
    onSuccess: (res) => {
      const redirectPath = cookies.get("redirect_path") || "/";
      const { user, accessToken, refreshToken } = res.data.data;

      navigate(redirectPath as string);
      dispatch(setLogged(true));
      dispatch(setUser(user));
      toast.success("Login successfully");
    },
  });

  return {
    loginMutation,
  };
};

export default authService;
