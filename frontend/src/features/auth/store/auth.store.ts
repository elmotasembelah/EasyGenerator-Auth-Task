import { create } from "zustand";
import { type User } from "../types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isUserLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isUserLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isUserLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isUserLoading: false }),
}));
