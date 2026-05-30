import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ejerciciosService } from '@/features/ejercicios/services/ejercicios.service';
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
  CompasRitmico,
  CrearEjercicioRequest,
  ActualizarEjercicioRequest,
} from '@/features/ejercicios/types/ejercicios.types';
import type {
  Categoria,
  CrearCategoriaRequest,
  ActualizarCategoriaRequest,
} from '@/features/categorias/types/categorias.types';
import { COMPASES_VALIDOS } from '@/features/ejercicios/types/ejercicios.types';

// ── Constantes ────────────────────────────────────────────────────────────────

const FIGURAS_INFO = [
  { code: 'R', label: 'Redonda',          duracion: 4,    esTap: true  },
  { code: 'B', label: 'Blanca',           duracion: 2,    esTap: true  },
  { code: 'N', label: 'Negra',            duracion: 1,    esTap: true  },
  { code: 'C', label: 'Corchea',          duracion: 0.5,  esTap: true  },
  { code: 'S', label: 'Semicorchea',      duracion: 0.25, esTap: true  },
  { code: 'r', label: 'Sil. Redonda',     duracion: 4,    esTap: false },
  { code: 'b', label: 'Sil. Blanca',      duracion: 2,    esTap: false },
  { code: 'n', label: 'Sil. Negra',       duracion: 1,    esTap: false },
  { code: 'c', label: 'Sil. Corchea',     duracion: 0.5,  esTap: false },
  { code: 's', label: 'Sil. Semicorchea', duracion: 0.25, esTap: false },
] as const;

const DURACIONES: Record<string, number> = Object.fromEntries(
  FIGURAS_INFO.map(f => [f.code, f.duracion]),
);

const NIVELES = [1, 2, 3, 4, 5] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function numeradorCompas(compasStr: string): number {
  return parseInt(compasStr.split('/')[0], 10);
}

function sumaFiguras(figuras: string[]): number {
  return figuras.reduce((acc, f) => acc + (DURACIONES[f] ?? 0), 0);
}

function nivelLabel(n: number): string {
  return ['', 'Fácil', 'Básico', 'Intermedio', 'Avanzado', 'Experto'][n] ?? String(n);
}

function nivelColor(n: number): string {
  const colors = [
    '',
    'bg-green-100 text-green-700',
    'bg-lime-100 text-lime-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700',
  ];
  return colors[n] ?? 'bg-secondary text-muted-foreground';
}

// ── Componente: builder de figuras rítmicas por compás ────────────────────────

function CompasRitmicoBuilder({
  index,
  figuras,
  onChange,
  compasStr,
}: {
  index: number;
  figuras: string[];
  onChange: (v: string[]) => void;
  compasStr: string;
}) {
  const [sel, setSel] = useState('N');
  const required = numeradorCompas(compasStr);
  const total = sumaFiguras(figuras);
  const isValid = Math.abs(total - required) < 0.001;
  const isOver = total > required + 0.001;

  function addFigura() {
    const dur = DURACIONES[sel] ?? 0;
    if (total + dur <= required + 0.001) onChange([...figuras, sel]);
  }

  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0 text-right pt-1.5">
        Compás {index + 1}
      </span>
      <div className="flex-1 space-y-1.5">
        {/* Chips de figuras */}
        <div className="flex flex-wrap gap-1 min-h-7 p-1.5 rounded border border-border bg-secondary/20">
          {figuras.length === 0 ? (
            <span className="text-xs text-muted-foreground italic self-center px-1">Sin figuras</span>
          ) : figuras.map((f, i) => {
            const info = FIGURAS_INFO.find(fi => fi.code === f);
            return (
              <span
                key={i}
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono border ${
                  info?.esTap
                    ? 'bg-[#2d5a3d]/10 border-[#2d5a3d]/30 text-[#2d5a3d]'
                    : 'bg-muted border-border text-muted-foreground'
                }`}
              >
                {f}
                <button
                  type="button"
                  onClick={() => onChange(figuras.filter((_, j) => j !== i))}
                  className="ml-0.5 opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="text-xs px-2 py-1 border rounded bg-input-background text-foreground border-border flex-1"
          >
            <optgroup label="Figuras (Tap)">
              {FIGURAS_INFO.filter(f => f.esTap).map(f => (
                <option key={f.code} value={f.code}>{f.code} — {f.label} ({f.duracion} p)</option>
              ))}
            </optgroup>
            <optgroup label="Silencios">
              {FIGURAS_INFO.filter(f => !f.esTap).map(f => (
                <option key={f.code} value={f.code}>{f.code} — {f.label} ({f.duracion} p)</option>
              ))}
            </optgroup>
          </select>
          <button
            type="button"
            onClick={addFigura}
            disabled={isOver || isValid}
            className="text-xs px-3 py-1 rounded border border-[#2d5a3d]/30 bg-[#2d5a3d]/10 text-[#2d5a3d] hover:bg-[#2d5a3d]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
          <span className={`text-xs font-mono shrink-0 ${
            isValid ? 'text-green-600 font-bold' : isOver ? 'text-red-500' : 'text-muted-foreground'
          }`}>
            {total % 1 === 0 ? total : total.toFixed(2)}/{required}
            {isValid && ' ✓'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type TabActivo = 'ejercicios' | 'categorias';
type ModalRitmica = 'ver' | 'editar' | 'crear' | 'eliminar' | null;
type ModalCategoria = 'ver' | 'editar' | 'crear' | 'eliminar' | null;
type FormRitmica = {
  subtipo?: string;
  titulo?: string;
  descripcion?: string;
  categoria_id?: string;
  nivel?: number;
  bpm_referencia?: number;
  compas?: string;
  instrucciones?: string;
  activo?: boolean;
};
type FormCategoria = { nombre?: string; descripcion?: string; activo?: boolean; imagen_file?: File | null };

// ── Página principal ──────────────────────────────────────────────────────────

export function RitmicaPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabActivo>('ejercicios');

  const [pagina, setPagina] = useState(1);
  const [filtroCatId, setFiltroCatId] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<boolean | null>(true);

  const [modal, setModal] = useState<ModalRitmica>(null);
  const [ejercicioSel, setEjercicioSel] = useState<EjercicioResumen | null>(null);
  const [ejercicioDetalle, setEjercicioDetalle] = useState<Ejercicio | null>(null);
  const [form, setForm] = useState<FormRitmica>({});
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [partituraUrl, setPartituraUrl] = useState<string | null>(null);

  const emptyCompases = (): string[][] => [[], [], [], []];
  const [compasesForm, setCompasesForm] = useState<string[][]>(emptyCompases());

  // ── Estado categorías ─────────────────────────────────────────────────────

  const [pagCat, setPagCat] = useState(1);
  const [filtroActivoCat, setFiltroActivoCat] = useState<boolean>(true);
  const [modalCat, setModalCat] = useState<ModalCategoria>(null);
  const [categoriaSel, setCategoriaSel] = useState<Categoria | null>(null);
  const [formCat, setFormCat] = useState<FormCategoria>({});
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['ejercicios-ritmica', pagina, filtroCatId, filtroNivel, filtroActivo],
    queryFn: () => ejerciciosService.getAll(pagina, 20, 'ritmo', filtroCatId, filtroActivo, filtroNivel),
  });

  const { data: dataCat, isLoading: loadingCat } = useQuery({
    queryKey: ['categorias', 'ritmica', pagCat, filtroActivoCat],
    queryFn: () => getCategorias(pagCat, 20, filtroActivoCat, 'ritmica'),
  });

  const { data: todasCategorias } = useQuery({
    queryKey: ['categorias-todas', 'ritmica'],
    queryFn: () => getCategorias(1, 100, false, 'ritmica'),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const crearMut = useMutation({
    mutationFn: (datos: CrearEjercicioRequest) => ejerciciosService.create(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios-ritmica'] });
      toast.success('Ejercicio creado correctamente');
      setModal(null);
      resetForm();
    },
    onError: () => toast.error('Error al crear ejercicio'),
  });

  const editarMut = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarEjercicioRequest }) =>
      ejerciciosService.update(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios-ritmica'] });
      toast.success('Ejercicio actualizado correctamente');
      setModal(null);
    },
    onError: () => toast.error('Error al actualizar ejercicio'),
  });

  const eliminarMut = useMutation({
    mutationFn: (id: string) => ejerciciosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ejercicios-ritmica'] });
      toast.success('Ejercicio desactivado correctamente');
      setModal(null);
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  const compasStr = form.compas ?? '4/4';
  const required = numeradorCompas(compasStr);
  const totalPag = data ? Math.ceil(data.total / 20) : 1;
  const totalPagCat = dataCat ? Math.ceil(dataCat.total / 20) : 1;
  const nombreCategoria = (id: string) =>
    todasCategorias?.categorias.find(c => c.id === id)?.nombre ?? id;

  function guardarCrearCategoria() {
    if (!formCat.nombre || !formCat.descripcion) {
      toast.error('Nombre y descripción son obligatorios');
      return;
    }
    crearCatMut.mutate({
      nombre: formCat.nombre!,
      descripcion: formCat.descripcion!,
      tipo: 'ritmica',
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

  function resetForm() {
    setForm({ nivel: 1, bpm_referencia: 60, compas: '4/4' });
    setCompasesForm(emptyCompases());
  }

  function buildPayload(): CompasRitmico[] | null {
    const valid = compasesForm.every(figs => Math.abs(sumaFiguras(figs) - required) < 0.001);
    if (!valid) return null;
    return compasesForm.map(figuras => ({ figuras }));
  }

  async function abrirVer(ej: EjercicioResumen) {
    setEjercicioSel(ej);
    setEjercicioDetalle(null);
    setPartituraUrl(null);
    setModal('ver');
    setLoadingDetalle(true);
    try {
      const detalle = await ejerciciosService.getById(ej.id);
      setEjercicioDetalle(detalle);
      if (detalle.partitura_base64) {
        setPartituraUrl(`data:image/svg+xml;base64,${detalle.partitura_base64}`);
      }
    } catch {
      toast.error('No se pudo cargar el detalle');
    } finally {
      setLoadingDetalle(false);
    }
  }

  async function abrirEditar(ej: EjercicioResumen) {
    setEjercicioSel(ej);
    setForm({
      subtipo: ej.subtipo,
      titulo: ej.titulo,
      descripcion: ej.descripcion,
      categoria_id: ej.categoria_id,
      nivel: ej.nivel ?? 1,
      bpm_referencia: ej.bpm_referencia,
      compas: ej.compas,
      activo: ej.activo,
    });
    setCompasesForm(emptyCompases());
    setModal('editar');
    try {
      const detalle = await ejerciciosService.getById(ej.id);
      if (detalle.compases?.length === 4) {
        setCompasesForm(detalle.compases.map(c => ('figuras' in c ? c.figuras : [])));
      }
      if (detalle.instrucciones) setForm(prev => ({ ...prev, instrucciones: detalle.instrucciones }));
    } catch {
      // compases quedan vacíos
    }
  }

  function guardarCrear() {
    if (!form.subtipo || !form.titulo || !form.descripcion || !form.categoria_id) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    const compases = buildPayload();
    if (!compases) {
      toast.error('Cada compás debe completar exactamente la duración indicada');
      return;
    }
    crearMut.mutate({
      tipo: 'ritmo',
      subtipo: form.subtipo!,
      titulo: form.titulo!,
      descripcion: form.descripcion!,
      categoria_id: form.categoria_id!,
      compases,
      nivel: form.nivel ?? 1,
      bpm_referencia: form.bpm_referencia ?? 60,
      compas: form.compas ?? '4/4',
      instrucciones: form.instrucciones,
    });
  }

  function guardarEditar() {
    if (!ejercicioSel) return;
    const compases = buildPayload();
    editarMut.mutate({
      id: ejercicioSel.id,
      datos: {
        subtipo: form.subtipo,
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria_id: form.categoria_id,
        nivel: form.nivel,
        bpm_referencia: form.bpm_referencia,
        compas: form.compas,
        instrucciones: form.instrucciones,
        activo: form.activo,
        ...(compases ? { compases } : {}),
      },
    });
  }

  // ── Formulario compartido (crear / editar) ────────────────────────────────

  const formFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Subtipo *</label>
          <Input
            placeholder="Ej: corcheas simples"
            value={form.subtipo ?? ''}
            onChange={(e) => setForm({ ...form, subtipo: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Nivel *</label>
          <select
            className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
            value={form.nivel ?? 1}
            onChange={(e) => setForm({ ...form, nivel: Number(e.target.value) })}
          >
            {NIVELES.map(n => (
              <option key={n} value={n}>{n} — {nivelLabel(n)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Título *</label>
        <Input
          placeholder="Título del ejercicio"
          value={form.titulo ?? ''}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Descripción *</label>
        <textarea
          className="w-full p-2 border rounded-md text-sm resize-none bg-input-background text-foreground border-border"
          rows={3}
          placeholder="Descripción del ejercicio"
          value={form.descripcion ?? ''}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Categoría *</label>
        <select
          className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
          value={form.categoria_id ?? ''}
          onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
        >
          <option value="">Seleccionar categoría</option>
          {todasCategorias?.categorias.map(c => (
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
            value={form.bpm_referencia ?? ''}
            onChange={(e) => setForm({ ...form, bpm_referencia: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Compás</label>
          <select
            className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
            value={form.compas ?? '4/4'}
            onChange={(e) => {
              setForm({ ...form, compas: e.target.value });
              setCompasesForm(emptyCompases());
            }}
          >
            {COMPASES_VALIDOS.map(c => (
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
          value={form.instrucciones ?? ''}
          onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Compases — figuras rítmicas (suma = {required} pulsos por compás) *
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          R=Redonda(4) · B=Blanca(2) · N=Negra(1) · C=Corchea(½) · S=Semicorchea(¼).
          Minúsculas = silencios.
        </p>
        <div className="space-y-2">
          {compasesForm.map((figuras, i) => (
            <CompasRitmicoBuilder
              key={i}
              index={i}
              figuras={figuras}
              onChange={(v) => setCompasesForm(prev => prev.map((c, j) => j === i ? v : c))}
              compasStr={form.compas ?? '4/4'}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {tab === 'ejercicios' ? 'Ejercicios de Rítmica' : 'Categorías de Rítmica'}
        </h1>
        <Button
          onClick={() => {
            if (tab === 'ejercicios') {
              resetForm();
              setModal('crear');
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

      {tab === 'ejercicios' && (
      <>
      {/* Filtros */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoría</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroCatId ?? ''}
                onChange={(e) => { setFiltroCatId(e.target.value || null); setPagina(1); }}
              >
                <option value="">Todas</option>
                {todasCategorias?.categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nivel</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroNivel ?? ''}
                onChange={(e) => { setFiltroNivel(e.target.value ? Number(e.target.value) : null); setPagina(1); }}
              >
                <option value="">Todos</option>
                {NIVELES.map(n => (
                  <option key={n} value={n}>{n} — {nivelLabel(n)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                value={filtroActivo === null ? '' : filtroActivo.toString()}
                onChange={(e) => {
                  const v = e.target.value;
                  setFiltroActivo(v === '' ? null : v === 'true');
                  setPagina(1);
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
                  <th className="text-left p-4 font-medium text-foreground">Subtipo</th>
                  <th className="text-left p-4 font-medium text-foreground">Categoría</th>
                  <th className="text-left p-4 font-medium text-foreground">Nivel</th>
                  <th className="text-left p-4 font-medium text-foreground">BPM</th>
                  <th className="text-left p-4 font-medium text-foreground">Compás</th>
                  <th className="text-left p-4 font-medium text-foreground">Estado</th>
                  <th className="text-left p-4 font-medium text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Cargando ejercicios...</td></tr>
                ) : data?.ejercicios.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No hay ejercicios de rítmica registrados</td></tr>
                ) : (
                  data?.ejercicios.map(ej => (
                    <tr key={ej.id} className="border-t border-[#e5e4e7] hover:bg-secondary/50">
                      <td className="p-4 font-medium max-w-[200px] truncate">{ej.titulo}</td>
                      <td className="p-4 text-sm">{ej.subtipo}</td>
                      <td className="p-4 text-sm">{nombreCategoria(ej.categoria_id)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${nivelColor(ej.nivel ?? 1)}`}>
                          {ej.nivel ?? 1} — {nivelLabel(ej.nivel ?? 1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{ej.bpm_referencia}</td>
                      <td className="p-4 text-sm">{ej.compas}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${ej.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {ej.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => abrirVer(ej)} className="border-[#2d5a3d] text-[#2d5a3d]">Ver</Button>
                          <Button size="sm" variant="outline" onClick={() => abrirEditar(ej)} className="border-[#2d5a3d] text-[#2d5a3d]">Editar</Button>
                          <Button size="sm" variant="outline" onClick={() => { setEjercicioSel(ej); setModal('eliminar'); }} className="border-red-300 text-red-600 hover:bg-red-50">Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-[#e5e4e7]">
            <span className="text-sm text-muted-foreground">
              Página {pagina} de {totalPag} ({data?.total ?? 0} ejercicios)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Anterior</Button>
              <Button variant="outline" disabled={pagina >= totalPag} onClick={() => setPagina(p => p + 1)} className="border-[#2d5a3d] text-[#2d5a3d]">Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}

      {tab === 'categorias' && (
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
          <div className="text-center py-16 text-muted-foreground">No hay categorías de rítmica</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {dataCat?.categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-36 bg-secondary/50 flex items-center justify-center overflow-hidden">
                    {cat.icono_url ? (
                      <img
                        src={cat.icono_url}
                        alt={cat.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-3xl text-muted-foreground/30 select-none">♪</span>
                    )}
                  </div>

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
      )}

      {/* Modales */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-[#2d5a3d]">
                {modal === 'ver'      && 'Detalle del Ejercicio'}
                {modal === 'crear'    && 'Crear Ejercicio de Rítmica'}
                {modal === 'editar'   && 'Editar Ejercicio'}
                {modal === 'eliminar' && 'Desactivar Ejercicio'}
              </CardTitle>
            </CardHeader>
            <CardContent>

              {/* ── Ver ── */}
              {modal === 'ver' && ejercicioSel && (
                <div className="space-y-4">
                  {loadingDetalle ? (
                    <p className="text-center text-muted-foreground py-4">Cargando detalle...</p>
                  ) : ejercicioDetalle ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className="text-muted-foreground">Título</p><p className="font-medium">{ejercicioDetalle.titulo}</p></div>
                        <div><p className="text-muted-foreground">Subtipo</p><p>{ejercicioDetalle.subtipo}</p></div>
                        <div><p className="text-muted-foreground">Categoría</p><p>{nombreCategoria(ejercicioDetalle.categoria_id)}</p></div>
                        <div>
                          <p className="text-muted-foreground">Nivel</p>
                          <span className={`px-2 py-0.5 rounded text-xs ${nivelColor(ejercicioDetalle.nivel ?? 1)}`}>
                            {ejercicioDetalle.nivel ?? 1} — {nivelLabel(ejercicioDetalle.nivel ?? 1)}
                          </span>
                        </div>
                        <div><p className="text-muted-foreground">BPM</p><p>{ejercicioDetalle.bpm_referencia}</p></div>
                        <div><p className="text-muted-foreground">Compás</p><p>{ejercicioDetalle.compas}</p></div>
                        <div className="col-span-2"><p className="text-muted-foreground">Descripción</p><p>{ejercicioDetalle.descripcion}</p></div>
                        {ejercicioDetalle.instrucciones && (
                          <div className="col-span-2"><p className="text-muted-foreground">Instrucciones</p><p>{ejercicioDetalle.instrucciones}</p></div>
                        )}
                      </div>

                      {/* Compases */}
                      {ejercicioDetalle.compases && ejercicioDetalle.compases.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-[#2d5a3d] mb-2">Compases</p>
                          <div className="space-y-1.5">
                            {ejercicioDetalle.compases.map((c, i) => {
                              const figs = 'figuras' in c ? c.figuras : [];
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-16 text-right shrink-0">Compás {i + 1}</span>
                                  <div className="flex flex-wrap gap-1">
                                    {figs.map((f, j) => {
                                      const info = FIGURAS_INFO.find(fi => fi.code === f);
                                      return (
                                        <span key={j} className={`px-2 py-0.5 rounded text-xs font-mono border ${
                                          info?.esTap
                                            ? 'bg-[#2d5a3d]/10 border-[#2d5a3d]/30 text-[#2d5a3d]'
                                            : 'bg-muted border-border text-muted-foreground'
                                        }`}>
                                          {f}
                                          <span className="opacity-50 ml-0.5 text-[10px]">({info?.label})</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Partitura */}
                      {partituraUrl && (
                        <div>
                          <p className="text-sm font-medium text-[#2d5a3d] mb-2">Partitura rítmica</p>
                          <img
                            src={partituraUrl}
                            alt="Partitura rítmica"
                            className="w-full rounded border border-[#c4b896] bg-white"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </>
                  ) : null}
                  <Button onClick={() => setModal(null)} className="w-full bg-[#2d5a3d] text-[#f5f0e6]">Cerrar</Button>
                </div>
              )}

              {/* ── Crear ── */}
              {modal === 'crear' && (
                <div>
                  {formFields}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={guardarCrear} className="flex-1 bg-[#2d5a3d] text-[#f5f0e6]" disabled={crearMut.isPending}>
                      {crearMut.isPending ? 'Creando...' : 'Crear'}
                    </Button>
                    <Button onClick={() => { setModal(null); resetForm(); }} variant="outline" className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}

              {/* ── Editar ── */}
              {modal === 'editar' && (
                <div>
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-1 block">Estado</label>
                    <select
                      className="w-full p-2 border rounded-md bg-input-background text-foreground border-border"
                      value={form.activo?.toString() ?? 'true'}
                      onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                  {formFields}
                  <div className="flex gap-2 pt-4">
                    <Button onClick={guardarEditar} className="flex-1 bg-[#2d5a3d] text-[#f5f0e6]" disabled={editarMut.isPending}>
                      {editarMut.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button onClick={() => setModal(null)} variant="outline" className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}

              {/* ── Eliminar ── */}
              {modal === 'eliminar' && ejercicioSel && (
                <div className="text-center">
                  <p className="mb-2">¿Desactivar el ejercicio <strong>"{ejercicioSel.titulo}"</strong>?</p>
                  <p className="text-sm text-muted-foreground mb-4">El ejercicio quedará inactivo pero no será eliminado del sistema.</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => eliminarMut.mutate(ejercicioSel.id)}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                      disabled={eliminarMut.isPending}
                    >
                      {eliminarMut.isPending ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                    <Button onClick={() => setModal(null)} variant="outline" className="flex-1">Cancelar</Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal categorías */}
      {modalCat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-[#2d5a3d]">
                {modalCat === 'ver' && 'Detalle de Categoría'}
                {modalCat === 'editar' && 'Editar Categoría'}
                {modalCat === 'crear' && 'Crear Categoría de Rítmica'}
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
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF o SVG. Máx. 2 MB.</p>
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
      )}
    </Layout>
  );
}
