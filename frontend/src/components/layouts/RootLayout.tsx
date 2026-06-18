import { Outlet } from "react-router-dom";
import { useAuthInit } from "@/features/auth/hooks/useAuthInit";

export function RootLayout() {
  useAuthInit();
  return <Outlet />;
}
