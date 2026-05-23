import type { Usuario } from '@/features/usuarios/types/usuarios.types';

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type LoginResponse = TokenResponse & {
  user: Usuario;
};
