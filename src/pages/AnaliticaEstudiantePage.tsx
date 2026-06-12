import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { MainLayout as Layout } from '@/layouts/MainLayout';
import { analiticaService } from '@/features/analitica/services/analitica.service';
import { MatrizConfusion } from '@/features/analitica/components/MatrizConfusion';
import { MetricasGlobalesCNN } from '@/features/analitica/components/MetricasGlobalesCNN';
import { ParesConfundidos } from '@/features/analitica/components/ParesConfundidos';
import { CurvaAprendizaje } from '@/features/analitica/components/CurvaAprendizaje';
import type {
  EjercicioConAnalisisCNN,
  ResumenIntentoCNN,
} from '@/features/analitica/types/analitica.types';

const TIPO_LABEL: Record<string, string> = {
  entonacion: 'Entonación',
  ritmo: 'Ritmo',
  dictado: 'Dictado',
  lectura_vista: 'Lectura a Vista',
  identificacion: 'Identificación',
};

function scoreColor(score: number) {
  if (score >= 80) return 'bg-green-500/15 text-green-300';
  if (score >= 60) return 'bg-yellow-500/15 text-yellow-300';
  return 'bg-red-500/15 text-red-300';
}

export function AnaliticaEstudiantePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const ejerciciosQuery = useQuery({
    queryKey: ['analitica', 'estudiante', id, 'ejercicios'],
    queryFn: () => analiticaService.getEjerciciosEstudiante(id!),
    enabled: !!id,
  });
  const matrizQuery = useQuery({
    queryKey: ['analitica', 'estudiante', id, 'matriz'],
    queryFn: () => analiticaService.getMatrizConfusion(id!),
    enabled: !!id,
  });
  const metricasQuery = useQuery({
    queryKey: ['analitica', 'estudiante', id, 'metricas'],
    queryFn: () => analiticaService.getMetricas(id!),
    enabled: !!id,
  });
  const curvaQuery = useQuery({
    queryKey: ['analitica', 'estudiante', id, 'curva'],
    queryFn: () => analiticaService.getCurvaAprendizaje(id!),
    enabled: !!id,
  });

  return (
    <Layout>
      <div className="space-y-5">
        <button
          onClick={() => navigate('/analitica')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a analítica
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5a3d] to-[#5ba373] text-white flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reporte CNN del estudiante</h1>
            <p className="text-sm text-muted-foreground">
              Análisis agregado de todos los intentos y detalle por ejercicio.
            </p>
          </div>
        </div>

        {metricasQuery.data && <MetricasGlobalesCNN metricas={metricasQuery.data} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {matrizQuery.data && <MatrizConfusion data={matrizQuery.data} />}
          {metricasQuery.data && <ParesConfundidos pares={metricasQuery.data.pares_mas_confundidos} />}
        </div>

        {curvaQuery.data && <CurvaAprendizaje data={curvaQuery.data} />}

        {/* Ejercicios */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Ejercicios e intentos analizados</h3>
            <span className="text-xs text-muted-foreground">
              {ejerciciosQuery.data?.total_ejercicios ?? 0} ejercicios
            </span>
          </div>

          {ejerciciosQuery.isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary/40 border border-border rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {ejerciciosQuery.data && ejerciciosQuery.data.ejercicios.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Este estudiante aún no ha registrado ningún intento.
            </p>
          )}

          {ejerciciosQuery.data?.ejercicios.map(ej => (
            <EjercicioCardCNN key={ej.ejercicio_id} ejercicio={ej} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function EjercicioCardCNN({ ejercicio }: { ejercicio: EjercicioConAnalisisCNN }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground">{ejercicio.titulo}</span>
            <span className="text-xs bg-[#2d5a3d]/15 text-[#2d5a3d] px-2 py-0.5 rounded">
              {TIPO_LABEL[ejercicio.tipo] ?? ejercicio.tipo}
            </span>
            <span className="text-xs text-muted-foreground">
              {ejercicio.compas} · {ejercicio.bpm_referencia} BPM
            </span>
          </div>
          {ejercicio.notas_esperadas.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Notas: {ejercicio.notas_esperadas.join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="text-center">
            <p className="font-bold text-foreground">{ejercicio.total_intentos}</p>
            <p className="text-muted-foreground">intentos</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-border bg-secondary/10 pt-3">
          {ejercicio.intentos
            .sort((a, b) => b.numero_intento - a.numero_intento)
            .map(intento => (
              <IntentoRowCNN
                key={intento.resultado_id}
                intento={intento}
                onVerDetalle={() => navigate(`/analitica/resultado/${intento.resultado_id}`)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function IntentoRowCNN({
  intento,
  onVerDetalle,
}: {
  intento: ResumenIntentoCNN;
  onVerDetalle: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-mono text-muted-foreground w-14 shrink-0">
          #{intento.numero_intento}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {new Date(intento.fecha_intento).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${scoreColor(intento.puntuacion)}`}>
          {intento.puntuacion.toFixed(1)} pts
        </span>
        <span className="text-xs text-muted-foreground shrink-0 font-mono">
          {(intento.cnn_top1_accuracy * 100).toFixed(0)}% top-1
        </span>
        <span className="text-xs text-muted-foreground shrink-0 font-mono">
          {(intento.cnn_top5_accuracy * 100).toFixed(0)}% top-5
        </span>
        <span className="text-xs text-muted-foreground shrink-0 font-mono">
          loss <strong className="text-foreground">{intento.cnn_loss_promedio.toFixed(3)}</strong>
        </span>
        <span className="text-xs text-muted-foreground shrink-0 font-mono">
          ECE <strong className="text-foreground">{intento.cnn_ece.toFixed(3)}</strong>
        </span>
        <span className="text-xs text-muted-foreground shrink-0 font-mono">
          {intento.cnn_tiempo_inferencia_ms.toFixed(1)} ms
        </span>
        <button
          onClick={onVerDetalle}
          className="ml-auto text-xs px-3 py-1 rounded-md bg-[#2d5a3d] text-white hover:bg-[#3a6e4d]"
        >
          Ver análisis CNN →
        </button>
      </div>
    </div>
  );
}
