import { z } from 'zod';
import { TIPOS_EJERCICIO, COMPASES_VALIDOS } from '@/features/ejercicios/types/ejercicios.types';

export const compasSchema = z.object({
  notas: z.tuple([z.string(), z.string(), z.string(), z.string()]),
});

export const ejercicioResumenSchema = z.object({
  id: z.string(),
  tipo: z.enum(TIPOS_EJERCICIO),
  subtipo: z.string(),
  titulo: z.string(),
  descripcion: z.string(),
  categoria_id: z.string(),
  bpm_referencia: z.number(),
  compas: z.string(),
  activo: z.boolean(),
  fecha_creacion: z.string(),
  veces_intentado: z.number(),
  tasa_aprobacion: z.number(),
});

export const ejercicioSchema = ejercicioResumenSchema.extend({
  instrucciones: z.string().optional(),
  compases: z.array(compasSchema).optional(),
  partitura_base64: z.string().optional(),
});

export const ejercicioListSchema = z.object({
  total: z.number(),
  pagina: z.number(),
  limite: z.number(),
  ejercicios: z.array(ejercicioResumenSchema),
});

export const crearEjercicioSchema = z.object({
  tipo: z.enum(TIPOS_EJERCICIO),
  subtipo: z.string().min(1),
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  categoria_id: z.string().min(1),
  compases: z.array(compasSchema).length(4),
  bpm_referencia: z.number().optional(),
  compas: z.enum(COMPASES_VALIDOS).optional(),
  instrucciones: z.string().optional(),
});
