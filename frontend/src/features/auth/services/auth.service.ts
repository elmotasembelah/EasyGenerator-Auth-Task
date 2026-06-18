import { apiClient } from "../../../lib/api/api.client";
import { AUTH_ENDPOINTS } from "../constants/auth.constants";
import { meResponseToUser } from "../builders/auth.builders";
import {
  type AuthResponse,
  type LoginRequest,
  type MeResponse,
  type RegisterRequest,
  type User,
} from "../types/auth.types";

export const authService = {
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<MeResponse>(AUTH_ENDPOINTS.ME);
    return meResponseToUser(data);
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      payload,
    );
    return data;
  },

  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      payload,
    );
    return data;
  },
};
