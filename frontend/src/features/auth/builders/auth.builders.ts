import { type MeResponse, type User } from "../types/auth.types";

export function meResponseToUser(response: MeResponse): User {
  return {
    id: response.id,
    name: response.name,
    email: response.email,
  };
}
