import type { ParConfundido } from '@/features/analitica/types/analitica.types';

interface Props {
  pares: ParConfundido[];
}

export function ParesConfundidos({ pares }: Props) {
  if (pares.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">Pares más confundidos</h3>
        <p className="text-xs text-muted-foreground italic">
          Sin confusiones registradas — todas las predicciones aciertan la pitch class.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
      <h3 className="text-base font-semibold text-foreground">Pares más confundidos</h3>
      <p className="text-xs text-muted-foreground">
        Predicciones erróneas más frecuentes. La distancia en semitonos ayuda a interpretar:
        confusiones de 1 semitono típicamente vienen de bemoles/sostenidos; de 2 semitonos
        suelen ser saltos diatónicos vecinos.
      </p>

      <div className="space-y-2">
        {pares.map((p, i) => (
          <div
            key={`${p.pc_real}-${p.pc_predicha}-${i}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30"
          >
            <span className="text-xs text-muted-foreground font-mono w-6">#{i + 1}</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#2d5a3d]/20 text-[#2d5a3d] font-mono text-sm">
                {p.pc_real}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 font-mono text-sm">
                {p.pc_predicha}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">
                Δ <span className="font-mono text-foreground">{p.distancia_semitonos}</span> semitonos
              </span>
              <span className="px-2 py-0.5 rounded bg-card border border-border font-mono text-foreground">
                {p.ocurrencias} ocurrencias
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
