import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Brain, Users } from 'lucide-react';

import { MainLayout as Layout } from '@/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usuariosService } from '@/features/usuarios/services/usuarios.service';
import { analiticaService } from '@/features/analitica/services/analitica.service';
import { ModeloEfficientNetCard } from '@/features/analitica/components/ModeloEfficientNetCard';
import { NSynthDatasetCard } from '@/features/analitica/components/NSynthDatasetCard';
import { PreprocesamientoPipeline } from '@/features/analitica/components/PreprocesamientoPipeline';
import type { Usuario } from '@/features/usuarios/types/usuarios.types';

function initiales(u: Usuario) {
  return `${u.nombre[0] ?? ''}${u.apellido[0] ?? ''}`.toUpperCase();
}

function avatarColor(name: string) {
  const colors = [
    'bg-[#2d5a3d]/20 text-[#2d5a3d]',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

export function AnaliticaPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const modeloQuery = useQuery({
    queryKey: ['analitica', 'modelo-info'],
    queryFn: analiticaService.getModeloInfo,
    staleTime: 60 * 60 * 1000,
  });
  const datasetQuery = useQuery({
    queryKey: ['analitica', 'dataset-info'],
    queryFn: analiticaService.getDatasetInfo,
    staleTime: 60 * 60 * 1000,
  });
  const preprocessingQuery = useQuery({
    queryKey: ['analitica', 'preprocessing'],
    queryFn: analiticaService.getPreprocessing,
    staleTime: 60 * 60 * 1000,
  });
  const resumenQuery = useQuery({
    queryKey: ['analitica', 'resumen-global'],
    queryFn: analiticaService.getResumenGlobal,
    staleTime: 30 * 1000,
  });
  const estudiantesQuery = useQuery({
    queryKey: ['analitica', 'estudiantes', pagina],
    queryFn: () => usuariosService.getAll(pagina, 20, 'estudiante', true),
  });

  const estudiantes = estudiantesQuery.data?.datos ?? [];
  const filtrados = busqueda.trim()
    ? estudiantes.filter(u =>
        `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : estudiantes;
  const totalPag = estudiantesQuery.data ? Math.ceil(estudiantesQuery.data.total / 20) : 1;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5a3d] to-[#5ba373] text-white flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Analítica CNN</h1>
            <p className="text-sm text-muted-foreground">
              EfficientNetB0 fine-tuneada sobre NSynth — explicabilidad por intento y métricas agregadas por estudiante.
            </p>
          </div>
        </div>

        {/* Resumen global */}
        {resumenQuery.data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <ResumenStat label="Estudiantes con intentos" value={resumenQuery.data.total_estudiantes_con_intentos.toString()} />
            <ResumenStat label="Intentos totales" value={resumenQuery.data.total_intentos.toString()} />
            <ResumenStat label="Ejercicios evaluados" value={resumenQuery.data.total_ejercicios_evaluados.toString()} />
            <ResumenStat label="Top-1 promedio" value={`${(resumenQuery.data.accuracy_promedio_top1 * 100).toFixed(1)}%`} />
            <ResumenStat label="Confianza media" value={`${(resumenQuery.data.confianza_promedio * 100).toFixed(1)}%`} />
          </div>
        )}

        {/* Cards técnicas */}
        {modeloQuery.data && <ModeloEfficientNetCard info={modeloQuery.data} defaultOpen />}
        {datasetQuery.data && <NSynthDatasetCard info={datasetQuery.data} />}
        {preprocessingQuery.data && <PreprocesamientoPipeline params={preprocessingQuery.data} />}

        {/* Sección estudiantes */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#2d5a3d]" />
            <h2 className="text-lg font-bold text-foreground">Análisis CNN por estudiante</h2>
            <span className="ml-auto text-sm text-muted-foreground">
              {estudiantesQuery.data?.total ?? 0} estudiantes activos
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seleccioná un estudiante para ver la matriz de confusión, métricas (top-K, F1, ECE),
            curva de aprendizaje y el análisis CNN detallado de cada intento.
          </p>

          <Input
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="max-w-sm"
          />

          {estudiantesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-secondary/40 border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {busqueda ? 'Sin resultados para la búsqueda.' : 'No hay estudiantes registrados.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtrados.map(u => (
                  <button
                    key={u.id}
                    onClick={() => navigate(`/analitica/estudiante/${u.id}`)}
                    className="text-left rounded-xl border border-border bg-card hover:border-[#2d5a3d]/40 hover:shadow-md transition-all p-4 flex items-center gap-3"
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(u.nombre)}`}>
                      {initiales(u)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{u.nombre} {u.apellido}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.correo}</p>
                      {u.mencion && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{u.mencion}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!busqueda && totalPag > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">Página {pagina} de {totalPag}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)}>
                      Anterior
                    </Button>
                    <Button variant="outline" disabled={pagina >= totalPag} onClick={() => setPagina(p => p + 1)}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ResumenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-[#2d5a3d]/10 to-secondary/30 border border-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
    </div>
  );
}
