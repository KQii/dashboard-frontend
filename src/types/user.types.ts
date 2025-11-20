export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  roleId: string;
  role: Role;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  users: User[];
}

export type RoleName = "admin" | "operator";
