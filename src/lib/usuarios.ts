import { api } from './api';
import type { UsuarioListResponse, Usuario, ActualizarUsuarioRequest, CrearUsuarioRequest } from './types';

export async function getUsuarios(
  pagina: number = 1,
  limite: number = 20,
  rol?: string | null,
  activo?: boolean | null
): Promise<UsuarioListResponse> {
  const params = new URLSearchParams({
    pagina: pagina.toString(),
    limite: limite.toString(),
  });

  if (rol) params.append('rol', rol);
  if (activo !== null && activo !== undefined) params.append('activo', activo.toString());

  const { data } = await api.get<UsuarioListResponse>(`/usuarios/?${params.toString()}`);
  return data;
}

export async function getUsuario(id: string): Promise<Usuario> {
  const { data } = await api.get<Usuario>(`/usuarios/${id}`);
  return data;
}

export async function actualizarUsuario(id: string, datos: ActualizarUsuarioRequest): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}`, datos);
  return data;
}

export async function crearUsuario(datos: CrearUsuarioRequest): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios/', datos);
  return data;
}

export async function eliminarUsuario(id: string): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/${id}`, { activo: false });
  return data;
}
