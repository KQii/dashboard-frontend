import { PropsWithChildren, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { AuthState, setLogged, setUser } from "../../slices/authSlice";
import { RootState } from "../../store";
import { RoleName } from "../../types/user.types";

interface AuthProtectorProps extends PropsWithChildren {
  redirect: string;
  allowedRoles?: RoleName[];
}

export default function AuthProtector({
  children,
  redirect,
  allowedRoles,
}: AuthProtectorProps) {
  const accessToken =
    Cookies.get("access_token") || localStorage.getItem("access_token");
  const auth = useSelector((state: RootState) => state.auth as AuthState);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    Cookies.set("redirect_path", location.pathname, { path: "/" });

    if (accessToken) {
      Cookies.remove("redirect_path", { path: "/" });
    }
  }, [location]);

  const redirectFn = () => {
    dispatch(setLogged(false));
    dispatch(setUser(null as any));
    return <Navigate to={redirect} replace />;
  };

  if (!auth.isLogged) {
    return redirectFn();
  } else {
    const isAllowed = allowedRoles?.includes(auth.user?.role!);
    if (isAllowed) {
      return <>{children}</>;
    } else {
      toast.error("Bạn không có quyền truy cập trang này");
      return redirectFn();
    }
  }
}
