import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isUserLoading = useAuthStore((s) => s.isUserLoading);

  if (isUserLoading) return null;

  if (isAuthenticated) return <Navigate to="/profile" replace />;

  return <Outlet />;
}
