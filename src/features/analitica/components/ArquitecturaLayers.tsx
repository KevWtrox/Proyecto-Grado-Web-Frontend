import type { LayerActivation, ForwardPassReport } from '@/features/analitica/types/analitica.types';

interface Props {
  layers: LayerActivation[];
  forward: ForwardPassReport;
}

const fmt = (n: number) => n.toLocaleString('es-ES');

export function ArquitecturaLayers({ layers, forward }: Props) {
  const maxNorm = Math.max(1, ...layers.map(l => l.activation_norm_l2));
  const totalParams = layers.reduce((a, l) => a + l.params, 0);
  const totalFlops = layers.reduce((a, l) => a + l.flops_m, 0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Forward pass — stage por stage</h3>
          <p className="text-xs text-muted-foreground">
            Activaciones del backbone para este intento. La barra muestra la norma L2 normalizada al máximo del intento.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap text-xs">
          <Pill label="Tiempo" value={`${forward.inference_time_ms.toFixed(2)} ms`} />
          <Pill label="GPU" value={`${forward.gpu_memory_mb.toFixed(1)} MB`} />
          <Pill label="CPU" value={`${forward.cpu_memory_mb.toFixed(1)} MB`} />
          <Pill label="FLOPs" value={`${forward.total_flops_g} G`} />
          <Pill label="Device" value={forward.device} />
          <Pill label="Precision" value={forward.precision} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5">Stage</th>
              <th className="text-left py-1.5">Bloque</th>
              <th className="text-left py-1.5">Tipo</th>
              <th className="text-right py-1.5">Input</th>
              <th className="text-right py-1.5">Output</th>
              <th className="text-right py-1.5">Expansion</th>
              <th className="text-right py-1.5">Kernel</th>
              <th className="text-right py-1.5">Stride</th>
              <th className="text-right py-1.5">SE</th>
              <th className="text-right py-1.5">Params</th>
              <th className="text-right py-1.5">MFLOPs</th>
              <th className="text-left py-1.5 w-32">‖a‖₂</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((l, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                <td className="py-1 font-mono">{l.stage}</td>
                <td className="py-1 font-mono text-[11px]">{l.name}</td>
                <td className="py-1 font-mono">{l.block_type}</td>
                <td className="py-1 text-right font-mono text-[11px]">{l.input_shape.join('×')}</td>
                <td className="py-1 text-right font-mono text-[11px]">{l.output_shape.join('×')}</td>
                <td className="py-1 text-right font-mono">{l.expansion_ratio}</td>
                <td className="py-1 text-right font-mono">{l.kernel_size}×{l.kernel_size}</td>
                <td className="py-1 text-right font-mono">{l.stride}</td>
                <td className="py-1 text-right font-mono">{l.se_ratio || '—'}</td>
                <td className="py-1 text-right font-mono">{fmt(l.params)}</td>
                <td className="py-1 text-right font-mono">{l.flops_m.toFixed(1)}</td>
                <td className="py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-secondary rounded overflow-hidden">
                      <div
                        className="h-full bg-[#2d5a3d]"
                        style={{ width: `${(l.activation_norm_l2 / maxNorm) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {l.activation_norm_l2.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border font-semibold">
              <td colSpan={9} className="py-1.5 text-right text-muted-foreground">
                Totales backbone
              </td>
              <td className="py-1.5 text-right font-mono">{fmt(totalParams)}</td>
              <td className="py-1.5 text-right font-mono">{totalFlops.toFixed(1)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Tras el backbone: <code className="bg-secondary px-1 rounded">GAP → Dense(256) → Dense(128) → Dense(14)</code>.
        Vector de features (pooling) = <strong className="text-foreground font-mono">{forward.feature_vector_dim}</strong> dimensiones.
      </p>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-2 py-1 rounded-md bg-secondary/50 border border-border text-[11px] font-mono">
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="text-foreground">{value}</span>
    </span>
  );
}
