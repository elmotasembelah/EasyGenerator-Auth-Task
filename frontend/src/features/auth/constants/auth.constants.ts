export const AUTH_ENDPOINTS = {
  ME: "/users/me",
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
} as const;

export const AUTH_QUERY_KEYS = {
  ME: ["auth", "me"] as const,
};
