import { z } from 'zod';
import { usuarioSchema } from '@/features/usuarios/schemas/usuarios.schema';

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
});

export const loginResponseSchema = tokenResponseSchema.extend({
  user: usuarioSchema,
});

export const loginRequestSchema = z.object({
  correo: z.email('Ingresa un correo válido'),
  contrasena: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
