import { ejerciciosApi } from './ejerciciosApi';
import type {
  CategoriaListResponse,
  Categoria,
  CrearCategoriaRequest,
  ActualizarCategoriaRequest,
} from './types';

export async function getCategorias(
  pagina: number = 1,
  limite: number = 100,
  solo_activas: boolean = true
): Promise<CategoriaListResponse> {
  const params = new URLSearchParams({
    pagina: pagina.toString(),
    limite: limite.toString(),
    solo_activas: solo_activas.toString(),
  });
  const { data } = await ejerciciosApi.get<CategoriaListResponse>(`/categorias/?${params.toString()}`);
  return data;
}

export async function getCategoria(id: string): Promise<Categoria> {
  const { data } = await ejerciciosApi.get<Categoria>(`/categorias/${id}`);
  return data;
}

export async function crearCategoria(datos: CrearCategoriaRequest): Promise<Categoria> {
  const { data } = await ejerciciosApi.post<Categoria>('/categorias/', datos);
  return data;
}

export async function actualizarCategoria(id: string, datos: ActualizarCategoriaRequest): Promise<Categoria> {
  const { data } = await ejerciciosApi.patch<Categoria>(`/categorias/${id}`, datos);
  return data;
}

export async function desactivarCategoria(id: string): Promise<{ mensaje: string }> {
  const { data } = await ejerciciosApi.delete<{ mensaje: string }>(`/categorias/${id}`);
  return data;
}
