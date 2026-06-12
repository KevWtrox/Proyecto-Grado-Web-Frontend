import type { CurvaAprendizajeResponse } from '@/features/analitica/types/analitica.types';

interface Props {
  data: CurvaAprendizajeResponse;
}

export function CurvaAprendizaje({ data }: Props) {
  const puntos = data.puntos;

  if (puntos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">Curva de aprendizaje</h3>
        <p className="text-xs text-muted-foreground italic">Sin intentos registrados.</p>
      </div>
    );
  }

  const W = 720;
  const H = 220;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 40;

  const xs = puntos.map((_, i) => padL + (i * (W - padL - padR)) / Math.max(1, puntos.length - 1));
  const losses = puntos.map(p => p.loss);
  const accs = puntos.map(p => p.accuracy);
  const maxLoss = Math.max(...losses, 1);
  const minLoss = Math.min(...losses, 0);

  const yLoss = (v: number) => padT + (1 - (v - minLoss) / Math.max(0.0001, maxLoss - minLoss)) * (H - padT - padB);
  const yAcc = (v: number) => padT + (1 - v) * (H - padT - padB);

  const pathLoss = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yLoss(losses[i]).toFixed(1)}`).join(' ');
  const pathAcc = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yAcc(accs[i]).toFixed(1)}`).join(' ');

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold text-foreground">Curva de aprendizaje</h3>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-400 rounded" /> Cross-entropy loss
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#2d5a3d] rounded" /> Top-1 accuracy
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Cada punto representa un intento ordenado cronológicamente. La caída del loss y el
        aumento del accuracy reflejan el progreso del estudiante visto por la CNN.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-secondary/20 rounded-lg border border-border">
        {/* Ejes */}
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="currentColor" strokeOpacity={0.3} />

        {/* Etiquetas Y loss */}
        <text x={5} y={padT + 5} fontSize="10" fill="currentColor" opacity={0.6}>{maxLoss.toFixed(2)}</text>
        <text x={5} y={H - padB} fontSize="10" fill="currentColor" opacity={0.6}>{minLoss.toFixed(2)}</text>
        <text x={5} y={padT - 4} fontSize="9" fill="currentColor" opacity={0.6}>loss</text>

        {/* Etiquetas X */}
        {puntos.map((p, i) => i % Math.ceil(puntos.length / 8) === 0 ? (
          <text key={i} x={xs[i]} y={H - padB + 16} fontSize="9" fill="currentColor" opacity={0.6} textAnchor="middle">
            #{p.numero_intento}
          </text>
        ) : null)}

        {/* Path loss */}
        <path d={pathLoss} stroke="#ef4444" strokeWidth={2} fill="none" />
        {xs.map((x, i) => (
          <circle key={`l-${i}`} cx={x} cy={yLoss(losses[i])} r={3} fill="#ef4444">
            <title>{`Intento #${puntos[i].numero_intento}: loss=${losses[i].toFixed(3)}`}</title>
          </circle>
        ))}

        {/* Path acc */}
        <path d={pathAcc} stroke="#2d5a3d" strokeWidth={2} fill="none" />
        {xs.map((x, i) => (
          <circle key={`a-${i}`} cx={x} cy={yAcc(accs[i])} r={3} fill="#2d5a3d">
            <title>{`Intento #${puntos[i].numero_intento}: acc=${(accs[i] * 100).toFixed(1)}%`}</title>
          </circle>
        ))}

        {/* Eje derecho para accuracy */}
        <text x={W - padR + 6} y={padT + 5} fontSize="10" fill="currentColor" opacity={0.6}>1.0</text>
        <text x={W - padR + 6} y={H - padB} fontSize="10" fill="currentColor" opacity={0.6}>0.0</text>
        <text x={W - padR + 6} y={padT - 4} fontSize="9" fill="currentColor" opacity={0.6}>acc</text>
      </svg>
    </div>
  );
}
