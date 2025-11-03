import Cookies from "js-cookie";
import { AuthTokens, User } from "../types";

const TOKEN_KEY = "auth_tokens";
const USER_KEY = "user_info";

export const authService = {
  login: (redirectUri: string) => {
    const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;
    const clientId = import.meta.env.VITE_ADMIN_SERVICE_CLIENT_ID;

    const authUrl = `${adminServiceUrl}/api/v1/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid profile email`;

    window.location.href = authUrl;
  },

  handleCallback: async (code: string, redirectUri: string): Promise<User> => {
    const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;
    const clientId = import.meta.env.VITE_ADMIN_SERVICE_CLIENT_ID;

    const tokenResponse = await fetch(
      `${adminServiceUrl}/api/v1/oauth2/token`,
      {
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
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code for tokens");
    }

    const tokens: AuthTokens = await tokenResponse.json();
    authService.setTokens(tokens);

    const userInfoResponse = await fetch(
      `${adminServiceUrl}/api/v1/oauth2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user: User = await userInfoResponse.json();
    console.log(user);
    authService.setUser(user);

    return user;
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;
    window.location.href = `${adminServiceUrl}/logout`;
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

  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
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
