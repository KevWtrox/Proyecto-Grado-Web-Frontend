import { api } from '@/core/http/api';
import type {
  Usuario,
  UsuarioListResponse,
  CrearUsuarioRequest,
  ActualizarUsuarioRequest,
} from '@/features/usuarios/types/usuarios.types';

export const usuariosService = {
  getAll: async (
    pagina = 1,
    limite = 20,
    rol?: string | null,
    activo?: boolean | null
  ): Promise<UsuarioListResponse> => {
    const params = new URLSearchParams({ pagina: pagina.toString(), limite: limite.toString() });
    if (rol) params.append('rol', rol);
    if (activo !== null && activo !== undefined) params.append('activo', activo.toString());
    const { data } = await api.get<UsuarioListResponse>(`/usuarios/?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`);
    return data;
  },

  create: async (datos: CrearUsuarioRequest): Promise<Usuario> => {
    const { data } = await api.post<Usuario>('/usuarios/', datos);
    return data;
  },

  update: async (id: string, datos: ActualizarUsuarioRequest): Promise<Usuario> => {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}`, datos);
    return data;
  },

  remove: async (id: string): Promise<Usuario> => {
    const { data } = await api.patch<Usuario>(`/usuarios/${id}`, { activo: false });
    return data;
  },
};

// Alias funcionales para compatibilidad con páginas existentes
export const getUsuarios = usuariosService.getAll;
export const getUsuario = usuariosService.getById;
export const crearUsuario = usuariosService.create;
export const actualizarUsuario = usuariosService.update;
export const eliminarUsuario = usuariosService.remove;
