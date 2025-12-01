export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  role: "admin" | "operator";
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
