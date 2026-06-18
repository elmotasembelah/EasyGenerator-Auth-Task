import { type RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    path: "/login",
    lazy: () => import("./pages/LoginPage"),
  },
  {
    path: "/register",
    lazy: () => import("./pages/RegisterPage"),
  },
  {
    path: "/profile",
    lazy: () => import("./pages/ProfilePage"),
  },
];
