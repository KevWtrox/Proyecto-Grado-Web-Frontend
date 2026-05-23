export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  icono_url?: string;
  color_hex?: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
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
};

export type ActualizarCategoriaRequest = {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
};
