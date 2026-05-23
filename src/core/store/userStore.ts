import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '@/features/usuarios/types/usuarios.types';

type UserStore = {
  user: Usuario | null;
  setUser: (user: Usuario) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'user-storage' }
  )
);
