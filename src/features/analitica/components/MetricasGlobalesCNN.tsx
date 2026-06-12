import type { MetricasEstudianteCNN } from '@/features/analitica/types/analitica.types';
import { EcuacionBlock, EcuacionInline } from './EcuacionLatex';

interface Props {
  metricas: MetricasEstudianteCNN;
}

export function MetricasGlobalesCNN({ metricas }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">Métricas globales del estudiante</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Top-1 Accuracy"
          value={`${(metricas.top1_accuracy * 100).toFixed(2)}%`}
          desc="Predicción correcta de la pitch class objetivo."
        />
        <Metric
          label="Top-5 Accuracy"
          value={`${(metricas.top5_accuracy * 100).toFixed(2)}%`}
          desc="Objetivo dentro de las 5 más probables."
        />
        <Metric
          label="F1 macro"
          value={metricas.f1_macro.toFixed(4)}
          desc="Promedio simple del F1 de cada clase."
        />
        <Metric
          label="F1 weighted"
          value={metricas.f1_weighted.toFixed(4)}
          desc="Pondera el F1 por soporte de clase."
        />
        <Metric
          label="ECE"
          value={metricas.ece_promedio.toFixed(4)}
          desc="Expected Calibration Error (15 bins)."
        />
        <Metric
          label="Cross-Entropy media"
          value={metricas.cross_entropy_promedio.toFixed(4)}
          desc="Pérdida promedio por nota."
        />
        <Metric
          label="Muestras"
          value={metricas.total_muestras.toString()}
          desc="Total de notas analizadas."
        />
        <Metric
          label="Clases activas"
          value={Object.values(metricas.f1_por_clase).filter(v => v > 0).length.toString()}
          desc="Pitch classes que aparecen en al menos un intento."
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Cómo se leen estas métricas</h4>
        <p className="text-xs text-muted-foreground">
          Para cada nota la red puede acertar (<EcuacionInline expr="TP" />), confundirla por otra
          (<EcuacionInline expr="FP" /> para la predicha, <EcuacionInline expr="FN" /> para la objetivo).
          De ahí salen <strong className="text-foreground">precision</strong> (de las veces que predijo X,
          ¿cuántas eran X?) y <strong className="text-foreground">recall</strong> (de los X reales, ¿cuántos
          detectó?). El F1 combina ambos en un solo número entre 0 y 1:
        </p>
        <EcuacionBlock
          expr={String.raw`F_1 = \dfrac{2 \cdot \text{precision} \cdot \text{recall}}{\text{precision} + \text{recall}}`}
          caption="F1 cercano a 1 = la red predice esa nota correctamente la mayoría de las veces."
        />
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">ECE</strong> es una medida de "honestidad": si la red dice
          estar 90% segura, ¿realmente acierta el 90% de las veces? ECE = 0 sería un sistema perfectamente
          calibrado. Valores típicos &lt; 0.1 se consideran buenos.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Precision / Recall / F1 por clase</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 font-mono">Clase</th>
                <th className="text-right py-1.5 font-mono">Precision</th>
                <th className="text-right py-1.5 font-mono">Recall</th>
                <th className="text-right py-1.5 font-mono">F1</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(metricas.f1_por_clase).map(cls => (
                <tr key={cls} className="border-b border-border/60 last:border-0">
                  <td className="py-1 font-mono">{cls}</td>
                  <td className="text-right py-1 font-mono">
                    {metricas.precision_por_clase[cls].toFixed(4)}
                  </td>
                  <td className="text-right py-1 font-mono">
                    {metricas.recall_por_clase[cls].toFixed(4)}
                  </td>
                  <td className="text-right py-1 font-mono">{metricas.f1_por_clase[cls].toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-[#2d5a3d]/10 to-secondary/30 border border-border p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground font-mono mt-0.5">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{desc}</p>
    </div>
  );
}
