import { apiClient } from "../../../lib/api/api.client";
import { AUTH_ENDPOINTS } from "../constants/auth.constants";
import { meResponseToUser } from "../builders/auth.builders";
import { type MeResponse, type User } from "../types/auth.types";

export const authService = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<MeResponse>(AUTH_ENDPOINTS.ME);
    return meResponseToUser(data);
  },
};
