import { CreateAccountResponse } from "../types/response.types";
import { User } from "../types/user.types";

const adminServiceUrl = import.meta.env.VITE_ADMIN_SERVICE_URL;

interface CreateUserDto {
  email: string;
  username: string;
}

interface AuthenticatedResponse {
  user: string;
  email: string;
  preferredUsername: string;
  groups: string[];
}

export async function whoami(): Promise<AuthenticatedResponse> {
  try {
    const response = await fetch("/auth/authenticated-user", {
      method: "GET",
      credentials: "include",
    });

    const contentType = response.headers.get("content-type");
    if (
      response.status === 401 ||
      (contentType && contentType.includes("text/html"))
    ) {
      console.warn("Session expired. Reloading to redirect to login...");
      window.location.reload();
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    throw error;
  }
}

export async function createUser(
  userData: CreateUserDto
): Promise<CreateAccountResponse> {
  try {
    const response = await fetch(`${adminServiceUrl}/auth/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating silence:", error);
    throw error;
  }
}

export async function getUserBySetupToken(token: string): Promise<User> {
  try {
    const url = `${adminServiceUrl}/auth/setup-user/${token}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data.user;
  } catch (error) {
    console.error("Error fetching user by setup token:", error);
    throw error;
  }
}

export async function updatePassword(
  passwordCurrent: string,
  password: string
): Promise<CreateAccountResponse> {
  try {
    const response = await fetch(`${adminServiceUrl}/auth/update-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passwordCurrent, password }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating silence:", error);
    throw error;
  }
}

export async function setupPassword(
  token: string,
  email: string,
  password: string,
  passwordConfirm: string
): Promise<CreateAccountResponse> {
  try {
    const response = await fetch(
      `${adminServiceUrl}/auth/setup-user/${token}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, passwordConfirm }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(
        errorBody.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating silence:", error);
    throw error;
  }
}
