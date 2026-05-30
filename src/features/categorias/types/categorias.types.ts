export type TipoCategoria = 'solfeo' | 'ritmica';

export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoCategoria;
  icono_url?: string;
  color_hex?: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  total_ejercicios: number;
};

export type CategoriaListResponse = {
  total: number;
  pagina: number;
  limite: number;
  categorias: Categoria[];
};

export type CrearCategoriaRequest = {
  nombre: string;
  descripcion: string;
  tipo: TipoCategoria;
  icono_url?: string;
};

export type ActualizarCategoriaRequest = {
  nombre?: string;
  descripcion?: string;
  tipo?: TipoCategoria;
  activo?: boolean;
  icono_url?: string;
};
