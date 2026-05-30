import { ejerciciosApi } from '@/core/http/ejerciciosApi';
import type {
  Categoria,
  CategoriaListResponse,
  CrearCategoriaRequest,
  ActualizarCategoriaRequest,
  TipoCategoria,
} from '@/features/categorias/types/categorias.types';

export const categoriasService = {
  getAll: async (
    pagina = 1,
    limite = 100,
    solo_activas = true,
    tipo?: TipoCategoria,
  ): Promise<CategoriaListResponse> => {
    const params = new URLSearchParams({
      pagina: pagina.toString(),
      limite: limite.toString(),
      solo_activas: solo_activas.toString(),
    });
    if (tipo) params.append('tipo', tipo);
    const { data } = await ejerciciosApi.get<CategoriaListResponse>(`/categorias/?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Categoria> => {
    const { data } = await ejerciciosApi.get<Categoria>(`/categorias/${id}`);
    return data;
  },

  create: async (datos: CrearCategoriaRequest): Promise<Categoria> => {
    const { data } = await ejerciciosApi.post<Categoria>('/categorias/', datos);
    return data;
  },

  update: async (id: string, datos: ActualizarCategoriaRequest): Promise<Categoria> => {
    const { data } = await ejerciciosApi.patch<Categoria>(`/categorias/${id}`, datos);
    return data;
  },

  remove: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await ejerciciosApi.delete<{ mensaje: string }>(`/categorias/${id}`);
    return data;
  },

  uploadImagen: async (id: string, file: File): Promise<Categoria> => {
    const formData = new FormData();
    formData.append('imagen', file);
    const { data } = await ejerciciosApi.post<Categoria>(
      `/categorias/${id}/imagen`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};

// Alias funcionales para compatibilidad con páginas existentes
export const getCategorias = categoriasService.getAll;
export const getCategoria = categoriasService.getById;
export const crearCategoria = categoriasService.create;
export const actualizarCategoria = categoriasService.update;
export const desactivarCategoria = categoriasService.remove;
