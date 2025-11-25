import Cookies from "js-cookie";
import { AuthTokens, AuthUser } from "../types/auth.types";
import { AppDispatch } from "../store";
import { setLogged, setUser } from "../slices/authSlice";

const TOKEN_KEY = "auth_tokens";
const USER_KEY = "user_info";

const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;
const clientId = import.meta.env.VITE_ADMIN_SERVICE_CLIENT_ID;

export const authService = {
  login: (redirectUri: string) => {
    const authUrl = `${adminServiceUrl}/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid profile email`;

    window.location.href = authUrl;
  },

  handleCallback: async (
    code: string,
    redirectUri: string,
    dispatch: AppDispatch
  ): Promise<AuthUser> => {
    const tokenResponse = await fetch(`${adminServiceUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code for tokens");
    }

    const tokens: AuthTokens = await tokenResponse.json();
    authService.setTokens(tokens);

    const userInfoResponse = await fetch(`${adminServiceUrl}/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user: AuthUser = await userInfoResponse.json();
    console.log(user);
    dispatch(setLogged(true));
    dispatch(setUser(user));
    authService.setUser(user);

    return user;
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Redirect to login page instead of admin service logout
    window.location.href = "/login";
  },

  setTokens: (tokens: AuthTokens) => {
    Cookies.set(TOKEN_KEY, JSON.stringify(tokens), {
      expires: tokens.expires_in / (24 * 60 * 60),
      secure: window.location.protocol === "https:",
      sameSite: "strict",
    });
  },

  getTokens: (): AuthTokens | null => {
    const tokensStr = Cookies.get(TOKEN_KEY);
    if (!tokensStr) return null;

    try {
      return JSON.parse(tokensStr);
    } catch {
      return null;
    }
  },

  setUser: (user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getTokens() !== null && authService.getUser() !== null;
  },

  getAccessToken: (): string | null => {
    const tokens = authService.getTokens();
    return tokens?.access_token || null;
  },
};
