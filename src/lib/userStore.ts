import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse } from './types';

type UserStore = {
  user: LoginResponse['user'] | null;
  setUser: (user: LoginResponse['user']) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      
      setUser: (userData) => set({ user: userData }),
      
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
