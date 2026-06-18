export const AUTH_ENDPOINTS = {
  ME: "/users/me",
} as const;

export const AUTH_QUERY_KEYS = {
  ME: ["auth", "me"] as const,
};
