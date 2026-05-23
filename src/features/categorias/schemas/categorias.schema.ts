import { z } from 'zod';

export const categoriaSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  icono_url: z.string().optional(),
  color_hex: z.string().optional(),
  orden: z.number(),
  activo: z.boolean(),
  fecha_creacion: z.string(),
});

export const categoriaListSchema = z.object({
  total: z.number(),
  pagina: z.number(),
  limite: z.number(),
  categorias: z.array(categoriaSchema),
});

export const crearCategoriaSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
});

export const actualizarCategoriaSchema = z.object({
  nombre: z.string().optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().optional(),
});
