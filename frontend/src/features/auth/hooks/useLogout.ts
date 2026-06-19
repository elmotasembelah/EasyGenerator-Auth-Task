import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      clearUser();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
