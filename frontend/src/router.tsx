import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/layouts/RootLayout";
import { authRoutes } from "./features/auth/auth.routes";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: () => null,
    children: [
      {
        path: "/",
        lazy: () => import("./pages/RootPage"),
      },
      ...authRoutes,
    ],
  },
]);
