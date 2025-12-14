import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useDispatch } from "react-redux";
import { AuthUser } from "../types/auth.types";
import { whoami } from "../services/apiAuth";
import { setUser as setReduxUser, setLogged } from "../slices/authSlice";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const publicPaths = ["/setup-password"];

    if (publicPaths.some((path) => currentPath.startsWith(path))) {
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const userInfo = await whoami();

        // Map groups array to role type
        const roleName: "admin" | "operator" = userInfo.groups.includes("admin")
          ? "admin"
          : "operator";

        const authUser: AuthUser = {
          sub: userInfo.user,
          name: userInfo.preferredUsername,
          email: userInfo.email,
          preferred_username: userInfo.preferredUsername,
          email_verified: true,
          role: roleName,
        };

        // For local dev
        // const authUser: AuthUser = {
        //   sub: "xxxx-xxxx-xxxx",
        //   name: "test_username",
        //   email: "test_email",
        //   preferred_username: "test_username",
        //   email_verified: true,
        //   role: "admin",
        // };

        setUser(authUser);
        dispatch(setReduxUser(authUser));
        dispatch(setLogged(true));
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setUser(null);
        dispatch(setLogged(false));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [dispatch]);

  const logout = () => {
    window.location.href = "/logout";
  };

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
