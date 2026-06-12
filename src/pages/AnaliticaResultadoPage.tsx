import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Cpu } from 'lucide-react';

import { MainLayout as Layout } from '@/layouts/MainLayout';
import { analiticaService } from '@/features/analitica/services/analitica.service';
import { PreprocesamientoPipeline } from '@/features/analitica/components/PreprocesamientoPipeline';
import { FeaturesEspectrales } from '@/features/analitica/components/FeaturesEspectrales';
import { EspectrogramaConGradCam } from '@/features/analitica/components/EspectrogramaConGradCam';
import { ArquitecturaLayers } from '@/features/analitica/components/ArquitecturaLayers';
import { InferenciaCNNDetalle } from '@/features/analitica/components/InferenciaCNNDetalle';
import { EcuacionBlock } from '@/features/analitica/components/EcuacionLatex';

const PITCH_CLASSES_LATIN = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

export function AnaliticaResultadoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['analitica', 'resultado', id],
    queryFn: () => analiticaService.getAnalisisResultado(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary/40 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="text-center py-16 text-muted-foreground">
          No se pudo cargar el análisis CNN.
          {error && <p className="text-xs mt-2">{String((error as Error).message)}</p>}
        </div>
      </Layout>
    );
  }

  const r = data.cnn_report;

  return (
    <Layout>
      <div className="space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al estudiante
        </button>

        {/* Header del intento */}
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5a3d] to-[#5ba373] text-white flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{data.titulo_ejercicio}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Intento #{data.numero_intento} ·{' '}
                {new Date(data.fecha_intento).toLocaleString('es-ES')} ·{' '}
                {data.compas} · {data.bpm_referencia} BPM · {data.tipo_ejercicio}
              </p>
              {data.notas_esperadas.length > 0 && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Notas esperadas: {data.notas_esperadas.join(' · ')}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center shrink-0">
              <KPI label="Puntuación" value={`${data.puntuacion.toFixed(1)}`} />
              <KPI label="Precisión" value={`${data.precision_porcentaje.toFixed(0)}%`} />
              <KPI label="Aprobado" value={data.aprobado ? 'Sí' : 'No'} />
            </div>
          </div>

          {/* Agregados CNN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            <KPI label="CNN Top-1 acc" value={`${(r.aggregate_top1_accuracy * 100).toFixed(2)}%`} />
            <KPI label="CNN Top-5 acc" value={`${(r.aggregate_top5_accuracy * 100).toFixed(2)}%`} />
            <KPI label="Cross-entropy media" value={r.aggregate_cross_entropy.toFixed(4)} />
            <KPI label="Confianza media" value={`${(r.aggregate_confidence_mean * 100).toFixed(1)}%`} />
          </div>

          <EcuacionBlock
            expr={String.raw`\text{error promedio} = \dfrac{\text{suma de errores de cada nota}}{N\text{ notas}} = ${r.aggregate_cross_entropy.toFixed(4)}`}
            caption={`Cuanto menor es este número, más segura estaba la CNN de cada nota correcta a lo largo de las ${r.notes.length} notas del intento.`}
          />
        </div>

        {/* Espectrograma + Grad-CAM */}
        <EspectrogramaConGradCam
          audioUrl={data.audio_url}
          spectrogramUrl={r.spectrogram_image_url}
          gradCam={r.grad_cam}
          notes={r.notes}
          bpmReferencia={data.bpm_referencia}
        />

        {/* Features espectrales */}
        <FeaturesEspectrales features={r.spectral_features} />

        {/* Arquitectura */}
        <ArquitecturaLayers layers={r.layer_activations} forward={r.forward_pass} />

        {/* Inferencia nota a nota */}
        <InferenciaCNNDetalle notes={r.notes} pitchClassLabels={PITCH_CLASSES_LATIN} />

        {/* Pipeline (referencia técnica) */}
        <PreprocesamientoPipeline params={r.preprocessing_params} />
      </div>
    </Layout>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground font-mono">{value}</p>
    </div>
  );
}
