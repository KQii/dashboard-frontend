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
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
