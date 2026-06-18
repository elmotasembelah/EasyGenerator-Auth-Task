import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function ProtectedGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isUserLoading = useAuthStore((s) => s.isUserLoading);

  if (isUserLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
