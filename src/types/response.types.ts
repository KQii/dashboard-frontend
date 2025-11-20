import { User } from "./user.types";

export interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateAccountResponse {
  status: string;
  message?: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}
