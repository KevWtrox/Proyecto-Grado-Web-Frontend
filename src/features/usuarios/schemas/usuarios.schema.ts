import { z } from 'zod';

export const usuarioSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  correo: z.string(),
  rol: z.string(),
  mencion: z.string(),
  paralelo: z.number(),
  fecha_registro: z.string(),
  activo: z.boolean(),
});

export const usuarioListSchema = z.object({
  total: z.number(),
  pagina: z.number(),
  limite: z.number(),
  datos: z.array(usuarioSchema),
});

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  correo: z.email(),
  contrasena: z.string().min(6),
  rol: z.string().min(1),
  mencion: z.string().optional(),
  paralelo: z.number().optional(),
});

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  mencion: z.string().optional(),
  paralelo: z.number().optional(),
  activo: z.boolean().optional(),
});
