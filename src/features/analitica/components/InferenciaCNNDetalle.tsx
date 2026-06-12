import { useState } from 'react';
import type { NoteAnalysis } from '@/features/analitica/types/analitica.types';
import { EcuacionBlock, EcuacionInline } from './EcuacionLatex';

interface Props {
  notes: NoteAnalysis[];
  pitchClassLabels: string[];
}

export function InferenciaCNNDetalle({ notes, pitchClassLabels }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">Inferencia CNN nota a nota</h3>
        <p className="text-xs text-muted-foreground italic">El ejercicio no tiene notas analizables.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <h3 className="text-base font-semibold text-foreground">Inferencia CNN nota a nota</h3>
      <p className="text-xs text-muted-foreground">
        Cada nota se procesa como una sub-imagen independiente. La red entrega un puntaje{' '}
        <EcuacionInline expr="z_c" /> por cada una de las 12 notas posibles (Do, Do#, Re, ..., Si).
        Para convertir esos puntajes en probabilidades que sumen 1 usamos softmax:
      </p>

      <EcuacionBlock
        expr={String.raw`P_c = \dfrac{e^{z_c}}{e^{z_1} + e^{z_2} + \cdots + e^{z_{12}}}`}
        caption="La nota con mayor P_c es la predicción de la red. Intuición: el puntaje más alto recibe la mayor probabilidad."
      />

      <p className="text-xs text-muted-foreground">
        Cuanto más segura está la red de la respuesta correcta, más pequeño es el error. El error de un
        intento se mide como:
      </p>

      <EcuacionBlock
        expr={String.raw`\text{error} = -\log(P_{\text{correcta}})`}
        caption="Si la red asigna 100% a la nota correcta, error = 0. Si asigna 1%, error ≈ 4.6 — castigo fuerte por estar muy equivocada."
      />

      <p className="text-xs text-muted-foreground">
        Y para medir qué tan afinada está la voz comparamos la frecuencia detectada vs. la esperada:
      </p>

      <EcuacionBlock
        expr={String.raw`\text{cents} = 1200 \cdot \log_2\!\left( \dfrac{f_{\text{detectada}}}{f_{\text{esperada}}} \right)`}
        caption="0 cents = afinación perfecta. ±100 cents = error de un semitono. El Conservatorio tolera ±50 cents."
      />

      <div className="space-y-2">
        {notes.map((n, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors text-left"
            >
              <span className="text-xs font-mono text-muted-foreground w-8">#{n.position_index + 1}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2d5a3d]/15 text-foreground">
                {n.nota_objetivo}
              </span>
              <span className="text-muted-foreground text-xs">→</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                n.correcta ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'
              }`}>
                {n.nota_predicha}
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
                confianza{' '}
                <strong className="text-foreground font-mono">{(n.confianza * 100).toFixed(1)}%</strong>
              </span>
              <span className="text-xs text-muted-foreground ml-auto font-mono">
                {n.cents_deviation > 0 ? '+' : ''}{n.cents_deviation.toFixed(0)} cents
              </span>
              <span className="text-muted-foreground text-xs">{openIdx === i ? '▲' : '▼'}</span>
            </button>

            {openIdx === i && (
              <div className="px-4 py-3 bg-secondary/20 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Stat label="Frec. esperada" value={`${n.freq_esperada_hz.toFixed(2)} Hz`} />
                  <Stat label="Frec. detectada" value={`${n.freq_detectada_hz.toFixed(2)} Hz`} />
                  <Stat label="Onset" value={`${n.onset_ms.toFixed(0)} ms`} />
                  <Stat label="Duración" value={`${n.duracion_ms.toFixed(0)} ms`} />
                  <Stat label="Confianza" value={`${(n.confianza * 100).toFixed(2)}%`} />
                  <Stat label="Entropía" value={`${n.entropia.toFixed(3)} nats`} />
                  <Stat label="CE loss" value={n.cross_entropy_loss.toFixed(4)} />
                  <Stat label="Pitch class" value={`${n.pitch_class_objetivo} → ${n.pitch_class_predicha}`} />
                </div>

                {/* Logits / softmax bar chart */}
                <div>
                  <h5 className="text-xs font-semibold text-foreground mb-1">
                    Distribución softmax sobre 12 pitch classes
                  </h5>
                  <div className="grid grid-cols-12 gap-0.5">
                    {n.softmax_12.map((p, idx) => {
                      const isTarget = idx === n.pitch_class_objetivo_idx;
                      const isPred = idx === n.pitch_class_predicha_idx;
                      const h = Math.max(4, p * 100);
                      const color = isTarget
                        ? 'bg-[#2d5a3d]'
                        : isPred
                          ? 'bg-red-400'
                          : 'bg-zinc-600';
                      return (
                        <div key={idx} className="flex flex-col items-center" title={`${pitchClassLabels[idx]}: ${(p * 100).toFixed(2)}%`}>
                          <div className="w-full h-20 flex items-end">
                            <div className={`w-full ${color} rounded-t`} style={{ height: `${h}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                            {pitchClassLabels[idx]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#2d5a3d]" /> objetivo</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400" /> predicha</span>
                  </div>
                </div>

                {/* Top-5 */}
                <div>
                  <h5 className="text-xs font-semibold text-foreground mb-1">Top-5 predicciones</h5>
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1">Rank</th>
                        <th className="text-left py-1">Pitch class</th>
                        <th className="text-right py-1">Logit</th>
                        <th className="text-right py-1">Probabilidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {n.top5.map((t, r) => (
                        <tr key={r} className="border-b border-border/60 last:border-0">
                          <td className="py-1 font-mono">#{r + 1}</td>
                          <td className="py-1 font-mono">{t.pitch_class}</td>
                          <td className="py-1 text-right font-mono">{t.logit.toFixed(4)}</td>
                          <td className="py-1 text-right font-mono">{(t.probability * 100).toFixed(3)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Logits raw */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Ver logits sin normalizar
                  </summary>
                  <div className="mt-2 grid grid-cols-6 gap-1 font-mono">
                    {n.logits_12.map((z, idx) => (
                      <span key={idx} className="bg-secondary/40 rounded px-1.5 py-0.5">
                        {pitchClassLabels[idx]}: {z.toFixed(3)}
                      </span>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-card border border-border px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground font-mono">{value}</p>
    </div>
  );
}
