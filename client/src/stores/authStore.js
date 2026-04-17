import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      mergeUser: (partial) => set((s) => ({ user: s.user ? { ...s.user, ...partial } : partial })),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "nearbystay-auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
