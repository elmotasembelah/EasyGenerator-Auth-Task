import { type RouteObject } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { ProtectedGuard } from "@/components/guards/ProtectedGuard";

export const authRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      { path: "/login", lazy: () => import("./pages/LoginPage") },
      { path: "/register", lazy: () => import("./pages/RegisterPage") },
    ],
  },
  {
    element: <ProtectedGuard />,
    children: [
      { path: "/profile", lazy: () => import("./pages/ProfilePage") },
    ],
  },
];
