export const TIPOS_EJERCICIO = ['entonacion', 'ritmo', 'dictado', 'lectura_vista', 'identificacion'] as const;
export const COMPASES_VALIDOS = ['2/4', '3/4', '4/4', '6/8', '3/8', '12/8'] as const;

export type TipoEjercicio = (typeof TIPOS_EJERCICIO)[number];
export type CompasValido = (typeof COMPASES_VALIDOS)[number];

export type Compas = {
  notas: [string, string, string, string];
};

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
};

export type Ejercicio = EjercicioResumen & {
  instrucciones?: string;
  compases?: Compas[];
  partitura_base64?: string;
};

export type EjercicioListResponse = {
  total: number;
  pagina: number;
  limite: number;
  ejercicios: EjercicioResumen[];
};

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
};

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
};
