import { RoleName } from "../types/user.types";

export const hasPermission = (role: RoleName) => role === "admin";
