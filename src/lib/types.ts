export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  mencion: string;
  paralelo: number;
  fecha_registro: string;
  activo: boolean;
}

export type LoginResponse = TokenResponse & {
  user: Usuario;
}

export type UsuarioListResponse = {
  total: number;
  pagina: number;
  limite: number;
  datos: Usuario[];
}

export type ActualizarUsuarioRequest = {
  nombre?: string;
  apellido?: string;
  mencion?: string;
  paralelo?: number;
  activo?: boolean;
}

export type CrearUsuarioRequest = {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol: string;
  mencion?: string;
  paralelo?: number;
}

export type Estudiante = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  mencion: string;
  paralelo: number;
  puntuacion: number;
  ejercicios_completados: number;
}

export type PracticaDiaria = {
  fecha: string;
  cantidad: number;
}

export type EjercicioRealizado = {
  id: string;
  nombre: string;
  puntuacion: number;
  fecha: string;
}

// ── Categorías (backend :8002) ────────────────────────────────────────────────

export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  icono_url?: string;
  color_hex?: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
}

export type CategoriaListResponse = {
  total: number;
  pagina: number;
  limite: number;
  categorias: Categoria[];
}

export type CrearCategoriaRequest = {
  nombre: string;
  descripcion: string;
}

export type ActualizarCategoriaRequest = {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ── Ejercicios (backend :8002) ────────────────────────────────────────────────

export const TIPOS_EJERCICIO = ['entonacion', 'ritmo', 'dictado', 'lectura_vista', 'identificacion'] as const;
export const COMPASES_VALIDOS = ['2/4', '3/4', '4/4', '6/8', '3/8', '12/8'] as const;

export type TipoEjercicio = typeof TIPOS_EJERCICIO[number];
export type CompasValido = typeof COMPASES_VALIDOS[number];

export type Compas = {
  notas: [string, string, string, string];
}

export type EjercicioResumen = {
  id: string;
  tipo: string;
  subtipo: string;
  titulo: string;
  descripcion: string;
  categoria_id: string;
  bpm_referencia: number;
  compas: string;
  activo: boolean;
  fecha_creacion: string;
  veces_intentado: number;
  tasa_aprobacion: number;
}

export type Ejercicio = EjercicioResumen & {
  instrucciones?: string;
  compases?: Compas[];
  partitura_base64?: string;
}

export type EjercicioListResponse = {
  total: number;
  pagina: number;
  limite: number;
  ejercicios: EjercicioResumen[];
}

export type CrearEjercicioRequest = {
  tipo: string;
  subtipo: string;
  titulo: string;
  descripcion: string;
  categoria_id: string;
  compases: Compas[];
  bpm_referencia?: number;
  compas?: string;
  instrucciones?: string;
}

export type ActualizarEjercicioRequest = {
  tipo?: string;
  subtipo?: string;
  titulo?: string;
  descripcion?: string;
  categoria_id?: string;
  compases?: Compas[];
  bpm_referencia?: number;
  compas?: string;
  instrucciones?: string;
  activo?: boolean;
}
