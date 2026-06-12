import { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import type { NSynthDatasetInfo } from '@/features/analitica/types/analitica.types';

interface Props {
  info: NSynthDatasetInfo;
  defaultOpen?: boolean;
}

const fmt = (n: number) => n.toLocaleString('es-ES');

export function NSynthDatasetCard({ info, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2d5a3d]/10 text-[#2d5a3d] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{info.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {info.publisher} · {fmt(info.total_notes)} notas · {info.unique_instruments} instrumentos
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground italic">{info.paper}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Notas totales" value={fmt(info.total_notes)} />
            <Stat label="Instrumentos" value={info.unique_instruments.toString()} />
            <Stat label="Pitch classes MIDI" value={info.pitch_classes_midi.toString()} />
            <Stat label="Sample rate" value={`${(info.sample_rate_hz / 1000).toFixed(1)} kHz`} />
            <Stat label="Duración por nota" value={`${info.note_duration_s} s`} />
            <Stat label="Train split" value={fmt(info.train_split)} />
            <Stat label="Valid split" value={fmt(info.valid_split)} />
            <Stat label="Test split" value={fmt(info.test_split)} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Familias de instrumentos</h3>
            <div className="flex flex-wrap gap-1.5">
              {info.instrument_families.map(f => (
                <span key={f} className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="border-l-2 border-[#2d5a3d]/60 pl-3 space-y-1">
            <p className="text-sm text-foreground">
              <strong>Subset filtrado:</strong> {fmt(info.filtered_for_solfeo)} notas
            </p>
            <p className="text-xs text-muted-foreground">
              Rango de pitch usado para el fine-tune: <code className="bg-secondary px-1 rounded">{info.pitch_range_used}</code>
            </p>
            <p className="text-xs text-muted-foreground italic">
              El subset se selecciona por compatibilidad con las 14 clases del Conservatorio (Do3–Si4).
              Las notas se re-muestrean a 22050 Hz y se procesan con el mismo pipeline que el audio de los estudiantes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
    </div>
  );
}
