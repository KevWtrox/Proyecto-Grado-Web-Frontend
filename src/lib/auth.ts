import { api } from './api';
import type { LoginResponse, TokenResponse, Usuario } from './types';
import { useUserStore } from './userStore';

const MOCK_MODE = false;

const mockUser: LoginResponse = {
  access_token: 'mock_token_123',
  refresh_token: 'mock_refresh_123',
  token_type: 'bearer',
  user: {
    id: '69c6cb2aa5162d748c1ae5a6',
    nombre: 'Kevin',
    apellido: 'Torrez',
    correo: 'kevin@example.com',
    rol: 'admin',
    mencion: 'Bateria Moderna',
    paralelo: 1,
    fecha_registro: '2026-03-27T18:23:38.407000',
    activo: true,
  },
};

export async function login(correo: string, contrasena: string): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockUser;
  }
  
  const { data: tokens } = await api.post<TokenResponse>('/auth/login', { correo, contrasena });
  
  localStorage.setItem('token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token || '');
  
  const { data: user } = await api.get<Usuario>('/auth/me');
  
  return {
    ...tokens,
    user,
  };
}

export async function getCurrentUser(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  useUserStore.getState().clearUser();
  window.location.href = '/login';
}
