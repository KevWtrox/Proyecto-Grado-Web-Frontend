import type { MatrizConfusionResponse } from '@/features/analitica/types/analitica.types';

interface Props {
  data: MatrizConfusionResponse;
}

function heatColor(value: number, max: number) {
  if (max === 0 || value === 0) return 'rgb(20, 25, 22)';
  const t = Math.min(1, value / max);
  // Verde oscuro → verde brillante (paleta del tema)
  const r = Math.round(20 + t * 100);
  const g = Math.round(60 + t * 140);
  const b = Math.round(30 + t * 60);
  return `rgb(${r}, ${g}, ${b})`;
}

export function MatrizConfusion({ data }: Props) {
  const max = Math.max(1, ...data.matrix.flat());
  const total = data.total_muestras;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Matriz de confusión (12 pitch classes)</h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span><strong className="text-foreground">{total}</strong> muestras</span>
          <span><strong className="text-foreground">{(data.accuracy_global * 100).toFixed(2)}%</strong> acc</span>
          <span><strong className="text-foreground">{data.celdas_no_cero}</strong> celdas activas</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Filas = pitch class real (objetivo). Columnas = predicha por la CNN. La diagonal son aciertos.
        Las celdas se colorean por intensidad relativa al máximo de la matriz.
      </p>

      <div className="overflow-x-auto">
        <table className="border-collapse text-center">
          <thead>
            <tr>
              <th className="w-12 text-xs text-muted-foreground"></th>
              {data.labels.map(lbl => (
                <th key={lbl} className="w-10 text-[10px] font-mono text-muted-foreground p-1">
                  {lbl}
                </th>
              ))}
              <th className="w-12 text-[10px] text-muted-foreground p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, r) => {
              const rowSum = row.reduce((a, b) => a + b, 0);
              const diagVal = row[r];
              const rowRecall = rowSum > 0 ? diagVal / rowSum : 0;
              return (
                <tr key={r}>
                  <th className="text-[10px] font-mono text-muted-foreground p-1 text-right pr-2">
                    {data.labels[r]}
                  </th>
                  {row.map((val, c) => {
                    const isDiagonal = r === c;
                    return (
                      <td
                        key={c}
                        title={`Real ${data.labels[r]} → Predicha ${data.labels[c]}: ${val} ocurrencias`}
                        style={{ backgroundColor: heatColor(val, max) }}
                        className={`w-10 h-10 text-[11px] font-mono ${
                          val > max * 0.5 || isDiagonal ? 'text-white' : 'text-zinc-300'
                        } ${isDiagonal ? 'ring-1 ring-[#2d5a3d]' : ''}`}
                      >
                        {val || ''}
                      </td>
                    );
                  })}
                  <td className="text-[10px] font-mono text-muted-foreground p-1">
                    {rowSum > 0 ? `${(rowRecall * 100).toFixed(0)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Escala:</span>
        <div className="flex">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(t => (
            <div
              key={t}
              style={{ backgroundColor: heatColor(t * max, max) }}
              className="w-7 h-4 border border-border"
            />
          ))}
        </div>
        <span className="text-[10px]">0 → {max}</span>
      </div>
    </div>
  );
}
