export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  role: {
    id: string;
    name: "admin" | "operator";
    description: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}
