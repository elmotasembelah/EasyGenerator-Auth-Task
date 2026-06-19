import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";
import { AUTH_QUERY_KEYS } from "../constants/auth.constants";

export function useAuthInit() {
  const { setUser, clearUser } = useAuthStore();

  const { data, isSuccess, isError } = useQuery({
    queryKey: AUTH_QUERY_KEYS.ME,
    queryFn: authService.getMe,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      clearUser();
    }
  }, [isError, clearUser]);
}
