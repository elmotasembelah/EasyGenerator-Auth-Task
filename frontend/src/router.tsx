import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "./features/auth/auth.routes";

export const router = createBrowserRouter([...authRoutes]);
