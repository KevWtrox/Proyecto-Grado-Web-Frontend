import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getEjercicios,
  getEjercicio,
  crearEjercicio,
  actualizarEjercicio,
  desactivarEjercicio,
} from '@/features/ejercicios/services/ejercicios.service';
import {
  categoriasService,
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  desactivarCategoria,
} from '@/features/categorias/services/categorias.service';
import type {
  EjercicioResumen,
  Ejercicio,
  Compas,
  CrearEjercicioRequest,
  ActualizarEjercicioRequest,
} from '@/features/ejercicios/types/ejercicios.types';
import type {
  Categoria,
  CrearCategoriaRequest,
  ActualizarCategoriaRequest,
} from '@/features/categorias/types/categorias.types';
import { COMPASES_VALIDOS } from '@/features/ejercicios/types/ejercicios.types';

// ── Selector de nota (dropdown + escritura libre) ────────────────────────────

const NOTAS_ES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do#', 'Re#', 'Fa#', 'Sol#', 'La#', 'Reb', 'Mib', 'Solb', 'Lab', 'Sib'];
const NOTAS_EN = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#', 'Db', 'Eb', 'Gb', 'Ab', 'Bb'];
const NOTAS_TODAS = [...NOTAS_ES, ...NOTAS_EN];
const CUSTOM = '__custom__';

function SelectorNota({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const esPersonalizado = value !== '' && !NOTAS_TODAS.includes(value);
  const [modoEscritura, setModoEscritura] = useState(esPersonalizado);

  if (modoEscritura) {
    return (
      <div className="flex gap-1 flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Nota'}
          autoFocus
          className="flex-1 min-w-0 px-2 py-1 border rounded-md text-sm text-center bg-input-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="button"
          title="Volver al selector"
          onClick={() => { onChange(''); setModoEscritura(false); }}
          className="px-2 text-xs text-muted-foreground hover:text-foreground border rounded-md shrink-0"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      className="flex-1 min-w-0 px-1 py-1 border rounded-md text-sm text-center bg-input-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring/40"
      value={value}
      onChange={(e) => {
        if (e.target.value === CUSTOM) {
          setModoEscritura(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="">{placeholder ?? 'Nota'}</option>
      <optgroup label="Español">
        {NOTAS_ES.map((n) => <option key={n} value={n}>{n}</option>)}
      </optgroup>
      <optgroup label="Inglés">
        {NOTAS_EN.map((n) => <option key={n} value={n}>{n}</option>)}
      </optgroup>
      <optgroup label="─────────────">
        <option value={CUSTOM}>✏️ Escribir nota...</option>
      </optgroup>
    </select>
  );
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type TabActivo = 'ejercicios' | 'categorias';
type ModalEjercicio = 'ver' | 'editar' | 'crear' | 'eliminar' | null;
type ModalCategoria = 'ver' | 'editar' | 'crear' | 'eliminar' | null;

type FormEjercicio = {
  tipo?: string;
  subtipo?: string;
  titulo?: string;
  descripcion?: string;
  categoria_id?: string;
  bpm_referencia?: number;
  compas?: string;
  instrucciones?: string;
  activo?: boolean;
};
type FormCategoria = { nombre?: string; descripcion?: string; activo?: boolean; imagen_file?: File | null };

// ── Helpers ───────────────────────────────────────────────────────────────────

function tipoLabel(tipo: string) {
  const map: Record<string, string> = {
    entonacion: 'Entonación',
    ritmo: 'Rítmica',
    dictado: 'Dictado',
    lectura_vista: 'Lectura a vista',
    identificacion: 'Identificación',
    solfeo: 'Solfeo',
  };
  return map[tipo] ?? tipo;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EjerciciosPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabActivo>('ejercicios');

  // ── Estado ejercicios ─────────────────────────────────────────────────────

  const [pagEj, setPagEj] = useState(1);
  // Esta página gestiona solo ejercicios de solfeo. El backend interpreta
  // tipo="solfeo" como "todo lo no rítmico" (entonacion, dictado, lectura_vista, identificacion).
  const filtroTipo = 'solfeo';
  const [filtroCatId, setFiltroCatId] = useState<string | null>(null);
  const [filtroActivoEj, setFiltroActivoEj] = useState<boolean | null>(true);

  const [modalEj, setModalEj] = useState<ModalEjercicio>(null);
  const [ejercicioSel, setEjercicioSel] = useState<EjercicioResumen | null>(null);
  const [ejercicioDetalle, setEjercicioDetalle] = useState<Ejercicio | null>(null);
  const [formEj, setFormEj] = useState<FormEjercicio>({});
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [partituraUrl, setPartituraUrl] = useState<string | null>(null);

  const emptyCompases = (): string[][] => [
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ];
  const [compasesForm, setCompasesForm] = useState<string[][]>(emptyCompases());

  function updateNota(ci: number, ni: number, val: string) {
    setCompasesForm(prev => prev.map((c, i) => i === ci ? c.map((n, j) => j === ni ? val : n) : c));
  }

  function compasesFromDetalle(detalle: Ejercicio): string[][] {
    if (!detalle.compases || detalle.compases.length !== 4) return emptyCompases();
    return detalle.compases.map(c => ('notas' in c ? [...c.notas] : []));
  }

  function buildCompasesPayload(): Compas[] | null {
    const filled = compasesForm.every(c => c.every(n => n.trim() !== ''));
    if (!filled) return null;
    return compasesForm.map(c => ({ notas: c.map(n => n.trim()) as [string, string, string, string] }));
  }

  // ── Estado categorías ─────────────────────────────────────────────────────

  const [pagCat, setPagCat] = useState(1);
  const [filtroActivoCat, setFiltroActivoCat] = useState<boolean>(true);
  const [modalCat, setModalCat] = useState<ModalCategoria>(null);
  const [categoriaSel, setCategoriaSel] = useState<Categoria | null>(null);
  const [formCat, setFormCat] = useState<FormCategoria>({});
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: dataEj, isLoading: loadingEj } = useQuery({
    queryKey: ['ejercicios', pagEj, filtroTipo, filtroCatId, filtroActivoEj],
    queryFn: () => getEjercicios(pagEj, 20, filtroTipo, filtroCatId, filtroActivoEj),
  });

  const { data: dataCat, isLoading: loadingCat } = useQuery({
    queryKey: ['categorias', 'solfeo', pagCat, filtroActivoCat],
    queryFn: () => getCategorias(pagCat, 20, filtroActivoCat, 'solfeo'),
  });

  const { data: todasCategorias } = useQuery({
    queryKey: ['categorias-todas', 'solfeo'],
    queryFn: () => getCategorias(1, 100, false, 'solfeo'),
  });

  // ── Mutations ejercicios ──────────────────────────────────────────────────

  const crearEjMut = useMutation({
    mutationFn: (datos: CrearEjercicioRequest) => crearEjercicio(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios'] });
      toast.success('Ejercicio creado correctamente');
      setModalEj(null);
      setFormEj({});
      setCompasesForm(emptyCompases());
    },
    onError: () => toast.error('Error al crear ejercicio'),
  });

  const editarEjMut = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarEjercicioRequest }) =>
      actualizarEjercicio(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios'] });
      toast.success('Ejercicio actualizado correctamente');
      setModalEj(null);
    },
    onError: () => toast.error('Error al actualizar ejercicio'),
  });

  const eliminarEjMut = useMutation({
    mutationFn: (id: string) => desactivarEjercicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios'] });
      toast.success('Ejercicio desactivado correctamente');
      setModalEj(null);
    },
    onError: () => toast.error('Error al desactivar ejercicio'),
  });

  // ── Mutations categorías ──────────────────────────────────────────────────

  const crearCatMut = useMutation({
    mutationFn: (datos: CrearCategoriaRequest) => crearCategoria(datos),
    onSuccess: async (nuevaCategoria) => {
      if (formCat.imagen_file) {
        try {
          await categoriasService.uploadImagen(nuevaCategoria.id, formCat.imagen_file);
        } catch {
          toast.warning('Categoría creada, pero no se pudo subir la imagen');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] });
      toast.success('Categoría creada correctamente');
      setModalCat(null);
      setFormCat({});
      setImagenPreview(null);
    },
    onError: () => toast.error('Error al crear categoría'),
  });

  const editarCatMut = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarCategoriaRequest }) =>
      actualizarCategoria(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] });
      toast.success('Categoría actualizada correctamente');
      setModalCat(null);
      setImagenPreview(null);
    },
    onError: () => toast.error('Error al actualizar categoría'),
  });

  const eliminarCatMut = useMutation({
    mutationFn: (id: string) => desactivarCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias-todas'] });
      toast.success('Categoría desactivada correctamente');
      setModalCat(null);
    },
    onError: () => toast.error('Error al desactivar categoría'),
  });

  // ── Helpers ejercicios ────────────────────────────────────────────────────

  const totalPagEj = dataEj ? Math.ceil(dataEj.total / 20) : 1;
  const totalPagCat = dataCat ? Math.ceil(dataCat.total / 20) : 1;

  const nombreCategoria = (id: string) =>
    todasCategorias?.categorias.find((c) => c.id === id)?.nombre ?? id;

  async function abrirVerEjercicio(ej: EjercicioResumen) {
    setEjercicioSel(ej);
    setEjercicioDetalle(null);
    setPartituraUrl(null);
    setModalEj('ver');
    setLoadingDetalle(true);
    try {
      const detalle = await getEjercicio(ej.id);
      setEjercicioDetalle(detalle);
      if (detalle.partitura_base64) {
        setPartituraUrl(`data:image/svg+xml;base64,${detalle.partitura_base64}`);
      }
    } catch {
      toast.error('No se pudo cargar el detalle del ejercicio');
    } finally {
      setLoadingDetalle(false);
    }
  }

  async function abrirEditarEjercicio(ej: EjercicioResumen) {
    setEjercicioSel(ej);
    setFormEj({
      tipo: ej.tipo,
      subtipo: ej.subtipo,
      titulo: ej.titulo,
      descripcion: ej.descripcion,
      categoria_id: ej.categoria_id,
      bpm_referencia: ej.bpm_referencia,
      compas: ej.compas,
      activo: ej.activo,
    });
    setCompasesForm(emptyCompases());
    setModalEj('editar');
    try {
      const detalle = await getEjercicio(ej.id);
      setCompasesForm(compasesFromDetalle(detalle));
      if (detalle.instrucciones) setFormEj(prev => ({ ...prev, instrucciones: detalle.instrucciones }));
    } catch {
      // compases quedan vacíos; el usuario puede ingresarlos manualmente
    }
  }

  function guardarCrearEjercicio() {
    if (!formEj.tipo || !formEj.subtipo || !formEj.titulo || !formEj.descripcion || !formEj.categoria_id) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    const compases = buildCompasesPayload();
    if (!compases) {
      toast.error('Completa las 16 notas de los 4 compases');
      return;
    }
    crearEjMut.mutate({
      tipo: formEj.tipo!,
      subtipo: formEj.subtipo!,
      titulo: formEj.titulo!,
      descripcion: formEj.descripcion!,
      categoria_id: formEj.categoria_id!,
      compases,
      bpm_referencia: formEj.bpm_referencia ?? 60,
      compas: formEj.compas ?? '4/4',
      instrucciones: formEj.instrucciones,
    });
  }

  function guardarEditarEjercicio() {
    if (!ejercicioSel) return;
    const compases = buildCompasesPayload();
    editarEjMut.mutate({
      id: ejercicioSel.id,
      datos: {
        tipo: formEj.tipo,
        subtipo: formEj.subtipo,
        titulo: formEj.titulo,
        descripcion: formEj.descripcion,
        categoria_id: formEj.categoria_id,
        bpm_referencia: formEj.bpm_referencia,
        compas: formEj.compas,
        instrucciones: formEj.instrucciones,
        activo: formEj.activo,
        ...(compases ? { compases } : {}),
      },
    });
  }

  // ── Helpers categorías ────────────────────────────────────────────────────

  function guardarCrearCategoria() {
    if (!formCat.nombre || !formCat.descripcion) {
      toast.error('Nombre y descripción son obligatorios');
      return;
    }
    crearCatMut.mutate({
      nombre: formCat.nombre!,
      descripcion: formCat.descripcion!,
      tipo: 'solfeo',
    });
  }

  async function guardarEditarCategoria() {
    if (!categoriaSel) return;
    if (formCat.imagen_file) {
      try {
        await categoriasService.uploadImagen(categoriaSel.id, formCat.imagen_file);
      } catch {
        toast.error('Error al subir la imagen');
        return;
      }
    }
    editarCatMut.mutate({
      id: categoriaSel.id,
      datos: {
        nombre: formCat.nombre,
        descripcion: formCat.descripcion,
        activo: formCat.activo,
      },
    });
  }

  // ── Render tab ejercicios ─────────────────────────────────────────────────

  const tabEjercicios = (
    <div>
      {/* Filtros */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoría</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroCatId ?? ''}
                onChange={(e) => { setFiltroCatId(e.target.value || null); setPagEj(1); }}
              >
                <option value="">Todas</option>
                {todasCategorias?.categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroActivoEj === null ? '' : filtroActivoEj.toString()}
                onChange={(e) => {
                  const v = e.target.value;
                  setFiltroActivoEj(v === '' ? null : v === 'true');
                  setPagEj(1);
                }}
              >
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
                <option value="">Todos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Título</th>
                  <th className="text-left p-4 font-medium text-foreground">Tipo</th>
                  <th className="text-left p-4 font-medium text-foreground">Subtipo</th>
                  <th className="text-left p-4 font-medium text-foreground">Categoría</th>
                  <th className="text-left p-4 font-medium text-foreground">BPM</th>
                  <th className="text-left p-4 font-medium text-foreground">Compás</th>
                  <th className="text-left p-4 font-medium text-foreground">Estado</th>
                  <th className="text-left p-4 font-medium text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingEj ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Cargando ejercicios...</td></tr>
                ) : dataEj?.ejercicios.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No hay ejercicios</td></tr>
                ) : (
                  dataEj?.ejercicios.map((ej) => {
                    return (
                      <tr key={ej.id} className="border-t border-[#e5e4e7] hover:bg-secondary/50">
                        <td className="p-4 font-medium max-w-[200px] truncate">{ej.titulo}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded text-xs bg-[#2d5a3d]/10 text-[#2d5a3d]">
                            {tipoLabel(ej.tipo)}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{ej.subtipo}</td>
                        <td className="p-4 text-sm">{nombreCategoria(ej.categoria_id)}</td>
                        <td className="p-4 text-sm">{ej.bpm_referencia}</td>
                        <td className="p-4 text-sm">{ej.compas}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${ej.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {ej.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => abrirVerEjercicio(ej)} className="border-[#2d5a3d] text-[#2d5a3d]">Ver</Button>
                            <Button size="sm" variant="outline" onClick={() => abrirEditarEjercicio(ej)} className="border-[#2d5a3d] text-[#2d5a3d]">Editar</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEjercicioSel(ej); setModalEj('eliminar'); }} className="border-red-300 text-red-600 hover:bg-red-50">Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-[#e5e4e7]">
            <span className="text-sm text-muted-foreground">
              Página {pagEj} de {totalPagEj} ({dataEj?.total ?? 0} ejercicios)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagEj <= 1} onClick={() => setPagEj(p => p - 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Anterior</Button>
              <Button variant="outline" disabled={pagEj >= totalPagEj} onClick={() => setPagEj(p => p + 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ── Render tab categorías ─────────────────────────────────────────────────

  const tabCategorias = (
    <div>
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroActivoCat.toString()}
                onChange={(e) => { setFiltroActivoCat(e.target.value === 'true'); setPagCat(1); }}
              >
                <option value="true">Solo activas</option>
                <option value="false">Todas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingCat ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
              <div className="h-36 bg-secondary rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-secondary rounded w-2/3" />
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="h-3 bg-secondary rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : dataCat?.categorias.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No hay categorías</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {dataCat?.categorias.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Imagen */}
                <div className="h-36 bg-secondary/50 flex items-center justify-center overflow-hidden">
                  {cat.icono_url ? (
                    <img
                      src={cat.icono_url}
                      alt={cat.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <span className="text-3xl text-muted-foreground/30 select-none">♪</span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-tight">{cat.nombre}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs ${cat.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{cat.descripcion}</p>

                  <p className="text-sm text-foreground font-medium">
                    <span className="text-base font-bold">{cat.total_ejercicios}</span>
                    {' '}ejercicio{cat.total_ejercicios !== 1 ? 's' : ''}
                  </p>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm" variant="outline"
                      onClick={() => { setCategoriaSel(cat); setModalCat('ver'); }}
                      className="flex-1 border-[#2d5a3d] text-[#2d5a3d]"
                    >Ver</Button>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => {
                        setCategoriaSel(cat);
                        setFormCat({ nombre: cat.nombre, descripcion: cat.descripcion, activo: cat.activo });
                        setModalCat('editar');
                      }}
                      className="flex-1 border-[#2d5a3d] text-[#2d5a3d]"
                    >Editar</Button>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => { setCategoriaSel(cat); setModalCat('eliminar'); }}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >Eliminar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Página {pagCat} de {totalPagCat} ({dataCat?.total ?? 0} categorías)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagCat <= 1} onClick={() => setPagCat(p => p - 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Anterior</Button>
              <Button variant="outline" disabled={pagCat >= totalPagCat} onClick={() => setPagCat(p => p + 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Siguiente</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ── Formulario ejercicio (crear / editar) ─────────────────────────────────

  const formEjercicioFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Tipo *</label>
          <div className="w-full p-2 border rounded-md bg-secondary/50 text-foreground border-border text-sm">
            {tipoLabel(formEj.tipo ?? 'entonacion')}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Subtipo *</label>
          <Input
            placeholder="Ej: escalas mayores"
            value={formEj.subtipo ?? ''}
            onChange={(e) => setFormEj({ ...formEj, subtipo: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Título *</label>
        <Input
          placeholder="Título del ejercicio"
          value={formEj.titulo ?? ''}
          onChange={(e) => setFormEj({ ...formEj, titulo: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Descripción *</label>
        <textarea
          className="w-full p-2 border rounded-md text-sm resize-none bg-input-background text-foreground border-border"
          rows={3}
          placeholder="Descripción del ejercicio"
          value={formEj.descripcion ?? ''}
          onChange={(e) => setFormEj({ ...formEj, descripcion: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Categoría *</label>
        <select
          className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
          value={formEj.categoria_id ?? ''}
          onChange={(e) => setFormEj({ ...formEj, categoria_id: e.target.value })}
        >
          <option value="">Seleccionar categoría</option>
          {todasCategorias?.categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">BPM</label>
          <Input
            type="number" min={20} max={300}
            placeholder="60"
            value={formEj.bpm_referencia ?? ''}
            onChange={(e) => setFormEj({ ...formEj, bpm_referencia: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Compás</label>
          <select
            className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
            value={formEj.compas ?? '4/4'}
            onChange={(e) => setFormEj({ ...formEj, compas: e.target.value })}
          >
            {COMPASES_VALIDOS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Instrucciones</label>
        <textarea
          className="w-full p-2 border rounded-md text-sm resize-none bg-input-background text-foreground border-border"
          rows={2}
          placeholder="Instrucciones para el estudiante (opcional)"
          value={formEj.instrucciones ?? ''}
          onChange={(e) => setFormEj({ ...formEj, instrucciones: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Compases — 4 notas por compás *
        </label>
        <div className="space-y-2">
          {compasesForm.map((compas, ci) => (
            <div key={ci} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-16 shrink-0 text-right">
                Compás {ci + 1}
              </span>
              {compas.map((nota, ni) => (
                <SelectorNota
                  key={ni}
                  value={nota}
                  onChange={(v) => updateNota(ci, ni, v)}
                  placeholder={['Do', 'Re', 'Mi', 'Fa'][ni]}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Notación española (Do, Re, Mi…) o inglesa (C, D, E…). Acepta sostenidos (#) y bemoles (b).
        </p>
      </div>
    </div>
  );

  // ── Modales ejercicios ────────────────────────────────────────────────────

  const modalEjercicios = modalEj && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-[#2d5a3d]">
            {modalEj === 'ver' && 'Detalle del Ejercicio'}
            {modalEj === 'editar' && 'Editar Ejercicio'}
            {modalEj === 'crear' && 'Crear Ejercicio'}
            {modalEj === 'eliminar' && 'Desactivar Ejercicio'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modalEj === 'ver' && ejercicioSel && (
            <div className="space-y-4">
              {loadingDetalle ? (
                <p className="text-center text-muted-foreground py-4">Cargando detalle...</p>
              ) : ejercicioDetalle ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Título</p><p className="font-medium">{ejercicioDetalle.titulo}</p></div>
                    <div><p className="text-muted-foreground">Tipo</p><p>{tipoLabel(ejercicioDetalle.tipo)}</p></div>
                    <div><p className="text-muted-foreground">Subtipo</p><p>{ejercicioDetalle.subtipo}</p></div>
                    <div><p className="text-muted-foreground">Categoría</p><p>{nombreCategoria(ejercicioDetalle.categoria_id)}</p></div>
                    <div><p className="text-muted-foreground">BPM</p><p>{ejercicioDetalle.bpm_referencia}</p></div>
                    <div><p className="text-muted-foreground">Compás</p><p>{ejercicioDetalle.compas}</p></div>
                    <div className="col-span-2"><p className="text-muted-foreground">Descripción</p><p>{ejercicioDetalle.descripcion}</p></div>
                    {ejercicioDetalle.instrucciones && (
                      <div className="col-span-2"><p className="text-muted-foreground">Instrucciones</p><p>{ejercicioDetalle.instrucciones}</p></div>
                    )}
                  </div>

                  {partituraUrl && (
                    <div>
                      <p className="text-sm font-medium text-[#2d5a3d] mb-2">Partitura</p>
                      <img
                        src={partituraUrl}
                        alt="Partitura del ejercicio"
                        className="w-full rounded border border-[#c4b896] bg-white"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </>
              ) : null}
              <Button onClick={() => setModalEj(null)} className="w-full bg-[#2d5a3d] text-[#f5f0e6]">Cerrar</Button>
            </div>
          )}

          {modalEj === 'crear' && (
            <div>
              {formEjercicioFields}
              <div className="flex gap-2 pt-4">
                <Button onClick={guardarCrearEjercicio} className="flex-1 bg-[#2d5a3d] text-[#f5f0e6]" disabled={crearEjMut.isPending}>
                  {crearEjMut.isPending ? 'Creando...' : 'Crear'}
                </Button>
                <Button onClick={() => { setModalEj(null); setFormEj({}); }} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}

          {modalEj === 'editar' && (
            <div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <select
                  className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                  value={formEj.activo?.toString() ?? 'true'}
                  onChange={(e) => setFormEj({ ...formEj, activo: e.target.value === 'true' })}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              {formEjercicioFields}
              <div className="flex gap-2 pt-4">
                <Button onClick={guardarEditarEjercicio} className="flex-1 bg-[#2d5a3d] text-[#f5f0e6]" disabled={editarEjMut.isPending}>
                  {editarEjMut.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button onClick={() => setModalEj(null)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}

          {modalEj === 'eliminar' && ejercicioSel && (
            <div className="text-center">
              <p className="mb-2">¿Desactivar el ejercicio <strong>"{ejercicioSel.titulo}"</strong>?</p>
              <p className="text-sm text-muted-foreground mb-4">El ejercicio quedará inactivo pero no será eliminado del sistema.</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => eliminarEjMut.mutate(ejercicioSel.id)}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  disabled={eliminarEjMut.isPending}
                >
                  {eliminarEjMut.isPending ? 'Desactivando...' : 'Desactivar'}
                </Button>
                <Button onClick={() => setModalEj(null)} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ── Modales categorías ────────────────────────────────────────────────────

  const modalCategorias = modalCat && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-[#2d5a3d]">
            {modalCat === 'ver' && 'Detalle de Categoría'}
            {modalCat === 'editar' && 'Editar Categoría'}
            {modalCat === 'crear' && 'Crear Categoría'}
            {modalCat === 'eliminar' && 'Desactivar Categoría'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modalCat === 'ver' && categoriaSel && (
            <div className="space-y-4">
              {categoriaSel.icono_url && (
                <div className="flex justify-center">
                  <img
                    src={categoriaSel.icono_url}
                    alt={categoriaSel.nombre}
                    className="max-h-48 rounded-lg object-contain border border-border bg-secondary/30 p-2"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="space-y-3 text-sm">
                <div><p className="text-muted-foreground">Nombre</p><p className="font-medium">{categoriaSel.nombre}</p></div>
                <div><p className="text-muted-foreground">Descripción</p><p>{categoriaSel.descripcion}</p></div>
                <div className="flex gap-6">
                  <div><p className="text-muted-foreground">Estado</p><span className={`px-2 py-1 rounded text-xs ${categoriaSel.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{categoriaSel.activo ? 'Activa' : 'Inactiva'}</span></div>
                  <div><p className="text-muted-foreground">Ejercicios</p><p className="font-semibold text-[#2d5a3d]">{categoriaSel.total_ejercicios}</p></div>
                  <div><p className="text-muted-foreground">Creada</p><p>{new Date(categoriaSel.fecha_creacion).toLocaleDateString()}</p></div>
                </div>
              </div>
              <Button onClick={() => setModalCat(null)} className="w-full bg-[#2d5a3d] text-[#f5f0e6]">Cerrar</Button>
            </div>
          )}

          {(modalCat === 'crear' || modalCat === 'editar') && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre *</label>
                <Input
                  placeholder="Nombre de la categoría"
                  value={formCat.nombre ?? ''}
                  onChange={(e) => setFormCat({ ...formCat, nombre: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descripción *</label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm resize-none bg-input-background text-foreground border-border"
                  rows={4}
                  placeholder="Descripción de la categoría"
                  value={formCat.descripcion ?? ''}
                  onChange={(e) => setFormCat({ ...formCat, descripcion: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Imagen {modalCat === 'editar' && categoriaSel?.icono_url ? '(reemplazar)' : '(opcional)'}
                </label>
                {/* Preview de imagen actual en edición */}
                {modalCat === 'editar' && categoriaSel?.icono_url && !imagenPreview && (
                  <div className="mb-2">
                    <img
                      src={categoriaSel.icono_url}
                      alt="Imagen actual"
                      className="h-24 rounded-lg object-contain border border-border bg-secondary/30 p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Imagen actual</p>
                  </div>
                )}
                {/* Preview de nueva imagen seleccionada */}
                {imagenPreview && (
                  <div className="mb-2">
                    <img
                      src={imagenPreview}
                      alt="Vista previa"
                      className="h-24 rounded-lg object-contain border border-[#2d5a3d]/40 bg-secondary/30 p-1"
                    />
                    <p className="text-xs text-[#2d5a3d] mt-1">Nueva imagen seleccionada</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#2d5a3d]/10 file:text-[#2d5a3d] hover:file:bg-[#2d5a3d]/20 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFormCat({ ...formCat, imagen_file: file });
                    if (file) {
                      setImagenPreview(URL.createObjectURL(file));
                    } else {
                      setImagenPreview(null);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF o SVG. Máx. 5 MB.</p>
              </div>
              {modalCat === 'editar' && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado</label>
                  <select
                    className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                    value={formCat.activo?.toString() ?? 'true'}
                    onChange={(e) => setFormCat({ ...formCat, activo: e.target.value === 'true' })}
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={modalCat === 'crear' ? guardarCrearCategoria : guardarEditarCategoria}
                  className="flex-1 bg-[#2d5a3d] text-[#f5f0e6]"
                  disabled={crearCatMut.isPending || editarCatMut.isPending}
                >
                  {(crearCatMut.isPending || editarCatMut.isPending) ? 'Guardando...' : (modalCat === 'crear' ? 'Crear' : 'Guardar')}
                </Button>
                <Button onClick={() => { setModalCat(null); setFormCat({}); setImagenPreview(null); }} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}

          {modalCat === 'eliminar' && categoriaSel && (
            <div className="text-center">
              <p className="mb-2">¿Desactivar la categoría <strong>"{categoriaSel.nombre}"</strong>?</p>
              <p className="text-sm text-muted-foreground mb-4">Los ejercicios asociados no serán eliminados.</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => eliminarCatMut.mutate(categoriaSel.id)}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  disabled={eliminarCatMut.isPending}
                >
                  {eliminarCatMut.isPending ? 'Desactivando...' : 'Desactivar'}
                </Button>
                <Button onClick={() => { setModalCat(null); setImagenPreview(null); }} variant="outline" className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ── Layout principal ──────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Ejercicios</h1>
        <Button
          onClick={() => {
            if (tab === 'ejercicios') {
              setFormEj({ tipo: 'entonacion', bpm_referencia: 60, compas: '4/4' });
              setModalEj('crear');
            } else {
              setFormCat({});
              setModalCat('crear');
            }
          }}
          className="bg-primary hover:opacity-90 text-primary-foreground"
        >
          + {tab === 'ejercicios' ? 'Nuevo Ejercicio' : 'Nueva Categoría'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 w-fit shadow-sm border border-border">
        <button
          onClick={() => setTab('ejercicios')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'ejercicios'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          Ejercicios
        </button>
        <button
          onClick={() => setTab('categorias')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'categorias'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          Categorías
        </button>
      </div>

      {tab === 'ejercicios' ? tabEjercicios : tabCategorias}

      {modalEjercicios}
      {modalCategorias}
    </Layout>
  );
}
