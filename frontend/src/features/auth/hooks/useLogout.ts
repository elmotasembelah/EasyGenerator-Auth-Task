import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";

export function useLogout() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  return async () => {
    try {
      await authService.logout();
      clearUser();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };
}
