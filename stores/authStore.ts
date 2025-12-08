// src/store/authStore.ts

import { UserType } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";


interface AuthState {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  setUser: (user: UserType | null, token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user, token) => set({ user, token }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null }),
    }),

    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
